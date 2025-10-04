import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Check, ShoppingBag, ChevronDown, X } from 'lucide-react';
import { CSVService } from '../services/csvService';

// Helper function to determine if image is a URL or local path
const getImageSrc = (imagePath: string): string => {
  // Check if it's a URL (starts with http:// or https://)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Check if it's a data URL (starts with data:)
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }
  // Otherwise, treat as local path
  return imagePath;
};

export interface Product {
  id: string;
  name: string;
  image: string;
  category: string;
  price?: string;
  description?: string;
}

interface ProductSelectorProps {
  onProductSelect: (product: Product) => void;
  onProductRemove: (productId: string) => void;
  selectedProducts: Product[];
  maxProducts?: number;
}

// Products will be loaded from CSV file

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  onProductSelect,
  onProductRemove,
  selectedProducts,
  maxProducts = 5,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load products from CSV on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const loadedProducts = await CSVService.loadProducts();
        setProducts(loadedProducts);
      } catch (err) {
        console.error('Failed to load products:', err);
        setError('Failed to load products from Google Sheets. Please check your Google Sheets configuration.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleProductClick = useCallback((product: Product) => {
    const isSelected = selectedProducts.some(p => p.id === product.id);

    if (isSelected) {
      onProductRemove(product.id);
    } else {
      // Always select the clicked product. If a product is already selected and maxProducts is 1,
      // the parent will replace the current selection.
      onProductSelect(product);
    }
    // Collapse the dropdown after a selection action
    setIsOpen(false);
  }, [onProductSelect, onProductRemove, selectedProducts]);

  const isProductSelected = (productId: string) => {
    return selectedProducts.some(p => p.id === productId);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Dropdown Trigger */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        >
          <div className="flex items-center space-x-3">
            <ShoppingBag className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {selectedProducts.length > 0 
                ? `${selectedProducts.length} product${selectedProducts.length > 1 ? 's' : ''} selected`
                : 'Select product...'
              }
            </span>
          </div>
          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Content */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 flex flex-col">
            {/* Search and Filter */}
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product Grid */}
            <div className="px-4 pt-4 pb-6 flex-1 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading products...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-sm text-red-500">{error}</p>
                  <p className="text-xs text-gray-400 mt-1">Please set REACT_APP_GOOGLE_SHEETS_URL and ensure your Google Sheet is published to web</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {filteredProducts.map((product) => {
                      const isSelected = isProductSelected(product.id);
                      
                      return (
                        <div
                          key={product.id}
                          onClick={() => handleProductClick(product)}
                          className={`relative rounded-lg border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                          }`}
                        >
                          {/* Product Image */}
                          <div className="aspect-square rounded-t-lg overflow-hidden bg-gray-100">
                            <img
                              src={getImageSrc(product.image)}
                              alt={product.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                // Fallback for missing images
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                              }}
                            />
                          </div>

                          {/* Product Info */}
                          <div className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 text-xs truncate">{product.name}</h3>
                                <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                                {product.price && (
                                  <p className="text-xs font-semibold text-gray-900 mt-1">{product.price}</p>
                                )}
                              </div>
                              
                              {/* Selection Indicator */}
                              {isSelected && (
                                <div className="flex-shrink-0 ml-2">
                                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                    <Check className="h-3 w-3 text-white" />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Selection Status */}
                          {/* With single-select replace behavior, we never hard-disable cards */}
                        </div>
                      );
                    })}
                  </div>

                  {/* No Products Message */}
                  {filteredProducts.length === 0 && !loading && !error && (
                    <div className="text-center py-8">
                      <ShoppingBag className="mx-auto h-8 w-8 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">No products found</p>
                      <p className="text-xs text-gray-400">Try adjusting your search or filter</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected Products Display */}
      {selectedProducts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">Product selected</h4>
            <button
              onClick={() => selectedProducts.forEach(p => onProductRemove(p.id))}
              className="text-xs text-red-600 hover:text-red-800"
            >
              Clear all
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedProducts.map((product) => (
              <div key={product.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={getImageSrc(product.image)}
                    alt={product.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                    }}
                  />
                </div>
                
                {/* Remove Button */}
                <button
                  onClick={() => onProductRemove(product.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Product Name */}
                <div className="mt-2">
                  <p className="text-sm text-gray-600 truncate">{product.name}</p>
                  {product.price && (
                    <p className="text-sm font-semibold text-gray-900">{product.price}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
