import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { UserProfile } from '../types/user';
import './AdminMembers.css';

const AdminMembers = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'admin' | 'member'>('all');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }

    const fetchMembers = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const data: UserProfile[] = [];

        querySnapshot.forEach((doc) => {
          const d = doc.data();
          data.push({
            uid: doc.id,
            email: d.email,
            firstName: d.firstName,
            lastName: d.lastName,
            phone: d.phone || '',
            role: d.role || 'member',
            acceptedRules: d.acceptedRules || false,
            createdAt: d.createdAt?.toDate() || new Date(),
            updatedAt: d.updatedAt?.toDate() || new Date(),
          });
        });

        setMembers(data);
      } catch (err) {
        console.error('Error fetching members:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [isAdmin, navigate]);

  const toggleRole = async (member: UserProfile) => {
    const newRole = member.role === 'admin' ? 'member' : 'admin';
    const confirmed = confirm(
      `Êtes-vous sûr de vouloir ${newRole === 'admin' ? 'promouvoir' : 'rétrograder'} ${member.firstName} ${member.lastName} ?`
    );

    if (!confirmed) return;

    setUpdating(member.uid);
    try {
      await updateDoc(doc(db, 'users', member.uid), {
        role: newRole,
        updatedAt: new Date(),
      });

      setMembers((prev) =>
        prev.map((m) =>
          m.uid === member.uid ? { ...m, role: newRole } : m
        )
      );
    } catch (err) {
      console.error('Error updating role:', err);
      alert('Erreur lors de la mise à jour du rôle');
    } finally {
      setUpdating(null);
    }
  };

  const filteredMembers = members.filter((m) => {
    // Apply role filter
    if (filter === 'admin' && m.role !== 'admin') return false;
    if (filter === 'member' && m.role !== 'member') return false;

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        m.firstName.toLowerCase().includes(searchLower) ||
        m.lastName.toLowerCase().includes(searchLower) ||
        m.email.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const adminCount = members.filter((m) => m.role === 'admin').length;
  const memberCount = members.filter((m) => m.role === 'member').length;

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Chargement des membres...</p>
      </div>
    );
  }

  return (
    <div className="admin-members">
      <header className="page-header">
        <h1>Gestion des membres</h1>
        <p>Gérez les adhérents et leurs permissions</p>
      </header>

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-number">{members.length}</span>
          <span className="stat-label">Total membres</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{adminCount}</span>
          <span className="stat-label">Administrateurs</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{memberCount}</span>
          <span className="stat-label">Adhérents</span>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Rechercher un membre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tous
          </button>
          <button
            className={`filter-btn ${filter === 'admin' ? 'active' : ''}`}
            onClick={() => setFilter('admin')}
          >
            Admins
          </button>
          <button
            className={`filter-btn ${filter === 'member' ? 'active' : ''}`}
            onClick={() => setFilter('member')}
          >
            Membres
          </button>
        </div>
      </div>

      <div className="members-list">
        {filteredMembers.length === 0 ? (
          <div className="empty-state">
            <p>Aucun membre trouvé</p>
          </div>
        ) : (
          filteredMembers.map((member) => (
            <div key={member.uid} className="member-card">
              <div className="member-info">
                <div className="member-avatar">
                  {member.firstName.charAt(0)}
                  {member.lastName.charAt(0)}
                </div>
                <div className="member-details">
                  <h3>
                    {member.firstName} {member.lastName}
                    {member.role === 'admin' && (
                      <span className="badge badge-admin">Admin</span>
                    )}
                  </h3>
                  <p className="member-email">{member.email}</p>
                  {member.phone && <p className="member-phone">{member.phone}</p>}
                  <p className="member-date">
                    Inscrit le{' '}
                    {format(member.createdAt, 'd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
              </div>
              <div className="member-actions">
                <button
                  className={`btn ${member.role === 'admin' ? 'btn-warning' : 'btn-secondary'}`}
                  onClick={() => toggleRole(member)}
                  disabled={updating === member.uid}
                >
                  {updating === member.uid
                    ? '...'
                    : member.role === 'admin'
                    ? 'Retirer admin'
                    : 'Promouvoir admin'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="back-link">
        <button className="btn btn-text" onClick={() => navigate('/dashboard')}>
          ← Retour au tableau de bord
        </button>
      </div>
    </div>
  );
};

export default AdminMembers;
