import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Check, ShoppingBag, ChevronDown, X } from 'lucide-react';
import { CSVService } from '../services/csvService';
import { Product } from '../types';

// Helper function to determine if image is a URL or local path
const getImageSrc = (imagePath: string): string => {
  // Check if it's a URL (starts with http:// or https://)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    // Use proxy for external URLs to handle CORS
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://mirrify-backend-907099703781.us-central1.run.app';
    return `${API_BASE_URL}/api/proxy-image?url=${encodeURIComponent(imagePath)}`;
  }
  // Check if it's a data URL (starts with data:)
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }
  // Otherwise, treat as local path
  return imagePath;
};

interface DualProductSelectorProps {
  onUpperProductSelect: (product: Product | null) => void;
  onLowerProductSelect: (product: Product | null) => void;
  selectedUpperProduct: Product | null;
  selectedLowerProduct: Product | null;
}

export const DualProductSelector: React.FC<DualProductSelectorProps> = ({
  onUpperProductSelect,
  onLowerProductSelect,
  selectedUpperProduct,
  selectedLowerProduct,
}) => {
  const [upperDropdownOpen, setUpperDropdownOpen] = useState(false);
  const [lowerDropdownOpen, setLowerDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [upperProducts, setUpperProducts] = useState<Product[]>([]);
  const [lowerProducts, setLowerProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const upperDropdownRef = useRef<HTMLDivElement>(null);
  const lowerDropdownRef = useRef<HTMLDivElement>(null);

  // Load products from two different Google Sheets
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get URLs from environment variables
        const upperSheetUrl = process.env.REACT_APP_UPPER_GARMENT_SHEET_URL;
        const lowerSheetUrl = process.env.REACT_APP_LOWER_GARMENT_SHEET_URL;

        if (!upperSheetUrl || !lowerSheetUrl) {
          throw new Error('Google Sheets URLs not configured');
        }

        // Load both sheets in parallel
        const [upperProductsData, lowerProductsData] = await Promise.all([
          CSVService.loadProductsFromSheetUrl(upperSheetUrl),
          CSVService.loadProductsFromSheetUrl(lowerSheetUrl),
        ]);

        setUpperProducts(upperProductsData);
        setLowerProducts(lowerProductsData);
      } catch (err) {
        console.error('Failed to load products:', err);
        setError('Failed to load products from Google Sheets. Please check your configuration.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const categories = ['All', ...Array.from(new Set([...upperProducts, ...lowerProducts].map(p => p.category)))];

  // Filter products based on search and category
  const filterProducts = (products: Product[]) => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  };

  const filteredUpperProducts = filterProducts(upperProducts);
  const filteredLowerProducts = filterProducts(lowerProducts);

  const handleUpperProductClick = useCallback((product: Product) => {
    const isSelected = selectedUpperProduct?.id === product.id;
    onUpperProductSelect(isSelected ? null : product);
    setUpperDropdownOpen(false);
  }, [onUpperProductSelect, selectedUpperProduct]);

  const handleLowerProductClick = useCallback((product: Product) => {
    const isSelected = selectedLowerProduct?.id === product.id;
    onLowerProductSelect(isSelected ? null : product);
    setLowerDropdownOpen(false);
  }, [onLowerProductSelect, selectedLowerProduct]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        upperDropdownRef.current && !upperDropdownRef.current.contains(event.target as Node) &&
        lowerDropdownRef.current && !lowerDropdownRef.current.contains(event.target as Node)
      ) {
        setUpperDropdownOpen(false);
        setLowerDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Render dropdown component
  const renderDropdown = (
    isOpen: boolean,
    products: Product[],
    selectedProduct: Product | null,
    onProductClick: (product: Product) => void,
    placeholder: string
  ) => {
    if (!isOpen) return null;

    return (
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
              <p className="text-xs text-gray-400 mt-1">Please set REACT_APP_UPPER_GARMENT_SHEET_URL and REACT_APP_LOWER_GARMENT_SHEET_URL</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                {products.map((product) => {
                  const isSelected = selectedProduct?.id === product.id;
                  
                  return (
                    <div
                      key={product.id}
                      onClick={() => onProductClick(product)}
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
                    </div>
                  );
                })}
              </div>

              {/* No Products Message */}
              {products.length === 0 && !loading && !error && (
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
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Upper Garment Selector */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">Upper Garment</h4>
        <div className="relative" ref={upperDropdownRef}>
          <button
            onClick={() => setUpperDropdownOpen(!upperDropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <div className="flex items-center space-x-3">
              <ShoppingBag className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {selectedUpperProduct?.name || 'Select upper garment...'}
              </span>
            </div>
            <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${upperDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {renderDropdown(
            upperDropdownOpen,
            filteredUpperProducts,
            selectedUpperProduct,
            handleUpperProductClick,
            'Select upper garment...'
          )}

          {/* Selected Upper Product Display */}
          {selectedUpperProduct && (
            <div className="mt-4">
              <div className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={getImageSrc(selectedUpperProduct.image)}
                  alt={selectedUpperProduct.name}
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={() => onUpperProductSelect(null)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-600">{selectedUpperProduct.name}</p>
            </div>
          )}
        </div>
      </div>

      {/* Lower Garment Selector */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-900">Lower Garment</h4>
        <div className="relative" ref={lowerDropdownRef}>
          <button
            onClick={() => setLowerDropdownOpen(!lowerDropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <div className="flex items-center space-x-3">
              <ShoppingBag className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {selectedLowerProduct?.name || 'Select lower garment...'}
              </span>
            </div>
            <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${lowerDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {renderDropdown(
            lowerDropdownOpen,
            filteredLowerProducts,
            selectedLowerProduct,
            handleLowerProductClick,
            'Select lower garment...'
          )}

          {/* Selected Lower Product Display */}
          {selectedLowerProduct && (
            <div className="mt-4">
              <div className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={getImageSrc(selectedLowerProduct.image)}
                  alt={selectedLowerProduct.name}
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={() => onLowerProductSelect(null)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-600">{selectedLowerProduct.name}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

