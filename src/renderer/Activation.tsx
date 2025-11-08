// src/renderer/Activation.tsx - ✅ مع نظام حماية محسّن مرتبط برقم الجهاز
import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Typography, Paper, TextField, IconButton, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Card, Divider, Tooltip 
} from '@mui/material';
import { 
  ContentCopy as CopyIcon,
  Instagram as InstagramIcon,
  WhatsApp as WhatsAppIcon,
  Facebook as FacebookIcon,
  Payment as PaymentIcon,
  Close as CloseIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import CryptoJS from 'crypto-js';

interface ActivationProps {
  onActivate: () => void;
}

export default function Activation({ onActivate }: ActivationProps) {
  const [machineId, setMachineId] = useState('');
  const [computerName, setComputerName] = useState('');
  const [activationCode, setActivationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertDialog, setAlertDialog] = useState({ open: false, message: '' });
  const [paymentView, setPaymentView] = useState(false);

  const showMessage = (msg: string) => {
    setAlertDialog({ open: true, message: msg });
  };

  /**
   * ============================================
   * 🔒 دوال التشفير والحماية
   * ============================================
   */

  /**
   * توليد hash من رقم الجهاز
   */
  const generateMachineHash = (machineId: string): string => {
    return CryptoJS.SHA256(machineId).toString(CryptoJS.enc.Hex).substring(0, 8).toUpperCase();
  };

  /**
   * التحقق من صحة كود التفعيل الكامل
   * صيغة الكود الصحيحة: HK-HASH-RANDOM-RANDOM-RANDOM
   */
  const validateFullActivationCode = (code: string, machineId: string): { valid: boolean; message: string } => {
    const parts = code.split('-');
    
    if (parts.length !== 5) {
      return { valid: false, message: '❌ صيغة الكود غير صحيحة!\n\nالصيغة الصحيحة: HK-XXXX-XXXX-XXXX-XXXX' };
    }

    if (parts[0] !== 'HK') {
      return { valid: false, message: '❌ الكود يجب أن يبدأ بـ HK' };
    }

    const machineHash = generateMachineHash(machineId);
    
    if (parts[1] !== machineHash) {
      return { 
        valid: false, 
        message: `❌ هذا الكود غير مخصص لهذا الجهاز!\n\nالكود الصحيح يجب أن يبدأ بـ: HK-${machineHash}-...\n\nيرجى التواصل مع المطور للحصول على الكود الصحيح.` 
      };
    }

    return { valid: true, message: 'كود صحيح' };
  };

  /**
   * التحقق من صحة كود التجريبي
   * صيغة الكود الصحيحة: HT-DAYS-HASH
   */
  const validateTrialActivationCode = (code: string, machineId: string): { valid: boolean; message: string; days?: number } => {
    const parts = code.split('-');
    
    if (parts.length !== 3) {
      return { valid: false, message: '❌ صيغة الكود التجريبي غير صحيحة!\n\nالصيغة الصحيحة: HT-5-XXXX' };
    }

    if (parts[0] !== 'HT') {
      return { valid: false, message: '❌ الكود التجريبي يجب أن يبدأ بـ HT' };
    }

    const trialDays = parseInt(parts[1], 10);
    if (isNaN(trialDays) || trialDays <= 0 || trialDays > 365) {
      return { valid: false, message: '❌ عدد الأيام غير صحيح! (يجب أن يكون بين 1 و 365)' };
    }

    const machineHash = generateMachineHash(machineId);
    
    if (parts[2] !== machineHash) {
      return { 
        valid: false, 
        message: `❌ هذا الكود التجريبي غير مخصص لهذا الجهاز!\n\nالكود الصحيح يجب أن يكون: HT-${trialDays}-${machineHash}\n\nيرجى التواصل مع المطور.` 
      };
    }

    return { valid: true, message: 'كود صحيح', days: trialDays };
  };

  /**
   * ============================================
   * 🔄 تحميل معلومات الجهاز
   * ============================================
   */
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

  /**
   * ============================================
   * 📋 نسخ النص
   * ============================================
   */
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

  /**
   * ============================================
   * 🔐 التفعيل الآمن بالكود
   * ============================================
   */
  const handleActivateWithCode = async () => {
    if (!activationCode.trim()) {
      showMessage('⚠️ يرجى إدخال كود التفعيل!');
      return;
    }

    if (!machineId) {
      showMessage('❌ خطأ: لم يتم الحصول على معلومات الجهاز!\n\nيرجى إعادة تشغيل البرنامج.');
      return;
    }

    const code = activationCode.toUpperCase().trim();
    setLoading(true);

    try {
      // ============================================
      // 🔹 التحقق من الكود الكامل (HK-...)
      // ============================================
      if (code.startsWith('HK-')) {
        const validation = validateFullActivationCode(code, machineId);
        
        if (!validation.valid) {
          showMessage(validation.message);
          setLoading(false);
          return;
        }

        // التحقق من الخادم
        try {
          const response = await fetch('https://activation-tool.vercel.app/api/codes/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              activationCode: code,
              machineId: machineId
            })
          });

          const data = await response.json();

          if (data.success && data.valid && data.type === 'full') {
            if (data.deactivated) {
              showMessage('⚠️ تم إيقاف هذا التفعيل من قبل المطور!\n\nيرجى التواصل مع الدعم الفني.');
              setLoading(false);
              return;
            }

            // حفظ التفعيل الكامل
            const activationData = {
              isActivated: true,
              activationCode: code,
              activationDate: new Date().toISOString(),
              machineId: machineId,
              activationType: 'full',
              isTrial: false
            };

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
              showMessage('✅ تم تفعيل النسخة الكاملة بنجاح!\n\nشكراً لاستخدامك HANOUTY DZ');
              
              setTimeout(() => {
                onActivate();
              }, 1500);
            }, 200);

          } else {
            showMessage(`❌ ${data.message || 'الكود غير صحيح أو منتهي الصلاحية'}`);
            setLoading(false);
          }
        } catch (error) {
          console.error('Server error:', error);
          showMessage('❌ خطأ في الاتصال بالخادم.\n\nتحقق من اتصال الإنترنت.');
          setLoading(false);
        }
        return;
      }

      // ============================================
      // 🔹 التحقق من الكود التجريبي (HT-...)
      // ============================================
      if (code.startsWith('HT-')) {
        const validation = validateTrialActivationCode(code, machineId);
        
        if (!validation.valid) {
          showMessage(validation.message);
          setLoading(false);
          return;
        }

        // التحقق من استخدام التجريبية سابقاً
        if (typeof window !== 'undefined' && (window as any).electron) {
          const trialUsed = await (window as any).electron.checkTrialUsed();
          
          if (trialUsed) {
            showMessage('⚠️ لقد استخدمت النسخة التجريبية من قبل على هذا الجهاز!\n\nيرجى شراء النسخة الكاملة.');
            setLoading(false);
            return;
          }
        }

        // التحقق من الخادم
        try {
          const response = await fetch('https://activation-tool.vercel.app/api/codes/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              activationCode: code,
              machineId: machineId
            })
          });

          const data = await response.json();

          if (data.success && data.valid && data.type === 'trial') {
            if (data.deactivated) {
              showMessage('⚠️ تم إيقاف هذا التفعيل من قبل المطور!');
              setLoading(false);
              return;
            }

            // حفظ التفعيل التجريبي
            const trialDays = validation.days!;
            const activationData = {
              isActivated: true,
              activationCode: code,
              activationDate: new Date().toISOString(),
              machineId: machineId,
              isTrial: true,
              trialDays: trialDays,
              trialStartDate: new Date().toISOString(),
              activationType: 'trial'
            };

            if ((window as any).electron) {
              await (window as any).electron.markTrialUsed();
              
              if ((window as any).electron.saveActivation) {
                await (window as any).electron.saveActivation(activationData);
              }
            }
            
            Object.keys(activationData).forEach(key => {
              localStorage.setItem(key, String(activationData[key as keyof typeof activationData]));
            });
            
            if ((window as any).electron && (window as any).electron.maximizeWindow) {
              (window as any).electron.maximizeWindow();
            }
            
            setTimeout(() => {
              showMessage(`✅ تم تفعيل النسخة التجريبية بنجاح!\n\nالمدة: ${trialDays} أيام`);
              
              setTimeout(() => {
                onActivate();
              }, 1500);
            }, 200);

          } else {
            showMessage(`❌ ${data.message || 'الكود غير صحيح'}`);
            setLoading(false);
          }
        } catch (error) {
          console.error('Server error:', error);
          showMessage('❌ خطأ في الاتصال بالخادم.');
          setLoading(false);
        }
        return;
      }

      // ============================================
      // 🔹 الكود غير معروف
      // ============================================
      showMessage('❌ صيغة الكود غير صحيحة!\n\nالأكواد الصحيحة:\n• HK-XXXX-XXXX-XXXX-XXXX (كامل)\n• HT-5-XXXX (تجريبي)');
      setLoading(false);

    } catch (error) {
      console.error('Activation error:', error);
      showMessage('❌ خطأ غير متوقع! حاول مجدداً.');
      setLoading(false);
    }
  };

  /**
   * ============================================
   * 💳 صفحة الدفع
   * ============================================
   */
  if (paymentView) {
    return (
      <Box sx={{ width: '100%', height: '100vh', bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', p: 2, overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper sx={{ width: '100%', maxWidth: 500, borderRadius: 4, p: 0, overflow: 'hidden', boxShadow: 'none', elevation: 20 }}>
          {/* رأس الدفع */}
          <Box sx={{ background: 'linear-gradient(135deg, #FF6B35 0%, #FF9800 100%)', p: 3, position: 'relative', textAlign: 'center' }}>
            <IconButton 
              onClick={() => setPaymentView(false)} 
              sx={{ position: 'absolute', left: 16, top: 16, bgcolor: 'rgba(255,255,255,0.2)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ fontWeight: 900, fontSize: '1.4rem', color: 'white', mb: 0.5 }}>💳 خيارات التفعيل</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}>اختر الخطة المناسبة لك</Typography>
          </Box>

          {/* محتوى الدفع */}
          <Box sx={{ p: 3 }}>
            {/* معلومات الجهاز المطلوبة */}
            <Card sx={{ p: 2, mb: 2, bgcolor: '#E3F2FD', border: '2px solid #2196F3', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <SecurityIcon sx={{ color: '#2196F3' }} />
                <Typography sx={{ fontWeight: 700, color: '#2196F3', fontSize: '0.95rem' }}>📌 معلومات مهمة للمطور</Typography>
              </Box>
              <Divider sx={{ my: 1, borderColor: '#2196F3' }} />
              
              <Box sx={{ bgcolor: 'white', p: 1.5, borderRadius: 1, mb: 1 }}>
                <Typography sx={{ fontSize: '0.75rem', color: '#666', mb: 0.5 }}>اسم الجهاز:</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#333', fontSize: '0.8rem' }}>{computerName || 'جاري التحميل...'}</Typography>
                  {computerName && (
                    <Tooltip title="نسخ">
                      <IconButton size="small" onClick={() => copyToClipboard(computerName)} sx={{ color: '#2196F3', p: 0.5 }}>
                        <CopyIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>

              <Box sx={{ bgcolor: 'white', p: 1.5, borderRadius: 1 }}>
                <Typography sx={{ fontSize: '0.75rem', color: '#666', mb: 0.5 }}>رقم الجهاز (Machine ID):</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#333', fontSize: '0.7rem', wordBreak: 'break-all' }}>{machineId || 'جاري التحميل...'}</Typography>
                  {machineId && (
                    <Tooltip title="نسخ">
                      <IconButton size="small" onClick={() => copyToClipboard(machineId)} sx={{ color: '#2196F3', p: 0.5, ml: 1 }}>
                        <CopyIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>

              <Box sx={{ bgcolor: '#FFF3E0', p: 1, borderRadius: 1, mt: 1, border: '1px solid #FFB74D' }}>
                <Typography sx={{ color: '#E65100', fontSize: '0.7rem', fontWeight: 600 }}>
                  ⚠️ يجب إرسال رقم الجهاز للمطور للحصول على كود مخصص لهذا الجهاز فقط
                </Typography>
              </Box>
            </Card>

            {/* النسخة التجريبية */}
            <Card sx={{ p: 2.5, mb: 2, background: 'linear-gradient(135deg, rgba(33,150,243,0.05) 0%, rgba(33,150,243,0.02) 100%)', border: '2px solid #2196F3', borderRadius: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1.5 }}>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: '#2196F3', mb: 0.5 }}>⏱️ النسخة التجريبية</Typography>
                  <Typography sx={{ color: '#666', fontSize: '0.85rem', mb: 0.5 }}>• 5 أيام كاملة</Typography>
                  <Typography sx={{ color: '#999', fontSize: '0.75rem' }}>• بدون أي تكلفة</Typography>
                  {machineId && (
                    <Typography sx={{ color: '#2196F3', fontSize: '0.7rem', mt: 1, fontFamily: 'monospace', fontWeight: 700 }}>
                      الكود: HT-5-{generateMachineHash(machineId)}
                    </Typography>
                  )}
                </Box>
                <Typography sx={{ fontWeight: 900, fontSize: '1.3rem', color: '#2196F3' }}>مجاني</Typography>
              </Box>
              <Divider sx={{ my: 1.5, borderColor: '#2196F3' }} />
              <Button fullWidth variant="contained" sx={{ background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)', fontWeight: 700, borderRadius: 2, textTransform: 'none', fontSize: '1rem' }} onClick={() => setPaymentView(false)}>تواصل للحصول على الكود</Button>
            </Card>

            {/* النسخة الكاملة */}
            <Card sx={{ p: 2.5, background: 'linear-gradient(135deg, rgba(76,175,80,0.05) 0%, rgba(76,175,80,0.02) 100%)', border: '2px solid #4CAF50', borderRadius: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1.5 }}>
                <Box>
                  <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', color: '#4CAF50', mb: 0.5 }}>⭐ النسخة الكاملة</Typography>
                  <Typography sx={{ color: '#666', fontSize: '0.85rem', mb: 0.5 }}>• مدى الحياة بدون نهاية</Typography>
                  <Typography sx={{ color: '#999', fontSize: '0.75rem' }}>• استخدام غير محدود</Typography>
                  <Typography sx={{ color: '#999', fontSize: '0.75rem' }}>• كود مرتبط بهذا الجهاز فقط</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography sx={{ fontWeight: 900, fontSize: '1.3rem', color: '#4CAF50' }}>8000</Typography>
                  <Typography sx={{ color: '#666', fontSize: '0.75rem' }}>دج</Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 1.5, borderColor: '#4CAF50' }} />
              
              {/* طرق الدفع */}
              <Box sx={{ mb: 1.5 }}>
                <Typography sx={{ fontWeight: 700, color: '#333', fontSize: '0.9rem', mb: 1 }}>📌 طرق الدفع:</Typography>
                
                {/* CCP */}
                <Card sx={{ p: 1.5, mb: 1, bgcolor: '#E3F2FD', border: '1px solid #90CAF9', borderRadius: 2 }}>
                  <Typography sx={{ fontWeight: 700, color: '#2196F3', mb: 0.8, fontSize: '0.9rem' }}>🏦 البريد الجزائري - CCP</Typography>
                  <Box sx={{ bgcolor: 'white', p: 1, borderRadius: 1, mb: 0.8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#333', fontSize: '0.85rem' }}>0024747431</Typography>
                    <Tooltip title="نسخ الرقم">
                      <IconButton size="small" onClick={() => copyToClipboard('0024747431')} sx={{ color: '#2196F3', p: 0.5 }}>
                        <CopyIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box sx={{ bgcolor: 'white', p: 1, borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#333', fontSize: '0.85rem' }}>المفتاح: 64</Typography>
                    <Tooltip title="نسخ المفتاح">
                      <IconButton size="small" onClick={() => copyToClipboard('64')} sx={{ color: '#2196F3', p: 0.5 }}>
                        <CopyIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Card>

                {/* BARIDIMOB */}
                <Card sx={{ p: 1.5, bgcolor: '#F3E5F5', border: '1px solid #CE93D8', borderRadius: 2 }}>
                  <Typography sx={{ fontWeight: 700, color: '#9C27B0', mb: 0.8, fontSize: '0.9rem' }}>📱 BARIDIMOB</Typography>
                  <Box sx={{ bgcolor: 'white', p: 1, borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#333', fontSize: '0.75rem' }}>00799999002474743164</Typography>
                    <Tooltip title="نسخ RIB">
                      <IconButton size="small" onClick={() => copyToClipboard('00799999002474743164')} sx={{ color: '#9C27B0', p: 0.5 }}>
                        <CopyIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Card>
              </Box>

              {/* معلومات مهمة */}
              <Box sx={{ bgcolor: '#FFF3E0', p: 1.5, borderRadius: 2, border: '1px solid #FFB74D', mb: 1.5 }}>
                <Typography sx={{ color: '#E65100', fontSize: '0.8rem', fontWeight: 700, mb: 0.5 }}>⚠️ خطوات بعد الدفع:</Typography>
                <Typography sx={{ color: '#E65100', fontSize: '0.75rem', lineHeight: 1.8 }}>
                  1️⃣ احفظ إيصال الدفع<br/>
                  2️⃣ انسخ رقم الجهاز (Machine ID)<br/>
                  3️⃣ تواصل معنا وأرسل الإيصال ورقم الجهاز<br/>
                  4️⃣ احصل على كودك المخصص
                </Typography>
              </Box>

              {/* التواصل */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontSize: '0.8rem', color: '#666', mb: 0.8, fontWeight: 600 }}>📞 تواصل معنا:</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                  <Tooltip title="واتساب: 05.42.03.80.84">
                    <IconButton onClick={() => copyToClipboard('05.42.03.80.84')} sx={{ bgcolor: '#25D366', color: 'white', width: 40, height: 40 }}>
                      <WhatsAppIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="الفيسبوك">
                    <IconButton sx={{ bgcolor: '#1877F2', color: 'white', width: 40, height: 40 }}>
                      <FacebookIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="انستقرام">
                    <IconButton sx={{ background: 'linear-gradient(135deg, #E1306C 0%, #C13584 100%)', color: 'white', width: 40, height: 40 }}>
                      <InstagramIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Card>
          </Box>
        </Paper>
      </Box>
    );
  }

  /**
   * ============================================
   * 🎨 الصفحة الرئيسية للتفعيل
   * ============================================
   */
  return (
    <Box sx={{ width: '100%', height: '100vh', bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Paper elevation={20} sx={{ width: '100%', maxWidth: 500, borderRadius: 4, overflow: 'hidden', border: '3px solid #FF6B35' }}>
        
        {/* الرأس المتدرج */}
        <Box sx={{ background: 'linear-gradient(135deg, #FF5722 0%, #FF9800 100%)', p: 4, textAlign: 'center', position: 'relative' }}>
          <Box sx={{ fontSize: 50, mb: 1 }}>🛒</Box>
          <Typography sx={{ color: 'white', fontWeight: 900, fontFamily: 'Cairo, Arial', mb: 0.5, fontSize: '1.8rem', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
            HANOUTY DZ
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', fontFamily: 'Cairo, Arial' }}>
            نسخة 1.0 - تفعيل البرنامج
          </Typography>
        </Box>

        <Box sx={{ p: 4 }}>
          {/* معلومات الجهاز */}
          <Card sx={{ p: 2, mb: 2.5, bgcolor: '#f5f5f5', border: '1px solid #eee', borderRadius: 2.5 }}>
            <Typography sx={{ color: '#FF6B35', fontSize: '0.85rem', fontWeight: 600, mb: 1 }}>
              💻 اسم الجهاز: <span style={{ color: '#666' }}>{computerName || 'جاري التحميل...'}</span>
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ color: '#FF6B35', fontSize: '0.85rem', fontWeight: 600 }}>
                🔑 رقم الجهاز: <span style={{ color: '#666', fontFamily: 'monospace', fontSize: '0.7rem' }}>{machineId ? machineId.substring(0, 20) + '...' : 'جاري التحميل...'}</span>
              </Typography>
              {machineId && (
                <Tooltip title="نسخ الرقم الكامل">
                  <IconButton size="small" onClick={() => copyToClipboard(machineId)} sx={{ bgcolor: '#FF6B35', color: 'white', '&:hover': { bgcolor: '#E55A2B' } }}>
                    <CopyIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            {machineId && (
              <Box sx={{ bgcolor: '#E3F2FD', p: 1, borderRadius: 1, border: '1px solid #2196F3' }}>
                <Typography sx={{ color: '#2196F3', fontSize: '0.75rem', fontWeight: 600 }}>
                  🔐 Hash الجهاز: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{generateMachineHash(machineId)}</span>
                </Typography>
                <Typography sx={{ color: '#666', fontSize: '0.7rem', mt: 0.5 }}>
                  (الكود الصحيح يحتوي على هذا الـ Hash)
                </Typography>
              </Box>
            )}
          </Card>

          {/* رسالة المعلومات */}
          <Box sx={{ bgcolor: '#FFF3E0', border: '2px dashed #FF9800', borderRadius: 2.5, p: 2, mb: 2.5 }}>
            <Typography sx={{ color: '#F57C00', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center', mb: 1 }}>
              💡 أرسل رقم الجهاز للمطور للحصول على كود مخصص لجهازك فقط
            </Typography>
            <Typography sx={{ color: '#E65100', fontSize: '0.75rem', textAlign: 'center' }}>
              🔒 الكود مرتبط برقم جهازك ولا يمكن استخدامه على أي جهاز آخر
            </Typography>
          </Box>

          {/* حقل الكود */}
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
                fontWeight: 600,
                '& fieldset': { borderColor: '#FF6B35', borderWidth: 2 },
                '&:hover fieldset': { borderColor: '#E55A2B' },
                '&.Mui-focused fieldset': { borderColor: '#FF6B35', borderWidth: 2 },
              },
            }}
          />

          {/* الأزرار */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => setPaymentView(true)}
              startIcon={<PaymentIcon />}
              sx={{
                background: 'linear-gradient(135deg, #FF6B35 0%, #FF9800 100%)',
                py: 1.3,
                fontSize: '0.95rem',
                fontWeight: 700,
                fontFamily: 'Cairo, Arial',
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(255, 107, 53, 0.4)' },
                transition: 'all 0.3s ease'
              }}
            >
              💳 شراء
            </Button>

            <Button
              fullWidth
              variant="contained"
              onClick={handleActivateWithCode}
              disabled={!activationCode.trim() || loading}
              sx={{
                background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                py: 1.3,
                fontSize: '0.95rem',
                fontWeight: 700,
                fontFamily: 'Cairo, Arial',
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)' },
                '&:disabled': { boxShadow: 'none', transform: 'none' },
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : '✅ تفعيل'}
            </Button>
          </Box>

          {/* الأيقونات السفلية */}
          <Box sx={{ textAlign: 'center', pt: 2, borderTop: '1px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mb: 1 }}>
              <Tooltip title="انستقرام">
                <IconButton sx={{ bgcolor: '#f5f5f5', width: 40, height: 40, transition: 'all 0.3s ease', '&:hover': { bgcolor: 'rgb(225, 48, 108)', color: 'white' } }}>
                  <InstagramIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="واتساب">
                <IconButton sx={{ bgcolor: '#f5f5f5', width: 40, height: 40, transition: 'all 0.3s ease', '&:hover': { bgcolor: '#25D366', color: 'white' } }}>
                  <WhatsAppIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="فيسبوك">
                <IconButton sx={{ bgcolor: '#f5f5f5', width: 40, height: 40, transition: 'all 0.3s ease', '&:hover': { bgcolor: '#1877F2', color: 'white' } }}>
                  <FacebookIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography sx={{ color: '#999', fontSize: '0.75rem', fontWeight: 500 }}>
              © HANOUTY DZ 2025 - جميع الحقوق محفوظة
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Dialog للرسائل */}
      <Dialog 
        open={alertDialog.open} 
        onClose={() => setAlertDialog({ open: false, message: '' })}
        PaperProps={{ sx: { borderRadius: 3, minWidth: 300 } }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, color: '#FF6B35', fontSize: '1.1rem' }}>
          📢 إشعار
        </DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          <Typography sx={{ whiteSpace: 'pre-line', textAlign: 'center', fontSize: '0.95rem', lineHeight: 1.8, color: '#333' }}>
            {alertDialog.message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button 
            onClick={() => setAlertDialog({ open: false, message: '' })} 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF9800 100%)',
              px: 3,
              fontWeight: 700,
              borderRadius: 1.5,
              textTransform: 'none',
              fontSize: '0.95rem'
            }}
          >
            حسناً
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
