const XLSX = require('xlsx');

// Sample data
const data = [
  { id: 'shirt-1', name: 'Classic White Shirt', image: '/products/white-shirt.jpg', category: 'Shirts', price: '$29.99', description: 'Classic white cotton shirt' },
  { id: 'shirt-2', name: 'Blue Denim Shirt', image: '/products/blue-shirt.jpg', category: 'Shirts', price: '$34.99', description: 'Comfortable blue denim shirt' },
  { id: 'dress-1', name: 'Summer Dress', image: '/products/summer-dress.jpg', category: 'Dresses', price: '$49.99', description: 'Light and breezy summer dress' },
  { id: 'jacket-1', name: 'Leather Jacket', image: '/products/leather-jacket.jpg', category: 'Jackets', price: '$89.99', description: 'Classic black leather jacket' },
  { id: 'sweater-1', name: 'Cozy Sweater', image: '/products/sweater.jpg', category: 'Sweaters', price: '$39.99', description: 'Warm and cozy knit sweater' },
  { id: 'pants-1', name: 'Black Pants', image: '/products/black-pants.jpg', category: 'Pants', price: '$44.99', description: 'Professional black trousers' }
];

// Create workbook and worksheet
const ws = XLSX.utils.json_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Products');

// Write file
XLSX.writeFile(wb, 'public/assets/products.xlsx');
console.log('Excel file created successfully!');
