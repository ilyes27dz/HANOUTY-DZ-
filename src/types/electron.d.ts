// src/types/electron.d.ts
export {};

declare global {
  interface Window {
    electron: {
      // Products
      getProducts: () => Promise<any[]>;
      addProduct: (product: any) => Promise<any>;
      updateProduct: (product: any) => Promise<any>;
      deleteProduct: (id: number) => Promise<any>;
      
      // Categories
      getCategories: () => Promise<any[]>;
      addCategory: (category: any) => Promise<any>;
      updateCategory: (category: any) => Promise<any>;
      deleteCategory: (id: number) => Promise<any>;
      
      // Marques
      getMarques: () => Promise<any[]>;
      addMarque: (marque: any) => Promise<any>;
      updateMarque: (marque: any) => Promise<any>;
      deleteMarque: (id: number) => Promise<any>;
      
      // Unites
      getUnites: () => Promise<any[]>;
      addUnite: (unite: any) => Promise<any>;
      updateUnite: (unite: any) => Promise<any>;
      deleteUnite: (id: number) => Promise<any>;
      
      // Tailles
      getTailles: () => Promise<any[]>;
      addTaille: (taille: any) => Promise<any>;
      updateTaille: (taille: any) => Promise<any>;
      deleteTaille: (id: number) => Promise<any>;
      
      // Settings
      getSettings: () => Promise<any>;
      updateSettings: (settings: any) => Promise<any>;
      
      // Lost Products
      getLostProducts: () => Promise<any[]>;
      addLostProduct: (product: any) => Promise<any>;
      deleteLostProduct: (id: number) => Promise<any>;
      
      openBarcodeWindow: (product: any) => void;
    };
  }
}
