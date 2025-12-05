import fs from 'fs';

// Read the complete detection results
const data = JSON.parse(fs.readFileSync('ai-apps-complete.json', 'utf8'));

// Enhanced category keywords
const categories = {
    'E-commerce': ['shop', 'store', 'ecommerce', 'e-commerce', 'cart', 'checkout', 'product', 'marketplace', 'shopify'],
    'SaaS': ['saas', 'platform', 'dashboard', 'analytics', 'crm', 'management', 'admin', 'business', 'enterprise'],
    'Finance': ['finance', 'banking', 'payment', 'invoice', 'crypto', 'trading', 'wallet', 'accounting', 'market', 'stock', 'prediction-market', 'polymarket'],
    'Education': ['education', 'learning', 'course', 'tutorial', 'school', 'student', 'quiz', 'lesson', 'teaching', 'training'],
    'Healthcare': ['health', 'medical', 'fitness', 'wellness', 'doctor', 'patient', 'hospital', 'clinic'],
    'Travel/Tourism': ['travel', 'booking', 'hotel', 'flight', 'tourism', 'trip', 'vacation', 'destination'],
    'Social Media': ['social', 'chat', 'messaging', 'forum', 'community', 'feed', 'post', 'comment', 'telegram', 'discord'],
    'Design/Creative': ['design', 'portfolio', 'creative', 'art', 'gallery', 'photo', 'image', 'editor', 'ui', 'ux', 'figma'],
    'Entertainment': ['game', 'music', 'video', 'movie', 'entertainment', 'streaming', 'media', 'player', 'gaming', 'casino', 'slot'],
    'Productivity': ['todo', 'task', 'note', 'calendar', 'reminder', 'organize', 'planner', 'productivity', 'bookmark', 'nav'],
    'Real Estate': ['real estate', 'property', 'rental', 'housing', 'apartment', 'listing'],
    'Food/Restaurant': ['food', 'restaurant', 'recipe', 'menu', 'delivery', 'order', 'kitchen', 'meal', 'cooking'],
    'AI/ML Tools': ['ai', 'ml', 'chatbot', 'gpt', 'llm', 'artificial intelligence', 'machine learning', 'neural', 'diffusion', 'model', 'prompt'],
    'Developer Tools': ['api', 'library', 'framework', 'sdk', 'cli', 'developer', 'devtools', 'testing', 'debugging'],
    'Security/Privacy': ['security', 'cve', 'vulnerability', 'scanner', 'exploit', 'penetration', 'encryption', 'privacy', 'firewall', 'audit'],
    'Automation/Bot': ['bot', 'automation', 'auto', 'script', 'scraper', 'crawler', 'scheduler', 'workflow', 'telegram-bot', 'discord-bot'],
    'Documentation': ['documentation', 'docs', 'guide', 'tutorial', 'example', 'readme', 'wiki', 'reference', 'manual'],
    'Template/Boilerplate': ['template', 'boilerplate', 'starter', 'scaffold', 'skeleton', 'demo', 'example', 'sample'],
    'Utilities': ['utility', 'tool', 'helper', 'converter', 'generator', 'checker', 'validator', 'parser', 'formatter'],
    'Infrastructure': ['docker', 'kubernetes', 'deployment', 'infrastructure', 'devops', 'ci/cd', 'hosting', 'cloud', 'server'],
    'Data/Analytics': ['data', 'database', 'sql', 'analytics', 'visualization', 'chart', 'graph', 'metrics', 'monitoring'],
    'Blockchain/Web3': ['blockchain', 'web3', 'ethereum', 'solana', 'nft', 'defi', 'smart contract', 'dapp', 'cryptocurrency'],
    'Landing Page': ['landing', 'marketing', 'promotion', 'campaign', 'website', 'homepage', 'portfolio-site'],
    'Blog/Content': ['blog', 'article', 'content', 'cms', 'publishing', 'writer', 'journal', 'news'],
    'Other': []
};

// Categorize each app
const apps = data.apps.map(app => {
    const searchText = `${app.full_name} ${app.description || ''} ${app.language || ''}`.toLowerCase();
    
    // Find matching category
    let matchedCategory = 'Other';
    let maxMatches = 0;
    
    for (const [category, keywords] of Object.entries(categories)) {
        if (category === 'Other') continue;
        
        const matches = keywords.filter(keyword => 
            searchText.includes(keyword.toLowerCase())
        ).length;
        
        if (matches > maxMatches) {
            maxMatches = matches;
            matchedCategory = category;
        }
    }
    
    return {
        ...app,
        category: matchedCategory
    };
});

// Save categorized results
fs.writeFileSync('ai-apps-categorized.json', JSON.stringify({ apps }, null, 2));

// Generate statistics
const categoryCounts = {};
apps.forEach(app => {
    categoryCounts[app.category] = (categoryCounts[app.category] || 0) + 1;
});

// Sort by count
const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1]);

console.log('\nCategory Breakdown:');
sortedCategories.forEach(([category, count]) => {
    console.log(`${category}: ${count}`);
});

// Log sample of "Other" apps to see what we're missing
const otherApps = apps.filter(app => app.category === 'Other').slice(0, 30);
if (otherApps.length > 0) {
    console.log('\n📋 Sample of "Other" category apps:');
    otherApps.forEach(app => {
        const desc = app.description ? app.description.substring(0, 80) : 'No description';
        console.log(`  - ${app.full_name}: ${desc}`);
    });
}

console.log('\n✓ Saved to ai-apps-categorized.json');
