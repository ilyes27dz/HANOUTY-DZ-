// src/renderer/products/ProductList.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, Grid, Card, CardContent, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, InputAdornment, FormControl, InputLabel,
  Select, MenuItem, Tooltip, LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, Alert, TablePagination, Divider, RadioGroup, FormControlLabel, Radio, Tabs, Tab, Avatar
} from '@mui/material';
import {
  Add, Edit, Delete, QrCode2, Search, Print, Refresh, FilterList, ArrowBack, Category, Inventory,
  TrendingUp, Warning, Close, Remove, Build, Info as InfoIcon, AttachMoney, ShoppingCart, Undo
} from '@mui/icons-material';

import ProductDialog from './ProductDialog';

interface Product {
  id?: number;
  ref: string;
  designation: string;
  marque: string;
  category: string;
  fournisseur: string;
  unite: string;
  prixAchat: number;
  prixVente1: number;
  prixVente2: number;
  prixVente3: number;
  prixGros: number;
  remise1: number;
  remise2: number;
  remise3: number;
  stock: number;
  stockAlerte: number;
  stockNecessaire: number;
  stockMin: number;
  emplacement: string;
  barcode: string;
  image: string;
  dateCreation: string;
  datePeremption: string;
  lotNumber: string;
  poids: number;
  hauteur: number;
  largeur: number;
  profondeur: number;
  notes: string;
  enBalanceActive: boolean;
  stockActive: boolean;
  permisVente: boolean;
  vetements: boolean;
  estActif: boolean;
  taille?: string;
  nbrColier: number;
  prixColis: number;
}

interface ProductListProps {
  isArabic: boolean;
  onBack: () => void;
}

interface StatsData {
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
}

