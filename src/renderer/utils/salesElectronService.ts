// src/renderer/utils/salesElectronService.ts
// ✅ PRODUCTION VERSION - خدمة موحدة للمبيعات والقروض والمرتجعات والفواتير

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  date: string;
  time: string;
  customerName?: string;
  items: SaleItem[];
  totalAmount: number;
  profit: number;
  paymentMethod: 'cash' | 'card' | 'check';
  status: 'confirmed' | 'pending' | 'cancelled';
  notes?: string;
}

export interface Credit {
  id: string;
  invoiceNumber: string;
  date: string;
  time: string;
  customerName: string;
  phone: string;
  productName: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'pending' | 'partial' | 'paid';
  dueDate: string;
  payments: Payment[];
  notes?: string;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  time: string;
  notes?: string;
}

export interface Return {
  id: string;
  date: string;
  time: string;
  productName: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  customerName?: string;
  returnReason: string;
  status: 'approved' | 'rejected' | 'pending';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  time: string;
  customerName: string;
  saleId: string;
  totalAmount: number;
  status: 'active' | 'archived';
  printCount: number;
}

// ============================================
// 🔹 SALES SERVICE - خدمة المبيعات
// ============================================

export const salesService = {
  // ✅ حفظ مبيعة جديدة
  async saveSale(saleData: Omit<Sale, 'id' | 'invoiceNumber' | 'date' | 'time'>) {
    try {
      const result = await window.electron.invoke('save-sale', {
        ...saleData,
        invoiceNumber: `INV-${Date.now()}`,
        date: new Date().toLocaleDateString('ar-DZ'),
        time: new Date().toLocaleTimeString('ar-DZ'),
      });
      console.log('✅ Sale saved:', result);
      return result;
    } catch (error) {
      console.error('❌ Error saving sale:', error);
      throw error;
    }
  },

  // ✅ جلب المبيعات
  async getSales(options?: { date?: string; limit?: number }) {
    try {
      const sales = await window.electron.invoke('get-sales', options);
      console.log('✅ Sales retrieved:', sales?.length || 0);
      return sales || [];
    } catch (error) {
      console.error('❌ Error getting sales:', error);
      return [];
    }
  },

  // ✅ حذف مبيعة
  async deleteSale(saleId: string) {
    try {
      const result = await window.electron.invoke('delete-sale', saleId);
      console.log('✅ Sale deleted:', saleId);
      return result;
    } catch (error) {
      console.error('❌ Error deleting sale:', error);
      throw error;
    }
  },
};

// ============================================
// 🔹 CREDITS SERVICE - خدمة القروض
// ============================================

export const creditsService = {
  // ✅ حفظ قرض جديد
  async saveCredit(creditData: Omit<Credit, 'id' | 'invoiceNumber' | 'date' | 'time' | 'payments'>) {
    try {
      const result = await window.electron.invoke('save-credit', {
        ...creditData,
        invoiceNumber: `CREDIT-${Date.now()}`,
        date: new Date().toLocaleDateString('ar-DZ'),
        time: new Date().toLocaleTimeString('ar-DZ'),
      });
      console.log('✅ Credit saved:', result);
      return result;
    } catch (error) {
      console.error('❌ Error saving credit:', error);
      throw error;
    }
  },

  // ✅ جلب القروض
  async getCredits() {
    try {
      const credits = await window.electron.invoke('get-credits');
      console.log('✅ Credits retrieved:', credits?.length || 0);
      return credits || [];
    } catch (error) {
      console.error('❌ Error getting credits:', error);
      return [];
    }
  },

  // ✅ إضافة دفعة لقرض
  async addPayment(creditId: string, amount: number, notes?: string) {
    try {
      const result = await window.electron.invoke('add-credit-payment', {
        creditId,
        amount: Number(amount),
        notes,
      });
      console.log('✅ Payment added:', result);
      return result;
    } catch (error) {
      console.error('❌ Error adding payment:', error);
      throw error;
    }
  },

  // ✅ حذف قرض
  async deleteCredit(creditId: string) {
    try {
      const result = await window.electron.invoke('delete-credit', creditId);
      console.log('✅ Credit deleted:', creditId);
      return result;
    } catch (error) {
      console.error('❌ Error deleting credit:', error);
      throw error;
    }
  },
};

// ============================================
// 🔹 RETURNS SERVICE - خدمة المرتجعات
// ============================================

