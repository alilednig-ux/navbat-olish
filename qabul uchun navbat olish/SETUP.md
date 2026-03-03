# 🚀 Tezkor O'rnatish Yo'riqnomasi

## 1-Qadam: Firebase Loyihasi (5 daqiqa)

### Firebase Console'ga kirish
1. [https://console.firebase.google.com/](https://console.firebase.google.com/) ga kiring
2. Google akkauntingiz bilan login qiling

### Yangi loyiha yaratish
1. "Add project" yoki "Create a project" tugmasini bosing
2. Loyiha nomi: `klinika-navbat-tizimi`
3. Google Analytics: Yoqish (tavsiya etiladi)
4. "Create project" tugmasini bosing
5. Loyiha tayyor bo'lguncha kuting (30-60 soniya)

## 2-Qadam: Web App Qo'shish (3 daqiqa)

1. Loyiha sahifasida `</>` (Web) belgisini bosing
2. App nickname: `Klinika Web App`
3. Firebase Hosting: Belgilamang (hozircha kerak emas)
4. "Register app" tugmasini bosing
5. **Firebase SDK configuration** ko'rinadi - buni nusxalang!

### Config'ni joylashtirish
`js/config.js` faylini oching va quyidagini almashtiring:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSy...",  // Sizning API key
    authDomain: "klinika-navbat-tizimi.firebaseapp.com",
    projectId: "klinika-navbat-tizimi",
    storageBucket: "klinika-navbat-tizimi.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
};
```

## 3-Qadam: Firestore Database (2 daqiqa)

1. Chap menuda: **Build** > **Firestore Database**
2. "Create database" tugmasini bosing
3. **Start in test mode** tanlang (xavfsizlik qoidalarini keyinroq sozlaymiz)
4. Location: **asia-southeast1** (Singapore - O'zbekistonga yaqin)
5. "Enable" tugmasini bosing

## 4-Qadam: Authentication (2 daqiqa)

1. Chap menuda: **Build** > **Authentication**
2. "Get started" tugmasini bosing
3. **Sign-in method** tab'ini oching
4. **Email/Password** ni tanlang
5. "Enable" tugmasini yoqing
6. "Save" tugmasini bosing

## 5-Qadam: Foydalanuvchilar Yaratish (5 daqiqa)

### Admin yaratish
1. **Authentication** > **Users** > **Add user**
2. Email: `admin@klinika.uz`
3. Password: `Admin123!` (o'zgartirishni unutmang!)
4. "Add user" tugmasini bosing
5. **User UID**ni nusxalang (kerak bo'ladi)

### Shifokor yaratish
1. **Add user** tugmasini yana bosing
2. Email: `doctor1@klinika.uz`
3. Password: `Doctor123!`
4. "Add user" tugmasini bosing
5. **User UID**ni nusxalang

## 6-Qadam: Firestore Ma'lumotlari (10 daqiqa)

### Users kolleksiyasi
1. **Firestore Database** > **Start collection**
2. Collection ID: `users`
3. Document ID: Admin'ning UID'si (5-qadamdan)
4. Fields qo'shing:

```
email: admin@klinika.uz (string)
role: admin (string)
createdAt: [timestamp - "Add field" > "timestamp"]
```

5. "Save" tugmasini bosing
6. Yana bir document qo'shing (Shifokor uchun):

```
Document ID: Shifokor'ning UID'si
email: doctor1@klinika.uz (string)
role: doctor (string)
doctorId: 1 (number)
createdAt: [timestamp]
```

### Doctors kolleksiyasi
1. **Start collection** > Collection ID: `doctors`
2. Document ID: `doctor1` (yoki Auto-ID)
3. Fields:

```
id: 1 (number)
name: Dr. Aliyev Sardor (string)
specialty: Lo'r (Otorinolaringolog) (string)
icon: 👂 (string)
workStart: 09:00 (string)
workEnd: 18:00 (string)
lunchStart: 13:00 (string)
lunchEnd: 14:00 (string)
avgTime: 15 (number)
```

4. Qo'shimcha shifokorlar qo'shing (ixtiyoriy):

**Doctor 2:**
```
id: 2
name: Dr. Karimova Dilnoza
specialty: Rentgenolog
icon: 🩻
workStart: 08:00
workEnd: 17:00
lunchStart: 12:30
lunchEnd: 13:30
avgTime: 10
```

**Doctor 3:**
```
id: 3
name: Dr. Rahimov Jasur
specialty: Terapevt
icon: 🩺
workStart: 09:00
workEnd: 19:00
lunchStart: 13:00
lunchEnd: 14:00
avgTime: 20
```

## 7-Qadam: Xavfsizlik Qoidalari (3 daqiqa)

1. **Firestore Database** > **Rules** tab
2. Quyidagi qoidalarni joylashtiring:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Doctors
    match /doctors/{doctorId} {
      allow read: if true;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Queues
    match /queues/{queueId} {
      allow read: if request.auth != null;
      allow create: if true;
      allow update, delete: if request.auth != null;
    }
    
    // Ratings
    match /ratings/{ratingId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if request.auth != null;
    }
  }
}
```

3. "Publish" tugmasini bosing

## 8-Qadam: Loyihani Ishga Tushirish (2 daqiqa)

### VS Code Live Server (tavsiya etiladi)
1. VS Code'da loyihani oching
2. Extensions > "Live Server" o'rnating
3. `index.html` ni oching
4. O'ng pastda "Go Live" tugmasini bosing

### Python HTTP Server
```bash
cd "qabul uchun navbat olish"
python -m http.server 8000
```

Brauzerda: `http://localhost:8000`

### Node.js HTTP Server
```bash
npx http-server -p 8000
```

## 9-Qadam: Tizimni Sinash (5 daqiqa)

### Bemor sifatida
1. `index.html` ni oching
2. Shifokorni tanlang
3. Ma'lumotlarni to'ldiring
4. Navbat oling
5. PDF chekini yuklab oling

### Admin sifatida
1. "Admin Panel" tugmasini bosing
2. Login: `admin@klinika.uz` / `Admin123!`
3. Barcha navbatlarni ko'ring
4. Statistikani tekshiring

### Shifokor sifatida
1. "Shifokor Paneli" tugmasini bosing
2. Shifokorni tanlang
3. Login: `doctor1@klinika.uz` / `Doctor123!`
4. Bugungi bemorlarni ko'ring

## ✅ Tayyor!

Tizim to'liq ishga tushdi! 

### Keyingi Qadamlar:
- [ ] Parollarni o'zgartiring
- [ ] Qo'shimcha shifokorlar qo'shing
- [ ] Dizaynni sozlang
- [ ] Domain ulang (ixtiyoriy)

## 🆘 Muammolar?

### Firebase ulanmayapti
- `js/config.js` faylini tekshiring
- Console'da xatolarni ko'ring (F12)
- Firebase loyiha faolligini tekshiring

### Login ishlamayapti
- Email/Password yoqilganligini tekshiring
- Foydalanuvchi yaratilganligini tekshiring
- `users` kolleksiyasida ma'lumotlar borligini tekshiring

### Ma'lumotlar ko'rinmayapti
- Firestore qoidalarini tekshiring
- Console'da xatolarni ko'ring
- `doctors` kolleksiyasida ma'lumotlar borligini tekshiring

## 📞 Yordam

Qo'shimcha yordam kerak bo'lsa:
- Firebase Documentation: https://firebase.google.com/docs
- Stack Overflow: https://stackoverflow.com/questions/tagged/firebase

---

**Omad tilaymiz! 🎉**
