import React from 'react';
import { Box, Typography, IconButton, Divider, Button, Paper } from '@mui/material';
import { 
  Close as CloseIcon,
  AccountBalance as BankIcon,
  QrCode2 as QrIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Facebook as FacebookIcon,
  ContentCopy as CopyIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

interface PaymentInfoProps {
  machineId: string;
  computerName: string;
  onClose: () => void;
}

export default function PaymentInfo({ machineId, computerName, onClose }: PaymentInfoProps) {
  
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`✅ تم نسخ ${label}!`);
  };

  return (
    <Box sx={{ p: 3, position: 'relative' }}>
      {/* زر الإغلاق */}
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          bgcolor: 'rgba(244, 67, 54, 0.2)',
          '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.3)' },
        }}
      >
        <CloseIcon sx={{ color: '#F44336' }} />
      </IconButton>

      {/* العنوان */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#FFD54F', fontWeight: 900, fontFamily: 'Cairo, Arial', mb: 1 }}>
          معلومات الدفع
        </Typography>
        <Typography variant="body2" sx={{ color: '#B0BEC5', fontFamily: 'Cairo, Arial' }}>
          اختر طريقة الدفع المناسبة لك
        </Typography>
      </Box>

      {/* طرق الدفع */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        {/* 🏦 الدفع عبر CCP - بريدي الجزائر */}
        <Paper
          elevation={4}
          sx={{
            p: 3,
            bgcolor: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(3, 169, 244, 0.05) 100%)',
            border: '2px solid rgba(33, 150, 243, 0.3)',
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: '12px',
                bgcolor: 'rgba(33, 150, 243, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
              }}
            >
              <BankIcon sx={{ color: '#2196F3', fontSize: 28 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ color: '#2196F3', fontWeight: 900, fontSize: '1.2rem', fontFamily: 'Cairo, Arial' }}>
                الدفع عبر CCP
              </Typography>
              <Typography sx={{ color: '#B0BEC5', fontSize: '0.85rem', fontFamily: 'Cairo, Arial' }}>
                بريدي الجزائر - Algérie Poste
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2, borderColor: 'rgba(33, 150, 243, 0.2)' }} />

          <Box sx={{ bgcolor: 'rgba(255, 193, 7, 0.1)', p: 2, borderRadius: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography sx={{ color: '#FFD54F', fontSize: '0.9rem', fontFamily: 'Cairo, Arial', fontWeight: 700 }}>
                رقم الحساب (CCP):
              </Typography>
              <IconButton 
                size="small"
                onClick={() => copyToClipboard('0024747431', 'رقم الحساب')}
                sx={{ bgcolor: 'rgba(255, 152, 0, 0.2)', '&:hover': { bgcolor: 'rgba(255, 152, 0, 0.3)' } }}
              >
                <CopyIcon sx={{ fontSize: 16, color: '#FF9800' }} />
              </IconButton>
            </Box>
            <Typography sx={{ color: '#FFC107', fontSize: '1.3rem', fontWeight: 900, fontFamily: 'monospace', textAlign: 'center' }}>
              0024747431
            </Typography>
          </Box>

          <Box sx={{ bgcolor: 'rgba(255, 193, 7, 0.1)', p: 2, borderRadius: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography sx={{ color: '#FFD54F', fontSize: '0.9rem', fontFamily: 'Cairo, Arial', fontWeight: 700 }}>
                المفتاح (Clé):
              </Typography>
              <IconButton 
                size="small"
                onClick={() => copyToClipboard('64', 'المفتاح')}
                sx={{ bgcolor: 'rgba(255, 152, 0, 0.2)', '&:hover': { bgcolor: 'rgba(255, 152, 0, 0.3)' } }}
              >
                <CopyIcon sx={{ fontSize: 16, color: '#FF9800' }} />
              </IconButton>
            </Box>
            <Typography sx={{ color: '#FFC107', fontSize: '1.3rem', fontWeight: 900, fontFamily: 'monospace', textAlign: 'center' }}>
              64
            </Typography>
          </Box>

          <Typography sx={{ color: '#B0BEC5', fontSize: '0.8rem', fontFamily: 'Cairo, Arial', textAlign: 'center' }}>
            العنوان: RAS EL OUED
          </Typography>
        </Paper>

        {/* 💳 الدفع عبر BARIDIMOB */}
        <Paper
          elevation={4}
          sx={{
            p: 3,
            bgcolor: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(139, 195, 74, 0.05) 100%)',
            border: '2px solid rgba(76, 175, 80, 0.3)',
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: '12px',
                bgcolor: 'rgba(76, 175, 80, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
              }}
            >
              <PhoneIcon sx={{ color: '#4CAF50', fontSize: 28 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ color: '#4CAF50', fontWeight: 900, fontSize: '1.2rem', fontFamily: 'Cairo, Arial' }}>
                الدفع عبر BARIDIMOB
              </Typography>
              <Typography sx={{ color: '#B0BEC5', fontSize: '0.85rem', fontFamily: 'Cairo, Arial' }}>
                تحويل عبر الهاتف
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2, borderColor: 'rgba(76, 175, 80, 0.2)' }} />

          <Box sx={{ bgcolor: 'rgba(255, 193, 7, 0.1)', p: 2, borderRadius: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography sx={{ color: '#FFD54F', fontSize: '0.9rem', fontFamily: 'Cairo, Arial', fontWeight: 700 }}>
                RIB:
              </Typography>
              <IconButton 
                size="small"
                onClick={() => copyToClipboard('00799999002474743164', 'RIB')}
                sx={{ bgcolor: 'rgba(255, 152, 0, 0.2)', '&:hover': { bgcolor: 'rgba(255, 152, 0, 0.3)' } }}
              >
                <CopyIcon sx={{ fontSize: 16, color: '#FF9800' }} />
              </IconButton>
            </Box>
            <Typography sx={{ color: '#FFC107', fontSize: '1.1rem', fontWeight: 900, fontFamily: 'monospace', textAlign: 'center', wordBreak: 'break-all' }}>
              00799999002474743164
            </Typography>
          </Box>

          <Box sx={{ bgcolor: 'rgba(255, 193, 7, 0.1)', p: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography sx={{ color: '#FFD54F', fontSize: '0.9rem', fontFamily: 'Cairo, Arial', fontWeight: 700 }}>
                البريد الإلكتروني:
              </Typography>
              <IconButton 
                size="small"
                onClick={() => copyToClipboard('YourEmail@gmail.com', 'البريد الإلكتروني')}
                sx={{ bgcolor: 'rgba(255, 152, 0, 0.2)', '&:hover': { bgcolor: 'rgba(255, 152, 0, 0.3)' } }}
              >
                <CopyIcon sx={{ fontSize: 16, color: '#FF9800' }} />
              </IconButton>
            </Box>
            <Typography sx={{ color: '#FFC107', fontSize: '1rem', fontWeight: 700, fontFamily: 'monospace', textAlign: 'center' }}>
              YourEmail@gmail.com
            </Typography>
          </Box>
        </Paper>

        {/* ⚠️ تحذير مهم */}
        <Paper
          elevation={4}
          sx={{
            p: 2.5,
            bgcolor: 'rgba(244, 67, 54, 0.1)',
            border: '2px solid rgba(244, 67, 54, 0.3)',
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <WarningIcon sx={{ color: '#F44336', fontSize: 32, mt: 0.5 }} />
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ color: '#F44336', fontWeight: 900, fontSize: '1rem', fontFamily: 'Cairo, Arial', mb: 1 }}>
                ⚠️ مهم جداً - بعد الدفع:
              </Typography>
              <Typography sx={{ color: '#FFCDD2', fontSize: '0.85rem', fontFamily: 'Cairo, Arial', lineHeight: 1.8 }}>
                يرجى إرسال نسخة من إيصال الدفع عبر البريد الإلكتروني أو صفحاتنا الرسمية على مواقع التواصل الاجتماعي مع ذكر:
                <br />
                • <strong>رقم الجهاز:</strong> {machineId}
                <br />
                • <strong>اسم الجهاز:</strong> {computerName}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* معلومات التواصل */}
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography sx={{ color: '#FFD54F', fontSize: '0.95rem', fontFamily: 'Cairo, Arial', fontWeight: 700, mb: 2 }}>
            📞 للاستفسار والتواصل:
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ color: '#B0BEC5', fontSize: '0.75rem', fontFamily: 'Cairo, Arial', mb: 0.5 }}>
                الهاتف / واتساب
              </Typography>
              <Button
                variant="outlined"
                startIcon={<PhoneIcon />}
                onClick={() => copyToClipboard('07.74.36.64.70', 'رقم الهاتف')}
                sx={{
                  color: '#4CAF50',
                  borderColor: 'rgba(76, 175, 80, 0.5)',
                  fontFamily: 'Cairo, Arial',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  '&:hover': {
                    borderColor: '#4CAF50',
                    bgcolor: 'rgba(76, 175, 80, 0.1)',
                  },
                }}
              >
                05.42.03.80.84
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <Typography sx={{ color: '#B0BEC5', fontSize: '0.75rem', fontFamily: 'Cairo, Arial', mb: 0.5 }}>
                البريد الإلكتروني
              </Typography>
              <Button
                variant="outlined"
                startIcon={<EmailIcon />}
                onClick={() => copyToClipboard('YourEmail@gmail.com', 'البريد الإلكتروني')}
                sx={{
                  color: '#2196F3',
                  borderColor: 'rgba(33, 150, 243, 0.5)',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  '&:hover': {
                    borderColor: '#2196F3',
                    bgcolor: 'rgba(33, 150, 243, 0.1)',
                  },
                }}
              >
                ilyes.negh@gmail.com
              </Button>
            </Box>
          </Box>

          <Typography sx={{ color: '#78909C', fontSize: '0.75rem', fontFamily: 'Cairo, Arial' }}>
            Facebook: Your Page Name
          </Typography>
        </Box>

      </Box>
    </Box>
  );
}
