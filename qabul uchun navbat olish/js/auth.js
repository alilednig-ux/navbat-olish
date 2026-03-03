/**
 * Autentifikatsiya Moduli
 * Login, logout va foydalanuvchi tekshirish
 */

import { auth, db, COLLECTIONS } from './config.js';

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.userRole = null;
    }

    /**
     * Foydalanuvchini tizimga kiritish
     * @param {string} email - Email manzil
     * @param {string} password - Parol
     * @returns {Promise<Object>} - Foydalanuvchi ma'lumotlari
     */
    async login(email, password) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            this.currentUser = userCredential.user;
            
            // Foydalanuvchi rolini olish
            const userDoc = await db.collection(COLLECTIONS.USERS)
                .doc(this.currentUser.uid)
                .get();
            
            if (userDoc.exists) {
                this.userRole = userDoc.data().role;
                
                // Session storage'ga saqlash
                sessionStorage.setItem('userRole', this.userRole);
                sessionStorage.setItem('userId', this.currentUser.uid);
                
                if (this.userRole === 'doctor') {
                    sessionStorage.setItem('doctorId', userDoc.data().doctorId);
                }
                
                return {
                    success: true,
                    user: this.currentUser,
                    role: this.userRole
                };
            } else {
                throw new Error('Foydalanuvchi ma\'lumotlari topilmadi');
            }
        } catch (error) {
            console.error('Login xatolik:', error);
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    }

    /**
     * Tizimdan chiqish
     */
    async logout() {
        try {
            await auth.signOut();
            this.currentUser = null;
            this.userRole = null;
            
            // Session storage'ni tozalash
            sessionStorage.clear();
            
            // Login sahifasiga yo'naltirish
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout xatolik:', error);
        }
    }

    /**
     * Foydalanuvchi tizimga kirganligini tekshirish
     * @param {string} requiredRole - Talab qilinadigan rol (admin, doctor)
     * @returns {boolean}
     */
    checkAuth(requiredRole = null) {
        const userRole = sessionStorage.getItem('userRole');
        const userId = sessionStorage.getItem('userId');
        
        if (!userId || !userRole) {
            window.location.href = 'login.html';
            return false;
        }
        
        if (requiredRole && userRole !== requiredRole) {
            alert('Sizda bu sahifaga kirish huquqi yo\'q!');
            window.location.href = 'index.html';
            return false;
        }
        
        return true;
    }

    /**
     * Joriy foydalanuvchi ma'lumotlarini olish
     */
    getCurrentUser() {
        return {
            userId: sessionStorage.getItem('userId'),
            role: sessionStorage.getItem('userRole'),
            doctorId: sessionStorage.getItem('doctorId')
        };
    }

    /**
     * Xatolik xabarlarini tarjima qilish
     */
    getErrorMessage(errorCode) {
        const messages = {
            'auth/user-not-found': 'Foydalanuvchi topilmadi',
            'auth/wrong-password': 'Noto\'g\'ri parol',
            'auth/invalid-email': 'Noto\'g\'ri email format',
            'auth/user-disabled': 'Foydalanuvchi bloklangan',
            'auth/too-many-requests': 'Juda ko\'p urinish. Keyinroq qayta urining',
            'auth/network-request-failed': 'Internet aloqasi yo\'q'
        };
        
        return messages[errorCode] || 'Noma\'lum xatolik yuz berdi';
    }

    /**
     * Yangi foydalanuvchi ro'yxatdan o'tkazish (faqat admin uchun)
     */
    async registerUser(email, password, role, doctorId = null) {
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Foydalanuvchi ma'lumotlarini saqlash
            await db.collection(COLLECTIONS.USERS).doc(user.uid).set({
                email: email,
                role: role,
                doctorId: doctorId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            return { success: true, userId: user.uid };
        } catch (error) {
            console.error('Ro\'yxatdan o\'tish xatolik:', error);
            return { success: false, error: this.getErrorMessage(error.code) };
        }
    }
}

// Singleton instance
const authManager = new AuthManager();

export default authManager;
