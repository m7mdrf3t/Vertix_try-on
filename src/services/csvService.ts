import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Product } from '../types';
import { getBackendUrl } from '../config/backend';

export interface CSVProduct {
  id: string;
  name: string;
  image: string;
  category: string;
  price: string;
  description: string;
}

export class CSVService {
  static async loadProducts(): Promise<Product[]> {
    try {
      // Always try to load from Google Sheets first (with fallback URL)
      console.log('Loading products from Google Sheets...');
      return await this.loadProductsFromGoogleSheets();
    } catch (error) {
      console.error('Error loading products from Google Sheets:', error);
      console.log('Falling back to local products...');
      return this.getFallbackProducts();
    }
  }

  static async loadProductsFromCSV(): Promise<Product[]> {
    try {
      const response = await fetch('/assets/products.csv');
      const csvText = await response.text();
      
      return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            try {
              const products: Product[] = results.data.map((row: any) => ({
                id: row.id || '',
                name: row.name || '',
                image: row.image || '',
                category: row.category || '',
                price: row.price || '',
                description: row.description || '',
              }));
              resolve(products);
            } catch (error) {
              reject(error);
            }
          },
          error: (error: any) => {
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('Error loading products from CSV:', error);
      throw error;
    }
  }

  static async loadProductsFromGoogleSheets(): Promise<Product[]> {
    try {
      // Get Google Sheets URL from environment variable or use default
      const googleSheetsUrl = process.env.REACT_APP_GOOGLE_SHEETS_URL || 
        'https://docs.google.com/spreadsheets/d/1E4OdeiFgBO07T6NSePoRUSo8n5B1pWX8Tt4k48bYw5w/edit?usp=sharing';
      
      if (!googleSheetsUrl) {
        throw new Error('Google Sheets URL not configured');
      }

      // Convert Google Sheets URL to CSV export URL
      let csvUrl = googleSheetsUrl;
      if (csvUrl.includes('/edit#gid=')) {
        csvUrl = csvUrl.replace('/edit#gid=', '/export?format=csv&gid=');
      } else if (csvUrl.includes('/edit?usp=sharing')) {
        csvUrl = csvUrl.replace('/edit?usp=sharing', '/export?format=csv&gid=0');
      } else if (csvUrl.includes('/edit')) {
        csvUrl = csvUrl.replace('/edit', '/export?format=csv&gid=0');
      }
      
      // Use backend proxy to avoid CORS issues with Google Sheets
      const backendUrl = getBackendUrl();
      const proxiedUrl = `${backendUrl}/api/proxy-csv?url=${encodeURIComponent(csvUrl)}`;
      
      const response = await fetch(proxiedUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch Google Sheets: ${response.status}`);
      }
      
      const csvText = await response.text();
      
      return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            try {
              const products: Product[] = results.data.map((row: any) => ({
                id: row.id || row.ID || '',
                name: row.name || row.Name || row.NAME || '',
                image: row.image || row.Image || row.IMAGE || '',
                category: row.category || row.Category || row.CATEGORY || '',
                price: row.price || row.Price || row.PRICE || '',
                description: row.description || row.Description || row.DESCRIPTION || '',
              }));
              resolve(products);
            } catch (error) {
              reject(error);
            }
          },
          error: (error: any) => {
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('Error loading products from Google Sheets:', error);
      throw error;
    }
  }

  static async loadProductsFromExcel(): Promise<Product[]> {
    try {
      const response = await fetch('/assets/products.xlsx');
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Get the first worksheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      // Map to Product interface
      const products: Product[] = jsonData.map((row: any) => ({
        id: row.id || row.ID || '',
        name: row.name || row.Name || row.NAME || '',
        image: row.image || row.Image || row.IMAGE || '',
        category: row.category || row.Category || row.CATEGORY || '',
        price: row.price || row.Price || row.PRICE || '',
        description: row.description || row.Description || row.DESCRIPTION || '',
      }));
      
      return products;
    } catch (error) {
      console.error('Error loading products from Excel:', error);
      throw error;
    }
  }

  static async validateCSVStructure(csvText: string): Promise<boolean> {
    return new Promise((resolve) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const requiredColumns = ['id', 'name', 'image', 'category'];
          const headers = results.meta.fields || [];
          const hasRequiredColumns = requiredColumns.every(col => headers.includes(col));
          resolve(hasRequiredColumns);
        },
        error: () => {
          resolve(false);
        }
      });
    });
  }

  static getFallbackProducts(): Product[] {
    return [
      {
        id: 'shirt-1',
        name: 'Classic White Shirt',
        image: '/products/white-shirt.jpg',
        category: 'Shirts',
        price: '$29.99',
        description: 'Classic white cotton shirt'
      },
      {
        id: 'shirt-2',
        name: 'Blue Denim Shirt',
        image: '/products/blue-shirt.jpg',
        category: 'Shirts',
        price: '$34.99',
        description: 'Comfortable blue denim shirt'
      },
      {
        id: 'pants-1',
        name: 'Black Pants',
        image: '/products/black-pants.jpg',
        category: 'Pants',
        price: '$49.99',
        description: 'Classic black dress pants'
      },
      {
        id: 'jacket-1',
        name: 'Leather Jacket',
        image: '/products/leather-jacket.jpg',
        category: 'Jackets',
        price: '$129.99',
        description: 'Genuine leather jacket'
      },
      {
        id: 'dress-1',
        name: 'Summer Dress',
        image: '/products/summer-dress.jpg',
        category: 'Dresses',
        price: '$59.99',
        description: 'Light and comfortable summer dress'
      },
      {
        id: 'sweater-1',
        name: 'Cozy Sweater',
        image: '/products/sweater.jpg',
        category: 'Sweaters',
        price: '$39.99',
        description: 'Warm and cozy sweater'
      }
    ];
  }
}
