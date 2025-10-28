// src/renderer/App.tsx - ✅ النسخة النهائية المُصلحة
import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
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
      console.log('✅ Electron notified:', channel);
    } catch (error) {
      console.error('❌ Error notifying Electron:', error);
    }
  }
};

function App() {
  const [currentState, setCurrentState] = useState<AppState>('login');
  const [isLocked, setIsLocked] = useState(false);
  const [loginKey, setLoginKey] = useState(0);

  useEffect(() => {
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
    const interval = setInterval(() => {
      checkTrialExpiry();
    }, 1000 * 60 * 60);

    return () => clearInterval(interval);
  }, []);

  const checkTrialExpiry = () => {
    const isTrial = localStorage.getItem('isTrial');
    const trialStartDate = localStorage.getItem('trialStartDate');
    const trialDays = parseInt(localStorage.getItem('trialDays') || '5', 10);

    if (isTrial === 'true' && trialStartDate) {
      const startDate = new Date(trialStartDate);
      const currentDate = new Date();
      const daysPassed = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysLeft = trialDays - daysPassed;

      if (daysLeft <= 0) {
        localStorage.removeItem('isActivated');
        localStorage.removeItem('isTrial');
        localStorage.removeItem('trialStartDate');
        localStorage.removeItem('trialDays');
        alert('⏰ انتهت الفترة التجريبية!\n\nيرجى شراء النسخة الكاملة للاستمرار.');
        setCurrentState('login');
        setLoginKey(prev => prev + 1);
        notifyElectron('minimize-window');
      } else if (daysLeft <= 3) {
        const lastNotification = localStorage.getItem('lastTrialNotification');
        const today = new Date().toDateString();
        
        if (lastNotification !== today) {
          alert(`⏰ تنبيه: متبقي ${daysLeft} ${daysLeft === 1 ? 'يوم' : 'أيام'} على انتهاء الفترة التجريبية!`);
          localStorage.setItem('lastTrialNotification', today);
        }
      }
    }
  };

  const checkActivationStatus = () => {
    const isActivated = localStorage.getItem('isActivated');
    const isTrial = localStorage.getItem('isTrial');
    const trialStartDate = localStorage.getItem('trialStartDate');
    const trialDays = parseInt(localStorage.getItem('trialDays') || '5', 10);

    if (isTrial === 'true' && trialStartDate) {
      const startDate = new Date(trialStartDate);
      const currentDate = new Date();
      const daysPassed = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysPassed >= trialDays) {
        localStorage.removeItem('isActivated');
        localStorage.removeItem('isTrial');
        localStorage.removeItem('trialStartDate');
        localStorage.removeItem('trialDays');
        setCurrentState('login');
        notifyElectron('minimize-window');
        return;
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
    console.log('🎉 Activation complete, transitioning to dashboard...');
    
    // ✅ تكبير النافذة
    notifyElectron('maximize-window');
    
    // ✅ الانتقال للداشبورد بعد تأخير صغير
    setTimeout(() => {
      setCurrentState('dashboard');
    }, 300);
  };

  const handleLogout = () => {
    if (window.confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      setCurrentState('login');
      setLoginKey(prev => prev + 1);
      notifyElectron('logout');
    }
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
    </ThemeProvider>
  );
}

export default App;
