import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Home, Package, Calendar, ClipboardList, Users, Cog, Layers, FileText } from 'lucide-react';
import { settingsAPI } from '../services/api';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [siteName, setSiteName] = useState(import.meta.env.VITE_SITE_NAME || 'Lab Manager');

  useEffect(() => {
    const fetchSiteName = async () => {
      try {
        const res = await settingsAPI.getByKey('site_name');
        if (res.data.setting.setting_value) {
          setSiteName(res.data.setting.setting_value);
        }
      } catch (error) {
        console.error('Failed to fetch site name:', error);
      }
    };
    fetchSiteName();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/equipment', label: 'Equipment', icon: Package },
    { path: '/bookings', label: 'Bookings', icon: Calendar },
    { path: '/documents', label: 'Documents', icon: FileText },
    { path: '/records', label: 'Records', icon: ClipboardList },
    { path: '/users', label: 'Users', icon: Users, adminOnly: true },
    { path: '/categories', label: 'Categories', icon: Layers, adminOnly: true },
    { path: '/settings', label: 'Settings', icon: Cog },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        backgroundColor: 'white',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>
              {siteName}
            </h1>
            <nav style={{ display: 'flex', gap: '1rem' }}>
              {navItems.map((item) => {
                if (item.adminOnly && !isAdmin) return null;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      textDecoration: 'none',
                      color: location.pathname === item.path ? 'var(--primary)' : 'var(--gray)',
                      backgroundColor: location.pathname === item.path ? 'var(--gray-light)' : 'transparent',
                      fontWeight: location.pathname === item.path ? '600' : '400',
                    }}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{user?.full_name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray)' }}>
                {user?.role === 'admin' ? 'Administrator' : 'User'}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>
      <main style={{ flex: 1, padding: '2rem 0' }}>
        <div className="container">
          {children}
        </div>
      </main>
      <footer style={{
        backgroundColor: 'white',
        borderTop: '1px solid var(--border)',
        padding: '1rem',
        textAlign: 'center',
        color: 'var(--gray)',
        fontSize: '0.875rem',
      }}>
        {siteName} © {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default Layout;
