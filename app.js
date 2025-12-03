Chart.defaults.color = '#8892b0';
Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

const methodsCtx = document.getElementById('methodsChart').getContext('2d');
new Chart(methodsCtx, {
    type: 'doughnut',
    data: {
        labels: ['Explicit', 'Temporal'],
        datasets: [{
            data: [906, 44],
            backgroundColor: [
                'rgba(239, 68, 68, 0.9)',
                'rgba(59, 130, 246, 0.9)'
            ],
            borderWidth: 0,
            cutout: '50%'
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    padding: 15,
                    font: {
                        size: 12
                    },
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            }
        }
    }
});

const toolsCtx = document.getElementById('toolsChart').getContext('2d');
new Chart(toolsCtx, {
    type: 'doughnut',
    data: {
        labels: ['AI Generic', 'Claude', 'ChatGPT', 'Cursor', 'Bolt', 'Other'],
        datasets: [{
            data: [303, 100, 100, 100, 100, 247],
            backgroundColor: [
                'rgba(139, 92, 246, 0.9)',
                'rgba(59, 130, 246, 0.9)',
                'rgba(16, 185, 129, 0.9)',
                'rgba(245, 158, 11, 0.9)',
                'rgba(239, 68, 68, 0.9)',
                'rgba(100, 116, 139, 0.9)'
            ],
            borderWidth: 0,
            cutout: '70%'
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    padding: 12,
                    font: {
                        size: 11
                    },
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            }
        }
    }
});

const barsCtx = document.getElementById('barsChart').getContext('2d');
new Chart(barsCtx, {
    type: 'bar',
    data: {
        labels: ['AI Generic', 'Claude', 'ChatGPT', 'Cursor', 'Bolt.new', 'Lovable', 'Windsurf', 'Temporal', 'Copilot', 'v0.dev', 'Replit'],
        datasets: [{
            data: [303, 100, 100, 100, 100, 100, 50, 44, 22, 21, 10],
            backgroundColor: 'rgba(59, 130, 246, 0.85)',
            borderRadius: 6,
            barThickness: 35
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)',
                    drawBorder: false
                },
                ticks: {
                    font: {
                        size: 11
                    }
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 11
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
