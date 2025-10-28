// src/renderer/Dashboard.tsx - ✅ النسخة النهائية الكاملة 100%
import React, { useState, useEffect } from 'react';
import { 
  Box, IconButton, Tooltip, Typography, Card, CardContent, Grid, Avatar, 
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, 
  MenuItem, Select, FormControl, InputLabel, Badge, Divider, Alert, 
  LinearProgress, Chip, List, ListItem, ListItemText, ListItemIcon
} from '@mui/material';
import {
  ExitToApp as LogoutIcon,
  Lock as LockIcon,
  DesktopWindows as AnydeskIcon,
  Refresh as RefreshIcon,
  CloudUpload as UploadIcon,
  Settings as SettingsIcon,
  Notifications as NotificationIcon,
  Lightbulb,
  Facebook,
  Instagram,
  YouTube,
  Language as LanguageIcon,
  Home as HomeIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  People as ClientsIcon,
  LocalShipping as SupplierIcon,
  BarChart as StatsIcon,
  AttachMoney as MoneyIcon,
  AdminPanelSettings as AdminIcon,
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Computer as ComputerIcon,
  VpnKey as KeyIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';

import Products from './Products';

interface DashboardProps {
  onLogout: () => void;
  onLock: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout, onLock }) => {
  // ============================================
  // 🔹 States
  // ============================================
  const [selectedMenu, setSelectedMenu] = useState('home');
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const [isArabic, setIsArabic] = useState(false);
  
  // Dialog States
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showInitialSetup, setShowInitialSetup] = useState(false);
  const [showDailyReminder, setShowDailyReminder] = useState(false);
  const [showNotificationsDialog, setShowNotificationsDialog] = useState(false);
  
  // Form States
  const [activationKey, setActivationKey] = useState('');
  const [machineId, setMachineId] = useState('');
  const [computerName, setComputerName] = useState('');
  
  // Activation States
  const [isTrial, setIsTrial] = useState(false);
  const [activationType, setActivationType] = useState('');
  
  // Notification States
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [hiddenNotifications, setHiddenNotifications] = useState<string[]>([]);
  
  // Update States
  const [availableUpdate, setAvailableUpdate] = useState<any>(null);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  
  // Store Settings
  const [storeSettings, setStoreSettings] = useState({
    storeName: '',
    activity: '',
    wilaya: '',
    address: '',
    phone: '',
    email: ''
  });
  // ============================================
  // 🔹 Effects
  // ============================================
  useEffect(() => {
    loadInitialData();
    checkDailyReminder();
    loadNotifications();
    
    // تحديث الإشعارات كل 30 ثانية
    const notificationInterval = setInterval(() => {
      loadNotifications();
    }, 30000);
    
    return () => clearInterval(notificationInterval);
  }, []);

  // ============================================
  // 🔹 Load Initial Data
  // ============================================
  const loadInitialData = async () => {
    console.log('📥 Loading initial data...');
    
    // تحميل إعدادات المتجر
    const saved = localStorage.getItem('storeSettings');
    console.log('🔍 Store Settings:', saved);
    
    if (!saved) {
      console.log('✅ No settings, showing Initial Setup');
      setShowInitialSetup(true);
    } else {
      setStoreSettings(JSON.parse(saved));
    }

    // تحميل الإشعارات المخفية
    const hidden = localStorage.getItem('hiddenNotifications');
    if (hidden) {
      setHiddenNotifications(JSON.parse(hidden));
    }

    // حساب الأيام المتبقية
    const isTrial = localStorage.getItem('isTrial') === 'true';
    const trialStartDate = localStorage.getItem('trialStartDate');
    const trialDays = parseInt(localStorage.getItem('trialDays') || '5', 10);
    const activationType = localStorage.getItem('activationType') || '';

    setIsTrial(isTrial);
    setActivationType(activationType);

    if (isTrial && trialStartDate) {
      const startDate = new Date(trialStartDate);
      const currentDate = new Date();
      const daysPassed = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysLeft = trialDays - daysPassed;
      setTrialDaysLeft(daysLeft > 0 ? daysLeft : 0);
    }

    // الحصول على Machine ID
    if (typeof window !== 'undefined' && (window as any).electron) {
      try {
        const result = await (window as any).electron.getMachineInfo();
        if (result && result.success) {
          setComputerName(result.computerName);
          setMachineId(result.machineId);
          console.log('✅ Machine Info:', result.computerName, result.machineId);
        }
      } catch (error) {
        console.error('❌ Error getting machine info:', error);
      }
    }
  };

  // ============================================
  // 🔹 Check Daily Reminder
  // ============================================
  const checkDailyReminder = () => {
    const lastReminder = localStorage.getItem('lastDailyReminder');
    const today = new Date().toDateString();
    const isTrial = localStorage.getItem('isTrial') === 'true';
    
    if (isTrial && lastReminder !== today) {
      setTimeout(() => {
        setShowDailyReminder(true);
        localStorage.setItem('lastDailyReminder', today);
      }, 3000);
    }
  };

  // ============================================
  // 🔹 Load Notifications (مع فلترة المخفية)
  // ============================================
  const loadNotifications = async () => {
    const newNotifications: any[] = [];
    const hidden = JSON.parse(localStorage.getItem('hiddenNotifications') || '[]');

    // إشعار 1: انتهاء النسخة التجريبية
    const isTrial = localStorage.getItem('isTrial') === 'true';
    const trialStartDate = localStorage.getItem('trialStartDate');
    const trialDays = parseInt(localStorage.getItem('trialDays') || '5', 10);

    if (isTrial && trialStartDate && !hidden.includes('trial-ending')) {
      const startDate = new Date(trialStartDate);
      const currentDate = new Date();
      const daysPassed = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysLeft = trialDays - daysPassed;

      if (daysLeft <= 3 && daysLeft > 0) {
        newNotifications.push({
          id: 'trial-ending',
          type: 'warning',
          titleAr: `⏰ تنبيه: ${daysLeft} ${daysLeft === 1 ? 'يوم' : 'أيام'} متبقية`,
          titleFr: `⏰ Alerte: ${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''}`,
          messageAr: 'ستنتهي النسخة التجريبية قريباً. قم بالترقية للنسخة الكاملة!',
          messageFr: 'Votre période d\'essai se termine bientôt. Passez à la version complète!',
          date: new Date().toLocaleString('ar-DZ'),
          canHide: true,
        });
      } else if (daysLeft <= 0 && !hidden.includes('trial-expired')) {
        newNotifications.push({
          id: 'trial-expired',
          type: 'error',
          titleAr: '❌ انتهت النسخة التجريبية',
          titleFr: '❌ Période d\'essai expirée',
          messageAr: 'يرجى شراء النسخة الكاملة للاستمرار!',
          messageFr: 'Veuillez acheter la version complète pour continuer!',
          date: new Date().toLocaleString('ar-DZ'),
          canHide: false, // لا يمكن إخفاؤها
        });
      }
    }

    // إشعار 2 & 3: المخزون
    try {
      if ((window as any).electron) {
        const products = await (window as any).electron.getProducts();
        
        const lowStockProducts = products.filter((p: any) => 
          p.stockActive && p.stock <= p.stockAlerte && p.stock > 0
        );

        if (lowStockProducts.length > 0 && !hidden.includes('low-stock')) {
          newNotifications.push({
            id: 'low-stock',
            type: 'warning',
            titleAr: `⚠️ ${lowStockProducts.length} منتجات مخزونها منخفض`,
            titleFr: `⚠️ ${lowStockProducts.length} produits en stock faible`,
            messageAr: 'بعض المنتجات تحتاج إعادة تموين!',
            messageFr: 'Certains produits nécessitent un réapprovisionnement!',
            date: new Date().toLocaleString('ar-DZ'),
            products: lowStockProducts.slice(0, 5).map((p: any) => p.designation),
            canHide: true,
          });
        }

        const outOfStockProducts = products.filter((p: any) => 
          p.stockActive && p.stock === 0
        );

        if (outOfStockProducts.length > 0 && !hidden.includes('out-of-stock')) {
          newNotifications.push({
            id: 'out-of-stock',
            type: 'error',
            titleAr: `🚫 ${outOfStockProducts.length} منتجات نفذت`,
            titleFr: `🚫 ${outOfStockProducts.length} produits épuisés`,
            messageAr: 'المنتجات التالية نفذت من المخزون!',
            messageFr: 'Les produits suivants sont épuisés!',
            date: new Date().toLocaleString('ar-DZ'),
            products: outOfStockProducts.slice(0, 5).map((p: any) => p.designation),
            canHide: true,
          });
        }
      }
    } catch (error) {
      console.error('Error loading products for notifications:', error);
    }

    setNotifications(newNotifications);
    setNotificationCount(newNotifications.length);
  };
  // ============================================
  // 🔹 Notification Handlers
  // ============================================
  const handleHideNotification = (notificationId: string) => {
    const hidden = JSON.parse(localStorage.getItem('hiddenNotifications') || '[]');
    hidden.push(notificationId);
    localStorage.setItem('hiddenNotifications', JSON.stringify(hidden));
    setHiddenNotifications(hidden);
    loadNotifications(); // إعادة تحميل بعد الإخفاء
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
    setNotificationCount(prev => prev - 1);
  };

  const handleClearAllNotifications = () => {
    const allIds = notifications.filter(n => n.canHide).map(n => n.id);
    const hidden = JSON.parse(localStorage.getItem('hiddenNotifications') || '[]');
    const newHidden = [...new Set([...hidden, ...allIds])];
    localStorage.setItem('hiddenNotifications', JSON.stringify(newHidden));
    setHiddenNotifications(newHidden);
    loadNotifications();
  };

  // ============================================
  // 🔹 Update Handlers
  // ============================================
  const checkForUpdates = async () => {
    setCheckingUpdate(true);
    try {
      if ((window as any).electron) {
        const result = await (window as any).electron.checkForUpdates();
        if (result.available) {
          setAvailableUpdate(result);
          setShowUpdateDialog(true);
        } else {
          alert(isArabic 
            ? '✅ أنت تستخدم أحدث إصدار!\n\nالإصدار الحالي: 1.0.0'
            : '✅ Vous utilisez la dernière version!\n\nVersion actuelle: 1.0.0'
          );
        }
      }
    } catch (error) {
      console.error('Update check error:', error);
      alert(isArabic 
        ? '❌ خطأ في التحقق من التحديثات!'
        : '❌ Erreur lors de la vérification des mises à jour!'
      );
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handleDownloadUpdate = async () => {
    if (availableUpdate && availableUpdate.downloadUrl) {
      try {
        if ((window as any).electron) {
          await (window as any).electron.downloadUpdate(availableUpdate.downloadUrl);
          alert(isArabic
            ? '✅ تم فتح رابط التحديث في المتصفح!'
            : '✅ Lien de mise à jour ouvert dans le navigateur!'
          );
        }
      } catch (error) {
        console.error('Download update error:', error);
      }
    }
  };

  // ============================================
  // 🔹 Database Backup Handler
  // ============================================
  const handleBackupDatabase = async () => {
    try {
      if ((window as any).electron) {
        const result = await (window as any).electron.backupDatabase();
        if (result.success) {
          alert(isArabic 
            ? `✅ تم حفظ النسخة الاحتياطية!\n\nالمسار: ${result.path}`
            : `✅ Sauvegarde réussie!\n\nChemin: ${result.path}`
          );
        } else {
          alert(isArabic 
            ? '❌ فشل حفظ النسخة الاحتياطية!'
            : '❌ Échec de la sauvegarde!'
          );
        }
      }
    } catch (error) {
      console.error('Backup error:', error);
      alert(isArabic 
        ? '❌ خطأ في حفظ النسخة الاحتياطية!'
        : '❌ Erreur lors de la sauvegarde!'
      );
    }
  };

  // ============================================
  // 🔹 Other Handlers
  // ============================================
  const handleInitialSetup = () => {
    if (!storeSettings.storeName || !storeSettings.activity) {
      alert(isArabic ? 'يرجى ملء الحقول المطلوبة' : 'Veuillez remplir les champs requis');
      return;
    }
    localStorage.setItem('storeSettings', JSON.stringify(storeSettings));
    setShowInitialSetup(false);
  };

  const handleAnydeskClick = () => {
    try {
      const fs = window.require('fs');
      const { exec } = window.require('child_process');
      
      const anydeskPaths = [
        'C:\\Program Files (x86)\\AnyDesk\\AnyDesk.exe',
        'C:\\Program Files\\AnyDesk\\AnyDesk.exe',
        process.env.LOCALAPPDATA + '\\AnyDesk\\AnyDesk.exe'
      ];

      let found = false;
      for (const path of anydeskPaths) {
        if (fs.existsSync(path)) {
          exec(`"${path}"`, (error: any) => {
            if (error) console.error('Error launching AnyDesk:', error);
          });
          found = true;
          break;
        }
      }

      if (!found) {
        window.open('https://anydesk.com/en/downloads/thank-you?dv=win_exe', '_blank');
      }
    } catch (error) {
      console.error('Error:', error);
      window.open('https://anydesk.com/en/downloads/thank-you?dv=win_exe', '_blank');
    }
  };

  const handleCopyMachineId = () => {
    navigator.clipboard.writeText(machineId);
    alert(isArabic ? '✅ تم نسخ رقم الجهاز!' : '✅ ID machine copié!');
  };

  const handleActivateProgram = () => {
    alert(isArabic 
      ? 'جاري التطوير... سيتم ربطه بصفحة Activation'
      : 'En développement... Sera lié à la page Activation'
    );
  };
  // ============================================
  // 🔹 Data Arrays
  // ============================================
  const sidebarItems = [
    { id: 'home', labelFr: 'Principale', labelAr: 'الرئيسية', icon: <HomeIcon sx={{ fontSize: 16 }} /> },
    { id: 'products', labelFr: 'Produits', labelAr: 'المنتجات', icon: <InventoryIcon sx={{ fontSize: 16 }} />, badge: '0' },
    { id: 'vente', labelFr: 'Vente', labelAr: 'المبيعات', icon: <ShoppingCartIcon sx={{ fontSize: 16 }} /> },
    { id: 'achat', labelFr: 'Achat', labelAr: 'المشتريات', icon: <InventoryIcon sx={{ fontSize: 16 }} /> },
    { id: 'client', labelFr: 'Client', labelAr: 'العملاء', icon: <ClientsIcon sx={{ fontSize: 16 }} />, badge: '1' },
    { id: 'fournisseur', labelFr: 'Fournisseur', labelAr: 'الموردون', icon: <SupplierIcon sx={{ fontSize: 16 }} />, badge: '1' },
    { id: 'stock', labelFr: 'Stock', labelAr: 'المخزون', icon: <InventoryIcon sx={{ fontSize: 16 }} /> },
    { id: 'finance', labelFr: 'Ges. financiere', labelAr: 'المالية', icon: <MoneyIcon sx={{ fontSize: 16 }} /> },
    { id: 'stats', labelFr: 'Statistiques', labelAr: 'الإحصائيات', icon: <StatsIcon sx={{ fontSize: 16 }} /> },
    { id: 'admin', labelFr: 'Administration', labelAr: 'الإدارة', icon: <AdminIcon sx={{ fontSize: 16 }} /> },
  ];

  const dashboardCards = [
    { id: 'products', titleFr: 'Liste de produits', titleAr: 'قائمة المنتجات', icon: '📦', bgColor: '#3498db' },
    { id: 'vente', titleFr: 'VENTE COMPTOIRE (PDV)', titleAr: 'نقطة البيع', icon: '🛒', bgColor: '#2ecc71' },
    { id: 'achat', titleFr: 'Achat', titleAr: 'الشراء', icon: '🛍️', bgColor: '#9b59b6' },
    { id: 'ventes-list', titleFr: 'Liste des Ventes', titleAr: 'قائمة المبيعات', icon: '📋', bgColor: '#e74c3c' },
    { id: 'achats-list', titleFr: "Liste d'achats", titleAr: 'قائمة المشتريات', icon: '📋', bgColor: '#f39c12' },
    { id: 'client', titleFr: 'Clients', titleAr: 'العملاء', icon: '👥', bgColor: '#1abc9c' },
    { id: 'fournisseur', titleFr: 'Fournisseur', titleAr: 'الموردون', icon: '🚚', bgColor: '#34495e' },
    { id: 'stats', titleFr: 'Statistics', titleAr: 'الإحصائيات', icon: '📊', bgColor: '#16a085' },
    { id: 'settings', titleFr: 'Parametres', titleAr: 'الإعدادات', icon: '⚙️', bgColor: '#95a5a6' },
  ];

  const actionButtons = [
    { id: 'reglement-fournisseur', labelFr: 'Reglement Fournisseur', labelAr: 'تسديد مورد', bgColor: '#9b59b6' },
    { id: 'reglement-client', labelFr: 'Reglement Client', labelAr: 'تسديد عميل', bgColor: '#27ae60' },
    { id: 'retour-fournisseur', labelFr: 'Retour Fournisseur', labelAr: 'إرجاع مورد', bgColor: '#e74c3c' },
    { id: 'retour-client', labelFr: 'Retour Client', labelAr: 'إرجاع عميل', bgColor: '#e74c3c' },
  ];

  const handleCardClick = (id: string) => {
    if (id === 'settings') {
      setShowSettingsDialog(true);
    } else {
      setSelectedMenu(id);
    }
  };

  const renderPageContent = () => {
    switch (selectedMenu) {
      case 'products':
        return <Products isArabic={isArabic} />;
      
      case 'vente':
      case 'achat':
      case 'client':
      case 'fournisseur':
      case 'stock':
      case 'finance':
      case 'stats':
      case 'admin':
      case 'ventes-list':
      case 'achats-list':
      case 'reglement-fournisseur':
      case 'reglement-client':
      case 'retour-fournisseur':
      case 'retour-client':
        return (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ color: '#2c3e50', mb: 2 }}>
              {isArabic ? `صفحة ${selectedMenu} - قريباً!` : `Page ${selectedMenu} - Bientôt disponible!`}
            </Typography>
            <Typography variant="body1" sx={{ color: '#7f8c8d' }}>
              {isArabic ? 'هذه الصفحة قيد التطوير' : 'Cette page est en cours de développement'}
            </Typography>
          </Box>
        );
      
      default:
        return null;
    }
  };

  // ============================================
  // 🔹 Return JSX
  // ============================================
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ecf0f1', direction: isArabic ? 'rtl' : 'ltr' }}>
      
      {/* ============================================ */}
      {/* 🔹 Dialog 1: Daily Reminder */}
      {/* ============================================ */}
      <Dialog 
        open={showDailyReminder} 
        onClose={() => setShowDailyReminder(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: isTrial && trialDaysLeft <= 3 ? '#e74c3c' : '#f39c12', color: '#fff', textAlign: 'center' }}>
          <WarningIcon sx={{ fontSize: 50, mb: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {isArabic ? '⏰ تذكير يومي' : '⏰ Rappel quotidien'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 3, textAlign: 'center' }}>
          {isTrial ? (
            <>
              <Typography variant="h4" sx={{ color: trialDaysLeft <= 3 ? '#e74c3c' : '#f39c12', fontWeight: 'bold', mb: 2 }}>
                {trialDaysLeft} {isArabic ? (trialDaysLeft === 1 ? 'يوم متبقي' : 'أيام متبقية') : `jour${trialDaysLeft > 1 ? 's' : ''} restant${trialDaysLeft > 1 ? 's' : ''}`}
              </Typography>
              
              <LinearProgress 
                variant="determinate" 
                value={(trialDaysLeft / parseInt(localStorage.getItem('trialDays') || '5')) * 100}
                sx={{ 
                  height: 10, 
                  borderRadius: 5,
                  mb: 3,
                  backgroundColor: '#ecf0f1',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: trialDaysLeft <= 3 ? '#e74c3c' : '#f39c12',
                  }
                }}
              />
              
              <Typography variant="body1" sx={{ mb: 3, color: '#2c3e50' }}>
                {isArabic 
                  ? `ستنتهي النسخة التجريبية بعد ${trialDaysLeft} ${trialDaysLeft === 1 ? 'يوم' : 'أيام'}. قم بالترقية للنسخة الكاملة للاستمرار!`
                  : `Votre période d'essai se termine dans ${trialDaysLeft} jour${trialDaysLeft > 1 ? 's' : ''}. Passez à la version complète pour continuer!`
                }
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => {
                    setShowDailyReminder(false);
                    setShowPaymentDialog(true);
                  }}
                  sx={{ 
                    backgroundColor: '#27ae60', 
                    color: '#fff',
                    fontWeight: 'bold',
                    '&:hover': { backgroundColor: '#229954' }
                  }}
                >
                  {isArabic ? '🔥 احصل على النسخة الكاملة' : '🔥 Obtenir la version complète'}
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setShowDailyReminder(false)}
                  sx={{ borderColor: '#95a5a6', color: '#95a5a6' }}
                >
                  {isArabic ? 'لاحقاً' : 'Plus tard'}
                </Button>
              </Box>
            </>
          ) : (
            <>
              <CheckIcon sx={{ fontSize: 80, color: '#27ae60', mb: 2 }} />
              <Typography variant="h5" sx={{ color: '#27ae60', fontWeight: 'bold', mb: 2 }}>
                {isArabic ? '✅ النسخة الكاملة مفعّلة!' : '✅ Version complète activée!'}
              </Typography>
              <Typography variant="body1" sx={{ color: '#2c3e50' }}>
                {isArabic 
                  ? 'شكراً لاستخدامك HANOUTY DZ!'
                  : 'Merci d\'utiliser HANOUTY DZ!'
                }
              </Typography>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ============================================ */}
      {/* 🔹 Dialog 2: Notifications (مع إخفاء/حذف) */}
      {/* ============================================ */}
      <Dialog 
        open={showNotificationsDialog} 
        onClose={() => setShowNotificationsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#3498db', color: '#fff', position: 'relative' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {isArabic ? '🔔 الإشعارات' : '🔔 Notifications'}
          </Typography>
          <IconButton
            onClick={() => setShowNotificationsDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8, color: '#fff' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {notifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckIcon sx={{ fontSize: 60, color: '#27ae60', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#27ae60' }}>
                {isArabic ? 'لا توجد إشعارات جديدة!' : 'Aucune nouvelle notification!'}
              </Typography>
            </Box>
          ) : (
            <>
              {notifications.map((notif, index) => (
                <Alert 
                  key={index}
                  severity={notif.type}
                  sx={{ mb: 2, position: 'relative' }}
                  action={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {notif.canHide && (
                        <Tooltip title={isArabic ? 'إخفاء' : 'Masquer'}>
                          <IconButton 
                            size="small" 
                            onClick={() => handleHideNotification(notif.id)}
                          >
                            <VisibilityOffIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title={isArabic ? 'حذف' : 'Supprimer'}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteNotification(notif.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                >
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {isArabic ? notif.titleAr : notif.titleFr}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {isArabic ? notif.messageAr : notif.messageFr}
                  </Typography>
                  {notif.products && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                        {isArabic ? 'المنتجات:' : 'Produits:'}
                      </Typography>
                      <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                        {notif.products.map((p: string, idx: number) => (
                          <li key={idx}><Typography variant="caption">{p}</Typography></li>
                        ))}
                      </ul>
                    </Box>
                  )}
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#7f8c8d' }}>
                    {notif.date}
                  </Typography>
                </Alert>
              ))}
              
              <Button
                fullWidth
                variant="outlined"
                onClick={handleClearAllNotifications}
                sx={{ mt: 2 }}
              >
                {isArabic ? 'إخفاء الكل' : 'Masquer tout'}
              </Button>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNotificationsDialog(false)}>
            {isArabic ? 'إغلاق' : 'Fermer'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* ============================================ */}
      {/* 🔹 Dialog 3: Activation */}
      {/* ============================================ */}
      <Dialog open={showActivationDialog} onClose={() => setShowActivationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#f39c12', color: '#fff', textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            🔑 {isArabic ? 'تفعيل البرنامج' : 'Activation du programme'}
          </Typography>
          <IconButton
            onClick={() => setShowActivationDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8, color: '#fff' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ mb: 3, p: 2, backgroundColor: '#2c3e50', borderRadius: 2 }}>
            <Typography variant="body2" sx={{ color: '#FFD54F', fontSize: '0.9rem', fontWeight: 700, mb: 2 }}>
              📋 {isArabic ? 'معلومات الجهاز' : 'Informations machine'}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <ComputerIcon sx={{ color: '#FF9800', fontSize: 20 }} />
              <Typography sx={{ color: '#B0BEC5', fontSize: '0.85rem' }}>
                <strong style={{ color: '#FFD54F' }}>{isArabic ? 'اسم الجهاز:' : 'Nom:'}</strong> {computerName || 'جاري التحميل...'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <KeyIcon sx={{ color: '#FF9800', fontSize: 20 }} />
              <Typography sx={{ color: '#B0BEC5', fontSize: '0.85rem', flex: 1 }}>
                <strong style={{ color: '#FFD54F' }}>{isArabic ? 'رقم الجهاز:' : 'ID Machine:'}</strong> {machineId || 'جاري التحميل...'}
              </Typography>
              {machineId && (
                <IconButton 
                  size="small" 
                  onClick={handleCopyMachineId}
                  sx={{ 
                    bgcolor: 'rgba(255, 152, 0, 0.2)',
                    '&:hover': { bgcolor: 'rgba(255, 152, 0, 0.3)' },
                  }}
                >
                  <CopyIcon sx={{ fontSize: 16, color: '#FF9800' }} />
                </IconButton>
              )}
            </Box>
          </Box>

          <Alert severity="info" sx={{ mb: 2 }}>
            {isArabic 
              ? '💡 أرسل رقم الجهاز للمطور للحصول على كود التفعيل (تجريبي أو كامل)'
              : '💡 Envoyez l\'ID machine au développeur pour obtenir le code d\'activation (essai ou complet)'
            }
          </Alert>

          <TextField
            fullWidth
            label={isArabic ? 'أدخل كود التفعيل هنا' : 'Entrez le code d\'activation'}
            placeholder="HK-XXXX-XXXX-XXXX-XXXX أو HT-5D-XXXX-XXXX-XXXX"
            value={activationKey}
            onChange={(e) => setActivationKey(e.target.value.toUpperCase())}
            sx={{ mb: 2 }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleActivateProgram}
            disabled={!activationKey}
            sx={{
              backgroundColor: '#27ae60',
              color: '#fff',
              fontWeight: 'bold',
              mb: 2,
              '&:hover': { backgroundColor: '#229954' },
              '&:disabled': { backgroundColor: '#95a5a6' }
            }}
          >
            {isArabic ? '✅ تفعيل' : '✅ Activer'}
          </Button>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              setShowActivationDialog(false);
              setShowPaymentDialog(true);
            }}
            sx={{
              borderColor: '#3498db',
              color: '#3498db',
              '&:hover': { backgroundColor: '#e3f2fd' },
            }}
          >
            {isArabic ? 'معلومات الدفع' : 'Informations de paiement'}
          </Button>
        </DialogContent>
      </Dialog>

      {/* ============================================ */}
      {/* 🔹 Dialog 4: Updates */}
      {/* ============================================ */}
      <Dialog open={showUpdateDialog} onClose={() => setShowUpdateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#27ae60', color: '#fff', textAlign: 'center', position: 'relative' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {isArabic ? '🔄 التحديثات' : '🔄 Mises à jour'}
          </Typography>
          <IconButton
            onClick={() => setShowUpdateDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8, color: '#fff' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {checkingUpdate ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <RefreshIcon sx={{ fontSize: 60, color: '#3498db', animation: 'spin 1s linear infinite', mb: 2 }} />
              <Typography variant="h6">
                {isArabic ? 'جاري التحقق من التحديثات...' : 'Vérification des mises à jour...'}
              </Typography>
            </Box>
          ) : availableUpdate ? (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                {isArabic ? '🎉 تحديث جديد متاح!' : '🎉 Nouvelle mise à jour disponible!'}
              </Alert>
              
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                {isArabic ? 'الإصدار:' : 'Version:'} {availableUpdate.version}
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                {isArabic ? availableUpdate.descriptionAr : availableUpdate.descriptionFr}
              </Typography>
              
              <Button
                fullWidth
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadUpdate}
                sx={{ 
                  backgroundColor: '#27ae60',
                  '&:hover': { backgroundColor: '#229954' }
                }}
              >
                {isArabic ? 'تنزيل التحديث' : 'Télécharger la mise à jour'}
              </Button>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckIcon sx={{ fontSize: 60, color: '#27ae60', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#27ae60' }}>
                {isArabic ? '✅ أنت تستخدم أحدث إصدار!' : '✅ Vous utilisez la dernière version!'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, color: '#7f8c8d' }}>
                {isArabic ? 'الإصدار الحالي: 1.0.0' : 'Version actuelle: 1.0.0'}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* ============================================ */}
      {/* 🔹 Dialog 5: Initial Setup */}
      {/* ============================================ */}
      <Dialog 
        open={showInitialSetup} 
        maxWidth="sm" 
        fullWidth 
        onClose={(event, reason) => {
          if (reason === 'backdropClick') {
            return;
          }
        }}
      >
        <DialogTitle sx={{ backgroundColor: '#ff6b35', color: '#fff', textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            🎉 {isArabic ? 'مرحبا بك في HANOUTY DZ' : 'Bienvenue sur HANOUTY DZ'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Typography variant="body1" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
            {isArabic ? 'يرجى إدخال معلومات متجرك' : 'Veuillez entrer les informations de votre magasin'}
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label={isArabic ? 'الاسم التجاري *' : 'Nom Commercial *'}
                value={storeSettings.storeName}
                onChange={(e) => setStoreSettings({...storeSettings, storeName: e.target.value})}
                autoFocus
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label={isArabic ? 'النشاط *' : 'Activité *'}
                value={storeSettings.activity}
                onChange={(e) => setStoreSettings({...storeSettings, activity: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>{isArabic ? 'الولاية' : 'Wilaya'}</InputLabel>
                <Select
                  value={storeSettings.wilaya}
                  label={isArabic ? 'الولاية' : 'Wilaya'}
                  onChange={(e) => setStoreSettings({...storeSettings, wilaya: e.target.value})}
                >
                  {['Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar', 'Blida', 'Bouira', 
                    'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda',
                    'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara',
                    'Ouargla', 'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arreridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt',
                    'El Oued', 'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent', 'Ghardaïa',
                    'Relizane'].map(w => (
                    <MenuItem key={w} value={w}>{w}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={isArabic ? 'العنوان' : 'Adresse'}
                value={storeSettings.address}
                onChange={(e) => setStoreSettings({...storeSettings, address: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={isArabic ? 'الهاتف' : 'Téléphone'}
                value={storeSettings.phone}
                onChange={(e) => setStoreSettings({...storeSettings, phone: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={isArabic ? 'البريد الإلكتروني' : 'Email'}
                value={storeSettings.email}
                onChange={(e) => setStoreSettings({...storeSettings, email: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleInitialSetup}
            sx={{
              backgroundColor: '#ff6b35',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '16px',
              '&:hover': { backgroundColor: '#e85a28' },
            }}
          >
            {isArabic ? '🚀 ابدأ الآن' : '🚀 Commencer'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* ============================================ */}
      {/* 🔹 Dialog 6: Payment */}
      {/* ============================================ */}
      <Dialog open={showPaymentDialog} onClose={() => setShowPaymentDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#3498db', color: '#fff', textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {isArabic ? '💰 معلومات الدفع' : '💰 Informations de paiement'}
          </Typography>
          <IconButton
            onClick={() => setShowPaymentDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8, color: '#fff' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2, textAlign: 'center' }}>
          <Box sx={{ mb: 3, p: 2, backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
              ALGÉRIE POSTE
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
              بريد الجزائر
            </Typography>
          </Box>

          <Box sx={{ mb: 3, p: 2, backgroundColor: '#fff9c4', border: '2px dashed #000', borderRadius: '8px' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#000', mb: 1 }}>
              CCP : 0179906431
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#000', mb: 1 }}>
              ILYES TECHNOLOGY
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#000' }}>
              CLE : 76
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
            📞 07.74.36.64.70
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            📧 contact@ilyestech.dz
          </Typography>
          <Typography variant="body2" sx={{ color: '#27ae60', fontWeight: 'bold', mb: 2 }}>
            💬 WhatsApp : 07.74.36.64.70
          </Typography>

          <Alert severity="info" sx={{ mt: 2 }}>
            {isArabic 
              ? '💡 بعد الدفع، أرسل رقم الجهاز + إيصال الدفع للحصول على كود التفعيل'
              : '💡 Après paiement, envoyez l\'ID machine + reçu pour obtenir le code d\'activation'
            }
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              setShowPaymentDialog(false);
              setShowActivationDialog(true);
            }}
            sx={{
              backgroundColor: '#27ae60',
              color: '#fff',
              fontWeight: 'bold',
              '&:hover': { backgroundColor: '#229954' }
            }}
          >
            {isArabic ? '✅ لديّ كود التفعيل' : '✅ J\'ai le code d\'activation'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============================================ */}
      {/* 🔹 Dialog 7: Settings */}
      {/* ============================================ */}
      <Dialog open={showSettingsDialog} onClose={() => setShowSettingsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#f39c12', color: '#fff', position: 'relative' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {isArabic ? '⚙️ إعدادات المتجر' : '⚙️ Paramètres du magasin'}
          </Typography>
          <IconButton
            onClick={() => setShowSettingsDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8, color: '#fff' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={isArabic ? 'الاسم التجاري' : 'Nom Commercial'}
                value={storeSettings.storeName}
                onChange={(e) => setStoreSettings({...storeSettings, storeName: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={isArabic ? 'النشاط' : 'Activité'}
                value={storeSettings.activity}
                onChange={(e) => setStoreSettings({...storeSettings, activity: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>{isArabic ? 'الولاية' : 'Wilaya'}</InputLabel>
                <Select
                  value={storeSettings.wilaya}
                  label={isArabic ? 'الولاية' : 'Wilaya'}
                  onChange={(e) => setStoreSettings({...storeSettings, wilaya: e.target.value})}
                >
                  {['Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar', 'Blida', 'Bouira', 
                    'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda',
                    'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara',
                    'Ouargla', 'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arreridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt',
                    'El Oued', 'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent', 'Ghardaïa',
                    'Relizane'].map(w => (
                    <MenuItem key={w} value={w}>{w}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={isArabic ? 'العنوان' : 'Adresse'}
                value={storeSettings.address}
                onChange={(e) => setStoreSettings({...storeSettings, address: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={isArabic ? 'الهاتف' : 'Téléphone'}
                value={storeSettings.phone}
                onChange={(e) => setStoreSettings({...storeSettings, phone: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={isArabic ? 'البريد الإلكتروني' : 'Email'}
                value={storeSettings.email}
                onChange={(e) => setStoreSettings({...storeSettings, email: e.target.value})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setShowSettingsDialog(false)}
            sx={{ borderColor: '#95a5a6', color: '#95a5a6' }}
          >
            {isArabic ? 'إلغاء' : 'Annuler'}
          </Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: '#3498db', color: '#fff', '&:hover': { backgroundColor: '#2980b9' } }}
            onClick={() => {
              localStorage.setItem('storeSettings', JSON.stringify(storeSettings));
              setShowSettingsDialog(false);
              alert(isArabic ? '✅ تم حفظ التعديلات!' : '✅ Modifications enregistrées!');
            }}
          >
            {isArabic ? '💾 حفظ' : '💾 Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ============================================ */}
      {/* 🔹 Sidebar */}
      {/* ============================================ */}
      <Box
        sx={{
          width: '220px',
          backgroundColor: '#2c3e50',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          [isArabic ? 'right' : 'left']: 0,
          top: 0,
          bottom: 0,
          overflowY: 'auto',
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: '#ff6b35', borderRadius: '10px' },
        }}
      >
        <Box sx={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #34495e' }}>
          <Typography variant="h6" sx={{ color: '#ff6b35', fontWeight: 'bold', fontSize: '18px' }}>
            HANOUTY DZ
          </Typography>
          <Typography variant="caption" sx={{ color: '#bdc3c7', fontSize: '10px' }}>
            BY ILYES
          </Typography>
        </Box>

        <Box sx={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #34495e' }}>
          <Avatar sx={{ width: 50, height: 50, margin: '0 auto 8px', backgroundColor: '#95a5a6' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '14px' }}>
            {storeSettings.storeName || 'ADMIN'}
          </Typography>
          <Chip
            label={storeSettings.activity || 'Admin'}
            size="small"
            sx={{
              backgroundColor: '#e74c3c',
              color: '#fff',
              fontSize: '11px',
              mt: 0.5,
            }}
          />
        </Box>

        <Box sx={{ flex: 1, padding: '8px 0' }}>
          {sidebarItems.map((item) => (
            <Box
              key={item.id}
              onClick={() => handleCardClick(item.id)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                cursor: 'pointer',
                backgroundColor: selectedMenu === item.id ? '#ff6b35' : 'transparent',
                '&:hover': { backgroundColor: selectedMenu === item.id ? '#ff6b35' : '#34495e' },
                transition: 'all 0.3s',
              }}
            >
              <Box sx={{ color: '#fff', [isArabic ? 'ml' : 'mr']: 1.5 }}>{item.icon}</Box>
              <Box sx={{ flex: 1, textAlign: isArabic ? 'right' : 'left' }}>
                <Typography sx={{ fontSize: '12px' }}>{isArabic ? item.labelAr : item.labelFr}</Typography>
              </Box>
              {item.badge && (
                <Chip
                  label={item.badge}
                  size="small"
                  sx={{
                    backgroundColor: '#f39c12',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    minWidth: '20px',
                    height: '20px',
                  }}
                />
              )}
            </Box>
          ))}
        </Box>

        <Box sx={{ padding: '8px', borderTop: '1px solid #34495e', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#95a5a6', fontSize: '10px' }}>
            {storeSettings.storeName || 'HANOUTY DZ'}
          </Typography>
        </Box>
      </Box>

      {/* ============================================ */}
      {/* 🔹 Main Content */}
      {/* ============================================ */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', [isArabic ? 'marginRight' : 'marginLeft']: '220px' }}>
        
        {/* Top Bar */}
        <Box
          sx={{
            backgroundColor: '#1a2332',
            padding: '10px 25px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>
              V 1.0
            </Typography>
            
            {isTrial ? (
              <Chip
                icon={<WarningIcon />}
                label={`${isArabic ? 'تجريبية:' : 'Essai:'} ${trialDaysLeft} ${isArabic ? 'أيام' : 'jours'}`}
                size="small"
                sx={{
                  backgroundColor: trialDaysLeft <= 3 ? '#e74c3c' : '#f39c12',
                  color: '#fff',
                  fontWeight: 'bold',
                }}
              />
            ) : activationType === 'full' ? (
              <Chip
                icon={<CheckIcon />}
                label={isArabic ? 'كاملة' : 'Complète'}
                size="small"
                sx={{
                  backgroundColor: '#27ae60',
                  color: '#fff',
                  fontWeight: 'bold',
                }}
              />
            ) : null}
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {[
              { 
                icon: <AnydeskIcon />, 
                color: '#e74c3c', 
                title: 'AnyDesk',
                action: handleAnydeskClick
              },
              { 
                icon: <RefreshIcon />, 
                color: '#27ae60', 
                title: isArabic ? 'التحديثات' : 'Mises à jour', 
                action: checkForUpdates,
                loading: checkingUpdate
              },
              { 
                icon: <UploadIcon />, 
                color: '#3498db', 
                title: isArabic ? 'نسخ احتياطي' : 'Sauvegarde',
                action: handleBackupDatabase
              },
              { 
                icon: <SettingsIcon />, 
                color: '#f39c12', 
                title: isArabic ? 'الإعدادات' : 'Paramètres', 
                action: () => setShowSettingsDialog(true) 
              },
              { 
                icon: notificationCount > 0 ? (
                  <Badge badgeContent={notificationCount} color="error">
                    <NotificationIcon />
                  </Badge>
                ) : <NotificationIcon />,
                color: '#e67e22', 
                title: isArabic ? 'الإشعارات' : 'Notifications',
                action: () => setShowNotificationsDialog(true)
              },
              { icon: <LanguageIcon />, color: '#9b59b6', title: isArabic ? 'اللغة' : 'Langue', action: () => setIsArabic(!isArabic) },
              { icon: <LockIcon />, color: '#16a085', title: isArabic ? 'قفل' : 'Verrouiller', action: onLock },
              { icon: <LogoutIcon />, color: '#e74c3c', title: isArabic ? 'خروج' : 'Déconnexion', action: onLogout },
            ].map((btn, idx) => (
              <Tooltip key={idx} title={btn.title}>
                <IconButton
                  onClick={btn.action}
                  disabled={btn.loading}
                  sx={{
                    backgroundColor: btn.color,
                    color: '#fff',
                    padding: '8px',
                    width: '38px',
                    height: '38px',
                    '&:hover': { opacity: 0.85, backgroundColor: btn.color },
                    animation: btn.loading ? 'spin 1s linear infinite' : 'none',
                  }}
                >
                  {btn.icon}
                </IconButton>
              </Tooltip>
            ))}
          </Box>
        </Box>

        {/* Dashboard Content */}
        {selectedMenu === 'home' ? (
          <Box sx={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', gap: 2.5, flexDirection: isArabic ? 'row-reverse' : 'row' }}>
            <Box sx={{ flex: 1 }}>
              <Grid container spacing={1.5}>
                {dashboardCards.map((card, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Card
                      onClick={() => handleCardClick(card.id)}
                      sx={{
                        backgroundColor: card.bgColor,
                        borderRadius: '10px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 8px 16px rgba(0,0,0,0.25)',
                        },
                      }}
                    >
                      <CardContent
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          padding: '15px !important',
                          minHeight: '110px',
                          justifyContent: 'center',
                        }}
                      >
                        <Box sx={{ fontSize: 40, mb: 1 }}>{card.icon}</Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#fff',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            fontSize: '13px',
                          }}
                        >
                          {isArabic ? card.titleAr : card.titleFr}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}

                {actionButtons.map((btn, index) => (
                  <Grid item xs={6} sm={3} key={`action-${index}`}>
                    <Card
                      onClick={() => handleCardClick(btn.id)}
                      sx={{
                        backgroundColor: btn.bgColor,
                        borderRadius: '10px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                        },
                      }}
                    >
                      <CardContent
                        sx={{
                          padding: '15px !important',
                          minHeight: '80px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#fff',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            fontSize: '13px',
                          }}
                        >
                          {isArabic ? btn.labelAr : btn.labelFr}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Right Sidebar Cards */}
            <Box sx={{ width: '280px' }}>
              <Card
                onClick={() => setShowPaymentDialog(true)}
                sx={{
                  backgroundColor: '#2c3e50',
                  borderRadius: '12px',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                  p: 2.5,
                  textAlign: 'center',
                  mb: 2,
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.9 },
                }}
              >
                <Lightbulb sx={{ fontSize: 60, color: '#f39c12', mb: 1.5 }} />
                <Typography variant="body1" sx={{ color: '#fff', fontWeight: 'bold', fontSize: '15px' }}>
                  {isArabic ? 'احصل على النسخة التجارية مفعلة مدى الحياة' : 'Obtenez la version commerciale activée à vie'}
                </Typography>
              </Card>

              <Card
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
                  p: 2.5,
                  textAlign: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2c3e50', mb: 1, fontSize: '17px' }}>
                  ILYES TECHNOLOGY
                </Typography>

                <Box
                  sx={{
                    mt: 2,
                    mb: 2,
                    p: 1.5,
                    backgroundColor: '#ff6b35',
                    borderRadius: '8px',
                  }}
                >
                  <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold' }}>
                    ILYES
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#fff', fontSize: '12px' }}>
                    TECHNOLOGY SOLUTIONS
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
                  <IconButton sx={{ backgroundColor: '#FF0000', color: '#fff', width: 35, height: 35 }}>
                    <YouTube fontSize="small" />
                  </IconButton>
                  <IconButton sx={{ backgroundColor: '#E4405F', color: '#fff', width: 35, height: 35 }}>
                    <Instagram fontSize="small" />
                  </IconButton>
                  <IconButton sx={{ backgroundColor: '#3b5998', color: '#fff', width: 35, height: 35 }}>
                    <Facebook fontSize="small" />
                  </IconButton>
                </Box>
              </Card>

              <Box
                sx={{
                  p: 2,
                  backgroundColor: isTrial && trialDaysLeft <= 3 ? '#ffe6e6' : '#fff3cd',
                  borderRadius: '10px',
                  border: `2px solid ${isTrial && trialDaysLeft <= 3 ? '#e74c3c' : '#ffc107'}`,
                }}
              >
                <Typography variant="caption" sx={{ color: '#856404', fontWeight: 'bold', fontSize: '12px' }}>
                  Support: 07.74.36.64.70
                </Typography>
                
                {isTrial ? (
                  <>
                    <Typography variant="caption" sx={{ color: '#856404', display: 'block', mt: 0.5, fontSize: '11px' }}>
                      {isArabic 
                        ? `نسخة تجريبية، ${trialDaysLeft} ${trialDaysLeft === 1 ? 'يوم' : 'أيام'} متبقية`
                        : `Version d'essai, ${trialDaysLeft} jour${trialDaysLeft > 1 ? 's' : ''} restant${trialDaysLeft > 1 ? 's' : ''}`
                      }
                    </Typography>
                    <Button
                      onClick={() => setShowActivationDialog(true)}
                      variant="contained"
                      size="small"
                      sx={{
                        mt: 1,
                        backgroundColor: trialDaysLeft <= 3 ? '#e74c3c' : '#ff6b35',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        '&:hover': { backgroundColor: trialDaysLeft <= 3 ? '#c0392b' : '#e85a28' },
                      }}
                    >
                      {trialDaysLeft <= 3 ? '🔥 ' : ''}
                      {isArabic ? 'تفعيل الآن' : 'ACTIVER MAINTENANT'}
                    </Button>
                  </>
                ) : activationType === 'full' ? (
                  <Typography variant="caption" sx={{ color: '#27ae60', display: 'block', mt: 0.5, fontSize: '11px', fontWeight: 'bold' }}>
                    ✅ {isArabic ? 'نسخة كاملة مفعّلة' : 'Version complète activée'}
                  </Typography>
                ) : null}
              </Box>
            </Box>
          </Box>
        ) : (
          renderPageContent()
        )}
      </Box>

      {/* Animations */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Box>
  );
};

export default Dashboard;
