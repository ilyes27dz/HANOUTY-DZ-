// src/renderer/products/ProductEtiquetteA4.tsx
import React, { useState, useEffect } from 'react';
import {
  Box, IconButton, Card, CardContent, Typography, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Paper,
  Snackbar, Alert, Grid, Chip, Fade, Autocomplete,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import {
  Delete, Add, Close, AccessTime, ArrowBack, Print, Label as LabelIcon
} from '@mui/icons-material';

interface Product {
  id: number;
  designation: string;
  barcode?: string;
  prixVente1: number;
  stock: number;
}

interface BarcodeLabel {
  id?: number;
  productName: string;
  barcode: string;
  price: number;
  quantity: number;
}

interface ProductEtiquetteA4Props {
  isArabic: boolean;
  onBack?: () => void;
}

const ProductEtiquetteA4: React.FC<ProductEtiquetteA4Props> = ({ isArabic, onBack }) => {
  const [labels, setLabels] = useState<BarcodeLabel[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [labelQuantity, setLabelQuantity] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [labelSize, setLabelSize] = useState<'65' | '56' | '54'>('65');
  const [storeName, setStoreName] = useState('HANOUTY DZ');
  
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
    loadAllProducts();
    
    const savedSettings = localStorage.getItem('storeSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setStoreName(settings.storeName || 'HANOUTY DZ');
    }
  }, []);

  const loadAllProducts = async () => {
    try {
      const data = await window.electron.getProducts();
      setAllProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleProductSelect = (product: Product | null) => {
    setSelectedProduct(product);
  };

  const handleAddLabel = () => {
    if (!selectedProduct) {
      setSnackbar({
        open: true,
        message: isArabic ? '⚠️ اختر منتج أولاً' : '⚠️ Sélectionnez un produit',
        severity: 'error'
      });
      return;
    }

    const newLabel: BarcodeLabel = {
      id: labels.length + 1,
      productName: selectedProduct.designation,
      barcode: selectedProduct.barcode || `100${selectedProduct.id}`,
      price: selectedProduct.prixVente1,
      quantity: labelQuantity
    };

    setLabels([...labels, newLabel]);
    setOpenDialog(false);
    setSelectedProduct(null);
    setLabelQuantity(1);

    setSnackbar({
      open: true,
      message: isArabic ? '✅ تم الإضافة' : '✅ Ajouté',
      severity: 'success'
    });
  };

  const handleDelete = (id: number) => {
    setLabels(labels.filter(l => l.id !== id));
  };

  // 🔥 دالة لإنشاء باركود حقيقي من النص
  const generateBarcodePattern = (text: string): string => {
    // نمط الباركود: كل رقم له نمط خاص من الخطوط
    const patterns: { [key: string]: string } = {
      '0': '0001101', '1': '0011001', '2': '0010011', '3': '0111101',
      '4': '0100011', '5': '0110001', '6': '0101111', '7': '0111011',
      '8': '0110111', '9': '0001011'
    };

    let result = '101'; // بداية الباركود
    
    for (let char of text) {
      if (patterns[char]) {
        result += patterns[char];
      }
    }
    
    result += '101'; // نهاية الباركود

    return result;
  };

  const handlePrint = () => {
    if (labels.length === 0) {
      setSnackbar({
        open: true,
        message: isArabic ? '⚠️ أضف ملصقات للطباعة' : '⚠️ Ajoutez des étiquettes',
        severity: 'error'
      });
      return;
    }

    const printWindow = window.open('', '', 'height=900,width=1200');
    if (!printWindow) return;

    const allLabelsExpanded = labels.flatMap(label =>
      Array(label.quantity).fill({
        productName: label.productName,
        barcode: label.barcode,
        price: label.price
      })
    );

    printWindow.document.write(`
      <html>
        <head>
          <title>Étiquettes Codes-barres - ${storeName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            @page { size: A4; margin: 8mm; }
            body { 
              font-family: 'Arial', sans-serif; 
              padding: 5mm;
              background: white;
            }
            .page {
              display: grid;
              grid-template-columns: repeat(${labelSize === '65' ? '3' : labelSize === '56' ? '4' : '5'}, 1fr);
              gap: 4mm;
              width: 100%;
            }
            .label {
              width: 100%;
              height: ${labelSize === '65' ? '40mm' : labelSize === '56' ? '34mm' : '28mm'};
              border: 2px solid #e0e0e0;
              border-radius: 4mm;
              padding: 3mm;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              page-break-inside: avoid;
              background: white;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .store-name {
              font-size: ${labelSize === '65' ? '11pt' : '9pt'};
              font-weight: bold;
              text-align: center;
              color: #2c3e50;
              border-bottom: 2px solid #f39c12;
              padding-bottom: 2mm;
              margin-bottom: 2mm;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .product-name {
              font-size: ${labelSize === '65' ? '10pt' : '8pt'};
              font-weight: bold;
              text-align: center;
              color: #34495e;
              min-height: ${labelSize === '65' ? '12mm' : '8mm'};
              display: flex;
              align-items: center;
              justify-content: center;
              line-height: 1.2;
              padding: 0 2mm;
              word-wrap: break-word;
              overflow-wrap: break-word;
            }
            .barcode-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              margin: 2mm 0;
            }
            .barcode {
              width: 100%;
              height: ${labelSize === '65' ? '18mm' : labelSize === '56' ? '14mm' : '12mm'};
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              background: white;
            }
            .barcode-bars {
              width: 95%;
              height: 70%;
              display: flex;
              align-items: stretch;
              justify-content: center;
              background: white;
              border: 1px solid #ddd;
            }
            .bar {
              flex: 0 0 auto;
              height: 100%;
            }
            .bar.black { background: #000; }
            .bar.white { background: #fff; }
            .barcode-text {
              font-size: ${labelSize === '65' ? '9pt' : '7pt'};
              font-weight: bold;
              color: #2c3e50;
              margin-top: 1mm;
              letter-spacing: 2px;
              font-family: 'Courier New', monospace;
            }
            .price {
              font-size: ${labelSize === '65' ? '16pt' : '14pt'};
              font-weight: bold;
              text-align: center;
              color: #e74c3c;
              background: linear-gradient(135deg, #fff9e6 0%, #ffe8cc 100%);
              border: 3px solid #f39c12;
              border-radius: 4mm;
              padding: 2mm;
              box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
            }
            @media print {
              body { padding: 0; }
              .label { box-shadow: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="page">
            ${allLabelsExpanded.map((label) => {
              const barcodePattern = generateBarcodePattern(label.barcode);
              const barcodesHTML = barcodePattern.split('').map(bit => 
                `<div class="bar ${bit === '1' ? 'black' : 'white'}" style="width: ${100 / barcodePattern.length}%"></div>`
              ).join('');

              return `
                <div class="label">
                  <div class="store-name">${storeName}</div>
                  <div class="product-name">${label.productName}</div>
                  <div class="barcode-container">
                    <div class="barcode">
                      <div class="barcode-bars">
                        ${barcodesHTML}
                      </div>
                      <div class="barcode-text">${label.barcode}</div>
                    </div>
                  </div>
                  <div class="price">${label.price.toFixed(2)} DA</div>
                </div>
              `;
            }).join('')}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() { window.close(); }, 100);
              }, 500);
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

  const totalLabels = labels.reduce((sum, l) => sum + l.quantity, 0);

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
        background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
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
          label={`${totalLabels} ${isArabic ? 'ملصق' : 'étiquettes'}`}
          sx={{
            fontSize: 14,
            fontWeight: 'bold',
            px: 1.5,
            backgroundColor: 'white',
            color: '#3498db'
          }}
        />
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{
            background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
            color: 'white',
            borderRadius: 2
          }}>
            <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: 12 }}>
                {isArabic ? 'إجمالي الملصقات' : 'Total Étiquettes'}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                {totalLabels}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{
            background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
            color: 'white',
            borderRadius: 2
          }}>
            <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: 12 }}>
                {isArabic ? 'المنتجات' : 'Produits'}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                {labels.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{
            background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
            color: 'white',
            borderRadius: 2
          }}>
            <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: 12 }}>
                {isArabic ? 'اسم المتجر' : 'Nom du magasin'}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                {storeName}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper elevation={4} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>{isArabic ? 'حجم الملصق' : 'Taille étiquette'}</InputLabel>
              <Select
                value={labelSize}
                label={isArabic ? 'حجم الملصق' : 'Taille étiquette'}
                onChange={(e) => setLabelSize(e.target.value as '65' | '56' | '54')}
              >
                <MenuItem value="65">65 Etiquette (3x22)</MenuItem>
                <MenuItem value="56">56 Etiquette (4x14)</MenuItem>
                <MenuItem value="54">54 Etiquette (5x11)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={4}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenDialog(true)}
              sx={{
                background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                fontWeight: 'bold'
              }}
            >
              {isArabic ? 'إضافة' : 'Ajouter'}
            </Button>
          </Grid>

          <Grid item xs={6} md={4}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Print />}
              onClick={handlePrint}
              disabled={labels.length === 0}
              sx={{
                background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
                fontWeight: 'bold',
                '&:disabled': { opacity: 0.5 }
              }}
            >
              {isArabic ? 'طباعة' : 'Imprimer'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Fade in timeout={500}>
        <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 2, maxHeight: 500 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', bgcolor: '#3498db' }}>#</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', bgcolor: '#3498db' }}>
                  {isArabic ? 'المنتج' : 'Produit'}
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', bgcolor: '#3498db' }}>
                  {isArabic ? 'الباركود' : 'Code-barre'}
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', bgcolor: '#3498db' }}>
                  {isArabic ? 'السعر' : 'Prix'}
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', bgcolor: '#3498db' }}>
                  {isArabic ? 'العدد' : 'Quantité'}
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', bgcolor: '#3498db' }}>
                  {isArabic ? 'الإجراءات' : 'Actions'}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {labels.length > 0 ? (
                labels.map((label, index) => (
                  <TableRow
                    key={label.id}
                    hover
                    sx={{ '&:hover': { backgroundColor: '#e3f2fd' } }}
                  >
                    <TableCell sx={{ fontWeight: 'bold' }}>{index + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                      {label.productName}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={label.barcode}
                        size="small"
                        sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#27ae60' }}>
                      {label.price.toFixed(2)} DA
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={label.quantity}
                        color="primary"
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => label.id && handleDelete(label.id)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                    <LabelIcon sx={{ fontSize: 50, color: '#3498db', mb: 1 }} />
                    <Typography variant="h6" color="text.secondary">
                      {isArabic ? 'لا توجد ملصقات' : 'Aucune étiquette'}
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
          background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
          color: 'white',
          fontWeight: 'bold'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {isArabic ? 'إضافة ملصق' : 'Ajouter Étiquette'}
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
                  {isArabic ? 'الباركود:' : 'Code:'} {option.barcode || `100${option.id}`} | 
                  {isArabic ? ' السعر:' : ' Prix:'} {option.prixVente1.toFixed(2)} DA
                </Typography>
              </Box>
            )}
            noOptionsText={isArabic ? 'لا توجد منتجات' : 'Aucun produit'}
            sx={{ mb: 2 }}
          />

          {selectedProduct && (
            <Box sx={{ mb: 2, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>{isArabic ? 'المنتج:' : 'Produit:'}</strong> {selectedProduct.designation}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>{isArabic ? 'الباركود:' : 'Code-barre:'}</strong> {selectedProduct.barcode || `100${selectedProduct.id}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>{isArabic ? 'السعر:' : 'Prix:'}</strong> {selectedProduct.prixVente1.toFixed(2)} DA
              </Typography>
            </Box>
          )}

          <TextField
            fullWidth
            label={isArabic ? 'عدد الملصقات' : 'Nombre d\'étiquettes'}
            type="number"
            value={labelQuantity}
            onChange={(e) => setLabelQuantity(Math.max(1, Number(e.target.value)))}
            inputProps={{ min: 1 }}
          />
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
            onClick={handleAddLabel}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
              fontWeight: 'bold'
            }}
          >
            {isArabic ? 'إضافة' : 'Ajouter'}
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

export default ProductEtiquetteA4;
