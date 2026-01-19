# Firestore Database Seeder

This script automatically populates your Firestore database with sample data for the L'Edorat 8 Pool website.

## What It Creates

The seeder will create the following collections with sample data:

### 📝 clubInfo (1 document)
- Club name, description, history
- Palmarès (achievements)
- Contact information (address, phone, email)

### 👥 teams (3 teams)
- Équipe A - Elite (Division 1 Nationale) - Rank #1
- Équipe B - Espoirs (Division 2 Régionale) - Rank #3
- Équipe C - Loisirs (Division 3 Départementale) - Rank #5

Each team includes:
- Players list
- Match schedule
- Ranking

### 📰 news (4 articles)
- Team victory announcement
- School enrollment announcement
- Tournament results
- Equipment update

### 🤝 sponsors (4 sponsors)
- Multiple sponsor tiers (gold, silver, bronze)
- Placeholder logos and links

## Prerequisites

1. **Firebase project created** and configured
2. **Firestore enabled** in Firebase Console
3. **`.env` file** with Firebase credentials in `site-vitrine/` directory

## Usage

### Step 1: Install Dependencies

```bash
cd site-vitrine
npm install
```

This installs `dotenv` (for reading `.env` file) and Firebase SDK.

### Step 2: Configure Environment

Make sure your `.env` file exists with Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Step 3: Run the Seeder

```bash
npm run seed
```

You should see output like:

```
🌱 Starting Firestore database seeding...

📍 Project: your-project-id

📝 Creating clubInfo collection...
✅ Club info created

👥 Creating teams collection...
✅ Team "Équipe A - Elite" created
✅ Team "Équipe B - Espoirs" created
✅ Team "Équipe C - Loisirs" created

📰 Creating news collection...
✅ News "Victoire éclatante de notre Équipe A !" created
✅ News "Nouvelle saison de l'École de Billard..." created
✅ News "Tournoi Interne d'Hiver - Résultats" created
✅ News "Nouveaux Équipements - Tables restaurées" created

🤝 Creating sponsors collection...
✅ Sponsor "Café du Billard" created
✅ Sponsor "Paris Sports Équipements" created
✅ Sponsor "Restaurant Le Carambolage" created
✅ Sponsor "Boulangerie Martin" created

✨ Database seeding completed successfully!

📊 Summary:
   - 1 club info document
   - 3 teams
   - 4 news articles
   - 4 sponsors

🚀 Your website is now ready to use!
   Visit http://localhost:5173 to see your data
```

### Step 4: Verify Data

1. **In Firebase Console:**
   - Go to Firestore Database
   - You should see 4 collections: `clubInfo`, `teams`, `news`, `sponsors`

2. **In Your App:**
   ```bash
   npm run dev
   ```
   - Visit `http://localhost:5173`
   - All pages should now display the sample data

## Troubleshooting

### Error: "Firebase configuration is missing"
**Solution:** Make sure your `.env` file exists and contains all Firebase variables.

### Error: "Missing or insufficient permissions"
**Solution:**
1. Check Firestore security rules allow writes
2. Temporarily set rules to allow all writes for seeding:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;  // ⚠️ Development only!
       }
     }
   }
   ```
3. After seeding, restore the production rules from `firestore.rules`

### Error: "Cannot find module 'dotenv'"
**Solution:** Run `npm install` in the `site-vitrine` directory

### Running the Script Multiple Times
The script will create **new documents** each time you run it (except for `clubInfo` which uses a fixed ID).

To reset your database:
1. Go to Firebase Console > Firestore Database
2. Delete the collections manually
3. Run the seeder again

## Customizing the Data

Edit `scripts/seed-firestore.js` to customize:
- Club information
- Team names and players
- News articles
- Sponsor information

The data objects are at the top of the file and are easy to modify.

## Next Steps

After seeding:
1. ✅ Start the dev server: `npm run dev`
2. ✅ Browse all pages to verify data loads correctly
3. ✅ Replace sample data with real club information
4. ✅ Add real images for news articles and sponsors
5. ✅ Deploy to Firebase Hosting

## Notes

- The seeder uses the same Firebase config as your app (from `.env`)
- Sponsor logos use placeholder images - replace with real logos
- News dates are set to recent dates - adjust as needed
- All text is in French to match the club's language
