import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Admin, Auth } from '../../lib/api';

interface Stats {
  totalUsers: number;
  activeSOS: number;
  totalSOS: number;
  emergencyContacts: number;
  recentSOS: number;
}

interface User {
  id: string;
  email: string | null;
  employee_id: string | null;
  name: string;
  role: string;
  email_verified: boolean;
  created_at: string;
}

interface SOSAlert {
  id: string;
  user_id: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  status: string;
  started_at: string;
  resolved_at: string | null;
  users?: {
    id: string;
    name: string;
    email: string | null;
    employee_id: string | null;
  };
}

interface EmergencyContact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'alerts' | 'contacts'>('dashboard');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', role: '' });

  const user = Auth.user();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/home-screen');
      return;
    }
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'dashboard') {
        const statsData = await Admin.getStats();
        setStats(statsData);
        const alertsData = await Admin.getSOSAlerts({ limit: 10 });
        setAlerts(alertsData);
      } else if (activeTab === 'users') {
        const usersData = await Admin.getUsers();
        setUsers(usersData);
      } else if (activeTab === 'alerts') {
        const alertsData = await Admin.getSOSAlerts({ limit: 50 });
        setAlerts(alertsData);
      } else if (activeTab === 'contacts') {
        const contactsData = await Admin.getEmergencyContacts();
        setContacts(contactsData);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (id: string) => {
    if (!confirm('Mark this SOS alert as resolved?')) return;
    try {
      await Admin.resolveSOSAlert(id);
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to resolve alert');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await Admin.deleteUser(id);
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to delete user');
    }
  };

  const handleSaveContact = async () => {
    if (!contactForm.name || !contactForm.role) {
      alert('Name and role are required');
      return;
    }
    try {
      if (editingContact) {
        await Admin.updateEmergencyContact(editingContact.id, contactForm);
      } else {
        await Admin.createEmergencyContact(contactForm);
      }
      setShowContactModal(false);
      setEditingContact(null);
      setContactForm({ name: '', email: '', phone: '', role: '' });
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to save contact');
    }
  };

  const handleEditContact = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setContactForm({
      name: contact.name,
      email: contact.email || '',
      phone: contact.phone || '',
      role: contact.role
    });
    setShowContactModal(true);
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm('Are you sure you want to delete this emergency contact?')) return;
    try {
      await Admin.deleteEmergencyContact(id);
      await loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to delete contact');
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <button
              onClick={() => navigate('/home-screen')}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
            >
              Back to App
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800/30 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1">
            {(['dashboard', 'users', 'alerts', 'contacts'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium transition ${
                  activeTab === tab
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && stats && (
          <div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <div className="text-slate-400 text-sm mb-1">Total Users</div>
                <div className="text-3xl font-bold text-white">{stats.totalUsers}</div>
              </div>
              <div className="bg-red-900/30 rounded-lg p-6 border border-red-800">
                <div className="text-red-300 text-sm mb-1">Active SOS</div>
                <div className="text-3xl font-bold text-red-400">{stats.activeSOS}</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <div className="text-slate-400 text-sm mb-1">Total SOS Alerts</div>
                <div className="text-3xl font-bold text-white">{stats.totalSOS}</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <div className="text-slate-400 text-sm mb-1">Emergency Contacts</div>
                <div className="text-3xl font-bold text-white">{stats.emergencyContacts}</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <div className="text-slate-400 text-sm mb-1">Recent (7 days)</div>
                <div className="text-3xl font-bold text-white">{stats.recentSOS}</div>
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-xl font-bold text-white">Recent SOS Alerts</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {alerts.map((alert) => (
                      <tr key={alert.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-white">{alert.users?.name || 'Unknown'}</div>
                          <div className="text-sm text-slate-400">{alert.users?.email || alert.users?.employee_id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            alert.status === 'active' ? 'bg-red-900/50 text-red-300' :
                            alert.status === 'resolved' ? 'bg-green-900/50 text-green-300' :
                            'bg-slate-700 text-slate-300'
                          }`}>
                            {alert.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-white text-sm">{alert.address || 'Unknown'}</div>
                          {alert.latitude && alert.longitude && (
                            <div className="text-xs text-slate-400">
                              {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                          {new Date(alert.started_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {alert.status === 'active' && (
                            <button
                              onClick={() => handleResolveAlert(alert.id)}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                            >
                              Resolve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Users</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Employee ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Verified</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 text-white">{user.name}</td>
                      <td className="px-6 py-4 text-slate-300">{user.email || '-'}</td>
                      <td className="px-6 py-4 text-slate-300">{user.employee_id || '-'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-900/50 text-blue-300">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.email_verified ? (
                          <span className="text-green-400">✓</span>
                        ) : (
                          <span className="text-red-400">✗</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">SOS Alerts</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Started</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Resolved</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {alerts.map((alert) => (
                    <tr key={alert.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-white">{alert.users?.name || 'Unknown'}</div>
                        <div className="text-sm text-slate-400">{alert.users?.email || alert.users?.employee_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          alert.status === 'active' ? 'bg-red-900/50 text-red-300' :
                          alert.status === 'resolved' ? 'bg-green-900/50 text-green-300' :
                          'bg-slate-700 text-slate-300'
                        }`}>
                          {alert.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white text-sm">{alert.address || 'Unknown'}</div>
                        {alert.latitude && alert.longitude && (
                          <div className="text-xs text-slate-400">
                            {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {new Date(alert.started_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {alert.resolved_at ? new Date(alert.resolved_at).toLocaleString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {alert.status === 'active' && (
                          <button
                            onClick={() => handleResolveAlert(alert.id)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                          >
                            Resolve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'contacts' && (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Emergency Contacts</h2>
              <button
                onClick={() => {
                  setEditingContact(null);
                  setContactForm({ name: '', email: '', phone: '', role: '' });
                  setShowContactModal(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Add Contact
              </button>
            </div>
            <div className="bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {contacts.map((contact) => (
                      <tr key={contact.id}>
                        <td className="px-6 py-4 text-white">{contact.name}</td>
                        <td className="px-6 py-4 text-slate-300">{contact.email || '-'}</td>
                        <td className="px-6 py-4 text-slate-300">{contact.phone || '-'}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-purple-900/50 text-purple-300">
                            {contact.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {contact.is_active ? (
                            <span className="text-green-400">Active</span>
                          ) : (
                            <span className="text-red-400">Inactive</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditContact(contact)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteContact(contact.id)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingContact ? 'Edit' : 'Add'} Emergency Contact
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Name *</label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Phone</label>
                <input
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="+1234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Role *</label>
                <input
                  type="text"
                  value={contactForm.role}
                  onChange={(e) => setContactForm({ ...contactForm, role: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="Security, Manager, HR, etc."
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSaveContact}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowContactModal(false);
                  setEditingContact(null);
                  setContactForm({ name: '', email: '', phone: '', role: '' });
                }}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

