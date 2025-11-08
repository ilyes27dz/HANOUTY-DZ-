// src/renderer/Login.tsx - ✅ ULTIMATE PRODUCTION VERSION v2.0 - COMPLETE & SECURE
import React, { useState, useEffect, useRef } from 'react';
import { 
Box, Button, TextField, Typography, IconButton, Tooltip, Paper,
  Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
  Alert, Snackbar
} from '@mui/material';
import {
  Save as SaveIcon,   Facebook as FacebookIcon,   WhatsApp as WhatsAppIcon,
  Instagram as InstagramIcon,   ExitToApp as ExitIcon,   Pin as PinIcon,
  Language as LanguageIcon, CloudDownload as DownloadIcon,
  Lock as LockIcon, Settings as SettingsIcon, Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,   CheckCircle as CheckIcon,
  Warning as WarningIcon, GitHub as GitHubIcon, Email as EmailIcon
} from '@mui/icons-material';

interface LoginProps {
  onLogin: () => void;
}

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(0[5-7]\d{8}|04\d{8})$/;
  return phoneRegex.test(phone);
};

export default function Login({ onLogin }: LoginProps) {
  const [lang, setLang] = useState<'ar' | 'fr'>('fr');
const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const [loginMode, setLoginMode] = useState<'admin' | 'pin' | 'forgot' | 'settings'>('admin');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
const [showPassword, setShowPassword] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinStep, setPinStep] = useState(0);
  const [setupPhone, setSetupPhone] = useState('');
  const [setupEmail, setSetupEmail] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPhoneError, setForgotPhoneError] = useState('');
  const [forgotEmailError, setForgotEmailError] = useState('');
  const [forgotStep, setForgotStep] = useState(0);
  const [newPin, setNewPin] = useState('');
  const [newPinConfirm, setNewPinConfirm] = useState('');
  const [newPinStep, setNewPinStep] = useState(0);
  const [settingsStep, setSettingsStep] = useState(0);
  const [settingsOldPin, setSettingsOldPin] = useState('');
  const [settingsNewPin, setSettingsNewPin] = useState('');
  const [settingsNewPinConfirm, setSettingsNewPinConfirm] = useState('');
  const [settingsPinStep, setSettingsPinStep] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<any>({});
  const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState<any>({ open: false, message: '', type: 'success' });

  const emailFieldRef = useRef<HTMLInputElement>(null);

  const texts = {
    ar: {
      title: 'HANOUTY DZ',
      subtitle: 'نسخة 1.0',
      adminTab: 'أدمن',
      pinTab: 'رمز PIN',
      forgotTab: 'نسيت؟',
      settingsTab: 'الإعدادات',
      username: 'اسم المستخدم',
      password: 'كلمة المرور',
      passwordHint: '💡 كلمة المرور: hanoutydz',
      enterPin: 'أدخل 4 أرقام',
      clear: 'مسح',
      copyright: '© 2025 HANOUTY DZ',
      loginError: '❌ بيانات خاطئة!',
      pinError: '❌ رمز PIN غير صحيح!',
pinNotMatch: '❌ الرموز غير متطابقة!',
      setupPinTitle: 'إعداد رمز PIN',
      confirmPinMsg: 'أعد إدخال الرمز',
      phone: 'الهاتف (0550505050)',
      email: 'البريد (example@domain.com)',
      pinSetupSuccess: '✅ تم الحفظ!',
      forgotVerify: 'التحقق',
      forgotCodeSent: '✅ تم التحقق!',
      enterNewPin: 'رمز جديد',
      pinChangedSuccess: '✅ تم التغيير!',
      errorFilledFields: '❌ ملء الحقول!',
      errorDataNotMatch: '❌ خطأ!',
      backupSuccess: '✅ تم حفظ النسخة!',
      restoreSuccess: '✅ تم استعادة النسخة!',
      okBtn: 'حسناً',
      confirmBtn: 'تأكيد',
      cancelBtn: 'إلغاء',
      nextBtn: 'التالي',
      loginBtn: 'دخول',
      settingsTitle: 'تغيير الكود',
      invalidEmail: '❌ البريد غير صحيح!',
      invalidPhone: '❌ الهاتف: 0550505050 أو 045454545',
      restoreError: '❌ خطأ في استعادة النسخة!',
      fileReadError: '❌ فشل قراءة الملف!',
      invalidBackupFile: '❌ ملف النسخة غير صحيح!',
      oldPinWrong: '❌ كود قديم خاطئ!',
      samePinError: '❌ لا يمكن استخدام نفس الكود!',
      step1: 'الخطوة 1: الهاتف + البريد + رمز PIN',
      step2: 'الخطوة 2: تأكيد رمز PIN',
      oldPinStep: 'الخطوة 1: الكود القديم',
      newPinStep: 'الخطوة 2: الكود الجديد',
      confirmPinStep: 'الخطوة 3: تأكيد',
      ilyesTech: 'ILYES TECHNOLOGY',
      contact: 'تواصل معنا',
      developedBy: 'من تطوير ILYES',
      version: 'الإصدار',
    },
    fr: {
      title: 'HANOUTY DZ',
      subtitle: 'Version 1.0',
      adminTab: 'Admin',
      pinTab: 'Code PIN',
      forgotTab: 'Oublié?',
      settingsTab: 'Paramètres',
      username: 'Utilisateur',
      password: 'Mot de passe',
      passwordHint: '💡 Mot de passe: hanoutydz',
      enterPin: '4 chiffres',
      clear: 'Effacer',
      copyright: '© 2025 HANOUTY DZ',
      loginError: '❌ Incorrect!',
      pinError: '❌ Code!',
      pinNotMatch: '❌ Différents!',
      setupPinTitle: 'Config PIN',
      confirmPinMsg: 'Confirmez',
      phone: 'Téléphone (0550505050)',
      email: 'E-mail (example@domain.com)',
      pinSetupSuccess: '✅ OK!',
      forgotVerify: 'Vérifier',
      forgotCodeSent: '✅ Vérif!',
      enterNewPin: 'Nouveau',
      pinChangedSuccess: '✅ Changé!',
      errorFilledFields: '❌ Remplissez!',
      errorDataNotMatch: '❌ Erreur!',
      backupSuccess: '✅ Sauvegarde OK!',
      restoreSuccess: '✅ Restauration OK!',
      okBtn: 'OK',
      confirmBtn: 'Confirmer',
      cancelBtn: 'Annuler',
      nextBtn: 'Suivant',
      loginBtn: 'Connexion',
      settingsTitle: 'Changer',
      invalidEmail: '❌ Email invalide!',
      invalidPhone: '❌ Téléphone: 0550505050 ou 045454545',
      restoreError: '❌ Erreur de restauration!',
      fileReadError: '❌ Échec lecture fichier!',
      invalidBackupFile: '❌ Fichier invalide!',
      oldPinWrong: '❌ Ancien code incorrect!',
      samePinError: '❌ Même code interdit!',
      step1: 'Étape 1: Téléphone + Email + PIN',
      step2: 'Étape 2: Confirmer PIN',
      oldPinStep: 'Étape 1: Ancien code',
      newPinStep: 'Étape 2: Nouveau code',
      confirmPinStep: 'Étape 3: Confirmer',
      ilyesTech: 'ILYES TECHNOLOGY',
      contact: 'Contactez-nous',
      developedBy: 'Développé par ILYES',
      version: 'Version',
    }
  };

  const t = texts[lang];
  const isRTL = lang === 'ar';

