
import { useState, useEffect } from 'react';
import { Notifications as ApiNotifications } from '../../lib/api';
import BottomNav from '../../components/feature/BottomNav';

interface Alert {
  id: string;
  type: 'emergency' | 'test' | 'info' | 'resolved';
  title: string;
  description: string;
  timestamp: string;
  location?: string;
}

export default function Notifications() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<'all' | 'emergency' | 'test' | 'info'>('all');

  useEffect(() => {
    ApiNotifications.list()
      .then((items: any[]) => {
        const mapped: Alert[] = items.map((n) => {
          let type: 'emergency' | 'test' | 'info' | 'resolved' = 'info';
          if (n.type === 'sos') type = 'emergency';
          else if (n.type === 'warning') type = 'emergency';
          else if (n.type === 'alert') type = 'emergency';
          else if (n.type === 'info') type = 'info';
          
          return {
            id: n.id,
            type: type,
            title: n.title || (n.type === 'sos' ? 'SOS Alert' : 'Notification'),
            description: n.message || 'Update',
            timestamp: new Date(n.created_at || n.createdAt || Date.now()).toLocaleString(),
            location: undefined,
          };
        });
        setAlerts(mapped);
      })
      .catch((err) => {
        console.error('Failed to load notifications:', err);
        setAlerts([]);
      });
  }, []);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'emergency':
        return { icon: 'ri-alarm-warning-fill', bg: 'bg-red-100', color: 'text-red-600' };
      case 'test':
        return { icon: 'ri-checkbox-circle-fill', bg: 'bg-green-100', color: 'text-green-600' };
      case 'info':
        return { icon: 'ri-information-fill', bg: 'bg-blue-100', color: 'text-blue-600' };
      case 'resolved':
        return { icon: 'ri-shield-check-fill', bg: 'bg-teal-100', color: 'text-teal-600' };
      default:
        return { icon: 'ri-notification-fill', bg: 'bg-gray-100', color: 'text-gray-600' };
    }
  };

  const filteredAlerts = filter === 'all' ? alerts : alerts.filter(alert => alert.type === filter);

  const clearAllNotifications = () => {
    if (confirm('Are you sure you want to clear all notifications?')) {
      localStorage.removeItem('alertHistory');
      setAlerts([]);
    }
  };

  const markAsRead = (alertId: string) => {
    ApiNotifications.markRead(alertId)
      .then(() => {
        // Update local state to mark as read
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId ? { ...alert } : alert
        ));
      })
      .catch((err) => {
        console.error('Failed to mark as read:', err);
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Notifications</h1>
            <p className="text-xs text-gray-500">{filteredAlerts.length} alerts</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearAllNotifications}
              className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center"
            >
              <i className="ri-delete-bin-line text-lg text-red-600"></i>
            </button>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="ri-notification-line text-xl text-blue-600"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="pt-20 px-6 pb-4">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { key: 'all', label: 'All', count: alerts.length },
            { key: 'emergency', label: 'Emergency', count: alerts.filter(a => a.type === 'emergency').length },
            { key: 'test', label: 'Tests', count: alerts.filter(a => a.type === 'test').length },
            { key: 'info', label: 'Info', count: alerts.filter(a => a.type === 'info').length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="px-6 pb-6">
        {filteredAlerts.length > 0 ? (
          <div className="space-y-3">
            {filteredAlerts.map((alert) => {
              const iconConfig = getAlertIcon(alert.type);
              return (
                <div
                  key={alert.id}
                  onClick={() => markAsRead(alert.id)}
                  className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 ${iconConfig.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <i className={`${iconConfig.icon} text-xl ${iconConfig.color}`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-800 leading-tight">
                          {alert.title}
                        </h3>
                        <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                          {alert.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed mb-2">
                        {alert.description}
                      </p>
                      {alert.location && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <i className="ri-map-pin-line text-xs text-gray-400"></i>
                          <span className="text-xs text-gray-500">{alert.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-notification-off-line text-3xl text-gray-400"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Notifications</h3>
            <p className="text-sm text-gray-500">
              {filter === 'all' ? "You're all caught up!" : `No ${filter} notifications found.`}
            </p>
          </div>
        )}
      </div>

      <BottomNav activeTab="notifications" />
    </div>
  );
}
