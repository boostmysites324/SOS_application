
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SOS } from '../../lib/api';
import BottomNav from '../../components/feature/BottomNav';

export default function HomeScreen() {
  const navigate = useNavigate();
  const [isPressed, setIsPressed] = useState(false);
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check for active SOS on mount
  useEffect(() => {
    SOS.active()
      .then((activeAlert) => {
        if (activeAlert) {
          localStorage.setItem('currentAlert', JSON.stringify(activeAlert));
          navigate('/sos-active');
        }
      })
      .catch(() => {
        // No active SOS or error - continue to home screen
      });
  }, [navigate]);

  const handlePressStart = () => {
    setIsPressed(true);
    let currentProgress = 0;
    
    const timer = setInterval(() => {
      currentProgress += 3.33;
      setProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(timer);
        // Get current location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              SOS.start({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              })
                .then((alertData) => {
                  localStorage.setItem('currentAlert', JSON.stringify(alertData));
                  navigate('/sos-active');
                })
                .catch((e: any) => alert(e.message || 'Failed to start SOS'));
            },
            () => {
              // If location fails, start SOS without location
              SOS.start()
                .then((alertData) => {
                  localStorage.setItem('currentAlert', JSON.stringify(alertData));
                  navigate('/sos-active');
                })
                .catch((e: any) => alert(e.message || 'Failed to start SOS'));
            }
          );
        } else {
          // Geolocation not supported
          SOS.start()
            .then((alertData) => {
              localStorage.setItem('currentAlert', JSON.stringify(alertData));
              navigate('/sos-active');
            })
            .catch((e: any) => alert(e.message || 'Failed to start SOS'));
        }
      }
    }, 100);
    
    setPressTimer(timer);
  };

  const handlePressEnd = () => {
    setIsPressed(false);
    setProgress(0);
    if (pressTimer) {
      clearInterval(pressTimer);
      setPressTimer(null);
    }
  };

  const handleQuickCall = () => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-24 left-6 right-6 bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 animate-slide-down';
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <i class="ri-phone-fill text-2xl text-blue-400"></i>
        <div>
          <p class="font-semibold">Calling Security Team</p>
          <p class="text-sm text-gray-300">Connecting to emergency line...</p>
        </div>
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const notification = document.createElement('div');
          notification.className = 'fixed top-24 left-6 right-6 bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 animate-slide-down';
          notification.innerHTML = `
            <div class="flex items-center gap-3">
              <i class="ri-map-pin-fill text-2xl text-emerald-400"></i>
              <div>
                <p class="font-semibold">Location Shared</p>
                <p class="text-sm text-gray-300">GPS: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}</p>
              </div>
            </div>
          `;
          document.body.appendChild(notification);
          setTimeout(() => notification.remove(), 3000);
        },
        () => {
          const notification = document.createElement('div');
          notification.className = 'fixed top-24 left-6 right-6 bg-slate-800 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 animate-slide-down';
          notification.innerHTML = `
            <div class="flex items-center gap-3">
              <i class="ri-map-pin-fill text-2xl text-emerald-400"></i>
              <div>
                <p class="font-semibold">Location Shared</p>
                <p class="text-sm text-gray-300">Main Building, Floor 3</p>
              </div>
            </div>
          `;
          document.body.appendChild(notification);
          setTimeout(() => notification.remove(), 3000);
        }
      );
    }
  };

  const handleEmergencyContacts = () => {
    navigate('/profile');
  };

  const handleSafetyTips = () => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-6';
    modal.innerHTML = `
      <div class="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-bold text-gray-900">Safety Guidelines</h3>
          <button onclick="this.closest('.fixed').remove()" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <i class="ri-close-line text-2xl text-gray-600"></i>
          </button>
        </div>
        <div class="space-y-4">
          <div class="flex gap-4">
            <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <i class="ri-eye-line text-xl text-blue-600"></i>
            </div>
            <div>
              <p class="font-semibold text-gray-900 mb-1">Stay Alert</p>
              <p class="text-sm text-gray-600">Always be aware of your surroundings and trust your instincts</p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <i class="ri-contacts-line text-xl text-emerald-600"></i>
            </div>
            <div>
              <p class="font-semibold text-gray-900 mb-1">Update Contacts</p>
              <p class="text-sm text-gray-600">Keep your emergency contacts current and accessible</p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <i class="ri-alarm-warning-line text-xl text-amber-600"></i>
            </div>
            <div>
              <p class="font-semibold text-gray-900 mb-1">Report Incidents</p>
              <p class="text-sm text-gray-600">Immediately report any suspicious activities or concerns</p>
            </div>
          </div>
          <div class="flex gap-4">
            <div class="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <i class="ri-flashlight-line text-xl text-purple-600"></i>
            </div>
            <div>
              <p class="font-semibold text-gray-900 mb-1">Safe Routes</p>
              <p class="text-sm text-gray-600">Use well-lit pathways and avoid isolated areas</p>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Minimalist Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-200/80 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <i className="ri-shield-check-fill text-xl text-white"></i>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">SafeGuard</h1>
                <p className="text-xs text-gray-500">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              <span className="text-xs font-semibold text-emerald-700">Secure</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 px-6">
        {/* Greeting Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{getGreeting()}, John</h2>
          <p className="text-gray-600">Your safety is our priority</p>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          <div className="bg-white rounded-2xl p-4 border border-gray-200 text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <i className="ri-shield-check-line text-2xl text-emerald-600"></i>
            </div>
            <p className="text-xs text-gray-500 mb-1">Status</p>
            <p className="text-sm font-bold text-gray-900">Safe</p>
          </div>
          
          <div className="bg-white rounded-2xl p-4 border border-gray-200 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <i className="ri-team-line text-2xl text-blue-600"></i>
            </div>
            <p className="text-xs text-gray-500 mb-1">Team</p>
            <p className="text-sm font-bold text-gray-900">24</p>
          </div>
          
          <div className="bg-white rounded-2xl p-4 border border-gray-200 text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <i className="ri-notification-line text-2xl text-amber-600"></i>
            </div>
            <p className="text-xs text-gray-500 mb-1">Alerts</p>
            <p className="text-sm font-bold text-gray-900">0</p>
          </div>
          
          <div className="bg-white rounded-2xl p-4 border border-gray-200 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <i className="ri-time-line text-2xl text-purple-600"></i>
            </div>
            <p className="text-xs text-gray-500 mb-1">Response</p>
            <p className="text-sm font-bold text-gray-900">&lt;90s</p>
          </div>
        </div>

        {/* Emergency SOS - Premium Design with Better Colors */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">Emergency Alert</h3>
              <p className="text-white/80 text-sm">Press and hold for 3 seconds</p>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <div className="relative mb-6">
                {/* Animated Rings */}
                <div className={`absolute inset-0 w-52 h-52 rounded-full border-2 border-white/30 ${isPressed ? 'animate-ping' : ''}`}></div>
                <div className={`absolute inset-4 w-44 h-44 rounded-full border-2 border-white/20 ${isPressed ? 'animate-pulse' : ''}`}></div>
                
                {/* Progress Circle */}
                <svg className="absolute inset-6 w-40 h-40 -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="3"
                    strokeDasharray={`${2 * Math.PI * 54}`}
                    strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
                    className="transition-all duration-100"
                    strokeLinecap="round"
                  />
                </svg>
                
                {/* SOS Button */}
                <button
                  onMouseDown={handlePressStart}
                  onMouseUp={handlePressEnd}
                  onMouseLeave={handlePressEnd}
                  onTouchStart={handlePressStart}
                  onTouchEnd={handlePressEnd}
                  className={`relative w-40 h-40 rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-2xl flex flex-col items-center justify-center transition-all duration-200 ${
                    isPressed ? 'scale-90 shadow-red-500/50' : 'scale-100 hover:scale-105 shadow-red-500/30'
                  }`}
                >
                  <i className="ri-alarm-warning-fill text-5xl text-white mb-1"></i>
                  <span className="text-2xl font-bold text-white tracking-widest">SOS</span>
                </button>
              </div>

              {isPressed && (
                <div className="bg-white/20 border border-white/30 rounded-2xl px-6 py-3 backdrop-blur-sm">
                  <p className="text-white font-semibold">
                    Hold for {Math.ceil((100 - progress) / 33.33)}s...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions - Modern Grid */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleQuickCall}
              className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <i className="ri-phone-fill text-2xl text-white"></i>
              </div>
              <p className="text-base font-bold text-gray-900 mb-1">Call Security</p>
              <p className="text-xs text-gray-500">Emergency line</p>
            </button>
            
            <button 
              onClick={handleShareLocation}
              className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <i className="ri-map-pin-user-fill text-2xl text-white"></i>
              </div>
              <p className="text-base font-bold text-gray-900 mb-1">Share Location</p>
              <p className="text-xs text-gray-500">GPS tracking</p>
            </button>
            
            <button 
              onClick={handleEmergencyContacts}
              className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <i className="ri-contacts-fill text-2xl text-white"></i>
              </div>
              <p className="text-base font-bold text-gray-900 mb-1">Contacts</p>
              <p className="text-xs text-gray-500">Emergency list</p>
            </button>
            
            <button 
              onClick={handleSafetyTips}
              className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-amber-300 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <i className="ri-lightbulb-fill text-2xl text-white"></i>
              </div>
              <p className="text-base font-bold text-gray-900 mb-1">Safety Tips</p>
              <p className="text-xs text-gray-500">Guidelines</p>
            </button>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-5">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="ri-check-line text-lg text-white"></i>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm mb-1">Safety check completed</p>
                <p className="text-xs text-gray-500">All systems operational • 2h ago</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="ri-map-pin-fill text-lg text-white"></i>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm mb-1">Location updated</p>
                <p className="text-xs text-gray-500">Building A, Floor 3 • 4h ago</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <i className="ri-graduation-cap-fill text-lg text-white"></i>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm mb-1">Safety training completed</p>
                <p className="text-xs text-gray-500">Emergency procedures • Yesterday</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav activeTab="home" />
    </div>
  );
}