// src/renderer/App.tsx - ✅ ULTIMATE PRODUCTION VERSION v2.0 - TRIAL PROTECTION COMPLETE
import React, { useState, useEffect, useRef } from 'react';
import { 
  ThemeProvider, createTheme, 
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,
  Box, CircularProgress 
} from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './Login';
import Activation from './Activation';
import Dashboard from './Dashboard';
import PinLock from './PinLock';
import WarningIcon from '@mui/icons-material/Warning';


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


type AppState = 'login' | 'activation' | 'dashboard' | 'locked' | 'trial-expired';


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
      console.error('❌ Error notifying Electron:', error);
    }
  }
};


function App() {
  const [currentState, setCurrentState] = useState<AppState>('login');
  const [isLocked, setIsLocked] = useState(false);
  const [loginKey, setLoginKey] = useState(0);
const trialCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // ✅ Dialog States
  const [alertDialog, setAlertDialog] = useState({ 
open: false, 
message: '', 
onConfirm: null as (() => void) | null,
    icon: 'warning' as 'warning' | 'success' | 'error'
});

  const [confirmDialog, setConfirmDialog] = useState({ 
open: false, 
message: '', 
onConfirm: null as (() => void) | null 
});


  // ✅ Trial Expired Dialog
  const [trialExpiredDialog, setTrialExpiredDialog] = useState({ 
    open: false,
    countdown: 3
  });


  // ============================================
  // 🔹 Show Message
  // ============================================
  const showMessage = (msg: string, icon: 'warning' | 'success' | 'error' = 'warning') => {
    setAlertDialog({ open: true, message: msg, onConfirm: null, icon });
  };


  // ============================================
  // 🔹 Show Confirm
  // ============================================
  const showConfirm = (msg: string, onConfirm: () => void) => {
    setConfirmDialog({ open: true, message: msg, onConfirm });
  };


  // ============================================
  // 🔹 Trial Expired Handler
  // ============================================
  const handleTrialExpired = () => {
    console.log('⏰ Trial expired event received!');
    
    // تنظيف الفترات الزمنية
    if (trialCheckIntervalRef.current) {
      clearInterval(trialCheckIntervalRef.current);
    }


    // عرض Dialog الانتهاء
    setTrialExpiredDialog({ open: true, countdown: 3 });


    // حذف البيانات
    localStorage.removeItem('isTrial');
    localStorage.removeItem('trialStartDate');
    localStorage.removeItem('trialDays');
    localStorage.removeItem('activationType');
    localStorage.removeItem('isActivated');


    // الإغلاق التلقائي بعد 3 ثواني
    let countdown = 3;
    const countdownInterval = setInterval(() => {
      countdown--;
      setTrialExpiredDialog({ open: true, countdown: Math.max(0, countdown) });
      
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        if ((window as any).electron?.closeApp) {
          (window as any).electron.closeApp();
        } else if ((window as any).electron?.quitApp) {
          (window as any).electron.quitApp();
        } else {
          window.close();
        }
      }
    }, 1000);
  };


  // ============================================
  // 🔹 Initialize Effects
  // ============================================
  useEffect(() => {
console.log('🚀 App initialized');
    
    checkTimeManipulation();
    checkActivationStatus();


    // ✅ استماع لحدث انتهاء التجريب من Electron
    const unsubscribe = (window as any).electron?.onTrialExpired?.(() => {
      handleTrialExpired();
    });


    // Keyboard shortcut
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        lockScreen();
      }
    };


    window.addEventListener('keydown', handleKeyPress);

    return () => {
window.removeEventListener('keydown', handleKeyPress);
if (unsubscribe) unsubscribe();
    };
  }, []);


  // ============================================
  // 🔹 Setup Intervals
  // ============================================
  useEffect(() => {
// التحقق من التجريب كل ساعة
    const trialInterval = setInterval(() => {
      checkTrialExpiry();
    }, 1000 * 60 * 60);


    // التحقق من التاريخ كل 5 دقائق
    const timeInterval = setInterval(() => {
      checkTimeManipulation();
    }, 1000 * 60 * 5);


    // Heartbeat كل دقيقة
    const heartbeatInterval = setInterval(() => {
      sendHeartbeat();
    }, 1000 * 60);


    // التحقق من الإيقاف كل 5 دقائق
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


  // ============================================
  // 🔹 Send Heartbeat
  // ============================================
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


        console.log('💓 Heartbeat sent');
      }
    } catch (error) {
      console.error('❌ Heartbeat error:', error);
    }
  };


  // ============================================
  // 🔹 Check Deactivation
  // ============================================
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
          showMessage('⚠️ تم إيقاف التفعيل من قبل المطور!\n\nيرجى التواصل للحصول على تفعيل جديد.', 'error');
          setTimeout(() => {
            setCurrentState('login');
            setLoginKey(prev => prev + 1);
            notifyElectron('minimize-window');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('❌ Status check error:', error);
    }
  };


  // ============================================
  // 🔹 Check Time Manipulation
  // ============================================
  const checkTimeManipulation = async () => {
    if ((window as any).electron && (window as any).electron.checkTimeManipulation) {
      const result = await (window as any).electron.checkTimeManipulation();
      
      if (result.manipulated) {
        showMessage('⚠️ تم اكتشاف تلاعب في تاريخ النظام!\n\nالبرنامج محمي ضد هذا النوع من الاختراق.\n\nسيتم إيقاف البرنامج.', 'error');
        
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


  // ============================================
  // 🔹 Check Trial Expiry
  // ============================================
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


          console.log(`📊 Trial Status: ${daysLeft} days left`);


          if (daysLeft <= 0) {
            console.log('⏰ Trial expired!');
            handleTrialExpired();
          } else if (daysLeft <= 3) {
            const lastNotification = localStorage.getItem('lastTrialNotification');
            const today = new Date().toDateString();
            
            if (lastNotification !== today) {
              showMessage(`⏰ تنبيه: متبقي ${daysLeft} ${daysLeft === 1 ? 'يوم' : 'أيام'} على انتهاء الفترة التجريبية!`, 'warning');
              localStorage.setItem('lastTrialNotification', today);
            }
          }
        }
      }
    }
  };


  // ============================================
  // 🔹 Check Activation Status ✅ مع التعديل
  // ============================================
  const checkActivationStatus = async () => {
    if ((window as any).electron && (window as any).electron.loadActivation) {
      const result = await (window as any).electron.loadActivation();
      
      if (result.success && result.data) {
        const { isActivated, activationType, isTrial, trialStartDate, trialDays, activationCode } = result.data;
        
        if (isActivated) {
// ✅ التحقق من Trial
          if (isTrial && trialStartDate) {
            const startDate = new Date(trialStartDate);
            const currentDate = new Date();
            const daysPassed = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            const daysLeft = (trialDays || 5) - daysPassed;
            
// ✅ إذا كانت Trial منتهية
            if (daysLeft <= 0) {
              console.log('⏰ Trial expired - forcing Activation page');
            
              // حذف كل البيانات
              if ((window as any).electron.deleteActivation) {
                await (window as any).electron.deleteActivation();
              }
              localStorage.clear();
            
              // ✅ الذهاب مباشرة لصفحة Activation
              setCurrentState('activation');
              notifyElectron('minimize-window');
              return;
            }
            
            // ✅ إذا كانت Trial صحيحة
            localStorage.setItem('isActivated', 'true');
            localStorage.setItem('isTrial', 'true');
            localStorage.setItem('trialStartDate', trialStartDate);
            localStorage.setItem('trialDays', trialDays.toString());
            localStorage.setItem('activationCode', activationCode || '');
            console.log(`✅ Trial activated: ${daysLeft} days left`);
            setCurrentState('login');
            notifyElectron('minimize-window');
            return;
          }
          
          // ✅ التفعيل الكامل
          if (activationType === 'full') {
            localStorage.setItem('isActivated', 'true');
            localStorage.setItem('activationType', 'full');
            localStorage.setItem('activationCode', activationCode || '');
console.log('✅ Full activation found');
            setCurrentState('login');
            notifyElectron('minimize-window');
            return;
          }
        }
      }
    }


    // ✅ إذا لم يكن هناك تفعيل أو Trial
    setCurrentState('login');
    notifyElectron('minimize-window');
  };


  // ============================================
  // 🔹 Handlers
  // ============================================
  const handleLogin = () => {
    const isActivated = localStorage.getItem('isActivated');
    const isTrial = localStorage.getItem('isTrial');
const activationType = localStorage.getItem('activationType');


    // ✅ فحص التجريبية مرة أخرى قبل الدخول
    if (isTrial === 'true') {
      const trialStartDate = localStorage.getItem('trialStartDate');
      const trialDays = parseInt(localStorage.getItem('trialDays') || '5', 10);
      
      if (trialStartDate) {
        const startDate = new Date(trialStartDate);
        const currentDate = new Date();
        const daysPassed = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const daysLeft = trialDays - daysPassed;
        
        // ✅ إذا انتهت التجريبية
        if (daysLeft <= 0) {
          localStorage.clear();
          setCurrentState('activation');
          return;
        }
      }
    }


    if ((isActivated === 'true' || isTrial === 'true') && activationType === 'full') {
      setCurrentState('dashboard');
      notifyElectron('maximize-window');
    } else if (isTrial === 'true') {
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


  // ============================================
  // 🔹 Trial Expired Screen
  // ============================================
  if (currentState === 'trial-expired' || trialExpiredDialog.open) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            width: '100%',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <Box
            sx={{
              textAlign: 'center',
              backgroundColor: '#fff',
              borderRadius: 4,
              padding: 4,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              maxWidth: 500,
            }}
          >
            <WarningIcon sx={{ fontSize: 80, color: '#e74c3c', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2c3e50', mb: 2 }}>
              ⏰ انتهت النسخة التجريبية
            </Typography>
            <Typography variant="body1" sx={{ color: '#7f8c8d', mb: 3, lineHeight: 1.8 }}>
              شكراً لاستخدام HANOUTY DZ
              <br />
              <br />
              يرجى شراء النسخة الكاملة للاستمرار في استخدام البرنامج
              <br />
              <br />
              سيتم إغلاق البرنامج بعد {trialExpiredDialog.countdown} ثوانٍ
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress size={30} sx={{ color: '#e74c3c' }} />
              <Typography variant="h6" sx={{ color: '#e74c3c', fontWeight: 'bold' }}>
                {trialExpiredDialog.countdown}
              </Typography>
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }


  // ============================================
  // 🔹 Locked Screen
  // ============================================
  if (isLocked) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <PinLock onUnlock={unlockScreen} />
      </ThemeProvider>
    );
  }


  // ============================================
  // 🔹 Main App
  // ============================================
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {currentState === 'login' && (
        <Login 
          key={loginKey}
          onLogin={handleLogin} 
        />
      )}

      {currentState === 'activation' && (
<Activation onActivate={handleActivation} />
      )}
      
      {currentState === 'dashboard' && (
<Dashboard onLogout={handleLogout} onLock={lockScreen} />
      )}


      {/* ✅ Alert Dialog */}
      <Dialog 
        open={alertDialog.open} 
        onClose={() => setAlertDialog({ ...alertDialog, open: false })}
        PaperProps={{
          sx: { borderRadius: 3, minWidth: 300 }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, color: '#FF6B35' }}>
          إشعار
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
          {alertDialog.icon === 'warning' && (
            <WarningIcon sx={{ fontSize: 40, color: '#f39c12', mb: 1 }} />
          )}
          {alertDialog.icon === 'error' && (
            <WarningIcon sx={{ fontSize: 40, color: '#e74c3c', mb: 1 }} />
          )}
          <Typography sx={{ whiteSpace: 'pre-line', textAlign: 'center', fontSize: '1rem', lineHeight: 1.8 }}>
            {alertDialog.message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button 
            onClick={() => setAlertDialog({ ...alertDialog, open: false })} 
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
