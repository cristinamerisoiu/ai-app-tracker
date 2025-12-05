import fs from 'fs';

// Read current data
const data = JSON.parse(fs.readFileSync('ai-apps-categorized.json', 'utf8'));

// Calculate stats
const totalApps = data.apps.length;
const explicitCount = data.apps.filter(app => app.detected_via && app.detected_via.includes('Explicit')).length;
const temporalCount = data.apps.filter(app => app.detected_via && app.detected_via.includes('Temporal')).length;

// Get today's date in YYYY-MM-DD format
const today = new Date().toISOString().split('T')[0];

// Read existing daily stats (or create new file)
let dailyStats = {};
if (fs.existsSync('daily-stats.json')) {
    dailyStats = JSON.parse(fs.readFileSync('daily-stats.json', 'utf8'));
}

// Add today's stats
dailyStats[today] = {
    total: totalApps,
    explicit: explicitCount,
    temporal: temporalCount
};

// Keep only last 30 days
const dates = Object.keys(dailyStats).sort();
if (dates.length > 30) {
    const keep = dates.slice(-30);
    const filtered = {};
    keep.forEach(date => {
        filtered[date] = dailyStats[date];
    });
    dailyStats = filtered;
}

// Save updated stats
fs.writeFileSync('daily-stats.json', JSON.stringify(dailyStats, null, 2));

console.log(`✓ Daily stats recorded for ${today}`);
console.log(`  Total: ${totalApps}, Explicit: ${explicitCount}, Temporal: ${temporalCount}`);
console.log(`  History: ${Object.keys(dailyStats).length} days tracked`);
