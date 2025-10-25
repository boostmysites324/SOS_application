
import { useEffect } from 'react';
import { BrowserRouter, Navigate } from 'react-router-dom';
import { AppRoutes } from './router';

// Auth guard component
function AuthGuard({ children }: { children: React.ReactNode }) {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Public route guard (redirect to home if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (isLoggedIn) {
    return <Navigate to="/home-screen" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  useEffect(() => {
    // Initialize app state
    if (!localStorage.getItem('appInitialized')) {
      localStorage.setItem('appInitialized', 'true');
    }
  }, []);

  return (
    <BrowserRouter basename={__BASE_PATH__}>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
