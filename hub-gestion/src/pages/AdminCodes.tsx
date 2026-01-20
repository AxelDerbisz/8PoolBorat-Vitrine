import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import './AdminCodes.css';

interface AccessCodes {
  digicode: string;
  alarmOff: string;
  alarmOn: string;
  updatedAt?: Date;
  updatedBy?: string;
}

const AdminCodes = () => {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();

  const [codes, setCodes] = useState<AccessCodes | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Form fields
  const [digicode, setDigicode] = useState('');
  const [alarmOff, setAlarmOff] = useState('');
  const [alarmOn, setAlarmOn] = useState('');
  const [showCodes, setShowCodes] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }

    const fetchCodes = async () => {
      try {
        const docRef = doc(db, 'settings', 'accessCodes');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as AccessCodes;
          setCodes(data);
          setDigicode(data.digicode);
          setAlarmOff(data.alarmOff);
          setAlarmOn(data.alarmOn);
        } else {
          // Initialize with empty codes
          setCodes({ digicode: '', alarmOff: '', alarmOn: '' });
        }
      } catch (err) {
        console.error('Error fetching codes:', err);
        setError('Erreur lors du chargement des codes');
      } finally {
        setLoading(false);
      }
    };

    fetchCodes();
  }, [isAdmin, navigate]);

  const handleSave = async () => {
    if (!digicode.trim() || !alarmOff.trim() || !alarmOn.trim()) {
      setError('Tous les codes sont requis');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const docRef = doc(db, 'settings', 'accessCodes');
      const newCodes: AccessCodes = {
        digicode: digicode.trim(),
        alarmOff: alarmOff.trim(),
        alarmOn: alarmOn.trim(),
        updatedAt: new Date(),
        updatedBy: user?.email || '',
      };

      await setDoc(docRef, newCodes);
      setCodes(newCodes);
      setEditing(false);
      setSuccess('Codes mis à jour avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving codes:', err);
      setError('Erreur lors de la sauvegarde des codes');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    if (codes) {
      setDigicode(codes.digicode);
      setAlarmOff(codes.alarmOff);
      setAlarmOn(codes.alarmOn);
    }
    setError('');
  };

  const maskCode = (code: string) => {
    if (!code) return '----';
    return showCodes ? code : '•'.repeat(code.length);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Chargement des codes...</p>
      </div>
    );
  }

  return (
    <div className="admin-codes">
      <header className="page-header">
        <h1>Codes d'accès</h1>
        <p>Gérez les codes du digicode et de l'alarme</p>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="codes-card">
        <div className="card-header">
          <h2>Codes actuels</h2>
          <div className="header-actions">
            <button
              className="btn-icon"
              onClick={() => setShowCodes(!showCodes)}
              title={showCodes ? 'Masquer les codes' : 'Afficher les codes'}
            >
              {showCodes ? '🙈' : '👁️'}
            </button>
            {!editing && (
              <button className="btn btn-secondary" onClick={() => setEditing(true)}>
                Modifier
              </button>
            )}
          </div>
        </div>

        {!editing ? (
          <div className="codes-display">
            <div className="code-item">
              <div className="code-icon">🚪</div>
              <div className="code-info">
                <span className="code-label">Code Digicode</span>
                <span className="code-value">{maskCode(codes?.digicode || '')}</span>
              </div>
            </div>

            <div className="code-item">
              <div className="code-icon">🔓</div>
              <div className="code-info">
                <span className="code-label">Code Alarme (Désactivation)</span>
                <span className="code-value">{maskCode(codes?.alarmOff || '')}</span>
              </div>
            </div>

            <div className="code-item">
              <div className="code-icon">🔒</div>
              <div className="code-info">
                <span className="code-label">Code Alarme (Activation)</span>
                <span className="code-value">{maskCode(codes?.alarmOn || '')}</span>
              </div>
            </div>

            {codes?.updatedAt && (
              <p className="last-update">
                Dernière mise à jour le{' '}
                {new Date(codes.updatedAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {codes.updatedBy && ` par ${codes.updatedBy}`}
              </p>
            )}
          </div>
        ) : (
          <div className="codes-form">
            <div className="form-group">
              <label>Code Digicode *</label>
              <input
                type="text"
                value={digicode}
                onChange={(e) => setDigicode(e.target.value)}
                placeholder="Ex: 1234"
                maxLength={10}
              />
            </div>

            <div className="form-group">
              <label>Code Alarme - Désactivation *</label>
              <input
                type="text"
                value={alarmOff}
                onChange={(e) => setAlarmOff(e.target.value)}
                placeholder="Ex: 5678"
                maxLength={10}
              />
              <span className="help-text">Code à entrer en arrivant</span>
            </div>

            <div className="form-group">
              <label>Code Alarme - Activation *</label>
              <input
                type="text"
                value={alarmOn}
                onChange={(e) => setAlarmOn(e.target.value)}
                placeholder="Ex: 9012"
                maxLength={10}
              />
              <span className="help-text">Code à entrer en partant</span>
            </div>

            <div className="form-actions">
              <button className="btn btn-secondary" onClick={handleCancel}>
                Annuler
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="info-card">
        <h3>Information</h3>
        <p>
          Ces codes sont envoyés automatiquement aux adhérents lorsqu'une
          réservation est confirmée. Veillez à les mettre à jour si vous
          changez les codes physiques de la salle.
        </p>
      </div>

      <div className="back-link">
        <button className="btn btn-text" onClick={() => navigate('/dashboard')}>
          ← Retour au tableau de bord
        </button>
      </div>
    </div>
  );
};

export default AdminCodes;
