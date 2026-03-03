# 🏥 Klinika Navbat Tizimi

Professional klinika navbat boshqaruv tizimi - Firebase Firestore, autentifikatsiya va zamonaviy UI bilan.

## ✨ Xususiyatlar

### 🔐 Xavfsizlik
- Firebase Authentication bilan login/logout
- Admin va Shifokor rollari
- Har bir shifokor faqat o'z bemorlarini ko'radi
- Session boshqaruvi

### 📊 Funksionallik
- **Bemorlar uchun:**
  - Istalgan kun va vaqtga navbat olish
  - Telefon raqam validatsiyasi (+998 XX XXX-XX-XX)
  - PDF formatda navbat cheki yuklab olish
  - Navbatni telefon raqami orqali tekshirish

- **Shifokorlar uchun:**
  - Shaxsiy panel
  - Bugungi bemorlar ro'yxati
  - Bemorni qabul qilish va tashxis yozish
  - Shaxsiy reyting ko'rish

- **Admin uchun:**
  - Barcha shifokorlar va bemorlar statistikasi
  - Kunlik/haftalik grafiklar (Chart.js)
  - Barcha navbatlarni boshqarish
  - PDF hisobotlar

### 🎨 Dizayn
- Responsive dizayn (mobil, planshet, desktop)
- Dark Mode (tungi rejim)
- Animatsiyalar va o'tish effektlari
- Zamonaviy UI/UX

## 🚀 O'rnatish

### 1. Firebase Loyihasi Yaratish

1. [Firebase Console](https://console.firebase.google.com/) ga kiring
2. "Add project" tugmasini bosing
3. Loyiha nomini kiriting (masalan: "klinika-navbat")
4. Google Analytics'ni yoqing (ixtiyoriy)
5. Loyiha yaratilishini kuting

### 2. Firebase Configuration

1. Firebase Console'da loyihangizni oching
2. Project Settings > General > Your apps
3. Web app qo'shing (</> belgisi)
4. App nickname kiriting
5. Firebase SDK configuration'ni nusxalang
6. `js/config.js` fayliga joylashtiring:

\`\`\`javascript
const firebaseConfig = {
    apiKey: "sizning-api-key",
    authDomain: "sizning-project-id.firebaseapp.com",
    projectId: "sizning-project-id",
    storageBucket: "sizning-project-id.appspot.com",
    messagingSenderId: "sizning-sender-id",
    appId: "sizning-app-id"
};
\`\`\`

### 3. Firestore Database

1. Firebase Console > Build > Firestore Database
2. "Create database" tugmasini bosing
3. "Start in test mode" tanlang (keyinchalik xavfsizlik qoidalarini sozlang)
4. Location tanlang (asia-southeast1 tavsiya etiladi)

### 4. Authentication

1. Firebase Console > Build > Authentication
2. "Get started" tugmasini bosing
3. Sign-in method > Email/Password'ni yoqing

### 5. Foydalanuvchilar Yaratish

Firebase Console > Authentication > Users > Add user:

**Admin:**
- Email: admin@klinika.uz
- Password: admin123 (o'zgartirishni unutmang!)

**Shifokorlar:**
- Email: doctor1@klinika.uz
- Password: doctor123

Keyin Firestore'da `users` kolleksiyasiga qo'shing:

\`\`\`javascript
// Admin uchun
{
  email: "admin@klinika.uz",
  role: "admin",
  createdAt: [timestamp]
}

// Shifokor uchun
{
  email: "doctor1@klinika.uz",
  role: "doctor",
  doctorId: 1,
  createdAt: [timestamp]
}
\`\`\`

### 6. Shifokorlar Ma'lumotlari

Firestore'da `doctors` kolleksiyasiga shifokorlarni qo'shing:

\`\`\`javascript
{
  id: 1,
  name: "Dr. Aliyev Sardor",
  specialty: "Lo'r (Otorinolaringolog)",
  icon: "👂",
  workStart: "09:00",
  workEnd: "18:00",
  lunchStart: "13:00",
  lunchEnd: "14:00",
  avgTime: 15
}
\`\`\`

## 📁 Fayl Strukturasi

\`\`\`
qabul uchun navbat olish/
├── index.html              # Bosh sahifa
├── login.html              # Login sahifasi
├── admin.html              # Admin panel
├── doctor.html             # Shifokor tanlash
├── doctor-panel.html       # Shifokor paneli
├── patients.html           # Bemorlar ro'yxati
├── queue.html              # Navbat olish
├── ratings.html            # Reytinglar
├── style.css               # Asosiy stillar
├── css/
│   └── dark-mode.css       # Tungi rejim
├── js/
│   ├── config.js           # Firebase config
│   ├── auth.js             # Autentifikatsiya
│   ├── database.js         # Ma'lumotlar bazasi
│   ├── utils.js            # Yordamchi funksiyalar
│   ├── pdf-generator.js    # PDF yaratish
│   └── calendar-functions.js # Kalendar
└── README.md
\`\`\`

## 🔧 Ishlatish

### Loyihani Ishga Tushirish

1. Barcha fayllarni web serverga joylashtiring (masalan: Apache, Nginx, yoki VS Code Live Server)
2. `index.html` ni brauzerda oching
3. Login sahifasiga o'ting va kirish ma'lumotlarini kiriting

### Dark Mode

Har qanday sahifada o'ng pastki burchakdagi tugmani bosing:
- 🌙 - Tungi rejimga o'tish
- ☀️ - Kunduzgi rejimga qaytish

### PDF Cheki

Bemor navbat olgandan keyin "PDF Yuklab Olish" tugmasi paydo bo'ladi.

## 🛡️ Xavfsizlik Qoidalari

Firestore Security Rules (`firestore.rules`):

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Foydalanuvchilar faqat o'z ma'lumotlarini ko'rishi mumkin
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Shifokorlar
    match /doctors/{doctorId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Navbatlar
    match /queues/{queueId} {
      allow read: if request.auth != null;
      allow create: if true; // Bemorlar navbat olishi mumkin
      allow update, delete: if request.auth != null && 
                               (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
                                get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'doctor');
    }
    
    // Reytinglar
    match /ratings/{ratingId} {
      allow read: if request.auth != null;
      allow create: if true;
      allow update, delete: if request.auth != null && 
                               get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
\`\`\`

## 📱 Responsive Dizayn

Tizim barcha qurilmalarda ishlaydi:
- 📱 Mobil (320px+)
- 📱 Planshet (768px+)
- 💻 Desktop (1024px+)

## 🎨 Texnologiyalar

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Backend:** Firebase (Firestore, Authentication)
- **Kutubxonalar:**
  - jsPDF - PDF yaratish
  - Chart.js - Grafiklar
  - Firebase SDK 9.22.0

## 📞 Yordam

Savollar yoki muammolar bo'lsa:
- Email: support@klinika.uz
- Telefon: +998 90 123 45 67

## 📄 Litsenziya

MIT License - Bepul foydalanish uchun

## 🔄 Yangilanishlar

### v2.0.0 (2026-03-02)
- ✅ Firebase Firestore integratsiyasi
- ✅ Login/Logout tizimi
- ✅ Dark Mode
- ✅ PDF cheki yaratish
- ✅ Telefon raqam validatsiyasi
- ✅ Kalendar tizimi
- ✅ Modulli kod strukturasi

### v1.0.0 (2026-02-28)
- ✅ Asosiy navbat tizimi
- ✅ LocalStorage
- ✅ Shifokorlar reytingi

---

**Ishlab chiqildi:** Kiro AI yordamida 💙
