/**
 * Statistika Grafiklari Moduli
 * Chart.js yordamida
 */

import { COLLECTIONS } from './config.js';
import dbManager from './database.js';
import { loadDoctorsFromFirestore } from './app-integrated.js';

let doctors = [];
let charts = {};

/**
 * Grafiklarni boshlash
 */
async function initCharts() {
    // Shifokorlarni yuklash
    doctors = await loadDoctorsFromFirestore();
    
    // Barcha navbatlarni olish
    const allQueues = await dbManager.getAll(COLLECTIONS.QUEUES);
    
    // Grafiklarni yaratish
    createDailyChart(allQueues);
    createWeeklyChart(allQueues);
    createDoctorComparisonChart(allQueues);
    createStatusPieChart(allQueues);
}

/**
 * Kunlik grafik
 */
function createDailyChart(queues) {
    const ctx = document.getElementById('dailyChart');
    if (!ctx) return;
    
    // Oxirgi 7 kunni olish
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date.toISOString().split('T')[0]);
    }
    
    // Har bir kun uchun bemorlar sonini hisoblash
    const dailyData = last7Days.map(date => {
        return queues.filter(q => q.appointmentDate === date).length;
    });
    
    // Kun nomlarini formatlash
    const labels = last7Days.map(date => {
        const d = new Date(date + 'T00:00:00');
        return d.toLocaleDateString('uz-UZ', { weekday: 'short', day: 'numeric' });
    });
    
    // Grafikni yaratish
    if (charts.daily) {
        charts.daily.destroy();
    }
    
    charts.daily = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Bemorlar soni',
                data: dailyData,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Oxirgi 7 Kunlik Statistika',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

/**
 * Haftalik grafik
 */
function createWeeklyChart(queues) {
    const ctx = document.getElementById('weeklyChart');
    if (!ctx) return;
    
    // Oxirgi 4 haftani olish
    const last4Weeks = [];
    for (let i = 3; i >= 0; i--) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (i * 7 + 6));
        const endDate = new Date();
        endDate.setDate(endDate.getDate() - (i * 7));
        
        last4Weeks.push({
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0],
            label: `${startDate.getDate()}-${endDate.getDate()} ${endDate.toLocaleDateString('uz-UZ', { month: 'short' })}`
        });
    }
    
    // Har bir hafta uchun bemorlar sonini hisoblash
    const weeklyData = last4Weeks.map(week => {
        return queues.filter(q => {
            return q.appointmentDate >= week.start && q.appointmentDate <= week.end;
        }).length;
    });
    
    // Grafikni yaratish
    if (charts.weekly) {
        charts.weekly.destroy();
    }
    
    charts.weekly = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: last4Weeks.map(w => w.label),
            datasets: [{
                label: 'Bemorlar soni',
                data: weeklyData,
                backgroundColor: '#667eea',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Oxirgi 4 Haftalik Statistika',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

/**
 * Shifokorlar taqqoslash grafigi
 */
function createDoctorComparisonChart(queues) {
    const ctx = document.getElementById('doctorComparisonChart');
    if (!ctx) return;
    
    // Har bir shifokor uchun bemorlar sonini hisoblash
    const doctorData = doctors.map(doctor => {
        const doctorQueues = queues.filter(q => q.doctorId === doctor.id);
        const completed = doctorQueues.filter(q => q.status === 'completed').length;
        const waiting = doctorQueues.filter(q => q.status === 'waiting').length;
        
        return {
            name: doctor.name.split(' ')[1], // Faqat familiya
            completed,
            waiting,
            total: doctorQueues.length
        };
    });
    
    // Grafikni yaratish
    if (charts.doctorComparison) {
        charts.doctorComparison.destroy();
    }
    
    charts.doctorComparison = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: doctorData.map(d => d.name),
            datasets: [
                {
                    label: 'Qabul qilingan',
                    data: doctorData.map(d => d.completed),
                    backgroundColor: '#28a745',
                    borderRadius: 8
                },
                {
                    label: 'Kutayotgan',
                    data: doctorData.map(d => d.waiting),
                    backgroundColor: '#ffc107',
                    borderRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Shifokorlar Bo\'yicha Statistika',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            },
            scales: {
                x: {
                    stacked: false
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

/**
 * Holat bo'yicha donut grafik
 */
function createStatusPieChart(queues) {
    const ctx = document.getElementById('statusPieChart');
    if (!ctx) return;
    
    const waiting = queues.filter(q => q.status === 'waiting').length;
    const completed = queues.filter(q => q.status === 'completed').length;
    
    // Grafikni yaratish
    if (charts.statusPie) {
        charts.statusPie.destroy();
    }
    
    charts.statusPie = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Kutayotgan', 'Qabul qilingan'],
            datasets: [{
                data: [waiting, completed],
                backgroundColor: ['#ffc107', '#28a745'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Bemorlar Holati',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

/**
 * Grafiklarni yangilash
 */
async function refreshCharts() {
    const allQueues = await dbManager.getAll(COLLECTIONS.QUEUES);
    
    createDailyChart(allQueues);
    createWeeklyChart(allQueues);
    createDoctorComparisonChart(allQueues);
    createStatusPieChart(allQueues);
}

/**
 * Grafiklarni tozalash
 */
function destroyCharts() {
    Object.values(charts).forEach(chart => {
        if (chart) {
            chart.destroy();
        }
    });
    charts = {};
}

export { initCharts, refreshCharts, destroyCharts };
