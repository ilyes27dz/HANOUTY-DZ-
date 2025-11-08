import React, { useState } from 'react';
import { 
Box, Typography, IconButton, Button, Dialog 
} from '@mui/material';
import { 
  Close as CloseIcon,
    ContentCopy as CopyIcon,
  WhatsApp as WhatsAppIcon,
} from '@mui/icons-material';
import { Snackbar, Alert } from '@mui/material';

interface PaymentInfoProps {
  machineId: string;
  computerName: string;
  onClose: () => void;
}

export default function PaymentInfo({ machineId, computerName, onClose }: PaymentInfoProps) {
const [copied, setCopied] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(`✅ تم نسخ ${label}`);
setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppClick = () => {
    const message = `مرحبا، أريد تفعيل برنامج HANOUTY DZ\n\nمعلومات جهازي:\nالكمبيوتر: ${computerName}\nرقم الجهاز: ${machineId}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/905403803084?text=${encodedMessage}`, '_blank');
  };

  return (
    <Dialog 
      open={true} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ 
        sx: { 
          borderRadius: '12px',
          direction: 'rtl'
        } 
      }}
>
      {/* الشريط العلوي - الاثنين معاً */}
      <Box sx={{ 
        bgcolor: '#ff6b35', 
        color: '#fff', 
        p: 2.5, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(255, 107, 53, 0.2)'
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.1rem' }}>
💰           معلومات الدفع والتفعيل
        </Typography>
        <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', direction: 'ltr', textAlign: 'right' }}>
          💰 Informations de paiement et activation
        </Typography>
</Box>
        <IconButton onClick={onClose} sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
          <CloseIcon sx={{ fontSize: 24 }} />
        </IconButton>
      </Box>

      {/* المحتوى */}
      <Box sx={{ p: 3, maxHeight: '70vh', overflowY: 'auto' }}>

        {/* معلومات الجهاز */}
        <Box sx={{ mb: 2.5 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a1a', mb: 1 }}>
                🖥️ معلومات جهازك / Votre ordinateur
              </Typography>
            
          {/* اسم الكمبيوتر */}
          <Box sx={{ mb: 1.5 }}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#999', mb: 0.5 }}>
              الكمبيوتر / Nom
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ color: '#ff6b35', fontSize: '1rem', fontWeight: 700, fontFamily: 'monospace', p: 1, bgcolor: '#fff9f5', borderRadius: '6px', border: '1px solid #ffe0d0', flex: 1 }}>
                {computerName}
              </Typography>
              <IconButton 
                size="small"
                onClick={() => copyToClipboard(computerName, 'الكمبيوتر')}
                sx={{ color: '#ff6b35', p: 0.5 }}
              >
                <CopyIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
                      </Box>

          {/* رقم الجهاز */}
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#999', mb: 0.5 }}>
                رقم الجهاز / Machine ID
              </Typography>
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ 
                flex: 1, 
                p: 1.2, 
                bgcolor: '#2c3e50', 
                color: '#00ff00', 
                fontFamily: 'monospace',
                fontSize: '0.95rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: '2px solid #00ff00',
                wordBreak: 'break-all',
                textShadow: '0 0 6px rgba(0, 255, 0, 0.5)',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 0 10px rgba(0, 255, 0, 0.7)',
                }
              }}>
                {machineId}
              </Box>
              <IconButton 
                size="small"
                onClick={() => copyToClipboard(machineId, 'الجهاز')}
                sx={{ color: '#ff6b35', p: 0.5 }}
              >
                <CopyIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
            </Box>
          </Box>

