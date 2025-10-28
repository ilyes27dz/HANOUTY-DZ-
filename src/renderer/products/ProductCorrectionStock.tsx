// src/renderer/products/ProductCorrectionStock.tsx
import React, { useState, useEffect } from 'react';
import {
  Box, IconButton, Card, CardContent, Typography, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, Chip, Paper,
  Snackbar, Grid, InputAdornment, Fade
} from '@mui/material';
import { ArrowBack, Inventory, Edit, Delete, Save, Search, AccessTime } from '@mui/icons-material';

interface Product {
  id: number;
  designation: string;
  barcode?: string;
  stock: number;
  stockMin: number;
  prixAchat: number;
  prixVente1: number;
}

interface StockCorrection {
  id: number;
  date: string;
  productId: number;
  productName: string;
  oldQuantity: number;
  newQuantity: number;
  difference: number;
  reason: string;
  user: string;
  purchaseValue: number;
  saleValue: number;
}

interface ProductCorrectionProps {
  isArabic: boolean;
  onBack: () => void;
}

const ProductCorrection: React.FC<ProductCorrectionProps> = ({ isArabic, onBack }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [corrections, setCorrections] = useState<StockCorrection[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filteredCorrections, setFilteredCorrections] = useState<StockCorrection[]>([]);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newQuantity, setNewQuantity] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState<'today' | 'yesterday' | 'all'>('today');
  
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadProducts();
    loadCorrections();
  }, []);

  useEffect(() => {
    // Filter products
    if (searchTerm) {
      setFilteredProducts(products.filter(p => 
        p.designation.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  useEffect(() => {
    const filtered = corrections.filter(c => {
      const correctionDate = new Date(c.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (filterDate === 'today') {
        return correctionDate >= today;
      } else if (filterDate === 'yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return correctionDate >= yesterday && correctionDate < today;
      }
      return true;
    });
    setFilteredCorrections(filtered);
  }, [corrections, filterDate]);

  const loadProducts = async () => {
    try {
      const data = await window.electron.getProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadCorrections = async () => {
    try {
      const data = await window.electron.getStockCorrections();
      setCorrections(data || []);
    } catch (error) {
      console.error('Error loading corrections:', error);
      setCorrections([]);
    }
  };

  const handleOpenDialog = (product: Product) => {
    setSelectedProduct(product);
    setNewQuantity(product.stock);
    setReason('');
    setOpenDialog(true);
  };

  const handleSaveCorrection = async () => {
    if (!selectedProduct) return;

    if (newQuantity === selectedProduct.stock) {
      setSnackbar({
        open: true,
        message: isArabic ? '⚠️ الكمية لم تتغير' : "⚠️ La quantité n'a pas changé",
        severity: 'error'
      });
      return;
    }

    if (!reason.trim()) {
      setSnackbar({
        open: true,
        message: isArabic ? '⚠️ أدخل سبب التصحيح' : '⚠️ Entrez une raison',
        severity: 'error'
      });
      return;
    }

    try {
      const difference = newQuantity - selectedProduct.stock;
      const purchaseValue = Math.abs(difference) * selectedProduct.prixAchat;
      const saleValue = Math.abs(difference) * selectedProduct.prixVente1;

      // ✅ حفظ تصحيح المخزون
      const newCorrection = {
        date: new Date().toISOString(),
        productId: selectedProduct.id,
        productName: selectedProduct.designation,
        oldQuantity: selectedProduct.stock,
        newQuantity: newQuantity,
        difference: difference,
        reason: reason,
        user: 'ADMIN',
        purchaseValue: purchaseValue,
        saleValue: saleValue
      };

      await window.electron.addStockCorrection(newCorrection);

      // ✅ تحديث المخزون
      const updatedProduct = {
        ...selectedProduct,
        stock: newQuantity
      };
      await window.electron.updateProduct(updatedProduct);

      await loadProducts();
      await loadCorrections();

      setSnackbar({
        open: true,
        message: isArabic ? '✅ تم تصحيح المخزون بنجاح!' : '✅ Stock corrigé avec succès!',
        severity: 'success'
      });
      
      setOpenDialog(false);
      setSelectedProduct(null);
      setReason('');
      setNewQuantity(0);
    } catch (error) {
      console.error('Error saving correction:', error);
      setSnackbar({
        open: true,
        message: isArabic ? '❌ خطأ في الحفظ' : '❌ Erreur de sauvegarde',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(isArabic ? 'هل تريد حذف هذا السجل؟' : 'Voulez-vous supprimer cet enregistrement?')) return;

    try {
      await window.electron.deleteStockCorrection(id);
      await loadCorrections();
      setSnackbar({
        open: true,
        message: isArabic ? '✅ تم الحذف' : '✅ Supprimé',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting correction:', error);
      setSnackbar({
        open: true,
        message: isArabic ? '❌ خطأ في الحذف' : '❌ Erreur de suppression',
        severity: 'error'
      });
    }
  };

  const formatDateTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    return date.toLocaleDateString(isArabic ? 'ar-DZ' : 'fr-FR', options);
  };

  const totalPurchaseValue = filteredCorrections.reduce((sum, c) => sum + c.purchaseValue, 0);
  const totalSaleValue = filteredCorrections.reduce((sum, c) => sum + c.saleValue, 0);

  return (
    <Box sx={{ 
      p: 2, 
      backgroundColor: '#ecf0f1', 
      minHeight: '100vh',
      maxHeight: '100vh', // ✅ الحل!
      overflow: 'auto'     // ✅ الحل!
    }}>
      <Button
        variant="contained"
        startIcon={<ArrowBack />}
        onClick={onBack}
        sx={{
          mb: 2,
          background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
          fontWeight: 'bold'
        }}
      >
        {isArabic ? 'رجوع' : 'RETOUR'}
      </Button>

      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2,
        p: 1.5,
        background: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)',
        borderRadius: 2,
        boxShadow: 4,
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: 13 }}>
            {formatDateTime(currentDateTime)}
          </Typography>
        </Box>
        <Chip
          icon={<Inventory />}
          label={`${filteredCorrections.length} ${isArabic ? 'تصحيح' : 'corrections'}`}
          sx={{
            fontSize: 12,
            fontWeight: 'bold',
            px: 1.5,
            backgroundColor: 'white',
            color: '#e74c3c'
          }}
        />
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={4}>
          <Card sx={{
            background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
            color: 'white',
            borderRadius: 2
          }}>
            <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: 11 }}>
                {isArabic ? 'إجمالي التصحيحات' : 'Total Corrections'}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                {filteredCorrections.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={4}>
          <Card sx={{
            background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
            color: 'white',
            borderRadius: 2
          }}>
            <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: 11 }}>
                {isArabic ? 'قيمة الشراء' : 'Valeur Achats'}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                {totalPurchaseValue.toFixed(0)} DA
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={4}>
          <Card sx={{
            background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
            color: 'white',
            borderRadius: 2
          }}>
            <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: 11 }}>
                {isArabic ? 'قيمة البيع' : 'Valeur Ventes'}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                {totalSaleValue.toFixed(0)} DA
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={4} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[
                { id: 'today', labelFr: "Aujourd'hui", color: '#27ae60' },
                { id: 'yesterday', labelFr: 'Hier', color: '#f39c12' },
                { id: 'all', labelFr: 'Tout', color: '#3498db' }
              ].map((filter) => (
                <Button
                  key={filter.id}
                  variant={filterDate === filter.id ? 'contained' : 'outlined'}
                  onClick={() => setFilterDate(filter.id as any)}
                  size="small"
                  sx={{
                    flex: 1,
                    fontSize: 11,
                    backgroundColor: filterDate === filter.id ? filter.color : 'transparent',
                    color: filterDate === filter.id ? '#fff' : filter.color,
                    borderColor: filter.color,
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: filterDate === filter.id ? filter.color : `${filter.color}20`
                    }
                  }}
                >
                  {filter.labelFr}
                </Button>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder={isArabic ? 'ابحث عن منتج...' : 'Rechercher un produit...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* ✅ جدول المنتجات */}
      <Fade in timeout={500}>
        <Card sx={{ mb: 2, boxShadow: 2 }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer sx={{ maxHeight: 200 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ py: 0.5, fontSize: '11px', fontWeight: 'bold', backgroundColor: '#34495e', color: '#fff' }}>
                      CODE
                    </TableCell>
                    <TableCell sx={{ py: 0.5, fontSize: '11px', fontWeight: 'bold', backgroundColor: '#34495e', color: '#fff' }}>
                      {isArabic ? 'المنتج' : 'Produit'}
                    </TableCell>
                    <TableCell sx={{ py: 0.5, fontSize: '11px', fontWeight: 'bold', backgroundColor: '#34495e', color: '#fff' }}>
                      {isArabic ? 'المخزون' : 'Qnté Disponible'}
                    </TableCell>
                    <TableCell sx={{ py: 0.5, fontSize: '11px', fontWeight: 'bold', backgroundColor: '#34495e', color: '#fff' }}>
                      {isArabic ? 'إجراء' : 'Action'}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} hover>
                      <TableCell sx={{ py: 0.5, fontSize: '10px' }}>{product.id}</TableCell>
                      <TableCell sx={{ py: 0.5, fontSize: '10px', fontWeight: 'bold' }}>{product.designation}</TableCell>
                      <TableCell sx={{ py: 0.5 }}>
                        <Chip 
                          label={product.stock.toFixed(2)} 
                          size="small"
                          color={product.stock > product.stockMin ? 'success' : 'error'}
                          sx={{ fontSize: 10, height: 22 }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 0.5 }}>
                        <IconButton size="small" color="primary" onClick={() => handleOpenDialog(product)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Fade>

      {/* ✅ جدول سجل التصحيحات */}
      <Fade in timeout={500}>
        <Card sx={{ boxShadow: 2 }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ backgroundColor: '#34495e', color: '#fff', px: 2, py: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: 12 }}>
                {isArabic ? 'سجل التصحيحات' : 'Liste Correcte stock'}
              </Typography>
            </Box>
            <TableContainer sx={{ maxHeight: 250 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ py: 0.5, fontSize: '10px', fontWeight: 'bold', backgroundColor: '#34495e', color: '#fff' }}>
                      CODE
                    </TableCell>
                    <TableCell sx={{ py: 0.5, fontSize: '10px', fontWeight: 'bold', backgroundColor: '#34495e', color: '#fff' }}>
                      {isArabic ? 'التاريخ' : 'Date correction'}
                    </TableCell>
                    <TableCell sx={{ py: 0.5, fontSize: '10px', fontWeight: 'bold', backgroundColor: '#34495e', color: '#fff' }}>
                      {isArabic ? 'المنتج' : 'Produit'}
                    </TableCell>
                    <TableCell sx={{ py: 0.5, fontSize: '10px', fontWeight: 'bold', backgroundColor: '#34495e', color: '#ffd700' }}>
                      {isArabic ? 'القديم' : 'Qté Ancien'}
                    </TableCell>
                    <TableCell sx={{ py: 0.5, fontSize: '10px', fontWeight: 'bold', backgroundColor: '#34495e', color: '#ffd700' }}>
                      {isArabic ? 'الجديد' : 'Qté Correct'}
                    </TableCell>
                    <TableCell sx={{ py: 0.5, fontSize: '10px', fontWeight: 'bold', backgroundColor: '#34495e', color: '#ffd700' }}>
                      {isArabic ? 'الفرق' : 'Qté Deff'}
                    </TableCell>
                    <TableCell sx={{ py: 0.5, fontSize: '10px', fontWeight: 'bold', backgroundColor: '#34495e', color: '#fff' }}>
                      {isArabic ? 'السبب' : 'Motif'}
                    </TableCell>
                    <TableCell sx={{ py: 0.5, fontSize: '10px', fontWeight: 'bold', backgroundColor: '#34495e', color: '#fff' }}>
                      Par
                    </TableCell>
                    <TableCell sx={{ py: 0.5, fontSize: '10px', fontWeight: 'bold', backgroundColor: '#34495e', color: '#fff' }}>
                      {isArabic ? 'حذف' : 'Suppr'}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCorrections.map((correction) => (
                    <TableRow key={correction.id} hover>
                      <TableCell sx={{ py: 0.5, fontSize: '9px' }}>{correction.id}</TableCell>
                      <TableCell sx={{ py: 0.5, fontSize: '9px' }}>
                        {new Date(correction.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell sx={{ py: 0.5, fontSize: '9px', fontWeight: 'bold' }}>
                        {correction.productName}
                      </TableCell>
                      <TableCell sx={{ py: 0.5, fontSize: '9px', color: '#ffd700', fontWeight: 'bold' }}>
                        {correction.oldQuantity.toFixed(2)}
                      </TableCell>
                      <TableCell sx={{ py: 0.5, fontSize: '9px', color: '#4CAF50', fontWeight: 'bold' }}>
                        {correction.newQuantity.toFixed(2)}
                      </TableCell>
                      <TableCell sx={{ py: 0.5, fontSize: '9px', fontWeight: 'bold' }}>
                        <Chip
                          label={correction.difference.toFixed(2)}
                          size="small"
                          color={correction.difference >= 0 ? 'success' : 'error'}
                          sx={{ fontSize: '9px', height: 18 }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 0.5, fontSize: '9px' }}>{correction.reason}</TableCell>
                      <TableCell sx={{ py: 0.5, fontSize: '9px' }}>{correction.user}</TableCell>
                      <TableCell sx={{ py: 0.5, textAlign: 'center' }}>
                        <IconButton size="small" color="error" onClick={() => handleDelete(correction.id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Fade>

      {/* ✅ نافذة التصحيح */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#34495e', color: '#fff', py: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Inventory />
            <Typography variant="h6" sx={{ fontSize: '15px' }}>
              {isArabic ? 'تصحيح المخزون' : 'Correction des stocks'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedProduct && (
            <Box>
              <Box sx={{ backgroundColor: '#ecf0f1', p: 2, borderRadius: 1, mb: 2, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  {selectedProduct.designation}
                </Typography>
              </Box>

              <TextField
                fullWidth
                label={isArabic ? 'المخزون الحالي' : 'Qnté Disponible'}
                value={selectedProduct.stock.toFixed(2)}
                disabled
                sx={{ mb: 2 }}
                size="small"
              />

              <TextField
                fullWidth
                label={isArabic ? 'المخزون الجديد (Pcs)' : 'Nouvelle quantité (Pcs)'}
                type="number"
                value={newQuantity}
                onChange={(e) => setNewQuantity(parseFloat(e.target.value) || 0)}
                sx={{ mb: 2 }}
                size="small"
                inputProps={{ step: 0.01 }}
              />

              <TextField
                fullWidth
                label={isArabic ? 'سبب التعديل' : 'Motif de modification'}
                multiline
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                size="small"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} color="inherit">
            {isArabic ? 'إلغاء' : 'Annuler'}
          </Button>
          <Button
            onClick={handleSaveCorrection}
            variant="contained"
            startIcon={<Save />}
            sx={{ backgroundColor: '#3498db', '&:hover': { backgroundColor: '#2980b9' } }}
          >
            {isArabic ? 'حفظ' : 'Validé (Entrée)'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%', fontWeight: 'bold' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductCorrection;
