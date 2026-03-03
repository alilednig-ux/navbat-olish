/**
 * Ma'lumotlar Bazasi Moduli
 * Firestore bilan ishlash uchun CRUD operatsiyalari
 */

import { db, COLLECTIONS } from './config.js';

class DatabaseManager {
    /**
     * Hujjat qo'shish
     * @param {string} collection - Kolleksiya nomi
     * @param {Object} data - Saqlanadigan ma'lumot
     * @returns {Promise<string>} - Hujjat ID
     */
    async add(collection, data) {
        try {
            const docRef = await db.collection(collection).add({
                ...data,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error('Ma\'lumot qo\'shishda xatolik:', error);
            throw error;
        }
    }

    /**
     * Hujjatni yangilash
     * @param {string} collection - Kolleksiya nomi
     * @param {string} docId - Hujjat ID
     * @param {Object} data - Yangilanadigan ma'lumot
     */
    async update(collection, docId, data) {
        try {
            await db.collection(collection).doc(docId).update({
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('Ma\'lumotni yangilashda xatolik:', error);
            throw error;
        }
    }

    /**
     * Hujjatni o'chirish
     * @param {string} collection - Kolleksiya nomi
     * @param {string} docId - Hujjat ID
     */
    async delete(collection, docId) {
        try {
            await db.collection(collection).doc(docId).delete();
        } catch (error) {
            console.error('Ma\'lumotni o\'chirishda xatolik:', error);
            throw error;
        }
    }

    /**
     * Bitta hujjatni olish
     * @param {string} collection - Kolleksiya nomi
     * @param {string} docId - Hujjat ID
     * @returns {Promise<Object>}
     */
    async getOne(collection, docId) {
        try {
            const doc = await db.collection(collection).doc(docId).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('Ma\'lumotni olishda xatolik:', error);
            throw error;
        }
    }

    /**
     * Barcha hujjatlarni olish
     * @param {string} collection - Kolleksiya nomi
     * @param {Object} filters - Filtrlar (ixtiyoriy)
     * @returns {Promise<Array>}
     */
    async getAll(collection, filters = {}) {
        try {
            let query = db.collection(collection);
            
            // Filtrlarni qo'llash
            Object.keys(filters).forEach(key => {
                query = query.where(key, '==', filters[key]);
            });
            
            const snapshot = await query.get();
            const data = [];
            
            snapshot.forEach(doc => {
                data.push({ id: doc.id, ...doc.data() });
            });
            
            return data;
        } catch (error) {
            console.error('Ma\'lumotlarni olishda xatolik:', error);
            throw error;
        }
    }

    /**
     * Real-time listener qo'shish
     * @param {string} collection - Kolleksiya nomi
     * @param {Function} callback - O'zgarishlar bo'lganda chaqiriladigan funksiya
     * @param {Object} filters - Filtrlar (ixtiyoriy)
     * @returns {Function} - Unsubscribe funksiyasi
     */
    listen(collection, callback, filters = {}) {
        let query = db.collection(collection);
        
        // Filtrlarni qo'llash
        Object.keys(filters).forEach(key => {
            query = query.where(key, '==', filters[key]);
        });
        
        return query.onSnapshot(snapshot => {
            const data = [];
            snapshot.forEach(doc => {
                data.push({ id: doc.id, ...doc.data() });
            });
            callback(data);
        }, error => {
            console.error('Real-time listener xatolik:', error);
        });
    }

    /**
     * Sana bo'yicha filtr
     * @param {string} collection - Kolleksiya nomi
     * @param {string} dateField - Sana maydoni
     * @param {Date} startDate - Boshlanish sanasi
     * @param {Date} endDate - Tugash sanasi
     * @returns {Promise<Array>}
     */
    async getByDateRange(collection, dateField, startDate, endDate) {
        try {
            const snapshot = await db.collection(collection)
                .where(dateField, '>=', startDate)
                .where(dateField, '<=', endDate)
                .get();
            
            const data = [];
            snapshot.forEach(doc => {
                data.push({ id: doc.id, ...doc.data() });
            });
            
            return data;
        } catch (error) {
            console.error('Sana bo\'yicha filtr xatolik:', error);
            throw error;
        }
    }
}

// Singleton instance
const dbManager = new DatabaseManager();

export default dbManager;