export const returnsService = {
  // ✅ حفظ مرتجع
  async saveReturn(returnData: Omit<Return, 'id' | 'date' | 'time'>) {
    try {
      const result = await window.electron.invoke('save-return', {
        ...returnData,
        date: new Date().toLocaleDateString('ar-DZ'),
        time: new Date().toLocaleTimeString('ar-DZ'),
      });
      console.log('✅ Return saved:', result);
      return result;
    } catch (error) {
      console.error('❌ Error saving return:', error);
      throw error;
    }
  },

  // ✅ جلب المرتجعات
  async getReturns() {
    try {
      const returns = await window.electron.invoke('get-returns');
      console.log('✅ Returns retrieved:', returns?.length || 0);
      return returns || [];
    } catch (error) {
      console.error('❌ Error getting returns:', error);
      return [];
    }
  },

  // ✅ حذف مرتجع
  async deleteReturn(returnId: string) {
    try {
      const result = await window.electron.invoke('delete-return', returnId);
      console.log('✅ Return deleted:', returnId);
      return result;
    } catch (error) {
      console.error('❌ Error deleting return:', error);
      throw error;
    }
  },
};

// ============================================
// 🔹 INVOICES SERVICE - خدمة الفواتير
// ============================================

export const invoicesService = {
  // ✅ حفظ فاتورة
  async saveInvoice(invoiceData: Omit<Invoice, 'id' | 'date' | 'time'>) {
    try {
      const result = await window.electron.invoke('save-invoice', {
        ...invoiceData,
        date: new Date().toLocaleDateString('ar-DZ'),
        time: new Date().toLocaleTimeString('ar-DZ'),
      });
      console.log('✅ Invoice saved:', result);
      return result;
    } catch (error) {
      console.error('❌ Error saving invoice:', error);
      throw error;
    }
  },

  // ✅ جلب الفواتير
  async getInvoices() {
    try {
      const invoices = await window.electron.invoke('get-invoices');
      console.log('✅ Invoices retrieved:', invoices?.length || 0);
      return invoices || [];
    } catch (error) {
      console.error('❌ Error getting invoices:', error);
      return [];
    }
  },
};

// ============================================
// 🔹 STATISTICS SERVICE - خدمة الإحصائيات
// ============================================

export const statisticsService = {
  // ✅ جلب الإحصائيات
  async getStatistics(dateFrom?: string, dateTo?: string) {
    try {
      const result = await window.electron.invoke('get-sales-statistics', {
        dateFrom,
        dateTo,
      });
      if (result.success) {
        console.log('✅ Statistics calculated:', result.stats);
        return result.stats;
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting statistics:', error);
      return null;
    }
  },
};

// ============================================
// 🔹 COMBINED SERVICE - الخدمة الموحدة
// ============================================

export const transactionsService = {
  sales: salesService,
  credits: creditsService,
  returns: returnsService,
  invoices: invoicesService,
  statistics: statisticsService,

  // ✅ مثال عملي: حفظ مبيعة كاملة مع جميع المتطلبات
  async completeSale(saleData: any) {
    try {
      console.log('🔄 Starting complete sale transaction...');

      // 1️⃣ حفظ المبيعة
      const saleResult = await this.sales.saveSale({
        items: saleData.items,
        totalAmount: saleData.totalAmount,
        profit: saleData.profit,
        paymentMethod: saleData.paymentMethod,
        status: 'confirmed',
        customerName: saleData.customerName,
        notes: saleData.notes,
      });

      if (!saleResult.success) {
        throw new Error('Failed to save sale');
      }

      // 2️⃣ حفظ الفاتورة
      const invoiceResult = await this.invoices.saveInvoice({
        invoiceNumber: saleResult.invoiceNumber,
        customerName: saleData.customerName || 'عام',
        saleId: saleResult.id,
        totalAmount: saleData.totalAmount,
        status: 'active',
        printCount: 0,
      });

      console.log('✅ Complete sale transaction successful!');
      return {
        success: true,
        sale: saleResult,
        invoice: invoiceResult,
      };
    } catch (error) {
      console.error('❌ Complete sale transaction failed:', error);
      throw error;
    }
  },

  // ✅ الإحصائيات العامة
  async getTotalStatistics() {
    try {
      const stats = await this.statistics.getStatistics();
      const sales = await this.sales.getSales();
      const credits = await this.credits.getCredits();
      const returns = await this.returns.getReturns();

      return {
        ...stats,
        salesCount: sales.length,
        creditsCount: credits.length,
        returnsCount: returns.length,
      };
    } catch (error) {
      console.error('❌ Error getting total statistics:', error);
      return null;
    }
  },
};

// ✅ Default Export
export default transactionsService;
