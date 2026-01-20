import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, userProfile, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Don't show layout on auth pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return <>{children}</>;
  }

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="header-left">
          <h1 onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
            Hub Adhérent
          </h1>
          <span className="club-name">L'Edorat 8 Pool</span>
        </div>
        <nav className="header-nav">
          <button
            className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
            onClick={() => navigate('/dashboard')}
          >
            Accueil
          </button>
          <button
            className={`nav-link ${location.pathname === '/reservations' ? 'active' : ''}`}
            onClick={() => navigate('/reservations')}
          >
            Réserver
          </button>
          <button
            className={`nav-link ${location.pathname === '/my-reservations' ? 'active' : ''}`}
            onClick={() => navigate('/my-reservations')}
          >
            Mes Réservations
          </button>
          {isAdmin && (
            <button
              className={`nav-link admin ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
              onClick={() => navigate('/admin/reservations')}
            >
              Admin
            </button>
          )}
        </nav>
        <div className="header-right">
          {user && (
            <>
              <NotificationBell />
              <span className="user-name">
                {userProfile?.firstName || user.email}
              </span>
              {isAdmin && <span className="admin-badge">Admin</span>}
              <button onClick={handleLogout} className="btn-logout">
                Déconnexion
              </button>
            </>
          )}
        </div>
      </header>
      <main className="layout-main">{children}</main>
    </div>
  );
};

export default Layout;
