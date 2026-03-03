/**
 * Yordamchi Funksiyalar
 * Umumiy ishlatilad funksiyalar
 */

/**
 * Telefon raqamiga maska qo'llash
 * Format: +998 XX XXX-XX-XX
 */
export function formatPhoneNumber(input) {
    // Faqat raqamlarni qoldirish
    let numbers = input.replace(/\D/g, '');
    
    // 998 bilan boshlanmasa, qo'shish
    if (!numbers.startsWith('998')) {
        numbers = '998' + numbers;
    }
    
    // Maksimal uzunlik
    numbers = numbers.substring(0, 12);
    
    // Format: +998 XX XXX-XX-XX
    let formatted = '+998';
    if (numbers.length > 3) {
        formatted += ' ' + numbers.substring(3, 5);
    }
    if (numbers.length > 5) {
        formatted += ' ' + numbers.substring(5, 8);
    }
    if (numbers.length > 8) {
        formatted += '-' + numbers.substring(8, 10);
    }
    if (numbers.length > 10) {
        formatted += '-' + numbers.substring(10, 12);
    }
    
    return formatted;
}

/**
 * Telefon input maydoniga maska qo'llash
 */
export function applyPhoneMask(inputElement) {
    inputElement.addEventListener('input', (e) => {
        const cursorPosition = e.target.selectionStart;
        const oldValue = e.target.value;
        const newValue = formatPhoneNumber(oldValue);
        
        e.target.value = newValue;
        
        // Kursorni to'g'ri joyga qo'yish
        if (newValue.length < oldValue.length) {
            e.target.setSelectionRange(cursorPosition, cursorPosition);
        }
    });
    
    // Boshlang'ich qiymat
    if (!inputElement.value) {
        inputElement.value = '+998 ';
    }
}

/**
 * Sanani formatlash
 * @param {Date|string} date - Sana
 * @param {string} format - Format (short, long, time)
 * @returns {string}
 */
export function formatDate(date, format = 'short') {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    const options = {
        short: { year: 'numeric', month: '2-digit', day: '2-digit' },
        long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
        time: { hour: '2-digit', minute: '2-digit' }
    };
    
    return d.toLocaleDateString('uz-UZ', options[format]);
}

/**
 * Loading spinner ko'rsatish/yashirish
 */
export function showLoading(show = true) {
    let loader = document.getElementById('globalLoader');
    
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'globalLoader';
        loader.className = 'global-loader';
        loader.innerHTML = `
            <div class="spinner"></div>
            <p>Yuklanmoqda...</p>
        `;
        document.body.appendChild(loader);
    }
    
    loader.style.display = show ? 'flex' : 'none';
}

/**
 * Toast xabar ko'rsatish
 */
export function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

/**
 * Tasdiqlash dialogi
 */
export function confirmDialog(message) {
    return new Promise((resolve) => {
        const result = confirm(message);
        resolve(result);
    });
}

/**
 * Debounce funksiyasi
 * Tez-tez chaqirilgan funksiyalarni kechiktirish
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * LocalStorage bilan ishlash (fallback)
 */
export const storage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('LocalStorage xatolik:', e);
        }
    },
    
    get(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('LocalStorage xatolik:', e);
            return null;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('LocalStorage xatolik:', e);
        }
    },
    
    clear() {
        try {
            localStorage.clear();
        } catch (e) {
            console.error('LocalStorage xatolik:', e);
        }
    }
};

/**
 * Animatsiya bilan element ko'rsatish
 */
export function fadeIn(element, duration = 300) {
    element.style.opacity = 0;
    element.style.display = 'block';
    
    let start = null;
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        element.style.opacity = Math.min(progress / duration, 1);
        
        if (progress < duration) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

/**
 * Animatsiya bilan element yashirish
 */
export function fadeOut(element, duration = 300) {
    let start = null;
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        element.style.opacity = 1 - Math.min(progress / duration, 1);
        
        if (progress < duration) {
            requestAnimationFrame(animate);
        } else {
            element.style.display = 'none';
        }
    }
    
    requestAnimationFrame(animate);
}

export default {
    formatPhoneNumber,
    applyPhoneMask,
    formatDate,
    showLoading,
    showToast,
    confirmDialog,
    debounce,
    storage,
    fadeIn,
    fadeOut
};
