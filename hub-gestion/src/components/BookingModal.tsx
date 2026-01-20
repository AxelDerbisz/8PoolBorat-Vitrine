import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Booking, BookingFormData } from '../types/booking';
import { BILLIARDS } from '../types/booking';
import './BookingModal.css';

interface BookingModalProps {
  selectedSlot: { start: Date; end: Date };
  onClose: () => void;
  onSubmit: (data: BookingFormData) => Promise<void>;
  submitting: boolean;
  existingBookings: Booking[];
}

const BookingModal = ({
  selectedSlot,
  onClose,
  onSubmit,
  submitting,
  existingBookings,
}: BookingModalProps) => {
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<BookingFormData>({
    defaultValues: {
      billiardId: '',
      date: format(selectedSlot.start, 'yyyy-MM-dd'),
      startTime: format(selectedSlot.start, 'HH:mm'),
      endTime: format(selectedSlot.end, 'HH:mm'),
      companions: '',
      comment: '',
    },
  });

  const watchDate = watch('date');
  const watchStartTime = watch('startTime');
  const watchEndTime = watch('endTime');
  const watchBilliardId = watch('billiardId');

  const getAvailableBilliards = () => {
    if (!watchDate || !watchStartTime || !watchEndTime) return BILLIARDS;

    const startDateTime = new Date(`${watchDate}T${watchStartTime}`);
    const endDateTime = new Date(`${watchDate}T${watchEndTime}`);

    return BILLIARDS.map((billiard) => {
      const isBooked = existingBookings.some(
        (b) =>
          b.billiardId === billiard.id &&
          b.status !== 'cancelled' &&
          b.status !== 'refused' &&
          ((startDateTime >= b.startTime && startDateTime < b.endTime) ||
            (endDateTime > b.startTime && endDateTime <= b.endTime) ||
            (startDateTime <= b.startTime && endDateTime >= b.endTime))
      );

      return {
        ...billiard,
        isAvailable: !isBooked,
      };
    });
  };

  const availableBilliards = getAvailableBilliards();

  const handleFormSubmit = (data: BookingFormData) => {
    setFormError('');

    if (!data.billiardId) {
      setFormError('Veuillez sélectionner un billard');
      return;
    }

    if (data.startTime >= data.endTime) {
      setFormError("L'heure de fin doit être après l'heure de début");
      return;
    }

    onSubmit(data);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Nouvelle réservation</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-slot-info">
          <span className="slot-date">
            📅 {watchDate ? format(new Date(watchDate), 'EEEE d MMMM yyyy', { locale: fr }) : format(selectedSlot.start, 'EEEE d MMMM yyyy', { locale: fr })}
          </span>
          <span className="slot-time">
            🕐 {watchStartTime || '10:00'} - {watchEndTime || '12:00'}
          </span>
          {!watchBilliardId && <span className="slot-warning">Veuillez sélectionner un billard</span>}
        </div>

        {formError && <div className="form-error">{formError}</div>}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="booking-form">
          <div className="form-group">
            <label>Date</label>
            <input type="date" {...register('date', { required: true })} />
            {errors.date && <span className="error">Veuillez sélectionner une date</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Heure de début</label>
              <input type="time" {...register('startTime', { required: true })} min="08:00" max="22:00" />
              {errors.startTime && <span className="error">Heure de début requise</span>}
            </div>

            <div className="form-group">
              <label>Heure de fin</label>
              <input type="time" {...register('endTime', { required: true })} min="08:00" max="22:00" />
              {errors.endTime && <span className="error">Heure de fin requise</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Choisir un billard</label>
            <div className="billiard-grid">
              {availableBilliards.map((billiard) => (
                <label
                  key={billiard.id}
                  className={`billiard-option ${!billiard.isAvailable ? 'unavailable' : ''} ${
                    watchBilliardId === billiard.id ? 'selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    {...register('billiardId')}
                    value={billiard.id}
                    disabled={!billiard.isAvailable}
                  />
                  <span className="billiard-name">{billiard.name}</span>
                  <span className="billiard-status">
                    {billiard.isAvailable ? '✓ Disponible' : '✗ Occupé'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Accompagnants (optionnel)</label>
            <textarea
              {...register('companions')}
              placeholder="Un nom par ligne"
              rows={3}
            />
            <span className="help-text">Indiquez les personnes qui vous accompagneront</span>
          </div>

          <div className="form-group">
            <label>Commentaire (optionnel)</label>
            <textarea
              {...register('comment')}
              placeholder="Informations complémentaires..."
              rows={2}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Envoi...' : 'Demander la réservation'}
            </button>
          </div>
        </form>

        <p className="modal-note">
          ⓘ Votre réservation sera soumise à validation par un administrateur.
          Vous recevrez une confirmation par email.
        </p>
      </div>
    </div>
  );
};

export default BookingModal;
