/**
 * Bemorlar Paneli Moduli
 * Barcha bemorlar ma'lumotlari
 */

import { COLLECTIONS } from './config.js';
import dbManager from './database.js';
import authManager from './auth.js';
import { showLoading, showToast, debounce } from './utils.js';
import { loadDoctorsFromFirestore } from './app-integrated.js';

let doctors = [];
let allPatients = [];
let unsubscribePatients = null;

/**
 * Bemorlar panelini boshlash
 */
async function initPatientsPanel() {
    // Auth tekshirish
    if (!authManager.checkAuth('admin')) {
        return;
    }
    
    showLoading(true);
    
    // Shifokorlarni yuklash
    doctors = await loadDoctorsFromFirestore();
    
    // Filtrlarni boshlash
    initPatientFilters();
    
    // Real-time bemorlarni kuzatish
    setupRealTimePatients();
    
    showLoading(false);
}

/**
 * Real-time bemorlarni kuzatish
 */
function setupRealTimePatients() {
    // Eski listenerni o'chirish
    if (unsubscribePatients) {
        unsubscribePatients();
    }
    
    // Yangi listener
    unsubscribePatients = dbManager.listen(COLLECTIONS.QUEUES, (patients) => {
        allPatients = patients;
        displayPatients();
    });
}

/**
 * Bemorlarni ko'rsatish
 */
function displayPatients() {
    const container = document.getElementById('patientsContainer');
    if (!container) return;
    
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const doctorFilter = document.getElementById('doctorFilter')?.value || 'all';
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    
    // Filtrlash
    let filteredPatients = allPatients.filter(patient => {
        const matchesSearch = patient.patientName.toLowerCase().includes(searchTerm) || 
                            patient.patientPhone.includes(searchTerm);
        const matchesDoctor = doctorFilter === 'all' || patient.doctorId === parseInt(doctorFilter);
        const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
        return matchesSearch && matchesDoctor && matchesStatus;
    });
    
    // Statistikani yangilash
    const waitingCount = allPatients.filter(p => p.status === 'waiting').length;
    const completedCount = allPatients.filter(p => p.status === 'completed').length;
    
    document.getElementById('totalPatients').textContent = allPatients.length;
    document.getElementById('waitingPatients').textContent = waitingCount;
    document.getElementById('completedPatients').textContent = completedCount;
    
    if (filteredPatients.length === 0) {
        container.innerHTML = '<div class="no-patients"><p>Bemorlar topilmadi</p></div>';
        return;
    }
    
    // Sanaga ko'ra saralash (yangilar birinchi)
    filteredPatients.sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    // Jadval yaratish
    let patientsHTML = `
        <div class="patients-table">
            <table>
                <thead>
                    <tr>
                        <th>№</th>
                        <th>Bemor</th>
                        <th>Yoshi</th>
                        <th>Manzil</th>
                        <th>Telefon</th>
                        <th>Shifokor</th>
                        <th>Qabul Sanasi</th>
                        <th>Qabul Vaqti</th>
                        <th>Holat</th>
                        <th>Tashxis</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredPatients.map((patient, index) => {
                        const doctor = doctors.find(d => d.id === patient.doctorId);
                        const appointmentDate = new Date(patient.appointmentDate + 'T00:00:00');
                        const dateStr = appointmentDate.toLocaleDateString('uz-UZ', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        });
                        
                        return `
                            <tr class="${patient.status === 'completed' ? 'completed-row' : ''}">
                                <td><strong>#${patient.number}</strong></td>
                                <td>
                                    <div class="patient-name">${patient.patientName}</div>
                                </td>
                                <td>${patient.patientAge || 'N/A'}</td>
                                <td>${patient.patientAddress || 'N/A'}</td>
                                <td><a href="tel:${patient.patientPhone}">${patient.patientPhone}</a></td>
                                <td>
                                    <div class="doctor-info">
                                        <span class="doctor-icon-small">${doctor?.icon || '👨‍⚕️'}</span>
                                        <div>
                                            <div class="doctor-name-small">${doctor?.name || 'N/A'}</div>
                                            <div class="doctor-specialty-small">${doctor?.specialty || 'N/A'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>${dateStr}</td>
                                <td>
                                    <span class="duration-badge">⏱️ ${patient.appointmentTime}</span>
                                </td>
                                <td>
                                    <span class="status-badge status-${patient.status}">
                                        ${patient.status === 'waiting' ? '⏰ Kutmoqda' : '✅ Qabul qilindi'}
                                    </span>
                                </td>
                                <td>
                                    ${patient.diagnosis ? `
                                        <div class="diagnosis-cell">
                                            <strong>Tashxis:</strong> ${patient.diagnosis}<br>
                                            ${patient.notes ? `<small>Eslatma: ${patient.notes}</small>` : ''}
                                        </div>
                                    ` : '<span style="color: #999;">-</span>'}
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = patientsHTML;
}

/**
 * Filtrlarni boshlash
 */
function initPatientFilters() {
    const doctorFilter = document.getElementById('doctorFilter');
    const statusFilter = document.getElementById('statusFilter');
    const searchInput = document.getElementById('searchInput');
    
    if (!doctorFilter || !statusFilter || !searchInput) return;
    
    // Shifokorlar ro'yxatini qo'shish
    doctors.forEach(doctor => {
        const option = document.createElement('option');
        option.value = doctor.id;
        option.textContent = `${doctor.icon} ${doctor.name}`;
        doctorFilter.appendChild(option);
    });
    
    // Holat filtri
    const statusOptions = [
        { value: 'waiting', text: '⏰ Kutayotganlar' },
        { value: 'completed', text: '✅ Qabul qilinganlar' }
    ];
    
    statusOptions.forEach(status => {
        const option = document.createElement('option');
        option.value = status.value;
        option.textContent = status.text;
        statusFilter.appendChild(option);
    });
    
    // Event listenerlar
    const debouncedSearch = debounce(() => displayPatients(), 300);
    
    searchInput.addEventListener('input', debouncedSearch);
    doctorFilter.addEventListener('change', displayPatients);
    statusFilter.addEventListener('change', displayPatients);
}

/**
 * Excel export (kelajakda)
 */
window.exportToExcel = function() {
    showToast('Excel export funksiyasi tez orada qo\'shiladi!', 'info');
};

/**
 * Sahifa yuklanganda
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPatientsPanel);
} else {
    initPatientsPanel();
}

// Sahifa yopilganda listenerni o'chirish
window.addEventListener('beforeunload', () => {
    if (unsubscribePatients) {
        unsubscribePatients();
    }
});

export { initPatientsPanel };
