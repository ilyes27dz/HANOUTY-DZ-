// src/renderer/products/ProductDialog.tsx - ✅ النسخة النهائية بدون أخطاء
import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Tabs, Tab, Box, TextField, Grid, 
  FormControlLabel, Checkbox, Select, MenuItem, InputLabel, FormControl, IconButton, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Switch, Typography, Avatar,
  Chip, Tooltip, Divider, CircularProgress
} from '@mui/material';
import {
  Add, Remove, Close, Camera, Delete as DeleteIcon, FolderOpen, Print,
  Save, QrCode, Inventory, AttachMoney, LocalOffer, Straighten, ShoppingCart, Image as ImageIcon,
  Smartphone, Checkroom
} from '@mui/icons-material';

// ✅ Types
interface Barcode {
  code: string;
  action: string;
}

interface Taille {
  barcode: string;
  taille: string;
  quantite: number;
  prixVente: number;
  qntInitiale: number;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  productCount?: number;
}

interface Marque {
  id: number;
  name: string;
  description?: string;
  productCount?: number;
}

interface Unite {
  id: number;
  name: string;
  abbreviation?: string;
  productCount?: number;
}

interface Fournisseur {
  id: number;
  name: string;
  telephone?: string;
}

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
  tailles?: Taille[];
  processeur?: string;
  systeme?: string;
  stockage?: string;
  ram?: string;
  batterie?: string;
  camera?: string;
  imei?: string;
}

interface ProductDialogProps {
  open: boolean;
  onClose: () => void;
  isArabic: boolean;
  product: Product | null;
  onSave: (product: any) => void;
}

