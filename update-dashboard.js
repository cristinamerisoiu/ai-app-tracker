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
const explicitCount = data.apps.filter(app => app.detected_via === 'explicit').length;
const temporalCount = data.apps.filter(app => app.detected_via === 'temporal').length;

// Read current app.js
let appJs = fs.readFileSync('app.js', 'utf8');

// Update total count
const totalCount = data.apps.length;
appJs = appJs.replace(/data: \[906, 44\]/, `data: [${explicitCount}, ${temporalCount}]`);

// Update categories chart data
const categoriesLabels = JSON.stringify(labels);
const categoriesCounts = JSON.stringify(counts);

appJs = appJs.replace(
    /labels: \['Other'.*?\]/,
    `labels: ${categoriesLabels}`
);

appJs = appJs.replace(
    /data: \[323, 200.*?\]/,
    `data: ${categoriesCounts}`
);

// Write updated app.js
fs.writeFileSync('app.js', appJs);

// Update index.html with new total
let indexHtml = fs.readFileSync('index.html', 'utf8');
indexHtml = indexHtml.replace(
    /<div class="stat-value">950<\/div>/,
    `<div class="stat-value">${totalCount}</div>`
);
indexHtml = indexHtml.replace(
    /<div class="stat-value">906<\/div>/,
    `<div class="stat-value">${explicitCount}</div>`
);
indexHtml = indexHtml.replace(
    /<div class="stat-value">44<\/div>/,
    `<div class="stat-value">${temporalCount}</div>`
);

fs.writeFileSync('index.html', indexHtml);

console.log('✓ Dashboard updated successfully');
console.log(`Total apps: ${totalCount}`);
console.log(`Explicit: ${explicitCount}, Temporal: ${temporalCount}`);
