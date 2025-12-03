// Chart.js default settings
Chart.defaults.color = '#bbb';
Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

// Methods Pie Chart
const methodsCtx = document.getElementById('methodsChart').getContext('2d');
new Chart(methodsCtx, {
    type: 'doughnut',
    data: {
        labels: ['Explicit Mentions', 'Temporal Detection'],
        datasets: [{
            data: [906, 44],
            backgroundColor: [
                'rgba(239, 68, 68, 0.8)',
                'rgba(59, 130, 246, 0.8)'
            ],
            borderWidth: 0
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    font: {
                        size: 12
                    }
                }
            }
        }
    }
});

// Tools Donut Chart
const toolsCtx = document.getElementById('toolsChart').getContext('2d');
new Chart(toolsCtx, {
    type: 'doughnut',
    data: {
        labels: ['AI Generic', 'Claude', 'ChatGPT', 'Cursor', 'Bolt.new', 'Lovable', 'Other'],
        datasets: [{
            data: [303, 100, 100, 100, 100, 100, 147],
            backgroundColor: [
                'rgba(139, 92, 246, 0.8)',
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)',
                'rgba(236, 72, 153, 0.8)',
                'rgba(100, 100, 100, 0.8)'
            ],
            borderWidth: 0
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 15,
                    font: {
                        size: 11
                    }
                }
            }
        }
    }
});

// Bar Chart
const barsCtx = document.getElementById('barsChart').getContext('2d');
new Chart(barsCtx, {
    type: 'bar',
    data: {
        labels: ['AI Generic', 'Claude', 'ChatGPT', 'Cursor', 'Bolt.new', 'Lovable', 'Windsurf', 'Temporal', 'Copilot', 'v0.dev', 'Replit'],
        datasets: [{
            label: 'Apps Detected',
            data: [303, 100, 100, 100, 100, 100, 50, 44, 22, 21, 10],
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderRadius: 4,
            barThickness: 40
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)'
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
