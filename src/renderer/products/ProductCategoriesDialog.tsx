// src/renderer/products/ProductCategoriesDialog.tsx - ✅ نافذة بسيطة فقط
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Box, Typography, Paper
} from '@mui/material';
import { Delete, Edit, Add, Close } from '@mui/icons-material';

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface ProductCategoriesDialogProps {
  open: boolean;
  onClose: () => void;
  isArabic: boolean;
}

const ProductCategoriesDialog: React.FC<ProductCategoriesDialogProps> = ({ open, onClose, isArabic }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open]);

  const loadCategories = async () => {
    try {
      const data = await window.electron.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleAdd = async () => {
    if (!newCategory.trim()) return;

    try {
      await window.electron.addCategory({ name: newCategory, description: '' });
      setNewCategory('');
      loadCategories();
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleEdit = async (id: number) => {
    if (!editValue.trim()) return;

    try {
      await window.electron.updateCategory({ id, name: editValue, description: '' });
      setEditingId(null);
      setEditValue('');
      loadCategories();
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(isArabic ? 'حذف؟' : 'Supprimer?')) {
      try {
        await window.electron.deleteCategory(id);
        loadCategories();
      } catch (error) {
        alert(isArabic ? '❌ لا يمكن الحذف' : '❌ Impossible de supprimer');
      }
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditValue(category.name);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{ sx: { height: '600px', maxHeight: '90vh' } }}
    >
      {/* Header */}
      <DialogTitle 
        sx={{ 
          backgroundColor: '#2c3e50', 
          color: '#fff', 
          py: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: 16 }}>
          {isArabic ? 'الفئات' : 'Catégories'}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: '#fff', p: 0.5 }}>
          <Close />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Table Header */}
        <Box sx={{ backgroundColor: '#34495e', color: '#fff', py: 1, px: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {isArabic ? 'التصنيف' : 'Désignation'}
          </Typography>
        </Box>

        {/* Table Body - Scrollable */}
        <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableBody>
              {categories.map((category, index) => (
                <TableRow 
                  key={category.id}
                  sx={{ 
                    backgroundColor: index % 2 === 0 ? '#fff' : '#f5f5f5',
                    '&:hover': { backgroundColor: '#d4edda' }
                  }}
                >
                  <TableCell sx={{ py: 1, px: 2 }}>
                    {editingId === category.id ? (
                      <TextField
                        fullWidth
                        size="small"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleEdit(category.id)}
                        autoFocus
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            height: 30,
                            fontSize: 14
                          } 
                        }}
                      />
                    ) : (
                      <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                        {category.name}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ width: 100, textAlign: 'right', py: 0.5 }}>
                    {editingId === category.id ? (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleEdit(category.id)}
                        sx={{ 
                          minWidth: 70,
                          height: 28,
                          fontSize: 12,
                          backgroundColor: '#ffc107',
                          color: '#000',
                          '&:hover': { backgroundColor: '#ffb300' }
                        }}
                      >
                        {isArabic ? 'حفظ' : 'OK'}
                      </Button>
                    ) : (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => startEdit(category)}
                          sx={{ 
                            color: '#007bff',
                            p: 0.5,
                            mr: 0.5
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(category.id)}
                          sx={{ 
                            color: '#dc3545',
                            p: 0.5
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      {/* Footer - Add New */}
      <DialogActions 
        sx={{ 
          p: 2, 
          gap: 1,
          borderTop: '1px solid #ddd',
          backgroundColor: '#f8f9fa'
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder={isArabic ? 'فئة جديدة...' : 'Nouvelle catégorie...'}
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          sx={{ flex: 1 }}
        />
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAdd}
          sx={{
            backgroundColor: '#28a745',
            color: '#fff',
            fontWeight: 'bold',
            px: 3,
            '&:hover': { backgroundColor: '#218838' }
          }}
        >
          {isArabic ? 'إضافة' : 'Ajouter'}
        </Button>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            backgroundColor: '#dc3545',
            color: '#fff',
            fontWeight: 'bold',
            px: 3,
            '&:hover': { backgroundColor: '#c82333' }
          }}
        >
          {isArabic ? 'إغلاق' : 'Fermer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductCategoriesDialog;
