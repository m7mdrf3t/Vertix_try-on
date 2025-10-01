import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Product } from '../types';

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
      // Try to load from Google Sheets first, then Excel, then CSV
      try {
        return await this.loadProductsFromGoogleSheets();
      } catch (googleSheetsError) {
        console.log('Google Sheets not configured, trying Excel...');
        try {
          return await this.loadProductsFromExcel();
        } catch (excelError) {
          console.log('Excel file not found, trying CSV...');
          return await this.loadProductsFromCSV();
        }
      }
    } catch (error) {
      console.error('Error loading products:', error);
      throw error;
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
      const googleSheetsUrl = process.env.REACT_APP_GOOGLE_SHEETS_URL;
      
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
      
      const response = await fetch(csvUrl);
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
}
