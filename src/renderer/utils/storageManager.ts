export interface CartItem {
  productId: number;
  productName: string;
  quantity: number;
  pricePerUnit: number;
  total: number; // quantity * pricePerUnit
}

export interface Transaction {
  id: string;
  date: string; // ISO timestamp
  time: string; // HH:mm:ss
  customerId?: number;
  customerName?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'check';
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
}

export interface Statistics {
  totalSales: number;
  totalTransactions: number;
  totalRevenue: number;
  averageTransaction: number;
  dateRange: {
    start: string;
    end: string;
  };
  byPaymentMethod: {
    cash: number;
    card: number;
    check: number;
  };
}

// ============================================
// 🔹 STORAGE KEYS
// ============================================

const TRANSACTIONS_KEY = 'nidhamy_transactions';
const CART_KEY = 'nidhamy_cart';
const STATISTICS_KEY = 'nidhamy_statistics';

// ============================================
// 🔹 CART MANAGEMENT
// ============================================

export const saveCart = (items: CartItem[]): void => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving cart:', error);
  }
};

export const loadCart = (): CartItem[] => {
  try {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading cart:', error);
    return [];
  }
};

export const addToCart = (item: CartItem): CartItem[] => {
  const cart = loadCart();

  // Check if item already exists
  const existingIndex = cart.findIndex(c => c.productId === item.productId);

  if (existingIndex !== -1) {
    // Update quantity
    cart[existingIndex].quantity += item.quantity;
    cart[existingIndex].total = cart[existingIndex].quantity * cart[existingIndex].pricePerUnit;
  } else {
    // Add new item
    cart.push(item);
  }

  saveCart(cart);
  return cart;
};

export const removeFromCart = (productId: number): CartItem[] => {
  const cart = loadCart();
  const filtered = cart.filter(item => item.productId !== productId);
  saveCart(filtered);
  return filtered;
};

export const updateCartItemQuantity = (productId: number, quantity: number): CartItem[] => {
  const cart = loadCart();
  const item = cart.find(c => c.productId === productId);

  if (item) {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }
    item.quantity = quantity;
    item.total = quantity * item.pricePerUnit;
  }

  saveCart(cart);
  return cart;
};

export const clearCart = (): CartItem[] => {
  saveCart([]);
  return [];
};

// ============================================
// 🔹 TRANSACTION MANAGEMENT
// ============================================

export const generateTransactionId = (): string => {
  return `TRX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const saveTransaction = (transaction: Transaction): void => {
  try {
    const transactions = getAllTransactions();
    transactions.push(transaction);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    console.log(`✅ Transaction saved: ${transaction.id}`);
  } catch (error) {
    console.error('Error saving transaction:', error);
  }
};

export const getAllTransactions = (): Transaction[] => {
  try {
    const data = localStorage.getItem(TRANSACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading transactions:', error);
    return [];
  }
};

export const getTransaction = (id: string): Transaction | null => {
  const transactions = getAllTransactions();
  return transactions.find(t => t.id === id) || null;
};

export const updateTransactionStatus = (id: string, status: 'pending' | 'confirmed' | 'cancelled'): Transaction | null => {
  try {
    const transactions = getAllTransactions();
    const transaction = transactions.find(t => t.id === id);

    if (transaction) {
      transaction.status = status;
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
      console.log(`✅ Transaction ${id} status updated to: ${status}`);
      return transaction;
    }
    return null;
  } catch (error) {
    console.error('Error updating transaction:', error);
    return null;
  }
};

export const deleteTransaction = (id: string): boolean => {
  try {
    const transactions = getAllTransactions();
    const filtered = transactions.filter(t => t.id !== id);

    if (filtered.length < transactions.length) {
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(filtered));
      console.log(`✅ Transaction deleted: ${id}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return false;
  }
};

// ============================================
// 🔹 STATISTICS
// ============================================

