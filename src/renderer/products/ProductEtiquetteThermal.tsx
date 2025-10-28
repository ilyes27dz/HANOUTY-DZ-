// src/renderer/products/ProductEtiquetteThermal.tsx
import React, { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Typography, Checkbox
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import JsBarcode from 'jsbarcode';

interface Product {
  id: number;
  barcode?: string;
  name?: string;
  designation?: string;
  salePrice?: number;
  prixVente1?: number;
  quantity?: number;
  stock?: number;
  ref?: string;
}

interface PrintItem {
  barcode: string;
  name: string;
  price: number;
  quantity: number;
  ref: string;
}

interface ProductEtiquetteThermalProps {
  isArabic: boolean;
  onBack: () => void;
}

const ProductEtiquetteThermal: React.FC<ProductEtiquetteThermalProps> = ({ isArabic, onBack }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [printList, setPrintList] = useState<PrintItem[]>([]);
  const [quantity, setQuantity] = useState<number>(99);
  const [selectedSize, setSelectedSize] = useState<number>(1);
  const [showPrice, setShowPrice] = useState(true);
  const [priceType, setPriceType] = useState<1 | 2 | 3>(1);
  const [showPreview, setShowPreview] = useState(true);
  const [storeName, setStoreName] = useState('ILYES'); // ✅ قيمة افتراضية

  // ✅ تحميل المنتجات + اسم المتجر من الإعدادات
  useEffect(() => {
    loadProducts();
    
    // ✅ جلب اسم المتجر من localStorage
    const savedSettings = localStorage.getItem('storeSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setStoreName(settings.storeName || 'ILYES');
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    }
  }, []);

  const loadProducts = async () => {
    try {
      const data = await window.electron.getProducts();
      const normalized = (data || []).map((p: any) => ({
        id: p.id,
        barcode: p.barcode || p.codeBarre || `100${p.id}`,
        name: p.name || p.designation || (isArabic ? 'منتج' : 'Produit'),
        salePrice: p.salePrice || p.prixVente1 || 0,
        quantity: p.quantity || p.stock || 0,
        ref: p.ref || `REF-${p.id}`
      }));
      setProducts(normalized);
    } catch (error) {
      console.error('Error:', error);
      setProducts([]);
    }
  };

  const handleAddToPrint = (product: Product) => {
    const newItem: PrintItem = {
      barcode: product.barcode || `100${product.id}`,
      name: product.name || (isArabic ? 'منتج' : 'Produit'),
      price: product.salePrice || 0,
      quantity: quantity,
      ref: product.ref || `REF-${product.id}`
    };
    setPrintList([...printList, newItem]);
  };

  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  const handleRemoveAll = () => {
    if (window.confirm(isArabic ? 'حذف الكل؟' : 'Supprimer tout?')) {
      setPrintList([]);
    }
  };

  // ✅ دالة الطباعة مع الباركود الحقيقي + اسم المتجر
  const handlePrint = () => {
    if (printList.length === 0) {
      alert(isArabic ? 'القائمة فارغة!' : 'Liste vide!');
      return;
    }
    
    const sizes = [
      { width: 20, height: 40 },
      { width: 45, height: 30 },
      { width: 45, height: 35 }
    ];
    const size = sizes[selectedSize];
    
    // ✅ توليد صور الباركود
    const barcodes: string[] = [];
    printList.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        const canvas = document.createElement('canvas');
        try {
          JsBarcode(canvas, item.barcode, {
            format: 'CODE128',
            width: size.width < 40 ? 1 : 1.3,
            height: size.height < 35 ? 35 : 40,
            displayValue: false,
            margin: 0
          });
          barcodes.push(canvas.toDataURL('image/png'));
        } catch (e) {
          console.error(e);
          barcodes.push('');
        }
      }
    });
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let barcodeIndex = 0;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${isArabic ? 'ملصقات' : 'Étiquettes'} - ${storeName}</title>
        <style>
          @page { size: ${size.width}mm ${size.height}mm; margin: 0; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; }
          .label {
            width: ${size.width}mm;
            height: ${size.height}mm;
            padding: 1.5mm;
            page-break-after: always;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
          }
          .store-name { 
            font-size: ${size.width < 40 ? '8px' : '10px'}; 
            font-weight: bold;
            text-align: center;
          }
          .barcode-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            width: 100%;
          }
          .barcode-img { max-width: 100%; height: auto; }
          .barcode-number {
            font-size: ${size.width < 40 ? '7px' : '8px'};
            font-weight: bold;
            font-family: monospace;
            margin-top: 1mm;
          }
          .name { 
            font-size: ${size.width < 40 ? '8px' : '10px'}; 
            font-weight: bold; 
            text-align: center;
            margin: 1mm 0;
          }
          .price { 
            font-size: ${size.width < 40 ? '13px' : '16px'}; 
            font-weight: bold; 
          }
        </style>
      </head>
      <body>
        ${printList.map((item) => 
          Array(item.quantity).fill(0).map(() => `
            <div class="label">
              <div class="store-name">${storeName}</div>
              <div class="barcode-container">
                <img src="${barcodes[barcodeIndex++]}" class="barcode-img" alt="barcode">
                <div class="barcode-number">${item.barcode}</div>
              </div>
              <div class="name">${item.name}</div>
              ${showPrice ? `<div class="price">${item.price.toFixed(2)} DA</div>` : ''}
            </div>
          `).join('')
        ).join('')}
        <script>
          setTimeout(() => {
            window.print();
            window.onafterprint = () => window.close();
          }, 500);
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const filteredProducts = products.filter(p => {
    const name = (p.name || '').toLowerCase();
    const barcode = (p.barcode || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || barcode.includes(search);
  });

  const texts = {
    header: isArabic ? 'ملصقات الباركود الحرارية' : 'Étiquettes Thermiques - Codebarre',
    priceOnly: isArabic ? 'السعر فقط' : 'Prix seulement',
    showPrice: isArabic ? 'عرض السعر' : 'Affichage le Prix',
    search: isArabic ? 'بحث بالاسم' : 'Recherche par Designation',
    ref: isArabic ? 'الرقم' : 'Ref',
    designation: isArabic ? 'التسمية' : 'Designation',
    price: isArabic ? 'السعر' : 'Prix',
    qty: isArabic ? 'الكمية' : 'QTY',
    codebarre: isArabic ? 'الباركود' : 'Code-barre',
    nbr: isArabic ? 'العدد' : 'Nbr',
    addTable: isArabic ? 'إضافة للجدول' : 'Ajouter au tableau',
    preview: isArabic ? 'معاينة قبل الطباعة' : 'Aperçu avant impression',
    print: isArabic ? '🖨️ طباعة' : '🖨️ Imprimer',
    noProducts: isArabic ? 'لا توجد منتجات' : searchTerm ? 'Aucun produit trouvé' : 'Chargement...'
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <Box sx={{ backgroundColor: '#2c3e50', color: '#fff', p: 1.5, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button onClick={onBack} sx={{ color: '#fff', minWidth: 'auto' }}>
          <ArrowBack />
        </Button>
        <Typography sx={{ fontWeight: 'bold', fontSize: '18px' }}>
          {texts.header}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Typography sx={{ fontSize: '14px' }}>V 10.7</Typography>
      </Box>

      {/* Options Bar */}
      <Box sx={{ backgroundColor: '#ecf0f1', p: 1, display: 'flex', gap: 1, alignItems: 'center', borderBottom: '2px solid #bdc3c7', flexWrap: 'wrap' }}>
        {['20*40', '45*30', '45*35'].map((size, idx) => (
          <Button
            key={idx}
            onClick={() => setSelectedSize(idx)}
            sx={{
              backgroundColor: selectedSize === idx ? '#e74c3c' : '#95a5a6',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '12px',
              minWidth: '80px',
              py: 0.5,
              '&:hover': { backgroundColor: selectedSize === idx ? '#c0392b' : '#7f8c8d' }
            }}
          >
            {size}
          </Button>
        ))}
        <Button
          onClick={() => setShowPrice(!showPrice)}
          sx={{
            backgroundColor: showPrice ? '#3498db' : '#95a5a6',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '11px',
            minWidth: '120px',
            py: 0.5,
            '&:hover': { backgroundColor: showPrice ? '#2980b9' : '#7f8c8d' }
          }}
        >
          {texts.priceOnly}
        </Button>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Checkbox size="small" checked={showPrice} onChange={(e) => setShowPrice(e.target.checked)} />
          <Typography sx={{ fontSize: '12px' }}>{texts.showPrice}</Typography>
        </Box>
        {[1, 2, 3].map(num => (
          <Box key={num} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <input 
              type="radio" 
              checked={priceType === num} 
              onChange={() => setPriceType(num as 1 | 2 | 3)}
            />
            <Typography sx={{ fontSize: '11px' }}>{isArabic ? `سعر ${num}` : `Prix 0${num}`}</Typography>
          </Box>
        ))}
      </Box>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Panel */}
        <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <TextField
            fullWidth
            size="small"
            placeholder={texts.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2, backgroundColor: '#fff' }}
          />

          <TableContainer sx={{ flex: 1, backgroundColor: '#fff', border: '1px solid #bdc3c7', overflow: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ backgroundColor: '#34495e', color: '#fff', fontWeight: 'bold', fontSize: '11px', py: 0.5 }}>{texts.ref}</TableCell>
                  <TableCell sx={{ backgroundColor: '#34495e', color: '#fff', fontWeight: 'bold', fontSize: '11px', py: 0.5 }}>{texts.designation}</TableCell>
                  <TableCell sx={{ backgroundColor: '#34495e', color: '#fff', fontWeight: 'bold', fontSize: '11px', py: 0.5 }}>{texts.price}</TableCell>
                  <TableCell sx={{ backgroundColor: '#34495e', color: '#fff', fontWeight: 'bold', fontSize: '11px', py: 0.5 }}>{texts.qty}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow
                      key={product.id}
                      onClick={() => handleAddToPrint(product)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: '#3498db', color: '#fff' },
                        '&:nth-of-type(even)': { backgroundColor: '#ecf0f1' }
                      }}
                    >
                      <TableCell sx={{ fontSize: '11px', py: 0.5 }}>{product.id}</TableCell>
                      <TableCell sx={{ fontSize: '11px', py: 0.5 }}>{product.name}</TableCell>
                      <TableCell sx={{ fontSize: '11px', fontWeight: 'bold', py: 0.5 }}>
                        {(product.salePrice || 0).toFixed(2)} DA
                      </TableCell>
                      <TableCell sx={{ fontSize: '11px', py: 0.5 }}>{product.quantity || 0}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="h6" color="text.secondary">
                        {texts.noProducts}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Right Panel */}
        <Box sx={{ 
          width: '520px',
          display: 'flex', 
          flexDirection: 'column',
          borderLeft: '2px solid #bdc3c7',
          backgroundColor: '#f8f9fa'
        }}>
          <Box sx={{ 
            p: 2, 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%',
            gap: 2, 
            overflow: 'auto' 
          }}>
            {/* Info Card */}
            <Box sx={{ p: 1.5, backgroundColor: '#fff', border: '2px solid #e0e0e0', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', flexShrink: 0 }}>
              {printList.length > 0 ? (
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: '11px', color: '#7f8c8d', mb: 0.3, fontWeight: 600 }}>
                      {isArabic ? 'الباركود' : 'Code Barre'}
                    </Typography>
                    <Typography sx={{ fontWeight: 'bold', fontSize: '16px', color: '#2c3e50', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                      {printList[0]?.barcode}
                    </Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#e8f5e9', p: 1, borderRadius: 1.5, border: '2px solid #4caf50' }}>
                    <Typography sx={{ fontSize: '10px', color: '#388e3c', mb: 0.2, fontWeight: 600 }}>
                      {isArabic ? 'السعر' : 'Prix'}
                    </Typography>
                    <Typography sx={{ fontWeight: 'bold', fontSize: '17px', color: '#2e7d32' }}>
                      {printList[0]?.price.toFixed(2)} DA
                    </Typography>
                  </Box>
                  <Box sx={{ backgroundColor: '#e3f2fd', p: 1, borderRadius: 1.5, border: '2px solid #2196f3' }}>
                    <Typography sx={{ fontSize: '10px', color: '#1976d2', mb: 0.2, fontWeight: 600 }}>
                      {isArabic ? 'الحجم' : 'Size'}
                    </Typography>
                    <Typography sx={{ fontWeight: 'bold', fontSize: '14px', color: '#1565c0' }}>
                      {['20*40', '45*30', '45*35'][selectedSize]}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography sx={{ fontSize: '12px', color: '#95a5a6', fontWeight: 600 }}>
                    {isArabic ? 'اختر منتج لعرض التفاصيل' : 'Sélectionnez un produit'}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Table */}
            <Box sx={{ backgroundColor: '#fff', border: '2px solid #e0e0e0', borderRadius: 2, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', flexShrink: 0 }}>
              <TableContainer sx={{ maxHeight: '120px' }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ backgroundColor: '#2c3e50', color: '#fff', fontWeight: 'bold', fontSize: '12px', py: 1 }}>
                        {isArabic ? 'رقم' : 'N#'}
                      </TableCell>
                      <TableCell sx={{ backgroundColor: '#2c3e50', color: '#fff', fontWeight: 'bold', fontSize: '12px', py: 1 }}>
                        {texts.codebarre}
                      </TableCell>
                      <TableCell sx={{ backgroundColor: '#2c3e50', color: '#fff', fontWeight: 'bold', fontSize: '12px', py: 1 }}>
                        {texts.price}
                      </TableCell>
                      <TableCell sx={{ backgroundColor: '#2c3e50', color: '#fff', fontWeight: 'bold', fontSize: '12px', py: 1 }}>
                        {texts.nbr}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {printList.map((item, idx) => (
                      <TableRow key={idx} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                        <TableCell sx={{ fontSize: '12px', py: 0.8, fontWeight: 600 }}>{idx + 1}</TableCell>
                        <TableCell sx={{ fontSize: '12px', py: 0.8, fontFamily: 'monospace' }}>{item.barcode}</TableCell>
                        <TableCell sx={{ fontSize: '12px', py: 0.8, color: '#27ae60', fontWeight: 'bold' }}>{item.price.toFixed(2)}</TableCell>
                        <TableCell sx={{ fontSize: '12px', py: 0.8, fontWeight: 600 }}>{item.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Controls */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', backgroundColor: '#fff', p: 1.5, borderRadius: 2, border: '2px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', flexShrink: 0 }}>
              <Button onClick={handleIncrement} sx={{ minWidth: 45, height: 45, backgroundColor: '#27ae60', color: '#fff', fontSize: '22px', borderRadius: 2, fontWeight: 'bold', '&:hover': { backgroundColor: '#229954' } }}>+</Button>
              <TextField value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} type="number" size="small" inputProps={{ min: 1, style: { textAlign: 'center', fontSize: '26px', fontWeight: 'bold', color: '#2c3e50' } }} sx={{ width: '110px', '& .MuiOutlinedInput-root': { borderRadius: 2, border: '2px solid #3498db' } }} />
              <Button onClick={handleDecrement} sx={{ minWidth: 45, height: 45, backgroundColor: '#e74c3c', color: '#fff', fontSize: '22px', borderRadius: 2, fontWeight: 'bold', '&:hover': { backgroundColor: '#c0392b' } }}>-</Button>
              <Button sx={{ flex: 1, height: 45, backgroundColor: '#34495e', color: '#fff', fontWeight: 'bold', fontSize: '11px', borderRadius: 2, '&:hover': { backgroundColor: '#2c3e50' } }}>{texts.addTable}</Button>
              <Button onClick={handleRemoveAll} sx={{ minWidth: 45, height: 45, backgroundColor: '#e74c3c', color: '#fff', fontSize: '18px', borderRadius: 2, '&:hover': { backgroundColor: '#c0392b' } }}>🗑️</Button>
            </Box>

            {/* Checkbox */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
              <Checkbox size="small" checked={showPreview} onChange={(e) => setShowPreview(e.target.checked)} />
              <Typography sx={{ fontSize: '11px' }}>{texts.preview}</Typography>
            </Box>

            {/* Print Button */}
            <Button fullWidth onClick={handlePrint} disabled={printList.length === 0} sx={{ height: 55, backgroundColor: '#27ae60', color: '#fff', fontSize: '18px', fontWeight: 'bold', borderRadius: 2, boxShadow: '0 4px 12px rgba(39,174,96,0.3)', textTransform: 'uppercase', letterSpacing: '1px', flexShrink: 0, '&:hover': { backgroundColor: '#229954', boxShadow: '0 6px 16px rgba(39,174,96,0.4)' }, '&:disabled': { backgroundColor: '#95a5a6', cursor: 'not-allowed', boxShadow: 'none' } }}>
              {texts.print}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ProductEtiquetteThermal;
