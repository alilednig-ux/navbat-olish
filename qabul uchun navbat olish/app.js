// Shifokorlar ma'lumotlari
const doctors = [
    { 
        id: 1, 
        name: "Dr. Aliyev Sardor", 
        specialty: "Lo'r (Otorinolaringolog)", 
        icon: "👂",
        workStart: "09:00",
        workEnd: "18:00",
        lunchStart: "13:00",
        lunchEnd: "14:00",
        avgTime: 15 // har bir bemor uchun o'rtacha vaqt (daqiqa)
    },









    
    { 
        id: 2, 
        name: "Dr. Karimova Dilnoza", 
        specialty: "Rentgenolog", 
        icon: "🩻",
        workStart: "08:00",
        workEnd: "17:00",
        lunchStart: "12:30",
        lunchEnd: "13:30",
        avgTime: 10
    },
    { 
        id: 3, 
        name: "Dr. Rahimov Jasur", 
        specialty: "Terapevt", 
        icon: "🩺",
        workStart: "09:00",
        workEnd: "19:00",
        lunchStart: "13:00",
        lunchEnd: "14:00",
        avgTime: 20
    },
    { 
        id: 4, 
        name: "Dr. Yusupova Malika", 
        specialty: "Kardiolog", 
        icon: "❤️",
        workStart: "10:00",
        workEnd: "18:00",
        lunchStart: "14:00",
        lunchEnd: "15:00",
        avgTime: 25
    }
];

// LocalStorage'dan ma'lumotlarni olish
function getQueues() {
    const queues = localStorage.getItem('clinicQueues');
    return queues ? JSON.parse(queues) : {};
}

// LocalStorage'ga saqlash
function saveQueues(queues) {
    localStorage.setItem('clinicQueues', JSON.stringify(queues));
}

// Shifokor ish vaqtida ekanligini tekshirish
function isDoctorWorking(doctor) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startH, startM] = doctor.workStart.split(':').map(Number);
    const [endH, endM] = doctor.workEnd.split(':').map(Number);
    const [lunchStartH, lunchStartM] = doctor.lunchStart.split(':').map(Number);
    const [lunchEndH, lunchEndM] = doctor.lunchEnd.split(':').map(Number);
    
    const workStart = startH * 60 + startM;
    const workEnd = endH * 60 + endM;
    const lunchStart = lunchStartH * 60 + lunchStartM;
    const lunchEnd = lunchEndH * 60 + lunchEndM;
    
    if (currentTime < workStart || currentTime >= workEnd) {
        return { status: 'closed', message: 'Ish vaqti tugagan' };
    }
    
    if (currentTime >= lunchStart && currentTime < lunchEnd) {
        return { status: 'lunch', message: 'Tushlik tanaffusida' };
    }
    
    return { status: 'working', message: 'Qabul qilmoqda' };
}

// Taxminiy kutish vaqtini hisoblash
function getEstimatedWaitTime(doctor, queuePosition) {
    return queuePosition * doctor.avgTime;
}

// Shifokorlar ro'yxatini yuklash
function loadDoctors() {
    const grid = document.getElementById('doctorsGrid');
    if (!grid) return;

    const queues = getQueues();
    
    grid.innerHTML = doctors.map(doctor => {
        const queueCount = queues[doctor.id] ? queues[doctor.id].length : 0;
        const workStatus = isDoctorWorking(doctor);
        const waitTime = getEstimatedWaitTime(doctor, queueCount);
        
        let statusClass = 'status-' + workStatus.status;
        let statusIcon = workStatus.status === 'working' ? '🟢' : 
                        workStatus.status === 'lunch' ? '🟡' : '🔴';
        
        return `
            <div class="doctor-card ${workStatus.status !== 'working' ? 'doctor-unavailable' : ''}" 
                 onclick="selectDoctor(${doctor.id})">
                <div class="doctor-icon">${doctor.icon}</div>
                <h3>${doctor.name}</h3>
                <p>${doctor.specialty}</p>
                <div class="doctor-schedule">
                    <small>⏰ ${doctor.workStart} - ${doctor.workEnd}</small><br>
                    <small>☕ Tanaffus: ${doctor.lunchStart} - ${doctor.lunchEnd}</small>
                </div>
                <div class="doctor-status ${statusClass}">
                    ${statusIcon} ${workStatus.message}
                </div>
                <span class="queue-count">Navbatda: ${queueCount} kishi</span>
                ${queueCount > 0 ? `<small class="wait-time">⏱️ Taxminiy: ~${waitTime} daqiqa</small>` : ''}
            </div>
        `;
    }).join('');
}

