# L'Edorat 8 Pool - Site Vitrine

Public-facing website for L'Edorat 8 Pool billiards club, built with React, TypeScript, and Firebase.

## Features

- **Home Page**: Hero section, features, latest news, and call-to-action
- **Club Info**: Club history, achievements, and contact information
- **Teams**: Display teams with player rosters, rankings, and schedules
- **School**: Billiards school information with courses, coaches, and pricing
- **News**: News articles with images and filtering
- **Contact**: Contact form with Firebase Cloud Function integration

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **Backend**: Firebase (Firestore, Cloud Functions, Hosting)
- **CI/CD**: GitHub Actions

## Prerequisites

- Node.js 18+ and npm
- Firebase account
- Git

## Getting Started

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd site-vitrine
npm install
```

### 2. Firebase Setup

Follow the detailed guide in [`../FIREBASE_SETUP.md`](../FIREBASE_SETUP.md) to:
- Create Firebase project
- Enable Firestore, Functions, and Hosting
- Get Firebase configuration
- Set up local environment

### 3. Environment Variables

Create `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

## Firebase Cloud Function for Contact Form

Create a Cloud Function to handle contact form submissions:

### Setup Functions

```bash
firebase init functions
# Choose TypeScript
# Install dependencies
```

### Function Code

Edit `functions/src/index.ts`:

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

interface ContactData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export const sendContactEmail = functions
  .region('europe-west1')
  .https.onCall(async (data: ContactData, context) => {
    // Validate input
    if (!data.name || !data.email || !data.subject || !data.message) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required fields'
      );
    }

    // Here you would integrate with an email service like SendGrid
    // For now, we'll store the message in Firestore
    try {
      await admin.firestore().collection('contactMessages').add({
        ...data,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        status: 'new',
      });

      // TODO: Send email to club president
      // Example with SendGrid:
      // const sgMail = require('@sendgrid/mail');
      // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      // await sgMail.send({
      //   to: 'president@ledorat8pool.fr',
      //   from: 'noreply@ledorat8pool.fr',
      //   subject: `Contact: ${data.subject}`,
      //   text: data.message,
      //   html: `<p><strong>From:</strong> ${data.name} (${data.email})</p>
      //          <p><strong>Subject:</strong> ${data.subject}</p>
      //          <p><strong>Message:</strong></p><p>${data.message}</p>`
      // });

      return { success: true, message: 'Message sent successfully' };
    } catch (error) {
      console.error('Error sending contact message:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to send message'
      );
    }
  });
```

### Deploy Functions

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

## Deployment

### Manual Deployment

```bash
npm run build
firebase deploy --only hosting
```

### Automatic Deployment (GitHub Actions)

1. Add GitHub Secrets:
   - `FIREBASE_SERVICE_ACCOUNT`: Get from Firebase Console > Project Settings > Service Accounts
   - `VITE_FIREBASE_*`: All your Firebase config values

2. Push to `main` branch - auto-deploys to production
3. Create PR - auto-deploys preview

## Project Structure

```
site-vitrine/
├── src/
│   ├── components/
│   │   └── Layout/          # Header, footer, navigation
│   ├── config/
│   │   └── firebase.ts      # Firebase initialization
│   ├── pages/
│   │   ├── Home.tsx         # Homepage
│   │   ├── Club.tsx         # Club info
│   │   ├── Teams.tsx        # Teams page
│   │   ├── School.tsx       # School page
│   │   ├── News.tsx         # News page
│   │   └── Contact.tsx      # Contact form
│   ├── App.tsx              # Main app with routing
│   └── index.css            # Global styles
├── public/                  # Static assets
├── functions/               # Firebase Cloud Functions
├── .github/
│   └── workflows/
│       └── deploy.yml       # CI/CD workflow
├── firebase.json            # Firebase configuration
├── firestore.rules          # Firestore security rules
└── firestore.indexes.json   # Firestore indexes
```

## Firestore Collections

### `clubInfo`
```json
{
  "name": "L'Edorat 8 Pool",
  "description": "...",
  "history": "...",
  "palmares": ["..."],
  "address": "...",
  "phone": "...",
  "email": "..."
}
```

### `teams`
```json
{
  "name": "Équipe A",
  "division": "D1",
  "players": ["..."],
  "ranking": 1,
  "schedule": [{"date": "...", "opponent": "...", "location": "..."}]
}
```

### `news`
```json
{
  "title": "...",
  "content": "...",
  "date": "2025-01-19T10:00:00Z",
  "image": "https://...",
  "author": "Admin"
}
```

### `sponsors`
```json
{
  "name": "...",
  "logo": "https://...",
  "url": "https://...",
  "tier": "gold"
}
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

MIT
