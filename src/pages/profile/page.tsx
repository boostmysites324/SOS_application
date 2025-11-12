
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth, Profile } from '../../lib/api';
import BottomNav from '../../components/feature/BottomNav';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [userRole, setUserRole] = useState<string>('employee');
  const [profileData, setProfileData] = useState({
    fullName: 'User',
    employeeId: 'EMP-0001',
    email: 'user@example.com',
  });

  useEffect(() => {
    if (!Auth.isAuthenticated()) {
      navigate('/login');
      return;
    }
    const currentUser = Auth.user();
    if (currentUser) {
      setUserRole(currentUser.role || 'employee');
    }
    Profile.get()
      .then((u: any) => {
        setProfileData({
          fullName: u.name || 'User',
          employeeId: u.employeeId || u.id || 'EMP-0001',
          email: u.email || 'user@example.com',
        });
        if (u.role) setUserRole(u.role);
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    Auth.logout();
    navigate('/login');
  };

  const handleSaveProfile = async () => {
    try {
      await Profile.update({ name: profileData.fullName });
      setShowEditProfile(false);
    } catch (e: any) {
      alert(e.message || 'Failed to update profile');
    }
  };

  const handleMenuClick = (action: string) => {
    switch (action) {
      case 'edit':
        setShowEditProfile(true);
        break;
      case 'contacts':
        alert('Emergency Contacts\n\nThis feature would allow you to manage your emergency contact list.');
        break;
      case 'notifications':
        alert('Notification Settings\n\nThis feature would allow you to configure alert preferences.');
        break;
      case 'help':
        alert('Help Center\n\nFor assistance, contact:\nSupport: support@company.com\nPhone: +1 (555) 123-HELP');
        break;
      case 'privacy':
        alert('Privacy Policy\n\nYour privacy is important to us. This app collects location data only during emergency situations to ensure your safety.');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-6 pt-8 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold text-white">Profile</h1>
          <button 
            onClick={() => handleMenuClick('notifications')}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
          >
            <i className="ri-settings-3-line text-xl text-white"></i>
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 shadow-xl -mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {profileData.fullName.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                <i className="ri-checkbox-circle-fill text-sm text-white"></i>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800 mb-1">{profileData.fullName}</h2>
              <p className="text-sm text-gray-500">Employee ID: {profileData.employeeId}</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <i className="ri-mail-line text-lg text-white"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-0.5">Email Address</p>
                <p className="text-sm font-medium text-gray-800 truncate">{profileData.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pt-16">
        {/* Quick Stats */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Safety Statistics</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="ri-shield-check-line text-xl text-green-600"></i>
              </div>
              <p className="text-lg font-bold text-gray-800">247</p>
              <p className="text-xs text-gray-500">Safe Days</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="ri-alarm-warning-line text-xl text-blue-600"></i>
              </div>
              <p className="text-lg font-bold text-gray-800">2</p>
              <p className="text-xs text-gray-500">Alerts Sent</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <i className="ri-time-line text-xl text-orange-600"></i>
              </div>
              <p className="text-lg font-bold text-gray-800">3m</p>
              <p className="text-xs text-gray-500">Avg Response</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Account Settings</h3>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {userRole === 'admin' && (
              <button 
                onClick={() => navigate('/admin')}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <i className="ri-dashboard-line text-lg text-purple-600"></i>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-800">Admin Dashboard</p>
                  <p className="text-xs text-gray-500">Manage users and alerts</p>
                </div>
                <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
              </button>
            )}
            <button 
              onClick={() => handleMenuClick('edit')}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="ri-edit-line text-lg text-blue-600"></i>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-800">Edit Profile</p>
                <p className="text-xs text-gray-500">Update your information</p>
              </div>
              <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
            </button>

            <button 
              onClick={() => handleMenuClick('contacts')}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <i className="ri-shield-user-line text-lg text-green-600"></i>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-800">Emergency Contacts</p>
                <p className="text-xs text-gray-500">Manage your contacts</p>
              </div>
              <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
            </button>

            <button 
              onClick={() => handleMenuClick('notifications')}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <i className="ri-notification-3-line text-lg text-orange-600"></i>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-800">Notification Settings</p>
                <p className="text-xs text-gray-500">Configure alerts</p>
              </div>
              <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
            </button>
          </div>
        </div>

        {/* Support */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Support</h3>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button 
              onClick={() => handleMenuClick('help')}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <i className="ri-question-line text-lg text-purple-600"></i>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-800">Help Center</p>
              </div>
              <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
            </button>

            <button 
              onClick={() => handleMenuClick('privacy')}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <i className="ri-file-text-line text-lg text-teal-600"></i>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-800">Privacy Policy</p>
              </div>
              <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full bg-red-50 text-red-600 py-4 rounded-xl font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
        >
          <i className="ri-logout-box-line text-lg"></i>
          Log Out
        </button>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-6 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-800 text-center mb-6">Edit Profile</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                <input
                  type="text"
                  value={profileData.employeeId}
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl text-sm text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Employee ID cannot be changed</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setShowEditProfile(false)}
                className="py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-6 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-logout-box-line text-3xl text-red-600"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Log Out?</h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              Are you sure you want to log out of your account?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="py-3 px-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav activeTab="profile" />
    </div>
  );
}
