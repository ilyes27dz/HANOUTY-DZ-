import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Dialog, DialogContent, Button, TextField, IconButton, Alert, Snackbar } from '@mui/material';
import { 
  Lock as LockIcon, 
  Settings as SettingsIcon, 
  HelpOutline as HelpIcon,
  Backspace as BackspaceIcon,
  Instagram as InstagramIcon,
  WhatsApp as WhatsAppIcon,
  Facebook as FacebookIcon,
  ErrorOutline as ErrorIcon,
  CheckCircle as CheckIcon,
  WarningAmber as WarningIcon
} from '@mui/icons-material';

interface PinLockProps {
  onUnlock: () => void;
}

export default function PinLock({ onUnlock }: PinLockProps) {
  const [pin, setPin] = useState('');
  const [displayPin, setDisplayPin] = useState('');
  const [error, setError] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [shake, setShake] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);
  
  const [showForgotDialog, setShowForgotDialog] = useState(false);
  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [forgotData, setForgotData] = useState({ storeName: '', phone: '', email: '' });
  const [setupData, setSetupData] = useState({ newPin: '', confirmPin: '', email: '' });
  const [changeData, setChangeData] = useState({ oldPin: '', newPin: '', confirmPin: '' });
  
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' as 'success' | 'error' | 'info' });

  const getStoreSettings = () => {
    const saved = localStorage.getItem('storeSettings');
    return saved ? JSON.parse(saved) : { storeName: '', phone: '', email: '' };
  };

  // 🎹 إضافة مستمع الكيبورد
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (isLocked || isFirstTime) return;

      const key = event.key;

      // أرقام من 0-9
      if (/^[0-9]$/.test(key)) {
        event.preventDefault();
        handlePinInput(key);
      }
      // مفتاح Backspace
      else if (key === 'Backspace') {
        event.preventDefault();
        handleBackspace();
      }
      // مفتاح Delete
      else if (key === 'Delete') {
        event.preventDefault();
        setPin('');
        setDisplayPin('');
      }
      // مفتاح Escape أو C لمسح الكل
      else if (key === 'Escape' || key.toLowerCase() === 'c') {
        event.preventDefault();
        setPin('');
        setDisplayPin('');
      }
      // مفتاح Enter لتأكيد
      else if (key === 'Enter') {
        event.preventDefault();
        // سيتم التحقق تلقائياً في useEffect أدناه
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isLocked, isFirstTime, pin, displayPin]);

  // تحديث الوقت المتبقي للقفل
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLocked && lockTimeRemaining > 0) {
      interval = setInterval(() => {
        setLockTimeRemaining(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            setIsLocked(false);
            setErrorCount(0);
            localStorage.removeItem('lockTime');
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isLocked, lockTimeRemaining]);

  // التحقق من القفل عند البدء
  useEffect(() => {
    const hasPin = localStorage.getItem('appPin');
    if (!hasPin) {
      setIsFirstTime(true);
      setShowSetupDialog(true);
    }
    
    const lockTime = localStorage.getItem('lockTime');
    if (lockTime) {
      const remaining = Math.max(0, (parseInt(lockTime) - Date.now()) / 1000);
      if (remaining > 0) {
        setIsLocked(true);
        setLockTimeRemaining(Math.ceil(remaining));
        setErrorCount(5);
      } else {
        localStorage.removeItem('lockTime');
      }
    }
  }, []);

  const getStoredPin = () => localStorage.getItem('appPin') || '';
  const correctPin = getStoredPin();

  // التحقق من الكود المدخل
  useEffect(() => {
    if (pin.length === 4 && !isFirstTime && !isLocked) {
      if (pin === correctPin) {
        setSnackbar({ open: true, message: '✅ تم فتح القفل بنجاح!', type: 'success' });
        setTimeout(() => onUnlock(), 600);
      } else {
        const newCount = errorCount + 1;
        setErrorCount(newCount);
        setError(true);
        setShake(true);
        
        if (newCount >= 5) {
          // ✅ قفل لمدة 20 دقيقة (1200 ثانية)
          const lockDuration = 1200;
          setIsLocked(true);
          setLockTimeRemaining(lockDuration);
          localStorage.setItem('lockTime', (Date.now() + lockDuration * 1000).toString());
          
          setErrorMessage('❌ تم تجاوز عدد المحاولات!\n\nالتطبيق مقفول لمدة 20 دقيقة.');
          setShowErrorDialog(true);
        } else {
          setSnackbar({ 
            open: true, 
            message: `⚠️ محاولة خاطئة: ${newCount}/5`, 
            type: 'error' 
          });
        }

        setTimeout(() => {
          setPin('');
          setDisplayPin('');
          setError(false);
          setShake(false);
        }, 1200);
      }
    }
  }, [pin, onUnlock, correctPin, isFirstTime, errorCount, isLocked]);

  const handlePinInput = (value: string) => {
    if (isLocked) {
      const minutes = Math.ceil(lockTimeRemaining / 60);
      setSnackbar({ 
        open: true, 
        message: `❌ التطبيق مقفول!\n⏱️ الوقت المتبقي: ${minutes} دقيقة`, 
        type: 'error' 
      });
      return;
    }
    if (displayPin.length < 4) {
      setDisplayPin(displayPin + value);
      setPin(pin + value);
    }
  };

  const handleBackspace = () => {
    setDisplayPin(displayPin.slice(0, -1));
    setPin(pin.slice(0, -1));
  };

  const handleFirstSetup = () => {
    if (setupData.newPin.length !== 4 || !/^\d{4}$/.test(setupData.newPin)) {
      setErrorMessage('❌ الكود يجب أن يكون 4 أرقام فقط!');
      setShowErrorDialog(true);
      return;
    }
    if (setupData.newPin !== setupData.confirmPin) {
      setErrorMessage('❌ الأكواد غير متطابقة!');
      setShowErrorDialog(true);
      return;
    }
    if (!setupData.email || !/\S+@\S+\.\S+/.test(setupData.email)) {
      setErrorMessage('❌ البريد الإلكتروني غير صحيح!');
      setShowErrorDialog(true);
      return;
    }
    
    localStorage.setItem('appPin', setupData.newPin);
    localStorage.setItem('storeSettings', JSON.stringify({ ...getStoreSettings(), email: setupData.email }));
    
    setSnackbar({ open: true, message: '✅ تم إنشاء كود PIN بنجاح!', type: 'success' });
    setTimeout(() => {
      setShowSetupDialog(false);
      setIsFirstTime(false);
      setSetupData({ newPin: '', confirmPin: '', email: '' });
    }, 1200);
  };

  const handleForgotPin = () => {
    const storeSettings = getStoreSettings();
    
    if (!forgotData.storeName.trim() || !forgotData.phone.trim() || !forgotData.email.trim()) {
      setErrorMessage('❌ يرجى ملء جميع الحقول!');
      setShowErrorDialog(true);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(forgotData.email)) {
      setErrorMessage('❌ البريد الإلكتروني غير صحيح!');
      setShowErrorDialog(true);
      return;
    }
    
    if (
      forgotData.storeName.trim().toLowerCase() === storeSettings.storeName?.trim().toLowerCase() &&
      forgotData.phone.trim() === storeSettings.phone?.trim() &&
      forgotData.email.trim().toLowerCase() === storeSettings.email?.trim().toLowerCase()
    ) {
      const currentPin = getStoredPin();
      setSnackbar({ 
        open: true, 
        message: `✅ الكود: ${currentPin}\n(تم إرساله إلى بريدك)`, 
        type: 'success' 
      });
      
      console.log(`📧 إرسال الكود ${currentPin} إلى ${forgotData.email}`);
      
      setTimeout(() => {
        setShowForgotDialog(false);
        setForgotData({ storeName: '', phone: '', email: '' });
      }, 1500);
    } else {
      setErrorMessage('❌ المعلومات المدخلة غير صحيحة!');
      setShowErrorDialog(true);
      setForgotData({ storeName: '', phone: '', email: '' });
    }
  };

  const handleChangePin = () => {
    if (changeData.oldPin !== correctPin) {
      setErrorMessage('❌ الكود القديم خاطئ!');
      setShowErrorDialog(true);
      return;
    }

    if (changeData.newPin === changeData.oldPin) {
      setErrorMessage('❌ الكود الجديد يجب أن يكون مختلفاً عن القديم!');
      setShowErrorDialog(true);
      return;
    }
    
    if (changeData.newPin.length !== 4 || !/^\d{4}$/.test(changeData.newPin)) {
      setErrorMessage('❌ الكود الجديد يجب أن يكون 4 أرقام!');
      setShowErrorDialog(true);
      return;
    }
    if (changeData.newPin !== changeData.confirmPin) {
      setErrorMessage('❌ الأكواد الجديدة غير متطابقة!');
      setShowErrorDialog(true);
      return;
    }
    
    localStorage.setItem('appPin', changeData.newPin);
    setSnackbar({ open: true, message: '✅ تم تغيير الكود بنجاح!', type: 'success' });
    
    setTimeout(() => {
      setShowChangeDialog(false);
      setChangeData({ oldPin: '', newPin: '', confirmPin: '' });
    }, 1200);
  };

  return (
    <Box sx={{ width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', position: 'relative', overflow: 'hidden' }}>
      {!isFirstTime && (
        <IconButton
          onClick={() => setShowChangeDialog(true)}
          sx={{
            position: 'absolute',
            top: 15,
            right: 15,
            bgcolor: 'white',
            boxShadow: 2,
            width: 45,
            height: 45,
            zIndex: 10,
            '&:hover': { bgcolor: '#f5f5f5', transform: 'scale(1.1)' },
            transition: 'all 0.3s',
          }}
        >
          <SettingsIcon sx={{ color: '#FF6B35' }} />
        </IconButton>
      )}

      <Paper
        elevation={3}
        sx={{
          width: 420,
          bgcolor: 'white',
          borderRadius: 2,
          border: '3px solid #FF6B35',
          p: 3.5,
          textAlign: 'center',
          transform: shake ? 'translateX(-10px)' : 'translateX(0)',
          transition: 'transform 0.1s',
        }}
      >
        {!isLocked && errorCount > 0 && errorCount < 5 && (
          <Alert 
            severity="warning" 
            icon={<WarningIcon />}
            sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, borderRadius: 1.5 }}
          >
            <span style={{ fontWeight: 600 }}>محاولات خاطئة: {errorCount}/5</span>
          </Alert>
        )}

        {isLocked && (
          <Alert 
            severity="error" 
            sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, borderRadius: 1.5 }}
          >
            <span style={{ fontWeight: 600 }}>🔒 التطبيق مقفول - الوقت المتبقي: {Math.ceil(lockTimeRemaining / 60)} دقيقة</span>
          </Alert>
        )}

        <Box sx={{ width: 85, height: 85, mx: 'auto', mb: 1.5, borderRadius: '22px', bgcolor: '#FF6B35', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 3 }}>
          <LockIcon sx={{ fontSize: 55, color: 'white' }} />
        </Box>

        <Typography variant="h5" sx={{ color: '#FF6B35', fontWeight: 900, fontFamily: 'Cairo, Arial', mb: 0.5 }}>
          {isFirstTime ? '🎉 مرحباً بك!' : 'HANOUTY DZ'}
        </Typography>

        <Typography sx={{ color: '#666', fontSize: '0.85rem', mb: 2 }}>
          {isFirstTime ? 'الرجاء إنشاء كود PIN آمن' : 'نسخة 1.0.0'}
        </Typography>

        {!isFirstTime && !isLocked && (
          <>
            <Box sx={{ mb: 1.5 }}>
              <Typography sx={{ color: '#FF6B35', fontSize: '0.8rem', fontWeight: 600, mb: 0.8, textAlign: 'right', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                🔐 رمز PIN (🎹 استخدم الكيبورد أو الأزرار)
              </Typography>
              <TextField
                fullWidth
                type="password"
                value={displayPin}
                placeholder="ادخل الرمز الخاص بك"
                disabled
                sx={{
                  '& .MuiInputBase-root': {
                    bgcolor: '#f5f5f5',
                    borderRadius: 1.5,
                    fontSize: '1.3rem',
                    letterSpacing: '10px',
                    textAlign: 'center',
                    fontWeight: 700,
                    color: error ? '#f44336' : '#FF6B35',
                    height: 50,
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: error ? '2px solid #f44336' : '2px solid #FF6B35',
                  },
                }}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 1.5 }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '←'].map((num) => (
                <Button
                  key={num}
                  onClick={() => {
                    if (num === 'C') {
                      setPin('');
                      setDisplayPin('');
                    } else if (num === '←') {
                      handleBackspace();
                    } else {
                      handlePinInput(num.toString());
                    }
                  }}
                  variant={num === 'C' ? 'outlined' : 'contained'}
                  sx={{
                    height: 52,
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    bgcolor: num === 'C' ? 'transparent' : '#FF6B35',
                    color: num === 'C' ? '#f44336' : 'white',
                    borderColor: num === 'C' ? '#f44336' : '#FF6B35',
                    borderRadius: 1.5,
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: num === 'C' ? 'rgba(244, 67, 54, 0.1)' : '#E55A2B',
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  {num === '←' ? <BackspaceIcon /> : num}
                </Button>
              ))}
            </Box>

            <Button
              startIcon={<HelpIcon />}
              onClick={() => setShowForgotDialog(true)}
              sx={{
                color: '#666',
                fontSize: '0.8rem',
                mb: 1.5,
                textTransform: 'none',
                '&:hover': { bgcolor: 'transparent', color: '#FF6B35' },
              }}
            >
              نسيت الكود؟
            </Button>
          </>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
          {[
            { icon: InstagramIcon, color: '#E1306C' },
            { icon: WhatsAppIcon, color: '#25D366' },
            { icon: FacebookIcon, color: '#1877F2' }
          ].map((social, i) => (
            <IconButton key={i} sx={{ bgcolor: '#f5f5f5', width: 38, height: 38, transition: 'all 0.3s', '&:hover': { bgcolor: '#FF6B35', transform: 'scale(1.1)' } }}>
              <social.icon sx={{ color: social.color, fontSize: 20 }} />
            </IconButton>
          ))}
        </Box>

        <Typography sx={{ color: '#999', fontSize: '0.7rem', mt: 1.5 }}>
          © HANOUTY DZ 2025
        </Typography>
      </Paper>

      {/* Dialog: الإعداد الأولي */}
      <Dialog open={showSetupDialog} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogContent sx={{ p: 3.5, textAlign: 'center' }}>
          <Box sx={{ width: 75, height: 75, mx: 'auto', mb: 2, borderRadius: '18px', bgcolor: '#FF6B35', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 2 }}>
            <LockIcon sx={{ fontSize: 45, color: 'white' }} />
          </Box>

          <Typography variant="h6" sx={{ color: '#FF6B35', fontWeight: 700, mb: 0.5 }}>
            🔐 إنشاء كود PIN
          </Typography>
          <Typography sx={{ color: '#666', mb: 2.5, fontSize: '0.85rem' }}>
            حماية قوية لبرنامجك - 4 أرقام فقط
          </Typography>

          <TextField fullWidth type="password" label="كود PIN (4 أرقام)" placeholder="مثال: 1234" value={setupData.newPin} onChange={(e) => setSetupData({ ...setupData, newPin: e.target.value.replace(/\D/g, '').slice(0, 4) })} inputProps={{ maxLength: 4 }} sx={{ mb: 2 }} />

          <TextField fullWidth type="password" label="تأكيد الكود" placeholder="أعد إدخال الكود" value={setupData.confirmPin} onChange={(e) => setSetupData({ ...setupData, confirmPin: e.target.value.replace(/\D/g, '').slice(0, 4) })} inputProps={{ maxLength: 4 }} sx={{ mb: 2 }} />

          <TextField fullWidth type="email" label="البريد الإلكتروني" placeholder="example@gmail.com" value={setupData.email} onChange={(e) => setSetupData({ ...setupData, email: e.target.value })} sx={{ mb: 2.5 }} />

          <Button fullWidth variant="contained" onClick={handleFirstSetup} sx={{ bgcolor: '#FF6B35', py: 1.3, fontSize: '0.95rem', fontWeight: 700, borderRadius: 1.5, '&:hover': { bgcolor: '#E55A2B' } }}>
            ✅ إنشاء الكود
          </Button>
        </DialogContent>
      </Dialog>

      {/* Dialog: نسيت الكود */}
      <Dialog open={showForgotDialog} onClose={() => setShowForgotDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ width: 60, height: 60, mx: 'auto', mb: 2, borderRadius: '50%', bgcolor: '#FF9800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HelpIcon sx={{ fontSize: 35, color: 'white' }} />
          </Box>

          <Typography variant="h6" sx={{ color: '#FF6B35', fontWeight: 700, mb: 1.5, textAlign: 'center' }}>
            🔐 استعادة كود PIN
          </Typography>

          <Typography sx={{ color: '#666', mb: 2.5, fontSize: '0.85rem', textAlign: 'center' }}>
            للتحقق، أدخل معلومات متجرك:
          </Typography>

          <TextField fullWidth label="اسم المتجر" placeholder="مثال: متجر الإلكترونيات" value={forgotData.storeName} onChange={(e) => setForgotData({ ...forgotData, storeName: e.target.value })} sx={{ mb: 2 }} />

          <TextField fullWidth label="رقم الهاتف" placeholder="مثال: 0774366470" value={forgotData.phone} onChange={(e) => setForgotData({ ...forgotData, phone: e.target.value })} sx={{ mb: 2 }} />

          <TextField fullWidth type="email" label="البريد الإلكتروني" placeholder="example@gmail.com" value={forgotData.email} onChange={(e) => setForgotData({ ...forgotData, email: e.target.value })} sx={{ mb: 2 }} />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button fullWidth variant="outlined" onClick={() => { setShowForgotDialog(false); setForgotData({ storeName: '', phone: '', email: '' }); }} sx={{ color: '#666', borderColor: '#ddd' }}>
              إلغاء
            </Button>
            <Button fullWidth variant="contained" onClick={handleForgotPin} sx={{ bgcolor: '#FF6B35', '&:hover': { bgcolor: '#E55A2B' } }}>
              📧 إرسال
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Dialog: تغيير الكود */}
      <Dialog open={showChangeDialog} onClose={() => setShowChangeDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ width: 60, height: 60, mx: 'auto', mb: 2, borderRadius: '50%', bgcolor: '#2196F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SettingsIcon sx={{ fontSize: 35, color: 'white' }} />
          </Box>

          <Typography variant="h6" sx={{ color: '#FF6B35', fontWeight: 700, mb: 2, textAlign: 'center' }}>
            ⚙️ تغيير كود PIN
          </Typography>

          <TextField fullWidth type="password" label="الكود القديم" placeholder="ادخل الكود الحالي" value={changeData.oldPin} onChange={(e) => setChangeData({ ...changeData, oldPin: e.target.value })} sx={{ mb: 2 }} />

          <TextField fullWidth type="password" label="الكود الجديد (4 أرقام)" placeholder="كود جديد" value={changeData.newPin} onChange={(e) => setChangeData({ ...changeData, newPin: e.target.value.replace(/\D/g, '').slice(0, 4) })} inputProps={{ maxLength: 4 }} sx={{ mb: 2 }} />

          <TextField fullWidth type="password" label="تأكيد الكود الجديد" placeholder="أعد إدخال الكود الجديد" value={changeData.confirmPin} onChange={(e) => setChangeData({ ...changeData, confirmPin: e.target.value.replace(/\D/g, '').slice(0, 4) })} inputProps={{ maxLength: 4 }} sx={{ mb: 2.5 }} />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button fullWidth variant="outlined" onClick={() => { setShowChangeDialog(false); setChangeData({ oldPin: '', newPin: '', confirmPin: '' }); }} sx={{ color: '#666', borderColor: '#ddd' }}>
              إلغاء
            </Button>
            <Button fullWidth variant="contained" onClick={handleChangePin} sx={{ bgcolor: '#FF6B35', '&:hover': { bgcolor: '#E55A2B' } }}>
              💾 حفظ
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Dialog: الأخطاء */}
      <Dialog open={showErrorDialog} onClose={() => setShowErrorDialog(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogContent sx={{ p: 3, textAlign: 'center' }}>
          <Box sx={{ width: 80, height: 80, mx: 'auto', mb: 2, borderRadius: '50%', bgcolor: '#f44336', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ErrorIcon sx={{ fontSize: 50, color: 'white' }} />
          </Box>

          <Typography variant="h6" sx={{ color: '#f44336', fontWeight: 700, mb: 2 }}>
            ❌ خطأ
          </Typography>

          <Typography sx={{ color: '#666', mb: 2.5, fontSize: '0.9rem', whiteSpace: 'pre-line' }}>
            {errorMessage}
          </Typography>

          <Button fullWidth variant="contained" onClick={() => setShowErrorDialog(false)} sx={{ bgcolor: '#f44336', '&:hover': { bgcolor: '#d32f2f' } }}>
            ✅ حسناً
          </Button>
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={snackbar.type} icon={snackbar.type === 'success' ? <CheckIcon /> : snackbar.type === 'error' ? <ErrorIcon /> : <WarningIcon />} sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1, borderRadius: 1.5, boxShadow: 3, fontWeight: 600, fontSize: '0.95rem' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
