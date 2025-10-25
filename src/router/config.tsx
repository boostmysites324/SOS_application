
import { RouteObject, Navigate } from 'react-router-dom';
import Login from '../pages/login/page';
import Register from '../pages/register/page';
import VerifyEmail from '../pages/verify-email/page';
import HomeScreen from '../pages/home-screen/page';
import SosActive from '../pages/sos-active/page';
import Notifications from '../pages/notifications/page';
import Profile from '../pages/profile/page';
import NotFound from '../pages/NotFound';

// Auth guard component
function AuthGuard({ children }: { children: React.ReactNode }) {
  const hasToken = !!localStorage.getItem('auth_token');
  if (!hasToken) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// Public route guard (redirect to home if already authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const hasToken = !!localStorage.getItem('auth_token');
  if (hasToken) {
    return <Navigate to="/home-screen" replace />;
  }
  return <>{children}</>;
}

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to="/login" replace />
  },
  {
    path: '/login',
    element: <PublicRoute><Login /></PublicRoute>
  },
  {
    path: '/register',
    element: <PublicRoute><Register /></PublicRoute>
  },
  {
    path: '/verify-email',
    element: <VerifyEmail />
  },
  {
    path: '/home-screen',
    element: <AuthGuard><HomeScreen /></AuthGuard>
  },
  {
    path: '/sos-active',
    element: <AuthGuard><SosActive /></AuthGuard>
  },
  {
    path: '/notifications',
    element: <AuthGuard><Notifications /></AuthGuard>
  },
  {
    path: '/profile',
    element: <AuthGuard><Profile /></AuthGuard>
  },
  {
    path: '*',
    element: <NotFound />
  }
];

export default routes;
