import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LoginPage } from './views/LoginPage';
import { RegisterPage } from './views/RegisterPage';
import { LandingPage } from './views/LandingPage';
import { HospitalDashboard } from './views/HospitalDashboard';
import { BloodBankDashboard } from './views/BloodBankDashboard';
import { AdminDashboard } from './views/AdminDashboard';
import { ArrowLeft } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { activeRole, user, setActiveRole } = useAuth();
  const [currentView, setCurrentView] = useState<'HOME' | 'LOGIN' | 'REGISTER'>('HOME');

  const navigateToHome = (anchor?: string) => {
    setCurrentView('HOME');
    if (user) {
      setActiveRole('HOME');
    }
    if (anchor) {
      setTimeout(() => {
        const el = document.getElementById(anchor);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenLogin = () => {
    setCurrentView('LOGIN');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenRegister = () => {
    setCurrentView('REGISTER');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. If not logged in and user navigated to dedicated Login Page
  if (!user && currentView === 'LOGIN') {
    return (
      <div className="app-container">
        <Navbar
          currentView="LOGIN"
          onOpenLogin={handleOpenLogin}
          onOpenRegister={handleOpenRegister}
          onNavigateHome={navigateToHome}
        />
        <main className="main-content">
          <LoginPage
            onBackToHome={() => navigateToHome()}
            onOpenRegister={handleOpenRegister}
          />
        </main>
      </div>
    );
  }

  // 2. If not logged in and user navigated to dedicated Register Page
  if (!user && currentView === 'REGISTER') {
    return (
      <div className="app-container">
        <Navbar
          currentView="REGISTER"
          onOpenLogin={handleOpenLogin}
          onOpenRegister={handleOpenRegister}
          onNavigateHome={navigateToHome}
        />
        <main className="main-content">
          <RegisterPage
            onBackToHome={() => navigateToHome()}
            onOpenLogin={handleOpenLogin}
          />
        </main>
      </div>
    );
  }

  // 3. If logged in: User enters dedicated Clinical OS Workspace (no website navbar, no website footer)
  if (user) {
    const assignedRole =
      (activeRole && activeRole !== 'HOME' ? activeRole : null) ||
      user.roles.find((r) =>
        ['HOSPITAL_STAFF', 'BLOOD_BANK_OFFICER', 'SYSTEM_ADMINISTRATOR'].includes(r)
      ) ||
      'HOSPITAL_STAFF';

    return (
      <div className="clinical-root-wrapper" style={{ minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
        {assignedRole === 'HOSPITAL_STAFF' && <HospitalDashboard />}
        {assignedRole === 'BLOOD_BANK_OFFICER' && <BloodBankDashboard />}
        {assignedRole === 'SYSTEM_ADMINISTRATOR' && <AdminDashboard />}
      </div>
    );
  }

  // 4. Default: Landing / Home Page (either logged out on HOME or logged in on HOME)
  return (
    <div className="app-container">
      <Navbar
        currentView="HOME"
        onOpenLogin={handleOpenLogin}
        onOpenRegister={handleOpenRegister}
        onNavigateHome={navigateToHome}
      />
      <main className="main-content">
        <LandingPage
          onSelectRole={(role) => {
            if (!user) {
              handleOpenLogin();
            } else {
              setActiveRole(role);
            }
          }}
          onOpenLogin={handleOpenLogin}
          onOpenRegister={handleOpenRegister}
        />
      </main>
      <Footer
        onOpenLogin={handleOpenLogin}
        onOpenRegister={handleOpenRegister}
        onNavigateHome={navigateToHome}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
};

export default App;
