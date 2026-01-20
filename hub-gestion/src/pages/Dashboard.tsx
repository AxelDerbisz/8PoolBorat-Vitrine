import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { user, userProfile, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <div className="welcome-card">
        <h2>Bienvenue, {userProfile?.firstName || user?.email} !</h2>
        <p>Gérez vos réservations et votre espace adhérent.</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card" onClick={() => navigate('/reservations')}>
          <div className="card-icon">📅</div>
          <h3>Réservations</h3>
          <p>Réserver un créneau de billard</p>
        </div>

        <div className="dashboard-card" onClick={() => navigate('/my-reservations')}>
          <div className="card-icon">📋</div>
          <h3>Mes Réservations</h3>
          <p>Voir mes réservations en cours</p>
        </div>

        <div className="dashboard-card" onClick={() => navigate('/signalement')}>
          <div className="card-icon">⚠️</div>
          <h3>Signaler un incident</h3>
          <p>Signaler un problème dans la salle</p>
        </div>

        <div className="dashboard-card" onClick={() => navigate('/profil')}>
          <div className="card-icon">👤</div>
          <h3>Mon Profil</h3>
          <p>Modifier mes informations</p>
        </div>

        {isAdmin && (
          <>
            <div className="dashboard-card admin-card" onClick={() => navigate('/admin/reservations')}>
              <div className="card-icon">✅</div>
              <h3>Validation Réservations</h3>
              <p>Valider ou refuser les demandes</p>
            </div>

            <div className="dashboard-card admin-card" onClick={() => navigate('/admin/stats')}>
              <div className="card-icon">📊</div>
              <h3>Statistiques</h3>
              <p>Voir les statistiques d'utilisation</p>
            </div>

            <div className="dashboard-card admin-card" onClick={() => navigate('/admin/codes')}>
              <div className="card-icon">🔐</div>
              <h3>Codes d'accès</h3>
              <p>Gérer les codes digicode/alarme</p>
            </div>

            <div className="dashboard-card admin-card" onClick={() => navigate('/admin/membres')}>
              <div className="card-icon">👥</div>
              <h3>Membres</h3>
              <p>Gérer les adhérents</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
