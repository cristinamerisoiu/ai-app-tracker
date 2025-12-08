import fs from 'fs';

// Read the categorized data
const data = JSON.parse(fs.readFileSync('ai-apps-categorized.json', 'utf8'));

// Count categories
const categoryCounts = {};
data.apps.forEach(app => {
    categoryCounts[app.category] = (categoryCounts[app.category] || 0) + 1;
});

// Sort categories by count
const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 9); // Top 9 categories

const labels = sortedCategories.map(c => c[0]);
const counts = sortedCategories.map(c => c[1]);

// Count detection methods
const explicitCount = data.apps.filter(app => app.detected_via && app.detected_via.includes('Explicit')).length;
const temporalCount = data.apps.filter(app => app.detected_via && app.detected_via.includes('Temporal')).length;

// Count by tool
const toolCounts = {};
data.apps.forEach(app => {
    const tool = app.ai_tool || 'Generic';
    toolCounts[tool] = (toolCounts[tool] || 0) + 1;
});

// Top tools for the tools chart (top 6 for donut, top 11 for bar)
const sortedTools = Object.entries(toolCounts)
    .sort((a, b) => b[1] - a[1]);

// For donut chart - top 5 + Other
const top5Tools = sortedTools.slice(0, 5);
const otherToolsCount = sortedTools.slice(5).reduce((sum, [, count]) => sum + count, 0);
const donutLabels = [...top5Tools.map(t => t[0]), 'Other'];
const donutCounts = [...top5Tools.map(t => t[1]), otherToolsCount];

// For bar chart - top 11
const top11Tools = sortedTools.slice(0, 11);
const barLabels = top11Tools.map(t => t[0]);
const barCounts = top11Tools.map(t => t[1]);

// Read current app.js
let appJs = fs.readFileSync('app.js', 'utf8');

// Update total count
const totalCount = data.apps.length;

// 1. Update Detection Methods chart (methodsChart)
appJs = appJs.replace(
    /(const methodsCtx[\s\S]*?datasets: \[\{[\s\S]*?data: \[)\d+,\s*\d+(\])/,
    `$1${explicitCount}, ${temporalCount}$2`
);

// 2. Update Tool Distribution donut chart (toolsChart)
appJs = appJs.replace(
    /(const toolsCtx[\s\S]*?labels: \[)[^\]]+(\])/,
    `$1${donutLabels.map(l => `'${l}'`).join(', ')}$2`
);
appJs = appJs.replace(
    /(const toolsCtx[\s\S]*?datasets: \[\{[\s\S]*?data: \[)[^\]]+(\])/,
    `$1${donutCounts.join(', ')}$2`
);

// 3. Update Top AI Tools bar chart (barsChart)
appJs = appJs.replace(
    /(const barsCtx[\s\S]*?labels: \[)[^\]]+(\])/,
    `$1${barLabels.map(l => `'${l}'`).join(', ')}$2`
);
appJs = appJs.replace(
    /(const barsCtx[\s\S]*?datasets: \[\{[\s\S]*?data: \[)[^\]]+(\])/,
    `$1${barCounts.join(', ')}$2`
);

// 4. Update Categories charts
// Top 9 for main chart (always visible)
const top9Categories = sortedCategories.slice(0, 9);
const top9Labels = top9Categories.map(c => c[0]);
const top9Counts = top9Categories.map(c => c[1]);

// Categories 10+ for dropdown
const restCategories = sortedCategories.slice(9);
const restLabels = restCategories.map(c => c[0]);
const restCounts = restCategories.map(c => c[1]);

// Update CATEGORIES_TOP9
appJs = appJs.replace(
    /const CATEGORIES_TOP9 = \{[\s\S]*?labels: \[[^\]]+\],[\s\S]*?data: \[[^\]]+\][\s\S]*?\};/,
    `const CATEGORIES_TOP9 = {
    labels: [${top9Labels.map(l => `"${l}"`).join(',')}],
    data: [${top9Counts.join(',')}]
};`
);

// Update ALL_CATEGORIES (categories 10+)
appJs = appJs.replace(
    /const ALL_CATEGORIES = \{[\s\S]*?labels: \[[^\]]+\],[\s\S]*?data: \[[^\]]+\][\s\S]*?\};/,
    `const ALL_CATEGORIES = {
    labels: [${restLabels.map(l => `"${l}"`).join(',')}],
    data: [${restCounts.join(',')}]
};`
);

// Write updated app.js
fs.writeFileSync('app.js', appJs);

// 5. Update Growth chart data
let growthData = { dates: [], totals: [] };
if (fs.existsSync('daily-stats.json')) {
    const dailyStats = JSON.parse(fs.readFileSync('daily-stats.json', 'utf8'));
    const sortedDates = Object.keys(dailyStats).sort();
    
    // Format dates and get totals
    growthData.dates = sortedDates.map(date => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    growthData.totals = sortedDates.map(date => dailyStats[date].total);
    
    // Update GROWTH_DATA in app.js
    appJs = fs.readFileSync('app.js', 'utf8');
    appJs = appJs.replace(
        /const GROWTH_DATA = \{[\s\S]*?dates: \[[^\]]*\],[\s\S]*?totals: \[[^\]]*\][\s\S]*?\};/,
        `const GROWTH_DATA = {
    dates: [${growthData.dates.map(d => `"${d}"`).join(', ')}],
    totals: [${growthData.totals.join(', ')}]
};`
    );
    fs.writeFileSync('app.js', appJs);
}

// Update index.html with new total
let indexHtml = fs.readFileSync('index.html', 'utf8');

// Get current date
const now = new Date();
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const formattedDate = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

// Update the date in footer
indexHtml = indexHtml.replace(
    /(GitHub API • Claude Sonnet 4 • )[^<]+/,
    `$1${formattedDate}`
);

// Update all stat cards - FIXED
indexHtml = indexHtml.replace(
    /(<div class="stat-label">Total Apps Detected<\/div>\s*<div class="stat-value">)\d+(<\/div>)/,
    `$1${totalCount}$2`
);
indexHtml = indexHtml.replace(
    /(<div class="stat-label">Explicit Mentions<\/div>\s*<div class="stat-value">)\d+(<\/div>)/,
    `$1${explicitCount}$2`
);
indexHtml = indexHtml.replace(
    /(<div class="stat-label">Temporal Detection<\/div>\s*<div class="stat-value">)\d+(<\/div>)/,
    `$1${temporalCount}$2`
);

fs.writeFileSync('index.html', indexHtml);

console.log('✓ Dashboard updated successfully');
console.log(`Date: ${formattedDate}`);
console.log(`Total apps: ${totalCount}`);
console.log(`Explicit: ${explicitCount}, Temporal: ${temporalCount}`);
console.log(`Categories: ${labels.length}`);
console.log(`Top tools: ${barLabels.slice(0, 5).join(', ')}`);
