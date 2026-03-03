/**
 * PDF Generator Moduli
 * jsPDF yordamida navbat chekini yaratish
 */

/**
 * Navbat chekini PDF formatida yaratish
 * @param {Object} queueData - Navbat ma'lumotlari
 * @param {Object} doctorData - Shifokor ma'lumotlari
 */
export async function generateQueueTicket(queueData, doctorData) {
    // jsPDF kutubxonasini tekshirish
    if (typeof jspdf === 'undefined') {
        console.error('jsPDF kutubxonasi yuklanmagan!');
        alert('PDF yaratish uchun kutubxona yuklanmagan. Iltimos, sahifani yangilang.');
        return;
    }
    
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    
    // Ranglar
    const primaryColor = [102, 126, 234]; // #667eea
    const textColor = [51, 51, 51];
    const lightGray = [200, 200, 200];
    
    // Sarlavha
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('NAVBAT CHEKI', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('Klinika Navbat Tizimi', 105, 30, { align: 'center' });
    
    // Navbat raqami (katta)
    doc.setTextColor(...primaryColor);
    doc.setFontSize(48);
    doc.text(`#${queueData.number}`, 105, 70, { align: 'center' });
    
    // Chiziq
    doc.setDrawColor(...lightGray);
    doc.line(20, 80, 190, 80);
    
    // Ma'lumotlar
    doc.setTextColor(...textColor);
    doc.setFontSize(12);
    
    let yPos = 100;
    const lineHeight = 10;
    
    // Bemor ma'lumotlari
    doc.setFont(undefined, 'bold');
    doc.text('BEMOR MA\'LUMOTLARI:', 20, yPos);
    yPos += lineHeight;
    
    doc.setFont(undefined, 'normal');
    doc.text(`Ism: ${queueData.patientName}`, 30, yPos);
    yPos += lineHeight;
    
    doc.text(`Telefon: ${queueData.patientPhone}`, 30, yPos);
    yPos += lineHeight;
    
    if (queueData.patientAge) {
        doc.text(`Yosh: ${queueData.patientAge}`, 30, yPos);
        yPos += lineHeight;
    }
    
    if (queueData.patientAddress) {
        doc.text(`Manzil: ${queueData.patientAddress}`, 30, yPos);
        yPos += lineHeight;
    }
    
    yPos += 5;
    
    // Shifokor ma'lumotlari
    doc.setFont(undefined, 'bold');
    doc.text('SHIFOKOR MA\'LUMOTLARI:', 20, yPos);
    yPos += lineHeight;
    
    doc.setFont(undefined, 'normal');
    doc.text(`Shifokor: ${doctorData.name}`, 30, yPos);
    yPos += lineHeight;
    
    doc.text(`Mutaxassislik: ${doctorData.specialty}`, 30, yPos);
    yPos += lineHeight;
    
    yPos += 5;
    
    // Qabul ma'lumotlari
    doc.setFont(undefined, 'bold');
    doc.text('QABUL MA\'LUMOTLARI:', 20, yPos);
    yPos += lineHeight;
    
    doc.setFont(undefined, 'normal');
    
    if (queueData.appointmentDate && queueData.appointmentTime) {
        const date = new Date(queueData.appointmentDate);
        const dateStr = date.toLocaleDateString('uz-UZ', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        doc.text(`Sana: ${dateStr}`, 30, yPos);
        yPos += lineHeight;
        
        doc.text(`Vaqt: ${queueData.appointmentTime}`, 30, yPos);
        yPos += lineHeight;
    }
    
    doc.text(`Qabul davomiyligi: ~${doctorData.avgTime} daqiqa`, 30, yPos);
    yPos += lineHeight;
    
    doc.text(`Ro'yxatdan o'tgan: ${queueData.timestamp}`, 30, yPos);
    yPos += lineHeight;
    
    // Chiziq
    yPos += 10;
    doc.setDrawColor(...lightGray);
    doc.line(20, yPos, 190, yPos);
    yPos += 10;
    
    // Eslatma
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('ESLATMA:', 20, yPos);
    yPos += 7;
    
    doc.setFontSize(9);
    const notes = [
        '• Iltimos, belgilangan vaqtdan 10 daqiqa oldin keling',
        '• O\'zingiz bilan pasport yoki ID kartangizni olib keling',
        '• Navbat raqamingizni eslab qoling',
        '• Savollar uchun: +998 90 123 45 67'
    ];
    
    notes.forEach(note => {
        doc.text(note, 25, yPos);
        yPos += 6;
    });
    
    // Footer
    yPos = 280;
    doc.setFillColor(...primaryColor);
    doc.rect(0, yPos, 210, 17, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('Klinika Navbat Tizimi - Sog\'lig\'ingiz bizning g\'amxo\'rligimiz', 105, yPos + 10, { align: 'center' });
    
    // PDF ni saqlash
    const fileName = `navbat_${queueData.number}_${queueData.patientName.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
}

/**
 * Kunlik hisobot PDF yaratish (Admin uchun)
 */
export async function generateDailyReport(date, doctors, queues) {
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    
    const primaryColor = [102, 126, 234];
    const textColor = [51, 51, 51];
    
    // Sarlavha
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text('KUNLIK HISOBOT', 105, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(date, 105, 25, { align: 'center' });
    
    // Ma'lumotlar
    doc.setTextColor(...textColor);
    doc.setFontSize(11);
    
    let yPos = 50;
    const lineHeight = 8;
    
    doctors.forEach((doctor, index) => {
        const doctorQueues = queues.filter(q => q.doctorId === doctor.id);
        const completed = doctorQueues.filter(q => q.status === 'completed').length;
        const waiting = doctorQueues.filter(q => q.status === 'waiting').length;
        
        doc.setFont(undefined, 'bold');
        doc.text(`${index + 1}. ${doctor.name} - ${doctor.specialty}`, 20, yPos);
        yPos += lineHeight;
        
        doc.setFont(undefined, 'normal');
        doc.text(`   Jami bemorlar: ${doctorQueues.length}`, 25, yPos);
        yPos += lineHeight;
        doc.text(`   Qabul qilingan: ${completed}`, 25, yPos);
        yPos += lineHeight;
        doc.text(`   Kutayotgan: ${waiting}`, 25, yPos);
        yPos += lineHeight + 3;
        
        if (yPos > 270) {
            doc.addPage();
            yPos = 20;
        }
    });
    
    const fileName = `hisobot_${date.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
}

export default {
    generateQueueTicket,
    generateDailyReport
};
