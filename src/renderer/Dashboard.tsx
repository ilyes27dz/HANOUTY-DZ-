import React, { useState, useEffect } from 'react';
import { 
  Box, IconButton, Tooltip, Typography, Paper, Card, CardContent, Grid, Avatar, 
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, 
  MenuItem, Select, FormControl, InputLabel, Badge, Divider, Alert, 
  LinearProgress, Chip, List, ListItem, ListItemText, ListItemIcon, Container,
  Snackbar
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
  CreditCard as CreditCardIcon,
  DateRange as DateRangeIcon,
  AccessTime as AccessTimeIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

import Products from './Products';
import PaymentInfo from './PaymentInfo';

/**
 * ============================================
 * الثوابت والإعدادات العامة
 * ============================================
 */
const TRIAL_EXPIRATION_DAYS = 5;
const NOTIFICATION_CHECK_INTERVAL = 30000;
const TRIAL_CHECK_INTERVAL = 60000;
const AUTO_UPDATE_CHECK_DELAY = 3000;
const DIALOG_ANIMATION_DELAY = 3000;
const MAX_NOTIFICATION_ITEMS = 5;
const VERSION = '1.0.0';

const WILAYAS = [
  'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar', 'Blida', 'Bouira', 
  'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda',
  'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara',
  'Ouargla', 'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arreridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt',
  'El Oued', 'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent', 'Ghardaïa', 'Relizane'
];

/**
 * ============================================
 * Interfaces و Types
 * ============================================
 */
interface DashboardProps {
  onLogout: () => void;
  onLock: () => void;
}

interface StoreSettings {
  storeName: string;
  activity: string;
  wilaya: string;
  address: string;
  phone: string;
  email: string;
}

interface Notification {
  id: string;
  type: 'warning' | 'error' | 'success' | 'info';
  titleAr: string;
  titleFr: string;
  messageAr: string;
  messageFr: string;
  date: string;
  products?: string[];
  canHide: boolean;
}

interface SidebarItem {
  id: string;
  labelFr: string;
  labelAr: string;
  icon: JSX.Element;
}

interface DashboardCard {
  id: string;
  titleFr: string;
  titleAr: string;
  icon: string;
  bgColor: string;
}

interface ActionButton {
  id: string;
  labelFr: string;
  labelAr: string;
  bgColor: string;
}

interface TopBarButton {
  icon: JSX.Element;
  color: string;
  title: string;
  action: () => void;
  loading?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout, onLock }) => {
  
  /**
   * ============================================
   * React States - القائمة الكاملة للحالات
   * ============================================
   */
  // حالات التنقل والاختيار
  const [selectedMenu, setSelectedMenu] = useState<string>('home');
  const [isArabic, setIsArabic] = useState<boolean>(false);

  // حالات التاريخ والوقت
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());

  // حالات الـ Dialogs
  const [showPaymentDialog, setShowPaymentDialog] = useState<boolean>(false);
  const [showActivationDialog, setShowActivationDialog] = useState<boolean>(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState<boolean>(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState<boolean>(false);
  const [showInitialSetup, setShowInitialSetup] = useState<boolean>(false);
  const [showDailyReminder, setShowDailyReminder] = useState<boolean>(false);
  const [showNotificationsDialog, setShowNotificationsDialog] = useState<boolean>(false);
  const [showAlertDialog, setShowAlertDialog] = useState<boolean>(false);

  // حالات الرسائل والتنبيهات
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [hiddenNotifications, setHiddenNotifications] = useState<string[]>([]);

  // حالات التفعيل والترخيص
  const [isTrial, setIsTrial] = useState<boolean>(false);
  const [activationType, setActivationType] = useState<string>('');
  const [trialDaysLeft, setTrialDaysLeft] = useState<number>(0);
  const [activationKey, setActivationKey] = useState<string>('');

  // حالات معلومات الجهاز
  const [machineId, setMachineId] = useState<string>('');
  const [computerName, setComputerName] = useState<string>('');

  // حالات التحديثات
  const [availableUpdate, setAvailableUpdate] = useState<any>(null);
  const [checkingUpdate, setCheckingUpdate] = useState<boolean>(false);

  // حالات إعدادات المتجر
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    storeName: '',
    activity: '',
    wilaya: '',
    address: '',
    phone: '',
    email: ''
  });

  /**
   * ============================================
   * Utility Functions - الدوال المساعدة
   * ============================================
   */

  /**
   * دالة عرض الرسائل والتنبيهات
   * @param msg - رسالة التنبيه المراد عرضها
   */
  const showAlert = (msg: string): void => {
    try {
      setAlertMessage(msg);
      setShowAlertDialog(true);
    } catch (error) {
      console.error('خطأ في عرض الرسالة:', error);
    }
  };

  /**
   * دالة التحقق من صحة البريد الإلكتروني
   * @param email - البريد الإلكتروني المراد التحقق منه
   * @returns true إذا كان البريد صحيحاً
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * دالة التحقق من صحة رقم الهاتف
   * @param phone - رقم الهاتف المراد التحقق منه
   * @returns true إذا كان الرقم صحيحاً
   */
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    return phoneRegex.test(phone);
  };

  /**
   * دالة التحقق من صحة إعدادات المتجر
   * @returns true إذا كانت جميع الحقول المطلوبة مملوءة
   */
  const validateStoreSettings = (): boolean => {
    if (!storeSettings.storeName || !storeSettings.storeName.trim()) {
      showAlert(isArabic ? 'يرجى إدخال الاسم التجاري' : 'Veuillez entrer le nom commercial');
      return false;
    }
    if (!storeSettings.activity || !storeSettings.activity.trim()) {
      showAlert(isArabic ? 'يرجى إدخال نوع النشاط' : 'Veuillez entrer le type d\'activité');
      return false;
    }
    if (storeSettings.email && !validateEmail(storeSettings.email)) {
      showAlert(isArabic ? 'البريد الإلكتروني غير صحيح' : 'Email invalide');
      return false;
    }
    if (storeSettings.phone && !validatePhone(storeSettings.phone)) {
      showAlert(isArabic ? 'رقم الهاتف غير صحيح' : 'Numéro de téléphone invalide');
      return false;
    }
    return true;
  };

  /**
   * دالة حساب الأيام المتبقية من النسخة التجريبية
   * @param startDate - تاريخ بداية التجريبية
   * @param trialDays - عدد أيام التجريبية
   * @returns عدد الأيام المتبقية
   */
  const calculateRemainingDays = (startDate: string, trialDays: number): number => {
    try {
      const start = new Date(startDate);
      const end = new Date(start.getTime() + trialDays * 24 * 60 * 60 * 1000);
      const now = new Date();
      const difference = Math.floor((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return Math.max(0, difference);
    } catch (error) {
      console.error('خطأ في حساب الأيام المتبقية:', error);
      return 0;
    }
  };

  /**
   * ============================================
   * Effects - تأثيرات React
   * ============================================
   */

  /**
   * Effect: تحديث التاريخ والوقت الحالي كل ثانية
   */
  useEffect(() => {
    let isMounted = true;
    const timer = setInterval(() => {
      if (isMounted) {
        setCurrentDateTime(new Date());
      }
    }, 1000);
    
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  /**
   * Effect: تكبير النافذة تلقائياً عند تحميل المكون
   */
  useEffect(() => {
    try {
      if ((window as any).electron) {
        (window as any).electron.maximizeWindow();
      }
    } catch (error) {
      console.error('خطأ في تكبير النافذة:', error);
    }
  }, []);

  /**
   * Effect: تحميل البيانات الأولية والتحقق من التجريبية والإشعارات
   */
  useEffect(() => {
    let isMounted = true;

    const initializeData = async (): Promise<void> => {
      if (!isMounted) return;
      try {
        await loadInitialData();
        await checkDailyReminder();
        await loadNotifications();
        await checkTrialExpiration();
      } catch (error) {
        console.error('خطأ في تحميل البيانات الأولية:', error);
      }
    };

    initializeData();

    const notificationInterval = setInterval(() => {
      if (isMounted) {
        loadNotifications();
      }
    }, NOTIFICATION_CHECK_INTERVAL);

    const trialCheckInterval = setInterval(() => {
      if (isMounted) {
        checkTrialExpiration();
      }
    }, TRIAL_CHECK_INTERVAL);

    return () => {
      isMounted = false;
      clearInterval(notificationInterval);
      clearInterval(trialCheckInterval);
    };
  }, []);

  /**
   * ============================================
   * Main Functions - الدوال الرئيسية
   * ============================================
   */

  /**
   * دالة التحقق من انتهاء النسخة التجريبية وإغلاق البرنامج
   * هذه الدالة تتحقق من تاريخ انتهاء النسخة التجريبية
   * وتقوم بإغلاق البرنامج تلقائياً عند انتهاء الفترة المحددة
   */
  const checkTrialExpiration = async (): Promise<void> => {
    try {
      const isTrial = localStorage.getItem('isTrial') === 'true';
      const trialStartDate = localStorage.getItem('trialStartDate');
      const trialDaysStr = localStorage.getItem('trialDays');
      const activationType = localStorage.getItem('activationType') || '';

      if (!isTrial || !trialStartDate || activationType !== 'trial') {
        return;
      }

      const trialDays = parseInt(trialDaysStr || TRIAL_EXPIRATION_DAYS.toString(), 10);
      const startDate = new Date(trialStartDate);
      const endDate = new Date(startDate.getTime() + trialDays * 24 * 60 * 60 * 1000);
      const now = new Date();

      if (now >= endDate) {
        console.log('⏰ انتهت النسخة التجريبية - سيتم إغلاق البرنامج الآن');
        
        localStorage.setItem('trialExpired', 'true');
        localStorage.removeItem('isTrial');
        localStorage.removeItem('trialStartDate');
        localStorage.removeItem('activationType');

        await new Promise(resolve => setTimeout(resolve, 500));

        try {
          const electron = (window as any).electron;
          if (electron?.closeApp) {
            electron.closeApp();
          } else if (electron?.quitApp) {
            electron.quitApp();
          } else {
            window.close();
          }
        } catch (closeError) {
          console.error('❌ خطأ في محاولة إغلاق البرنامج:', closeError);
          window.close();
        }
      }
    } catch (error) {
      console.error('❌ خطأ في التحقق من انتهاء النسخة التجريبية:', error);
    }
  };

  /**
   * دالة تحميل البيانات الأولية
   * تحمل إعدادات المتجر ومعلومات الجهاز والتحديثات المتاحة
   */
  const loadInitialData = async (): Promise<void> => {
    try {
      // تحميل إعدادات المتجر
      const savedSettings = localStorage.getItem('storeSettings');
      if (savedSettings) {
        try {
          setStoreSettings(JSON.parse(savedSettings));
        } catch (parseError) {
          console.error('خطأ في تحليل إعدادات المتجر:', parseError);
          setShowInitialSetup(true);
        }
      } else {
        setShowInitialSetup(true);
      }

      // تحميل الإشعارات المخفية
      const hiddenNotifs = localStorage.getItem('hiddenNotifications');
      if (hiddenNotifs) {
        try {
          setHiddenNotifications(JSON.parse(hiddenNotifs));
        } catch (parseError) {
          console.error('خطأ في تحليل الإشعارات المخفية:', parseError);
        }
      }

      // تحميل معلومات التجريبية
      const isTrialMode = localStorage.getItem('isTrial') === 'true';
      const trialStart = localStorage.getItem('trialStartDate');
      const trialDaysStr = localStorage.getItem('trialDays');
      const activType = localStorage.getItem('activationType') || '';

      setIsTrial(isTrialMode);
      setActivationType(activType);

      if (isTrialMode && trialStart) {
        const trialDays = parseInt(trialDaysStr || TRIAL_EXPIRATION_DAYS.toString(), 10);
        const daysRemaining = calculateRemainingDays(trialStart, trialDays);
        setTrialDaysLeft(daysRemaining);
      }

      // الحصول على معلومات الجهاز
      if (typeof window !== 'undefined' && (window as any).electron) {
        try {
          const machineInfo = await (window as any).electron.getMachineInfo();
          if (machineInfo && machineInfo.success) {
            setComputerName(machineInfo.computerName || '');
            setMachineId(machineInfo.machineId || '');
          }
        } catch (error) {
          console.error('خطأ في الحصول على معلومات الجهاز:', error);
        }
      }

      // التحقق من التحديثات المتاحة بعد تأخير قصير
      await new Promise(resolve => setTimeout(resolve, AUTO_UPDATE_CHECK_DELAY));
      try {
        if ((window as any).electron) {
          const updateInfo = await (window as any).electron.checkForUpdates();
          if (updateInfo && updateInfo.available) {
            setAvailableUpdate(updateInfo);
            setShowUpdateDialog(true);
          }
        }
      } catch (error) {
        console.error('خطأ في التحقق من التحديثات:', error);
      }
    } catch (error) {
      console.error('خطأ عام في تحميل البيانات الأولية:', error);
    }
  };

  /**
   * دالة التحقق من التذكير اليومي
   * تعرض تذكير يومي واحد فقط للمستخدمين ذوي النسخة التجريبية
   */
  const checkDailyReminder = async (): Promise<void> => {
    try {
      const lastReminder = localStorage.getItem('lastDailyReminder');
      const today = new Date().toDateString();
      const isTrialMode = localStorage.getItem('isTrial') === 'true';

      if (isTrialMode && lastReminder !== today) {
        await new Promise(resolve => setTimeout(resolve, DIALOG_ANIMATION_DELAY));
        setShowDailyReminder(true);
        localStorage.setItem('lastDailyReminder', today);
      }
    } catch (error) {
      console.error('خطأ في التحقق من التذكير اليومي:', error);
    }
  };

  /**
   * دالة تحميل الإشعارات
   * تحمل الإشعارات المتعلقة بالنسخة التجريبية والمخزون
   */
  const loadNotifications = async (): Promise<void> => {
    try {
      const newNotifications: Notification[] = [];
      const hidden = JSON.parse(localStorage.getItem('hiddenNotifications') || '[]');

      // إشعارات النسخة التجريبية
      const isTrialMode = localStorage.getItem('isTrial') === 'true';
      const trialStart = localStorage.getItem('trialStartDate');
      const trialDaysStr = localStorage.getItem('trialDays');

      if (isTrialMode && trialStart && !hidden.includes('trial-ending')) {
        const trialDays = parseInt(trialDaysStr || TRIAL_EXPIRATION_DAYS.toString(), 10);
        const daysLeft = calculateRemainingDays(trialStart, trialDays);

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
            canHide: false,
          });
        }
      }

      // إشعارات المخزون
      if ((window as any).electron) {
        try {
          const products = await (window as any).electron.getProducts();

          // منتجات المخزون المنخفض
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
              products: lowStockProducts.slice(0, MAX_NOTIFICATION_ITEMS).map((p: any) => p.designation),
              canHide: true,
            });
          }

          // منتجات النفاذ
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
              products: outOfStockProducts.slice(0, MAX_NOTIFICATION_ITEMS).map((p: any) => p.designation),
              canHide: true,
            });
          }
        } catch (error) {
          console.error('خطأ في تحميل إشعارات المخزون:', error);
        }
      }

      setNotifications(newNotifications);
      setNotificationCount(newNotifications.length);
    } catch (error) {
      console.error('خطأ عام في تحميل الإشعارات:', error);
    }
  };

  /**
   * دالة إخفاء إشعار معين
   * @param notificationId - معرف الإشعار المراد إخفاؤه
   */
  const handleHideNotification = (notificationId: string): void => {
    try {
      const hidden = JSON.parse(localStorage.getItem('hiddenNotifications') || '[]');
      if (!hidden.includes(notificationId)) {
        hidden.push(notificationId);
        localStorage.setItem('hiddenNotifications', JSON.stringify(hidden));
        setHiddenNotifications(hidden);
        loadNotifications();
      }
    } catch (error) {
      console.error('خطأ في إخفاء الإشعار:', error);
    }
  };

  /**
   * دالة حذف إشعار من القائمة
   * @param notificationId - معرف الإشعار المراد حذفه
   */
  const handleDeleteNotification = (notificationId: string): void => {
    try {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setNotificationCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('خطأ في حذف الإشعار:', error);
    }
  };

  /**
   * دالة إخفاء جميع الإشعارات
   */
  const handleClearAllNotifications = (): void => {
    try {
      const allIds = notifications.filter(n => n.canHide).map(n => n.id);
      const hidden = JSON.parse(localStorage.getItem('hiddenNotifications') || '[]');
      const newHidden = [...new Set([...hidden, ...allIds])];
      localStorage.setItem('hiddenNotifications', JSON.stringify(newHidden));
      setHiddenNotifications(newHidden);
      loadNotifications();
    } catch (error) {
      console.error('خطأ في إخفاء جميع الإشعارات:', error);
    }
  };

  /**
   * دالة التحقق من التحديثات المتاحة
   */
  const checkForUpdates = async (): Promise<void> => {
    setCheckingUpdate(true);
    try {
      if ((window as any).electron) {
        const result = await (window as any).electron.checkForUpdates();
        if (result && result.available) {
          setAvailableUpdate(result);
          setShowUpdateDialog(true);
        } else {
          showAlert(isArabic
            ? `✅ أنت تستخدم أحدث إصدار!\n\nالإصدار الحالي: ${VERSION}`
            : `✅ Vous utilisez la dernière version!\n\nVersion actuelle: ${VERSION}`
          );
        }
      }
    } catch (error) {
      console.error('خطأ في التحقق من التحديثات:', error);
      showAlert(isArabic
        ? '❌ خطأ في التحقق من التحديثات!'
        : '❌ Erreur lors de la vérification des mises à jour!'
      );
    } finally {
      setCheckingUpdate(false);
    }
  };

  /**
   * دالة تحميل التحديث
   */
  const handleDownloadUpdate = async (): Promise<void> => {
    if (!availableUpdate || !availableUpdate.downloadUrl) {
      showAlert(isArabic
        ? '❌ رابط التحديث غير متوفر!'
        : '❌ Lien de téléchargement non disponible!'
      );
      return;
    }

    try {
      if ((window as any).electron) {
        const result = await (window as any).electron.downloadUpdate(availableUpdate.downloadUrl);
        if (result && result.success) {
          showAlert(isArabic
            ? '✅ تم فتح رابط التحديث في المتصفح!\n\nيرجى تنزيل الملف وتثبيته.'
            : '✅ Lien de téléchargement ouvert!\n\nVeuillez télécharger et installer le fichier.'
          );
          setShowUpdateDialog(false);
        } else {
          showAlert(isArabic
            ? '❌ فشل فتح الرابط!'
            : '❌ Échec de l\'ouverture du lien!'
          );
        }
      }
    } catch (error) {
      console.error('خطأ في تحميل التحديث:', error);
      showAlert(isArabic
        ? '❌ خطأ في فتح رابط التحديث!'
        : '❌ Erreur lors de l\'ouverture du lien!'
      );
    }
  };

  /**
   * دالة عمل نسخة احتياطية من قاعدة البيانات
   */
  const handleBackupDatabase = async (): Promise<void> => {
    try {
      if ((window as any).electron) {
        const result = await (window as any).electron.backupDatabase();
        if (result && result.success) {
          showAlert(isArabic
            ? `✅ تم حفظ النسخة الاحتياطية!\n\nالمسار: ${result.path}\nالحجم: ${result.size}\nعدد المنتجات: ${result.productCount}`
            : `✅ Sauvegarde réussie!\n\nChemin: ${result.path}\nTaille: ${result.size}\nNombre de produits: ${result.productCount}`
          );
        } else {
          showAlert(isArabic
            ? '❌ فشل حفظ النسخة الاحتياطية!'
            : '❌ Échec de la sauvegarde!'
          );
        }
      }
    } catch (error) {
      console.error('خطأ في عمل نسخة احتياطية:', error);
      showAlert(isArabic
        ? '❌ خطأ في حفظ النسخة الاحتياطية!'
        : '❌ Erreur lors de la sauvegarde!'
      );
    }
  };

  /**
   * دالة تفعيل البرنامج
   * تدعم تفعيل تجريبي وكامل باستخدام رموز مختلفة
   */
  const handleActivateProgram = async (): Promise<void> => {
    if (!activationKey || !activationKey.trim()) {
      showAlert(isArabic
        ? '⚠️ يرجى إدخال كود التفعيل!'
        : '⚠️ Veuillez entrer le code d\'activation!'
      );
      return;
    }

    try {
      const code = activationKey.toUpperCase().trim();

      // تفعيل تجريبي
      if (code.startsWith('HT-')) {
        const parts = code.split('-');
        if (parts.length < 2) {
          showAlert(isArabic
            ? '❌ كود التفعيل غير صحيح! استخدم الصيغة: HT-5'
            : '❌ Code invalide! Utilisez le format: HT-5'
          );
          return;
        }

        const trialDays = parseInt(parts[1], 10);

        if (isNaN(trialDays) || trialDays <= 0 || trialDays > 365) {
          showAlert(isArabic
            ? '❌ عدد الأيام غير صحيح! (يجب أن يكون بين 1 و 365)'
            : '❌ Nombre de jours invalide! (doit être entre 1 et 365)'
          );
          return;
        }

        localStorage.setItem('isTrial', 'true');
        localStorage.setItem('activationType', 'trial');
        localStorage.setItem('trialDays', trialDays.toString());
        localStorage.setItem('trialStartDate', new Date().toISOString());
        localStorage.setItem('isActivated', 'true');

        setIsTrial(true);
        setActivationType('trial');
        setTrialDaysLeft(trialDays);
        setActivationKey('');
        setShowActivationDialog(false);

        showAlert(isArabic
          ? `✅ تم تفعيل النسخة التجريبية!\n\nالمدة: ${trialDays} أيام\nتاريخ الانتهاء: ${new Date(new Date().getTime() + trialDays * 24 * 60 * 60 * 1000).toLocaleDateString('ar-DZ')}`
          : `✅ Version d'essai activée!\n\nDurée: ${trialDays} jours\nDate d'expiration: ${new Date(new Date().getTime() + trialDays * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}`
        );
        return;
      }

      // تفعيل كامل
      if (code.startsWith('HK-') || code.startsWith('FULL-')) {
        localStorage.setItem('isTrial', 'false');
        localStorage.setItem('activationType', 'full');
        localStorage.setItem('isActivated', 'true');
        localStorage.setItem('activationCode', code);
        localStorage.removeItem('trialDays');
        localStorage.removeItem('trialStartDate');

        setIsTrial(false);
        setActivationType('full');
        setActivationKey('');
        setShowActivationDialog(false);
        setTrialDaysLeft(0);

        showAlert(isArabic
          ? `✅ تم تفعيل النسخة الكاملة!\n\nشكراً لاستخدامك HANOUTY DZ`
          : `✅ Version complète activée!\n\nMerci d'utiliser HANOUTY DZ`
        );
        return;
      }

      showAlert(isArabic
        ? '❌ كود التفعيل غير صحيح!\n\nيجب أن يبدأ بـ: HK- أو HT- أو FULL-'
        : '❌ Code invalide!\n\nDoit commencer par: HK- ou HT- ou FULL-'
      );
    } catch (error) {
      console.error('خطأ في التفعيل:', error);
      showAlert(isArabic
        ? '❌ خطأ في التفعيل! حاول مجدداً'
        : '❌ Erreur d\'activation! Réessayez'
      );
    }
  };

  /**
   * دالة إنهاء الإعداد الأولي
   */
  const handleInitialSetup = (): void => {
    if (!validateStoreSettings()) {
      return;
    }

    try {
      localStorage.setItem('storeSettings', JSON.stringify(storeSettings));
      setShowInitialSetup(false);
      showAlert(isArabic
        ? '✅ تم حفظ إعدادات المتجر بنجاح!'
        : '✅ Paramètres du magasin enregistrés avec succès!'
      );
    } catch (error) {
      console.error('خطأ في حفظ الإعدادات:', error);
      showAlert(isArabic
        ? '❌ خطأ في حفظ الإعدادات!'
        : '❌ Erreur lors de l\'enregistrement!'
      );
    }
  };

  /**
   * دالة تشغيل AnyDesk
   */
  const handleAnydeskClick = (): void => {
    try {
      const fs = window.require('fs');
      const { exec } = window.require('child_process');

      const anydeskPaths = [
        'C:\\Program Files (x86)\\AnyDesk\\AnyDesk.exe',
        'C:\\Program Files\\AnyDesk\\AnyDesk.exe',
        (process.env.LOCALAPPDATA || '') + '\\AnyDesk\\AnyDesk.exe'
      ];

      let found = false;
      for (const path of anydeskPaths) {
        try {
          if (fs.existsSync(path)) {
            exec(`"${path}"`, (error: any) => {
              if (error) console.error('خطأ في تشغيل AnyDesk:', error);
            });
            found = true;
            break;
          }
        } catch (err) {
          continue;
        }
      }

      if (!found) {
        window.open('https://anydesk.com/en/downloads/thank-you?dv=win_exe', '_blank');
      }
    } catch (error) {
      console.error('خطأ في AnyDesk:', error);
      window.open('https://anydesk.com/en/downloads/thank-you?dv=win_exe', '_blank');
    }
  };

  /**
   * دالة نسخ معرف الجهاز
   */
  const handleCopyMachineId = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(machineId);
      showAlert(isArabic ? '✅ تم نسخ رقم الجهاز!' : '✅ ID machine copié!');
    } catch (error) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = machineId;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showAlert(isArabic ? '✅ تم نسخ رقم الجهاز!' : '✅ ID machine copié!');
      } catch (fallbackError) {
        console.error('خطأ في نسخ معرف الجهاز:', fallbackError);
        showAlert(isArabic
          ? '❌ فشل نسخ معرف الجهاز'
          : '❌ Échec de la copie'
        );
      }
    }
  };

  /**
   * دالة معالجة الضغط على بطاقة في القائمة الجانبية
   * @param id - معرف البطاقة المضغوط عليها
   */
  const handleCardClick = (id: string): void => {
    try {
      if (id === 'settings') {
        setShowSettingsDialog(true);
      } else {
        setSelectedMenu(id);
      }
    } catch (error) {
      console.error('خطأ في معالجة الضغط على البطاقة:', error);
    }
  };

  /**
   * دالة عرض محتوى الصفحة بناءً على الاختيار
   * @returns JSX للصفحة المختارة
   */
  const renderPageContent = (): JSX.Element | null => {
    try {
      switch (selectedMenu) {
        case 'products':
          return <Products isArabic={isArabic} />;

        case 'vente':
          return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#2c3e50', mb: 2 }}>
                {isArabic ? 'قسم المبيعات - قيد التطوير' : 'Ventes - En développement'}
              </Typography>
              <Typography variant="body1" sx={{ color: '#7f8c8d' }}>
                {isArabic ? 'هذا القسم قيد التطوير حالياً' : 'Cette section est en cours de développement'}
              </Typography>
            </Box>
          );

        case 'achats-list':
          return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h5">{isArabic ? '🚧 قيد التطوير' : '🚧 En développement'}</Typography>
            </Box>
          );

        case 'achat':
        case 'client':
        case 'fournisseur':
        case 'stock':
        case 'finance':
        case 'stats':
        case 'admin':
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
                {isArabic ? 'هذه الصفحة قيد التطوير حالياً. يرجى المحاولة لاحقاً.' : 'Cette page est en cours de développement. Veuillez réessayer ultérieurement.'}
              </Typography>
            </Box>
          );

        default:
          return null;
      }
    } catch (error) {
      console.error('خطأ في عرض محتوى الصفحة:', error);
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" color="error">
            {isArabic ? '❌ حدث خطأ في تحميل الصفحة' : '❌ Une erreur est survenue'}
          </Typography>
        </Box>
      );
    }
  };

  /**
   * ============================================
   * Data Arrays - المصفوفات والبيانات
   * ============================================
   */

  const sidebarItems: SidebarItem[] = [
    { id: 'home', labelFr: 'Principale', labelAr: 'الرئيسية', icon: <HomeIcon sx={{ fontSize: 16 }} /> },
    { id: 'products', labelFr: 'Produits', labelAr: 'المنتجات', icon: <InventoryIcon sx={{ fontSize: 16 }} /> },
    { id: 'vente', labelFr: 'Vente', labelAr: 'المبيعات', icon: <ShoppingCartIcon sx={{ fontSize: 16 }} /> },
    { id: 'achat', labelFr: 'Achat', labelAr: 'المشتريات', icon: <InventoryIcon sx={{ fontSize: 16 }} /> },
    { id: 'client', labelFr: 'Client', labelAr: 'العملاء', icon: <ClientsIcon sx={{ fontSize: 16 }} /> },
    { id: 'fournisseur', labelFr: 'Fournisseur', labelAr: 'الموردون', icon: <SupplierIcon sx={{ fontSize: 16 }} /> },
    { id: 'stock', labelFr: 'Stock', labelAr: 'المخزون', icon: <InventoryIcon sx={{ fontSize: 16 }} /> },
    { id: 'finance', labelFr: 'Ges. financiere', labelAr: 'المالية', icon: <MoneyIcon sx={{ fontSize: 16 }} /> },
    { id: 'stats', labelFr: 'Statistiques', labelAr: 'الإحصائيات', icon: <StatsIcon sx={{ fontSize: 16 }} /> },
    { id: 'admin', labelFr: 'Administration', labelAr: 'الإدارة', icon: <AdminIcon sx={{ fontSize: 16 }} /> },
  ];

  const dashboardCards: DashboardCard[] = [
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

  const actionButtons: ActionButton[] = [
    { id: 'reglement-fournisseur', labelFr: 'Reglement Fournisseur', labelAr: 'تسديد مورد', bgColor: '#9b59b6' },
    { id: 'reglement-client', labelFr: 'Reglement Client', labelAr: 'تسديد عميل', bgColor: '#27ae60' },
    { id: 'retour-fournisseur', labelFr: 'Retour Fournisseur', labelAr: 'إرجاع مورد', bgColor: '#e74c3c' },
    { id: 'retour-client', labelFr: 'Retour Client', labelAr: 'إرجاع عميل', bgColor: '#e74c3c' },
  ];

  const topBarButtons: TopBarButton[] = [
    { icon: <AnydeskIcon />, color: '#e74c3c', title: 'AnyDesk', action: handleAnydeskClick },
    { icon: <RefreshIcon />, color: '#27ae60', title: isArabic ? 'التحديثات' : 'Mises à jour', action: checkForUpdates, loading: checkingUpdate },
    { icon: <UploadIcon />, color: '#3498db', title: isArabic ? 'نسخ احتياطي' : 'Sauvegarde', action: handleBackupDatabase },
    { icon: <SettingsIcon />, color: '#f39c12', title: isArabic ? 'الإعدادات' : 'Paramètres', action: () => setShowSettingsDialog(true) },
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
  ];

  /**
   * ============================================
   * Render - عرض المكون
   * ============================================
   */

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#ecf0f1', direction: isArabic ? 'rtl' : 'ltr', overflow: 'hidden' }}>
      {/* Dialog: Alert */}
      <Dialog 
        open={showAlertDialog} 
        onClose={() => setShowAlertDialog(false)}
        PaperProps={{ sx: { borderRadius: 3, minWidth: 400 } }}
      >
        <DialogContent sx={{ textAlign: 'center', pt: 4, pb: 3 }}>
          <Typography sx={{ whiteSpace: 'pre-line', fontSize: '1rem', lineHeight: 1.8 }}>
            {alertMessage}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button 
            onClick={() => setShowAlertDialog(false)}
            variant="contained"
            sx={{ bgcolor: '#FF6B35', px: 4, '&:hover': { bgcolor: '#E55A2B' } }}
          >
            {isArabic ? 'حسناً' : 'OK'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Daily Reminder */}
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
                value={(trialDaysLeft / parseInt(localStorage.getItem('trialDays') || TRIAL_EXPIRATION_DAYS.toString())) * 100}
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

      {/* Dialog: Notifications */}
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
                  {notif.products && notif.products.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                        {isArabic ? 'المنتجات:' : 'Produits:'}
                      </Typography>
                      <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                        {notif.products.map((p, idx) => (
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

      {/* Dialog: Activation */}
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
                <Tooltip title={isArabic ? 'نسخ' : 'Copier'}>
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
                </Tooltip>
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
            placeholder="HK-XXXX-XXXX-XXXX-XXXX أو HT-5"
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

      {/* Dialog: Update */}
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
                {isArabic ? `الإصدار الحالي: ${VERSION}` : `Version actuelle: ${VERSION}`}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Initial Setup */}
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
                  {WILAYAS.map(w => (
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

      {/* Dialog: Payment */}
      <Dialog open={showPaymentDialog} onClose={() => setShowPaymentDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#ff6b35', color: '#fff', textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {isArabic ? '💰 معلومات الدفع والتفعيل' : '💰 Informations de paiement et activation'}
          </Typography>
          <IconButton
            onClick={() => setShowPaymentDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8, color: '#fff' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 0, p: 0 }}>
          <PaymentInfo 
            machineId={machineId} 
            computerName={computerName}
            onClose={() => setShowPaymentDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog: Settings */}
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
                  {WILAYAS.map(w => (
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
              if (validateStoreSettings()) {
                localStorage.setItem('storeSettings', JSON.stringify(storeSettings));
                setShowSettingsDialog(false);
                showAlert(isArabic ? '✅ تم حفظ التعديلات!' : '✅ Modifications enregistrées!');
              }
            }}
          >
            {isArabic ? '💾 حفظ' : '💾 Enregistrer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sidebar */}
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
          zIndex: 10,
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
            label={storeSettings.activity || 'commerce'}
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
            </Box>
          ))}
        </Box>

        <Box sx={{ padding: '8px', borderTop: '1px solid #34495e', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#95a5a6', fontSize: '10px' }}>
            {storeSettings.storeName || 'HANOUTY DZ'}
          </Typography>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        [isArabic ? 'marginRight' : 'marginLeft']: '220px',
        height: '100vh',
        overflow: 'hidden'
      }}>
        
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#fff' }}>
              <DateRangeIcon sx={{ fontSize: 18 }} />
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 600 }}>
                {currentDateTime.toLocaleDateString(isArabic ? 'ar-DZ' : 'fr-FR')}
              </Typography>
              <Divider orientation="vertical" sx={{ height: 20, bgcolor: '#34495e' }} />
              <AccessTimeIcon sx={{ fontSize: 18 }} />
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, fontFamily: 'monospace' }}>
                {currentDateTime.toLocaleTimeString(isArabic ? 'ar-DZ' : 'fr-FR')}
              </Typography>
            </Box>

            <Divider orientation="vertical" sx={{ height: 30, bgcolor: '#34495e' }} />
            
            <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>
              V {VERSION}
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
            {topBarButtons.map((btn, idx) => (
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

        {/* Main Content */}
        {selectedMenu === 'home' ? (
          <Box sx={{ 
            flex: 1, 
            padding: '20px', 
            paddingTop: '30px',
            overflowY: 'auto', 
            display: 'flex', 
            gap: 2.5, 
            flexDirection: isArabic ? 'row-reverse' : 'row' 
          }}>
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
              {activationType !== 'full' && (
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
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      opacity: 0.9,
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
                    },
                  }}
                >
                  <CreditCardIcon sx={{ fontSize: 50, color: '#f39c12', mb: 1.5 }} />
                  <Typography variant="body1" sx={{ color: '#fff', fontWeight: 'bold', fontSize: '15px', mb: 1 }}>
                    {isArabic ? '🔓 احصل على النسخة الكاملة' : '🔓 Obtenir la version complète'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#bdc3c7', fontSize: '0.8rem' }}>
                    {isArabic ? 'مدى الحياة بدون حدود' : 'À vie sans limites'}
                  </Typography>
                </Card>
              )}

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
                  <Tooltip title="YouTube">
                    <IconButton sx={{ backgroundColor: '#FF0000', color: '#fff', width: 35, height: 35 }}>
                      <YouTube fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Instagram">
                    <IconButton sx={{ backgroundColor: '#E4405F', color: '#fff', width: 35, height: 35 }}>
                      <Instagram fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Facebook">
                    <IconButton sx={{ backgroundColor: '#3b5998', color: '#fff', width: 35, height: 35 }}>
                      <Facebook fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Card>

              <Box
                sx={{
                  p: 2,
                  backgroundColor: isTrial && trialDaysLeft <= 3 ? '#ffe6e6' : isTrial ? '#fff3cd' : '#e8f5e9',
                  borderRadius: '10px',
                  border: `2px solid ${isTrial && trialDaysLeft <= 3 ? '#e74c3c' : isTrial ? '#ffc107' : '#4caf50'}`,
                }}
              >
                <Typography variant="caption" sx={{ color: activationType === 'full' ? '#1b5e20' : '#856404', fontWeight: 'bold', fontSize: '12px' }}>
                  📞 {isArabic ? 'الدعم:' : 'Support:'} 05.42.03.80.84
                </Typography>
                
                {isTrial ? (
                  <>
                    <Typography variant="caption" sx={{ color: '#856404', display: 'block', mt: 0.5, fontSize: '11px', fontWeight: 600 }}>
                      ⏱️ {isArabic 
                        ? `نسخة تجريبية، ${trialDaysLeft} ${trialDaysLeft === 1 ? 'يوم' : 'أيام'} متبقية`
                        : `Version d'essai, ${trialDaysLeft} jour${trialDaysLeft > 1 ? 's' : ''} restant${trialDaysLeft > 1 ? 's' : ''}`
                      }
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(trialDaysLeft / parseInt(localStorage.getItem('trialDays') || TRIAL_EXPIRATION_DAYS.toString())) * 100}
                      sx={{ 
                        my: 1, 
                        height: 6, 
                        borderRadius: 3,
                        backgroundColor: '#ffe0e0',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: trialDaysLeft <= 3 ? '#e74c3c' : '#ffc107',
                        }
                      }}
                    />
                    <Button
                      onClick={() => setShowActivationDialog(true)}
                      fullWidth
                      variant="contained"
                      size="small"
                      sx={{
                        backgroundColor: trialDaysLeft <= 3 ? '#e74c3c' : '#ff6b35',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        borderRadius: 1.5,
                        '&:hover': { backgroundColor: trialDaysLeft <= 3 ? '#c0392b' : '#e85a28' },
                      }}
                    >
                      {trialDaysLeft <= 3 ? '🔥 ' : '⚡ '}
                      {isArabic ? 'تفعيل الآن' : 'ACTIVATION MAINTENANT'}
                    </Button>
                  </>
                ) : activationType === 'full' ? (
                  <Typography variant="caption" sx={{ color: '#1b5e20', display: 'block', mt: 0.5, fontSize: '11px', fontWeight: 'bold' }}>
                    ✅ {isArabic ? 'نسخة كاملة مفعّلة' : 'Version complète activée'}
                  </Typography>
                ) : null}
              </Box>
            </Box>
          </Box>
        ) : (
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            {renderPageContent()}
          </Box>
        )}
      </Box>

      {/* Animation Styles */}
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
