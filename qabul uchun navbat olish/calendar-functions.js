// Kalendar va vaqt boshqaruvi funksiyalari

// Bugungi navbatlarni olish
function getTodayQueues(doctorId) {
    const queues = getQueues();
    const today = new Date().toISOString().split('T')[0];
    
    if (!queues[doctorId]) return [];
    
    return queues[doctorId].filter(q => {
        const queueDate = q.appointmentDate || new Date(q.timestamp).toISOString().split('T')[0];
        return queueDate === today;
    });
}

// Ma'lum kun uchun navbatlarni olish
function getQueuesByDate(doctorId, date) {
    const queues = getQueues();
    if (!queues[doctorId]) return [];
    
    return queues[doctorId].filter(q => {
        const queueDate = q.appointmentDate || new Date(q.timestamp).toISOString().split('T')[0];
        return queueDate === date;
    });
}

// Bo'sh vaqt oralig'ini yaratish
function generateTimeSlots(doctor, date) {
    const slots = [];
    const [startH, startM] = doctor.workStart.split(':').map(Number);
    const [endH, endM] = doctor.workEnd.split(':').map(Number);
    const [lunchStartH, lunchStartM] = doctor.lunchStart.split(':').map(Number);
    const [lunchEndH, lunchEndM] = doctor.lunchEnd.split(':').map(Number);
    
    let currentTime = startH * 60 + startM;
    const endTime = endH * 60 + endM;
    const lunchStart = lunchStartH * 60 + lunchStartM;
    const lunchEnd = lunchEndH * 60 + lunchEndM;
    
    while (currentTime < endTime) {
        // Tushlik vaqtini o'tkazib yuborish
        if (currentTime >= lunchStart && currentTime < lunchEnd) {
            currentTime = lunchEnd;
            continue;
        }
        
        const hours = Math.floor(currentTime / 60);
        const minutes = currentTime % 60;
        const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        
        slots.push({
            time: timeStr,
            minutes: currentTime
        });
        
        currentTime += doctor.avgTime;
    }
    
    return slots;
}


// Bo'sh vaqtlarni yuklash
function loadAvailableTimeSlots(doctorId, date) {
    const doctor = doctors.find(d => d.id === doctorId);
    const timeSelect = document.getElementById('appointmentTime');
    const timeSlotInfo = document.getElementById('timeSlotInfo');
    
    if (!date) {
        timeSelect.innerHTML = '<option value="">Avval sanani tanlang</option>';
        timeSlotInfo.textContent = '';
        return;
    }
    
    const selectedDate = new Date(date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Hafta kunini tekshirish (0 = Yakshanba, 6 = Shanba)
    const dayOfWeek = selectedDate.getDay();
    if (dayOfWeek === 0) {
        timeSelect.innerHTML = '<option value="">Yakshanba dam olish kuni</option>';
        timeSlotInfo.textContent = '❌ Yakshanba kuni shifokor ishlamaydi';
        timeSlotInfo.style.color = '#dc3545';
        return;
    }
    
    const allSlots = generateTimeSlots(doctor, date);
    const bookedQueues = getQueuesByDate(doctorId, date);
    const bookedTimes = bookedQueues.map(q => q.appointmentTime);
    
    // Agar bugun bo'lsa, o'tgan vaqtlarni olib tashlash
    const now = new Date();
    const isToday = date === now.toISOString().split('T')[0];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const availableSlots = allSlots.filter(slot => {
        if (isToday && slot.minutes <= currentMinutes + 30) {
            return false; // Kamida 30 daqiqa oldin navbat olish kerak
        }
        return !bookedTimes.includes(slot.time);
    });
    
    if (availableSlots.length === 0) {
        timeSelect.innerHTML = '<option value="">Bu kun uchun bo\'sh vaqt yo\'q</option>';
        timeSlotInfo.textContent = `❌ ${date} sanasida barcha vaqtlar band`;
        timeSlotInfo.style.color = '#dc3545';
        return;
    }
    
    timeSelect.innerHTML = '<option value="">Vaqtni tanlang</option>' + 
        availableSlots.map(slot => 
            `<option value="${slot.time}">${slot.time} (${doctor.avgTime} daqiqa)</option>`
        ).join('');
    
    timeSlotInfo.textContent = `✅ ${availableSlots.length} ta bo'sh vaqt mavjud`;
    timeSlotInfo.style.color = '#28a745';
}
