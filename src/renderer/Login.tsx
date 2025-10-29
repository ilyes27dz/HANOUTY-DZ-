// src/renderer/Login.tsx - ✅ النسخة النهائية مع Dialog
import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, TextField, Typography, IconButton, Tooltip, Paper, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { 
  Save as SaveIcon,
  Facebook as FacebookIcon,
  WhatsApp as WhatsAppIcon,
  Instagram as InstagramIcon,
  Login as LoginIcon,
  ExitToApp as ExitIcon,
  Pin as PinIcon,
  Language as LanguageIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [lang, setLang] = useState<'ar' | 'fr'>('ar');
  const [loginMode, setLoginMode] = useState<'credentials' | 'pin'>('credentials');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const usernameInputRef = useRef<HTMLInputElement>(null);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{
    title: string;
    message: string;
    icon: 'success' | 'info' | 'warning';
    confirmText: string;
    cancelText?: string;
    onConfirm?: () => void;
  }>({
    title: '',
    message: '',
    icon: 'info',
    confirmText: 'OK',
  });
  
  useEffect(() => {
    const focusInput = () => {
      if (loginMode === 'credentials' && usernameInputRef.current) {
        usernameInputRef.current.focus();
        usernameInputRef.current.select();
      }
    };

    focusInput();
    const timers = [100, 300, 500, 1000].map(delay => setTimeout(focusInput, delay));

    return () => timers.forEach(clearTimeout);
  }, [loginMode]);

  useEffect(() => {
    const handleFocus = () => {
      if (loginMode === 'credentials' && usernameInputRef.current) {
        setTimeout(() => {
          if (usernameInputRef.current) {
            usernameInputRef.current.focus();
            usernameInputRef.current.select();
          }
        }, 100);
      }
    };

    const handleVisibility = () => {
      if (!document.hidden && loginMode === 'credentials' && usernameInputRef.current) {
        setTimeout(() => {
          if (usernameInputRef.current) {
            usernameInputRef.current.focus();
            usernameInputRef.current.select();
          }
        }, 100);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [loginMode]);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).require) {
      try {
        const { ipcRenderer } = (window as any).require('electron');
        
        const handleLogoutComplete = () => {
          setTimeout(() => {
            if (usernameInputRef.current) {
              usernameInputRef.current.focus();
              usernameInputRef.current.select();
            }
          }, 300);
        };

        ipcRenderer.on('logout-complete', handleLogoutComplete);

        return () => {
          ipcRenderer.removeListener('logout-complete', handleLogoutComplete);
        };
      } catch (error) {
        console.error('IPC error:', error);
      }
    }
  }, []);

  const texts = {
    ar: {
      title: 'HANOUTY DZ',
      subtitle: 'نسخة 1.0',
      usernameTab: 'اسم المستخدم',
      pinTab: 'رمز PIN',
      usernamePlaceholder: 'اسم المستخدم',
      passwordPlaceholder: 'كلمة المرور',
      loginBtn: 'دخول',
      clear: 'مسح',
      copyright: '© 2025 HANOUTY DZ - جميع الحقوق محفوظة',
      backupTitle: 'النسخ الاحتياطي',
      backupSuccess: '✅ تم حفظ النسخة الاحتياطية بنجاح!\n\nالمسار:\n',
      backupError: '❌ حدث خطأ أثناء النسخ الاحتياطي!',
      updateTitle: 'التحقق من التحديثات',
      updateChecking: '🔄 جاري التحقق من التحديثات...',
      updateAvailable: '🎉 يوجد تحديث جديد متاح!\n\nالإصدار الجديد: {version}\n\nهل تريد التحديث الآن؟',
      updateNotAvailable: '✅ أنت تستخدم أحدث إصدار!\n\nالإصدار الحالي: 1.0.0',
      exitTitle: 'تأكيد الخروج',
      exitMessage: 'هل أنت متأكد من الخروج من البرنامج؟\n\nسيتم حفظ جميع بياناتك تلقائياً.',
      loginErrorTitle: 'خطأ في تسجيل الدخول',
      loginError: '❌ اسم المستخدم أو كلمة المرور غير صحيحة!\n\nاسم المستخدم: admin\nكلمة المرور: 123456',
      pinErrorTitle: 'خطأ في رمز PIN',
      pinError: '❌ رمز PIN غير صحيح!',
      confirmBtn: 'تأكيد',
      cancelBtn: 'إلغاء',
      okBtn: 'حسناً',
    },
    fr: {
      title: 'HANOUTY DZ',
      subtitle: 'Version 1.0',
      usernameTab: 'Nom d\'utilisateur',
      pinTab: 'Code PIN',
      usernamePlaceholder: 'Nom d\'utilisateur',
      passwordPlaceholder: 'Mot de passe',
      loginBtn: 'Connexion',
      clear: 'Effacer',
      copyright: '© 2025 HANOUTY DZ - Tous droits réservés',
      backupTitle: 'Sauvegarde',
      backupSuccess: '✅ Sauvegarde réussie!\n\nChemin:\n',
      backupError: '❌ Erreur lors de la sauvegarde!',
      updateTitle: 'Vérification des mises à jour',
      updateChecking: '🔄 Vérification en cours...',
      updateAvailable: '🎉 Nouvelle version disponible!\n\nNouvelle version: {version}\n\nVoulez-vous mettre à jour?',
      updateNotAvailable: '✅ Vous utilisez la dernière version!\n\nVersion actuelle: 1.0.0',
      exitTitle: 'Confirmation de sortie',
      exitMessage: 'Êtes-vous sûr de vouloir quitter?\n\nToutes vos données seront sauvegardées.',
      loginErrorTitle: 'Erreur de connexion',
      loginError: '❌ Nom d\'utilisateur ou mot de passe incorrect!\n\nNom d\'utilisateur: admin\nMot de passe: 123456',
      pinErrorTitle: 'Erreur de code PIN',
      pinError: '❌ Code PIN incorrect!',
      confirmBtn: 'Confirmer',
      cancelBtn: 'Annuler',
      okBtn: 'OK',
    }
  };

  const t = texts[lang];
  const isRTL = lang === 'ar';

  useEffect(() => {
    if (loginMode !== 'pin') return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        if (pin.length < 4) {
          setPin(prev => prev + e.key);
        }
      } else if (e.key === 'Backspace') {
        setPin(prev => prev.slice(0, -1));
      } else if (e.key === 'Delete' || e.key === 'Escape') {
        setPin('');
      } else if (e.key === 'Enter' && pin.length === 4) {
        handlePinLogin();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [loginMode, pin]);

  const showDialog = (config: typeof dialogConfig) => {
    setDialogConfig(config);
    setDialogOpen(true);
  };

  const handleCredentialsLogin = () => {
    if (username === 'admin' && password === '123456') {
      onLogin();
    } else {
      showDialog({
        title: t.loginErrorTitle,
        message: t.loginError,
        icon: 'warning',
        confirmText: t.okBtn,
      });
    }
  };

  const handlePinLogin = () => {
    const savedPin = localStorage.getItem('userPin') || '1234';
    
    if (pin === savedPin) {
      onLogin();
    } else {
      showDialog({
        title: t.pinErrorTitle,
        message: t.pinError,
        icon: 'warning',
        confirmText: t.okBtn,
      });
      setPin('');
    }
  };

  const handleBackup = async () => {
    if (typeof window !== 'undefined' && (window as any).require) {
      try {
        const { ipcRenderer } = (window as any).require('electron');
        const result = await ipcRenderer.invoke('backup-database');
        
        if (result.success) {
          showDialog({
            title: t.backupTitle,
            message: t.backupSuccess + result.path,
            icon: 'success',
            confirmText: t.okBtn,
          });
        } else {
          showDialog({
            title: t.backupTitle,
            message: t.backupError,
            icon: 'warning',
            confirmText: t.okBtn,
          });
        }
      } catch (error) {
        showDialog({
          title: t.backupTitle,
          message: t.backupError,
          icon: 'warning',
          confirmText: t.okBtn,
        });
      }
    }
  };

  const handleUpdate = async () => {
    if (typeof window !== 'undefined' && (window as any).require) {
      try {
        const { ipcRenderer } = (window as any).require('electron');
        
        showDialog({
          title: t.updateTitle,
          message: t.updateChecking,
          icon: 'info',
          confirmText: t.okBtn,
        });

        const result = await ipcRenderer.invoke('check-for-updates');
        setDialogOpen(false);

        if (result.available) {
          showDialog({
            title: t.updateTitle,
            message: t.updateAvailable.replace('{version}', result.version),
            icon: 'success',
            confirmText: t.confirmBtn,
            cancelText: t.cancelBtn,
            onConfirm: () => {
              ipcRenderer.invoke('download-update', result.downloadUrl);
            },
          });
        } else {
          showDialog({
            title: t.updateTitle,
            message: t.updateNotAvailable,
            icon: 'success',
            confirmText: t.okBtn,
          });
        }
      } catch (error) {
        console.error('Update check error:', error);
      }
    }
  };

  const handleExit = () => {
    showDialog({
      title: t.exitTitle,
      message: t.exitMessage,
      icon: 'warning',
      confirmText: t.confirmBtn,
      cancelText: t.cancelBtn,
      onConfirm: () => {
        window.close();
      },
    });
  };

  const toggleLanguage = () => {
    setLang(lang === 'ar' ? 'fr' : 'ar');
  };

  const handleKeyPressCredentials = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCredentialsLogin();
    }
  };

  const handlePinInput = (num: string) => {
    if (pin.length < 4) {
      setPin(pin + num);
    }
  };

  const handlePinBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const getDialogIcon = () => {
    switch (dialogConfig.icon) {
      case 'success':
        return <CheckIcon sx={{ fontSize: 60, color: '#4CAF50' }} />;
      case 'warning':
        return <WarningIcon sx={{ fontSize: 60, color: '#FF9800' }} />;
      default:
        return <InfoIcon sx={{ fontSize: 60, color: '#2196F3' }} />;
    }
  };

  return (
    <Box
      dir={isRTL ? 'rtl' : 'ltr'}
      sx={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 50%, #ffffff 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 87, 34, 0.08) 0%, transparent 70%)',
          top: '-150px',
          [isRTL ? 'left' : 'right']: '-150px',
          animation: 'pulse 4s ease-in-out infinite',
          '@keyframes pulse': {
            '0%, 100%': { transform: 'scale(1)', opacity: 0.3 },
            '50%': { transform: 'scale(1.1)', opacity: 0.5 },
          },
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244, 67, 54, 0.08) 0%, transparent 70%)',
          bottom: '-100px',
          [isRTL ? 'right' : 'left']: '-100px',
          animation: 'pulse 5s ease-in-out infinite 1s',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          top: 15,
          [isRTL ? 'right' : 'left']: 15,
          display: 'flex',
          gap: 0.8,
          zIndex: 10,
        }}
      >
        <Tooltip title={lang === 'ar' ? 'تغيير اللغة' : 'Changer la langue'} arrow>
          <IconButton 
            onClick={toggleLanguage} 
            sx={{ 
              bgcolor: 'transparent',
              border: '1px solid rgba(156, 39, 176, 0.2)',
              '&:hover': { 
                bgcolor: 'rgba(156, 39, 176, 0.1)',
                borderColor: 'rgba(156, 39, 176, 0.4)',
              },
              transition: 'all 0.2s',
              width: 32,
              height: 32,
            }}
          >
            <LanguageIcon sx={{ color: '#9C27B0', fontSize: 16 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title={lang === 'ar' ? 'نسخ احتياطي' : 'Sauvegarde'} arrow>
          <IconButton 
            onClick={handleBackup} 
            sx={{ 
              bgcolor: 'transparent',
              border: '1px solid rgba(76, 175, 80, 0.2)',
              '&:hover': { 
                bgcolor: 'rgba(76, 175, 80, 0.1)',
                borderColor: 'rgba(76, 175, 80, 0.4)',
              },
              transition: 'all 0.2s',
              width: 32,
              height: 32,
            }}
          >
            <SaveIcon sx={{ color: '#4CAF50', fontSize: 16 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title={lang === 'ar' ? 'التحديثات' : 'Mises à jour'} arrow>
          <IconButton 
            onClick={handleUpdate} 
            sx={{ 
              bgcolor: 'transparent',
              border: '1px solid rgba(3, 169, 244, 0.2)',
              '&:hover': { 
                bgcolor: 'rgba(3, 169, 244, 0.1)',
                borderColor: 'rgba(3, 169, 244, 0.4)',
              },
              transition: 'all 0.2s',
              width: 32,
              height: 32,
            }}
          >
            <RefreshIcon sx={{ color: '#03A9F4', fontSize: 16 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title={lang === 'ar' ? 'خروج' : 'Quitter'} arrow>
          <IconButton 
            onClick={handleExit} 
            sx={{ 
              bgcolor: 'transparent',
              border: '1px solid rgba(244, 67, 54, 0.2)',
              '&:hover': { 
                bgcolor: 'rgba(244, 67, 54, 0.1)',
                borderColor: 'rgba(244, 67, 54, 0.4)',
              },
              transition: 'all 0.2s',
              width: 32,
              height: 32,
            }}
          >
            <ExitIcon sx={{ color: '#F44336', fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Dialog Component */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => !dialogConfig.onConfirm && setDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 400,
            maxWidth: 500,
            direction: isRTL ? 'rtl' : 'ltr',
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 3, pb: 1 }}>
          <Box sx={{ mb: 2 }}>
            {getDialogIcon()}
          </Box>
          <Typography variant="h6" sx={{ fontFamily: lang === 'ar' ? 'Cairo, Arial' : 'Roboto, Arial', fontWeight: 700, color: '#333' }}>
            {dialogConfig.title}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
          <Typography sx={{ 
            whiteSpace: 'pre-line', 
            color: '#666', 
            fontFamily: lang === 'ar' ? 'Cairo, Arial' : 'Roboto, Arial',
            lineHeight: 1.8,
          }}>
            {dialogConfig.message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 1 }}>
          {dialogConfig.cancelText && (
            <Button 
              onClick={() => setDialogOpen(false)} 
              sx={{ 
                textTransform: 'none',
                fontFamily: lang === 'ar' ? 'Cairo, Arial' : 'Roboto, Arial',
                color: '#666',
                '&:hover': { bgcolor: '#f5f5f5' },
              }}
            >
              {dialogConfig.cancelText}
            </Button>
          )}
          <Button 
            onClick={() => {
              if (dialogConfig.onConfirm) {
                dialogConfig.onConfirm();
              }
              setDialogOpen(false);
            }}
            variant="contained"
            sx={{ 
              bgcolor: dialogConfig.icon === 'success' ? '#4CAF50' : dialogConfig.icon === 'warning' ? '#FF9800' : '#2196F3',
              textTransform: 'none',
              fontFamily: lang === 'ar' ? 'Cairo, Arial' : 'Roboto, Arial',
              px: 4,
              '&:hover': {
                bgcolor: dialogConfig.icon === 'success' ? '#45a049' : dialogConfig.icon === 'warning' ? '#fb8c00' : '#1e88e5',
              }
            }}
          >
            {dialogConfig.confirmText}
          </Button>
        </DialogActions>
      </Dialog>

      <Paper
        elevation={24}
        sx={{
          width: 450,
          bgcolor: '#ffffff',
          borderRadius: 4,
          p: 3,
          backdropFilter: 'blur(20px)',
          border: '2px solid',
          borderImage: 'linear-gradient(135deg, #FF5722, #FF9800) 1',
          boxShadow: '0 8px 32px rgba(255, 87, 34, 0.2)',
          position: 'relative',
          zIndex: 1,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 1.5,
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #FF5722 0%, #FF9800 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(255, 87, 34, 0.5)',
              animation: 'float 3s ease-in-out infinite',
              '@keyframes float': {
                '0%, 100%': { transform: 'translateY(0px)' },
                '50%': { transform: 'translateY(-8px)' },
              },
            }}
          >
            <Typography sx={{ fontSize: 48, fontWeight: 900, color: '#fff' }}>
              🛒
            </Typography>
          </Box>
          
          <Typography variant="h4" sx={{ color: '#FF5722', fontWeight: 900, fontFamily: lang === 'ar' ? 'Cairo, Arial' : 'Roboto, Arial', mb: 0.5, textShadow: '0 2px 10px rgba(255, 87, 34, 0.3)' }}>
            {t.title}
          </Typography>
          
          <Typography variant="body2" sx={{ color: '#757575', fontSize: '0.85rem', fontFamily: lang === 'ar' ? 'Cairo, Arial' : 'Roboto, Arial' }}>
            {t.subtitle}
          </Typography>
        </Box>

        <Tabs
          value={loginMode}
          onChange={(_, newValue) => setLoginMode(newValue)}
          sx={{
            mb: 2,
            minHeight: 42,
            '& .MuiTabs-indicator': {
              bgcolor: '#FF5722',
              height: 3,
            },
          }}
        >
          <Tab 
            value="credentials" 
            label={t.usernameTab}
            icon={<LoginIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            sx={{
              flex: 1,
              color: '#757575',
              fontFamily: lang === 'ar' ? 'Cairo, Arial' : 'Roboto, Arial',
              fontSize: '0.8rem',
              minHeight: 42,
              py: 1,
              '&.Mui-selected': {
                color: '#FF5722',
              },
            }}
          />
          <Tab 
            value="pin" 
            label={t.pinTab}
            icon={<PinIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            sx={{
              flex: 1,
              color: '#757575',
              fontFamily: lang === 'ar' ? 'Cairo, Arial' : 'Roboto, Arial',
              fontSize: '0.8rem',
              minHeight: 42,
              py: 1,
              '&.Mui-selected': {
                color: '#FF5722',
              },
            }}
          />
        </Tabs>

        {loginMode === 'credentials' ? (
          <>
            <TextField
              fullWidth
              autoFocus
              placeholder={t.usernamePlaceholder}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPressCredentials}
              inputRef={usernameInputRef}
              InputProps={{
                readOnly: false,
              }}
              inputProps={{
                autoComplete: 'off',
                autoFocus: true,
                tabIndex: 1,
                onFocus: (e: any) => e.target.select(),
              }}
              sx={{
                mb: 1.5,
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#f5f5f5',
                  color: '#333',
                  fontFamily: lang === 'ar' ? 'Cairo, Arial' : 'Roboto, Arial',
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  '& input': {
                    cursor: 'text',
                    userSelect: 'text',
                  },
                  '&:hover': {
                    borderColor: '#FF9800',
                    bgcolor: '#fff',
                  },
                  '&.Mui-focused': {
                    borderColor: '#FF5722',
                    bgcolor: '#fff',
                    boxShadow: '0 0 0 3px rgba(255, 87, 34, 0.1)',
                  },
                },
              }}
            />

            <TextField
              fullWidth
              type="password"
              placeholder={t.passwordPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPressCredentials}
              inputProps={{
                autoComplete: 'off',
                tabIndex: 2,
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#f5f5f5',
                  color: '#333',
                  fontFamily: lang === 'ar' ? 'Cairo, Arial' : 'Roboto, Arial',
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  '& input': {
                    cursor: 'text',
                    userSelect: 'text',
                  },
                  '&:hover': {
                    borderColor: '#FF9800',
                    bgcolor: '#fff',
                  },
                  '&.Mui-focused': {
                    borderColor: '#FF5722',
                    bgcolor: '#fff',
                    boxShadow: '0 0 0 3px rgba(255, 87, 34, 0.1)',
                  },
                },
              }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handleCredentialsLogin}
              startIcon={<LoginIcon />}
              sx={{
                bgcolor: '#FF5722',
                py: 1.3,
                fontSize: '1rem',
                fontWeight: 700,
                fontFamily: lang === 'ar' ? 'Cairo, Arial' : 'Roboto, Arial',
                borderRadius: 2,
                boxShadow: '0 4px 15px rgba(255, 87, 34, 0.3)',
                '&:hover': { 
                  bgcolor: '#E64A19',
                  boxShadow: '0 8px 25px rgba(255, 87, 34, 0.5)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s',
                mb: 2,
              }}
            >
              {t.loginBtn}
            </Button>
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
              {[0, 1, 2, 3].map((index) => (
                <Box
                  key={index}
                  sx={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    bgcolor: pin.length > index ? '#FF5722' : '#f5f5f5',
                    border: '2px solid',
                    borderColor: pin.length > index ? '#FF5722' : '#e0e0e0',
                    transition: 'all 0.3s',
                    boxShadow: pin.length > index ? '0 0 10px rgba(255, 87, 34, 0.5)' : 'none',
                  }}
                />
              ))}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 1 }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <Box
                  key={num}
                  onClick={() => handlePinInput(num.toString())}
                  sx={{
                    height: 45,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#f5f5f5',
                    border: '1px solid #e0e0e0',
                    borderRadius: 1.5,
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    color: '#FF5722',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: '#fff',
                      borderColor: '#FF9800',
                      transform: 'scale(1.05)',
                    },
                    '&:active': {
                      transform: 'scale(0.95)',
                    },
                  }}
                >
                  {num}
                </Box>
              ))}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 2 }}>
              <Box
                onClick={() => setPin('')}
                sx={{
                  height: 45,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#ffebee',
                  border: '1px solid #ffcdd2',
                  borderRadius: 1.5,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#F44336',
                  cursor: 'pointer',
                  fontFamily: lang === 'ar' ? 'Cairo, Arial' : 'Roboto, Arial',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: '#ffcdd2',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                {t.clear}
              </Box>

              <Box
                onClick={() => handlePinInput('0')}
                sx={{
                  height: 45,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#f5f5f5',
                  border: '1px solid #e0e0e0',
                  borderRadius: 1.5,
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: '#FF5722',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: '#fff',
                    borderColor: '#FF9800',
                    transform: 'scale(1.05)',
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                }}
              >
                0
              </Box>

              <Box
                onClick={handlePinBackspace}
                sx={{
                  height: 45,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#f5f5f5',
                  border: '1px solid #e0e0e0',
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: '#e3f2fd',
                    borderColor: '#2196F3',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <Typography sx={{ fontSize: '1.1rem', color: '#2196F3' }}>⌫</Typography>
              </Box>
            </Box>

            <Button
              fullWidth
              variant="contained"
              onClick={handlePinLogin}
              disabled={pin.length !== 4}
              startIcon={<PinIcon />}
              sx={{
                bgcolor: '#FF5722',
                py: 1.3,
                fontSize: '1rem',
                fontWeight: 700,
                fontFamily: lang === 'ar' ? 'Cairo, Arial' : 'Roboto, Arial',
                borderRadius: 2,
                boxShadow: '0 4px 15px rgba(255, 87, 34, 0.3)',
                '&:hover': { 
                  bgcolor: '#E64A19',
                  boxShadow: '0 8px 25px rgba(255, 87, 34, 0.5)',
                  transform: 'translateY(-2px)',
                },
                '&:disabled': {
                  bgcolor: '#e0e0e0',
                  color: '#9e9e9e',
                },
                transition: 'all 0.3s',
                mb: 2,
              }}
            >
              {t.loginBtn}
            </Button>
          </>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mb: 1.5 }}>
          <Tooltip title="Facebook">
            <IconButton 
              onClick={() => window.open('https://facebook.com/yourpage', '_blank')} 
              sx={{ 
                bgcolor: '#f5f5f5', 
                border: '1px solid #e0e0e0',
                '&:hover': { 
                  bgcolor: '#4267B2',
                  '& svg': { color: '#fff' },
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.3s',
                width: 40,
                height: 40,
              }}
            >
              <FacebookIcon sx={{ color: '#4267B2', fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="WhatsApp">
            <IconButton 
              onClick={() => window.open('https://wa.me/213XXXXXXXXX', '_blank')} 
              sx={{ 
                bgcolor: '#f5f5f5', 
                border: '1px solid #e0e0e0',
                '&:hover': { 
                  bgcolor: '#25D366',
                  '& svg': { color: '#fff' },
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.3s',
                width: 40,
                height: 40,
              }}
            >
              <WhatsAppIcon sx={{ color: '#25D366', fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Instagram">
            <IconButton 
              onClick={() => window.open('https://instagram.com/yourpage', '_blank')} 
              sx={{ 
                bgcolor: '#f5f5f5', 
                border: '1px solid #e0e0e0',
                '&:hover': { 
                  bgcolor: '#E1306C',
                  '& svg': { color: '#fff' },
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.3s',
                width: 40,
                height: 40,
              }}
            >
              <InstagramIcon sx={{ color: '#E1306C', fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        </Box>

        <Typography sx={{ textAlign: 'center', color: '#9e9e9e', fontSize: '0.7rem', fontFamily: lang === 'ar' ? 'Cairo, Arial' : 'Roboto, Arial' }}>
          {t.copyright}
        </Typography>
      </Paper>
    </Box>
  );
}
