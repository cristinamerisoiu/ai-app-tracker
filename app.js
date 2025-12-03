// Load data from JSON
fetch('ai-apps-complete.json')
    .then(response => response.json())
    .then(data => {
        updateDashboard(data);
    })
    .catch(error => {
        console.error('Error loading data:', error);
    });

function updateDashboard(data) {
    // Update main stats
    document.getElementById('totalApps').textContent = data.apps.length;
    document.getElementById('explicitCount').textContent = data.summary.phase1_explicit;
    document.getElementById('temporalCount').textContent = data.summary.phase3_temporal;
    
    // Update timestamp
    const timestamp = new Date(data.timestamp).toISOString().replace('T', '_').split('.')[0] + '_UTC';
    document.getElementById('lastScan').textContent = timestamp;
    
    // Build tool grid
    const toolGrid = document.getElementById('toolGrid');
    Object.entries(data.summary.by_tool)
        .sort((a, b) => b[1] - a[1])
        .forEach(([tool, count]) => {
            const toolItem = document.createElement('div');
            toolItem.className = 'tool-item';
            toolItem.innerHTML = `
                <div class="tool-name">${tool.toUpperCase().replace(/ /g, '_')}</div>
                <div class="tool-count">${count}</div>
            `;
            toolGrid.appendChild(toolItem);
        });
}