// ============================================
  // 🔹 Initialize
  // ============================================
  useEffect(() => {
    const savedPin = localStorage.getItem('userPin');
    setIsFirstTime(!savedPin);
    if (!savedPin) setLoginMode('pin');
  }, []);

  // ============================================
  // 🔹 Show Snackbar
  // ============================================
  const showSnackbar = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setSnackbar({ open: true, message, type });
  };

  // ============================================
  // 🔹 Backup Database
  // ============================================
  const handleBackup = () => {
    try {
      const backupData = {
        userPin: localStorage.getItem('userPin'),
        setupPhone: localStorage.getItem('setupPhone'),
        setupEmail: localStorage.getItem('setupEmail'),
        timestamp: new Date().toISOString(),
        version: '1.0'
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hanouty-backup-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showSnackbar(t.backupSuccess, 'success');
      showDialog({
        title: lang === 'ar' ? 'نجاح' : 'Succès',
        message: t.backupSuccess,
        icon: 'success',
        confirmText: t.okBtn
      });
    } catch (error) {
      console.error('Backup error:', error);
      showSnackbar(lang === 'ar' ? '❌ فشل النسخ!' : '❌ Erreur sauvegarde!', 'error');
    }
  };

  // ============================================
  // 🔹 Restore Backup
  // ============================================
  const handleRestore = () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event: any) => {
            try {
              const backupData = JSON.parse(event.target.result);
              
              // ✅ Validate backup structure
              if (
                backupData.userPin &&
                backupData.setupPhone &&
                backupData.setupEmail &&
                typeof backupData.userPin === 'string' &&
                typeof backupData.setupPhone === 'string' &&
                typeof backupData.setupEmail === 'string'
              ) {
                localStorage.setItem('userPin', backupData.userPin);
                localStorage.setItem('setupPhone', backupData.setupPhone);
                localStorage.setItem('setupEmail', backupData.setupEmail);
                
                showSnackbar(t.restoreSuccess, 'success');
                showDialog({
                  title: lang === 'ar' ? 'نجاح' : 'Succès',
                  message: t.restoreSuccess,
                  icon: 'success',
                  confirmText: t.okBtn,
                  onConfirm: () => window.location.reload()
                });
              } else {
                showSnackbar(t.invalidBackupFile, 'error');
                showDialog({
                  title: lang === 'ar' ? 'خطأ' : 'Erreur',
                  message: t.invalidBackupFile,
                  icon: 'warning',
                  confirmText: t.okBtn
                });
              }
            } catch (error) {
              console.error('JSON parse error:', error);
              showSnackbar(t.fileReadError, 'error');
              showDialog({
                title: lang === 'ar' ? 'خطأ' : 'Erreur',
                message: t.fileReadError,
                icon: 'warning',
                confirmText: t.okBtn
              });
            }
          };
          reader.onerror = () => {
            showSnackbar(t.fileReadError, 'error');
          };
          reader.readAsText(file);
        }
      };
      input.click();
    } catch (error) {
      console.error('Restore error:', error);
      showSnackbar(t.restoreError, 'error');
    }
  };

  // ============================================
  // 🔹 Keyboard Events
  // ============================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
