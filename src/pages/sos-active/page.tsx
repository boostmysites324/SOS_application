import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { SOS, Profile } from '../../lib/api';

// Google Maps types
declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (element: HTMLElement, options?: any) => any;
        Marker: new (options?: any) => any;
        InfoWindow: new (options?: any) => any;
        LatLngBounds: new () => {
          extend: (latLng: { lat: number; lng: number }) => void;
        };
        SymbolPath: {
          CIRCLE: any;
        };
        Animation: {
          DROP: any;
        };
      } | undefined;
    };
    gm_authFailure?: () => void;
  }
}

interface AlertData {
  id?: string;
  status?: string;
  latitude?: string | number;
  longitude?: string | number;
  lat?: string | number;
  lng?: string | number;
  location?: {
    latitude?: string | number;
    longitude?: string | number;
  } | null;
  address?: string;
  startedAt?: string;
  started_at?: string;
  timestamp?: string;
}

export default function SosActive() {
  const navigate = useNavigate();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [alertTime, setAlertTime] = useState<Date>(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [alertData, setAlertData] = useState<AlertData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState<{ name: string; phone: string; relationship?: string } | null>(null);
  const [callInitiated, setCallInitiated] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [locationError, setLocationError] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const mapInitializedRef = useRef<boolean>(false);
  const lastLocationUpdateRef = useRef<number>(0);

  // Request location permission and get current location
  const requestLocationPermission = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setLocationPermission('denied');
      return;
    }

    // Request location with high accuracy
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationPermission('granted');
        setLocationError(null);
        
        // Start watching position for real-time updates
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
        }
        
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const now = Date.now();
            // Throttle location updates to once per 2 seconds to prevent excessive re-renders
            if (now - lastLocationUpdateRef.current > 2000) {
              lastLocationUpdateRef.current = now;
              setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            }
          },
          (err) => {
            console.warn('Location watch error:', err);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 2000 // Allow cached location up to 2 seconds old
          }
        );
      },
      (error) => {
        console.error('Location error:', error);
        setLocationPermission('denied');
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location permission denied. Please enable location access in your browser settings.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location information unavailable.');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out.');
            break;
          default:
            setLocationError('An unknown error occurred while getting location.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []);

  // Request location permission on component mount
  useEffect(() => {
    requestLocationPermission();
    
    return () => {
      // Cleanup location watch on unmount
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [requestLocationPermission]);

  // Format elapsed time
  const formatElapsedTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Estimated arrival time
  const estimatedArrival = useCallback(() => {
    const baseTime = 180; // 3 minutes in seconds
    const remaining = Math.max(0, baseTime - elapsedTime);
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return remaining > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : 'Arriving now';
  }, [elapsedTime]);

  // Fetch alert data
  useEffect(() => {
    const fetchAlertData = async () => {
      try {
        const activeAlert = await SOS.active();
        if (activeAlert) {
          setAlertData(activeAlert);
          setAlertTime(new Date(activeAlert.startedAt || activeAlert.started_at || Date.now()));
          localStorage.setItem('currentAlert', JSON.stringify(activeAlert));
        } else {
          // Check localStorage as fallback
          const stored = localStorage.getItem('currentAlert');
          if (stored) {
            const parsed = JSON.parse(stored);
            setAlertData(parsed);
            setAlertTime(new Date(parsed.startedAt || parsed.started_at || parsed.timestamp || Date.now()));
          } else {
            navigate('/home-screen');
            return;
          }
        }
      } catch (error) {
        console.error('Error fetching alert:', error);
        // Check localStorage as fallback
        const stored = localStorage.getItem('currentAlert');
        if (stored) {
          const parsed = JSON.parse(stored);
          setAlertData(parsed);
          setAlertTime(new Date(parsed.startedAt || parsed.started_at || parsed.timestamp || Date.now()));
        } else {
          navigate('/home-screen');
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchEmergencyContacts = async () => {
      try {
        const contacts = await Profile.getEmergencyContacts();
        if (contacts && Array.isArray(contacts) && contacts.length > 0) {
          // Find primary contact first, otherwise use first contact with phone
          const primaryContact = contacts.find((c: any) => c.is_primary && c.phone);
          const firstContactWithPhone = contacts.find((c: any) => c.phone) || contacts[0];
          const selectedContact = primaryContact || firstContactWithPhone;
          
          if (selectedContact && selectedContact.phone) {
            setEmergencyContact({
              name: selectedContact.name,
              phone: selectedContact.phone,
              relationship: selectedContact.relationship || undefined
            });
          }
        }
      } catch (error) {
        console.error('Error fetching emergency contacts:', error);
      }
    };

    fetchAlertData();
    fetchEmergencyContacts();

    // Update elapsed time every second
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    // Poll for alert status to detect when admin resolves it
    const pollInterval = setInterval(async () => {
      try {
        const activeAlert = await SOS.active();
        if (!activeAlert || activeAlert.status === 'resolved' || activeAlert.status === 'cancelled') {
          localStorage.removeItem('currentAlert');
          navigate('/home-screen');
        }
      } catch (error) {
        // If 404 or no active alert, redirect to home
        localStorage.removeItem('currentAlert');
        navigate('/home-screen');
      }
    }, 5000); // Check every 5 seconds

    return () => {
      clearInterval(timer);
      clearInterval(pollInterval);
    };
  }, [navigate]);

  // Function to initiate emergency call
  const initiateEmergencyCall = useCallback((phoneNumber: string, contactName?: string) => {
    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // Use tel: protocol to initiate call
    // On mobile devices, this will open the dialer with the number
    // On desktop, it may show a prompt or do nothing
    const telLink = `tel:${cleanPhone}`;
    
    // Try to initiate call
    try { 
      window.location.href = telLink;
      
      // Show notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-24 left-6 right-6 bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 animate-slide-down';
      notification.innerHTML = `
        <div class="flex items-center gap-3">
          <i class="ri-phone-fill text-2xl"></i>
          <div>
            <p class="font-semibold">Calling Emergency Contact</p>
            <p class="text-sm text-red-100">${contactName || 'Emergency Contact'}: ${phoneNumber}</p>
          </div>
        </div>
      `;
      document.body.appendChild(notification);
      
      // Remove notification after 5 seconds
      setTimeout(() => {
        notification.remove();
      }, 5000);
    } catch (error) {
      console.error('Error initiating call:', error);
      // Fallback: show alert with phone number
      alert(`Emergency Contact: ${contactName || 'Emergency Contact'}\nPhone: ${phoneNumber}\n\nPlease call this number immediately!`);
    }
  }, []);

  // Auto-call emergency contact when SOS is active
  useEffect(() => {
    if (!loading && alertData && emergencyContact && emergencyContact.phone && !callInitiated) {
      // Small delay to ensure page is loaded
      const callTimer = setTimeout(() => {
        initiateEmergencyCall(emergencyContact.phone, emergencyContact.name);
        setCallInitiated(true);
      }, 2000); // 2 second delay after page loads

      return () => clearTimeout(callTimer);
    }
  }, [loading, alertData, emergencyContact, callInitiated, initiateEmergencyCall]);

  // Load Google Maps script
  useEffect(() => {
    const apiKey = "AIzaSyAs08ygQEdhqgbhFJ--9FLS9pIkRYKf_QA";
    
    // Validate API key - only check if it's empty
    if (!apiKey || apiKey.trim() === '') {
      setMapError('Google Maps API key not configured.');
      return;
    }

    // Check if Google Maps is already loaded with all required constructors
    if (window.google?.maps?.Map && window.google.maps.Marker && window.google.maps.InfoWindow) {
      setMapLoaded(true);
      return;
    }

    // Global error handler for authentication failures
    window.gm_authFailure = () => {
      setMapError('Google Maps authentication failed. Please check your API key and ensure all required APIs are enabled.');
      setMapLoaded(false);
    };

    // Check for existing script
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      const checkLoaded = setInterval(() => {
        if (window.google?.maps?.Map && window.google.maps.Marker && window.google.maps.InfoWindow) {
          clearInterval(checkLoaded);
          setMapLoaded(true);
        }
      }, 100);
      
      setTimeout(() => {
        clearInterval(checkLoaded);
        if (!window.google?.maps?.Map) {
          setMapError('Google Maps failed to load. Please check your API key configuration.');
        }
      }, 10000); // Increased timeout to 10 seconds
      
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onerror = () => {
      setMapError('Failed to load Google Maps. Please check your API key and internet connection.');
      setMapLoaded(false);
    };

    script.onload = () => {
      // Additional check to ensure maps library is fully loaded with all constructors
      const checkMaps = setInterval(() => {
        if (window.google?.maps?.Map && window.google.maps.Marker && window.google.maps.InfoWindow) {
          clearInterval(checkMaps);
          setMapLoaded(true);
          setMapError(null);
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkMaps);
        if (!window.google?.maps?.Map) {
          setMapError('Google Maps loaded but Map constructor not available. Please check your API key configuration.');
        }
      }, 10000); // Increased timeout to 10 seconds
    };

    document.head.appendChild(script);

    return () => {
      delete window.gm_authFailure;
    };
  }, []);

  // Initialize map - only called once
  const initializeMap = useCallback(() => {
    // Prevent re-initialization if map is already initialized
    if (mapInitializedRef.current) {
      return;
    }

    if (!mapRef.current || !alertData) {
      return;
    }

    // Check if Google Maps is fully loaded with all required constructors
    if (!window.google?.maps?.Map) {
      console.warn('Google Maps Map constructor not available yet');
      return;
    }

    if (!window.google.maps.Marker) {
      console.warn('Google Maps Marker constructor not available yet');
      return;
    }

    try {
      // Get coordinates from location object (backend format) or direct properties (fallback)
      const latValue = alertData.location?.latitude || alertData.latitude || alertData.lat;
      const lngValue = alertData.location?.longitude || alertData.longitude || alertData.lng;
      
      // Validate coordinates exist before using defaults
      if (!latValue || !lngValue) {
        console.warn('No valid coordinates found in alert data:', alertData);
        setMapError('Location coordinates not available. The SOS alert was sent without GPS location. Emergency contacts have still been notified.');
        return;
      }
      
      const lat = parseFloat(String(latValue));
      const lng = parseFloat(String(lngValue));
      
      // Validate coordinate ranges (latitude: -90 to 90, longitude: -180 to 180)
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        console.error('Invalid coordinates:', { lat, lng });
        setMapError('Invalid location coordinates. Please try again.');
        return;
      }

      // Determine map center - use alert location initially, user location will be added later
      const centerLat = lat;
      const centerLng = lng;

      // Create map instance
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: centerLat, lng: centerLng },
        zoom: 15,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      mapInstanceRef.current = map;

      // Create emergency location marker (red)
      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: map,
        title: 'Emergency Location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#DC2626',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 3,
        },
        animation: window.google.maps.Animation.DROP
      });

      markerRef.current = marker;

      // Create info window for emergency location
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">Emergency Location</h3>
            <p style="margin: 0; font-size: 12px; color: #666;">${alertData.address || 'Location shared'}</p>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #999;">${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      // Open info window by default
      infoWindow.open(map, marker);

      // Mark map as initialized
      mapInitializedRef.current = true;
      setMapError(null);

    } catch (error: any) {
      console.error('Error initializing map:', error);
      const errorMessage = error?.message || 'Unknown error initializing map';
      
      if (errorMessage.includes('ApiNotActivated') || errorMessage.includes('ApiNotActivatedMapError')) {
        setMapError(
          'Maps JavaScript API is not enabled. ' +
          'Please enable it in Google Cloud Console under APIs & Services > Library.'
        );
      } else {
        setMapError(`Failed to initialize map: ${errorMessage}`);
      }
    }
  }, [alertData]);

  // Initialize map when dependencies are ready - only once
  useEffect(() => {
    if (mapLoaded && alertData && !loading && !mapError && !mapInitializedRef.current) {
      // Verify Map constructor is available before initializing
      if (!window.google?.maps?.Map) {
        console.warn('Map constructor not available, waiting...');
        return;
      }
      
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        // Double-check before initializing
        if (window.google?.maps?.Map && mapRef.current && !mapInitializedRef.current) {
          initializeMap();
        }
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [mapLoaded, alertData, loading, mapError, initializeMap]);

  // Add or update user location marker when location is available
  useEffect(() => {
    if (!mapInitializedRef.current || !mapInstanceRef.current || !userLocation || !window.google?.maps) {
      return;
    }

    const map = mapInstanceRef.current;
    const latValue = alertData?.location?.latitude || alertData?.latitude || alertData?.lat;
    const lngValue = alertData?.location?.longitude || alertData?.longitude || alertData?.lng;
    
    if (!latValue || !lngValue) {
      return;
    }

    const lat = parseFloat(String(latValue));
    const lng = parseFloat(String(lngValue));

    // If user marker doesn't exist, create it
    if (!userMarkerRef.current) {
      const userMarker = new window.google.maps.Marker({
        position: { lat: userLocation.lat, lng: userLocation.lng },
        map: map,
        title: 'Your Current Location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#2563EB',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
        zIndex: 1000,
      });

      userMarkerRef.current = userMarker;

      // Create info window for user location
      const userInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold;">Your Location</h3>
            <p style="margin: 0; font-size: 12px; color: #666;">You are here</p>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #999;">${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}</p>
          </div>
        `
      });

      userMarker.addListener('click', () => {
        userInfoWindow.open(map, userMarker);
      });

      // Fit bounds to show both markers only once when user marker is first created
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend({ lat, lng });
      bounds.extend({ lat: userLocation.lat, lng: userLocation.lng });
      map.fitBounds(bounds);
    } else {
      // Just update the position if marker already exists
      userMarkerRef.current.setPosition({ lat: userLocation.lat, lng: userLocation.lng });
    }
  }, [userLocation, alertData]);

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      mapInitializedRef.current = false;
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
      }
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (mapInstanceRef.current) {
        // Google Maps doesn't require explicit cleanup for the map instance
      }
    };
  }, []);

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
        {/* Google Map */}
        <div 
          ref={mapRef} 
          className="w-full h-full"
          style={{ minHeight: '384px' }}
        />
        
        {/* Map Error/Status Overlay */}
        {(mapError || !mapLoaded) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <div className="text-center p-6 max-w-sm mx-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-error-warning-line text-3xl text-red-600"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {mapError ? 'Map Unavailable' : 'Loading Map...'}
              </h3>
              
              {mapError ? (
                <div className="text-sm text-gray-600 mb-4">
                  <p className="mb-2">{mapError}</p>
                  {(mapError.includes('ApiNotActivated') || mapError.includes('not enabled')) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3 text-left">
                      <p className="text-xs font-semibold text-yellow-800 mb-1">How to fix:</p>
                      <ol className="text-xs text-yellow-700 list-decimal list-inside space-y-1">
                        <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">Google Cloud Console</a></li>
                        <li>Navigate to <strong>APIs & Services</strong> → <strong>Library</strong></li>
                        <li>Search for <strong>"Maps JavaScript API"</strong></li>
                        <li>Click <strong>"Enable"</strong></li>
                        <li>Wait a few minutes and refresh this page</li>
                      </ol>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-600">Initializing map...</p>
                </div>
              )}

              {/* Location fallback */}
              {alertData && (() => {
                const latValue = alertData.location?.latitude || alertData.latitude || alertData.lat;
                const lngValue = alertData.location?.longitude || alertData.longitude || alertData.lng;
                if (!latValue || !lngValue) return null;
                
                return (
                  <div className="bg-white rounded-lg p-4 space-y-2 mt-4">
                    <div className="flex items-center gap-2 justify-center">
                      <i className="ri-map-pin-2-line text-gray-600"></i>
                      <p className="text-sm font-medium text-gray-800">Location Coordinates</p>
                    </div>
                    <p className="text-xs text-gray-600 font-mono">
                      {parseFloat(String(latValue)).toFixed(6)}, {parseFloat(String(lngValue)).toFixed(6)}
                    </p>
                    {alertData.address && (
                      <p className="text-xs text-gray-500 mt-2">{alertData.address}</p>
                    )}
                    <a
                      href={`https://www.google.com/maps?q=${latValue},${lngValue}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                    >
                      <i className="ri-external-link-line"></i>
                      Open in Google Maps
                    </a>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
        
        {/* Location Overlay */}
        {mapLoaded && !mapError && (
          <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-xl max-w-xs pointer-events-auto">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
                  <i className="ri-map-pin-fill text-lg text-white"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">Sharing your location</p>
                  <p className="text-xs text-gray-500">with the security team...</p>
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg p-2 space-y-1">
                <div className="flex items-center gap-2">
                  <i className="ri-time-line text-xs text-gray-600"></i>
                  <p className="text-xs text-gray-600">{alertTime.toLocaleTimeString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <i className="ri-map-pin-2-line text-xs text-gray-600"></i>
                  <p className="text-xs text-gray-600 truncate">{alertData?.address || 'Location being determined...'}</p>
                </div>
                {userLocation && (
                  <div className="flex items-center gap-2 mt-1 pt-1 border-t border-gray-200">
                    <i className="ri-user-location-line text-xs text-blue-600"></i>
                    <p className="text-xs text-blue-600 font-medium">Your location is being tracked</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Location Permission Request Overlay */}
        {locationPermission === 'prompt' && !userLocation && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-20">
            <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-map-pin-line text-3xl text-blue-600"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-800 text-center mb-2">Location Permission Required</h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                We need your location to show your position on the map and help emergency responders find you quickly.
              </p>
              <button
                onClick={requestLocationPermission}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
              >
                Allow Location Access
              </button>
            </div>
          </div>
        )}

        {/* Location Error Overlay */}
        {locationPermission === 'denied' && locationError && (
          <div className="absolute bottom-4 left-4 right-4 z-20">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 shadow-lg">
              <div className="flex items-start gap-3">
                <i className="ri-error-warning-line text-xl text-yellow-600 flex-shrink-0 mt-0.5"></i>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-yellow-800 mb-1">Location Access Denied</p>
                  <p className="text-xs text-yellow-700 mb-3">{locationError}</p>
                  <button
                    onClick={requestLocationPermission}
                    className="text-xs text-yellow-800 underline font-medium hover:text-yellow-900"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rest of your component remains the same */}
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
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Emergency Contact</h3>
          {emergencyContact && emergencyContact.phone ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <i className="ri-phone-fill text-lg text-white"></i>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{emergencyContact.name}</p>
                  {emergencyContact.relationship && (
                    <p className="text-xs text-gray-500">{emergencyContact.relationship}</p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">{emergencyContact.phone}</p>
                </div>
                {callInitiated && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 font-medium">Calling...</span>
                  </div>
                )}
              </div>
              {!callInitiated && (
                <button
                  onClick={() => {
                    initiateEmergencyCall(emergencyContact.phone, emergencyContact.name);
                    setCallInitiated(true);
                  }}
                  className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <i className="ri-phone-line"></i>
                  Call {emergencyContact.name}
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-xs text-gray-500">No emergency contact available</p>
              <p className="text-xs text-gray-400 mt-1">Add a contact in your profile</p>
            </div>
          )}
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