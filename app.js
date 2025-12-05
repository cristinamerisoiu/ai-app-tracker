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

// Top 9 categories chart (always visible)
const CATEGORIES_TOP9 = {
    labels: ["Other","AI/ML Tools","SaaS","Design/Creative","Developer Tools","Productivity","Social Media","Entertainment","Education"],
    data: [329,196,85,73,50,47,45,39,24]
};

const categoriesCtx = document.getElementById('categoriesChart').getContext('2d');
new Chart(categoriesCtx, {
    type: 'bar',
    data: {
        labels: CATEGORIES_TOP9.labels,
        datasets: [{
            data: CATEGORIES_TOP9.data,
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

// All categories data (for dropdown)
const ALL_CATEGORIES = {
    labels: ["E-commerce","Finance","Healthcare","Travel/Tourism","Real Estate","Food/Restaurant","Security/Privacy","Automation/Bot","Documentation","Template/Boilerplate","Utilities","Infrastructure","Data/Analytics","Blockchain/Web3","Landing Page","Blog/Content"],
    data: [24,7,10,5,0,6,0,0,0,0,0,0,0,0,11,2]
};

// More categories chart (hidden by default)
const moreCategoriesCtx = document.getElementById('moreCategoriesChart').getContext('2d');
let moreCategoriesChart = null;

// Dropdown handler
document.getElementById('moreCategoriesSelect').addEventListener('change', function(e) {
    const selection = e.target.value;
    const canvas = document.getElementById('moreCategoriesChart');
    
    if (!selection) {
        canvas.style.display = 'none';
        if (moreCategoriesChart) {
            moreCategoriesChart.destroy();
            moreCategoriesChart = null;
        }
        return;
    }
    
    // Get the range of categories to show
    let startIdx, endIdx;
    if (selection === '10-15') {
        startIdx = 0;
        endIdx = 6;
    } else if (selection === '16-20') {
        startIdx = 6;
        endIdx = 11;
    } else if (selection === '21-24') {
        startIdx = 11;
        endIdx = 16;
    }
    
    const labels = ALL_CATEGORIES.labels.slice(startIdx, endIdx);
    const data = ALL_CATEGORIES.data.slice(startIdx, endIdx);
    
    // Show canvas
    canvas.style.display = 'block';
    
    // Destroy existing chart if any
    if (moreCategoriesChart) {
        moreCategoriesChart.destroy();
    }
    
    // Create new chart
    moreCategoriesChart = new Chart(moreCategoriesCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: data,
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
});
