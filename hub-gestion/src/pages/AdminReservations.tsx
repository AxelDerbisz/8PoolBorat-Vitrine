import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, doc, updateDoc, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Booking } from '../types/booking';
import './AdminReservations.css';

const AdminReservations = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'refused'>('pending');
  const [processing, setProcessing] = useState<string | null>(null);
  const [adminComment, setAdminComment] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      const q = query(
        collection(db, 'bookings'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const bookingsData: Booking[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        bookingsData.push({
          id: doc.id,
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

      setBookings(bookingsData);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchBookings();
  }, [isAdmin, navigate, fetchBookings]);

  const handleValidate = async (bookingId: string) => {
    setProcessing(bookingId);
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'confirmed',
        adminComment: adminComment || '',
        updatedAt: Timestamp.now(),
      });
      setAdminComment('');
      setSelectedBooking(null);
      fetchBookings();
    } catch (err) {
      console.error('Error validating booking:', err);
    } finally {
      setProcessing(null);
    }
  };

  const handleRefuse = async (bookingId: string) => {
    if (!adminComment) {
      alert('Veuillez indiquer un motif de refus');
      return;
    }
    setProcessing(bookingId);
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'refused',
        adminComment: adminComment,
        updatedAt: Timestamp.now(),
      });
      setAdminComment('');
      setSelectedBooking(null);
      fetchBookings();
    } catch (err) {
      console.error('Error refusing booking:', err);
    } finally {
      setProcessing(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'all') return true;
    return b.status === filter;
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
        <p>Chargement des réservations...</p>
      </div>
    );
  }

  return (
    <div className="admin-reservations">
      <header className="page-header">
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          ← Retour
        </button>
        <h1>✅ Validation des réservations</h1>
        <p>Gérer les demandes de réservation des adhérents</p>
      </header>

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-number">{bookings.filter((b) => b.status === 'pending').length}</span>
          <span className="stat-label">En attente</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{bookings.filter((b) => b.status === 'confirmed').length}</span>
          <span className="stat-label">Confirmées</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{bookings.filter((b) => b.status === 'refused').length}</span>
          <span className="stat-label">Refusées</span>
        </div>
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          En attente ({bookings.filter((b) => b.status === 'pending').length})
        </button>
        <button
          className={`filter-tab ${filter === 'confirmed' ? 'active' : ''}`}
          onClick={() => setFilter('confirmed')}
        >
          Confirmées
        </button>
        <button
          className={`filter-tab ${filter === 'refused' ? 'active' : ''}`}
          onClick={() => setFilter('refused')}
        >
          Refusées
        </button>
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Toutes
        </button>
      </div>

      <div className="bookings-list">
        {filteredBookings.length === 0 ? (
          <div className="empty-state">
            <p>Aucune réservation {filter !== 'all' ? `${filter === 'pending' ? 'en attente' : filter === 'confirmed' ? 'confirmée' : 'refusée'}` : ''}</p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div key={booking.id} className={`booking-card ${booking.status}`}>
              <div className="booking-header">
                <div className="booking-user">
                  <strong>{booking.userName}</strong>
                  <span className="user-email">{booking.userEmail}</span>
                </div>
                {getStatusBadge(booking.status)}
              </div>

              <div className="booking-details">
                <div className="detail-row">
                  <span className="detail-label">📅 Date:</span>
                  <span className="detail-value">
                    {format(booking.startTime, 'EEEE d MMMM yyyy', { locale: fr })}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">🕐 Horaire:</span>
                  <span className="detail-value">
                    {format(booking.startTime, 'HH:mm')} - {format(booking.endTime, 'HH:mm')}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">🎱 Billard:</span>
                  <span className="detail-value">{booking.billiardName}</span>
                </div>
                {booking.companions.length > 0 && (
                  <div className="detail-row">
                    <span className="detail-label">👥 Accompagnants:</span>
                    <span className="detail-value">{booking.companions.join(', ')}</span>
                  </div>
                )}
                {booking.comment && (
                  <div className="detail-row">
                    <span className="detail-label">💬 Commentaire:</span>
                    <span className="detail-value">{booking.comment}</span>
                  </div>
                )}
                {booking.adminComment && (
                  <div className="detail-row admin-comment">
                    <span className="detail-label">📝 Réponse admin:</span>
                    <span className="detail-value">{booking.adminComment}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="detail-label">📆 Demande le:</span>
                  <span className="detail-value">
                    {format(booking.createdAt, 'dd/MM/yyyy à HH:mm')}
                  </span>
                </div>
              </div>

              {booking.status === 'pending' && (
                <div className="booking-actions">
                  {selectedBooking === booking.id ? (
                    <div className="action-form">
                      <textarea
                        placeholder="Commentaire (obligatoire pour refuser)..."
                        value={adminComment}
                        onChange={(e) => setAdminComment(e.target.value)}
                        rows={2}
                      />
                      <div className="action-buttons">
                        <button
                          className="btn btn-success"
                          onClick={() => handleValidate(booking.id)}
                          disabled={processing === booking.id}
                        >
                          {processing === booking.id ? '...' : '✓ Valider'}
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleRefuse(booking.id)}
                          disabled={processing === booking.id}
                        >
                          {processing === booking.id ? '...' : '✗ Refuser'}
                        </button>
                        <button
                          className="btn btn-secondary"
                          onClick={() => {
                            setSelectedBooking(null);
                            setAdminComment('');
                          }}
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="btn btn-primary"
                      onClick={() => setSelectedBooking(booking.id)}
                    >
                      Traiter la demande
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminReservations;
