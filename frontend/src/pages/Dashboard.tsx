import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, AlertCircle } from 'lucide-react';
import { equipmentAPI, bookingsAPI, remarksAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEquipment: 0,
    activeEquipment: 0,
    myBookings: 0,
    pendingBookings: 0,
    unresolvedRemarks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [equipmentRes, bookingsRes, remarksRes] = await Promise.all([
          equipmentAPI.getAll(),
          bookingsAPI.getAll({ user_id: user?.id }),
          remarksAPI.getAll({ resolved: false }),
        ]);

        const equipment = equipmentRes.data.equipment;
        const bookings = bookingsRes.data.bookings;
        const remarks = remarksRes.data.remarks;

        setStats({
          totalEquipment: equipment.length,
          activeEquipment: equipment.filter((e) => e.status === 'active').length,
          myBookings: bookings.filter((b) => ['pending', 'confirmed'].includes(b.status)).length,
          pendingBookings: bookings.filter((b) => b.status === 'pending').length,
          unresolvedRemarks: remarks.length,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  const statCards = [
    {
      title: 'Total Equipment',
      value: stats.totalEquipment,
      icon: Package,
      color: '#3b82f6',
      link: '/equipment',
    },
    {
      title: 'Active Equipment',
      value: stats.activeEquipment,
      icon: Package,
      color: '#10b981',
      link: '/equipment?status=active',
    },
    {
      title: 'My Bookings',
      value: stats.myBookings,
      icon: Calendar,
      color: '#f59e0b',
      link: '/bookings',
    },
    {
      title: 'Unresolved Issues',
      value: stats.unresolvedRemarks,
      icon: AlertCircle,
      color: '#ef4444',
      link: '/remarks',
    },
  ];

  return (
    <Layout>
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          Welcome back, {user?.full_name}!
        </h1>
        <p style={{ color: 'var(--gray)', marginBottom: '2rem' }}>
          Here's what's happening in your laboratory today.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}>
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.title}
                to={stat.link}
                style={{ textDecoration: 'none' }}
              >
                <div className="card" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '0.5rem',
                    backgroundColor: `${stat.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Icon size={24} color={stat.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--gray)', marginBottom: '0.25rem' }}>
                      {stat.title}
                    </div>
                    <div style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--dark)' }}>
                      {stat.value}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}>
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              Quick Actions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link to="/equipment" className="btn btn-primary" style={{ justifyContent: 'center' }}>
                <Package size={18} />
                Book Equipment
              </Link>
              <Link to="/bookings" className="btn btn-secondary" style={{ justifyContent: 'center' }}>
                <Calendar size={18} />
                View My Bookings
              </Link>
              <Link to="/remarks" className="btn btn-outline" style={{ justifyContent: 'center' }}>
                <AlertCircle size={18} />
                Report Issue
              </Link>
            </div>
          </div>

          <div className="card">
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              System Information
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray)' }}>Your Role:</span>
                <span style={{ fontWeight: '600' }}>
                  {user?.role === 'admin' ? 'Administrator' : 'User'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray)' }}>Department:</span>
                <span style={{ fontWeight: '600' }}>{user?.department || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--gray)' }}>Email:</span>
                <span style={{ fontWeight: '600' }}>{user?.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
