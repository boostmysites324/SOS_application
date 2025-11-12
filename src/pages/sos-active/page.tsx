
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { SOS } from '../../lib/api';

export default function SosActive() {
  const navigate = useNavigate();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [alertTime, setAlertTime] = useState<Date>(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [alertData, setAlertData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch active alert from backend
    SOS.active()
      .then((activeAlert) => {
        if (activeAlert) {
          setAlertData(activeAlert);
          setAlertTime(new Date(activeAlert.startedAt || Date.now()));
          localStorage.setItem('currentAlert', JSON.stringify(activeAlert));
        } else {
          // No active alert, check localStorage as fallback
          const stored = localStorage.getItem('currentAlert');
          if (stored) {
            const parsed = JSON.parse(stored);
            setAlertData(parsed);
            setAlertTime(new Date(parsed.startedAt || parsed.timestamp || Date.now()));
          } else {
            // No alert found, redirect to home
            navigate('/home-screen');
          }
        }
        setLoading(false);
      })
      .catch(() => {
        // Error fetching, check localStorage as fallback
        const stored = localStorage.getItem('currentAlert');
        if (stored) {
          const parsed = JSON.parse(stored);
          setAlertData(parsed);
          setAlertTime(new Date(parsed.startedAt || parsed.timestamp || Date.now()));
        } else {
          navigate('/home-screen');
        }
        setLoading(false);
      });

    // Update elapsed time every second
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleCancelAlert = async () => {
    try {
      await SOS.cancel();
      localStorage.removeItem('currentAlert');
      setShowCancelConfirm(false);
      navigate('/home-screen');
    } catch (err: any) {
      alert(err.message || 'Failed to cancel alert');
    }
  };

  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const estimatedArrival = () => {
    const baseTime = 180; // 3 minutes in seconds
    const remaining = Math.max(0, baseTime - elapsedTime);
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return remaining > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : 'Arriving now';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading alert...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Alert Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-8 text-center">
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <i className="ri-alarm-warning-fill text-5xl text-white"></i>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">ALERT SENT</h1>
        <p className="text-red-100 text-sm">Security team has been notified</p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <p className="text-white text-xs font-medium">Active Emergency - {formatElapsedTime(elapsedTime)}</p>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-96 bg-gray-100">
        <img
          src="https://readdy.ai/api/search-image?query=Modern%20digital%20map%20interface%20showing%20urban%20area%20with%20GPS%20location%20marker%2C%20clean%20minimalist%20design%2C%20blue%20and%20white%20color%20scheme%2C%20top-down%20satellite%20view%20with%20street%20grid%2C%20professional%20navigation%20app%20style%2C%20high%20detail%2C%20centered%20composition%2C%20realistic%20rendering&width=375&height=384&seq=map001&orientation=portrait"
          alt="Location Map"
          className="w-full h-full object-cover"
        />
        
        {/* Location Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-xl max-w-xs mx-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
                <i className="ri-map-pin-fill text-xl text-white"></i>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">Sharing your location</p>
                <p className="text-xs text-gray-500">with the security team...</p>
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-time-line text-sm text-gray-600"></i>
                <p className="text-xs text-gray-600">Alert sent at {alertTime.toLocaleTimeString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <i className="ri-map-pin-2-line text-sm text-gray-600"></i>
                <p className="text-xs text-gray-600">{alertData?.address || 'Location being determined...'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pulsing Location Marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-16 h-16 bg-red-500/30 rounded-full animate-ping absolute"></div>
            <div className="w-16 h-16 bg-red-500/50 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-red-600 rounded-full border-4 border-white shadow-lg"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Information */}
      <div className="px-6 py-6">
        <div className="bg-blue-50 rounded-2xl p-5 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <i className="ri-shield-check-fill text-xl text-white"></i>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">Security Team Alerted</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Your emergency alert has been received. Security personnel are being dispatched to your location. Stay calm and stay safe.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
            <i className="ri-user-line text-xl text-gray-600 mb-1"></i>
            <p className="text-xs text-gray-500">Response Team</p>
            <p className="text-sm font-semibold text-gray-800">3 Units</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
            <i className="ri-timer-line text-xl text-gray-600 mb-1"></i>
            <p className="text-xs text-gray-500">ETA</p>
            <p className="text-sm font-semibold text-gray-800">{estimatedArrival()}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
            <i className="ri-map-pin-range-line text-xl text-gray-600 mb-1"></i>
            <p className="text-xs text-gray-500">Distance</p>
            <p className="text-sm font-semibold text-gray-800">0.3 km</p>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-green-50 rounded-2xl p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Emergency Contacts Notified</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <i className="ri-phone-fill text-sm text-white"></i>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-800">Security Control Room</p>
                <p className="text-xs text-gray-500">+1 (555) 911-SAFE</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <i className="ri-user-fill text-sm text-white"></i>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-800">Emergency Coordinator</p>
                <p className="text-xs text-gray-500">Sarah Johnson</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cancel Button */}
        <button
          onClick={() => setShowCancelConfirm(true)}
          className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
        >
          Cancel Alert
        </button>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-6 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-error-warning-line text-3xl text-orange-600"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Cancel Alert?</h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              Are you sure you want to cancel this emergency alert? The security team will be notified.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Keep Alert
              </button>
              <button
                onClick={handleCancelAlert}
                className="py-3 px-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
