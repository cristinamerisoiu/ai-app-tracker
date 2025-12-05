Chart.defaults.color = '#6b7280';
Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
Chart.defaults.font.size = 11;

const methodsCtx = document.getElementById('methodsChart').getContext('2d');
new Chart(methodsCtx, {
    type: 'doughnut',
    data: {
        labels: ['Explicit', 'Temporal'],
        datasets: [{
            data: [907, 46],
            backgroundColor: [
                '#dc2626',
                '#3b82f6'
            ],
            borderWidth: 0,
            cutout: '75%'
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    padding: 12,
                    boxWidth: 12,
                    boxHeight: 12,
                    usePointStyle: true
                }
            }
        }
    }
});

const toolsCtx = document.getElementById('toolsChart').getContext('2d');
new Chart(toolsCtx, {
    type: 'doughnut',
    data: {
        labels: ['Generic', 'Claude', 'ChatGPT', 'Cursor', 'Bolt', 'Other'],
        datasets: [{
            data: [303, 100, 100, 100, 100, 247],
            backgroundColor: [
                '#8b5cf6',
                '#3b82f6',
                '#10b981',
                '#f59e0b',
                '#dc2626',
                '#6b7280'
            ],
            borderWidth: 0,
            cutout: '75%'
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    padding: 8,
                    boxWidth: 12,
                    boxHeight: 12,
                    usePointStyle: true
                }
            }
        }
    }
});

const barsCtx = document.getElementById('barsChart').getContext('2d');
new Chart(barsCtx, {
    type: 'bar',
    data: {
        labels: ['Generic', 'Claude', 'ChatGPT', 'Cursor', 'Bolt', 'Lovable', 'Wind', 'Temp', 'Copilot', 'v0', 'Replit'],
        datasets: [{
            data: [303, 100, 100, 100, 100, 100, 50, 44, 22, 21, 10],
            backgroundColor: '#3b82f6',
            borderRadius: 4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: '#252a3a',
                    drawBorder: false
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        },
        plugins: {
            legend: {
                display: false
            }
        }
    }
});

const categoriesCtx = document.getElementById('categoriesChart').getContext('2d');
new Chart(categoriesCtx, {
    type: 'bar',
    data: {
        labels: ["Other","AI/ML Tools","SaaS","Design/Creative","Developer Tools","Productivity","Social Media","Entertainment","Education"],
        datasets: [{
            data: [329,196,85,73,50,47,45,39,24],
            backgroundColor: '#8b5cf6',
            borderRadius: 4
        }]
    },
    options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            x: {
                beginAtZero: true,
                grid: {
                    color: '#252a3a',
                    drawBorder: false
                },
                ticks: {
                    font: {
                        size: 10
                    }
                }
            },
            y: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 12
                    }
                }
            }
        },
        plugins: {
            legend: {
                display: false
            }
        }
    }
});

// Growth Over Time chart - compact style
const GROWTH_DATA = {
    dates: ["Dec 5"],
    totals: [953]
};

const growthCtx = document.getElementById('growthChart').getContext('2d');
new Chart(growthCtx, {
    type: 'line',
    data: {
        labels: GROWTH_DATA.dates,
        datasets: [{
            data: GROWTH_DATA.totals,
            borderColor: '#58a6ff',
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                gradient.addColorStop(0, 'rgba(88, 166, 255, 0.2)');
                gradient.addColorStop(1, 'rgba(88, 166, 255, 0.05)');
                return gradient;
            },
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: '#58a6ff',
            pointBorderColor: '#1a1f2e',
            pointBorderWidth: 2
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: false,
                grid: {
                    color: '#252a3a',
                    drawBorder: false
                },
                ticks: {
                    font: {
                        size: 10
                    },
                    color: '#6b7280'
                }
            },
            x: {
                grid: {
                    display: false,
                    drawBorder: true,
                    borderColor: '#252a3a'
                },
                ticks: {
                    font: {
                        size: 11
                    },
                    color: '#6b7280'
                }
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: '#1a1f2e',
                titleColor: '#e5e5e5',
                bodyColor: '#8b949e',
                borderColor: '#252a3a',
                borderWidth: 1,
                padding: 10,
                displayColors: false,
                callbacks: {
                    title: function(context) {
                        return context[0].label;
                    },
                    label: function(context) {
                        return 'Total Apps: ' + context.parsed.y;
                    }
                }
            }
        }
    }
});
