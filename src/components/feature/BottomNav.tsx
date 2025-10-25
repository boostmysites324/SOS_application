import { useNavigate } from 'react-router-dom';

interface BottomNavProps {
  activeTab: 'home' | 'notifications' | 'profile';
}

export default function BottomNav({ activeTab }: BottomNavProps) {
  const navigate = useNavigate();

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: 'ri-home-5-line',
      activeIcon: 'ri-home-5-fill',
      path: '/home-screen',
    },
    {
      id: 'notifications',
      label: 'Alerts',
      icon: 'ri-notification-line',
      activeIcon: 'ri-notification-fill',
      path: '/notifications',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: 'ri-user-line',
      activeIcon: 'ri-user-fill',
      path: '/profile',
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 z-20">
      <div className="grid grid-cols-3 gap-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center py-2 rounded-xl transition-all ${
                isActive ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className={`w-6 h-6 flex items-center justify-center mb-1`}>
                <i
                  className={`${isActive ? item.activeIcon : item.icon} text-xl ${
                    isActive ? 'text-blue-600' : 'text-gray-400'
                  }`}
                ></i>
              </div>
              <span
                className={`text-xs font-medium ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}