// PIN - Setup Step 2 (Confirm)
      if (loginMode === 'pin' && isFirstTime && pinStep === 1) {
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
          if (confirmPin.length < 4) setConfirmPin(confirmPin + e.key);
        } else if (e.key === 'Backspace') {
          e.preventDefault();
          setConfirmPin(confirmPin.slice(0, -1));
        } else if (e.key === 'Enter' && confirmPin.length === 4) {
          e.preventDefault();
          handleSetupPin();
        }
        return;
      }

      // PIN - Setup Step 1 (Input)
      if (loginMode === 'pin' && isFirstTime && pinStep === 0 && setupPhone && setupEmail) {
        if (e.key >= '0' && e.key <= '9') {
          e.preventDefault();
          if (pin.length < 4) setPin(pin + e.key);
      } else if (e.key === 'Backspace') {
e.preventDefault();
        setPin(pin.slice(0, -1));
            } else if (e.key === 'Enter' && pin.length === 4) {
e.preventDefault();
          setPinStep(1);
          setConfirmPin('');
        }
        return;
      }

      // PIN - Regular Login
      if (loginMode === 'pin' && !isFirstTime) {
        if (e.key >= '0' && e.key <= '9') {
          e.preventDefault();
          if (pin.length < 4) setPin(pin + e.key);
        } else if (e.key === 'Backspace') {
          e.preventDefault();
          setPin(pin.slice(0, -1));
        } else if (e.key === 'Enter' && pin.length === 4) {
          e.preventDefault();
        handlePinLogin();
      }
    return;
      }

      // Forgot PIN
      if (loginMode === 'forgot' && forgotStep === 1) {
        if (e.key >= '0' && e.key <= '9') {
          e.preventDefault();
          if (newPinStep === 0 && newPin.length < 4) setNewPin(newPin + e.key);
          else if (newPinStep === 1 && newPinConfirm.length < 4)
            setNewPinConfirm(newPinConfirm + e.key);
        } else if (e.key === 'Backspace') {
          e.preventDefault();
          if (newPinStep === 0) setNewPin(newPin.slice(0, -1));
          else setNewPinConfirm(newPinConfirm.slice(0, -1));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (newPinStep === 0 && newPin.length === 4) {
            setNewPinStep(1);
            setNewPinConfirm('');
          } else if (
            newPinStep === 1 &&
            newPinConfirm.length === 4 &&
            newPin === newPinConfirm
          ) {
            handleSetNewPin();
          }
        }
        return;
      }

      // Settings
      if (loginMode === 'settings' && settingsStep === 1) {
        if (e.key >= '0' && e.key <= '9') {
          e.preventDefault();
          if (settingsPinStep === 0 && settingsOldPin.length < 4)
            setSettingsOldPin(settingsOldPin + e.key);
          else if (settingsPinStep === 1 && settingsNewPin.length < 4)
            setSettingsNewPin(settingsNewPin + e.key);
          else if (settingsPinStep === 2 && settingsNewPinConfirm.length < 4)
            setSettingsNewPinConfirm(settingsNewPinConfirm + e.key);
        } else if (e.key === 'Backspace') {
          e.preventDefault();
          if (settingsPinStep === 0) setSettingsOldPin(settingsOldPin.slice(0, -1));
          else if (settingsPinStep === 1) setSettingsNewPin(settingsNewPin.slice(0, -1));
          else if (settingsPinStep === 2)
            setSettingsNewPinConfirm(settingsNewPinConfirm.slice(0, -1));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          handleSettingsEnter();
        }
        return;
      }

      // Admin login
      if (loginMode === 'admin' && e.key === 'Enter' && username && password) {
        e.preventDefault();
        handleAdminLogin();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    pin,
    confirmPin,
    newPin,
    newPinConfirm,
    settingsOldPin,
    settingsNewPin,
    settingsNewPinConfirm,
    username,
    password,
    loginMode,
    isFirstTime,
    pinStep,
    forgotStep,
    newPinStep,
    settingsStep,
    settingsPinStep,
    setupPhone,
    setupEmail,
  ]);

  // ============================================
  // 🔹 Dialog
  // ============================================
  const showDialog = (config: any) => {
    setDialogConfig(config);
    setDialogOpen(true);
  };

// ============================================
  // 🔹 Admin Login
  // ============================================
  const handleAdminLogin = () => {
    if (username === 'admin' && password === 'hanoutydz') {
      onLogin();
    } else {
showSnackbar(t.loginError, 'error');
      showDialog({
        title: lang === 'ar' ? 'خطأ' : 'Erreur',
        message: t.loginError,
        icon: 'warning',
        confirmText: t.okBtn
      });
setPassword('');
    }
  };

