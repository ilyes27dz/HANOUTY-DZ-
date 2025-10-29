// src/renderer/App.tsx - ✅ النسخة النهائية مع Dialog
import React, { useState, useEffect } from 'react';
import { 
  ThemeProvider, createTheme, 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography 
} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './Login';
import Activation from './Activation';
import Dashboard from './Dashboard';
import PinLock from './PinLock';

const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' && 
    (args[0].includes('out-of-range value') || 
     args[0].includes('validateDOMNesting'))
  ) {
    return;
  }
  originalConsoleError(...args);
};

const theme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Cairo, Arial, sans-serif',
  },
});

type AppState = 'login' | 'activation' | 'dashboard' | 'locked';

const notifyElectron = (channel: string) => {
  if (typeof window !== 'undefined' && (window as any).electron) {
    try {
      if (channel === 'maximize-window') {
        (window as any).electron.maximizeWindow();
      } else if (channel === 'minimize-window') {
        (window as any).electron.minimizeWindow();
      } else if (channel === 'logout') {
        (window as any).electron.logout();
      }
    } catch (error) {
      console.error('Error notifying Electron:', error);
    }
  }
};

function App() {
  const [currentState, setCurrentState] = useState<AppState>('login');
  const [isLocked, setIsLocked] = useState(false);
  const [loginKey, setLoginKey] = useState(0);
  
  // ✅ Dialog State
  const [alertDialog, setAlertDialog] = useState({ open: false, message: '', onConfirm: null as (() => void) | null });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, message: '', onConfirm: null as (() => void) | null });

  // ✅ دالة عرض رسالة
  const showMessage = (msg: string) => {
    setAlertDialog({ open: true, message: msg, onConfirm: null });
  };

  // ✅ دالة تأكيد
  const showConfirm = (msg: string, onConfirm: () => void) => {
    setConfirmDialog({ open: true, message: msg, onConfirm });
  };

  useEffect(() => {
    checkTimeManipulation();
    checkActivationStatus();

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        lockScreen();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    const trialInterval = setInterval(() => {
      checkTrialExpiry();
    }, 1000 * 60 * 60);

    const timeInterval = setInterval(() => {
      checkTimeManipulation();
    }, 1000 * 60 * 5);

    const heartbeatInterval = setInterval(() => {
      sendHeartbeat();
    }, 1000 * 60);

    const statusCheckInterval = setInterval(() => {
      checkDeactivation();
    }, 1000 * 60 * 5);

    return () => {
      clearInterval(trialInterval);
      clearInterval(timeInterval);
      clearInterval(heartbeatInterval);
      clearInterval(statusCheckInterval);
    };
  }, []);

  const sendHeartbeat = async () => {
    const activationCode = localStorage.getItem('activationCode');
    
    if (!activationCode) return;

    try {
      if ((window as any).electron && (window as any).electron.getMachineInfo) {
        const machineInfo = await (window as any).electron.getMachineInfo();
        
        await fetch('https://activation-tool.vercel.app/api/codes/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activationCode: activationCode,
            machineId: machineInfo.machineId,
            computerName: machineInfo.computerName
          })
        });
      }
    } catch (error) {
      console.error('Heartbeat error:', error);
    }
  };

  const checkDeactivation = async () => {
    const activationCode = localStorage.getItem('activationCode');
    
    if (!activationCode) return;

    try {
      if ((window as any).electron && (window as any).electron.getMachineInfo) {
        const machineInfo = await (window as any).electron.getMachineInfo();
        
        const response = await fetch('https://activation-tool.vercel.app/api/codes/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activationCode: activationCode,
            machineId: machineInfo.machineId
          })
        });

        const data = await response.json();

        if (data.deactivated || !data.valid) {
          if ((window as any).electron && (window as any).electron.deleteActivation) {
            await (window as any).electron.deleteActivation();
          }
          localStorage.clear();
          showMessage('⚠️ تم إيقاف التفعيل من قبل المطور!\n\nيرجى التواصل للحصول على تفعيل جديد.');
          setTimeout(() => {
            setCurrentState('login');
            setLoginKey(prev => prev + 1);
            notifyElectron('minimize-window');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Status check error:', error);
    }
  };

  const checkTimeManipulation = async () => {
    if ((window as any).electron && (window as any).electron.checkTimeManipulation) {
      const result = await (window as any).electron.checkTimeManipulation();
      
      if (result.manipulated) {
        showMessage('⚠️ تم اكتشاف تلاعب في تاريخ النظام!\n\nالبرنامج محمي ضد هذا النوع من الاختراق.\n\nسيتم إيقاف البرنامج.');
        
        setTimeout(async () => {
          if ((window as any).electron.deleteActivation) {
            await (window as any).electron.deleteActivation();
          }
          localStorage.clear();
          
          if ((window as any).electron.quitApp) {
            (window as any).electron.quitApp();
          }
        }, 3000);
      }
    }
  };

  const checkTrialExpiry = async () => {
    if ((window as any).electron && (window as any).electron.loadActivation) {
      const result = await (window as any).electron.loadActivation();
      
      if (result.success && result.data) {
        const { isTrial, trialStartDate, trialDays } = result.data;
        
        if (isTrial && trialStartDate) {
          const startDate = new Date(trialStartDate);
          const currentDate = new Date();
          const daysPassed = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          const daysLeft = (trialDays || 5) - daysPassed;

          if (daysLeft <= 0) {
            if ((window as any).electron.deleteActivation) {
              await (window as any).electron.deleteActivation();
            }
            localStorage.clear();
            showMessage('⏰ انتهت الفترة التجريبية!\n\nيرجى شراء النسخة الكاملة للاستمرار.');
            setTimeout(() => {
              setCurrentState('login');
              setLoginKey(prev => prev + 1);
              notifyElectron('minimize-window');
            }, 2000);
          } else if (daysLeft <= 3) {
            const lastNotification = localStorage.getItem('lastTrialNotification');
            const today = new Date().toDateString();
            
            if (lastNotification !== today) {
              showMessage(`⏰ تنبيه: متبقي ${daysLeft} ${daysLeft === 1 ? 'يوم' : 'أيام'} على انتهاء الفترة التجريبية!`);
              localStorage.setItem('lastTrialNotification', today);
            }
          }
        }
      }
    }
  };

  const checkActivationStatus = async () => {
    if ((window as any).electron && (window as any).electron.loadActivation) {
      const result = await (window as any).electron.loadActivation();
      
      if (result.success && result.data) {
        const { isActivated, activationType, isTrial, trialStartDate, trialDays, activationCode } = result.data;
        
        if (isActivated) {
          if (isTrial && trialStartDate) {
            const startDate = new Date(trialStartDate);
            const currentDate = new Date();
            const daysPassed = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            const daysLeft = (trialDays || 5) - daysPassed;
            
            if (daysLeft > 0) {
              localStorage.setItem('isActivated', 'true');
              localStorage.setItem('isTrial', 'true');
              localStorage.setItem('trialStartDate', trialStartDate);
              localStorage.setItem('trialDays', trialDays.toString());
              localStorage.setItem('activationCode', activationCode || '');
            } else {
              if ((window as any).electron.deleteActivation) {
                await (window as any).electron.deleteActivation();
              }
              localStorage.clear();
            }
          } else if (activationType === 'full') {
            localStorage.setItem('isActivated', 'true');
            localStorage.setItem('activationType', 'full');
            localStorage.setItem('activationCode', activationCode || '');
          }
        }
      }
    }

    setCurrentState('login');
    notifyElectron('minimize-window');
  };

  const handleLogin = () => {
    const isActivated = localStorage.getItem('isActivated');
    const isTrial = localStorage.getItem('isTrial');

    if (isActivated === 'true' || isTrial === 'true') {
      setCurrentState('dashboard');
      notifyElectron('maximize-window');
    } else {
      setCurrentState('activation');
      notifyElectron('minimize-window');
    }
  };

  const handleActivation = () => {
    notifyElectron('maximize-window');
    setTimeout(() => {
      setCurrentState('dashboard');
    }, 300);
  };

  const handleLogout = () => {
    showConfirm('هل أنت متأكد من تسجيل الخروج؟', () => {
      setCurrentState('login');
      setLoginKey(prev => prev + 1);
      notifyElectron('logout');
    });
  };

  const lockScreen = () => {
    setIsLocked(true);
  };

  const unlockScreen = () => {
    setIsLocked(false);
  };

  if (isLocked) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <PinLock onUnlock={unlockScreen} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {currentState === 'login' && (
        <Login 
          key={loginKey}
          onLogin={handleLogin} 
        />
      )}
      {currentState === 'activation' && <Activation onActivate={handleActivation} />}
      {currentState === 'dashboard' && <Dashboard onLogout={handleLogout} onLock={lockScreen} />}

      {/* ✅ Alert Dialog */}
      <Dialog 
        open={alertDialog.open} 
        onClose={() => setAlertDialog({ open: false, message: '', onConfirm: null })}
        PaperProps={{
          sx: { borderRadius: 3, minWidth: 300 }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, color: '#FF6B35' }}>
          إشعار
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ whiteSpace: 'pre-line', textAlign: 'center', fontSize: '1rem', lineHeight: 1.8 }}>
            {alertDialog.message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button 
            onClick={() => setAlertDialog({ open: false, message: '', onConfirm: null })} 
            variant="contained"
            sx={{ bgcolor: '#FF6B35', px: 4, '&:hover': { bgcolor: '#E55A2B' } }}
          >
            حسناً
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ Confirm Dialog */}
      <Dialog 
        open={confirmDialog.open} 
        onClose={() => setConfirmDialog({ open: false, message: '', onConfirm: null })}
        PaperProps={{
          sx: { borderRadius: 3, minWidth: 350 }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, color: '#FF6B35' }}>
          تأكيد
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ whiteSpace: 'pre-line', textAlign: 'center', fontSize: '1rem', lineHeight: 1.8 }}>
            {confirmDialog.message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2, gap: 1 }}>
          <Button 
            onClick={() => {
              if (confirmDialog.onConfirm) confirmDialog.onConfirm();
              setConfirmDialog({ open: false, message: '', onConfirm: null });
            }}
            variant="contained"
            sx={{ bgcolor: '#FF6B35', '&:hover': { bgcolor: '#E55A2B' } }}
          >
            نعم
          </Button>
          <Button 
            onClick={() => setConfirmDialog({ open: false, message: '', onConfirm: null })}
            variant="outlined"
            sx={{ borderColor: '#FF6B35', color: '#FF6B35' }}
          >
            لا
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}

export default App;
