import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Auth } from '../../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      alert('Please enter your email/employee ID and password');
      return;
    }
    
    setLoading(true);
    try {
      console.log('[Login] Attempting login for:', identifier);
      await Auth.login(identifier, password);
      console.log('[Login] Login successful');
      navigate('/home-screen');
    } catch (err: any) {
      console.error('[Login] Login error:', err);
      const errorMessage = err?.message || String(err) || 'Login failed';
      
      if (errorMessage.includes('Email not verified')) {
        alert('Please verify your email before logging in. Check your email for the verification link.');
      } else if (errorMessage.includes('Cannot connect to server') || 
                 errorMessage.includes('Unable to resolve host') ||
                 errorMessage.includes('Network error')) {
        alert(`Connection Error:\n\n${errorMessage}\n\nPlease check:\n- Your internet connection\n- The backend server is running\n- Try again in a few moments`);
      } else if (errorMessage.includes('Invalid credentials')) {
        alert('Invalid email/employee ID or password. Please check your credentials and try again.');
      } else {
        alert(`Login failed:\n\n${errorMessage}\n\nPlease check your credentials and try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-shield-check-line text-4xl text-white"></i>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Employee Safety</h1>
          <p className="text-blue-200 text-sm">Secure Alert System</p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Login</h2>
          
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email or Employee ID
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                <i className="ri-user-line text-lg text-gray-400"></i>
              </div>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email or employee ID"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                <i className="ri-lock-line text-lg text-gray-400"></i>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <div className="text-right mb-6"></div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">Don't have an account? </span>
            <Link to="/register" className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}