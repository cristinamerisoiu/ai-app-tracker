import fs from 'fs';
// Load the existing data
const data = JSON.parse(fs.readFileSync('ai-apps-complete.json', 'utf8'));

// Category keywords
const categories = {
    'E-commerce': ['shop', 'store', 'ecommerce', 'e-commerce', 'cart', 'checkout', 'product', 'marketplace'],
    'SaaS': ['saas', 'platform', 'dashboard', 'analytics', 'crm', 'management', 'admin', 'tool'],
    'Finance': ['finance', 'banking', 'payment', 'invoice', 'crypto', 'trading', 'wallet', 'accounting'],
    'Education': ['education', 'learning', 'course', 'tutorial', 'school', 'student', 'quiz', 'lesson'],
    'Healthcare': ['health', 'medical', 'fitness', 'wellness', 'doctor', 'patient', 'hospital', 'clinic'],
    'Travel/Tourism': ['travel', 'booking', 'hotel', 'flight', 'tourism', 'trip', 'vacation', 'destination'],
    'Social Media': ['social', 'chat', 'messaging', 'forum', 'community', 'feed', 'post', 'comment'],
    'Design/Creative': ['design', 'portfolio', 'creative', 'art', 'gallery', 'photo', 'image', 'editor'],
    'Entertainment': ['game', 'music', 'video', 'movie', 'entertainment', 'streaming', 'media', 'player'],
    'Productivity': ['todo', 'task', 'note', 'calendar', 'reminder', 'organize', 'planner', 'productivity'],
    'Real Estate': ['real estate', 'property', 'rental', 'housing', 'apartment', 'listing'],
    'Food/Restaurant': ['food', 'restaurant', 'recipe', 'menu', 'delivery', 'order', 'kitchen', 'meal'],
    'AI/ML Tools': ['ai', 'ml', 'chatbot', 'gpt', 'llm', 'artificial intelligence', 'machine learning', 'neural'],
    'Developer Tools': ['api', 'library', 'framework', 'sdk', 'cli', 'developer', 'code', 'devtools'],
    'Landing Page': ['landing', 'marketing', 'promotion', 'campaign', 'website', 'homepage'],
    'Blog/Content': ['blog', 'article', 'content', 'cms', 'publishing', 'writer', 'journal'],
    'Other': []
};

// Function to categorize a single app
function categorizeApp(app) {
    const text = `${app.description || ''} ${app.full_name || ''}`.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categories)) {
        if (category === 'Other') continue;
        
        for (const keyword of keywords) {
            if (text.includes(keyword)) {
                return category;
            }
        }
    }
    
    return 'Other';
}

// Categorize all apps
console.log('Categorizing apps...');
data.apps.forEach(app => {
    app.category = categorizeApp(app);
});

// Count by category
const categoryCounts = {};
data.apps.forEach(app => {
    categoryCounts[app.category] = (categoryCounts[app.category] || 0) + 1;
});

console.log('\nCategory Breakdown:');
Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([category, count]) => {
     console.log(`${category}: ${count}`);
    });

// Save updated data
fs.writeFileSync('ai-apps-categorized.json', JSON.stringify(data, null, 2));
console.log('\n✓ Saved to ai-apps-categorized.json');
