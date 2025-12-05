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

// 4. Update Categories chart (categoriesChart)
const categoriesLabels = labels.map(l => `"${l}"`).join(',');
const categoriesCounts = counts.join(',');

appJs = appJs.replace(
    /(const categoriesCtx[\s\S]*?labels: \[)[^\]]+(\])/,
    `$1${categoriesLabels}$2`
);
appJs = appJs.replace(
    /(const categoriesCtx[\s\S]*?datasets: \[\{[\s\S]*?data: \[)[^\]]+(\])/,
    `$1${categoriesCounts}$2`
);

// Write updated app.js
fs.writeFileSync('app.js', appJs);

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

// Update all stat cards
indexHtml = indexHtml.replace(
    /(<div class="stat-value">)\d+(<\/div>[\s\S]*?Total Apps Detected)/,
    `$1${totalCount}$2`
);
indexHtml = indexHtml.replace(
    /(<div class="stat-value">)\d+(<\/div>[\s\S]*?Explicit Mentions)/,
    `$1${explicitCount}$2`
);
indexHtml = indexHtml.replace(
    /(<div class="stat-value">)\d+(<\/div>[\s\S]*?Temporal Detection)/,
    `$1${temporalCount}$2`
);

fs.writeFileSync('index.html', indexHtml);

console.log('✓ Dashboard updated successfully');
console.log(`Date: ${formattedDate}`);
console.log(`Total apps: ${totalCount}`);
console.log(`Explicit: ${explicitCount}, Temporal: ${temporalCount}`);
console.log(`Categories: ${labels.length}`);
console.log(`Top tools: ${barLabels.slice(0, 5).join(', ')}`);
