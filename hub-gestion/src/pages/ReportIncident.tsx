import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { INCIDENT_CATEGORIES, type IncidentCategory } from '../types/incident';
import { BILLIARDS } from '../types/booking';
import './ReportIncident.css';

const ReportIncident = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();

  const [category, setCategory] = useState<IncidentCategory | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [billiardId, setBilliardId] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photosPreviews, setPhotosPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files).slice(0, 5 - photos.length);
    setPhotos((prev) => [...prev, ...newFiles]);

    // Create previews
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotosPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotosPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category) {
      setError('Veuillez sélectionner une catégorie');
      return;
    }
    if (!title.trim()) {
      setError('Veuillez indiquer un titre');
      return;
    }
    if (!description.trim() || description.length < 20) {
      setError('Veuillez décrire le problème (minimum 20 caractères)');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Upload photos to Firebase Storage
      const photoUrls: string[] = [];
      for (const photo of photos) {
        const photoRef = ref(
          storage,
          `incidents/${user?.uid}/${Date.now()}_${photo.name}`
        );
        await uploadBytes(photoRef, photo);
        const url = await getDownloadURL(photoRef);
        photoUrls.push(url);
      }

      // Create incident document
      await addDoc(collection(db, 'incidents'), {
        userId: user?.uid,
        userEmail: user?.email,
        userName: `${userProfile?.firstName} ${userProfile?.lastName}`,
        category,
        title: title.trim(),
        description: description.trim(),
        photos: photoUrls,
        billiardId: billiardId || null,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error submitting incident:', err);
      setError('Erreur lors de l\'envoi du signalement');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="report-incident">
        <div className="success-message">
          <div className="success-icon">✓</div>
          <h2>Signalement envoyé !</h2>
          <p>Votre signalement a été transmis à l'administration.</p>
          <p>Vous serez redirigé vers le tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="report-incident">
      <header className="page-header">
        <h1>Signaler un incident</h1>
        <p>Signalez un problème constaté dans la salle de billard</p>
      </header>

      <form className="incident-form" onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}

        <div className="form-group">
          <label>Catégorie *</label>
          <div className="category-grid">
            {INCIDENT_CATEGORIES.map((cat) => (
              <label
                key={cat.value}
                className={`category-option ${category === cat.value ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="category"
                  value={cat.value}
                  checked={category === cat.value}
                  onChange={(e) => setCategory(e.target.value as IncidentCategory)}
                />
                <span>{cat.label}</span>
              </label>
            ))}
          </div>
        </div>

        {(category === 'billiard_damage' || category === 'equipment') && (
          <div className="form-group">
            <label>Billard concerné</label>
            <select
              value={billiardId}
              onChange={(e) => setBilliardId(e.target.value)}
            >
              <option value="">Sélectionner un billard</option>
              {BILLIARDS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} - {b.description}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label>Titre *</label>
          <input
            type="text"
            placeholder="Résumé du problème..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label>Description détaillée *</label>
          <textarea
            placeholder="Décrivez le problème en détail (minimum 20 caractères)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
          />
          <span className="char-count">{description.length}/500 caractères</span>
        </div>

        <div className="form-group">
          <label>Photos (optionnel, max 5)</label>
          <div className="photos-section">
            {photosPreviews.length > 0 && (
              <div className="photos-preview">
                {photosPreviews.map((preview, index) => (
                  <div key={index} className="photo-item">
                    <img src={preview} alt={`Photo ${index + 1}`} />
                    <button
                      type="button"
                      className="remove-photo"
                      onClick={() => removePhoto(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {photos.length < 5 && (
              <label className="photo-upload">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                />
                <span className="upload-icon">📷</span>
                <span>Ajouter une photo</span>
              </label>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/dashboard')}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Envoi en cours...' : 'Envoyer le signalement'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportIncident;
