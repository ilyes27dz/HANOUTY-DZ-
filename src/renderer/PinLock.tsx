import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Backspace as BackspaceIcon, Lock as LockIcon } from '@mui/icons-material';

interface PinLockProps {
  onUnlock: () => void;
}

export default function PinLock({ onUnlock }: PinLockProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const correctPin = '1234';

  useEffect(() => {
    if (pin.length === 4) {
      if (pin === correctPin) {
        onUnlock();
      } else {
        setError(true);
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 800);
      }
    }
  }, [pin, onUnlock, correctPin]);

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      setPin(pin + num);
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
    setError(false);
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
          width: 400,
          bgcolor: 'rgba(18, 30, 40, 0.95)',
          borderRadius: 4,
          p: 4,
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 152, 0, 0.2)',
          boxShadow: '0 8px 32px 0 rgba(255, 152, 0, 0.2)',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 2,
              borderRadius: '20px',
              background: error 
                ? 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)'
                : 'linear-gradient(135deg, #FF9800 0%, #FF6F00 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: error
                ? '0 8px 20px rgba(244, 67, 54, 0.4)'
                : '0 8px 20px rgba(255, 152, 0, 0.4)',
              transition: 'all 0.3s',
              animation: error ? 'shake 0.5s' : 'none',
              '@keyframes shake': {
                '0%, 100%': { transform: 'translateX(0)' },
                '25%': { transform: 'translateX(-10px)' },
                '75%': { transform: 'translateX(10px)' },
              },
            }}
          >
            <LockIcon sx={{ fontSize: 48, color: '#fff' }} />
          </Box>
          
          <Typography variant="h5" sx={{ color: '#FFD54F', fontWeight: 900, fontFamily: 'Cairo, Arial', mb: 1 }}>
            الشاشة مقفولة 🔒
          </Typography>
          
          <Typography variant="body2" sx={{ color: '#B0BEC5', fontSize: '0.9rem' }}>
            أدخل رمز PIN للفتح
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
          {[0, 1, 2, 3].map((index) => (
            <Box
              key={index}
              sx={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                bgcolor: pin.length > index 
                  ? (error ? '#F44336' : '#FF9800')
                  : 'rgba(255, 152, 0, 0.2)',
                border: '2px solid',
                borderColor: pin.length > index
                  ? (error ? '#F44336' : '#FF9800')
                  : 'rgba(255, 152, 0, 0.3)',
                transition: 'all 0.3s',
                boxShadow: pin.length > index
                  ? (error 
                      ? '0 0 10px rgba(244, 67, 54, 0.5)'
                      : '0 0 10px rgba(255, 152, 0, 0.5)')
                  : 'none',
              }}
            />
          ))}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 2 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <Box
              key={num}
              onClick={() => handleNumberClick(num.toString())}
              sx={{
                height: 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(255, 152, 0, 0.1)',
                border: '1px solid rgba(255, 152, 0, 0.3)',
                borderRadius: 2,
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#FFD54F',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'rgba(255, 152, 0, 0.2)',
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)',
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

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          <Box
            onClick={handleClear}
            sx={{
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(244, 67, 54, 0.1)',
              border: '1px solid rgba(244, 67, 54, 0.3)',
              borderRadius: 2,
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#F44336',
              cursor: 'pointer',
              fontFamily: 'Cairo, Arial',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: 'rgba(244, 67, 54, 0.2)',
                transform: 'scale(1.05)',
              },
            }}
          >
            مسح
          </Box>

          <Box
            onClick={() => handleNumberClick('0')}
            sx={{
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255, 152, 0, 0.1)',
              border: '1px solid rgba(255, 152, 0, 0.3)',
              borderRadius: 2,
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#FFD54F',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: 'rgba(255, 152, 0, 0.2)',
                transform: 'scale(1.05)',
                boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)',
              },
              '&:active': {
                transform: 'scale(0.95)',
              },
            }}
          >
            0
          </Box>

          <Box
            onClick={handleBackspace}
            sx={{
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(33, 150, 243, 0.1)',
              border: '1px solid rgba(33, 150, 243, 0.3)',
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: 'rgba(33, 150, 243, 0.2)',
                transform: 'scale(1.05)',
              },
            }}
          >
            <BackspaceIcon sx={{ color: '#2196F3', fontSize: 28 }} />
          </Box>
        </Box>

        <Typography sx={{ textAlign: 'center', color: '#78909C', fontSize: '0.75rem', fontFamily: 'Cairo, Arial', mt: 3 }}>
          💡 الكود الافتراضي: 1234
        </Typography>
      </Paper>
    </Box>
  );
}
