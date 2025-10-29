// src/renderer/Activation.tsx - ✅ النسخة النهائية المُحسّنة
import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Typography, Paper, TextField, IconButton, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions 
} from '@mui/material';
import { 
  ContentCopy as CopyIcon,
  Instagram as InstagramIcon,
  WhatsApp as WhatsAppIcon,
  Facebook as FacebookIcon,
} from '@mui/icons-material';

interface ActivationProps {
  onActivate: () => void;
}

export default function Activation({ onActivate }: ActivationProps) {
  const [machineId, setMachineId] = useState('');
  const [computerName, setComputerName] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertDialog, setAlertDialog] = useState({ open: false, message: '' });

  // دالة لعرض رسائل واضحة
  const showMessage = (msg: string) => {
    setAlertDialog({ open: true, message: msg });
  };

  useEffect(() => {
    const getMachineInfo = async () => {
      if (typeof window !== 'undefined' && (window as any).electron) {
        try {
          const result = await (window as any).electron.getMachineInfo();
          if (result && result.success) {
            setComputerName(result.computerName);
            setMachineId(result.machineId);
          }
        } catch (error) {
          console.error('Error getting machine info:', error);
        }
      }
    };

    getMachineInfo();
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showMessage('✅ تم النسخ!');
    } catch (error) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        showMessage('✅ تم النسخ!');
      } catch (err) {
        showMessage('❌ فشل النسخ');
      }
      
      document.body.removeChild(textArea);
    }
  };

  const handleActivateWithCode = async () => {
    if (!activationCode.trim()) {
      showMessage('⚠️ يرجى إدخال كود التفعيل!');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://activation-tool.vercel.app/api/codes/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activationCode: activationCode.toUpperCase(),
          machineId: machineId
        })
      });

      const data = await response.json();

      if (data.success && data.valid) {
        const activationData = {
          isActivated: true,
          activationCode: activationCode,
          activationDate: new Date().toISOString(),
          machineId: machineId,
          type: data.type,
          ...(data.type === 'trial' && {
            isTrial: true,
            trialDays: data.trialDays,
            trialStartDate: new Date().toISOString()
          }),
          ...(data.type === 'full' && {
            activationType: 'full',
            isTrial: false
          })
        };

        if (data.type === 'trial') {
          if (typeof window !== 'undefined' && (window as any).electron) {
            const trialUsed = await (window as any).electron.checkTrialUsed();
            
            if (trialUsed) {
              showMessage('⚠️ لقد استخدمت النسخة التجريبية من قبل على هذا الجهاز!\n\nيرجى شراء النسخة الكاملة.');
              setLoading(false);
              return;
            }

            await (window as any).electron.markTrialUsed();
          }
        }

        if ((window as any).electron && (window as any).electron.saveActivation) {
          await (window as any).electron.saveActivation(activationData);
        }
        
        Object.keys(activationData).forEach(key => {
          localStorage.setItem(key, String(activationData[key as keyof typeof activationData]));
        });
        
        if ((window as any).electron && (window as any).electron.maximizeWindow) {
          (window as any).electron.maximizeWindow();
        }
        
        setTimeout(() => {
          showMessage(`✅ تم التفعيل بنجاح!\n\n${data.type === 'trial' ? `النسخة التجريبية: ${data.trialDays} أيام` : 'النسخة الكاملة'}`);
          
          setTimeout(() => {
            onActivate();
          }, 1500);
        }, 200);
        
      } else if (data.deactivated) {
        showMessage('⚠️ تم إيقاف هذا التفعيل من قبل المطور!\n\nيرجى التواصل مع الدعم الفني.');
        setLoading(false);
        return;
      } else {
        showMessage(`❌ ${data.message || 'الكود غير صحيح أو منتهي الصلاحية'}`);
      }
    } catch (error) {
      console.error('Activation error:', error);
      showMessage('❌ خطأ في الاتصال بالخادم. تحقق من الإنترنت.');
    } finally {
      setLoading(false);
    }
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
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: 500,
          bgcolor: 'white',
          borderRadius: 3,
          border: '3px solid #FF6B35',
          p: 4,
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: 100,
            height: 100,
            mx: 'auto',
            mb: 2,
            borderRadius: '25px',
            bgcolor: '#FF6B35',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 3,
          }}
        >
          <Typography sx={{ fontSize: 60, color: 'white' }}>🛒</Typography>
        </Box>

        <Typography
          variant="h4"
          sx={{
            color: '#FF6B35',
            fontWeight: 900,
            fontFamily: 'Cairo, Arial',
            mb: 1,
          }}
        >
          HANOUTY DZ
        </Typography>

        <Typography
          sx={{
            color: '#666',
            fontSize: '0.9rem',
            mb: 3,
          }}
        >
          نسخة 1.0 - تفعيل البرنامج
        </Typography>

        <Box
          sx={{
            bgcolor: '#f5f5f5',
            borderRadius: 2,
            p: 2,
            mb: 2,
            textAlign: 'right',
          }}
        >
          <Typography
            sx={{
              color: '#FF6B35',
              fontSize: '0.85rem',
              fontWeight: 600,
              mb: 1,
            }}
          >
            💻 اسم الجهاز: <span style={{ color: '#666' }}>{computerName || 'جاري التحميل...'}</span>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography
              sx={{
                color: '#FF6B35',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              🔑 رقم الجهاز: <span style={{ color: '#666', fontFamily: 'monospace' }}>{machineId || 'جاري التحميل...'}</span>
            </Typography>
            {machineId && (
              <IconButton
                size="small"
                onClick={() => copyToClipboard(machineId)}
                sx={{ bgcolor: '#FF6B35', color: 'white', '&:hover': { bgcolor: '#E55A2B' } }}
              >
                <CopyIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
          </Box>
        </Box>

        <Box
          sx={{
            bgcolor: '#FFF3E0',
            border: '2px dashed #FF9800',
            borderRadius: 2,
            p: 2,
            mb: 2,
          }}
        >
          <Typography
            sx={{
              color: '#F57C00',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            💡 أرسل رقم الجهاز للمطور للحصول على كود التفعيل
          </Typography>
        </Box>

        <TextField
          fullWidth
          placeholder="HK-XXXX-XXXX-XXXX-XXXX"
          value={activationCode}
          onChange={(e) => setActivationCode(e.target.value.toUpperCase())}
          disabled={loading}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              fontSize: '1rem',
              fontFamily: 'monospace',
              '& fieldset': {
                borderColor: '#FF6B35',
                borderWidth: 2,
              },
              '&:hover fieldset': {
                borderColor: '#E55A2B',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#FF6B35',
              },
            },
          }}
        />

        <Button
          fullWidth
          variant="contained"
          onClick={handleActivateWithCode}
          disabled={!activationCode.trim() || loading}
          sx={{
            bgcolor: '#FF6B35',
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 700,
            fontFamily: 'Cairo, Arial',
            borderRadius: 2,
            mb: 2,
            '&:hover': {
              bgcolor: '#E55A2B',
            },
            '&:disabled': {
              bgcolor: '#ccc',
            },
          }}
        >
          {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : '✅ تفعيل البرنامج'}
        </Button>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            mt: 3,
            pt: 3,
            borderTop: '1px solid #e0e0e0',
          }}
        >
          <IconButton sx={{ bgcolor: '#f5f5f5' }}>
            <InstagramIcon sx={{ color: '#E1306C' }} />
          </IconButton>
          <IconButton sx={{ bgcolor: '#f5f5f5' }}>
            <WhatsAppIcon sx={{ color: '#25D366' }} />
          </IconButton>
          <IconButton sx={{ bgcolor: '#f5f5f5' }}>
            <FacebookIcon sx={{ color: '#1877F2' }} />
          </IconButton>
        </Box>

        <Typography
          sx={{
            color: '#999',
            fontSize: '0.75rem',
            mt: 2,
          }}
        >
          © HANOUTY DZ 2025 - جميع الحقوق محفوظة
        </Typography>
      </Paper>

      {/* Dialog للرسائل */}
      <Dialog 
        open={alertDialog.open} 
        onClose={() => setAlertDialog({ open: false, message: '' })}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 300,
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, color: '#FF6B35' }}>
          إشعار
        </DialogTitle>
        <DialogContent>
          <Typography 
            sx={{ 
              whiteSpace: 'pre-line', 
              textAlign: 'center',
              fontSize: '1rem',
              lineHeight: 1.8,
            }}
          >
            {alertDialog.message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button 
            onClick={() => setAlertDialog({ open: false, message: '' })} 
            variant="contained"
            sx={{
              bgcolor: '#FF6B35',
              px: 4,
              '&:hover': {
                bgcolor: '#E55A2B',
              }
            }}
          >
            حسناً
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