export const calculateStatistics = (dateFrom?: string, dateTo?: string): Statistics => {
  const transactions = getAllTransactions();

  // Filter by date if provided
  let filtered = transactions.filter(t => t.status === 'confirmed');

  if (dateFrom) {
    filtered = filtered.filter(t => t.date >= dateFrom);
  }
  if (dateTo) {
    filtered = filtered.filter(t => t.date <= dateTo);
  }

  const totalTransactions = filtered.length;
  const totalRevenue = filtered.reduce((sum, t) => sum + t.total, 0);
  const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  // Group by payment method
  const byPaymentMethod = {
    cash: filtered.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + t.total, 0),
    card: filtered.filter(t => t.paymentMethod === 'card').reduce((sum, t) => sum + t.total, 0),
    check: filtered.filter(t => t.paymentMethod === 'check').reduce((sum, t) => sum + t.total, 0),
  };

  return {
    totalSales: totalTransactions,
    totalTransactions,
    totalRevenue,
    averageTransaction,
    dateRange: {
      start: dateFrom || new Date().toISOString().split('T')[0],
      end: dateTo || new Date().toISOString().split('T')[0],
    },
    byPaymentMethod,
  };
};

export const getDailySalesCount = (date: string): number => {
  const transactions = getAllTransactions();
  return transactions.filter(t => t.date.startsWith(date) && t.status === 'confirmed').length;
};

export const getDailyRevenue = (date: string): number => {
  const transactions = getAllTransactions();
  return transactions.filter(t => t.date.startsWith(date) && t.status === 'confirmed').reduce((sum, t) => sum + t.total, 0);
};

// ============================================
// 🔹 QUICK FUNCTIONS
// ============================================

export const getTodayTransactions = (): Transaction[] => {
  const today = new Date().toISOString().split('T')[0];
  const transactions = getAllTransactions();
  return transactions.filter(t => t.date.startsWith(today));
};

export const getTodayStatistics = (): Statistics => {
  const today = new Date().toISOString().split('T')[0];
  return calculateStatistics(today, today);
};

export const getPendingTransactions = (): Transaction[] => {
  const transactions = getAllTransactions();
  return transactions.filter(t => t.status === 'pending');
};

export const getConfirmedTransactions = (): Transaction[] => {
  const transactions = getAllTransactions();
  return transactions.filter(t => t.status === 'confirmed');
};

export const exportTransactionsAsJSON = (): string => {
  const transactions = getAllTransactions();
  return JSON.stringify(transactions, null, 2);
};

// ============================================
// 🔹 INVENTORY SYNC
// ============================================

export const getInventoryFromTransaction = (transaction: Transaction): Array<{ productId: number; quantityReduced: number }> => {
  return transaction.items.map(item => ({
    productId: item.productId,
    quantityReduced: item.quantity,
  }));
};

export const shouldRestoreInventory = (transaction: Transaction): boolean => {
  return transaction.status === 'cancelled';
};

export const shouldReduceInventory = (transaction: Transaction): boolean => {
  return transaction.status === 'confirmed';
};

// ============================================
// 🔹 DEBUG & UTILITIES
// ============================================

export const clearAllStorage = (): void => {
  try {
    localStorage.removeItem(TRANSACTIONS_KEY);
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(STATISTICS_KEY);
    console.log('✅ All storage cleared');
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};

export const getStorageSize = (): {
  transactions: number;
  cart: number;
  total: number;
} => {
  const transactions = localStorage.getItem(TRANSACTIONS_KEY) || '{}';
  const cart = localStorage.getItem(CART_KEY) || '{}';

  return {
    transactions: new Blob([transactions]).size,
    cart: new Blob([cart]).size,
    total: new Blob([transactions + cart]).size,
  };
};

export const logStorageInfo = (): void => {
  const stats = getStorageSize();
  const transactions = getAllTransactions();

  console.log('=== STORAGE INFO ===');
  console.log(`Total Transactions: ${transactions.length}`);
  console.log(`Storage Size: ${stats.total} bytes`);
  console.log(`Status Breakdown:`, {
    pending: transactions.filter(t => t.status === 'pending').length,
    confirmed: transactions.filter(t => t.status === 'confirmed').length,
    cancelled: transactions.filter(t => t.status === 'cancelled').length,
  });
};
