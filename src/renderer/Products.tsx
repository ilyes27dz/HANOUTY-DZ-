// src/renderer/Products.tsx - ✅ النسخة المُصلحة
import React, { useState } from 'react';
import ProductMenu from './products/ProductMenu';
import ProductList from './products/ProductList';
import ProductPricing from './products/ProductPricing';
import ProductPromotion from './products/ProductPromotion';
import ProductLost from './products/ProductLost';
import ProductEtiquetteA4 from './products/ProductEtiquetteA4';
import ProductEtiquetteThermal from './products/ProductEtiquetteThermal';
import ProductCorrectionStock from './products/ProductCorrectionStock';
import ProductMarquesDialog from './products/ProductMarquesDialog';
import ProductUnitesDialog from './products/ProductUnitesDialog';
import ProductTaillesDialog from './products/ProductTaillesDialog';
import ProductCategoriesDialog from './products/ProductCategoriesDialog'; // ✅ غيّر هنا
import ProductDialog from './products/ProductDialog';

interface ProductsProps {
  isArabic: boolean;
}

const Products: React.FC<ProductsProps> = ({ isArabic }) => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [openMarques, setOpenMarques] = useState(false);
  const [openUnites, setOpenUnites] = useState(false);
  const [openTailles, setOpenTailles] = useState(false);
  const [openCategories, setOpenCategories] = useState(false); // ✅ أضف هنا
  const [openAddProduct, setOpenAddProduct] = useState(false);

  const handleCardClick = (id: string) => {
    if (id === 'marques') {
      setOpenMarques(true);
      return;
    }
    if (id === 'unites') {
      setOpenUnites(true);
      return;
    }
    if (id === 'tailles') {
      setOpenTailles(true);
      return;
    }
    // ✅ أضف هنا
    if (id === 'categories') {
      setOpenCategories(true);
      return;
    }
    if (id === 'add') {
      setOpenAddProduct(true);
      return;
    }
    setSelectedCard(id);
  };

  const handleBackToMenu = () => {
    setSelectedCard(null);
  };

  const handleSaveNewProduct = async (product: any) => {
    try {
      await window.electron.addProduct(product);
      setOpenAddProduct(false);
      alert(isArabic ? '✅ تم إضافة المنتج بنجاح!' : '✅ Produit ajouté avec succès!');
    } catch (error) {
      console.error('❌ Error adding product:', error);
      alert(isArabic ? '❌ خطأ في الإضافة!' : '❌ Erreur d\'ajout!');
    }
  };

  if (!selectedCard) {
    return (
      <>
        <ProductMenu isArabic={isArabic} onCardClick={handleCardClick} />
        
        {/* Dialogs */}
        <ProductMarquesDialog open={openMarques} onClose={() => setOpenMarques(false)} isArabic={isArabic} />
        <ProductUnitesDialog open={openUnites} onClose={() => setOpenUnites(false)} isArabic={isArabic} />
        <ProductTaillesDialog open={openTailles} onClose={() => setOpenTailles(false)} isArabic={isArabic} />
        <ProductCategoriesDialog open={openCategories} onClose={() => setOpenCategories(false)} isArabic={isArabic} /> {/* ✅ أضف هنا */}
        
        <ProductDialog 
          open={openAddProduct} 
          onClose={() => setOpenAddProduct(false)} 
          isArabic={isArabic} 
          product={null} 
          onSave={handleSaveNewProduct} 
        />
      </>
    );
  }

  switch (selectedCard) {
    case 'liste':
      return <ProductList isArabic={isArabic} onBack={handleBackToMenu} />;
    case 'pricing':
      return <ProductPricing isArabic={isArabic} onBack={handleBackToMenu} />;
    case 'promotion':
      return <ProductPromotion isArabic={isArabic} onBack={handleBackToMenu} />;
    case 'lost':
      return <ProductLost isArabic={isArabic} onBack={handleBackToMenu} />;
    // ✅ احذف case 'categories' من هنا!
    case 'etiquette-a4':
      return <ProductEtiquetteA4 isArabic={isArabic} onBack={handleBackToMenu} />;
    case 'etiquette-thermal':
      return <ProductEtiquetteThermal isArabic={isArabic} onBack={handleBackToMenu} />;
    case 'correction':
      return <ProductCorrectionStock isArabic={isArabic} onBack={handleBackToMenu} />;
    default:
      return <ProductMenu isArabic={isArabic} onCardClick={handleCardClick} />;
  }
};

export default Products;
