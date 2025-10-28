// src/renderer/products/ProductUnitesDialog.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, IconButton, TextField, Box, Snackbar, Alert, Tooltip
} from '@mui/material';
import { Save, Add, Delete, Edit } from '@mui/icons-material';

interface Unite {
  id: number;
  name: string;
  abbreviation?: string;
}

interface ProductUnitesDialogProps {
  open: boolean;
  onClose: () => void;
  isArabic: boolean;
}

const ProductUnitesDialog: React.FC<ProductUnitesDialogProps> = ({ open, onClose, isArabic }) => {
  const [unites, setUnites] = useState<Unite[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');
  
  const [snackbar, setSnackbar] = useState<{ 
    open: boolean; 
    message: string; 
    severity: 'success' | 'error' 
  }>({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  useEffect(() => {
    if (open) loadUnites();
  }, [open]);

  const loadUnites = async () => {
    try {
      const data = await window.electron.getUnites();
      setUnites(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSelect = (unite: Unite) => {
    setSelectedId(unite.id);
    setInputValue(unite.name);
  };

  const handleAdd = () => {
    const newUnite = { 
      id: Date.now(), 
      name: isArabic ? 'غير معروف' : 'inconnu', 
      abbreviation: '' 
    };
    setUnites([...unites, newUnite]);
    setSelectedId(newUnite.id);
    setInputValue(newUnite.name);
  };

  const handleSave = async () => {
    if (!inputValue.trim()) {
      setSnackbar({ 
        open: true, 
        message: isArabic ? '⚠️ أدخل الاسم' : '⚠️ Entrez le nom', 
        severity: 'error' 
      });
      return;
    }

    if (selectedId === null) return;

    try {
      const unite = unites.find(u => u.id === selectedId);
      if (!unite) return;

      if (unite.id < 1000000) {
        await window.electron.updateUnite({ 
          id: unite.id, 
          name: inputValue, 
          abbreviation: '' 
        });
      } else {
        await window.electron.addUnite({ 
          name: inputValue, 
          abbreviation: '' 
        });
      }
      
      setSnackbar({ 
        open: true, 
        message: isArabic ? '✅ تم الحفظ' : '✅ Enregistré', 
        severity: 'success' 
      });
      
      loadUnites();
      setSelectedId(null);
      setInputValue('');
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: isArabic ? '❌ خطأ' : '❌ Erreur', 
        severity: 'error' 
      });
    }
  };

  const handleDelete = async () => {
    if (selectedId === null) return;
    
    if (!window.confirm(isArabic ? 'هل تريد الحذف؟' : 'Voulez-vous supprimer?')) return;

    try {
      const unite = unites.find(u => u.id === selectedId);
      if (!unite) return;

      if (unite.id < 1000000) {
        await window.electron.deleteUnite(unite.id);
        setSnackbar({ 
          open: true, 
          message: isArabic ? '✅ تم الحذف' : '✅ Supprimé', 
          severity: 'success' 
        });
        loadUnites();
      } else {
        setUnites(unites.filter(u => u.id !== selectedId));
      }
      
      setSelectedId(null);
      setInputValue('');
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: isArabic ? '❌ لا يمكن الحذف' : '❌ Impossible de supprimer', 
        severity: 'error' 
      });
    }
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="sm" 
        fullWidth 
        PaperProps={{ 
          sx: { 
            borderRadius: 0,
            border: '2px solid #000'
          } 
        }}
      >
        {/* Header */}
        <Box sx={{ 
          bgcolor: '#000', 
          color: '#fff', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          py: 1, 
          px: 2
        }}>
          <Box sx={{ fontWeight: 'bold', fontSize: 16 }}>
            {isArabic ? 'الوحدة' : 'Unité'}
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton 
              size="small" 
              sx={{ 
                bgcolor: '#555', 
                color: '#fff', 
                borderRadius: 0, 
                width: 28, 
                height: 24,
                fontSize: 16,
                '&:hover': { bgcolor: '#666' }
              }}
            >
              −
            </IconButton>
            <IconButton 
              size="small" 
              sx={{ 
                bgcolor: '#555', 
                color: '#fff', 
                borderRadius: 0, 
                width: 28, 
                height: 24,
                fontSize: 14,
                '&:hover': { bgcolor: '#666' }
              }}
            >
              ◻
            </IconButton>
            <IconButton 
              size="small" 
              onClick={onClose} 
              sx={{ 
                bgcolor: '#e74c3c', 
                color: '#fff', 
                borderRadius: 0, 
                width: 28, 
                height: 24,
                fontSize: 18,
                fontWeight: 'bold',
                '&:hover': { bgcolor: '#c0392b' }
              }}
            >
              ×
            </IconButton>
          </Box>
        </Box>

        <DialogContent sx={{ p: 2, bgcolor: '#f5f5f5' }}>
          {/* Input Area */}
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            mb: 2,
            alignItems: 'center',
            bgcolor: '#fff',
            p: 2,
            border: '2px solid #ddd',
            borderRadius: 1
          }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ 
                fontSize: 12, 
                color: '#666', 
                mb: 0.5,
                fontWeight: 600,
                textAlign: isArabic ? 'right' : 'left'
              }}>
                {isArabic ? 'التسمية' : 'Désignation'}
              </Box>
              <TextField 
                fullWidth 
                size="small" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isArabic ? 'أدخل الاسم...' : 'Entrez le nom...'}
                disabled={selectedId === null}
                InputProps={{ 
                  sx: { 
                    bgcolor: selectedId === null ? '#f0f0f0' : '#fff',
                    fontSize: 14,
                    '& .MuiOutlinedInput-notchedOutline': { 
                      borderColor: '#ddd' 
                    }
                  } 
                }}
                sx={{ 
                  '& .MuiInputBase-input': { 
                    textAlign: isArabic ? 'right' : 'left' 
                  } 
                }}
              />
            </Box>

            {/* Buttons */}
            <Box sx={{ display: 'flex', gap: 0.5, pt: 2.5 }}>
              <Tooltip title={isArabic ? 'حفظ' : 'Enregistrer'}>
                <span>
                  <IconButton 
                    onClick={handleSave}
                    disabled={selectedId === null || !inputValue.trim()}
                    sx={{ 
                      bgcolor: '#28a745', 
                      color: '#fff',
                      borderRadius: 1,
                      width: 40,
                      height: 40,
                      '&:hover': { bgcolor: '#218838' },
                      '&:disabled': { bgcolor: '#ccc', color: '#999' }
                    }}
                  >
                    <Save fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title={isArabic ? 'جديد' : 'Nouveau'}>
                <IconButton 
                  onClick={handleAdd}
                  sx={{ 
                    bgcolor: '#007bff', 
                    color: '#fff',
                    borderRadius: 1,
                    width: 40,
                    height: 40,
                    '&:hover': { bgcolor: '#0056b3' }
                  }}
                >
                  <Add fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title={isArabic ? 'تعديل' : 'Modifier'}>
                <span>
                  <IconButton 
                    disabled={selectedId === null}
                    sx={{ 
                      bgcolor: '#ffc107', 
                      color: '#000',
                      borderRadius: 1,
                      width: 40,
                      height: 40,
                      '&:hover': { bgcolor: '#e0a800' },
                      '&:disabled': { bgcolor: '#ccc', color: '#999' }
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title={isArabic ? 'حذف' : 'Supprimer'}>
                <span>
                  <IconButton 
                    onClick={handleDelete}
                    disabled={selectedId === null}
                    sx={{ 
                      bgcolor: '#dc3545', 
                      color: '#fff',
                      borderRadius: 1,
                      width: 40,
                      height: 40,
                      '&:hover': { bgcolor: '#c82333' },
                      '&:disabled': { bgcolor: '#ccc', color: '#999' }
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>

          {/* List */}
          <Box sx={{ 
            bgcolor: '#fff', 
            border: '2px solid #ddd',
            borderRadius: 1,
            maxHeight: 300,
            overflow: 'auto'
          }}>
            {unites.length > 0 ? (
              unites.map((unite) => (
                <Box
                  key={unite.id}
                  onClick={() => handleSelect(unite)}
                  sx={{
                    p: 1.5,
                    cursor: 'pointer',
                    bgcolor: selectedId === unite.id ? '#e3f2fd' : '#fff',
                    borderBottom: '1px solid #eee',
                    '&:hover': { 
                      bgcolor: selectedId === unite.id ? '#e3f2fd' : '#f5f5f5' 
                    },
                    '&:last-child': { borderBottom: 'none' },
                    fontSize: 14,
                    fontWeight: selectedId === unite.id ? 600 : 400,
                    color: '#2c3e50',
                    textAlign: isArabic ? 'right' : 'left'
                  }}
                >
                  {unite.name}
                </Box>
              ))
            ) : (
              <Box sx={{ 
                p: 4, 
                textAlign: 'center', 
                color: '#999',
                fontSize: 14
              }}>
                {isArabic ? 'لا توجد عناصر' : 'Aucun élément'}
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          sx={{ width: '100%', fontWeight: 'bold' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProductUnitesDialog;