const ProductList: React.FC<ProductListProps> = ({ isArabic, onBack }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [barcodeSearchTerm, setBarcodeSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning' });
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [barcodeDialog, setBarcodeDialog] = useState(false);
  const [selectedForBarcode, setSelectedForBarcode] = useState<Product | null>(null);
  const [printQuantity, setPrintQuantity] = useState(0);
  const [priceDisplay, setPriceDisplay] = useState<'detail' | 'gros' | 'price-only'>('detail');
  const [stockCorrectionDialog, setStockCorrectionDialog] = useState(false);
  const [selectedForStockCorrection, setSelectedForStockCorrection] = useState<Product | null>(null);
  const [newStockValue, setNewStockValue] = useState<number>(0);
  const [correctionReason, setCorrectionReason] = useState('');
  const [productStatsDialog, setProductStatsDialog] = useState(false);
  const [selectedProductStats, setSelectedProductStats] = useState<Product | null>(null);
  const [statsTab, setStatsTab] = useState(0);

  const [stats, setStats] = useState<StatsData>({
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0
  });

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    handleSearch();
    calculateStats();
  }, [searchTerm, products, categoryFilter, stockFilter, barcodeSearchTerm]);

  useEffect(() => {
    let barcode = '';
    let timeout: NodeJS.Timeout;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (barcode) {
          handleBarcodeSearch(barcode);
          barcode = '';
        }
      } else if (e.key.length === 1) {
        barcode += e.key;
        clearTimeout(timeout);
        timeout = setTimeout(() => { barcode = ''; }, 100);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      clearTimeout(timeout);
    };
  }, [products]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await window.electron.getProducts();
      setProducts(data || []);
      setFilteredProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setSnackbar({ open: true, message: 'خطأ في تحميل المنتجات', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await window.electron.getCategories();
      const uniqueCategories = data.map((cat: any) => cat.name);
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const calculateStats = () => {
    const totalProducts = products.length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.stockAlerte).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const totalValue = products.reduce((sum, p) => sum + (p.stock * p.prixAchat), 0);
    setStats({ totalProducts, lowStock, outOfStock, totalValue });
  };

  const handleSearch = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode.includes(searchTerm) ||
        p.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.marque.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (barcodeSearchTerm) {
      filtered = filtered.filter(p => p.barcode.includes(barcodeSearchTerm));
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    if (stockFilter === 'low') {
      filtered = filtered.filter(p => p.stock > 0 && p.stock <= p.stockAlerte);
    } else if (stockFilter === 'out') {
      filtered = filtered.filter(p => p.stock === 0);
    } else if (stockFilter === 'available') {
      filtered = filtered.filter(p => p.stock > p.stockAlerte);
    }

    setFilteredProducts(filtered);
  };

const handleSaveProduct = async (product: Product) => {
  try {
    console.log('🔵 Saving product:', product);
    
    if (product.id) {
      await window.electron.updateProduct(product);
      console.log('✅ Product updated');
    } else {
      await window.electron.addProduct(product);
      console.log('✅ Product added');
    }
    
    setSnackbar({ 
      open: true, 
      message: isArabic ? '✅ تم الحفظ بنجاح!' : '✅ Enregistré avec succès!', 
      severity: 'success' 
    });
    
    // ✅ تحديث القائمة بعد 300ms
    setTimeout(() => {
      fetchProducts();
      console.log('🔄 Products refreshed');
    }, 300);
    
    setOpenDialog(false);
    setSelectedProduct(null);
  } catch (error) {
    console.error('❌ Save error:', error);
    setSnackbar({ 
      open: true, 
      message: isArabic ? '❌ خطأ في الحفظ!' : '❌ Erreur!', 
      severity: 'error' 
    });
  }
};

  const handleDelete = async (id: number) => {
    if (!window.confirm(isArabic ? 'هل أنت متأكد من الحذف؟' : 'Êtes-vous sûr de supprimer?')) return;
    try {
      await window.electron.deleteProduct(id);
      setSnackbar({ open: true, message: isArabic ? 'تم الحذف بنجاح' : 'Supprimé avec succès', severity: 'success' });
      fetchProducts();
    } catch (error) {
      setSnackbar({ open: true, message: 'خطأ في الحذف', severity: 'error' });
    }
  };

  const handleBarcodeSearch = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      handleOpenBarcodeDialog(product);
    } else {
      setSnackbar({ open: true, message: isArabic ? 'المنتج غير موجود' : 'Produit introuvable', severity: 'warning' });
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenBarcodeDialog = (product: Product) => {
    setSelectedForBarcode(product);
    setPrintQuantity(0);
    setPriceDisplay('detail');
    setBarcodeDialog(true);
  };

  const generateBarcodePattern = (text: string): string => {
    const patterns: { [key: string]: string } = {
      '0': '0001101', '1': '0011001', '2': '0010011', '3': '0111101',
      '4': '0100011', '5': '0110001', '6': '0101111', '7': '0111011',
      '8': '0110111', '9': '0001011'
    };
    let result = '101';
    for (let char of text) {
      if (patterns[char]) result += patterns[char];
    }
    result += '101';
    return result;
  };

  const handlePrintBarcode = () => {
    if (!selectedForBarcode || printQuantity <= 0) {
      setSnackbar({ open: true, message: isArabic ? 'أدخل العدد' : 'Entrez la quantité', severity: 'warning' });
      return;
    }

    const printWindow = window.open('', '', 'height=900,width=1200');
    if (!printWindow) return;

    const labelsArray = Array(printQuantity).fill({
      productName: selectedForBarcode.designation,
      barcode: selectedForBarcode.barcode,
      price: priceDisplay === 'gros' ? selectedForBarcode.prixGros : selectedForBarcode.prixVente1
    });

    const barcodePattern = generateBarcodePattern(selectedForBarcode.barcode);
    const barcodesHTML = barcodePattern.split('').map(bit =>
      `<div class="bar ${bit === '1' ? 'black' : 'white'}" style="width: ${100 / barcodePattern.length}%"></div>`
    ).join('');

    printWindow.document.write(`
      <html><head><title>Code-barres - ${selectedForBarcode.designation}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @page { size: A4; margin: 8mm; }
        body { font-family: 'Arial', sans-serif; padding: 5mm; background: white; }
        .page { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; width: 100%; }
        .label { width: 100%; height: 40mm; border: 2px solid #e0e0e0; border-radius: 4mm; padding: 3mm; display: flex; flex-direction: column; justify-content: space-between; page-break-inside: avoid; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .product-name { font-size: 10pt; font-weight: bold; text-align: center; color: #34495e; min-height: 12mm; display: flex; align-items: center; justify-content: center; line-height: 1.2; padding: 0 2mm; word-wrap: break-word; }
        .barcode-container { display: flex; flex-direction: column; align-items: center; margin: 2mm 0; }
        .barcode { width: 100%; height: 18mm; display: flex; flex-direction: column; align-items: center; justify-content: center; background: white; }
        .barcode-bars { width: 95%; height: 70%; display: flex; align-items: stretch; justify-content: center; background: white; border: 1px solid #ddd; }
        .bar { flex: 0 0 auto; height: 100%; }
        .bar.black { background: #000; }
        .bar.white { background: #fff; }
        .barcode-text { font-size: 9pt; font-weight: bold; color: #2c3e50; margin-top: 1mm; letter-spacing: 2px; font-family: 'Courier New', monospace; }
        .price { font-size: 16pt; font-weight: bold; text-align: center; color: #e74c3c; background: #fff9e6; border: 3px solid #f39c12; border-radius: 4mm; padding: 2mm; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); }
      </style></head><body><div class="page">
        ${labelsArray.map((label) => `
          <div class="label">
            <div class="product-name">${label.productName}</div>
            <div class="barcode-container">
              <div class="barcode">
                <div class="barcode-bars">${barcodesHTML}</div>
                <div class="barcode-text">${label.barcode}</div>
              </div>
            </div>
            ${priceDisplay !== 'price-only' ? `<div class="price">${label.price.toFixed(2)} DA</div>` : ''}
          </div>
        `).join('')}
      </div>
      <script>window.onload = function() { setTimeout(function() { window.print(); setTimeout(function() { window.close(); }, 100); }, 500); };</script>
      </body></html>
    `);

    printWindow.document.close();
    setBarcodeDialog(false);
  };

  const handleOpenStockCorrection = (product: Product) => {
    setSelectedForStockCorrection(product);
    setNewStockValue(product.stock);
    setCorrectionReason('');
    setStockCorrectionDialog(true);
  };

  const handleSaveStockCorrection = async () => {
    if (!selectedForStockCorrection) return;
    try {
      const updatedProduct = { ...selectedForStockCorrection, stock: newStockValue };
      await window.electron.updateProduct(updatedProduct);
      setSnackbar({ open: true, message: isArabic ? 'تم تصحيح المخزون' : 'Stock corrigé', severity: 'success' });
      fetchProducts();
      setStockCorrectionDialog(false);
    } catch (error) {
      setSnackbar({ open: true, message: 'خطأ في تصحيح المخزون', severity: 'error' });
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=800,width=1200');
    if (!printWindow) return;

    const tableHTML = filteredProducts.map((p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${p.barcode}</td>
        <td>${p.designation}</td>
        <td>${p.category}</td>
        <td>${p.prixVente1} DA</td>
        <td>${p.stock}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html><head><title>${isArabic ? 'قائمة المنتجات' : 'Liste des Produits'}</title>
      <style>
        body { font-family: Arial, sans-serif; direction: ${isArabic ? 'rtl' : 'ltr'}; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: ${isArabic ? 'right' : 'left'}; }
        th { background-color: #2c3e50; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        h1 { text-align: center; color: #2c3e50; }
        .header { text-align: center; margin-bottom: 20px; }
        .date { font-size: 12px; color: #666; }
      </style></head><body>
        <div class="header">
          <h1>${isArabic ? 'قائمة المنتجات' : 'Liste des Produits'}</h1>
          <p class="date">${new Date().toLocaleDateString()}</p>
        </div>
        <table>
          <thead><tr>
            <th>#</th>
            <th>${isArabic ? 'الباركود' : 'Code-barres'}</th>
            <th>${isArabic ? 'التسمية' : 'Désignation'}</th>
            <th>${isArabic ? 'الفئة' : 'Catégorie'}</th>
            <th>${isArabic ? 'السعر' : 'Prix'}</th>
            <th>${isArabic ? 'المخزون' : 'Stock'}</th>
          </tr></thead>
          <tbody>${tableHTML}</tbody>
        </table>
      </body></html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleOpenProductStats = (product: Product) => {
    setSelectedProductStats(product);
    setStatsTab(0);
    setProductStatsDialog(true);
  };

  return (
    <Box sx={{ p: 2, bgcolor: '#ecf0f1', minHeight: '100vh', maxHeight: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 1.5, mb: 2, bgcolor: '#2c3e50' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton onClick={onBack} size="small" sx={{ color: '#fff', bgcolor: '#34495e' }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" fontWeight="bold" color="#fff" sx={{ fontSize: 16 }}>
              {isArabic ? 'إدارة المنتجات' : 'Gestion des Produits'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={isArabic ? 'تحديث' : 'Actualiser'}>
              <IconButton onClick={fetchProducts} size="small" sx={{ color: '#fff', bgcolor: '#34495e' }}>
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={isArabic ? 'طباعة' : 'Imprimer'}>
              <IconButton onClick={handlePrint} size="small" sx={{ color: '#fff', bgcolor: '#34495e' }}>
                <Print fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => { setSelectedProduct(null); setOpenDialog(true); }}
              size="small"
              sx={{ bgcolor: '#27ae60', '&:hover': { bgcolor: '#229954' }, textTransform: 'none', fontSize: 13 }}>
              {isArabic ? 'منتج جديد' : 'Nouveau'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Stats */}
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: '#3498db', color: '#fff', boxShadow: 1 }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.9, fontSize: 11 }}>{isArabic ? 'إجمالي المنتجات' : 'Total Produits'}</Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ fontSize: 24 }}>{stats.totalProducts}</Typography>
                </Box>
                <Inventory sx={{ fontSize: 40, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: '#e74c3c', color: '#fff', boxShadow: 1 }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.9, fontSize: 11 }}>{isArabic ? 'مخزون منخفض' : 'Stock Faible'}</Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ fontSize: 24 }}>{stats.lowStock}</Typography>
                </Box>
                <Warning sx={{ fontSize: 40, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: '#f39c12', color: '#fff', boxShadow: 1 }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.9, fontSize: 11 }}>{isArabic ? 'نفذ المخزون' : 'Stock Épuisé'}</Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ fontSize: 24 }}>{stats.outOfStock}</Typography>
                </Box>
                <Warning sx={{ fontSize: 40, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card sx={{ bgcolor: '#16a085', color: '#fff', boxShadow: 1 }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.9, fontSize: 11 }}>{isArabic ? 'قيمة المخزون' : 'Valeur Stock'}</Typography>
                  <Typography variant="h6" fontWeight="bold" sx={{ fontSize: 16 }}>{stats.totalValue.toFixed(0)} DA</Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Paper elevation={1} sx={{ p: 1.5, mb: 2 }}>
        <Grid container spacing={1.5} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              placeholder={isArabic ? 'بحث عام...' : 'Recherche générale...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: (<InputAdornment position="start"><Search fontSize="small" /></InputAdornment>) }}
              sx={{ '& .MuiOutlinedInput-root': { fontSize: 13 } }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              size="small"
              placeholder={isArabic ? 'بحث بالباركود...' : 'Recherche par code-barres...'}
              value={barcodeSearchTerm}
              onChange={(e) => setBarcodeSearchTerm(e.target.value)}
              InputProps={{ startAdornment: (<InputAdornment position="start"><QrCode2 fontSize="small" /></InputAdornment>) }}
              sx={{ '& .MuiOutlinedInput-root': { fontSize: 13 } }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: 13 }}>{isArabic ? 'الفئة' : 'Catégorie'}</InputLabel>
              <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} label={isArabic ? 'الفئة' : 'Catégorie'} sx={{ fontSize: 13 }}>
                <MenuItem value="all" sx={{ fontSize: 13 }}>{isArabic ? 'الكل' : 'Tous'}</MenuItem>
                {categories.map(cat => <MenuItem key={cat} value={cat} sx={{ fontSize: 13 }}>{cat}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: 13 }}>{isArabic ? 'المخزون' : 'Stock'}</InputLabel>
              <Select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} label={isArabic ? 'المخزون' : 'Stock'} sx={{ fontSize: 13 }}>
                <MenuItem value="all" sx={{ fontSize: 13 }}>{isArabic ? 'الكل' : 'Tous'}</MenuItem>
                <MenuItem value="available" sx={{ fontSize: 13 }}>{isArabic ? 'متوفر' : 'Disponible'}</MenuItem>
                <MenuItem value="low" sx={{ fontSize: 13 }}>{isArabic ? 'منخفض' : 'Faible'}</MenuItem>
                <MenuItem value="out" sx={{ fontSize: 13 }}>{isArabic ? 'نفذ' : 'Épuisé'}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              size="small"
              variant="outlined"
              startIcon={<FilterList fontSize="small" />}
              onClick={() => {
                setCategoryFilter('all');
                setStockFilter('all');
                setSearchTerm('');
                setBarcodeSearchTerm('');
              }}
              sx={{ textTransform: 'none', fontSize: 12 }}>
              {isArabic ? 'إعادة تعيين' : 'Réinitialiser'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading && <LinearProgress sx={{ mb: 1 }} />}
      {/* ✅ TABLE - Fixed Height with Scroll + عمود الصورة */}
      <Paper elevation={1} sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: '#34495e', color: '#fff', fontWeight: 'bold', fontSize: 12, py: 1 }}>#</TableCell>
                {/* ✅ عمود الصورة */}
                <TableCell sx={{ bgcolor: '#34495e', color: '#fff', fontWeight: 'bold', fontSize: 12, py: 1 }}>{isArabic ? 'الصورة' : 'Image'}</TableCell>
                <TableCell sx={{ bgcolor: '#34495e', color: '#fff', fontWeight: 'bold', fontSize: 12, py: 1 }}>{isArabic ? 'الباركود' : 'Code-barres'}</TableCell>
                <TableCell sx={{ bgcolor: '#34495e', color: '#fff', fontWeight: 'bold', fontSize: 12, py: 1 }}>{isArabic ? 'التسمية' : 'Désignation'}</TableCell>
                <TableCell sx={{ bgcolor: '#34495e', color: '#fff', fontWeight: 'bold', fontSize: 12, py: 1 }}>{isArabic ? 'الفئة' : 'Catégorie'}</TableCell>
                <TableCell sx={{ bgcolor: '#34495e', color: '#fff', fontWeight: 'bold', fontSize: 12, py: 1 }}>{isArabic ? 'السعر' : 'Prix'}</TableCell>
                <TableCell sx={{ bgcolor: '#34495e', color: '#fff', fontWeight: 'bold', fontSize: 12, py: 1 }}>{isArabic ? 'المخزون' : 'Stock'}</TableCell>
                <TableCell sx={{ bgcolor: '#34495e', color: '#fff', fontWeight: 'bold', fontSize: 12, py: 1 }} align="center">{isArabic ? 'إجراءات' : 'Actions'}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="textSecondary">{isArabic ? 'لا توجد منتجات' : 'Aucun produit'}</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((product, index) => (
                    <TableRow key={product.id} hover sx={{ '&:hover': { bgcolor: '#ecf0f1' }, bgcolor: product.stock === 0 ? '#ffebee' : product.stock <= product.stockAlerte ? '#fff3e0' : 'inherit' }}>
                      <TableCell sx={{ fontSize: 12, py: 0.75 }}>{page * rowsPerPage + index + 1}</TableCell>
                      
                      {/* ✅ عرض الصورة */}
{/* ✅ عرض الصورة - محسّن */}
<TableCell sx={{ fontSize: 12, py: 0.75 }}>
  <Avatar
    src={product.image || undefined}
    alt={product.designation}
    variant="rounded"
    sx={{
      width: 50,
      height: 50,
      objectFit: 'cover',
      border: '2px solid #ddd',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      bgcolor: product.image ? '#f5f5f5' : '#3498db',
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold'
    }}
  >
    {!product.image && <QrCode2 sx={{ fontSize: 28 }} />}
  </Avatar>
</TableCell>

                      <TableCell sx={{ fontSize: 12, py: 0.75 }}>
                        <Chip
                          label={product.barcode}
                          size="small"
                          icon={<QrCode2 />}
                          onClick={() => handleOpenBarcodeDialog(product)}
                          sx={{ cursor: 'pointer', fontFamily: 'monospace', fontSize: 11, height: 24 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: 12, py: 0.75 }}>
                        <Typography fontSize={12} fontWeight="600">{product.designation}</Typography>
                        <Typography variant="caption" color="textSecondary" fontSize={10}>{product.marque}</Typography>
                      </TableCell>
                      <TableCell sx={{ fontSize: 12, py: 0.75 }}>
                        <Chip label={product.category} size="small" sx={{ fontSize: 11, height: 22 }} />
                      </TableCell>
                      <TableCell sx={{ fontSize: 12, py: 0.75 }}>
                        <Typography fontSize={12} fontWeight="600" color="#27ae60">{product.prixVente1.toFixed(2)} DA</Typography>
                      </TableCell>
                      <TableCell sx={{ fontSize: 12, py: 0.75 }}>
                        <Chip label={product.stock} size="small" color={product.stock === 0 ? 'error' : product.stock <= product.stockAlerte ? 'warning' : 'success'} sx={{ fontSize: 11, height: 22 }} />
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: 12, py: 0.75 }}>
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title={isArabic ? 'إحصائيات' : 'Statistiques'}>
                            <IconButton size="small" sx={{ color: '#3498db', p: 0.5 }} onClick={() => handleOpenProductStats(product)}>
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={isArabic ? 'تصحيح المخزون' : 'Corriger Stock'}>
                            <IconButton size="small" sx={{ color: '#f39c12', p: 0.5 }} onClick={() => handleOpenStockCorrection(product)}>
                              <Build fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={isArabic ? 'تعديل' : 'Modifier'}>
                            <IconButton size="small" sx={{ color: '#2c3e50', p: 0.5 }} onClick={() => { setSelectedProduct(product); setOpenDialog(true); }}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={isArabic ? 'حذف' : 'Supprimer'}>
                            <IconButton size="small" sx={{ color: '#e74c3c', p: 0.5 }} onClick={() => handleDelete(product.id!)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider />
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={filteredProducts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage={isArabic ? 'عدد الصفوف:' : 'Lignes par page:'}
          sx={{ '& .MuiTablePagination-toolbar': { minHeight: 48, fontSize: 12 } }}
        />
      </Paper>

      <ProductDialog open={openDialog} onClose={() => { setOpenDialog(false); setSelectedProduct(null); }} onSave={handleSaveProduct} product={selectedProduct} isArabic={isArabic} />

      {/* Barcode Dialog */}
      <Dialog open={barcodeDialog} onClose={() => setBarcodeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#27ae60', color: 'white', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Print />
            <Typography variant="h6" fontSize={16}>{isArabic ? 'طباعة الباركود' : 'Imprimer Code-barres'}</Typography>
          </Box>
          <IconButton onClick={() => setBarcodeDialog(false)} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedForBarcode && (
            <>
              <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: '#ecf0f1' }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, fontSize: 14 }}>{selectedForBarcode.designation}</Typography>
                <Divider sx={{ my: 1 }} />
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" fontSize={11}><strong>{isArabic ? 'الباركود:' : 'Code-barre:'}</strong></Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 12 }}>{selectedForBarcode.barcode}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" fontSize={11}><strong>{isArabic ? 'السعر:' : 'Prix:'}</strong></Typography>
                    <Typography variant="body2" sx={{ color: '#27ae60', fontWeight: 'bold', fontSize: 14 }}>{selectedForBarcode.prixVente1.toFixed(2)} DA</Typography>
                  </Grid>
                </Grid>
              </Paper>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ mb: 0.5, fontWeight: 600, fontSize: 12 }}>{isArabic ? 'عرض السعر' : 'Affichage Prix'}</Typography>
                <RadioGroup value={priceDisplay} onChange={(e) => setPriceDisplay(e.target.value as any)}>
                  <FormControlLabel value="detail" control={<Radio size="small" />} label={<Typography fontSize={12}>{isArabic ? 'التفاصيل' : 'Détail'}</Typography>} />
                  <FormControlLabel value="gros" control={<Radio size="small" />} label={<Typography fontSize={12}>{isArabic ? 'الجملة' : 'Gros'}</Typography>} />
                  <FormControlLabel value="price-only" control={<Radio size="small" />} label={<Typography fontSize={12}>{isArabic ? 'بدون سعر' : 'Sans prix'}</Typography>} />
                </RadioGroup>
              </FormControl>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                <IconButton color="primary" onClick={() => setPrintQuantity(Math.max(0, printQuantity - 1))} disabled={printQuantity <= 0} size="small">
                  <Remove />
                </IconButton>
                <TextField
                  label={isArabic ? 'عدد النسخ' : 'Nombre de copies'}
                  type="number"
                  value={printQuantity}
                  onChange={(e) => setPrintQuantity(Math.max(0, Number(e.target.value)))}
                  inputProps={{ min: 0, max: 100, style: { textAlign: 'center', fontSize: 16, fontWeight: 'bold' } }}
                  size="small"
                  sx={{ width: 130 }}
                />
                <IconButton color="primary" onClick={() => setPrintQuantity(printQuantity + 1)} size="small">
                  <Add />
                </IconButton>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setBarcodeDialog(false)} variant="outlined" size="small" sx={{ textTransform: 'none', fontSize: 12 }}>
            {isArabic ? 'إلغاء' : 'Annuler'}
          </Button>
          <Button onClick={handlePrintBarcode} variant="contained" startIcon={<Print />} disabled={printQuantity <= 0} size="small" sx={{ bgcolor: '#27ae60', '&:hover': { bgcolor: '#229954' }, textTransform: 'none', fontSize: 12 }}>
            {isArabic ? 'طباعة' : 'Imprimer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stock Correction Dialog */}
      <Dialog open={stockCorrectionDialog} onClose={() => setStockCorrectionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#f39c12', color: 'white', fontWeight: 'bold', py: 1.5, fontSize: 16 }}>
          {isArabic ? 'تصحيح المخزون' : 'Correction de Stock'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedForStockCorrection && (
            <>
              <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: '#fff3e0' }}>
                <Typography variant="subtitle1" fontWeight="bold" fontSize={14}>{selectedForStockCorrection.designation}</Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" fontSize={12}>
                  <strong>{isArabic ? 'المخزون الحالي:' : 'Stock actuel:'}</strong> {selectedForStockCorrection.stock}
                </Typography>
              </Paper>

              <TextField
                fullWidth
                size="small"
                label={isArabic ? 'المخزون الجديد' : 'Nouveau stock'}
                type="number"
                value={newStockValue}
                onChange={(e) => setNewStockValue(Number(e.target.value))}
                inputProps={{ min: 0 }}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                size="small"
                label={isArabic ? 'سبب التصحيح' : 'Raison de correction'}
                multiline
                rows={2}
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                placeholder={isArabic ? 'اختياري...' : 'Optionnel...'}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setStockCorrectionDialog(false)} variant="outlined" size="small" sx={{ textTransform: 'none', fontSize: 12 }}>
            {isArabic ? 'إلغاء' : 'Annuler'}
          </Button>
          <Button onClick={handleSaveStockCorrection} variant="contained" size="small" sx={{ bgcolor: '#f39c12', '&:hover': { bgcolor: '#e67e22' }, textTransform: 'none', fontSize: 12 }}>
            {isArabic ? 'حفظ' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Product Stats Dialog */}
      <Dialog open={productStatsDialog} onClose={() => setProductStatsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#e74c3c', color: 'white', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5 }}>
          <Typography variant="h6" fontSize={16}>{isArabic ? 'إحصائيات المنتج' : 'Statistiques Produit'}</Typography>
          <IconButton onClick={() => setProductStatsDialog(false)} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <Tabs value={statsTab} onChange={(e, v) => setStatsTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={<Typography fontSize={12}>{isArabic ? 'المعلومات' : 'Info'}</Typography>} />
          <Tab label={<Typography fontSize={12}>{isArabic ? 'سجل البيع' : 'Histo. Vente'}</Typography>} />
          <Tab label={<Typography fontSize={12}>{isArabic ? 'سجل الشراء' : 'Histo. Achats'}</Typography>} />
        </Tabs>

        <DialogContent sx={{ mt: 2 }}>
          {selectedProductStats && (
            <>
              {statsTab === 0 && (
                <Grid container spacing={1.5}>
                  <Grid item xs={6}>
                    <TextField fullWidth size="small" label={isArabic ? 'الكود' : 'Réf.'} value={selectedProductStats.ref} disabled InputProps={{ sx: { fontSize: 12 } }} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth size="small" label={isArabic ? 'سعر الشراء' : 'Prix d\'achat'} value={`${selectedProductStats.prixAchat.toFixed(2)} DA`} disabled InputProps={{ sx: { fontSize: 12 } }} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth size="small" label={isArabic ? 'سعر البيع 1' : 'Prix 01'} value={`${selectedProductStats.prixVente1.toFixed(2)} DA`} disabled InputProps={{ sx: { fontSize: 12 } }} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth size="small" label={isArabic ? 'سعر البيع 2' : 'Prix 02'} value={`${selectedProductStats.prixVente2.toFixed(2)} DA`} disabled InputProps={{ sx: { fontSize: 12 } }} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth size="small" label={isArabic ? 'سعر البيع 3' : 'Prix 03'} value={`${selectedProductStats.prixVente3.toFixed(2)} DA`} disabled InputProps={{ sx: { fontSize: 12 } }} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth size="small" label={isArabic ? 'آخر بيع' : 'Derniere vente'} value={new Date().toLocaleDateString()} disabled InputProps={{ sx: { fontSize: 12 } }} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth size="small" label={isArabic ? 'كمية المشتريات' : 'Quantité achats'} value={0} disabled InputProps={{ sx: { fontSize: 12 } }} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth size="small" label={isArabic ? 'كمية مباعة' : 'Quantité vendue'} value={0} disabled InputProps={{ sx: { fontSize: 12 } }} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth size="small" label={isArabic ? 'مرتجع العميل' : 'Retour client'} value={0} disabled InputProps={{ sx: { fontSize: 12 } }} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth size="small" label={isArabic ? 'مرتجع المورد' : 'Retour fournisse...'} value={0} disabled InputProps={{ sx: { fontSize: 12 } }} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth size="small" label={isArabic ? 'الكمية المتاحة' : 'Quantité disponible'} value={selectedProductStats.stock} disabled InputProps={{ sx: { fontSize: 12 } }} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth size="small" label={isArabic ? 'المورد' : 'Fournisseur'} value={selectedProductStats.fournisseur || 'INCONNU'} disabled InputProps={{ sx: { fontSize: 12 } }} />
                  </Grid>
                </Grid>
              )}

              {statsTab === 1 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="textSecondary" fontSize={14}>{isArabic ? 'لا توجد بيانات للبيع' : 'Aucune donnée de vente'}</Typography>
                </Box>
              )}

              {statsTab === 2 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="textSecondary" fontSize={14}>{isArabic ? 'لا توجد بيانات للشراء' : 'Aucune donnée d\'achat'}</Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled" sx={{ fontSize: 13 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductList;
