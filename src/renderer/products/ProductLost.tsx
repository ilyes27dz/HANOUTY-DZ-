// src/renderer/products/ProductLost.tsx
import React, { useState, useEffect } from 'react';
import {
  Box, IconButton, Card, CardContent, Typography, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Paper,
  Snackbar, Alert, Grid, Chip, InputAdornment, Fade, Autocomplete
} from '@mui/material';
import {
  Delete, Add, Close, Search, Refresh, AccessTime, ArrowBack, Warning
} from '@mui/icons-material';

// ✅ القديم (الصحيح):
// ✅ استخدم window.electron بدلاً من window.require
declare global {
  interface Window {
    electron: any;
  }
}

// ثم استخدم:
const electron = window.electron;

;

interface Product {
  id: number;
  designation: string;
  barcode?: string;
  prixAchat: number;
  stock: number;
}

interface LostProduct {
  id?: number;
  productName: string;
  quantity: number;
  reason: string;
  date: string;
  estimatedLoss: number;
}

interface ProductLostProps {
  isArabic: boolean;
  onBack?: () => void;
}

const ProductLost: React.FC<ProductLostProps> = ({ isArabic, onBack }) => {
  const [lostProducts, setLostProducts] = useState<LostProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<LostProduct[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  
  const [formData, setFormData] = useState<LostProduct>({
    productName: '',
    quantity: 0,
    reason: '',
    date: new Date().toISOString().split('T')[0],
    estimatedLoss: 0
  });

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
    loadLostProducts();
    loadAllProducts();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredProducts(lostProducts);
      return;
    }
    const filtered = lostProducts.filter(p =>
      p.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.reason.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, lostProducts]);

  // ✅ جلب جميع المنتجات من قاعدة البيانات
  const loadAllProducts = async () => {
    try {
const data = await window.electron.getProducts();
      setAllProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadLostProducts = async () => {
    try {
const data = await window.electron.getLostProducts();
      setLostProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error loading lost products:', error);
      setSnackbar({
        open: true,
        message: isArabic ? '❌ خطأ في تحميل البيانات' : '❌ Erreur de chargement',
        severity: 'error'
      });
    }
  };

  const handleAdd = async () => {
    if (!formData.productName || formData.quantity <= 0) {
      setSnackbar({
        open: true,
        message: isArabic ? '⚠️ املأ جميع الحقول المطلوبة' : '⚠️ Remplissez tous les champs',
        severity: 'error'
      });
      return;
    }

    try {
await window.electron.addLostProduct(formData);
      await loadLostProducts();
      setOpenDialog(false);
      setSelectedProduct(null);
      setFormData({
        productName: '',
        quantity: 0,
        reason: '',
        date: new Date().toISOString().split('T')[0],
        estimatedLoss: 0
      });

      setSnackbar({
        open: true,
        message: isArabic ? '✅ تم إضافة المنتج التالف' : '✅ Produit perdu ajouté',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error adding lost product:', error);
      setSnackbar({
        open: true,
        message: isArabic ? '❌ خطأ في الإضافة' : '❌ Erreur d\'ajout',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(isArabic ? 'هل تريد حذف هذا السجل؟' : 'Supprimer cet enregistrement?')) return;

    try {
await window.electron.deleteLostProduct(id);
      await loadLostProducts();
      setSnackbar({
        open: true,
        message: isArabic ? '✅ تم الحذف' : '✅ Supprimé',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting lost product:', error);
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

  const totalLoss = filteredProducts.reduce((sum, p) => sum + p.estimatedLoss, 0);
  const totalQuantity = filteredProducts.reduce((sum, p) => sum + p.quantity, 0);

  // ✅ عند اختيار منتج من القائمة
  const handleProductSelect = (product: Product | null) => {
    setSelectedProduct(product);
    if (product) {
      setFormData({
        ...formData,
        productName: product.designation,
        estimatedLoss: product.prixAchat * formData.quantity
      });
    }
  };

  // ✅ عند تغيير الكمية
  const handleQuantityChange = (qty: number) => {
    setFormData({
      ...formData,
      quantity: qty,
      estimatedLoss: selectedProduct ? selectedProduct.prixAchat * qty : formData.estimatedLoss
    });
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#ecf0f1', minHeight: '100vh', overflowY: 'auto' }}>
      {onBack && (
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
          {isArabic ? 'رجوع' : 'Retour'}
        </Button>
      )}

      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2,
        p: 1.5,
        background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
        borderRadius: 2,
        boxShadow: 4,
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTime />
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            {formatDateTime(currentDateTime)}
          </Typography>
        </Box>
        <Chip
          label={`${filteredProducts.length} ${isArabic ? 'سجل' : 'enregistrements'}`}
          sx={{
            fontSize: 14,
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
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: 12 }}>
                {isArabic ? 'إجمالي السجلات' : 'Total'}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                {filteredProducts.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={4}>
          <Card sx={{
            background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
            color: 'white',
            borderRadius: 2
          }}>
            <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: 12 }}>
                {isArabic ? 'الكمية المفقودة' : 'Quantité'}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                {totalQuantity}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={4}>
          <Card sx={{
            background: 'linear-gradient(135deg, #c0392b 0%, #8e44ad 100%)',
            color: 'white',
            borderRadius: 2
          }}>
            <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: 12 }}>
                {isArabic ? 'الخسارة' : 'Perte'}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                {totalLoss.toFixed(0)} DA
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={4} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder={isArabic ? 'ابحث...' : 'Rechercher...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenDialog(true)}
              sx={{
                background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                fontWeight: 'bold'
              }}
            >
              {isArabic ? 'إضافة' : 'Ajouter'}
            </Button>
          </Grid>
          <Grid item xs={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Refresh />}
              onClick={loadLostProducts}
              sx={{
                background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                fontWeight: 'bold'
              }}
            >
              {isArabic ? 'تحديث' : 'Actualiser'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Fade in timeout={500}>
        <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 2, maxHeight: 500 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', bgcolor: '#e74c3c' }}>#</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', bgcolor: '#e74c3c' }}>
                  {isArabic ? 'المنتج' : 'Produit'}
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', bgcolor: '#e74c3c' }}>
                  {isArabic ? 'الكمية' : 'Quantité'}
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', bgcolor: '#e74c3c' }}>
                  {isArabic ? 'السبب' : 'Raison'}
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', bgcolor: '#e74c3c' }}>
                  {isArabic ? 'التاريخ' : 'Date'}
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', bgcolor: '#e74c3c' }}>
                  {isArabic ? 'الخسارة' : 'Perte'}
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', bgcolor: '#e74c3c' }}>
                  {isArabic ? 'الإجراءات' : 'Actions'}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => (
                  <TableRow
                    key={product.id}
                    hover
                    sx={{ '&:hover': { backgroundColor: '#ffe6e6' } }}
                  >
                    <TableCell sx={{ fontWeight: 'bold' }}>{index + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                      {product.productName}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.quantity}
                        color="error"
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#7f8c8d' }}>{product.reason}</TableCell>
                    <TableCell>{product.date}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#e74c3c' }}>
                      {product.estimatedLoss.toFixed(2)} DA
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => product.id && handleDelete(product.id)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                    <Warning sx={{ fontSize: 50, color: '#e74c3c', mb: 1 }} />
                    <Typography variant="h6" color="text.secondary">
                      {isArabic ? 'لا توجد سجلات' : 'Aucun enregistrement'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Fade>

      {/* ✅ نافذة إضافة مع Autocomplete */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
          color: 'white',
          fontWeight: 'bold'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {isArabic ? 'إضافة منتج تالف' : 'Ajouter Produit Perdu'}
            </Typography>
            <IconButton onClick={() => setOpenDialog(false)} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {/* ✅ Autocomplete للبحث عن المنتجات */}
          <Autocomplete
            options={allProducts}
            getOptionLabel={(option) => option.designation}
            value={selectedProduct}
            onChange={(event, newValue) => handleProductSelect(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label={isArabic ? 'ابحث عن المنتج' : 'Rechercher le produit'}
                placeholder={isArabic ? 'اكتب للبحث...' : 'Tapez pour rechercher...'}
                fullWidth
                required
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{option.designation}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {isArabic ? 'السعر:' : 'Prix:'} {option.prixAchat.toFixed(2)} DA | 
                  {isArabic ? ' المخزون:' : ' Stock:'} {option.stock}
                </Typography>
              </Box>
            )}
            noOptionsText={isArabic ? 'لا توجد منتجات' : 'Aucun produit'}
            sx={{ mb: 2 }}
          />

          {selectedProduct && (
            <Box sx={{ mb: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {isArabic ? 'السعر:' : 'Prix:'} <strong>{selectedProduct.prixAchat.toFixed(2)} DA</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isArabic ? 'المخزون المتاح:' : 'Stock disponible:'} <strong>{selectedProduct.stock}</strong>
              </Typography>
            </Box>
          )}

          <TextField
            fullWidth
            label={isArabic ? 'الكمية المفقودة' : 'Quantité à détruire'}
            type="number"
            value={formData.quantity}
            onChange={(e) => handleQuantityChange(Number(e.target.value))}
            sx={{ mb: 2 }}
            required
          />

          <TextField
            fullWidth
            label={isArabic ? 'السبب' : 'Raison de la destruction'}
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label={isArabic ? 'التاريخ' : 'Date'}
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />

          <Box sx={{ 
            p: 2, 
            backgroundColor: '#000', 
            borderRadius: 1, 
            textAlign: 'center',
            mb: 2
          }}>
            <Typography variant="caption" sx={{ color: 'yellow', fontWeight: 'bold' }}>
              Total
            </Typography>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
              {formData.estimatedLoss.toFixed(2)} DA
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setOpenDialog(false)}
            variant="outlined"
            sx={{ fontWeight: 'bold' }}
          >
            {isArabic ? 'إلغاء' : 'Annuler'}
          </Button>
          <Button
            onClick={handleAdd}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
              fontWeight: 'bold'
            }}
          >
            {isArabic ? 'حفظ' : 'Destruction'}
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

export default ProductLost;
