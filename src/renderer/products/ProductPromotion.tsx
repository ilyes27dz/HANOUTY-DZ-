// src/renderer/products/ProductPromotion.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Box, IconButton, Card, CardContent, Typography, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Paper,
  Snackbar, Alert, Grid, Chip, InputAdornment, Fade, Autocomplete, Checkbox
} from '@mui/material';
import {
  Delete, Add, Close, Search, Refresh, AccessTime, ArrowBack, LocalOffer, Print
} from '@mui/icons-material';

interface Product {
  id: number;
  designation: string;
  prixVente1: number;
  stock: number;
}

interface Promotion {
  id?: number;
  productName: string;
  productId: number;
  originalPrice: number;
  discountPercent: number;
  newPrice: number;
  startDate: string;
  endDate: string;
  active: boolean;
}

interface ProductPromotionProps {
  isArabic: boolean;
  onBack?: () => void;
}

const ProductPromotion: React.FC<ProductPromotionProps> = ({ isArabic, onBack }) => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [filteredPromotions, setFilteredPromotions] = useState<Promotion[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedForPrint, setSelectedForPrint] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const printRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState<Promotion>({
    productName: '',
    productId: 0,
    originalPrice: 0,
    discountPercent: 0,
    newPrice: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    active: true
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
    loadPromotions();
    loadAllProducts();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredPromotions(promotions);
      return;
    }
    const filtered = promotions.filter(p =>
      p.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPromotions(filtered);
  }, [searchTerm, promotions]);

  const loadAllProducts = async () => {
    try {
      const data = await window.electron.getProducts();
      setAllProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  // ✅ تحميل العروض من localStorage بدلاً من البيانات الوهمية
  const loadPromotions = () => {
    try {
      const savedPromotions = localStorage.getItem('promotions');
      if (savedPromotions) {
        const data = JSON.parse(savedPromotions);
        setPromotions(data);
        setFilteredPromotions(data);
      } else {
        setPromotions([]);
        setFilteredPromotions([]);
      }
    } catch (error) {
      console.error('Error loading promotions:', error);
      setPromotions([]);
      setFilteredPromotions([]);
    }
  };

  // ✅ حفظ العروض في localStorage
  const savePromotions = (updatedPromotions: Promotion[]) => {
    try {
      localStorage.setItem('promotions', JSON.stringify(updatedPromotions));
      setPromotions(updatedPromotions);
      setFilteredPromotions(updatedPromotions);
    } catch (error) {
      console.error('Error saving promotions:', error);
    }
  };

  const handleProductSelect = (product: Product | null) => {
    setSelectedProduct(product);
    if (product) {
      setFormData({
        ...formData,
        productName: product.designation,
        productId: product.id,
        originalPrice: product.prixVente1,
        newPrice: product.prixVente1 - (product.prixVente1 * formData.discountPercent / 100)
      });
    }
  };

  const handleDiscountChange = (discount: number) => {
    if (selectedProduct) {
      const newPrice = selectedProduct.prixVente1 - (selectedProduct.prixVente1 * discount / 100);
      setFormData({
        ...formData,
        discountPercent: discount,
        newPrice: newPrice
      });
    }
  };

  const handleAdd = () => {
    if (!selectedProduct || formData.discountPercent <= 0) {
      setSnackbar({
        open: true,
        message: isArabic ? '⚠️ املأ جميع الحقول المطلوبة' : '⚠️ Remplissez tous les champs',
        severity: 'error'
      });
      return;
    }

    const newPromotion: Promotion = {
      id: Date.now(),
      ...formData
    };

    const updatedPromotions = [...promotions, newPromotion];
    savePromotions(updatedPromotions);
    
    setOpenDialog(false);
    setSelectedProduct(null);
    setFormData({
      productName: '',
      productId: 0,
      originalPrice: 0,
      discountPercent: 0,
      newPrice: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      active: true
    });

    setSnackbar({
      open: true,
      message: isArabic ? '✅ تم إضافة العرض' : '✅ Promotion ajoutée',
      severity: 'success'
    });
  };

  const handleDelete = (id: number) => {
    if (!window.confirm(isArabic ? 'هل تريد حذف هذا العرض؟' : 'Supprimer cette promotion?')) return;

    const updatedPromotions = promotions.filter(p => p.id !== id);
    savePromotions(updatedPromotions);
    
    setSnackbar({
      open: true,
      message: isArabic ? '✅ تم الحذف' : '✅ Supprimé',
      severity: 'success'
    });
  };

  const handleSelectForPrint = (id: number) => {
    if (selectedForPrint.includes(id)) {
      setSelectedForPrint(selectedForPrint.filter(i => i !== id));
    } else {
      setSelectedForPrint([...selectedForPrint, id]);
    }
  };

  const handleSelectAllForPrint = () => {
    if (selectedForPrint.length === filteredPromotions.length) {
      setSelectedForPrint([]);
    } else {
      setSelectedForPrint(filteredPromotions.map(p => p.id!));
    }
  };

  const handlePrint = () => {
    if (selectedForPrint.length === 0) {
      setSnackbar({
        open: true,
        message: isArabic ? '⚠️ اختر عروض للطباعة' : '⚠️ Sélectionnez des promotions',
        severity: 'error'
      });
      return;
    }

    const printWindow = window.open('', '', 'height=800,width=1200');
    if (!printWindow) return;

    const selectedPromotions = promotions.filter(p => selectedForPrint.includes(p.id!));

    printWindow.document.write(`
      <html>
        <head>
          <title>Promotion Labels</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; }
            .page { display: flex; flex-wrap: wrap; gap: 15px; }
            .label {
              width: 280px;
              height: 200px;
              border: 3px dashed #f39c12;
              border-radius: 15px;
              padding: 15px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              page-break-inside: avoid;
              background: linear-gradient(135deg, #fff9e6 0%, #ffffff 100%);
              box-shadow: 0 4px 10px rgba(0,0,0,0.1);
              position: relative;
              overflow: hidden;
            }
            .label::before {
              content: "🎉 PROMO 🎉";
              position: absolute;
              top: -5px;
              right: -5px;
              background: #e74c3c;
              color: white;
              padding: 5px 15px;
              font-size: 12px;
              font-weight: bold;
              transform: rotate(15deg);
              border-radius: 5px;
            }
            .product-name {
              font-size: 20px;
              font-weight: bold;
              color: #2c3e50;
              text-align: center;
              margin-top: 10px;
              text-transform: uppercase;
            }
            .old-price {
              text-decoration: line-through;
              color: #e74c3c;
              font-size: 24px;
              font-weight: bold;
              text-align: center;
              margin: 5px 0;
            }
            .new-price {
              font-size: 48px;
              font-weight: bold;
              color: #27ae60;
              text-align: center;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
            }
            .discount-badge {
              background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
              color: white;
              padding: 8px 15px;
              border-radius: 25px;
              font-size: 18px;
              font-weight: bold;
              text-align: center;
              margin: 5px 0;
              box-shadow: 0 3px 8px rgba(0,0,0,0.2);
            }
            .validity {
              font-size: 11px;
              color: #7f8c8d;
              text-align: center;
              margin-top: 5px;
              font-style: italic;
            }
            @media print {
              body { padding: 10px; }
              .label { margin-bottom: 15px; }
            }
          </style>
        </head>
        <body>
          <div class="page">
            ${selectedPromotions.map(promo => `
              <div class="label">
                <div class="product-name">${promo.productName}</div>
                <div class="old-price">${promo.originalPrice.toFixed(2)} DA</div>
                <div class="discount-badge">-${promo.discountPercent}%</div>
                <div class="new-price">${promo.newPrice.toFixed(2)} DA</div>
                <div class="validity">Valable jusqu'au ${promo.endDate}</div>
              </div>
            `).join('')}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 100);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
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

  const activePromotions = filteredPromotions.filter(p => p.active).length;
  const totalDiscount = filteredPromotions.reduce((sum, p) => sum + (p.originalPrice - p.newPrice), 0);

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
        background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
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
          label={`${filteredPromotions.length} ${isArabic ? 'عرض' : 'promotions'}`}
          sx={{
            fontSize: 14,
            fontWeight: 'bold',
            px: 1.5,
            backgroundColor: 'white',
            color: '#f39c12'
          }}
        />
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={4}>
          <Card sx={{
            background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
            color: 'white',
            borderRadius: 2
          }}>
            <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: 12 }}>
                {isArabic ? 'إجمالي العروض' : 'Total Promotions'}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                {filteredPromotions.length}
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
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: 12 }}>
                {isArabic ? 'العروض النشطة' : 'Actives'}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                {activePromotions}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={4}>
          <Card sx={{
            background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
            color: 'white',
            borderRadius: 2
          }}>
            <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: 12 }}>
                {isArabic ? 'التخفيض الكلي' : 'Réduction Totale'}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                {totalDiscount.toFixed(0)} DA
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={4} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
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
          <Grid item xs={6} md={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenDialog(true)}
              sx={{
                background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
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
              startIcon={<Print />}
              onClick={handlePrint}
              disabled={selectedForPrint.length === 0}
              sx={{
                background: 'linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)',
                fontWeight: 'bold',
                '&:disabled': { opacity: 0.5 }
              }}
            >
              {isArabic ? `طباعة (${selectedForPrint.length})` : `Imprimer (${selectedForPrint.length})`}
            </Button>
          </Grid>
          <Grid item xs={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleSelectAllForPrint}
              sx={{ fontWeight: 'bold' }}
            >
              {selectedForPrint.length === filteredPromotions.length 
                ? (isArabic ? 'إلغاء الكل' : 'Tout déselect.')
                : (isArabic ? 'تحديد الكل' : 'Tout sélect.')}
            </Button>
          </Grid>
          <Grid item xs={6} md={1}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Refresh />}
              onClick={loadPromotions}
              sx={{
                background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                fontWeight: 'bold'
              }}
            >
              ↻
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Fade in timeout={500}>
        <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 2, maxHeight: 500 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', bgcolor: '#f39c12', width: 50 }}>
                  <Checkbox
                    checked={selectedForPrint.length === filteredPromotions.length && filteredPromotions.length > 0}
                    onChange={handleSelectAllForPrint}
                    sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }}
                  />
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', bgcolor: '#f39c12' }}>#</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', bgcolor: '#f39c12' }}>
                  {isArabic ? 'المنتج' : 'Produit'}
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', bgcolor: '#f39c12' }}>
                  {isArabic ? 'السعر الأصلي' : 'Prix Original'}
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', bgcolor: '#f39c12' }}>
                  {isArabic ? 'التخفيض' : 'Remise'}
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', bgcolor: '#f39c12' }}>
                  {isArabic ? 'السعر الجديد' : 'Nouveau Prix'}
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', bgcolor: '#f39c12' }}>
                  {isArabic ? 'صالح حتى' : 'Valable jusqu\'à'}
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', bgcolor: '#f39c12' }}>
                  {isArabic ? 'الحالة' : 'Statut'}
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', bgcolor: '#f39c12' }}>
                  {isArabic ? 'الإجراءات' : 'Actions'}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPromotions.length > 0 ? (
                filteredPromotions.map((promo, index) => (
                  <TableRow
                    key={promo.id}
                    hover
                    sx={{ '&:hover': { backgroundColor: '#fff3cd' } }}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedForPrint.includes(promo.id!)}
                        onChange={() => handleSelectForPrint(promo.id!)}
                        color="warning"
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{index + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                      {promo.productName}
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ textDecoration: 'line-through', color: '#e74c3c', fontWeight: 'bold' }}>
                        {promo.originalPrice.toFixed(2)} DA
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`-${promo.discountPercent}%`}
                        color="warning"
                        size="small"
                        sx={{ fontWeight: 'bold', fontSize: 13 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#27ae60', fontSize: 18 }}>
                      {promo.newPrice.toFixed(2)} DA
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }}>
                      {promo.endDate}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={promo.active ? (isArabic ? 'نشط' : 'Actif') : (isArabic ? 'منتهي' : 'Expiré')}
                        color={promo.active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => promo.id && handleDelete(promo.id)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: 'center', py: 4 }}>
                    <LocalOffer sx={{ fontSize: 50, color: '#f39c12', mb: 1 }} />
                    <Typography variant="h6" color="text.secondary">
                      {isArabic ? 'لا توجد عروض' : 'Aucune promotion'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Fade>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
          color: 'white',
          fontWeight: 'bold'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {isArabic ? 'إضافة عرض جديد' : 'Ajouter une Promotion'}
            </Typography>
            <IconButton onClick={() => setOpenDialog(false)} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Autocomplete
            options={allProducts}
            getOptionLabel={(option) => option.designation}
            value={selectedProduct}
            onChange={(event, newValue) => handleProductSelect(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label={isArabic ? 'اختر المنتج' : 'Sélectionner le produit'}
                placeholder={isArabic ? 'اكتب للبحث...' : 'Tapez pour rechercher...'}
                fullWidth
                required
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{option.designation}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {isArabic ? 'السعر:' : 'Prix:'} {option.prixVente1.toFixed(2)} DA | 
                  {isArabic ? ' المخزون:' : ' Stock:'} {option.stock}
                </Typography>
              </Box>
            )}
            noOptionsText={isArabic ? 'لا توجد منتجات' : 'Aucun produit'}
            sx={{ mb: 2 }}
          />

          {selectedProduct && (
            <Box sx={{ mb: 2, p: 2, backgroundColor: '#fff3cd', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {isArabic ? 'السعر الحالي:' : 'Prix actuel:'} <strong>{selectedProduct.prixVente1.toFixed(2)} DA</strong>
              </Typography>
            </Box>
          )}

          <TextField
            fullWidth
            label={isArabic ? 'نسبة التخفيض (%)' : 'Pourcentage de remise (%)'}
            type="number"
            value={formData.discountPercent}
            onChange={(e) => handleDiscountChange(Number(e.target.value))}
            sx={{ mb: 2 }}
            required
            inputProps={{ min: 0, max: 100 }}
          />

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label={isArabic ? 'تاريخ البداية' : 'Date début'}
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label={isArabic ? 'تاريخ النهاية' : 'Date fin'}
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <Box sx={{ 
            p: 2, 
            backgroundColor: '#27ae60', 
            borderRadius: 1, 
            textAlign: 'center'
          }}>
            <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
              {isArabic ? 'السعر الجديد' : 'Nouveau Prix'}
            </Typography>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
              {formData.newPrice.toFixed(2)} DA
            </Typography>
            <Typography variant="caption" sx={{ color: 'white' }}>
              {isArabic ? 'وفّر' : 'Économisez'} {(formData.originalPrice - formData.newPrice).toFixed(2)} DA
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
              background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
              fontWeight: 'bold'
            }}
          >
            {isArabic ? 'حفظ' : 'Enregistrer'}
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

export default ProductPromotion;