// ============================================
  // 🔹 PIN Login
  // ============================================
  const handlePinLogin = () => {
    const savedPin = localStorage.getItem('userPin');
    if (pin === savedPin) {
      onLogin();
    } else {
showSnackbar(t.pinError, 'error');
      showDialog({
        title: lang === 'ar' ? 'خطأ' : 'Erreur',
        message: t.pinError,
        icon: 'warning',
        confirmText: t.okBtn
      });
      setPin('');
    }
  };

  // ============================================
  // 🔹 Next PIN Step
  // ============================================
  const handleNextPinStep = () => {
    setPhoneError('');
    setEmailError('');

    if (!isValidPhone(setupPhone)) {
      setPhoneError(t.invalidPhone);
      return;
    }
    if (!isValidEmail(setupEmail)) {
      setEmailError(t.invalidEmail);
      return;
    }

    setPinStep(1);
    setPin('');
    setConfirmPin('');
  };

  // ============================================
  // 🔹 PIN Numpad
  // ============================================
  const handlePinNumpad = (num: string) => {
    if (loginMode === 'pin') {
      if (isFirstTime) {
        if (pinStep === 0 && pin.length < 4) setPin(pin + num);
        else if (pinStep === 1 && confirmPin.length < 4) setConfirmPin(confirmPin + num);
        } else {
if (pin.length < 4) setPin(pin + num);
      }
    } else if (loginMode === 'forgot') {
      if (newPinStep === 0 && newPin.length < 4) setNewPin(newPin + num);
      else if (newPinStep === 1 && newPinConfirm.length < 4)
        setNewPinConfirm(newPinConfirm + num);
    } else if (loginMode === 'settings') {
      if (settingsPinStep === 0 && settingsOldPin.length < 4)
        setSettingsOldPin(settingsOldPin + num);
      else if (settingsPinStep === 1 && settingsNewPin.length < 4)
        setSettingsNewPin(settingsNewPin + num);
      else if (settingsPinStep === 2 && settingsNewPinConfirm.length < 4)
        setSettingsNewPinConfirm(settingsNewPinConfirm + num);
    }
  };

  // ============================================
  // 🔹 Setup PIN
  // ============================================
  const handleSetupPin = () => {
    if (pin !== confirmPin) {
      showSnackbar(t.pinNotMatch, 'error');
          showDialog({
            title: lang === 'ar' ? 'خطأ' : 'Erreur',
            message: t.pinNotMatch,
            icon: 'warning',
            confirmText: t.okBtn
      });
      setPin('');
      setConfirmPin('');
      setPinStep(0);
      return;
    }
    localStorage.setItem('userPin', pin);
    localStorage.setItem('setupPhone', setupPhone);
    localStorage.setItem('setupEmail', setupEmail);
    setIsFirstTime(false);
    showSnackbar(t.pinSetupSuccess, 'success');
        showDialog({
          title: lang === 'ar' ? 'نجاح' : 'Succès',
          message: t.pinSetupSuccess,
          icon: 'success',
          confirmText: t.okBtn,
onConfirm: () => onLogin()
        });
      };

  // ============================================
  // 🔹 Forgot Verify
  // ============================================
  const handleForgotVerify = () => {
    setForgotPhoneError('');
    setForgotEmailError('');

    if (!isValidPhone(forgotPhone)) {
      setForgotPhoneError(t.invalidPhone);
      return;
    }
    if (!isValidEmail(forgotEmail)) {
      setForgotEmailError(t.invalidEmail);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const savedPhone = localStorage.getItem('setupPhone');
      const savedEmail = localStorage.getItem('setupEmail');
      if (forgotPhone === savedPhone && forgotEmail === savedEmail) {
        setForgotStep(1);
        showSnackbar(t.forgotCodeSent, 'success');
          showDialog({
            title: lang === 'ar' ? 'نجاح' : 'Succès',
            message: t.forgotCodeSent,
            icon: 'success',
            confirmText: t.okBtn
          });
        } else {
showSnackbar(t.errorDataNotMatch, 'error');
          showDialog({
            title: lang === 'ar' ? 'خطأ' : 'Erreur',
            message: t.errorDataNotMatch,
          icon: 'warning',
          confirmText: t.okBtn
        });
      }
    }, 1500);
  };

  // ============================================
  // 🔹 Set New PIN
  // ============================================
  const handleSetNewPin = () => {
    localStorage.setItem('userPin', newPin);
    setForgotStep(0);
    setNewPinStep(0);
    setNewPin('');
    setNewPinConfirm('');
    setForgotPhone('');
    setForgotEmail('');
    showSnackbar(t.pinChangedSuccess, 'success');
    showDialog({
      title: lang === 'ar' ? 'نجاح' : 'Succès',
      message: t.pinChangedSuccess,
            icon: 'success',
            confirmText: t.okBtn,
onConfirm: () => setLoginMode('pin')
          });
        };

  // ============================================
  // 🔹 Settings Enter
  // ============================================
  const handleSettingsEnter = () => {
    if (settingsPinStep === 0 && settingsOldPin.length === 4) {
      const savedPin = localStorage.getItem('userPin');
      if (settingsOldPin === savedPin) {
        setSettingsPinStep(1);
        setSettingsNewPin('');
      } else {
        showSnackbar(t.oldPinWrong, 'error');
    showDialog({
      title: lang === 'ar' ? 'خطأ' : 'Erreur',
      message: t.oldPinWrong,
      icon: 'warning',
      confirmText: t.okBtn
        });
        setSettingsOldPin('');
      }
    } else if (settingsPinStep === 1 && settingsNewPin.length === 4) {
      const savedPin = localStorage.getItem('userPin');
      if (settingsNewPin === savedPin) {
        showSnackbar(t.samePinError, 'error');
        showDialog({
          title: lang === 'ar' ? 'خطأ' : 'Erreur',
          message: t.samePinError,
          icon: 'warning',
          confirmText: t.okBtn
        });
        setSettingsNewPin('');
      } else {
        setSettingsPinStep(2);
        setSettingsNewPinConfirm('');
      }
    } else if (settingsPinStep === 2 && settingsNewPinConfirm.length === 4) {
    if (settingsNewPin === settingsNewPinConfirm) {
      handleSettingsChangePin();
    } else {
        showSnackbar(t.pinNotMatch, 'error');
        showDialog({
          title: lang === 'ar' ? 'خطأ' : 'Erreur',
          message: t.pinNotMatch,
          icon: 'warning',
          confirmText: t.okBtn
        });
        setSettingsNewPin('');
        setSettingsNewPinConfirm('');
        setSettingsPinStep(1);
      }
    }
  };

  // ============================================
  // 🔹 Settings Change PIN
  // ============================================
  const handleSettingsChangePin = () => {
    localStorage.setItem('userPin', settingsNewPin);
    setSettingsStep(0);
    setSettingsPinStep(0);
    setSettingsOldPin('');
    setSettingsNewPin('');
    setSettingsNewPinConfirm('');
    showSnackbar(t.pinChangedSuccess, 'success');
    showDialog({
      title: lang === 'ar' ? 'نجاح' : 'Succès',
      message: t.pinChangedSuccess,
      icon: 'success',
      confirmText: t.okBtn,
      onConfirm: () => setLoginMode('pin')
    });
  };

  // ============================================
  // 🔹 Render Numpad
  // ============================================
  const renderNumpad = () => (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 3 }}>
        {[0, 1, 2, 3].map((index) => {
          let currentPin = pin;
          if (loginMode === 'pin' && isFirstTime && pinStep === 1)
            currentPin = confirmPin;
          else if (loginMode === 'forgot' && newPinStep === 1)
            currentPin = newPinConfirm;
          else if (loginMode === 'forgot' && newPinStep === 0) currentPin = newPin;
          else if (loginMode === 'settings' && settingsPinStep === 0)
            currentPin = settingsOldPin;
          else if (loginMode === 'settings' && settingsPinStep === 1)
            currentPin = settingsNewPin;
          else if (loginMode === 'settings' && settingsPinStep === 2)
            currentPin = settingsNewPinConfirm;

  return (
    <Box
      key={index}
      sx={{
        width: 24,
          height: 24,
          borderRadius: '50%',
          bgcolor: currentPin.length > index ? '#FF5722' : '#E0E0E0',
                border: '2.5px solid',
                borderColor: currentPin.length > index ? '#FF5722' : '#BDBDBD',
                transition: 'all 0.4s',
                boxShadow:
                  currentPin.length > index
                    ? '0 0 16px rgba(255, 87, 34, 0.7)'
                    : 'none',
                transform:
                  currentPin.length > index ? 'scale(1.15)' : 'scale(1)'
              }}
            />
          );
        })}
      </Box>
      
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1.8,
          mb: 2
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Box
            key={num}
            onClick={() => handlePinNumpad(num.toString())}
        sx={{
          height: 60,
          display: 'flex',
          alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #FF5722 0%, #FF9800 100%)',
              borderRadius: 3,
              fontSize: '1.6rem',
              fontWeight: 900,
              color: '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 15px rgba(255, 87, 34, 0.4)',
              '&:hover': {
                transform: 'translateY(-4px) scale(1.08)',
                boxShadow: '0 8px 25px rgba(255, 87, 34, 0.7)'
              }
            }}
          >
            {num}
          </Box>
        ))}
      </Box>

      <Box
            sx={{ 
              display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1.8,
          mb: 2
        }}
      >
        <Box
          onClick={() => {
            if (loginMode === 'pin') {
              if (isFirstTime && pinStep === 0) setPin('');
              else if (isFirstTime && pinStep === 1) setConfirmPin('');
              else if (!isFirstTime) setPin('');
            } else if (loginMode === 'forgot') {
              if (newPinStep === 0) setNewPin('');
              else setNewPinConfirm('');
            } else if (loginMode === 'settings') {
              if (settingsPinStep === 0) setSettingsOldPin('');
              else if (settingsPinStep === 1) setSettingsNewPin('');
              else setSettingsNewPinConfirm('');
            }
          }}
            sx={{ 
              height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background:
              'linear-gradient(135deg, #F44336 0%, #E91E63 100%)',
            borderRadius: 3,
            color: '#FFFFFF',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 700,
            transition: 'all 0.3s',
            boxShadow: '0 4px 15px rgba(244, 67, 54, 0.4)',
              '&:hover': { 
                transform: 'translateY(-4px) scale(1.08)'
            }
            }}
          >
            {t.clear}
          </Box>

        <Box 
            onClick={() => handlePinNumpad('0')} 
            sx={{ 
              height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #FF5722 0%, #FF9800 100%)',
              borderRadius: 3,
            fontSize: '1.6rem',
            fontWeight: 900,
            color: '#FFFFFF',
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 4px 15px rgba(255, 87, 34, 0.4)',
              '&:hover': { 
                transform: 'translateY(-4px) scale(1.08)'
            }
          }}
        >
          0
        </Box>

        <Box
          onClick={() => {
            if (loginMode === 'pin') {
              if (isFirstTime && pinStep === 0) setPin(pin.slice(0, -1));
              else if (isFirstTime && pinStep === 1)
                setConfirmPin(confirmPin.slice(0, -1));
              else if (!isFirstTime) setPin(pin.slice(0, -1));
            } else if (loginMode === 'forgot') {
              if (newPinStep === 0) setNewPin(newPin.slice(0, -1));
              else setNewPinConfirm(newPinConfirm.slice(0, -1));
            } else if (loginMode === 'settings') {
              if (settingsPinStep === 0)
                setSettingsOldPin(settingsOldPin.slice(0, -1));
              else if (settingsPinStep === 1)
                setSettingsNewPin(settingsNewPin.slice(0, -1));
              else setSettingsNewPinConfirm(settingsNewPinConfirm.slice(0, -1));
            }
          }}
            sx={{ 
              height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #2196F3 0%, #03A9F4 100%)',
              borderRadius: 3,
            cursor: 'pointer',
            color: '#FFFFFF',
            fontSize: '1.4rem',
            fontWeight: 700,
            transition: 'all 0.3s',
            boxShadow: '0 4px 15px rgba(33, 150, 243, 0.4)',
              '&:hover': { 
                transform: 'translateY(-4px) scale(1.08)'
            }
            }}
          >
            ⌫
      </Box>
