/**
 * Firebase Configuration
 * Firebase Console'dan olingan ma'lumotlar
 * https://console.firebase.google.com/
 */

const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Firebase'ni ishga tushirish
let app, auth, db;

try {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    console.log('✅ Firebase muvaffaqiyatli ulandi');
} catch (error) {
    console.error('❌ Firebase ulanishda xatolik:', error);
}

// Kolleksiya nomlari
const COLLECTIONS = {
    DOCTORS: 'doctors',
    QUEUES: 'queues',
    RATINGS: 'ratings',
    USERS: 'users',
    SETTINGS: 'settings'
};

// Eksport
export { app, auth, db, COLLECTIONS };
