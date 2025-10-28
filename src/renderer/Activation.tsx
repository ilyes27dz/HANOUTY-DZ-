// src/renderer/Activation.tsx - ✅ النسخة النهائية الكاملة مع التكبير التلقائي
import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Chip, Divider, IconButton, Tooltip, Alert, Dialog, TextField } from '@mui/material';
import { 
  Computer as ComputerIcon, 
  VpnKey as KeyIcon,
  CheckCircle as CheckIcon,
  Facebook as FacebookIcon,
  WhatsApp as WhatsAppIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';

interface ActivationProps {
  onActivate: () => void;
}

export default function Activation({ onActivate }: ActivationProps) {
  const [machineId, setMachineId] = useState('');
  const [computerName, setComputerName] = useState('');
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const [activationCode, setActivationCode] = useState('');
  const [trialDisabled, setTrialDisabled] = useState(false);

  useEffect(() => {
    const getMachineInfo = async () => {
      // ✅ استخدم window.electron
      if (typeof window !== 'undefined' && (window as any).electron) {
        try {
          const result = await (window as any).electron.getMachineInfo();
          
          console.log('📡 Machine Info Response:', result);
          
          if (result && result.success) {
            setComputerName(result.computerName);
            setMachineId(result.machineId);
            console.log('✅ Machine Info Set:', result.computerName, result.machineId);
          } else {
            console.warn('⚠️ Machine Info Failed, using fallback');
            setComputerName('Unknown');
            setMachineId('0000000000');
          }
        } catch (error) {
          console.error('❌ Error getting machine info:', error);
          setComputerName('Unknown');
          setMachineId('0000000000');
        }
      } else {
        console.error('❌ window.electron not available!');
        setComputerName('TEST-COMPUTER');
        setMachineId('1234567890');
      }
    };

    const checkTrialStatus = async () => {
      if (typeof window !== 'undefined' && (window as any).electron) {
        try {
          const trialUsed = await (window as any).electron.checkTrialUsed();
          
          if (trialUsed) {
            setTrialDisabled(true);
            console.log('⚠️ Trial already used');
          }
        } catch (error) {
          console.error('❌ Check trial error:', error);
        }
      }
    };

    getMachineInfo();
    checkTrialStatus();
  }, []);

  const verifyActivationCode = async (machineId: string, activationCode: string): Promise<boolean> => {
    const SECRET_KEY = "HANOUTY_DZ_2025_SECRET_KEY_DO_NOT_SHARE";
    
    const cleanCode = activationCode.replace(/HK-|-/g, '').toUpperCase();
    
    const combined = `${machineId}-${SECRET_KEY}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(combined);
    
    try {
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      const expectedCode = hashHex.substring(0, 16).toUpperCase();
      
      return cleanCode === expectedCode;
    } catch (error) {
      console.error('Error verifying activation code:', error);
      return false;
    }
  };

  const verifyTrialCode = async (machineId: string, activationCode: string): Promise<number | false> => {
    const SECRET_KEY = "TRIAL_KEY_2025_HANOUTY";
    
    if (!activationCode.startsWith('HT-')) return false;
    
    const parts = activationCode.split('-');
    if (parts.length < 5) return false;
    
    const daysStr = parts[1];
    if (!daysStr.endsWith('D')) return false;
    
    const days = parseInt(daysStr.replace('D', ''), 10);
    if (isNaN(days) || days <= 0) return false;
    
    const cleanCode = `${parts[2]}${parts[3]}${parts[4]}`.toUpperCase();
    
    const combined = `${machineId}-${days}-${SECRET_KEY}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(combined);
    
    try {
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      const expectedCode = hashHex.substring(0, 12).toUpperCase();
      
      return cleanCode === expectedCode ? days : false;
    } catch (error) {
      console.error('Error verifying trial code:', error);
      return false;
    }
  };

  const handleActivateWithCode = async () => {
    if (!activationCode.trim()) {
      alert('⚠️ يرجى إدخال كود التفعيل!');
      return;
    }

    // فحص إذا كان كود تجريبي (HT-)
    if (activationCode.startsWith('HT-')) {
      const days = await verifyTrialCode(machineId, activationCode);
      
      if (days !== false && typeof window !== 'undefined' && (window as any).electron) {
        try {
          // فحص إذا تم استخدام التجربة
          const trialUsed = await (window as any).electron.checkTrialUsed();
          
          if (trialUsed) {
            alert('⚠️ لقد استخدمت النسخة التجريبية من قبل!\n\nيرجى شراء النسخة الكاملة.');
            return;
          }
          
          // تفعيل تجريبي
          localStorage.setItem('trialStartDate', new Date().toISOString());
          localStorage.setItem('isTrial', 'true');
          localStorage.setItem('trialDays', days.toString());
          localStorage.setItem('isActivated', 'true');
          
          // حفظ علامة دائمة
          await (window as any).electron.markTrialUsed();
          
          setShowActivationDialog(false);
          
          // ✅ تكبير النافذة فوراً
          console.log('🎉 Trial activation successful, maximizing window...');
          if ((window as any).electron && (window as any).electron.maximizeWindow) {
            (window as any).electron.maximizeWindow();
          }
          
          // ✅ رسالة النجاح
          setTimeout(() => {
            alert(`✅ تم تفعيل النسخة التجريبية لمدة ${days} أيام!`);
            // ✅ الانتقال للداشبورد
            onActivate();
          }, 200);
          
        } catch (error) {
          console.error('Trial activation error:', error);
          alert('❌ حدث خطأ أثناء التفعيل!');
        }
      } else {
        alert('❌ كود التفعيل التجريبي غير صحيح!');
      }
      return;
    }

    // كود كامل (HK-)
    const isValid = await verifyActivationCode(machineId, activationCode);
    
    if (isValid) {
      localStorage.setItem('isActivated', 'true');
      localStorage.setItem('activationType', 'full');
      localStorage.removeItem('isTrial');
      localStorage.removeItem('trialStartDate');
      localStorage.removeItem('trialDays');
      setShowActivationDialog(false);
      
      // ✅ تكبير النافذة فوراً
      console.log('🎉 Full activation successful, maximizing window...');
      if ((window as any).electron && (window as any).electron.maximizeWindow) {
        (window as any).electron.maximizeWindow();
      }
      
      // ✅ رسالة النجاح
      setTimeout(() => {
        alert('✅ تم تفعيل النسخة الكاملة بنجاح!');
        // ✅ الانتقال للداشبورد
        onActivate();
      }, 200);
      
    } else {
      alert('❌ كود التفعيل غير صحيح!');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('✅ تم النسخ!');
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
        position: 'relative',
      }}
    >
      <Paper
        elevation={24}
        sx={{
          width: 520,
          bgcolor: 'rgba(18, 30, 40, 0.95)',
          borderRadius: 4,
          p: 4,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 152, 0, 0.2)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 70,
              height: 70,
              mx: 'auto',
              mb: 2,
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #FF9800 0%, #FF6F00 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(255, 152, 0, 0.4)',
            }}
          >
            <Typography sx={{ fontSize: 42, fontWeight: 900, color: '#fff' }}>🛒</Typography>
          </Box>
          
          <Typography variant="h5" sx={{ color: '#FFD54F', fontWeight: 900, fontFamily: 'Cairo, Arial', mb: 1 }}>
            تفعيل HANOUTY DZ
          </Typography>
          
          <Chip
            icon={<CheckIcon />}
            label="تم تسجيل الدخول بنجاح"
            sx={{ 
              fontFamily: 'Cairo, Arial', 
              fontWeight: 600,
              bgcolor: 'rgba(76, 175, 80, 0.2)',
              color: '#81C784',
              border: '1px solid rgba(76, 175, 80, 0.3)',
            }}
            size="small"
          />
        </Box>

        <Divider sx={{ my: 3, borderColor: 'rgba(255, 152, 0, 0.2)' }} />

        <Box sx={{ mb: 3, p: 2.5, bgcolor: 'rgba(255, 152, 0, 0.08)', borderRadius: 2, border: '1px solid rgba(255, 152, 0, 0.3)' }}>
          <Typography sx={{ color: '#FFD54F', fontSize: '0.95rem', fontFamily: 'Cairo, Arial', fontWeight: 700, mb: 2 }}>
            📋 معلومات الجهاز
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <ComputerIcon sx={{ color: '#FF9800', fontSize: 20 }} />
            <Typography sx={{ color: '#B0BEC5', fontSize: '0.85rem', fontFamily: 'Cairo, Arial' }}>
              <strong style={{ color: '#FFD54F' }}>اسم الجهاز:</strong> {computerName || 'جاري التحميل...'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <KeyIcon sx={{ color: '#FF9800', fontSize: 20 }} />
            <Typography sx={{ color: '#B0BEC5', fontSize: '0.85rem', fontFamily: 'Cairo, Arial', flex: 1 }}>
              <strong style={{ color: '#FFD54F' }}>رقم الجهاز:</strong> {machineId || 'جاري التحميل...'}
            </Typography>
            {machineId && (
              <IconButton 
                size="small" 
                onClick={() => copyToClipboard(machineId)}
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

        <Alert 
          severity="info" 
          sx={{ 
            mb: 3, 
            fontFamily: 'Cairo, Arial', 
            fontSize: '0.85rem',
            bgcolor: 'rgba(33, 150, 243, 0.1)',
            color: '#64B5F6',
            '& .MuiAlert-icon': { color: '#64B5F6' },
          }}
        >
          💡 اطلب كود التفعيل من المطور بإرسال <strong>رقم الجهاز</strong>
        </Alert>

        <Paper
          elevation={3}
          sx={{
            p: 2.5,
            bgcolor: 'rgba(76, 175, 80, 0.08)',
            border: '2px solid rgba(76, 175, 80, 0.3)',
            borderRadius: 2,
            mb: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
            <CheckIcon sx={{ color: '#4CAF50', fontSize: 28, mr: 1 }} />
            <Typography sx={{ color: '#4CAF50', fontWeight: 900, fontSize: '1.1rem', fontFamily: 'Cairo, Arial' }}>
              تفعيل البرنامج
            </Typography>
          </Box>
          
          <Typography sx={{ color: '#B0BEC5', fontSize: '0.85rem', fontFamily: 'Cairo, Arial', mb: 2 }}>
            ✅ أرسل <strong style={{ color: '#FFD54F' }}>رقم الجهاز</strong> للمطور<br />
            ✅ اختر النسخة: <strong style={{ color: '#FFC107' }}>تجريبية (5/7/10 أيام)</strong> أو <strong style={{ color: '#4CAF50' }}>كاملة (دائمة)</strong><br />
            ✅ سيعطيك المطور كود التفعيل<br />
            ✅ أدخل الكود هنا وفعّل البرنامج
          </Typography>
          
          <Button
            fullWidth
            variant="contained"
            onClick={() => setShowActivationDialog(true)}
            disabled={!machineId}
            sx={{
              bgcolor: '#4CAF50',
              py: 1.2,
              fontSize: '0.95rem',
              fontWeight: 700,
              fontFamily: 'Cairo, Arial',
              '&:hover': { 
                bgcolor: '#43A047',
                boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
              },
              '&:disabled': {
                bgcolor: '#9E9E9E',
                color: '#BDBDBD',
              }
            }}
          >
            🔑 إدخال كود التفعيل
          </Button>
        </Paper>

        {trialDisabled && (
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 2, 
              fontFamily: 'Cairo, Arial', 
              fontSize: '0.8rem',
              bgcolor: 'rgba(255, 152, 0, 0.1)',
              color: '#FFB74D',
            }}
          >
            ⚠️ لقد استخدمت النسخة التجريبية من قبل على هذا الجهاز
          </Alert>
        )}

        <Divider sx={{ my: 3, borderColor: 'rgba(255, 152, 0, 0.2)' }} />

        <Box sx={{ mb: 2 }}>
          <Typography sx={{ color: '#FFD54F', fontSize: '0.9rem', fontFamily: 'Cairo, Arial', fontWeight: 700, mb: 2, textAlign: 'center' }}>
            📞 للتواصل والدعم الفني
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
            <Tooltip title="واتساب: +213XXXXXXXXX">
              <IconButton 
                onClick={() => window.open('https://wa.me/213XXXXXXXXX', '_blank')} 
                sx={{ 
                  bgcolor: 'rgba(37, 211, 102, 0.2)', 
                  '&:hover': { 
                    bgcolor: 'rgba(37, 211, 102, 0.3)',
                    transform: 'scale(1.1)',
                    transition: 'all 0.3s',
                  },
                  width: 48,
                  height: 48,
                }}
              >
                <WhatsAppIcon sx={{ color: '#25D366' }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="فيسبوك">
              <IconButton 
                onClick={() => window.open('https://facebook.com/yourpage', '_blank')} 
                sx={{ 
                  bgcolor: 'rgba(66, 103, 178, 0.2)', 
                  '&:hover': { 
                    bgcolor: 'rgba(66, 103, 178, 0.3)',
                    transform: 'scale(1.1)',
                    transition: 'all 0.3s',
                  },
                  width: 48,
                  height: 48,
                }}
              >
                <FacebookIcon sx={{ color: '#4267B2' }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Typography sx={{ textAlign: 'center', color: '#78909C', fontSize: '0.7rem', fontFamily: 'Cairo, Arial' }}>
          © 2025 HANOUTY DZ - جميع الحقوق محفوظة
        </Typography>
      </Paper>

      <Dialog
        open={showActivationDialog}
        onClose={() => setShowActivationDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(18, 30, 40, 0.98)',
            borderRadius: 3,
            p: 3,
          }
        }}
      >
        <Typography variant="h5" sx={{ color: '#FFD54F', fontWeight: 900, fontFamily: 'Cairo, Arial', mb: 2, textAlign: 'center' }}>
          🔑 إدخال كود التفعيل
        </Typography>
        
        <Typography sx={{ color: '#B0BEC5', fontSize: '0.85rem', fontFamily: 'Cairo, Arial', mb: 2, textAlign: 'center' }}>
          أدخل الكود الذي حصلت عليه من المطور
        </Typography>
        
        <TextField
          fullWidth
          placeholder="HK-XXXX-XXXX-XXXX-XXXX أو HT-5D-XXXX-XXXX-XXXX"
          value={activationCode}
          onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              bgcolor: 'rgba(255, 152, 0, 0.08)',
              color: '#FFD54F',
              fontFamily: 'monospace',
              fontSize: '1.1rem',
              border: '1px solid rgba(255, 152, 0, 0.3)',
            },
          }}
        />
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setShowActivationDialog(false)}
            sx={{
              borderColor: '#78909C',
              color: '#B0BEC5',
              fontFamily: 'Cairo, Arial',
            }}
          >
            إلغاء
          </Button>
          
          <Button
            fullWidth
            variant="contained"
            onClick={handleActivateWithCode}
            sx={{
              bgcolor: '#4CAF50',
              fontFamily: 'Cairo, Arial',
              '&:hover': { bgcolor: '#43A047' },
            }}
          >
            ✅ تفعيل
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
}
