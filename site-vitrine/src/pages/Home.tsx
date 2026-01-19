import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import './Home.css';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  image?: string;
}

const Home = () => {
  const [latestNews, setLatestNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        const newsQuery = query(
          collection(db, 'news'),
          orderBy('date', 'desc'),
          limit(3)
        );
        const querySnapshot = await getDocs(newsQuery);
        const news = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as NewsItem[];
        setLatestNews(news);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestNews();
  }, []);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Bienvenue à L'Edorat 8 Pool</h1>
          <p className="hero-subtitle">
            Club de billard français passionné depuis 1985
          </p>
          <div className="hero-buttons">
            <a href="/club" className="btn btn-primary">
              Découvrir le club
            </a>
            <a href="/contact" className="btn btn-secondary">
              Nous rejoindre
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Pourquoi nous rejoindre ?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎱</div>
            <h3>Tables Professionnelles</h3>
            <p>
              8 tables de billard français de compétition, entretenues
              régulièrement pour un jeu optimal.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Compétitions</h3>
            <p>
              Participez à des tournois régionaux et nationaux avec nos équipes
              compétitives.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>École de Billard</h3>
            <p>
              Cours pour tous niveaux, de débutant à confirmé, avec des
              entraîneurs qualifiés.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Ambiance Conviviale</h3>
            <p>
              Rejoignez une communauté passionnée et partagez des moments
              conviviaux autour du billard.
            </p>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="latest-news">
        <h2>Dernières Actualités</h2>
        {loading ? (
          <p className="loading">Chargement des actualités...</p>
        ) : latestNews.length > 0 ? (
          <div className="news-grid">
            {latestNews.map((news) => (
              <article key={news.id} className="news-card">
                {news.image && (
                  <img src={news.image} alt={news.title} className="news-image" />
                )}
                <div className="news-content">
                  <h3>{news.title}</h3>
                  <p className="news-date">
                    {new Date(news.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="news-excerpt">
                    {news.content.substring(0, 150)}...
                  </p>
                  <a href="/news" className="read-more">
                    Lire la suite →
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="no-news">Aucune actualité pour le moment.</p>
        )}
        <div className="news-cta">
          <a href="/news" className="btn btn-primary">
            Voir toutes les actualités
          </a>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <h2>Prêt à nous rejoindre ?</h2>
        <p>
          Que vous soyez débutant ou joueur confirmé, notre club vous accueille
          dans une ambiance chaleureuse et passionnée.
        </p>
        <a href="/contact" className="btn btn-large">
          Contactez-nous
        </a>
      </section>
    </div>
  );
};

export default Home;
