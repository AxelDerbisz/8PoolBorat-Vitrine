/**
 * Firestore Database Seeder (JavaScript version)
 *
 * This script populates your Firestore database with sample data
 * for the L'Edorat 8 Pool website.
 *
 * Usage:
 *   npm run seed
 *
 * Make sure your .env file is configured with Firebase credentials first!
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, addDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Validate configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Error: Firebase configuration is missing!');
  console.error('Make sure your .env file exists and contains all required Firebase variables.');
  process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample data
const clubInfoData = {
  name: "L'Edorat 8 Pool",
  description: "Club de billard français passionné depuis 1985, situé au cœur de Paris. Nous disposons de 8 tables de billard professionnel et accueillons des joueurs de tous niveaux dans une ambiance conviviale.",
  history: "Fondé en 1985 par un groupe de passionnés de billard français, L'Edorat 8 Pool s'est rapidement imposé comme une référence dans la région parisienne. Au fil des années, notre club a formé de nombreux champions et continue de promouvoir le billard français à travers des compétitions régionales et nationales. Aujourd'hui, nous sommes fiers de notre communauté de plus de 150 membres actifs.",
  palmares: [
    "Champion Régional Île-de-France 2023",
    "Vainqueur Tournoi National Paris 2022",
    "2ème place Championnat de France Division 1 - 2021",
    "Champion Départemental Paris 2020",
    "Vainqueur Coupe d'Île-de-France 2019"
  ],
  address: "123 Rue du Billard, 75011 Paris",
  phone: "+33 1 23 45 67 89",
  email: "contact@ledorat8pool.fr"
};

const teamsData = [
  {
    name: "Équipe A - Elite",
    division: "Division 1 Nationale",
    players: [
      "Jean Dupont - Capitaine",
      "Marie Martin",
      "Pierre Lefebvre",
      "Sophie Bernard",
      "Lucas Moreau"
    ],
    ranking: 1,
    schedule: [
      {
        date: "2025-02-15",
        opponent: "Billard Club Paris",
        location: "Domicile"
      },
      {
        date: "2025-02-22",
        opponent: "AS Billard Lyon",
        location: "Extérieur"
      },
      {
        date: "2025-03-08",
        opponent: "Club Billard Marseille",
        location: "Domicile"
      }
    ]
  },
  {
    name: "Équipe B - Espoirs",
    division: "Division 2 Régionale",
    players: [
      "Thomas Petit - Capitaine",
      "Julie Dubois",
      "Alexandre Garcia",
      "Camille Rousseau"
    ],
    ranking: 3,
    schedule: [
      {
        date: "2025-02-16",
        opponent: "Billard Amical Versailles",
        location: "Extérieur"
      },
      {
        date: "2025-03-02",
        opponent: "Club de Billard Boulogne",
        location: "Domicile"
      }
    ]
  },
  {
    name: "Équipe C - Loisirs",
    division: "Division 3 Départementale",
    players: [
      "Nicolas Lambert",
      "Isabelle Fontaine",
      "Marc Girard",
      "Céline Mercier"
    ],
    ranking: 5,
    schedule: [
      {
        date: "2025-02-20",
        opponent: "Billard Convivial Paris 12",
        location: "Domicile"
      }
    ]
  }
];

const newsData = [
  {
    title: "Victoire éclatante de notre Équipe A !",
    content: "Notre Équipe A a remporté une victoire éclatante lors du championnat régional Île-de-France face au prestigieux Billard Club Paris. Avec un score final de 8-4, nos joueurs ont démontré une technique impeccable et une stratégie bien rodée.\n\nJean Dupont, capitaine de l'équipe, a mené ses coéquipiers avec brio, réalisant plusieurs carambolages spectaculaires qui ont enthousiasmé le public. Marie Martin s'est également distinguée avec une série impressionnante de 127 points.\n\nCette victoire propulse notre équipe en tête du classement régional et nous qualifie pour le tournoi national qui se tiendra en mars prochain à Lyon. Bravo à toute l'équipe pour ce magnifique résultat !",
    date: "2025-01-15T10:00:00Z",
    author: "Le Président"
  },
  {
    title: "Nouvelle saison de l'École de Billard - Inscriptions ouvertes",
    content: "L'École de Billard de L'Edorat 8 Pool ouvre ses inscriptions pour la saison 2025 ! Que vous soyez débutant ou joueur confirmé, nos entraîneurs qualifiés vous accompagneront dans votre progression.\n\nNous proposons trois niveaux de cours :\n- Initiation pour débutants (mercredis 18h-19h30)\n- Perfectionnement pour intermédiaires (jeudis 19h-21h)\n- Compétition pour joueurs avancés (samedis 16h-18h30)\n\nLes cours débutent le 5 février. Tarifs préférentiels pour les adhérents du club. Contactez-nous dès maintenant pour réserver votre place !",
    date: "2025-01-10T14:30:00Z",
    author: "Marie Martin - Responsable École"
  },
  {
    title: "Tournoi Interne d'Hiver - Résultats",
    content: "Le tournoi interne d'hiver s'est déroulé le weekend dernier dans une excellente ambiance. Plus de 40 participants se sont affrontés durant deux jours de compétition acharnée.\n\nFélicitations aux gagnants :\n🥇 1ère place : Pierre Lefebvre\n🥈 2ème place : Sophie Bernard\n🥉 3ème place : Lucas Moreau\n\nUn grand merci à tous les participants et aux bénévoles qui ont organisé cet événement. Rendez-vous au printemps pour le prochain tournoi !",
    date: "2025-01-05T16:00:00Z",
    author: "Admin"
  },
  {
    title: "Nouveaux Équipements - Tables restaurées",
    content: "Bonne nouvelle pour tous nos membres ! Le club a investi dans la restauration complète de nos 8 tables de billard. Les tapis ont été remplacés, les bandes réajustées et les cadres rénovés.\n\nCes travaux, réalisés par des artisans spécialisés, garantissent un confort de jeu optimal et des conditions de compétition professionnelles. Les tables sont désormais disponibles et n'attendent que vous !\n\nVenez tester ces tables comme neuves dès cette semaine.",
    date: "2024-12-20T09:00:00Z",
    author: "Le Bureau"
  }
];

const sponsorsData = [
  {
    name: "Café du Billard",
    logo: "https://via.placeholder.com/200x100/2d5a3d/ffffff?text=Cafe+du+Billard",
    url: "https://example.com",
    tier: "gold"
  },
  {
    name: "Paris Sports Équipements",
    logo: "https://via.placeholder.com/200x100/1a472a/ffffff?text=Paris+Sports",
    url: "https://example.com",
    tier: "gold"
  },
  {
    name: "Restaurant Le Carambolage",
    logo: "https://via.placeholder.com/200x100/2d5a3d/ffffff?text=Le+Carambolage",
    url: "https://example.com",
    tier: "silver"
  },
  {
    name: "Boulangerie Martin",
    logo: "https://via.placeholder.com/200x100/1a472a/ffffff?text=Boulangerie+Martin",
    url: "https://example.com",
    tier: "bronze"
  }
];

async function seedDatabase() {
  console.log('🌱 Starting Firestore database seeding...\n');
  console.log(`📍 Project: ${firebaseConfig.projectId}\n`);

  try {
    // Seed Club Info
    console.log('📝 Creating clubInfo collection...');
    await setDoc(doc(db, 'clubInfo', 'main'), clubInfoData);
    console.log('✅ Club info created\n');

    // Seed Teams
    console.log('👥 Creating teams collection...');
    for (const team of teamsData) {
      await addDoc(collection(db, 'teams'), team);
      console.log(`✅ Team "${team.name}" created`);
    }
    console.log('');

    // Seed News
    console.log('📰 Creating news collection...');
    for (const newsItem of newsData) {
      await addDoc(collection(db, 'news'), newsItem);
      console.log(`✅ News "${newsItem.title}" created`);
    }
    console.log('');

    // Seed Sponsors
    console.log('🤝 Creating sponsors collection...');
    for (const sponsor of sponsorsData) {
      await addDoc(collection(db, 'sponsors'), sponsor);
      console.log(`✅ Sponsor "${sponsor.name}" created`);
    }
    console.log('');

    console.log('✨ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - 1 club info document`);
    console.log(`   - ${teamsData.length} teams`);
    console.log(`   - ${newsData.length} news articles`);
    console.log(`   - ${sponsorsData.length} sponsors`);
    console.log('\n🚀 Your website is now ready to use!');
    console.log('   Visit http://localhost:5173 to see your data\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    console.error('\nTroubleshooting:');
    console.error('1. Check your .env file has correct Firebase credentials');
    console.error('2. Verify Firestore is enabled in Firebase Console');
    console.error('3. Check your internet connection');
    process.exit(1);
  }
}

// Run the seeder
seedDatabase();
