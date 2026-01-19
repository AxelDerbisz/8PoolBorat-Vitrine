import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../config/firebase';
import './News.css';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  image?: string;
  author?: string;
}

const News = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const newsQuery = query(
          collection(db, 'news'),
          orderBy('date', 'desc')
        );
        const querySnapshot = await getDocs(newsQuery);
        const newsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as NewsItem[];
        setNews(newsData);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return <div className="loading">Chargement des actualités...</div>;
  }

  return (
    <div className="news-page">
      <h1>Actualités</h1>
      <p className="news-intro">
        Restez informés des dernières nouvelles du club, des résultats de nos
        équipes et des événements à venir.
      </p>

      {news.length === 0 ? (
        <div className="no-news">
          <p>Aucune actualité pour le moment. Revenez bientôt !</p>
        </div>
      ) : (
        <div className="news-list">
          {news.map((article) => (
            <article key={article.id} className="news-article">
              {article.image && (
                <div className="article-image-container">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="article-image"
                  />
                </div>
              )}
              <div className="article-content">
                <h2>{article.title}</h2>
                <div className="article-meta">
                  <span className="article-date">
                    {new Date(article.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  {article.author && (
                    <>
                      <span className="meta-separator">•</span>
                      <span className="article-author">Par {article.author}</span>
                    </>
                  )}
                </div>
                <div className="article-body">
                  {article.content.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default News;