// Shifokorni tanlash
function selectDoctor(doctorId) {
    localStorage.setItem('selectedDoctor', doctorId);
    window.location.href = 'queue.html';
}

// Navbat sahifasini boshlash
function initQueuePage() {
    const doctorId = parseInt(localStorage.getItem('selectedDoctor'));
    const doctor = doctors.find(d => d.id === doctorId);
    
    if (!doctor) {
        window.location.href = 'index.html';
        return;
    }

    const workStatus = isDoctorWorking(doctor);
    const queues = getQueues();
    const todayQueues = getTodayQueues(doctorId);
    const queueCount = todayQueues.length;
    const waitTime = getEstimatedWaitTime(doctor, queueCount + 1);

    document.getElementById('doctorName').textContent = doctor.name;
    document.getElementById('doctorSpecialty').textContent = doctor.specialty;
    
    const scheduleInfo = document.getElementById('scheduleInfo');
    scheduleInfo.innerHTML = `
        <p>⏰ Ish vaqti: ${doctor.workStart} - ${doctor.workEnd}</p>
        <p>☕ Tanaffus: ${doctor.lunchStart} - ${doctor.lunchEnd}</p>
        <p>📊 Bugun navbatda: ${queueCount} kishi</p>
        <p>⏱️ Har bir bemor uchun: ~${doctor.avgTime} daqiqa</p>
        <p class="status-${workStatus.status}">Holat: ${workStatus.message}</p>
    `;

    const form = document.getElementById('queueForm');
    const phoneInput = document.getElementById('patientPhone');
    const dateInput = document.getElementById('appointmentDate');
    const timeSelect = document.getElementById('appointmentTime');
    
    // Date input placeholder o'zgartirish
    if (dateInput) {
        dateInput.setAttribute('data-placeholder', 'kun.oy.yil');
        
        // Agar qiymat bo'lmasa, placeholder ko'rsatish
        if (!dateInput.value) {
            dateInput.classList.add('empty-date');
        }
        
        dateInput.addEventListener('change', function() {
            if (this.value) {
                this.classList.remove('empty-date');
            } else {
                this.classList.add('empty-date');
            }
        });
        
        dateInput.addEventListener('focus', function() {
            this.classList.remove('empty-date');
        });
        
        dateInput.addEventListener('blur', function() {
            if (!this.value) {
                this.classList.add('empty-date');
            }
        });
    }
    
    // Bugundan boshlab 30 kun ichida navbat olish mumkin
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dateInput.min = today.toISOString().split('T')[0];
    
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    dateInput.max = maxDate.toISOString().split('T')[0];
    
    // Telefon raqam uchun faqat son kiritish
    phoneInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
    });
    
    // Sana o'zgarganda bo'sh vaqtlarni yuklash
    dateInput.addEventListener('change', () => {
        loadAvailableTimeSlots(doctorId, dateInput.value);
    });
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        addToQueue(doctorId);
    });
    
    // Navbatni tekshirish
    const checkBtn = document.getElementById('checkQueueBtn');
    if (checkBtn) {
        checkBtn.addEventListener('click', checkMyQueue);
    }
}

