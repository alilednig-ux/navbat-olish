/**
 * Reytinglar Paneli Moduli
 * Shifokorlar reytingi
 */

import { COLLECTIONS } from './config.js';
import dbManager from './database.js';
import authManager from './auth.js';
import { showLoading, showToast } from './utils.js';
import { loadDoctorsFromFirestore } from './app-integrated.js';

let doctors = [];
let allRatings = [];
let unsubscribeRatings = null;

/**
 * Reytinglar panelini boshlash
 */
async function initRatingsPanel() {
    // Auth tekshirish (admin yoki doctor)
    const user = authManager.getCurrentUser();
    if (!user.userId) {
        window.location.href = 'login.html';
        return;
    }
    
    showLoading(true);
    
    // Shifokorlarni yuklash
    doctors = await loadDoctorsFromFirestore();
    
    // Real-time reytinglarni kuzatish
    setupRealTimeRatings();
    
    showLoading(false);
}

/**
 * Real-time reytinglarni kuzatish
 */
function setupRealTimeRatings() {
    // Eski listenerni o'chirish
    if (unsubscribeRatings) {
        unsubscribeRatings();
    }
    
    // Yangi listener
    unsubscribeRatings = dbManager.listen(COLLECTIONS.RATINGS, (ratings) => {
        allRatings = ratings;
        displayRatings();
    });
}

/**
 * Reytinglarni ko'rsatish
 */
function displayRatings() {
    const container = document.getElementById('ratingsContainer');
    if (!container) return;
    
    // Har bir shifokor uchun o'rtacha reytingni hisoblash
    const doctorsWithRatings = doctors.map(doctor => {
        const doctorRatings = allRatings.filter(r => r.doctorId === doctor.id);
        
        let avgRating = 0;
        if (doctorRatings.length > 0) {
            const sum = doctorRatings.reduce((acc, r) => acc + r.rating, 0);
            avgRating = sum / doctorRatings.length;
        }
        
        return {
            ...doctor,
            avgRating: avgRating,
            ratingCount: doctorRatings.length,
            ratings: doctorRatings
        };
    });
    
    // Reyting bo'yicha saralash
    doctorsWithRatings.sort((a, b) => b.avgRating - a.avgRating);
    
    let html = '<div class="ratings-grid">';
    
    doctorsWithRatings.forEach((doctor, index) => {
        const stars = generateStars(doctor.avgRating);
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
        
        // Reyting taqsimoti
        const ratingDistribution = [5, 4, 3, 2, 1].map(star => {
            const count = doctor.ratings.filter(r => r.rating === star).length;
            const percentage = doctor.ratingCount > 0 ? (count / doctor.ratingCount * 100).toFixed(0) : 0;
            return { star, count, percentage };
        });
        
        html += `
            <div class="rating-card">
                <div class="rating-rank">${medal || (index + 1)}</div>
                <div class="doctor-icon">${doctor.icon}</div>
                <h3>${doctor.name}</h3>
                <p>${doctor.specialty}</p>
                <div class="rating-stars">${stars}</div>
                <div class="rating-score">${doctor.avgRating.toFixed(1)} / 5.0</div>
                <div class="rating-count">${doctor.ratingCount} ta baho</div>
                
                ${doctor.ratingCount > 0 ? `
                    <div class="rating-distribution">
                        <h4>Baholash taqsimoti:</h4>
                        ${ratingDistribution.map(rd => `
                            <div class="rating-bar">
                                <span class="rating-label">${rd.star} ⭐</span>
                                <div class="rating-progress">
                                    <div class="rating-progress-fill" style="width: ${rd.percentage}%"></div>
                                </div>
                                <span class="rating-percentage">${rd.percentage}%</span>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p style="color: #999; margin-top: 15px;">Hali baholanmagan</p>'}
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

/**
 * Yulduzlarni generatsiya qilish
 */
function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            stars += '⭐';
        } else if (i - 0.5 <= rating) {
            stars += '⭐';
        } else {
            stars += '☆';
        }
    }
    return stars;
}

/**
 * Sahifa yuklanganda
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRatingsPanel);
} else {
    initRatingsPanel();
}

// Sahifa yopilganda listenerni o'chirish
window.addEventListener('beforeunload', () => {
    if (unsubscribeRatings) {
        unsubscribeRatings();
    }
});

export { initRatingsPanel };
