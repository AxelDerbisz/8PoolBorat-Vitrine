import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Booking } from '../types/booking';
import './MyReservations.css';

const MyReservations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyBookings = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, 'bookings'),
          where('userId', '==', user.uid)
        );

        const querySnapshot = await getDocs(q);
        const bookingsData: Booking[] = [];

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          bookingsData.push({
            id: docSnap.id,
            userId: data.userId,
            userEmail: data.userEmail,
            userName: data.userName,
            billiardId: data.billiardId,
            billiardName: data.billiardName,
            startTime: data.startTime.toDate(),
            endTime: data.endTime.toDate(),
            companions: data.companions || [],
            comment: data.comment || '',
            status: data.status,
            adminComment: data.adminComment,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          });
        });

        // Sort by startTime descending (client-side)
        bookingsData.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

        setBookings(bookingsData);
      } catch (err) {
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyBookings();
  }, [user]);

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      return;
    }

    setCancelling(bookingId);
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'cancelled',
        updatedAt: Timestamp.now(),
      });

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: 'cancelled' } : b
        )
      );
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Erreur lors de l\'annulation');
    } finally {
      setCancelling(null);
    }
  };

  const now = new Date();
  const filteredBookings = bookings.filter((b) => {
    if (filter === 'upcoming') {
      return b.startTime >= now && b.status !== 'cancelled' && b.status !== 'refused';
    }
    if (filter === 'past') {
      return b.startTime < now || b.status === 'cancelled' || b.status === 'refused';
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-pending">En attente</span>;
      case 'confirmed':
        return <span className="badge badge-confirmed">Confirmé</span>;
      case 'refused':
        return <span className="badge badge-refused">Refusé</span>;
      case 'cancelled':
        return <span className="badge badge-cancelled">Annulé</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Chargement de vos réservations...</p>
      </div>
    );
  }

  return (
    <div className="my-reservations">
      <header className="page-header">
        <h1>Mes Réservations</h1>
        <p>Consultez et gérez vos demandes de réservation</p>
      </header>

      <div className="actions-bar">
        <button className="btn btn-primary" onClick={() => navigate('/reservations')}>
          + Nouvelle réservation
        </button>
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'upcoming' ? 'active' : ''}`}
          onClick={() => setFilter('upcoming')}
        >
          À venir ({bookings.filter((b) => b.startTime >= now && b.status !== 'cancelled' && b.status !== 'refused').length})
        </button>
        <button
          className={`filter-tab ${filter === 'past' ? 'active' : ''}`}
          onClick={() => setFilter('past')}
        >
          Passées / Annulées
        </button>
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Toutes ({bookings.length})
        </button>
      </div>

      <div className="reservations-list">
        {filteredBookings.length === 0 ? (
          <div className="empty-state">
            <p>
              {filter === 'upcoming'
                ? 'Aucune réservation à venir'
                : filter === 'past'
                ? 'Aucune réservation passée'
                : 'Aucune réservation'}
            </p>
            {filter === 'upcoming' && (
              <button className="btn btn-primary" onClick={() => navigate('/reservations')}>
                Faire une réservation
              </button>
            )}
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div key={booking.id} className={`reservation-card ${booking.status}`}>
              <div className="reservation-header">
                <div className="reservation-date">
                  <span className="day">
                    {format(booking.startTime, 'EEEE', { locale: fr })}
                  </span>
                  <span className="date">
                    {format(booking.startTime, 'd MMMM yyyy', { locale: fr })}
                  </span>
                </div>
                {getStatusBadge(booking.status)}
              </div>

              <div className="reservation-details">
                <div className="detail-item">
                  <span className="detail-icon">🕐</span>
                  <span>
                    {format(booking.startTime, 'HH:mm')} - {format(booking.endTime, 'HH:mm')}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">🎱</span>
                  <span>{booking.billiardName}</span>
                </div>
                {booking.companions.length > 0 && (
                  <div className="detail-item">
                    <span className="detail-icon">👥</span>
                    <span>{booking.companions.join(', ')}</span>
                  </div>
                )}
                {booking.comment && (
                  <div className="detail-item">
                    <span className="detail-icon">💬</span>
                    <span>{booking.comment}</span>
                  </div>
                )}
              </div>

              {booking.adminComment && (
                <div className="admin-response">
                  <strong>Réponse du club :</strong> {booking.adminComment}
                </div>
              )}

              {booking.status === 'confirmed' && (
                <div className="confirmed-info">
                  <p>Votre réservation est confirmée. Les codes d'accès vous seront envoyés par email.</p>
                </div>
              )}

              {(booking.status === 'pending' || booking.status === 'confirmed') && booking.startTime > now && (
                <div className="reservation-actions">
                  <button
                    className="btn btn-danger-outline"
                    onClick={() => handleCancel(booking.id)}
                    disabled={cancelling === booking.id}
                  >
                    {cancelling === booking.id ? 'Annulation...' : 'Annuler la réservation'}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyReservations;