</Box>
    </>
  );

  // ============================================
  // 🔹 Render Main UI
  // ============================================
  return (
    <Box
      dir={isRTL ? 'rtl' : 'ltr'}
      sx={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #F5F7FA 0%, #C3CFE2 100%)',
        overflow: 'hidden'
      }}
    >
      {/* ✅ Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        PaperProps={{           sx: {             borderRadius: 4,             minWidth: 320 }         }}
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 3, pb: 1 }}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            {dialogConfig.icon === 'success' && (
              <CheckIcon sx={{ fontSize: 60, color: '#4CAF50' }} />
            )}
            {dialogConfig.icon === 'warning' && (
              <WarningIcon sx={{ fontSize: 60, color: '#FF9800' }} />
)}
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#FF5722' }}>
            {dialogConfig.title}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
          <Typography sx={{             color: '#666', fontSize: '0.95rem'           }}>
            {dialogConfig.message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 1 }}>
                      <Button 
              onClick={() => setDialogOpen(false)} 
              sx={{ color: '#999'               }}
            >
              {t.cancelBtn}
            </Button>
                    <Button 
            onClick={() => {
              if (dialogConfig.onConfirm)                 dialogConfig.onConfirm();
                            setDialogOpen(false);
            }}
            variant="contained"
sx={{ bgcolor: '#FF5722' }}
          >
            {t.okBtn}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: isRTL ? 'right' : 'left' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.type}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* ✅ Top Buttons */}
      <Box
            sx={{ 
              position: 'absolute',
          top: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 1.2,
          zIndex: 10
        }}
      >
        <Tooltip title={lang === 'ar' ? 'اللغة' : 'Langue'} arrow>
          <IconButton
            onClick={() => setLang(lang === 'ar' ? 'fr' : 'ar')}
            sx={{
              bgcolor: 'rgba(156, 39, 176, 0.15)',
              width: 42,
              height: 42,
              '&:hover': {
                bgcolor: 'rgba(156, 39, 176, 0.3)',
                transform: 'scale(1.1)'
              }
            }}
          >
            <LanguageIcon sx={{ color: '#9C27B0', fontSize: 20 }} />
          </IconButton>
        </Tooltip>
        <Tooltip
          title={lang === 'ar' ? 'حفظ النسخة' : 'Sauvegarder'}
          arrow
        >
          <IconButton
            onClick={handleBackup}
            sx={{
              bgcolor: 'rgba(76, 175, 80, 0.15)',
              width: 42,
              height: 42,
              '&:hover': {
                bgcolor: 'rgba(76, 175, 80, 0.3)',
                transform: 'scale(1.1)'
              }
            }}
          >
            <SaveIcon sx={{ color: '#4CAF50', fontSize: 20 }} />
          </IconButton>
        </Tooltip>
        <Tooltip
          title={lang === 'ar' ? 'استعادة النسخة' : 'Restaurer'}
          arrow
        >
          <IconButton
            onClick={handleRestore}
            sx={{
              bgcolor: 'rgba(33, 150, 243, 0.15)',
              width: 42,
              height: 42,
              '&:hover': {
                bgcolor: 'rgba(33, 150, 243, 0.3)',
                transform: 'scale(1.1)'
              }
            }}
          >
            <DownloadIcon sx={{ color: '#2196F3', fontSize: 20 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title={lang === 'ar' ? 'خروج' : 'Quitter'} arrow>
          <IconButton
            onClick={() => window.close()}
            sx={{
              bgcolor: 'rgba(244, 67, 54, 0.15)',
              width: 42,
              height: 42,
              '&:hover': {
                bgcolor: 'rgba(244, 67, 54, 0.3)',
                transform: 'scale(1.1)'
              }
            }}
          >
            <ExitIcon sx={{ color: '#F44336', fontSize: 20 }} />
          </IconButton>
        </Tooltip>
      </Box>

{/* ✅ Main Card */}
      <Paper
        elevation={20}
        sx={{
          width: 480,
          bgcolor: '#FFFFFF',
          borderRadius: 5,
          p: 3.5,
          boxShadow: '0 20px 70px rgba(0, 0, 0, 0.18)',
          border: '1px solid rgba(255, 87, 34, 0.1)',
                    maxHeight: '95vh',
          overflowY: 'auto'
        }}
      >
{/* ✅ Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 85,
              height: 85,
              mx: 'auto',
              mb: 2,
              borderRadius: '24px',
              background:
'linear-gradient(135deg, #FF5722 0%, #FF9800 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 15px 40px rgba(255, 87, 34, 0.6)',
              fontSize: 52
            }}
>
              🛒
                      </Box>
                    <Typography
variant="h3"
sx={{
color: '#FF5722',
fontWeight: 900,
mb: 0.5,
              fontSize: '2.2rem'
            }}
>
            {t.title}
          </Typography>
                    <Typography variant="body2" sx={{ color: '#999', fontSize: '1rem' }}>
            {t.subtitle}
          </Typography>
        </Box>

{/* ✅ Tabs - Only if not first time */}
        {!isFirstTime && (
        <Tabs
          value={loginMode}
          onChange={(_, v) => {
setLoginMode(v);
              setUsername('admin');
              setPassword('');
              setPin('');
              setConfirmPin('');
            }}
          sx={{
            mb: 3,
            '& .MuiTabs-indicator': {               bgcolor: '#FF5722',               height: 4 }
          }}
        >
          <Tab 
            value="admin" 
            label={t.adminTab}
            sx={{
              flex: 1,
                            fontSize: '0.75rem',
                            '&.Mui-selected': {
                color: '#FF5722',
              fontWeight: 700
                }
            }}
          />
          <Tab 
            value="pin" 
            label={t.pinTab}
            icon={<PinIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            sx={{
              flex: 1,
                            fontSize: '0.75rem',
                            '&.Mui-selected': {
                color: '#FF5722',
              fontWeight: 700
                }
              }}
            />
            <Tab
              value="forgot"
              label={t.forgotTab}
              icon={<LockIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              sx={{
                flex: 1,
                fontSize: '0.75rem',
                '&.Mui-selected': {
                  color: '#FF5722',
                  fontWeight: 700
                }
              }}
            />
            <Tab
              value="settings"
              label={t.settingsTab}
              icon={<SettingsIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              sx={{
                flex: 1,
                fontSize: '0.75rem',
                '&.Mui-selected': {
                  color: '#FF5722',
                  fontWeight: 700
                }
            }}
          />
        </Tabs>
)}

        {/* ✅ Admin Login */}
        {loginMode === 'admin' && (
          <>
            <Box
              sx={{
                mb: 3,
                p: 2.5,
                bgcolor: '#fff3e0',
                borderRadius: 3,
                textAlign: 'center',
                border: '2px solid #FFB74D'
              }}
            >
              <Typography sx={{ fontWeight: 700, color: '#E65100', fontSize: '0.95rem' }}>
                {lang === 'ar' ? 'تسجيل الدخول' : 'Connexion Admin'}
              </Typography>
            </Box>
            <TextField
              fullWidth
                            placeholder={t.username}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
              sx={{ mb: 1.5, bgcolor: '#f9f9f9' }}
            />
            <Box sx={{ position: 'relative', mb: 2.5 }}>
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                placeholder={t.password}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                sx={{ bgcolor: '#f9f9f9' }}
              />
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#FF5722'
                }}
              >
                {showPassword ? (
                  <VisibilityIcon sx={{ fontSize: 20 }} />
                ) : (
                  <VisibilityOffIcon sx={{ fontSize: 20 }} />
                )}
              </IconButton>
            </Box>
            <Typography sx={{ fontSize: '0.75rem', color: '#FF9800', mb: 2.5, textAlign: 'center', fontWeight: 600 }}>
              {t.passwordHint}
            </Typography>
            <Button
              fullWidth
              variant="contained"
              onClick={handleAdminLogin}
              disabled={!username || !password}
              sx={{
                background:
                  'linear-gradient(135deg, #FF5722 0%, #FF9800 100%)',
                py: 1.6,
                fontWeight: 700,
                borderRadius: 3,
                fontSize: '1.05rem'
              }}
            >
              {t.loginBtn}
            </Button>
          </>
        )}

        {/* ✅ PIN Setup */}
        {loginMode === 'pin' && isFirstTime === true && (
          <>
            <Box
              sx={{
                mb: 3,
                p: 3,
                  bgcolor: '#FFF3E0',
                  borderRadius: 3,
                textAlign: 'center',
                  border: '2px solid #FFB74D'
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  color: '#E65100',
                  mb: 0.5,
                  fontSize: '1rem'
                }}
              >
                {t.setupPinTitle}
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: '#666' }}>
                {pinStep === 0 ? t.step1 : t.step2}
              </Typography>
            </Box>
            {pinStep === 0 && (
              <>
                <TextField
                  fullWidth
                  placeholder={t.phone}
                  value={setupPhone}
                  onChange={(e) =>
                    setSetupPhone(e.target.value.replace(/[^0-9]/g, ''))
                  }
                  onKeyDown={(e) => {
                    if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' &&
                      e.key !== 'Tab' && e.key !== 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  inputMode="numeric"
                  inputProps={{ maxLength: 10 }}
                  error={!!phoneError}
                  helperText={phoneError}
                  sx={{ mb: 1.5, bgcolor: '#f9f9f9' }}
            />
            <TextField
ref={emailFieldRef}
                  id="email-field"
              fullWidth
                            placeholder={t.email}
              value={setupEmail}
              onChange={(e) => setSetupEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace') {
                      e.preventDefault();
                      setSetupEmail(setupEmail.slice(0, -1));
                    } else if (e.key === 'Enter') {
                      e.preventDefault();
                      if (
                        isValidPhone(setupPhone) &&
                        isValidEmail(setupEmail)
                      ) {
                        setPinStep(1);
                        setPin('');
                        setConfirmPin('');
                      }
                    }
                  }}
                  error={!!emailError}
                  helperText={emailError}
                  sx={{ mb: 2.5, bgcolor: '#f9f9f9' }}
                />
                <Box sx={{ mb: 2 }}>
                  <Typography
              sx={{
                fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#FF5722',
                      mb: 1
                    }}
                  >
                    {t.enterPin}
                  </Typography>
                  {renderNumpad()}
                </Box>
            <Button
              fullWidth
              variant="contained"
              onClick={handleNextPinStep}
                  disabled={
                    !setupPhone || !setupEmail || pin.length !== 4
}
              sx={{
                background:
                      'linear-gradient(135deg, #FF5722 0%, #FF9800 100%)',
                py: 1.6,
                fontWeight: 700,
                borderRadius: 3,
                    fontSize: '1.05rem'
              }}
            >
              {t.nextBtn}
            </Button>
          </>
        )}
            {pinStep === 1 && (
          <>
            {renderNumpad()}
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSetupPin}
                  disabled={pin.length !== 4 || confirmPin.length !== 4}
                  sx={{
                    background:
                      'linear-gradient(135deg, #FF5722 0%, #FF9800 100%)',
                    py: 1.6,
                    fontWeight: 700,
                    borderRadius: 3,
                    fontSize: '1.05rem'
                  }}
>
              {t.confirmBtn}
                </Button>
              </>
            )}
          </>
        )}

        {/* ✅ PIN Login */}
        {loginMode === 'pin' && isFirstTime === false && (
          <>
                <Box
                                    sx={{
                    mb: 3,
                p: 3,
                bgcolor: '#E3F2FD',
                    borderRadius: 3,
                textAlign: 'center',
                    border: '2px solid #2196F3'
              }}
            >
              <Typography
                sx={{ fontWeight: 700, color: '#1976D2', fontSize: '1rem' }}
              >
                {t.enterPin}
              </Typography>
            </Box>
{renderNumpad()}
          </>
        )}

        {/* ✅ Forgot PIN */}
        {loginMode === 'forgot' && !isFirstTime && (
          <>
              {forgotStep === 0 ? (
<>
                <Box
                                    sx={{
                    mb: 3,
                    p: 3,
                    bgcolor: '#F3E5F5',
                    borderRadius: 3,
                    textAlign: 'center',
                    border: '2px solid #CE93D8'
                  }}
                >
                  <Typography
                    sx={{
                    fontWeight: 700,
                    color: '#6a1b9a',
                      fontSize: '1rem'
                  }}
                >
                  {t.forgotVerify}
                  </Typography>
                </Box>
              <TextField
                  fullWidth
                  placeholder={t.phone}
                  value={forgotPhone}
                  onChange={(e) =>
                    setForgotPhone(e.target.value.replace(/[^0-9]/g, ''))
                  }
                  onKeyDown={(e) => {
                    if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' &&
                      e.key !== 'Tab' && e.key !== 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  inputMode="numeric"
                  inputProps={{ maxLength: 10 }}
                  error={!!forgotPhoneError}
                  helperText={forgotPhoneError}
                  sx={{ mb: 1.5, bgcolor: '#f9f9f9' }}
                />
                <TextField
                  fullWidth
                  placeholder={t.email}
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  error={!!forgotEmailError}
                  helperText={forgotEmailError}
                  sx={{ mb: 2.5, bgcolor: '#f9f9f9' }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleForgotVerify}
                  disabled={!forgotPhone || !forgotEmail || loading}
                  sx={{
                    background:
                      'linear-gradient(135deg, #FF5722 0%, #FF9800 100%)',
                    py: 1.6,
                    fontWeight: 700,
                    borderRadius: 3,
                    fontSize: '1.05rem'
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : (
                    t.forgotVerify
                  )}
                </Button>
              </>
            ) : (
              <>
                <Box
                sx={{
                  mb: 3,
                    p: 3,
                  bgcolor: '#E8F5E9',
                  borderRadius: 3,
                    textAlign: 'center',
border: '2px solid #81C784'
                  }}
                >
                  <Typography
                    sx={{
                  fontWeight: 700,
                  color: '#2e7d32',
                  fontSize: '1rem'
                }}
              >
                {t.enterNewPin}
                  </Typography>
              </Box>
{renderNumpad()}
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSetNewPin}
                  sx={{
                    background:
                      'linear-gradient(135deg, #FF5722 0%, #FF9800 100%)',
                    py: 1.6,
                    fontWeight: 700,
                    borderRadius: 3,
                    fontSize: '1.05rem'
                  }}
                >
                  {newPinStep === 0 ? t.nextBtn : t.confirmBtn}
                </Button>
              </>
            )}
          </>
        )}

        {/* ✅ Settings */}
        {loginMode === 'settings' && !isFirstTime && (
          <>
            {settingsStep === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography
                  sx={{ fontSize: '1.1rem', color: '#666', mb: 3 }}
                >
                  👆 {t.settingsTitle}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setSettingsStep(1)}
                sx={{
                  background:
                      'linear-gradient(135deg, #FF5722 0%, #FF9800 100%)',
                    py: 1.2,
                  fontWeight: 700,
                  borderRadius: 3
                  }}
                >
                  {lang === 'ar' ? 'ابدأ' : 'Commencer'}
                </Button>
              </Box>
) : (
              <>
              <Box
                                sx={{
                  mb: 3,
                    p: 3,
                    bgcolor: '#FCE4EC',
                    borderRadius: 3,
                    textAlign: 'center',
                    border: '2px solid #F06292'
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: '#c2185b',
                      fontSize: '0.9rem'
                }}
              >
                {settingsPinStep === 0
                      ? t.oldPinStep
                      : settingsPinStep === 1
                      ? t.newPinStep
                      : t.confirmPinStep}
</Typography>
              </Box>
            {renderNumpad()}
            <Button
              fullWidth
              variant="contained"
              onClick={handleSettingsChangePin}
              sx={{
                background:
                      'linear-gradient(135deg, #FF5722 0%, #FF9800 100%)',
                py: 1.6,
                fontWeight: 700,
                borderRadius: 3,
                    fontSize: '1.05rem'
              }}
            >
              {settingsPinStep === 2 ? t.confirmBtn : t.nextBtn}
            </Button>
</>
            )}
          </>
        )}