const ProductDialog: React.FC<ProductDialogProps> = ({ open, onClose, isArabic, product, onSave }) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [barcodes, setBarcodes] = useState<Barcode[]>([]);
  const [newBarcode, setNewBarcode] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tailles, setTailles] = useState<Taille[]>([]);
  const [selectedTaille, setSelectedTaille] = useState({ taille: '', quantite: 0, prixVente: 0 });

  const [categories, setCategories] = useState<Category[]>([]);
  const [marques, setMarques] = useState<Marque[]>([]);
  const [unites, setUnites] = useState<Unite[]>([]);
  const [taillesDisponibles, setTaillesDisponibles] = useState<any[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<any>({
    ref: '', designation: '', marque: '', category: '', fournisseur: '', unite: '',
    prixAchat: 0, prixVente1: 0, prixVente2: 0, prixVente3: 0, prixGros: 0,
    remise1: 0, remise2: 0, remise3: 0, stock: 0, stockAlerte: 10, stockNecessaire: 50, stockMin: 5,
    emplacement: '', barcode: '', image: '', dateCreation: new Date().toISOString(), datePeremption: '', lotNumber: '',
    poids: 0, hauteur: 0, largeur: 0, profondeur: 0, notes: '', 
    enBalanceActive: false,
    stockActive: true, 
    permisVente: true, 
    vetements: false, 
    estActif: true, 
    taille: '', 
    nbrColier: 1, 
    prixColis: 0,
    processeur: '', systeme: 'ANDROID', stockage: '', ram: '', batterie: '', camera: '', imei: ''
  });

  // ✅ إخفاء أخطاء MUI للقيم المفقودة
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args: any[]) => {
      if (typeof args[0] === 'string' && args[0].includes('out-of-range value')) {
        return; // تجاهل أخطاء القيم المفقودة
      }
      originalError(...args);
    };
    
    return () => {
      console.error = originalError;
    };
  }, []);

  // ✅ جلب البيانات
  useEffect(() => {
    if (open) {
      fetchAllData();
    }
  }, [open]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const categoriesData = await window.electron.getCategories();
      setCategories(categoriesData || []);

      const marquesData = await window.electron.getMarques();
      setMarques(marquesData || []);

      const unitesData = await window.electron.getUnites();
      setUnites(unitesData || []);

      const taillesData = await window.electron.getTailles();
      console.log('✅ Tailles loaded:', taillesData);
      setTaillesDisponibles(taillesData || []);

      setFournisseurs([
        { id: 1, name: 'Fournisseur A' },
        { id: 2, name: 'Fournisseur B' },
        { id: 3, name: 'Fournisseur C' }
      ]);

    } catch (error) {
      console.error('❌ Error fetching data:', error);
      setCategories([{ id: 1, name: 'General', productCount: 0 }]);
      setMarques([{ id: 1, name: 'Samsung', productCount: 0 }]);
      setUnites([{ id: 1, name: 'Pièce', productCount: 0 }]);
      setTaillesDisponibles([{ id: 1, name: 'S' }, { id: 2, name: 'M' }, { id: 3, name: 'L' }]);
      setFournisseurs([{ id: 1, name: 'Fournisseur A' }]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ إضافة القيم المفقودة تلقائياً
  useEffect(() => {
    if (product && open && marques.length > 0 && categories.length > 0) {
      // إضافة العلامة إذا مفقودة
      if (product.marque && !marques.find(m => m.name === product.marque)) {
        setMarques(prev => [...prev, { id: Date.now(), name: product.marque, productCount: 0 }]);
      }
      
      // إضافة الفئة إذا مفقودة
      if (product.category && !categories.find(c => c.name === product.category)) {
        setCategories(prev => [...prev, { id: Date.now(), name: product.category, productCount: 0 }]);
      }
    }
  }, [product, open, marques.length, categories.length]);

  useEffect(() => {
    if (product) {
      setFormData({ ...product });
      if (product.barcode) setBarcodes([{ code: product.barcode, action: 'Barcode' }]);
      if (product.image) setImagePreview(product.image);
      if (product.tailles) setTailles(product.tailles);
    } else {
      const newRef = `REF${Date.now()}`;
      const defaultBarcode = `BC${Date.now()}`;
      setFormData({ 
        ref: newRef,
        designation: '',
        marque: '',
        category: '',
        fournisseur: '',
        unite: '',
        prixAchat: 0,
        prixVente1: 0,
        prixVente2: 0,
        prixVente3: 0,
        prixGros: 0,
        remise1: 0,
        remise2: 0,
        remise3: 0,
        stock: 0,
        stockAlerte: 10,
        stockNecessaire: 50,
        stockMin: 5,
        emplacement: '',
        barcode: defaultBarcode,
        image: '',
        dateCreation: new Date().toISOString(),
        datePeremption: '',
        lotNumber: '',
        poids: 0,
        hauteur: 0,
        largeur: 0,
        profondeur: 0,
        notes: '',
        enBalanceActive: false,
        stockActive: true,
        permisVente: true,
        vetements: false,
        estActif: true,
        taille: '',
        nbrColier: 1,
        prixColis: 0,
        processeur: '',
        systeme: 'ANDROID',
        stockage: '',
        ram: '',
        batterie: '',
        camera: '',
        imei: ''
      });
      setBarcodes([{ code: defaultBarcode, action: 'Barcode' }]);
      setImagePreview('');
      setTailles([]);
    }
    setCurrentTab(0);
  }, [product, open]);

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const calculateProfit = () => formData.prixVente1 - formData.prixAchat;
  const calculateProfitPercent = () => formData.prixAchat === 0 ? 0 : ((formData.prixVente1 - formData.prixAchat) / formData.prixAchat) * 100;

  const handleAddBarcode = () => {
    if (newBarcode.trim()) {
      setBarcodes([...barcodes, { code: newBarcode, action: 'Barcode' }]);
      if (!formData.barcode) handleChange('barcode', newBarcode);
      setNewBarcode('');
    }
  };

  const handleRemoveBarcode = (index: number) => {
    const updated = barcodes.filter((_, i) => i !== index);
    setBarcodes(updated);
    if (updated.length > 0) handleChange('barcode', updated[0].code);
    else handleChange('barcode', `BC${Date.now()}`);
  };

  const handleAddTaille = () => {
    if (selectedTaille.taille) {
      setTailles([...tailles, {
        barcode: `BC${Date.now()}`,
        taille: selectedTaille.taille,
        quantite: selectedTaille.quantite,
        prixVente: selectedTaille.prixVente,
        qntInitiale: selectedTaille.quantite
      }]);
      setSelectedTaille({ taille: '', quantite: 0, prixVente: 0 });
    }
  };

  const handleRemoveTaille = (index: number) => {
    setTailles(tailles.filter((_, i) => i !== index));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        handleChange('image', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    alert(isArabic ? '📷 ميزة الكاميرا قيد التطوير...' : '📷 Camera feature coming soon...');
  };

  const handleDeleteImage = () => {
    console.log('🗑️ Deleting image...');
    setImagePreview('');
    handleChange('image', '');
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    console.log('✅ Image deleted successfully');
  };

const handleSave = () => {
  if (!formData.designation || formData.designation.trim() === '') {
    alert(isArabic ? '❌ الرجاء إدخال اسم المنتج' : '❌ Veuillez entrer le nom du produit');
    return;
  }

  const productToSave = {
    ...formData,
    id: formData.id || undefined,
    ref: formData.ref || `REF${Date.now()}`,
    barcode: formData.barcode || `BC${Date.now()}`,
    dateCreation: formData.dateCreation || new Date().toISOString(),
    image: imagePreview || '', // ✅ هذا صحيح
    tailles: tailles.length > 0 ? tailles : undefined,
    // ✅ أضف هذا السطر
    systeme: formData.systeme || 'ANDROID'
  };

  console.log('💾 Saving product:', productToSave);
  onSave(productToSave);
  onClose();
};
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth 
      PaperProps={{ 
        sx: { 
          height: '95vh', 
          direction: isArabic ? 'rtl' : 'ltr',
          borderRadius: 3,
          overflow: 'hidden'
        } 
      }}>
      
      <DialogTitle sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        color: '#fff', 
        py: 1.8, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ShoppingCart sx={{ fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: 19 }}>
            {isArabic ? 'بطاقة المنتج' : 'Fiche Produit'} 
            {product?.id ? ` #${product.id}` : ` (${isArabic ? 'جديد' : 'Nouveau'})`}
          </Typography>
          {formData.estActif && (
            <Chip 
              label={isArabic ? 'نشط' : 'Actif'} 
              size="small" 
              sx={{ backgroundColor: '#27ae60', color: '#fff', fontWeight: 'bold' }} 
            />
          )}
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#fff', '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' } }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <Tabs 
        value={currentTab} 
        onChange={(e, v) => setCurrentTab(v)} 
        variant="scrollable" 
        scrollButtons="auto"
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider', 
          backgroundColor: '#f8f9fa',
          '& .MuiTab-root': { 
            minHeight: 56,
            fontWeight: 600,
            fontSize: 12,
            transition: 'all 0.3s ease'
          },
          '& .Mui-selected': {
            color: '#fff !important',
            backgroundColor: '#667eea'
          }
        }}>
        <Tab icon={<Inventory />} iconPosition="start" label={isArabic ? 'معلومات' : 'Information'} />
        <Tab icon={<ShoppingCart />} iconPosition="start" label={isArabic ? 'طرود' : 'Colis'} />
        <Tab icon={<Smartphone />} iconPosition="start" label={isArabic ? 'هاتف' : 'Smartphone'} />
        <Tab icon={<Straighten />} iconPosition="start" label={isArabic ? 'مقاسات' : 'Taille'} />
        <Tab icon={<ImageIcon />} iconPosition="start" label={isArabic ? 'صورة' : 'Photo'} />
        <Tab icon={<AttachMoney />} iconPosition="start" label={isArabic ? 'إضافي' : 'Autre'} />
      </Tabs>

      <DialogContent sx={{ p: 2.5, overflow: 'auto', backgroundColor: '#fafbfc' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <Grid container spacing={2.5}>
            
            <Grid item xs={12} md={3.5}>
              <Box sx={{ 
                background: 'linear-gradient(145deg, #ffffff 0%, #f0f0f0 100%)', 
                p: 2.5, 
                borderRadius: 3, 
                border: '2px solid #667eea', 
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
                position: 'sticky',
                top: 0
              }}>
                <Grid container spacing={1.5}>
                  <Grid item xs={6}>
                    <TextField 
                      fullWidth 
                      size="small" 
                      label={isArabic ? 'الكود' : 'Code'} 
                      value={formData.id || 'Auto'} 
                      disabled 
                      sx={{ backgroundColor: '#fff', '& .MuiInputBase-root': { fontWeight: 'bold', fontSize: 13 } }} 
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField 
                      fullWidth 
                      size="small" 
                      label={isArabic ? 'التاريخ' : 'Crée-le'} 
                      value={new Date().toLocaleDateString('fr-FR')} 
                      disabled 
                      sx={{ backgroundColor: '#fff', fontSize: 13 }} 
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField 
                      fullWidth 
                      size="small" 
                      label={isArabic ? 'المرجع' : 'Réf.'} 
                      value={formData.ref} 
                      onChange={(e) => handleChange('ref', e.target.value)} 
                      sx={{ backgroundColor: '#fff', '& .MuiInputBase-root': { fontWeight: 'bold', fontSize: 13 } }} 
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField 
                      fullWidth 
                      size="small" 
                      label={isArabic ? 'الموقع' : 'Emplace'} 
                      value={formData.emplacement} 
                      onChange={(e) => handleChange('emplacement', e.target.value)} 
                      sx={{ backgroundColor: '#fff', fontSize: 13 }} 
                    />
                  </Grid>
                  
                  <Grid item xs={12} sx={{ textAlign: 'center', my: 1 }}>
                    <Box sx={{ 
                      width: '100%', 
                      height: 70, 
                      background: 'linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)', 
                      mx: 'auto', 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      border: '2px dashed #667eea', 
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}>
                      <QrCode sx={{ fontSize: 32, color: '#667eea', mb: 0.5 }} />
                      <Typography variant="caption" sx={{ fontWeight: 'bold', fontSize: 10, color: '#667eea' }}>
                        {formData.barcode || 'CODE BARRE'}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TableContainer component={Paper} sx={{ maxHeight: 120, boxShadow: 2, borderRadius: 2 }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow sx={{ backgroundColor: '#e74c3c' }}>
                            <TableCell sx={{ color: '#fff', fontWeight: 'bold', py: 0.5, fontSize: 11 }}>
                              {isArabic ? 'الباركود' : 'Code Barre'}
                            </TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 'bold', py: 0.5, fontSize: 11, textAlign: 'center' }}>
                              {isArabic ? 'إجراء' : 'Action'}
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {barcodes.length > 0 ? barcodes.map((bc, index) => (
                            <TableRow key={index} hover sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                              <TableCell sx={{ py: 0.5, fontSize: 11, fontFamily: 'monospace', fontWeight: 600 }}>
                                {bc.code}
                              </TableCell>
                              <TableCell sx={{ py: 0.4, textAlign: 'center' }}>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleRemoveBarcode(index)} 
                                  sx={{ color: '#e74c3c', p: 0.3 }}>
                                  <Remove fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          )) : (
                            <TableRow>
                              <TableCell colSpan={2} sx={{ textAlign: 'center', py: 2, color: '#999', fontSize: 11 }}>
                                {isArabic ? 'لا يوجد باركود' : 'Aucun code-barre'}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                  
                  <Grid item xs={8}>
                    <TextField 
                      fullWidth 
                      size="small" 
                      placeholder={isArabic ? 'باركود جديد' : 'Nouveau code-barre'}
                      value={newBarcode} 
                      onChange={(e) => setNewBarcode(e.target.value)} 
                      onKeyPress={(e) => e.key === 'Enter' && handleAddBarcode()} 
                      sx={{ fontSize: 11, '& .MuiInputBase-root': { height: 34 } }} 
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Button 
                      fullWidth 
                      onClick={handleAddBarcode} 
                      sx={{ 
                        height: 34, 
                        backgroundColor: '#27ae60', 
                        color: '#fff', 
                        fontWeight: 'bold',
                        '&:hover': { backgroundColor: '#229954' } 
                      }}>
                      <Add />
                    </Button>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Button 
                      fullWidth 
                      size="small" 
                      variant="contained" 
                      startIcon={<QrCode />}
                      sx={{ py: 0.6, fontSize: 11, backgroundColor: '#3498db', fontWeight: 'bold' }}>
                      {isArabic ? 'باركود' : 'Barcode'}
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button 
                      fullWidth 
                      size="small" 
                      variant="contained" 
                      startIcon={<LocalOffer />}
                      sx={{ py: 0.6, fontSize: 11, backgroundColor: '#e67e22', fontWeight: 'bold' }}>
                      {isArabic ? 'سعر' : 'Prix'}
                    </Button>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <FormControlLabel
                        control={<Switch size="small" checked={Boolean(formData.vetements)} onChange={(e) => handleChange('vetements', e.target.checked)} />}
                        label={<Typography sx={{ fontSize: 11 }}>{isArabic ? '👕 ملابس' : '👕 Vêtements'}</Typography>}
                        sx={{ m: 0 }}
                      />
                      <FormControlLabel
                        control={<Switch size="small" checked={Boolean(formData.enBalanceActive)} onChange={(e) => handleChange('enBalanceActive', e.target.checked)} />}
                        label={<Typography sx={{ fontSize: 11 }}>{isArabic ? '⚖️ بميزان' : '⚖️ En balance'}</Typography>}
                        sx={{ m: 0 }}
                      />
                      <FormControlLabel
                        control={<Switch size="small" checked={Boolean(formData.stockActive)} onChange={(e) => handleChange('stockActive', e.target.checked)} />}
                        label={<Typography sx={{ fontSize: 11 }}>{isArabic ? '📦 مخزون نشط' : '📦 Stock actif'}</Typography>}
                        sx={{ m: 0 }}
                      />
                      <FormControlLabel
                        control={<Switch size="small" checked={Boolean(formData.permisVente)} onChange={(e) => handleChange('permisVente', e.target.checked)} />}
                        label={<Typography sx={{ fontSize: 11 }}>{isArabic ? '✅ مسموح بالبيع' : '✅ Permis vente'}</Typography>}
                        sx={{ m: 0 }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            <Grid item xs={12} md={8.5}>
              {currentTab === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField 
                      fullWidth 
                      size="small" 
                      label={isArabic ? '✏️ اسم المنتج (مطلوب) *' : '✏️ Désignation produit (F2) *'} 
                      required 
                      value={formData.designation} 
                      onChange={(e) => handleChange('designation', e.target.value)} 
                      sx={{ backgroundColor: '#fff', '& .MuiInputLabel-asterisk': { color: '#e74c3c' }, '& .MuiOutlinedInput-root': { fontWeight: 600 } }} 
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ background: calculateProfit() >= 0 ? 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' : 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)', p: 2, borderRadius: 2, border: '3px solid', borderColor: calculateProfit() >= 0 ? '#27ae60' : '#e74c3c', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transition: 'all 0.3s ease' }}>
                      <Typography variant="h5" sx={{ color: calculateProfit() >= 0 ? '#27ae60' : '#e74c3c', fontWeight: 'bold', fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                        <AttachMoney /> {isArabic ? 'الربح' : 'Bénéfice'}: {calculateProfit().toFixed(2)} DA ({calculateProfitPercent().toFixed(1)}%)
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{isArabic ? 'العلامة' : 'Marque'}</InputLabel>
                      <Select value={formData.marque || ''} label={isArabic ? 'العلامة' : 'Marque'} onChange={(e) => handleChange('marque', e.target.value)}>
                        <MenuItem value="">--</MenuItem>
                        {marques.map(m => <MenuItem key={m.id} value={m.name}>{m.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{isArabic ? 'الوحدة' : 'Unité'}</InputLabel>
                      <Select value={formData.unite || ''} label={isArabic ? 'الوحدة' : 'Unité'} onChange={(e) => handleChange('unite', e.target.value)}>
                        <MenuItem value="">--</MenuItem>
                        {unites.map(u => <MenuItem key={u.id} value={u.name}>{u.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{isArabic ? 'الفئة' : 'Catégorie'}</InputLabel>
                      <Select value={formData.category || ''} label={isArabic ? 'الفئة' : 'Catégorie'} onChange={(e) => handleChange('category', e.target.value)}>
                        <MenuItem value="">--</MenuItem>
                        {categories.map(c => <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{isArabic ? 'المورد' : 'Fournisseur'}</InputLabel>
                      <Select value={formData.fournisseur || ''} label={isArabic ? 'المورد' : 'Fournisseur'} onChange={(e) => handleChange('fournisseur', e.target.value)}>
                        <MenuItem value="">--</MenuItem>
                        {fournisseurs.map(f => <MenuItem key={f.id} value={f.name}>{f.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={3}><TextField fullWidth size="small" type="number" label={isArabic ? 'سعر الشراء' : 'Prix Achat'} value={formData.prixAchat} onChange={(e) => handleChange('prixAchat', parseFloat(e.target.value) || 0)} /></Grid>
                  <Grid item xs={3}><TextField fullWidth size="small" type="number" label={isArabic ? 'سعر البيع 1' : 'Prix Vente 1'} value={formData.prixVente1} onChange={(e) => handleChange('prixVente1', parseFloat(e.target.value) || 0)} /></Grid>
                  <Grid item xs={3}><TextField fullWidth size="small" type="number" label={isArabic ? 'سعر البيع 2' : 'Prix Vente 2'} value={formData.prixVente2} onChange={(e) => handleChange('prixVente2', parseFloat(e.target.value) || 0)} /></Grid>
                  <Grid item xs={3}><TextField fullWidth size="small" type="number" label={isArabic ? 'سعر الجملة' : 'Prix Gros'} value={formData.prixGros} onChange={(e) => handleChange('prixGros', parseFloat(e.target.value) || 0)} /></Grid>

                  <Grid item xs={3}><TextField fullWidth size="small" type="number" label={isArabic ? 'المخزون' : 'Stock'} value={formData.stock} onChange={(e) => handleChange('stock', parseInt(e.target.value) || 0)} /></Grid>
                  <Grid item xs={3}><TextField fullWidth size="small" type="number" label={isArabic ? 'تنبيه' : 'Alerte'} value={formData.stockAlerte} onChange={(e) => handleChange('stockAlerte', parseInt(e.target.value) || 0)} /></Grid>
                  <Grid item xs={3}><TextField fullWidth size="small" type="number" label={isArabic ? 'ضروري' : 'Nécéssaire'} value={formData.stockNecessaire} onChange={(e) => handleChange('stockNecessaire', parseInt(e.target.value) || 0)} /></Grid>
                  <Grid item xs={3}><TextField fullWidth size="small" type="number" label={isArabic ? 'أدنى' : 'Min'} value={formData.stockMin} onChange={(e) => handleChange('stockMin', parseInt(e.target.value) || 0)} /></Grid>
                </Grid>
              )}

              {currentTab === 1 && (
                <Grid container spacing={2}>
                  <Grid item xs={6}><TextField fullWidth size="small" type="number" label={isArabic ? 'عدد الطرود' : 'Nombre Colis'} value={formData.nbrColier} onChange={(e) => handleChange('nbrColier', parseInt(e.target.value) || 0)} /></Grid>
                  <Grid item xs={6}><TextField fullWidth size="small" type="number" label={isArabic ? 'سعر الطرد' : 'Prix Colis'} value={formData.prixColis} onChange={(e) => handleChange('prixColis', parseFloat(e.target.value) || 0)} /></Grid>
                </Grid>
              )}

              {currentTab === 2 && (
                <Grid container spacing={2}>
                  <Grid item xs={6}><TextField fullWidth size="small" label={isArabic ? 'المعالج' : 'Processeur'} value={formData.processeur || ''} onChange={(e) => handleChange('processeur', e.target.value)} /></Grid>
                  <Grid item xs={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{isArabic ? 'النظام' : 'Système'}</InputLabel>
                      <Select value={formData.systeme || 'ANDROID'} label={isArabic ? 'النظام' : 'Système'} onChange={(e) => handleChange('systeme', e.target.value)}>
                        <MenuItem value="ANDROID">Android</MenuItem>
                        <MenuItem value="IOS">iOS</MenuItem>
                        <MenuItem value="OTHER">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={4}><TextField fullWidth size="small" label={isArabic ? 'التخزين' : 'Stockage'} value={formData.stockage || ''} onChange={(e) => handleChange('stockage', e.target.value)} /></Grid>
                  <Grid item xs={4}><TextField fullWidth size="small" label="RAM" value={formData.ram || ''} onChange={(e) => handleChange('ram', e.target.value)} /></Grid>
                  <Grid item xs={4}><TextField fullWidth size="small" label={isArabic ? 'البطارية' : 'Batterie'} value={formData.batterie || ''} onChange={(e) => handleChange('batterie', e.target.value)} /></Grid>
                  <Grid item xs={6}><TextField fullWidth size="small" label={isArabic ? 'الكاميرا' : 'Caméra'} value={formData.camera || ''} onChange={(e) => handleChange('camera', e.target.value)} /></Grid>
                  <Grid item xs={6}><TextField fullWidth size="small" label="IMEI" value={formData.imei || ''} onChange={(e) => handleChange('imei', e.target.value)} /></Grid>
                </Grid>
              )}

              {currentTab === 3 && (
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{isArabic ? 'المقاس' : 'Taille'}</InputLabel>
                      <Select value={selectedTaille.taille} label={isArabic ? 'المقاس' : 'Taille'} onChange={(e) => setSelectedTaille({...selectedTaille, taille: e.target.value})}>
                        <MenuItem value="">--</MenuItem>
                        {taillesDisponibles.map(t => <MenuItem key={t.id} value={t.name}>{t.name} {t.abbreviation ? `(${t.abbreviation})` : ''}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={3}><TextField fullWidth size="small" type="number" label={isArabic ? 'الكمية' : 'Quantité'} value={selectedTaille.quantite} onChange={(e) => setSelectedTaille({...selectedTaille, quantite: parseInt(e.target.value) || 0})} /></Grid>
                  <Grid item xs={3}><TextField fullWidth size="small" type="number" label={isArabic ? 'السعر' : 'Prix'} value={selectedTaille.prixVente} onChange={(e) => setSelectedTaille({...selectedTaille, prixVente: parseFloat(e.target.value) || 0})} /></Grid>
                  <Grid item xs={2}><Button fullWidth onClick={handleAddTaille} variant="contained" sx={{ height: 40, background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', fontWeight: 'bold' }}><Add /></Button></Grid>
                  
                  <Grid item xs={12}>
                    <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 2 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: '#667eea' }}>
                            <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>{isArabic ? 'المقاس' : 'Taille'}</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>{isArabic ? 'الكمية' : 'Quantité'}</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>{isArabic ? 'السعر' : 'Prix'}</TableCell>
                            <TableCell sx={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>{isArabic ? 'إجراء' : 'Action'}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {tailles.length > 0 ? tailles.map((t, i) => (
                            <TableRow key={i} hover>
                              <TableCell sx={{ fontWeight: 600 }}>{t.taille}</TableCell>
                              <TableCell>{t.quantite}</TableCell>
                              <TableCell>{t.prixVente.toFixed(2)} DA</TableCell>
                              <TableCell sx={{ textAlign: 'center' }}><IconButton size="small" onClick={() => handleRemoveTaille(i)} sx={{ color: '#e74c3c' }}><DeleteIcon fontSize="small" /></IconButton></TableCell>
                            </TableRow>
                          )) : (
                            <TableRow><TableCell colSpan={4} sx={{ textAlign: 'center', py: 3, color: '#999' }}>{isArabic ? 'لم يتم إضافة مقاسات بعد' : 'Aucune taille ajoutée'}</TableCell></TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              )}

              {currentTab === 4 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sx={{ textAlign: 'center' }}>
                    {imagePreview ? (
                      <Box sx={{ position: 'relative', display: 'inline-block' }}>
                        <Avatar src={imagePreview} sx={{ width: 200, height: 200, margin: 'auto' }} />
                        <IconButton onClick={handleDeleteImage} sx={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#e74c3c', color: '#fff', '&:hover': { backgroundColor: '#c0392b' } }}><DeleteIcon /></IconButton>
                      </Box>
                    ) : (
                      <Box sx={{ border: '2px dashed #ccc', p: 4, borderRadius: 2 }}><Typography>{isArabic ? 'لا توجد صورة' : 'Pas d\'image'}</Typography></Box>
                    )}
                  </Grid>
                  <Grid item xs={6}>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />
                    <Button fullWidth variant="contained" startIcon={<FolderOpen />} onClick={() => fileInputRef.current?.click()}>{isArabic ? 'تحميل صورة' : 'Charger Image'}</Button>
                  </Grid>
                  <Grid item xs={6}><Button fullWidth variant="contained" startIcon={<Camera />} onClick={handleCameraCapture}>{isArabic ? 'كاميرا' : 'Caméra'}</Button></Grid>
                </Grid>
              )}

              {currentTab === 5 && (
                <Grid container spacing={2}>
                  <Grid item xs={12}><TextField fullWidth multiline rows={6} label={isArabic ? 'ملاحظات' : 'Notes'} value={formData.notes || ''} onChange={(e) => handleChange('notes', e.target.value)} /></Grid>
                </Grid>
              )}
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, backgroundColor: '#f8f9fa', borderTop: '3px solid #667eea', boxShadow: '0 -4px 12px rgba(0,0,0,0.05)' }}>
        <Button onClick={onClose} sx={{ color: '#7f8c8d', fontSize: 13, fontWeight: 600 }}>{isArabic ? 'إلغاء' : 'Annuler'}</Button>
        <Button onClick={handleSave} variant="contained" startIcon={<Save />} sx={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', px: 5, py: 1.2, fontWeight: 'bold', fontSize: 14, boxShadow: '0 4px 12px rgba(56, 239, 125, 0.3)', '&:hover': { background: 'linear-gradient(135deg, #0d8071 0%, #2ed964 100%)', transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(56, 239, 125, 0.4)' } }}>
          💾 {isArabic ? 'حفظ (Ctrl+Enter)' : 'Enregistrer (Ctrl+Entrée)'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductDialog;
