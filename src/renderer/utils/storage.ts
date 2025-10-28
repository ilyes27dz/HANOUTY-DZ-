// src/utils/storage.ts
export interface Product {
  id: number;
  name: string;
  barcode: string;
  category: string;
  marque: string;
  unite: string;
  taille: string;
  purchasePrice: number;
  salePrice: number;
  profit: number;
  quantity: number;
  minQuantity: number;
  image?: string;
  isActive: boolean;
}

const PRODUCTS_KEY = 'hipos_products';

export const saveProducts = (products: Product[]): void => {
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  } catch (error) {
    console.error('Error saving products:', error);
  }
};

export const loadProducts = (): Product[] => {
  try {
    const data = localStorage.getItem(PRODUCTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
};

export const addProduct = (product: Product): Product[] => {
  const products = loadProducts();
  products.push(product);
  saveProducts(products);
  return products;
};

export const updateProduct = (id: number, updatedProduct: Partial<Product>): Product[] => {
  const products = loadProducts();
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...updatedProduct };
    saveProducts(products);
  }
  return products;
};

export const deleteProduct = (id: number): Product[] => {
  const products = loadProducts();
  const filtered = products.filter(p => p.id !== id);
  saveProducts(filtered);
  return filtered;
};
