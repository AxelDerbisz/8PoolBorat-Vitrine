import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import './Club.css';

interface ClubInfo {
  name: string;
  description: string;
  history: string;
  palmares: string[];
  address: string;
  phone: string;
  email: string;
}

const Club = () => {
  const [clubInfo, setClubInfo] = useState<ClubInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClubInfo = async () => {
      try {
        const docRef = doc(db, 'clubInfo', 'main');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setClubInfo(docSnap.data() as ClubInfo);
        }
      } catch (error) {
        console.error('Error fetching club info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClubInfo();
  }, []);

  if (loading) {
    return <div className="loading">Chargement des informations du club...</div>;
  }

  if (!clubInfo) {
    return (
      <div className="club">
        <h1>Le Club</h1>
        <section className="club-section">
          <h2>À propos de L'Edorat 8 Pool</h2>
          <p>
            Fondé en 1985, L'Edorat 8 Pool est un club de billard français passionné,
            situé au cœur de Paris. Notre club dispose de 8 tables de billard
            professionnel et accueille des joueurs de tous niveaux.
          </p>
        </section>

        <section className="club-section">
          <h2>Notre Histoire</h2>
          <p>
            Depuis plus de 35 ans, notre club a formé de nombreux champions et
            continue de promouvoir le billard français à travers des compétitions
            régionales et nationales.
          </p>
        </section>

        <section className="club-section">
          <h2>Palmarès</h2>
          <ul className="palmares-list">
            <li>Champion Régional 2023</li>
            <li>Vainqueur Tournoi National 2022</li>
            <li>2ème place Championnat de France 2021</li>
            <li>Champion Départemental 2020</li>
          </ul>
        </section>

        <section className="club-section contact-info">
          <h2>Nous Trouver</h2>
          <p><strong>Adresse:</strong> 123 Rue Example, 75001 Paris</p>
          <p><strong>Téléphone:</strong> +33 1 23 45 67 89</p>
          <p><strong>Email:</strong> contact@ledorat8pool.fr</p>
        </section>
      </div>
    );
  }

  return (
    <div className="club">
      <h1>{clubInfo.name}</h1>

      <section className="club-section">
        <h2>Présentation</h2>
        <p>{clubInfo.description}</p>
      </section>

      <section className="club-section">
        <h2>Notre Histoire</h2>
        <p>{clubInfo.history}</p>
      </section>

      <section className="club-section">
        <h2>Palmarès</h2>
        <ul className="palmares-list">
          {clubInfo.palmares.map((achievement, index) => (
            <li key={index}>{achievement}</li>
          ))}
        </ul>
      </section>

      <section className="club-section contact-info">
        <h2>Nous Trouver</h2>
        <p><strong>Adresse:</strong> {clubInfo.address}</p>
        <p><strong>Téléphone:</strong> {clubInfo.phone}</p>
        <p><strong>Email:</strong> {clubInfo.email}</p>
      </section>
    </div>
  );
};

export default Club;