// Navbatga qo'shish
function addToQueue(doctorId) {
    const patientName = document.getElementById('patientName').value;
    const patientAge = document.getElementById('patientAge').value;
    const patientAddress = document.getElementById('patientAddress').value;
    const patientPhone = document.getElementById('patientPhone').value;
    const appointmentDate = document.getElementById('appointmentDate').value;
    const appointmentTime = document.getElementById('appointmentTime').value;
    
    // Validatsiya
    if (!/^\d+$/.test(patientPhone)) {
        alert('Telefon raqamda faqat sonlar bo\'lishi kerak!');
        return;
    }
    
    if (patientPhone.length < 9) {
        alert('Telefon raqam kamida 9 ta raqamdan iborat bo\'lishi kerak!');
        return;
    }
    
    if (!appointmentDate) {
        alert('Iltimos, qabul kunini tanlang!');
        return;
    }
    
    if (!appointmentTime) {
        alert('Iltimos, qabul vaqtini tanlang!');
        return;
    }
    
    const doctor = doctors.find(d => d.id === doctorId);
    
    // Tanlangan vaqt hali band emasligini tekshirish
    const existingQueues = getQueuesByDate(doctorId, appointmentDate);
    const isTimeBooked = existingQueues.some(q => q.appointmentTime === appointmentTime);
    
    if (isTimeBooked) {
        alert('Bu vaqt allaqachon band! Iltimos, boshqa vaqt tanlang.');
        loadAvailableTimeSlots(doctorId, appointmentDate);
        return;
    }
    
    const queues = getQueues();
    if (!queues[doctorId]) {
        queues[doctorId] = [];
    }

    // Shu kun uchun navbat raqamini hisoblash
    const dayQueues = getQueuesByDate(doctorId, appointmentDate);
    const queueNumber = dayQueues.length + 1;
    const timestamp = new Date().toLocaleString('uz-UZ');
    
    // Qabul vaqtini formatlash
    const appointmentDateTime = new Date(appointmentDate + 'T' + appointmentTime);
    const appointmentDateStr = appointmentDateTime.toLocaleDateString('uz-UZ', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    queues[doctorId].push({
        number: queueNumber,
        patientName,
        patientAge,
        patientAddress,
        patientPhone,
        timestamp,
        appointmentDate,
        appointmentTime,
        appointmentDateTime: appointmentDateTime.toISOString(),
        status: 'waiting',
        doctorName: doctor.name,
        appointmentDuration: doctor.avgTime
    });

    saveQueues(queues);

    // Natijani ko'rsatish
    document.getElementById('queueForm').parentElement.classList.add('hidden');
    document.getElementById('scheduleInfo').classList.add('hidden');
    document.getElementById('queueResult').classList.remove('hidden');
    document.getElementById('queueNumber').textContent = queueNumber;
    document.getElementById('resultDoctor').textContent = doctor.name;
    document.getElementById('resultPatient').textContent = patientName;
    document.getElementById('resultTime').textContent = `${appointmentDateStr}, ${appointmentTime}`;
    document.getElementById('resultWaitTime').textContent = `~${doctor.avgTime} daqiqa`;
}

// Navbatni tekshirish
function checkMyQueue() {
    const phone = prompt('Telefon raqamingizni kiriting:');
    if (!phone) return;
    
    const queues = getQueues();
    let found = false;
    
    for (let doctorId in queues) {
        const queue = queues[doctorId].find(q => q.patientPhone === phone);
        if (queue) {
            const doctor = doctors.find(d => d.id === parseInt(doctorId));
            const position = queues[doctorId].findIndex(q => q.patientPhone === phone) + 1;
            const waitTime = getEstimatedWaitTime(doctor, position);
            
            alert(`Sizning navbatingiz:\n\nShifokor: ${doctor.name}\nNavbat: ${queue.number}\nHozirgi pozitsiya: ${position}\nTaxminiy kutish: ~${waitTime} daqiqa\nHolat: ${queue.status === 'waiting' ? 'Kutilmoqda' : 'Qabul qilingan'}`);
            found = true;
            break;
        }
    }
    
    if (!found) {
        alert('Sizning navbatingiz topilmadi.');
    }
}

// Barcha navbatlarni yuklash (Admin panel)
function loadAllQueues() {
    const container = document.getElementById('queuesContainer');
    if (!container) return;

    const queues = getQueues();
    const today = new Date().toISOString().split('T')[0];
    
    // Statistika
    let totalQueues = 0;
    let todayTotal = 0;
    let stats = doctors.map(doctor => {
        const count = queues[doctor.id] ? queues[doctor.id].length : 0;
        const todayCount = queues[doctor.id] ? queues[doctor.id].filter(p => {
            const patientDate = p.appointmentDate || new Date(p.timestamp).toISOString().split('T')[0];
            return patientDate === today;
        }).length : 0;
        
        totalQueues += count;
        todayTotal += todayCount;
        return { doctor, count, todayCount };
    });
    
    let statsHTML = `
        <div class="stats-panel">
            <h3>📊 Bugungi Statistika</h3>
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-number">${todayTotal}</div>
                    <div class="stat-label">Bugungi Bemorlar</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${totalQueues}</div>
                    <div class="stat-label">Jami Navbatlar</div>
                </div>
                ${stats.map(s => `
                    <div class="stat-item">
                        <div class="stat-number">${s.todayCount}</div>
                        <div class="stat-label">${s.doctor.icon} ${s.doctor.name.split(' ')[1]}</div>
                        <div class="stat-sublabel">Bugun</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    if (Object.keys(queues).length === 0) {
        container.innerHTML = statsHTML + '<div class="doctor-queue"><p>Hozircha navbatlar yo\'q</p></div>';
        return;
    }

    let queuesHTML = doctors.map(doctor => {
        const doctorQueues = queues[doctor.id] || [];
        
        if (doctorQueues.length === 0) return '';
        
        const workStatus = isDoctorWorking(doctor);
        const todayPatients = doctorQueues.filter(p => {
            const patientDate = p.appointmentDate || new Date(p.timestamp).toISOString().split('T')[0];
            return patientDate === today;
        });
        
        // Sana bo'yicha guruhlash
        const groupedByDate = {};
        doctorQueues.forEach(queue => {
            const date = queue.appointmentDate || new Date(queue.timestamp).toISOString().split('T')[0];
            if (!groupedByDate[date]) {
                groupedByDate[date] = [];
            }
            groupedByDate[date].push(queue);
        });
        
        // Sanalarni saralash
        const sortedDates = Object.keys(groupedByDate).sort();

        return `
            <div class="doctor-queue">
                <h3>${doctor.icon} ${doctor.name} - ${doctor.specialty}</h3>
                <div class="queue-header">
                    <span>Holat: ${workStatus.message}</span>
                    <span>Bugun: ${todayPatients.length} | Jami: ${doctorQueues.length} bemor</span>
                </div>
                ${sortedDates.map(date => {
                    const dateQueues = groupedByDate[date];
                    const isToday = date === today;
                    const dateObj = new Date(date + 'T00:00:00');
                    const dateStr = dateObj.toLocaleDateString('uz-UZ', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    });
                    
                    // Vaqt bo'yicha saralash
                    dateQueues.sort((a, b) => {
                        const timeA = a.appointmentTime || '00:00';
                        const timeB = b.appointmentTime || '00:00';
                        return timeA.localeCompare(timeB);
                    });
                    
                    return `
                        <div class="date-group ${isToday ? 'today-group' : ''}">
                            <h4 class="date-header">
                                📅 ${dateStr} ${isToday ? '<span class="today-badge">Bugun</span>' : ''}
                            </h4>
                            ${dateQueues.map((queue, index) => `
                                <div class="queue-item ${queue.status === 'completed' ? 'completed' : ''}">
                                    <div class="queue-item-info">
                                        <strong>Navbat #${queue.number}</strong>
                                        ${queue.appointmentTime ? `<span class="time-badge">🕐 ${queue.appointmentTime}</span>` : ''}<br>
                                        Bemor: ${queue.patientName}<br>
                                        Yoshi: ${queue.patientAge || 'N/A'}<br>
                                        Manzil: ${queue.patientAddress || 'N/A'}<br>
                                        Telefon: ${queue.patientPhone}<br>
                                        Ro'yxatdan o'tgan: ${queue.timestamp}<br>
                                        <small>Qabul davomiyligi: ~${doctor.avgTime} daqiqa</small>
                                    </div>
                                    <div class="queue-actions">
                                        <button onclick="completeQueue(${doctor.id}, ${doctorQueues.indexOf(queue)})" class="btn-complete">✓</button>
                                        <button onclick="removeFromQueue(${doctor.id}, ${doctorQueues.indexOf(queue)})" class="btn-remove">✕</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }).join('');
    
    container.innerHTML = statsHTML + queuesHTML;
}

// Navbatni tugatish
function completeQueue(doctorId, index) {
    const queues = getQueues();
    queues[doctorId][index].status = 'completed';
    saveQueues(queues);
    
    // Keyingi navbatga o'tish
    setTimeout(() => {
        removeFromQueue(doctorId, index);
    }, 1000);
}

// Navbatdan o'chirish
function removeFromQueue(doctorId, index) {
    const queues = getQueues();
    queues[doctorId].splice(index, 1);
    
    // Navbat raqamlarini qayta hisoblash
    queues[doctorId] = queues[doctorId].map((q, i) => ({
        ...q,
        number: i + 1
    }));
    
    saveQueues(queues);
    loadAllQueues();
}

// Barcha navbatlarni tozalash
function clearAllQueues() {
    if (confirm('Barcha navbatlarni o\'chirmoqchimisiz?')) {
        localStorage.removeItem('clinicQueues');
        loadAllQueues();
    }
}


// Bemorlar paneli funksiyalari
function loadPatients() {
    const container = document.getElementById('patientsContainer');
    if (!container) return;

    const queues = getQueues();
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const doctorFilter = document.getElementById('doctorFilter')?.value || 'all';
    
    let allPatients = [];
    let waitingCount = 0;
    let completedCount = 0;

    // Barcha bemorlarni yig'ish
    for (let doctorId in queues) {
        const doctor = doctors.find(d => d.id === parseInt(doctorId));
        queues[doctorId].forEach(patient => {
            allPatients.push({
                ...patient,
                doctorId: parseInt(doctorId),
                doctorName: doctor.name,
                doctorSpecialty: doctor.specialty,
                doctorIcon: doctor.icon,
                appointmentDuration: doctor.avgTime
            });
            
            if (patient.status === 'waiting') waitingCount++;
            else if (patient.status === 'completed') completedCount++;
        });
    }

    // Filtrlash
    let filteredPatients = allPatients.filter(patient => {
        const matchesSearch = patient.patientName.toLowerCase().includes(searchTerm) || 
                            patient.patientPhone.includes(searchTerm);
        const matchesDoctor = doctorFilter === 'all' || patient.doctorId === parseInt(doctorFilter);
        return matchesSearch && matchesDoctor;
    });

    // Statistikani yangilash
    document.getElementById('totalPatients').textContent = allPatients.length;
    document.getElementById('waitingPatients').textContent = waitingCount;
    document.getElementById('completedPatients').textContent = completedCount;

    if (filteredPatients.length === 0) {
        container.innerHTML = '<div class="no-patients"><p>Hozircha bemorlar yo\'q</p></div>';
        return;
    }

    // Bemorlar jadvalini yaratish
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
                        <th>Qabul vaqti</th>
                        <th>Holat</th>
                        <th>Ro'yxatdan o'tgan vaqt</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredPatients.map((patient, index) => `
                        <tr class="${patient.status === 'completed' ? 'completed-row' : ''}">
                            <td><strong>${patient.number}</strong></td>
                            <td>
                                <div class="patient-name">${patient.patientName}</div>
                            </td>
                            <td>${patient.patientAge || 'N/A'}</td>
                            <td>${patient.patientAddress || 'N/A'}</td>
                            <td><a href="tel:${patient.patientPhone}">${patient.patientPhone}</a></td>
                            <td>
                                <div class="doctor-info">
                                    <span class="doctor-icon-small">${patient.doctorIcon}</span>
                                    <div>
                                        <div class="doctor-name-small">${patient.doctorName}</div>
                                        <div class="doctor-specialty-small">${patient.doctorSpecialty}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="duration-badge">⏱️ ~${patient.appointmentDuration} daqiqa</span>
                            </td>
                            <td>
                                <span class="status-badge status-${patient.status}">
                                    ${patient.status === 'waiting' ? '⏰ Kutmoqda' : '✅ Qabul qilindi'}
                                </span>
                            </td>
                            <td><small>${patient.timestamp}</small></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    container.innerHTML = patientsHTML;
}

// Bemorlar paneli filtrlarini boshlash
function initPatientFilters() {
    const doctorFilter = document.getElementById('doctorFilter');
    if (!doctorFilter) return;

    // Shifokorlar ro'yxatini qo'shish
    doctors.forEach(doctor => {
        const option = document.createElement('option');
        option.value = doctor.id;
        option.textContent = `${doctor.icon} ${doctor.name}`;
        doctorFilter.appendChild(option);
    });

    // Qidiruv va filtr o'zgarishlarini kuzatish
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', loadPatients);
    }
    
    if (doctorFilter) {
        doctorFilter.addEventListener('change', loadPatients);
    }
}


// Reytinglarni saqlash
function getRatings() {
    const ratings = localStorage.getItem('doctorRatings');
    return ratings ? JSON.parse(ratings) : {};
}

function saveRatings(ratings) {
    localStorage.setItem('doctorRatings', JSON.stringify(ratings));
}

// Shifokorni baholash
function rateDoctor(doctorId, patientPhone, rating) {
    const ratings = getRatings();
    if (!ratings[doctorId]) {
        ratings[doctorId] = [];
    }
    
    // Bir bemor bir marta baholashi mumkin
    const existingRating = ratings[doctorId].find(r => r.patientPhone === patientPhone);
    if (existingRating) {
        existingRating.rating = rating;
        existingRating.timestamp = new Date().toLocaleString('uz-UZ');
    } else {
        ratings[doctorId].push({
            patientPhone,
            rating,
            timestamp: new Date().toLocaleString('uz-UZ')
        });
    }
    
    saveRatings(ratings);
}

// O'rtacha reytingni hisoblash
function getAverageRating(doctorId) {
    const ratings = getRatings();
    if (!ratings[doctorId] || ratings[doctorId].length === 0) {
        return 0;
    }
    
    const sum = ratings[doctorId].reduce((acc, r) => acc + r.rating, 0);
    return (sum / ratings[doctorId].length).toFixed(1);
}

// Navbatni tugatish va baholash so'rash
function completeQueue(doctorId, index) {
    const queues = getQueues();
    const patient = queues[doctorId][index];
    queues[doctorId][index].status = 'completed';
    saveQueues(queues);
    
    // Baholash oynasini ko'rsatish
    setTimeout(() => {
        showRatingModal(doctorId, patient.patientPhone, patient.patientName);
    }, 500);
}

// Baholash modalini ko'rsatish
function showRatingModal(doctorId, patientPhone, patientName) {
    const doctor = doctors.find(d => d.id === doctorId);
    const rating = prompt(
        `${patientName}, ${doctor.name} shifokorni baholang!\n\n` +
        `1 - Juda yomon\n` +
        `2 - Yomon\n` +
        `3 - O'rtacha\n` +
        `4 - Yaxshi\n` +
        `5 - A'lo\n\n` +
        `Raqam kiriting (1-5):`
    );
    
    if (rating && rating >= 1 && rating <= 5) {
        rateDoctor(doctorId, patientPhone, parseInt(rating));
        alert('Rahmat! Sizning fikringiz qabul qilindi.');
        loadAllQueues();
    }
}

// Shifokorlar reytingini yuklash
function loadDoctorRatings() {
    const container = document.getElementById('ratingsContainer');
    if (!container) return;

    const ratings = getRatings();
    
    // Shifokorlarni reyting bo'yicha saralash
    const doctorsWithRatings = doctors.map(doctor => {
        const avgRating = parseFloat(getAverageRating(doctor.id));
        const ratingCount = ratings[doctor.id] ? ratings[doctor.id].length : 0;
        return { ...doctor, avgRating, ratingCount };
    }).sort((a, b) => b.avgRating - a.avgRating);

    let html = '<div class="ratings-grid">';
    
    doctorsWithRatings.forEach((doctor, index) => {
        const stars = generateStars(doctor.avgRating);
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
        
        html += `
            <div class="rating-card">
                <div class="rating-rank">${medal || (index + 1)}</div>
                <div class="doctor-icon">${doctor.icon}</div>
                <h3>${doctor.name}</h3>
                <p>${doctor.specialty}</p>
                <div class="rating-stars">${stars}</div>
                <div class="rating-score">${doctor.avgRating.toFixed(1)} / 5.0</div>
                <div class="rating-count">${doctor.ratingCount} ta baho</div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Yulduzlarni generatsiya qilish
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

// Shifokor login sahifasini yuklash
function loadDoctorLogin() {
    const grid = document.getElementById('doctorLoginGrid');
    if (!grid) return;

    grid.innerHTML = doctors.map(doctor => {
        const avgRating = getAverageRating(doctor.id);
        const stars = generateStars(parseFloat(avgRating));
        
        return `
            <div class="doctor-card" onclick="selectDoctorPanel(${doctor.id})">
                <div class="doctor-icon">${doctor.icon}</div>
                <h3>${doctor.name}</h3>
                <p>${doctor.specialty}</p>
                <div class="rating-stars">${stars}</div>
                <div class="rating-score">${avgRating} / 5.0</div>
            </div>
        `;
    }).join('');
}

// Shifokor panelini tanlash
function selectDoctorPanel(doctorId) {
    localStorage.setItem('currentDoctor', doctorId);
    window.location.href = 'doctor-panel.html';
}

// Shifokor panelini boshlash
function initDoctorPanel() {
    const doctorId = parseInt(localStorage.getItem('currentDoctor'));
    const doctor = doctors.find(d => d.id === doctorId);
    
    if (!doctor) {
        window.location.href = 'doctor.html';
        return;
    }

    document.getElementById('doctorPanelName').textContent = doctor.name;
    document.getElementById('doctorPanelSpecialty').textContent = doctor.specialty;
    
    loadDoctorPatients();
}

// Shifokor bemorlarini yuklash
function loadDoctorPatients() {
    const doctorId = parseInt(localStorage.getItem('currentDoctor'));
    const doctor = doctors.find(d => d.id === doctorId);
    const container = document.getElementById('doctorPatientsContainer');
    
    if (!container || !doctor) return;

    const queues = getQueues();
    const doctorQueue = queues[doctorId] || [];
    
    // Bugungi sana
    const today = new Date().toISOString().split('T')[0];
    const todayPatients = doctorQueue.filter(p => {
        const patientDate = p.appointmentDate || new Date(p.timestamp).toISOString().split('T')[0];
        return patientDate === today;
    });
    
    const waitingPatients = doctorQueue.filter(p => p.status === 'waiting');
    const avgRating = getAverageRating(doctorId);

    // Statistikani yangilash
    document.getElementById('todayPatients').textContent = todayPatients.length;
    document.getElementById('waitingNow').textContent = waitingPatients.length;
    document.getElementById('doctorRating').textContent = avgRating;

    if (todayPatients.length === 0) {
        container.innerHTML = '<div class="no-patients"><p>Bugun hali bemorlar yo\'q</p></div>';
        return;
    }

    // Vaqt bo'yicha saralash
    todayPatients.sort((a, b) => {
        const timeA = a.appointmentTime || '00:00';
        const timeB = b.appointmentTime || '00:00';
        return timeA.localeCompare(timeB);
    });

    let html = `
        <div class="doctor-patients-list">
            <h2>� Bugungi Bemorlar (${todayePatients.length} ta)</h2>
            ${todayPatients.map((patient, index) => `
                <div class="patient-card ${patient.status === 'completed' ? 'completed-patient' : ''}">
                    <div class="patient-number">#${patient.number}</div>
                    <div class="patient-details">
                        <h3>${patient.patientName}</h3>
                        <p>🕐 Qabul vaqti: <strong>${patient.appointmentTime || 'Belgilanmagan'}</strong></p>
                        <p>📞 ${patient.patientPhone}</p>
                        <p>🎂 ${patient.patientAge || 'N/A'} yosh</p>
                        <p>📍 ${patient.patientAddress || 'N/A'}</p>
                        <p>📅 Ro'yxatdan o'tgan: ${patient.timestamp}</p>
                        <p class="status-badge status-${patient.status}">
                            ${patient.status === 'waiting' ? '⏰ Kutmoqda' : '✅ Qabul qilindi'}
                        </p>
                    </div>
                    ${patient.status === 'waiting' ? `
                        <button onclick="completeDoctorQueue(${doctorId}, ${doctorQueue.indexOf(patient)})" class="btn-complete-large">
                            Qabul Tugadi
                        </button>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    `;

    container.innerHTML = html;
}

// Shifokor panelidan navbatni tugatish
function completeDoctorQueue(doctorId, index) {
    completeQueue(doctorId, index);
    setTimeout(() => {
        loadDoctorPatients();
    }, 1500);
}
