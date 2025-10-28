// src/renderer/products/ProductMarquesDialog.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, IconButton, TextField, Box, Snackbar, Alert, Tooltip
} from '@mui/material';
import { Save, Add, Delete, Edit } from '@mui/icons-material';

interface Marque {
  id: number;
  name: string;
  description?: string;
}

interface ProductMarquesDialogProps {
  open: boolean;
  onClose: () => void;
  isArabic: boolean;
}

const ProductMarquesDialog: React.FC<ProductMarquesDialogProps> = ({ open, onClose, isArabic }) => {
  const [marques, setMarques] = useState<Marque[]>([]);
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
    if (open) loadMarques();
  }, [open]);

  const loadMarques = async () => {
    try {
      const data = await window.electron.getMarques();
      setMarques(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSelect = (marque: Marque) => {
    setSelectedId(marque.id);
    setInputValue(marque.name);
  };

  const handleAdd = () => {
    const newMarque = { 
      id: Date.now(), 
      name: isArabic ? 'غير معروف' : 'inconnu', 
      description: '' 
    };
    setMarques([...marques, newMarque]);
    setSelectedId(newMarque.id);
    setInputValue(newMarque.name);
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
      const marque = marques.find(m => m.id === selectedId);
      if (!marque) return;

      if (marque.id < 1000000) {
        await window.electron.updateMarque({ 
          id: marque.id, 
          name: inputValue, 
          description: '' 
        });
      } else {
        await window.electron.addMarque({ 
          name: inputValue, 
          description: '' 
        });
      }
      
      setSnackbar({ 
        open: true, 
        message: isArabic ? '✅ تم الحفظ' : '✅ Enregistré', 
        severity: 'success' 
      });
      
      loadMarques();
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
      const marque = marques.find(m => m.id === selectedId);
      if (!marque) return;

      if (marque.id < 1000000) {
        await window.electron.deleteMarque(marque.id);
        setSnackbar({ 
          open: true, 
          message: isArabic ? '✅ تم الحذف' : '✅ Supprimé', 
          severity: 'success' 
        });
        loadMarques();
      } else {
        setMarques(marques.filter(m => m.id !== selectedId));
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
            {isArabic ? 'العلامة التجارية' : 'Marque'}
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
            {marques.length > 0 ? (
              marques.map((marque) => (
                <Box
                  key={marque.id}
                  onClick={() => handleSelect(marque)}
                  sx={{
                    p: 1.5,
                    cursor: 'pointer',
                    bgcolor: selectedId === marque.id ? '#e3f2fd' : '#fff',
                    borderBottom: '1px solid #eee',
                    '&:hover': { 
                      bgcolor: selectedId === marque.id ? '#e3f2fd' : '#f5f5f5' 
                    },
                    '&:last-child': { borderBottom: 'none' },
                    fontSize: 14,
                    fontWeight: selectedId === marque.id ? 600 : 400,
                    color: '#2c3e50',
                    textAlign: isArabic ? 'right' : 'left'
                  }}
                >
                  {marque.name}
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

export default ProductMarquesDialog;
