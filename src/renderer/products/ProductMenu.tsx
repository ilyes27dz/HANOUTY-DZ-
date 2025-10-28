// src/renderer/products/ProductMenu.tsx - ✅ تصميم مثالي مثل الصورة
import React from 'react';
import { Box, Card, CardContent, Typography, Grid } from '@mui/material';

interface MenuCard {
  id: string;
  title: string;
  titleAr: string;
  emoji: string; // ✅ استخدام Emoji بدلاً من Icons
  bgColor: string;
}

interface ProductMenuProps {
  isArabic: boolean;
  onCardClick: (id: string) => void;
}

const ProductMenu: React.FC<ProductMenuProps> = ({ isArabic, onCardClick }) => {
  const menuCards: MenuCard[] = [
    { id: 'liste', title: 'Liste produits', titleAr: 'قائمة المنتجات', emoji: '📦', bgColor: '#3498db' },
    { id: 'add', title: 'Ajouter Article', titleAr: 'إضافة منتج', emoji: '➕', bgColor: '#f39c12' },
    { id: 'pricing', title: 'Gestion les prix', titleAr: 'إدارة الأسعار', emoji: '🏷️', bgColor: '#9b59b6' },
    { id: 'lost', title: 'Produit perte', titleAr: 'منتج مفقود', emoji: '❌', bgColor: '#e74c3c' },
    
    { id: 'etiquette-a4', title: 'Étiquettes A4 (Multi)', titleAr: 'ملصقات A4 (متعددة)', emoji: '🖨️', bgColor: '#16a085' },
    { id: 'etiquette-thermal', title: 'Étiquettes therm (Multi)', titleAr: 'ملصقات حرارية (متعددة)', emoji: '🧾', bgColor: '#27ae60' },
    { id: 'correction', title: 'Correction stock', titleAr: 'تصحيح المخزون', emoji: '📝', bgColor: '#34495e' },
    { id: 'promotion', title: 'Promotion', titleAr: 'عروض', emoji: '📢', bgColor: '#e67e22' },
    
    { id: 'categories', title: 'Catégories', titleAr: 'الفئات', emoji: '📁', bgColor: '#f39c12' },
    { id: 'marques', title: 'Marque', titleAr: 'الماركات', emoji: '🔖', bgColor: '#c0392b' },
    { id: 'unites', title: 'unités', titleAr: 'الوحدات', emoji: '📏', bgColor: '#2c3e50' },
    { id: 'tailles', title: 'Tailles', titleAr: 'المقاسات', emoji: '👕', bgColor: '#8e44ad' }
  ];

  return (
    <Box 
      sx={{ 
        p: 3, 
        backgroundColor: '#ecf0f1', 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Grid container spacing={2} sx={{ maxWidth: 1000 }}>
        {menuCards.map((card) => (
          <Grid item xs={6} sm={4} md={3} key={card.id}>
            <Card
              onClick={() => onCardClick(card.id)}
              sx={{
                backgroundColor: card.bgColor,
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
                },
              }}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '20px 15px !important',
                  minHeight: '120px',
                  justifyContent: 'center',
                }}
              >
                {/* Emoji Icon */}
                <Box
                  sx={{
                    fontSize: '50px',
                    mb: 1,
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                  }}
                >
                  {card.emoji}
                </Box>

                {/* Title */}
                <Typography
                  variant="body2"
                  sx={{
                    color: '#fff',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    fontSize: '13px',
                    lineHeight: 1.3,
                    textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  }}
                >
                  {isArabic ? card.titleAr : card.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ProductMenu;
