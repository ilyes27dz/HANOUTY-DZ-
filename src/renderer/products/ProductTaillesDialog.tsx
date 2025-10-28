// src/renderer/products/ProductTaillesDialog.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, IconButton, TextField, Box, Snackbar, Alert, Tooltip
} from '@mui/material';
import { Save, Add, Delete, Edit } from '@mui/icons-material';

interface Taille {
  id: number;
  name: string;
  abbreviation?: string;
}

interface ProductTaillesDialogProps {
  open: boolean;
  onClose: () => void;
  isArabic: boolean;
}

const ProductTaillesDialog: React.FC<ProductTaillesDialogProps> = ({ open, onClose, isArabic }) => {
  const [tailles, setTailles] = useState<Taille[]>([]);
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
    if (open) loadTailles();
  }, [open]);

  const loadTailles = async () => {
    try {
      const data = await window.electron.getTailles();
      setTailles(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSelect = (taille: Taille) => {
    setSelectedId(taille.id);
    setInputValue(taille.name);
  };

  const handleAdd = () => {
    const newTaille = { 
      id: Date.now(), 
      name: isArabic ? 'غير معروف' : 'inconnu', 
      abbreviation: '' 
    };
    setTailles([...tailles, newTaille]);
    setSelectedId(newTaille.id);
    setInputValue(newTaille.name);
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
      const taille = tailles.find(t => t.id === selectedId);
      if (!taille) return;

      if (taille.id < 1000000) {
        await window.electron.updateTaille({ 
          id: taille.id, 
          name: inputValue, 
          abbreviation: '' 
        });
      } else {
        await window.electron.addTaille({ 
          name: inputValue, 
          abbreviation: '' 
        });
      }
      
      setSnackbar({ 
        open: true, 
        message: isArabic ? '✅ تم الحفظ' : '✅ Enregistré', 
        severity: 'success' 
      });
      
      loadTailles();
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
      const taille = tailles.find(t => t.id === selectedId);
      if (!taille) return;

      if (taille.id < 1000000) {
        await window.electron.deleteTaille(taille.id);
        setSnackbar({ 
          open: true, 
          message: isArabic ? '✅ تم الحذف' : '✅ Supprimé', 
          severity: 'success' 
        });
        loadTailles();
      } else {
        setTailles(tailles.filter(t => t.id !== selectedId));
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
            {isArabic ? 'الحجم' : 'Taille'}
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
            {tailles.length > 0 ? (
              tailles.map((taille) => (
                <Box
                  key={taille.id}
                  onClick={() => handleSelect(taille)}
                  sx={{
                    p: 1.5,
                    cursor: 'pointer',
                    bgcolor: selectedId === taille.id ? '#e3f2fd' : '#fff',
                    borderBottom: '1px solid #eee',
                    '&:hover': { 
                      bgcolor: selectedId === taille.id ? '#e3f2fd' : '#f5f5f5' 
                    },
                    '&:last-child': { borderBottom: 'none' },
                    fontSize: 14,
                    fontWeight: selectedId === taille.id ? 600 : 400,
                    color: '#2c3e50',
                    textAlign: isArabic ? 'right' : 'left'
                  }}
                >
                  {taille.name}
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

export default ProductTaillesDialog;