{/* ✅ Social Icons */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 3, mt: 4 }}>
          <Tooltip title="Facebook" arrow>
            <IconButton 
              onClick={() =>
window.open('https://facebook.com/ilyestechnology', '_blank')
} 
              sx={{ 
                                  bgcolor: '#4267B2',
                  width: 60,
                height: 60,
                transition: 'all 0.3s',
                boxShadow: '0 4px 15px rgba(66, 103, 178, 0.3)',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.15)'
                }
              }}
            >
              <FacebookIcon sx={{ color: '#fff', fontSize: 32 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="WhatsApp" arrow>
            <IconButton 
              onClick={() =>
window.open('https://wa.me/212550505050', '_blank')
} 
              sx={{ 
                                  bgcolor: '#25D366',
                  width: 60,
                height: 60,
                transition: 'all 0.3s',
                boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.15)'
                }
              }}
            >
              <WhatsAppIcon sx={{ color: '#fff', fontSize: 32 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Instagram" arrow>
            <IconButton 
              onClick={() =>
window.open('https://instagram.com/ilyestechnology', '_blank')
} 
              sx={{ 
                background:
                  'linear-gradient(135deg, #E1306C 0%, #C13584 100%)',
                width: 60,
                height: 60,
                transition: 'all 0.3s', 
                boxShadow: '0 4px 15px rgba(225, 48, 108, 0.3)',
                '&:hover': { 
                  transform: 'translateY(-8px) scale(1.15)'
                }
              }}
            >
              <InstagramIcon sx={{ color: '#fff', fontSize: 32 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="GitHub" arrow>
            <IconButton
              onClick={() =>
                window.open('https://github.com/ilyes27dz', '_blank')
              }
              sx={{
                bgcolor: '#333333',
                width: 60,
                height: 60,
                transition: 'all 0.3s',
                boxShadow: '0 4px 15px rgba(51, 51, 51, 0.3)',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.15)'
                }
              }}
            >
              <GitHubIcon sx={{ color: '#fff', fontSize: 32 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* ✅ Footer */}
        <Typography
          sx={{
            textAlign: 'center',
            color: '#BDBDBD',
            fontSize: '0.8rem',
            fontWeight: 500
          }}
>
          {t.copyright}
        </Typography>
      </Paper>
    </Box>
  );
}
