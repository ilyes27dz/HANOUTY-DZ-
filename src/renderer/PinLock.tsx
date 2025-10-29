import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Dialog, DialogContent, Button, TextField, IconButton } from '@mui/material';
import { 
  Lock as LockIcon, 
  Settings as SettingsIcon, 
  HelpOutline as HelpIcon,
  Backspace as BackspaceIcon,
  Instagram as InstagramIcon,
  WhatsApp as WhatsAppIcon,
  Facebook as FacebookIcon
} from '@mui/icons-material';

interface PinLockProps {
  onUnlock: () => void;
}

export default function PinLock({ onUnlock }: PinLockProps) {
  const [pin, setPin] = useState('');
  const [displayPin, setDisplayPin] = useState('');
  const [error, setError] = useState(false);
  const [showForgotDialog, setShowForgotDialog] = useState(false);
  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [forgotData, setForgotData] = useState({ storeName: '', phone: '' });
  const [setupData, setSetupData] = useState({ newPin: '', confirmPin: '' });
  const [changeData, setChangeData] = useState({ oldPin: '', newPin: '', confirmPin: '' });
  const [isFirstTime, setIsFirstTime] = useState(false);

  // الحصول على بيانات المتجر من localStorage
  const getStoreSettings = () => {
    const saved = localStorage.getItem('storeSettings');
    if (saved) {
      return JSON.parse(saved);
    }
    return { storeName: '', phone: '' };
  };

  useEffect(() => {
    const hasPin = localStorage.getItem('appPin');
    if (!hasPin) {
      setIsFirstTime(true);
      setShowSetupDialog(true);
    }
  }, []);

  const getStoredPin = () => localStorage.getItem('appPin') || '';
  const correctPin = getStoredPin();

  useEffect(() => {
    if (pin.length === 4 && !isFirstTime) {
      if (pin === correctPin) {
        onUnlock();
      } else {
        setError(true);
        setTimeout(() => {
          setPin('');
          setDisplayPin('');
          setError(false);
        }, 800);
      }
    }
  }, [pin, onUnlock, correctPin, isFirstTime]);

  const handlePinInput = (value: string) => {
    if (displayPin.length < 4) {
      const newDisplay = displayPin + value;
      const newPin = pin + value;
      setDisplayPin(newDisplay);
      setPin(newPin);
    }
  };

  const handleBackspace = () => {
    setDisplayPin(displayPin.slice(0, -1));
    setPin(pin.slice(0, -1));
  };

  const handleFirstSetup = () => {
    if (setupData.newPin.length !== 4 || !/^\d{4}$/.test(setupData.newPin)) {
      alert('❌ الكود يجب أن يكون 4 أرقام!');
      return;
    }
    if (setupData.newPin !== setupData.confirmPin) {
      alert('❌ الكود غير متطابق!');
      return;
    }
    localStorage.setItem('appPin', setupData.newPin);
    alert('✅ تم إنشاء كود PIN بنجاح!');
    setShowSetupDialog(false);
    setIsFirstTime(false);
    setSetupData({ newPin: '', confirmPin: '' });
  };

  const handleForgotPin = () => {
    const storeSettings = getStoreSettings();
    
    // التحقق من اسم المتجر ورقم الهاتف
    if (
      forgotData.storeName.trim().toLowerCase() === storeSettings.storeName.trim().toLowerCase() &&
      forgotData.phone.trim() === storeSettings.phone.trim()
    ) {
      const currentPin = getStoredPin();
      alert(`✅ كود PIN الحالي:\n\n🔑 ${currentPin}\n\nيمكنك تغييره من إعدادات القفل`);
      setShowForgotDialog(false);
      setForgotData({ storeName: '', phone: '' });
    } else {
      alert('❌ المعلومات غير صحيحة! تحقق من اسم المتجر ورقم الهاتف.');
      setForgotData({ storeName: '', phone: '' });
    }
  };

  const handleChangePin = () => {
    if (changeData.oldPin !== correctPin) {
      alert('❌ الكود القديم خاطئ!');
      return;
    }
    if (changeData.newPin.length !== 4 || !/^\d{4}$/.test(changeData.newPin)) {
      alert('❌ الكود يجب أن يكون 4 أرقام!');
      return;
    }
    if (changeData.newPin !== changeData.confirmPin) {
      alert('❌ الكود الجديد غير متطابق!');
      return;
    }
    localStorage.setItem('appPin', changeData.newPin);
    alert('✅ تم تغيير الكود بنجاح!');
    setShowChangeDialog(false);
    setChangeData({ oldPin: '', newPin: '', confirmPin: '' });
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
        position: 'relative',
      }}
    >
      {/* زر الإعدادات */}
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
            '&:hover': { bgcolor: '#f5f5f5' },
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
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            width: 85,
            height: 85,
            mx: 'auto',
            mb: 1.5,
            borderRadius: '22px',
            bgcolor: '#FF6B35',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 3,
          }}
        >
          <LockIcon sx={{ fontSize: 55, color: 'white' }} />
        </Box>

        {/* العنوان */}
        <Typography
          variant="h5"
          sx={{
            color: '#FF6B35',
            fontWeight: 900,
            fontFamily: 'Cairo, Arial',
            mb: 0.5,
          }}
        >
          {isFirstTime ? '🎉 مرحباً بك!' : 'HANOUTY DZ'}
        </Typography>

        <Typography
          sx={{
            color: '#666',
            fontSize: '0.85rem',
            mb: 2,
          }}
        >
          {isFirstTime ? 'الرجاء إنشاء كود PIN' : 'نسخة 1.0'}
        </Typography>

        {!isFirstTime && (
          <>
            {/* رمز PIN */}
            <Box sx={{ mb: 1.5 }}>
              <Typography
                sx={{
                  color: '#FF6B35',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  mb: 0.8,
                  textAlign: 'right',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                🔐 رمز PIN
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

            {/* لوحة الأرقام */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 1,
                mb: 1.5,
              }}
            >
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
                    '&:hover': {
                      bgcolor: num === 'C' ? 'rgba(244, 67, 54, 0.1)' : '#E55A2B',
                    },
                  }}
                >
                  {num === '←' ? <BackspaceIcon /> : num}
                </Button>
              ))}
            </Box>

            {/* نسيت الكود */}
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

        {/* أيقونات التواصل */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 1.5,
            mt: 2,
            pt: 2,
            borderTop: '1px solid #e0e0e0',
          }}
        >
          <IconButton sx={{ bgcolor: '#f5f5f5', width: 38, height: 38 }}>
            <InstagramIcon sx={{ color: '#E1306C', fontSize: 20 }} />
          </IconButton>
          <IconButton sx={{ bgcolor: '#f5f5f5', width: 38, height: 38 }}>
            <WhatsAppIcon sx={{ color: '#25D366', fontSize: 20 }} />
          </IconButton>
          <IconButton sx={{ bgcolor: '#f5f5f5', width: 38, height: 38 }}>
            <FacebookIcon sx={{ color: '#1877F2', fontSize: 20 }} />
          </IconButton>
        </Box>

        <Typography
          sx={{
            color: '#999',
            fontSize: '0.7rem',
            mt: 1.5,
          }}
        >
          © HANOUTY DZ 2025 - جميع الحقوق محفوظة
        </Typography>
      </Paper>

      {/* Dialog: الإعداد الأولي */}
      <Dialog open={showSetupDialog} maxWidth="xs" fullWidth>
        <DialogContent sx={{ p: 3.5, textAlign: 'center' }}>
          <Box
            sx={{
              width: 75,
              height: 75,
              mx: 'auto',
              mb: 2,
              borderRadius: '18px',
              bgcolor: '#FF6B35',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LockIcon sx={{ fontSize: 45, color: 'white' }} />
          </Box>

          <Typography variant="h6" sx={{ color: '#FF6B35', fontWeight: 700, mb: 0.5 }}>
            إنشاء كود PIN
          </Typography>
          <Typography sx={{ color: '#666', mb: 2.5, fontSize: '0.85rem' }}>
            هذا الكود سيحمي برنامجك
          </Typography>

          <TextField
            fullWidth
            type="password"
            label="كود PIN جديد (4 أرقام)"
            value={setupData.newPin}
            onChange={(e) => setSetupData({ ...setupData, newPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            type="password"
            label="تأكيد الكود"
            value={setupData.confirmPin}
            onChange={(e) => setSetupData({ ...setupData, confirmPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            sx={{ mb: 2.5 }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleFirstSetup}
            sx={{
              bgcolor: '#FF6B35',
              py: 1.3,
              fontSize: '0.95rem',
              fontWeight: 700,
              '&:hover': { bgcolor: '#E55A2B' },
            }}
          >
            ✅ إنشاء الكود
          </Button>
        </DialogContent>
      </Dialog>

      {/* Dialog: نسيت الكود (مع اسم المتجر + هاتف) */}
      <Dialog open={showForgotDialog} onClose={() => setShowForgotDialog(false)} maxWidth="xs" fullWidth>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ color: '#FF6B35', fontWeight: 700, mb: 1.5 }}>
            استعادة كود PIN
          </Typography>
          <Typography sx={{ color: '#666', mb: 2, fontSize: '0.85rem' }}>
            للأمان، أدخل المعلومات التالية:
          </Typography>
          
          <TextField
            fullWidth
            label="اسم المتجر"
            value={forgotData.storeName}
            onChange={(e) => setForgotData({ ...forgotData, storeName: e.target.value })}
            placeholder="مثال: متجر الإلكترونيات"
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="رقم الهاتف"
            value={forgotData.phone}
            onChange={(e) => setForgotData({ ...forgotData, phone: e.target.value })}
            placeholder="مثال: 0774366470"
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button fullWidth variant="outlined" onClick={() => setShowForgotDialog(false)} sx={{ color: '#666' }}>
              إلغاء
            </Button>
            <Button fullWidth variant="contained" onClick={handleForgotPin} sx={{ bgcolor: '#FF6B35' }}>
              تأكيد
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Dialog: تغيير الكود */}
      <Dialog open={showChangeDialog} onClose={() => setShowChangeDialog(false)} maxWidth="xs" fullWidth>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ color: '#FF6B35', fontWeight: 700, mb: 2 }}>
            تغيير كود PIN
          </Typography>
          <TextField
            fullWidth
            type="password"
            label="الكود القديم"
            value={changeData.oldPin}
            onChange={(e) => setChangeData({ ...changeData, oldPin: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            type="password"
            label="الكود الجديد (4 أرقام)"
            value={changeData.newPin}
            onChange={(e) => setChangeData({ ...changeData, newPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            type="password"
            label="تأكيد الكود الجديد"
            value={changeData.confirmPin}
            onChange={(e) => setChangeData({ ...changeData, confirmPin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button fullWidth variant="outlined" onClick={() => setShowChangeDialog(false)} sx={{ color: '#666' }}>
              إلغاء
            </Button>
            <Button fullWidth variant="contained" onClick={handleChangePin} sx={{ bgcolor: '#FF6B35' }}>
              حفظ
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