{/* السعر - أخضر */}
        <Box sx={{ 
          p: 2.5, 
          mb: 2.5, 
          bgcolor: '#27ae60',
          color: '#fff', 
          textAlign: 'center', 
          borderRadius: '8px',
          border: '2px solid #1e8449',
        }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1.3rem', mb: 0.5 }}>
            8,000 دج
          </Typography>
        <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
            ✅ مدى الحياة / À vie
          </Typography>
            </Box>

        {/* البريد الجزائري */}
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a1a', mb: 0.8 }}>
                🏦 البريد الجزائري / Poste Algérienne
              </Typography>
<Box sx={{ mb: 1 }}>
            <Typography sx={{ fontSize: '0.75rem', color: '#999', fontWeight: 600, mb: 0.3 }}>
              حساب / Compte CCP
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Typography sx={{ color: '#1a1a1a', fontSize: '1rem', fontWeight: 700, fontFamily: 'monospace', flex: 1 }}>
                0024747431
              </Typography>
<IconButton size="small" onClick={() => copyToClipboard('0024747431', 'CCP')} sx={{ color: '#ff6b35', p: 0.5 }}>
                <CopyIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Box>
<Box>
            <Typography sx={{ fontSize: '0.75rem', color: '#999', fontWeight: 600, mb: 0.3 }}>
المفتاح / Clé
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Typography sx={{ color: '#1a1a1a', fontSize: '1rem', fontWeight: 700, fontFamily: 'monospace', flex: 1 }}>
                64
              </Typography>
              <IconButton                 size="small"                 onClick={() => copyToClipboard('64', 'Clé')}                 sx={{ color: '#ff6b35', p: 0.5 }}              >
                <CopyIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
</Box>
        </Box>

        {/* BARIDIMOB */}
        <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a1a', mb: 0.8 }}>
            💳 BARIDIMOB
          </Typography>
          <Box sx={{ mb: 1 }}>
            <Typography sx={{ fontSize: '0.75rem', color: '#999', fontWeight: 600, mb: 0.3 }}>
              RIB
            </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Typography sx={{ color: '#1a1a1a', fontSize: '0.9rem', fontWeight: 700, fontFamily: 'monospace', flex: 1, wordBreak: 'break-all' }}>
                00799999002474743164
              </Typography>
              <IconButton                 size="small"                 onClick={() => copyToClipboard('00799999002474743164', 'RIB')}                 sx={{ color: '#ff6b35', p: 0.5 }}              >
                <CopyIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
                      </Box>
        <Box>
            <Typography sx={{ fontSize: '0.75rem', color: '#999', fontWeight: 600, mb: 0.3 }}>
              البريد / Email
              </Typography>
<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Typography sx={{ color: '#1a1a1a', fontSize: '0.9rem', fontFamily: 'monospace', flex: 1 }}>
                ilyes.negh@gmail.com
              </Typography>
<IconButton size="small" onClick={() => copyToClipboard('ilyes.negh@gmail.com', 'Email')} sx={{ color: '#ff6b35', p: 0.5 }}>
                <CopyIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* الهاتف */}
        <Box sx={{ mb: 2.5 }}>
          <Typography sx={{ fontSize: '0.75rem', color: '#999', fontWeight: 600, mb: 0.5 }}>
            ☎️ الهاتف / Téléphone
          </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Typography sx={{ color: '#1a1a1a', fontSize: '1rem', fontWeight: 700, flex: 1 }}>
                05.42.03.80.84
                            </Typography>
              <IconButton size="small"                 onClick={() => copyToClipboard('05.42.03.80.84', 'Tél')} sx={{ color: '#ff6b35', p: 0.5 }}>
              <CopyIcon sx={{ fontSize: 16 }} />
            </IconButton>
            </Box>
          </Box>

{/* خطوات الدفع */}
        <Box sx={{ p: 2, bgcolor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a1a', mb: 1 }}>
            📋 الخطوات / Étapes:
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', color: '#333', lineHeight: 1.6 }}>
            1️⃣ ادفع / Payez<br/>
            2️⃣ صور الإيصال / Prenez une photo<br/>
            3️⃣ أرسل عبر واتساب / Envoyez via WhatsApp<br/>
            4️⃣ ستتلقى الكود / Vous recevrez le code
          </Typography>
        </Box>

      </Box>

      {/* الزر السفلي - واتساب */}
      <Box sx={{ 
        p: 2, 
        bgcolor: '#fff',
        borderTop: '1px solid #e0e0e0',
        display: 'flex',
        gap: 1
      }}>
        <Button
          startIcon={<WhatsAppIcon />}
          onClick={handleWhatsAppClick}
          fullWidth
          variant="contained"
          sx={{
            bgcolor: '#25d366',
            color: '#fff',
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.95rem',
            '&:hover': { bgcolor: '#1da851' },
          }}
        >
          📲 أرسل الإيصال / Envoyer le reçu
        </Button>
    </Box>

      {/* Snackbar */}
      <Snackbar open={copied} autoHideDuration={2000} onClose={() => setCopied(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" sx={{ fontFamily: 'Cairo, Arial', fontWeight: 600 }}>
          {copiedText}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
