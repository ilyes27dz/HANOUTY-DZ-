// src/renderer/products/ProductPricing.tsx
import React, { useState, useEffect } from 'react';
import {
  Box, IconButton, Card, CardContent, Typography, Button, TextField, 
  FormControl, InputLabel, Select, MenuItem, Radio, RadioGroup, FormControlLabel,
  Grid, Chip, Alert, Snackbar, InputAdornment, Paper, Fade
} from '@mui/material';
import { ArrowBack, AttachMoney, TrendingUp, TrendingDown } from '@mui/icons-material';

interface Product {
  id: number;
  designation: string;
  category?: string;
  prixVente1: number;
  prixAchat: number;
}

interface ProductPricingProps {
  isArabic: boolean;
  onBack: () => void;
}

const ProductPricing: React.FC<ProductPricingProps> = ({ isArabic, onBack }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  
  const [influence, setInfluence] = useState<'increase' | 'decrease'>('increase');
  const [priceType, setPriceType] = useState<'sale' | 'purchase'>('sale');
  const [applyTo, setApplyTo] = useState<'all' | 'category'>('all');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [usePercentage, setUsePercentage] = useState(false);
  
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
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await window.electron.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await window.electron.getCategories();
      const categoryNames = data.map((cat: any) => cat.name);
      setCategories(categoryNames);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleApply = async () => {
    if ((usePercentage && percentage === 0) || (!usePercentage && amount === 0)) {
      setSnackbar({
        open: true,
        message: isArabic ? '⚠️ أدخل القيمة أو النسبة' : '⚠️ Entrez le montant ou le pourcentage',
        severity: 'error'
      });
      return;
    }

    if (applyTo === 'category' && !category) {
      setSnackbar({
        open: true,
        message: isArabic ? '⚠️ اختر الفئة' : '⚠️ Sélectionnez la catégorie',
        severity: 'error'
      });
      return;
    }

    try {
      const updatedProducts = products.map((product) => {
        const shouldUpdate = applyTo === 'all' || product.category === category;
        
        if (!shouldUpdate) return product;

        let changeAmount = usePercentage 
          ? (product[priceType === 'sale' ? 'prixVente1' : 'prixAchat'] * percentage / 100)
          : amount;

        if (influence === 'decrease') {
          changeAmount = -changeAmount;
        }

        if (priceType === 'sale') {
          return {
            ...product,
            prixVente1: Math.max(0, product.prixVente1 + changeAmount)
          };
        } else {
          return {
            ...product,
            prixAchat: Math.max(0, product.prixAchat + changeAmount)
          };
        }
      });

      for (const product of updatedProducts) {
        await window.electron.updateProduct(product);
      }

      await loadProducts();
      
      setSnackbar({
        open: true,
        message: isArabic ? '✅ تم تحديث الأسعار بنجاح!' : '✅ Prix mis à jour avec succès!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating prices:', error);
      setSnackbar({
        open: true,
        message: isArabic ? '❌ خطأ في التحديث' : '❌ Erreur de mise à jour',
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

  const affectedProducts = applyTo === 'all' 
    ? products.length 
    : products.filter(p => p.category === category).length;

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
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        borderRadius: 2,
        boxShadow: 4,
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: 14 }}>
            {formatDateTime(currentDateTime)}
          </Typography>
        </Box>
        <Chip
          icon={<AttachMoney />}
          label={`${products.length} ${isArabic ? 'منتج' : 'produits'}`}
          sx={{
            fontSize: 12,
            fontWeight: 'bold',
            px: 1.5,
            backgroundColor: 'white',
            color: '#4facfe'
          }}
        />
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={4}>
          <Card sx={{
            background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
            color: 'white',
            borderRadius: 2
          }}>
            <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: 11 }}>
                {isArabic ? 'إجمالي المنتجات' : 'Total Produits'}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                {products.length}
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
                {isArabic ? 'المنتجات المتأثرة' : 'Produits Affectés'}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                {affectedProducts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={4}>
          <Card sx={{
            background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
            color: 'white',
            borderRadius: 2
          }}>
            <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: 11 }}>
                {isArabic ? 'الفئات' : 'Catégories'}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                {categories.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Fade in timeout={500}>
        <Card sx={{ boxShadow: 3, mb: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Grid container spacing={2}>
              {/* Influence */}
              <Grid item xs={12}>
                <Card sx={{ p: 1.5, backgroundColor: '#f8f9fa' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, fontSize: 13 }}>
                    {isArabic ? 'التأثير على الأسعار' : 'Influence sur les prix'}
                  </Typography>
                  <RadioGroup row value={influence} onChange={(e) => setInfluence(e.target.value as any)}>
                    <FormControlLabel 
                      value="increase" 
                      control={<Radio size="small" />} 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <TrendingUp sx={{ color: '#27ae60', fontSize: 18 }} />
                          <Typography variant="body2">{isArabic ? 'زيادة' : 'Augmenter'}</Typography>
                        </Box>
                      } 
                    />
                    <FormControlLabel 
                      value="decrease" 
                      control={<Radio size="small" />} 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <TrendingDown sx={{ color: '#e74c3c', fontSize: 18 }} />
                          <Typography variant="body2">{isArabic ? 'تخفيض' : 'Diminuer'}</Typography>
                        </Box>
                      } 
                    />
                  </RadioGroup>
                </Card>
              </Grid>

              {/* Type de prix */}
              <Grid item xs={12}>
                <Card sx={{ p: 1.5, backgroundColor: '#f8f9fa' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, fontSize: 13 }}>
                    {isArabic ? 'نوع السعر' : 'Type de prix'}
                  </Typography>
                  <RadioGroup row value={priceType} onChange={(e) => setPriceType(e.target.value as any)}>
                    <FormControlLabel value="sale" control={<Radio size="small" />} 
                      label={<Typography variant="body2">{isArabic ? 'سعر البيع' : 'Prix de Vente'}</Typography>} />
                    <FormControlLabel value="purchase" control={<Radio size="small" />} 
                      label={<Typography variant="body2">{isArabic ? 'سعر الشراء' : "Prix d'Achat"}</Typography>} />
                  </RadioGroup>
                </Card>
              </Grid>

              {/* Appliquer à */}
              <Grid item xs={12} md={applyTo === 'category' ? 6 : 12}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: 14 }}>{isArabic ? 'تطبيق على' : 'Appliquer à'}</InputLabel>
                  <Select value={applyTo} label={isArabic ? 'تطبيق على' : 'Appliquer à'}
                    onChange={(e) => setApplyTo(e.target.value as any)}>
                    <MenuItem value="all">{isArabic ? 'جميع المنتجات' : 'Tous les produits'}</MenuItem>
                    <MenuItem value="category">{isArabic ? 'حسب الفئة' : 'Par catégorie'}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {applyTo === 'category' && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ fontSize: 14 }}>{isArabic ? 'اختر الفئة' : 'Catégorie de produit'}</InputLabel>
                    <Select value={category} label={isArabic ? 'اختر الفئة' : 'Catégorie de produit'}
                      onChange={(e) => setCategory(e.target.value)}>
                      {categories.map(cat => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {/* Type de montant */}
              <Grid item xs={12}>
                <Card sx={{ p: 1.5, backgroundColor: '#f8f9fa' }}>
                  <RadioGroup row value={usePercentage ? 'percentage' : 'fixed'} 
                    onChange={(e) => setUsePercentage(e.target.value === 'percentage')}>
                    <FormControlLabel value="fixed" control={<Radio size="small" />} 
                      label={<Typography variant="body2">{isArabic ? 'قيمة ثابتة (DA)' : 'Montant fixe (DA)'}</Typography>} />
                    <FormControlLabel value="percentage" control={<Radio size="small" />} 
                      label={<Typography variant="body2">{isArabic ? 'نسبة مئوية (%)' : 'Pourcentage (%)'}</Typography>} />
                  </RadioGroup>
                </Card>
              </Grid>

              {/* Input */}
              <Grid item xs={12}>
                {usePercentage ? (
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label={isArabic ? 'النسبة المئوية' : 'Pourcentage'}
                    value={percentage}
                    onChange={(e) => setPercentage(parseFloat(e.target.value) || 0)}
                    InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                  />
                ) : (
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label={isArabic ? 'القيمة' : 'Montant'}
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    InputProps={{ endAdornment: <InputAdornment position="end">DA</InputAdornment> }}
                  />
                )}
              </Grid>

              {/* Summary */}
              <Grid item xs={12}>
                <Card sx={{ p: 2, background: 'linear-gradient(135deg, #000 0%, #222 100%)', color: '#fff', textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'yellow', fontWeight: 'bold' }}>
                    {isArabic ? 'المبلغ' : 'la somme'}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ffd700' }}>
                    {usePercentage ? `${percentage}%` : `${amount.toFixed(2)} DA`}
                  </Typography>
                </Card>
              </Grid>

              {/* Button */}
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleApply}
                  sx={{
                    background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
                    color: '#fff',
                    py: 1.5,
                    fontSize: '16px',
                    fontWeight: 'bold',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #229954 0%, #27ae60 100%)',
                    }
                  }}
                >
                  {isArabic ? '✔️ تطبيق' : '✔️ Régler le prix'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Fade>

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

export default ProductPricing;
