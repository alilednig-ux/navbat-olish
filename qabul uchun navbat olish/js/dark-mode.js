/**
 * Dark Mode Moduli
 * Tungi rejimni boshqarish
 */

class DarkModeManager {
    constructor() {
        this.isDark = false;
        this.init();
    }

    /**
     * Dark Mode'ni boshlash
     */
    init() {
        // LocalStorage'dan holatni olish
        const savedMode = localStorage.getItem('darkMode');
        this.isDark = savedMode === 'true';
        
        // Holatni qo'llash
        if (this.isDark) {
            document.body.classList.add('dark-mode');
        }
        
        // Toggle tugmasini yaratish
        this.createToggleButton();
    }

    /**
     * Toggle tugmasini yaratish
     */
    createToggleButton() {
        // Agar tugma mavjud bo'lsa, o'chirish
        const existingBtn = document.getElementById('darkModeToggle');
        if (existingBtn) {
            existingBtn.remove();
        }
        
        const button = document.createElement('button');
        button.id = 'darkModeToggle';
        button.className = 'dark-mode-toggle';
        button.innerHTML = this.isDark ? '☀️' : '🌙';
        button.setAttribute('aria-label', 'Dark Mode Toggle');
        button.title = this.isDark ? 'Kunduzgi rejim' : 'Tungi rejim';
        
        button.addEventListener('click', () => this.toggle());
        
        document.body.appendChild(button);
    }

    /**
     * Dark Mode'ni o'zgartirish
     */
    toggle() {
        this.isDark = !this.isDark;
        
        // Body'ga class qo'shish/olib tashlash
        if (this.isDark) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        
        // LocalStorage'ga saqlash
        localStorage.setItem('darkMode', this.isDark);
        
        // Tugma ikonini yangilash
        const button = document.getElementById('darkModeToggle');
        if (button) {
            button.innerHTML = this.isDark ? '☀️' : '🌙';
            button.title = this.isDark ? 'Kunduzgi rejim' : 'Tungi rejim';
        }
        
        // Event dispatch qilish (boshqa modullar uchun)
        window.dispatchEvent(new CustomEvent('darkModeChanged', {
            detail: { isDark: this.isDark }
        }));
    }

    /**
     * Joriy holatni olish
     */
    getMode() {
        return this.isDark;
    }

    /**
     * Dark Mode'ni majburiy o'rnatish
     */
    setMode(isDark) {
        if (this.isDark !== isDark) {
            this.toggle();
        }
    }
}

// Singleton instance
const darkModeManager = new DarkModeManager();

// Sahifa yuklanganda avtomatik ishga tushirish
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        darkModeManager.init();
    });
} else {
    darkModeManager.init();
}

export default darkModeManager;
