import { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="layout">
      <header className="header">
        <div className="header-container">
          <div className="logo">
            <h1>L'Edorat 8 Pool</h1>
            <p className="tagline">Club de Billard Français</p>
          </div>
          <nav className="nav">
            <Link to="/" className={isActive('/') ? 'active' : ''}>
              Accueil
            </Link>
            <Link to="/club" className={isActive('/club') ? 'active' : ''}>
              Le Club
            </Link>
            <Link to="/teams" className={isActive('/teams') ? 'active' : ''}>
              Les Équipes
            </Link>
            <Link to="/school" className={isActive('/school') ? 'active' : ''}>
              L'École
            </Link>
            <Link to="/news" className={isActive('/news') ? 'active' : ''}>
              Actualités
            </Link>
            <Link to="/contact" className={isActive('/contact') ? 'active' : ''}>
              Contact
            </Link>
          </nav>
        </div>
      </header>

      <main className="main">{children}</main>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-section">
            <h3>L'Edorat 8 Pool</h3>
            <p>Club de billard français depuis 1985</p>
          </div>
          <div className="footer-section">
            <h3>Navigation</h3>
            <ul>
              <li><Link to="/">Accueil</Link></li>
              <li><Link to="/club">Le Club</Link></li>
              <li><Link to="/teams">Les Équipes</Link></li>
              <li><Link to="/school">L'École</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Contact</h3>
            <p>Email: contact@ledorat8pool.fr</p>
            <p>Tél: +33 1 23 45 67 89</p>
          </div>
          <div className="footer-section">
            <h3>Suivez-nous</h3>
            <div className="social-links">
              <a href="#" aria-label="Facebook">Facebook</a>
              <a href="#" aria-label="Instagram">Instagram</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} L'Edorat 8 Pool. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
