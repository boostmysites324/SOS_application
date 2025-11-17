import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Auth } from '../../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await Auth.login(employeeId, password);
      navigate('/home-screen');
    } catch (err: any) {
      alert(err.message || 'Login failed');
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
              Employee ID
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                <i className="ri-user-line text-lg text-gray-400"></i>
              </div>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your employee ID"
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
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
          >
            Login
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