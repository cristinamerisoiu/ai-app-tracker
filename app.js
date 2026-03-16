Chart.defaults.color = '#6b7280';
Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
Chart.defaults.font.size = 11;

const methodsCtx = document.getElementById('methodsChart').getContext('2d');
new Chart(methodsCtx, {
    type: 'doughnut',
    data: {
        labels: ['Explicit', 'Temporal'],
        datasets: [{
            data: [0, 0],
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
        labels: ['Other'],
        datasets: [{
            data: [0],
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
        labels: [],
        datasets: [{
            data: [],
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
        labels: [],
        datasets: [{
            data: [],
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

// Growth Over Time chart
const GROWTH_DATA = {
    dates: ["Feb 15", "Feb 16", "Feb 17", "Feb 18", "Feb 19", "Feb 20", "Feb 21", "Feb 22", "Feb 23", "Feb 24", "Feb 25", "Feb 26", "Feb 27", "Feb 28", "Mar 1", "Mar 2", "Mar 3", "Mar 4", "Mar 5", "Mar 6", "Mar 7", "Mar 8", "Mar 9", "Mar 10", "Mar 11", "Mar 12", "Mar 13", "Mar 14", "Mar 15", "Mar 16"],
    totals: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
};

// Wait for DOM to be fully ready
if (document.getElementById('growthChart')) {
    const growthCanvas = document.getElementById('growthChart');
    const growthCtx = growthCanvas.getContext('2d');
    
    // Create gradient once, outside of Chart.js
    const gradient = growthCtx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(88, 166, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(88, 166, 255, 0.05)');
    
    new Chart(growthCtx, {
        type: 'line',
        data: {
            labels: GROWTH_DATA.dates,
            datasets: [{
                data: GROWTH_DATA.totals,
                borderColor: '#58a6ff',
                backgroundColor: gradient,
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
            maintainAspectRatio: true,
            animation: {
                duration: 0
            },
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
}
