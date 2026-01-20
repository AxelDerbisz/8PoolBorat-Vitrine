import { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, type View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addHours, isBefore, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { collection, query, where, getDocs, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { Booking, BookingFormData } from '../types/booking';
import { BILLIARDS, DEFAULT_BLOCKED_SLOTS } from '../types/booking';
import BookingModal from '../components/BookingModal';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Reservations.css';

const locales = { fr };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Booking;
}

const Reservations = () => {
  const { user, userProfile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentView, setCurrentView] = useState<View>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchBookings = useCallback(async () => {
    try {
      const startDate = addDays(new Date(), -7);
      const endDate = addDays(new Date(), 30);

      const q = query(
        collection(db, 'bookings'),
        where('startTime', '>=', Timestamp.fromDate(startDate)),
        where('startTime', '<=', Timestamp.fromDate(endDate))
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
      setError('Erreur lors du chargement des réservations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const events: CalendarEvent[] = bookings
    .filter((b) => b.status !== 'cancelled' && b.status !== 'refused')
    .map((booking) => ({
      id: booking.id,
      title: `${booking.billiardName} - ${booking.userName}${booking.status === 'pending' ? ' (En attente)' : ''}`,
      start: booking.startTime,
      end: booking.endTime,
      resource: booking,
    }));

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    // Check if at least 24h in advance
    const minBookingTime = addHours(new Date(), 24);
    if (isBefore(start, minBookingTime)) {
      setError('Les réservations doivent être faites au moins 24h à l\'avance');
      setTimeout(() => setError(''), 5000);
      return;
    }

    // Check if blocked slot
    const dayOfWeek = getDay(start);
    const startHour = start.getHours();
    const endHour = end.getHours();

    for (const blocked of DEFAULT_BLOCKED_SLOTS) {
      if (
        blocked.dayOfWeek === dayOfWeek &&
        ((startHour >= blocked.startHour && startHour < blocked.endHour) ||
          (endHour > blocked.startHour && endHour <= blocked.endHour))
      ) {
        setError(`Ce créneau est bloqué : ${blocked.reason}`);
        setTimeout(() => setError(''), 5000);
        return;
      }
    }

    setSelectedSlot({ start, end });
    setShowModal(true);
  };

  const handleBookingSubmit = async (formData: BookingFormData) => {
    if (!user || !userProfile) return;

    setSubmitting(true);
    setError('');

    try {
      const billiard = BILLIARDS.find((b) => b.id === formData.billiardId);
      if (!billiard) {
        setError('Billard non trouvé');
        return;
      }

      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

      // Check for conflicts
      const conflictingBooking = bookings.find(
        (b) =>
          b.billiardId === formData.billiardId &&
          b.status !== 'cancelled' &&
          b.status !== 'refused' &&
          ((startDateTime >= b.startTime && startDateTime < b.endTime) ||
            (endDateTime > b.startTime && endDateTime <= b.endTime) ||
            (startDateTime <= b.startTime && endDateTime >= b.endTime))
      );

      if (conflictingBooking) {
        setError('Ce créneau est déjà réservé pour ce billard');
        return;
      }

      const companions = formData.companions
        .split('\n')
        .map((c) => c.trim())
        .filter((c) => c);

      await addDoc(collection(db, 'bookings'), {
        userId: user.uid,
        userEmail: user.email,
        userName: `${userProfile.firstName} ${userProfile.lastName}`,
        billiardId: formData.billiardId,
        billiardName: billiard.name,
        startTime: Timestamp.fromDate(startDateTime),
        endTime: Timestamp.fromDate(endDateTime),
        companions,
        comment: formData.comment,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSuccess('Réservation envoyée ! Elle sera validée par un administrateur.');
      setShowModal(false);
      fetchBookings();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('Erreur lors de la création de la réservation');
    } finally {
      setSubmitting(false);
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#1a472a';

    if (event.resource.status === 'pending') {
      backgroundColor = '#f59e0b';
    } else if (event.resource.userId === user?.uid) {
      backgroundColor = '#2563eb';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        fontSize: '12px',
      },
    };
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Chargement du calendrier...</p>
      </div>
    );
  }

  return (
    <div className="reservations-page">
      <header className="page-header">
        <h1>📅 Réservation de créneaux</h1>
        <p>Cliquez sur un créneau libre pour réserver un billard</p>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#1a472a' }}></span>
          <span>Confirmé</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#f59e0b' }}></span>
          <span>En attente</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#2563eb' }}></span>
          <span>Ma réservation</span>
        </div>
      </div>

      <div className="calendar-container">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          selectable
          onSelectSlot={handleSelectSlot}
          eventPropGetter={eventStyleGetter}
          view={currentView}
          onView={setCurrentView}
          date={currentDate}
          onNavigate={setCurrentDate}
          min={new Date(0, 0, 0, 8, 0, 0)}
          max={new Date(0, 0, 0, 22, 0, 0)}
          step={30}
          timeslots={2}
          messages={{
            today: "Aujourd'hui",
            previous: 'Précédent',
            next: 'Suivant',
            month: 'Mois',
            week: 'Semaine',
            day: 'Jour',
            agenda: 'Agenda',
            date: 'Date',
            time: 'Heure',
            event: 'Événement',
            noEventsInRange: 'Aucune réservation sur cette période',
          }}
          culture="fr"
        />
      </div>

      {showModal && selectedSlot && (
        <BookingModal
          selectedSlot={selectedSlot}
          onClose={() => setShowModal(false)}
          onSubmit={handleBookingSubmit}
          submitting={submitting}
          existingBookings={bookings}
        />
      )}
    </div>
  );
};

export default Reservations;
