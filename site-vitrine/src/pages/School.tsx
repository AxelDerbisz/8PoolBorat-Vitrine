import './School.css';

const School = () => {
  return (
    <div className="school">
      <h1>L'École de Billard</h1>
      <p className="school-intro">
        Que vous soyez débutant ou joueur confirmé, notre école de billard vous
        accueille pour progresser dans une ambiance conviviale et encadrée par
        des entraîneurs qualifiés.
      </p>

      {/* Course Levels */}
      <section className="course-section">
        <h2>Nos Cours</h2>
        <div className="courses-grid">
          <div className="course-card">
            <div className="course-icon">🎯</div>
            <h3>Initiation</h3>
            <p className="course-level">Débutants</p>
            <ul className="course-details">
              <li>Découverte du billard français</li>
              <li>Apprentissage des règles de base</li>
              <li>Techniques de tenue de queue</li>
              <li>Premiers exercices de précision</li>
            </ul>
            <div className="course-info">
              <p><strong>Durée:</strong> 1h30 par semaine</p>
              <p><strong>Groupe:</strong> 6-8 personnes</p>
            </div>
          </div>

          <div className="course-card">
            <div className="course-icon">🎱</div>
            <h3>Perfectionnement</h3>
            <p className="course-level">Intermédiaire</p>
            <ul className="course-details">
              <li>Amélioration de la technique</li>
              <li>Stratégies de jeu</li>
              <li>Exercices de précision avancés</li>
              <li>Introduction aux coups spéciaux</li>
            </ul>
            <div className="course-info">
              <p><strong>Durée:</strong> 2h par semaine</p>
              <p><strong>Groupe:</strong> 4-6 personnes</p>
            </div>
          </div>

          <div className="course-card">
            <div className="course-icon">🏆</div>
            <h3>Compétition</h3>
            <p className="course-level">Avancé</p>
            <ul className="course-details">
              <li>Préparation aux tournois</li>
              <li>Tactiques avancées</li>
              <li>Analyse de parties</li>
              <li>Gestion mentale en compétition</li>
            </ul>
            <div className="course-info">
              <p><strong>Durée:</strong> 2h30 par semaine</p>
              <p><strong>Groupe:</strong> 2-4 personnes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Coaches */}
      <section className="coaches-section">
        <h2>Nos Entraîneurs</h2>
        <div className="coaches-grid">
          <div className="coach-card">
            <div className="coach-avatar">👨‍🏫</div>
            <h3>Jean Dupont</h3>
            <p className="coach-title">Entraîneur Principal</p>
            <p>
              Champion de France 2015, Jean possède 20 ans d'expérience dans
              l'enseignement du billard français.
            </p>
          </div>

          <div className="coach-card">
            <div className="coach-avatar">👩‍🏫</div>
            <h3>Marie Martin</h3>
            <p className="coach-title">Entraîneuse Technique</p>
            <p>
              Spécialisée dans la technique et la précision, Marie a formé de
              nombreux champions régionaux.
            </p>
          </div>

          <div className="coach-card">
            <div className="coach-avatar">👨‍🏫</div>
            <h3>Pierre Lefebvre</h3>
            <p className="coach-title">Coach Compétition</p>
            <p>
              Expert en préparation mentale et tactique, Pierre accompagne nos
              équipes en compétition.
            </p>
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="schedule-section">
        <h2>Horaires des Cours</h2>
        <div className="schedule-table">
          <div className="schedule-row header">
            <div>Jour</div>
            <div>Niveau</div>
            <div>Horaire</div>
          </div>
          <div className="schedule-row">
            <div>Mercredi</div>
            <div>Initiation</div>
            <div>18h00 - 19h30</div>
          </div>
          <div className="schedule-row">
            <div>Jeudi</div>
            <div>Perfectionnement</div>
            <div>19h00 - 21h00</div>
          </div>
          <div className="schedule-row">
            <div>Samedi</div>
            <div>Tous niveaux</div>
            <div>14h00 - 16h00</div>
          </div>
          <div className="schedule-row">
            <div>Samedi</div>
            <div>Compétition</div>
            <div>16h00 - 18h30</div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="pricing-section">
        <h2>Tarifs</h2>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>Cours à l'unité</h3>
            <div className="price">25€</div>
            <p>Par séance</p>
          </div>
          <div className="pricing-card featured">
            <div className="badge">Populaire</div>
            <h3>Forfait Mensuel</h3>
            <div className="price">80€</div>
            <p>4 séances par mois</p>
          </div>
          <div className="pricing-card">
            <h3>Forfait Trimestriel</h3>
            <div className="price">210€</div>
            <p>12 séances (3 mois)</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="school-cta">
        <h2>Rejoignez notre école !</h2>
        <p>
          Inscrivez-vous dès maintenant pour commencer votre apprentissage du
          billard français dans les meilleures conditions.
        </p>
        <a href="/contact" className="btn btn-primary">
          S'inscrire maintenant
        </a>
      </section>
    </div>
  );
};

export default School;
