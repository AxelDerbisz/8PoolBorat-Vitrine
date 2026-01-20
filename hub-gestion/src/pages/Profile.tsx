import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.firstName || '');
      setLastName(userProfile.lastName || '');
      setPhone(userProfile.phone || '');
    }
  }, [userProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      setError('Prénom et nom sont requis');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateDoc(doc(db, 'users', user!.uid), {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        updatedAt: new Date(),
      });

      await refreshUserProfile();
      setSuccess('Profil mis à jour avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setChangingPassword(true);
    setError('');
    setSuccess('');

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user!.email!, currentPassword);
      await reauthenticateWithCredential(auth.currentUser!, credential);

      // Update password
      await updatePassword(auth.currentUser!, newPassword);

      setSuccess('Mot de passe modifié avec succès');
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      console.error('Error changing password:', err);
      const firebaseError = err as { code?: string };
      if (firebaseError.code === 'auth/wrong-password') {
        setError('Mot de passe actuel incorrect');
      } else {
        setError('Erreur lors du changement de mot de passe');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="profile-page">
      <header className="page-header">
        <h1>Mon Profil</h1>
        <p>Gérez vos informations personnelles</p>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="profile-sections">
        <section className="profile-section">
          <h2>Informations personnelles</h2>
          <form onSubmit={handleSaveProfile}>
            <div className="form-row">
              <div className="form-group">
                <label>Prénom *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Votre prénom"
                />
              </div>
              <div className="form-group">
                <label>Nom *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Votre nom"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <input type="email" value={user?.email || ''} disabled />
              <span className="help-text">L'email ne peut pas être modifié</span>
            </div>

            <div className="form-group">
              <label>Téléphone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="06 12 34 56 78"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </form>
        </section>

        <section className="profile-section">
          <h2>Sécurité</h2>
          {!showPasswordForm ? (
            <button
              className="btn btn-secondary"
              onClick={() => setShowPasswordForm(true)}
            >
              Changer mon mot de passe
            </button>
          ) : (
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>Mot de passe actuel</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div className="form-group">
                <label>Nouveau mot de passe</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 caractères"
                />
              </div>

              <div className="form-group">
                <label>Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={changingPassword}
                >
                  {changingPassword ? 'Modification...' : 'Changer le mot de passe'}
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="profile-section">
          <h2>Informations du compte</h2>
          <div className="info-list">
            <div className="info-item">
              <span className="info-label">Membre depuis</span>
              <span className="info-value">
                {userProfile?.createdAt
                  ? new Date(userProfile.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '-'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Statut</span>
              <span className="info-value">
                {userProfile?.role === 'admin' ? (
                  <span className="badge badge-admin">Administrateur</span>
                ) : (
                  <span className="badge badge-member">Membre</span>
                )}
              </span>
            </div>
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

export default Profile;
