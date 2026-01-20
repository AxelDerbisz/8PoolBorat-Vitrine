import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, where, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { startOfMonth, endOfMonth, subMonths, getDay } from 'date-fns';
import { BILLIARDS } from '../types/booking';
import './AdminStats.css';

interface BookingData {
  billiardId: string;
  startTime: Date;
  endTime: Date;
  status: string;
}

interface BilliardStats {
  id: string;
  name: string;
  totalBookings: number;
  totalHours: number;
}

interface DayStats {
  day: string;
  count: number;
}

const AdminStats = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [period, setPeriod] = useState<'current' | 'last' | 'last3'>('current');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }

    const fetchBookings = async () => {
      setLoading(true);
      try {
        let startDate: Date;
        const endDate = endOfMonth(new Date());

        switch (period) {
          case 'last':
            startDate = startOfMonth(subMonths(new Date(), 1));
            break;
          case 'last3':
            startDate = startOfMonth(subMonths(new Date(), 3));
            break;
          default:
            startDate = startOfMonth(new Date());
        }

        const q = query(
          collection(db, 'bookings'),
          where('startTime', '>=', Timestamp.fromDate(startDate)),
          where('startTime', '<=', Timestamp.fromDate(endDate))
        );

        const querySnapshot = await getDocs(q);
        const data: BookingData[] = [];

        querySnapshot.forEach((doc) => {
          const d = doc.data();
          data.push({
            billiardId: d.billiardId,
            startTime: d.startTime.toDate(),
            endTime: d.endTime.toDate(),
            status: d.status,
          });
        });

        setBookings(data);
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [isAdmin, navigate, period]);

  // Calculate stats
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const totalBookings = confirmedBookings.length;
  const totalHours = confirmedBookings.reduce((acc, b) => {
    return acc + (b.endTime.getTime() - b.startTime.getTime()) / (1000 * 60 * 60);
  }, 0);

  // Stats by billiard
  const billiardStats: BilliardStats[] = BILLIARDS.map((billiard) => {
    const billiardBookings = confirmedBookings.filter((b) => b.billiardId === billiard.id);
    const hours = billiardBookings.reduce((acc, b) => {
      return acc + (b.endTime.getTime() - b.startTime.getTime()) / (1000 * 60 * 60);
    }, 0);
    return {
      id: billiard.id,
      name: billiard.name,
      totalBookings: billiardBookings.length,
      totalHours: hours,
    };
  }).sort((a, b) => b.totalBookings - a.totalBookings);

  // Stats by day of week
  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const dayStats: DayStats[] = dayNames.map((day, index) => ({
    day,
    count: confirmedBookings.filter((b) => getDay(b.startTime) === index).length,
  }));

  // Peak hours
  const hourStats: { hour: number; count: number }[] = [];
  for (let h = 8; h <= 22; h++) {
    const count = confirmedBookings.filter((b) => {
      const startHour = b.startTime.getHours();
      return startHour === h;
    }).length;
    hourStats.push({ hour: h, count });
  }

  const maxDayCount = Math.max(...dayStats.map((d) => d.count), 1);
  const maxHourCount = Math.max(...hourStats.map((h) => h.count), 1);
  const maxBilliardBookings = Math.max(...billiardStats.map((b) => b.totalBookings), 1);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Chargement des statistiques...</p>
      </div>
    );
  }

  return (
    <div className="admin-stats">
      <header className="page-header">
        <h1>Statistiques d'utilisation</h1>
        <p>Analysez l'utilisation de la salle et des billards</p>
      </header>

      <div className="period-selector">
        <button
          className={`period-btn ${period === 'current' ? 'active' : ''}`}
          onClick={() => setPeriod('current')}
        >
          Ce mois
        </button>
        <button
          className={`period-btn ${period === 'last' ? 'active' : ''}`}
          onClick={() => setPeriod('last')}
        >
          Mois dernier
        </button>
        <button
          className={`period-btn ${period === 'last3' ? 'active' : ''}`}
          onClick={() => setPeriod('last3')}
        >
          3 derniers mois
        </button>
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <span className="stat-number">{totalBookings}</span>
          <span className="stat-label">Réservations confirmées</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{totalHours.toFixed(1)}h</span>
          <span className="stat-label">Heures d'utilisation</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {totalBookings > 0 ? (totalHours / totalBookings).toFixed(1) : 0}h
          </span>
          <span className="stat-label">Durée moyenne</span>
        </div>
      </div>

      <div className="stats-grid">
        <section className="stats-section">
          <h2>Utilisation par billard</h2>
          <div className="chart-bars">
            {billiardStats.map((stat) => (
              <div key={stat.id} className="bar-row">
                <span className="bar-label">{stat.name}</span>
                <div className="bar-container">
                  <div
                    className="bar"
                    style={{ width: `${(stat.totalBookings / maxBilliardBookings) * 100}%` }}
                  ></div>
                </div>
                <span className="bar-value">{stat.totalBookings}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="stats-section">
          <h2>Réservations par jour</h2>
          <div className="chart-bars">
            {dayStats.map((stat) => (
              <div key={stat.day} className="bar-row">
                <span className="bar-label">{stat.day}</span>
                <div className="bar-container">
                  <div
                    className="bar bar-day"
                    style={{ width: `${(stat.count / maxDayCount) * 100}%` }}
                  ></div>
                </div>
                <span className="bar-value">{stat.count}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="stats-section full-width">
          <h2>Heures de pointe</h2>
          <div className="hour-chart">
            {hourStats.map((stat) => (
              <div key={stat.hour} className="hour-bar">
                <div
                  className="hour-fill"
                  style={{ height: `${(stat.count / maxHourCount) * 100}%` }}
                ></div>
                <span className="hour-label">{stat.hour}h</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="back-link">
        <button className="btn btn-text" onClick={() => navigate('/dashboard')}>
          ← Retour au tableau de bord
        </button>
      </div>
    </div>
  );
};

export default AdminStats;
