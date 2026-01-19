import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../config/firebase';
import './Teams.css';

interface Schedule {
  date: string;
  opponent: string;
  location: string;
}

interface Team {
  id: string;
  name: string;
  division: string;
  players: string[];
  ranking: number;
  schedule?: Schedule[];
}

const Teams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teamsQuery = query(
          collection(db, 'teams'),
          orderBy('ranking', 'asc')
        );
        const querySnapshot = await getDocs(teamsQuery);
        const teamsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Team[];
        setTeams(teamsData);
      } catch (error) {
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  if (loading) {
    return <div className="loading">Chargement des équipes...</div>;
  }

  if (teams.length === 0) {
    return (
      <div className="teams">
        <h1>Nos Équipes</h1>
        <section className="teams-section">
          <p className="no-teams">
            Les informations sur nos équipes seront bientôt disponibles.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="teams">
      <h1>Nos Équipes</h1>
      <p className="teams-intro">
        Nos équipes participent régulièrement aux championnats régionaux et
        nationaux de billard français. Découvrez nos joueurs et suivez leurs
        performances.
      </p>

      <div className="teams-grid">
        {teams.map((team) => (
          <div key={team.id} className="team-card">
            <div className="team-header">
              <h2>{team.name}</h2>
              <span className="division-badge">{team.division}</span>
            </div>

            <div className="team-info">
              <div className="ranking">
                <span className="ranking-label">Classement:</span>
                <span className="ranking-value">#{team.ranking}</span>
              </div>
            </div>

            <div className="team-players">
              <h3>Composition de l'équipe</h3>
              <ul>
                {team.players.map((player, index) => (
                  <li key={index}>{player}</li>
                ))}
              </ul>
            </div>

            {team.schedule && team.schedule.length > 0 && (
              <div className="team-schedule">
                <h3>Prochains matchs</h3>
                {team.schedule.map((match, index) => (
                  <div key={index} className="match-item">
                    <div className="match-date">
                      {new Date(match.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                      })}
                    </div>
                    <div className="match-details">
                      <div className="opponent">{match.opponent}</div>
                      <div className="location">{match.location}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Teams;
