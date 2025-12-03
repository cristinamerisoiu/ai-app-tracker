import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// High confidence search queries - explicitly about BUILDING with AI
const SEARCH_QUERIES = [
  // Built/created/made with AI tools
  { query: '"built with claude" in:readme', tool: 'Claude', confidence: 'high' },
  { query: '"built with chatgpt" in:readme', tool: 'ChatGPT', confidence: 'high' },
  { query: '"created with cursor" in:readme', tool: 'Cursor', confidence: 'high' },
  { query: '"made with v0" in:readme', tool: 'v0.dev', confidence: 'high' },
  { query: '"built with bolt" in:readme', tool: 'Bolt.new', confidence: 'high' },
  { query: '"created with databutton" in:readme', tool: 'Databutton', confidence: 'high' },
  { query: '"built with replit ai" in:readme', tool: 'Replit AI', confidence: 'high' },
  { query: '"made with copilot" in:readme', tool: 'GitHub Copilot', confidence: 'high' },
  { query: '"built with windsurf" in:readme', tool: 'Windsurf', confidence: 'high' },
  { query: '"built with lovable" in:readme', tool: 'Lovable', confidence: 'high' },
  
  // AI-generated/coded phrases
  { query: '"ai generated code" in:readme', tool: 'AI (generic)', confidence: 'high' },
  { query: '"100% ai built" in:readme', tool: 'AI (generic)', confidence: 'high' },
  { query: '"fully ai generated" in:readme', tool: 'AI (generic)', confidence: 'high' },
  { query: '"coded with ai" in:readme', tool: 'AI (generic)', confidence: 'high' },
  
  // Tool-specific but less explicit
  { query: 'bolt.new in:readme', tool: 'Bolt.new', confidence: 'medium' },
  { query: 'v0.dev in:readme', tool: 'v0.dev', confidence: 'medium' },
  { query: 'cursor.ai in:readme', tool: 'Cursor', confidence: 'medium' },
];

// Sleep helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Search GitHub
async function searchGitHub(query, createdAfter = '2024-11-01') {
  const encodedQuery = encodeURIComponent(`${query} created:>${createdAfter}`);
  const url = `https://api.github.com/search/repositories?q=${encodedQuery}&sort=created&order=desc&per_page=100`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  
  if (!response.ok) {
    console.log(`❌ Failed (${response.status}): ${query}`);
    return { total: 0, items: [] };
  }
  
  const data = await response.json();
  return { total: data.total_count, items: data.items };
}

// Get README content
async function getReadme(owner, repo) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3.raw'
        }
      }
    );
    
    if (!response.ok) return '';
    return await response.text();
  } catch (error) {
    return '';
  }
}

// Get repo commits
async function getCommits(owner, repo) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=10`,
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    return [];
  }
}

// Analyze with Claude if confidence is medium
async function analyzeWithClaude(repo, readme, commits) {
  const firstCommit = commits[commits.length - 1];
  const commitMessages = commits.map(c => c.commit.message).join('\n');
  
  const prompt = `Analyze if this GitHub repository was built with AI assistance.

Repository: ${repo.full_name}
Description: ${repo.description || 'N/A'}
Created: ${repo.created_at}
First commit date: ${firstCommit?.commit?.author?.date || 'N/A'}
Time to first commit: ${firstCommit ? 'Fast' : 'Unknown'}
Commit count: ${commits.length}

Recent commit messages:
${commitMessages.slice(0, 500)}

README excerpt (first 1000 chars):
${readme.slice(0, 1000)}

Indicators to look for:
1. Explicit mentions: "built with [AI tool]", "ai-generated", etc.
2. Temporal signals: repo created and fully functional app in <48 hours
3. Commit patterns: single large commit vs iterative development
4. Language: mentions of AI assistance, prompting, etc.
5. Tech stack: Next.js + Tailwind + Shadcn is common in AI apps

Return ONLY a JSON object (no markdown, no explanation):
{
  "is_ai_built": true/false,
  "confidence": "high"/"medium"/"low",
  "tool": "Claude/ChatGPT/Cursor/etc or null",
  "reasoning": "brief explanation"
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });
    
    const responseText = message.content[0].text.trim();
    // Strip markdown code blocks if present
    const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    return JSON.parse(jsonText);
  } catch (error) {
    console.log(`⚠️  Claude analysis failed for ${repo.full_name}: ${error.message}`);
    return null;
  }
}

// Main collection
async function collectAIApps() {
  console.log('🚀 Starting comprehensive AI app detection...\n');
  
  const results = {
    timestamp: new Date().toISOString(),
    search_stats: {},
    apps: [],
    summary: {
      total_confirmed: 0,
      total_likely: 0,
      by_tool: {}
    }
  };
  
  const seenRepos = new Set();
  let apiCallCount = 0;
  
  // Phase 1: High confidence searches
  console.log('📍 Phase 1: High confidence searches\n');
  
  for (const search of SEARCH_QUERIES.filter(s => s.confidence === 'high')) {
    console.log(`🔍 ${search.query}`);
    const data = await searchGitHub(search.query);
    
    results.search_stats[search.query] = data.total;
    console.log(`   Found: ${data.total.toLocaleString()} total\n`);
    
    // Process repos
    for (const repo of data.items) {
      if (seenRepos.has(repo.full_name)) continue;
      seenRepos.add(repo.full_name);
      
      results.apps.push({
        name: repo.name,
        full_name: repo.full_name,
        url: repo.html_url,
        description: repo.description,
        created_at: repo.created_at,
        language: repo.language,
        stars: repo.stargazers_count,
        detected_via: search.tool,
        confidence: 'high',
        ai_tool: search.tool
      });
    }
    
    await sleep(1500); // Rate limit protection
  }
  
  console.log(`\n✅ Phase 1 complete: ${results.apps.length} confirmed AI apps\n`);
  
  // Phase 2: Medium confidence - analyze with Claude
  console.log('📍 Phase 2: Medium confidence searches (with Claude analysis)\n');
  
  const mediumSearches = SEARCH_QUERIES.filter(s => s.confidence === 'medium').slice(0, 3); // Limit to 3 to save API costs
  
  for (const search of mediumSearches) {
    console.log(`🔍 ${search.query}`);
    const data = await searchGitHub(search.query);
    
    results.search_stats[search.query] = data.total;
    console.log(`   Found: ${data.total.toLocaleString()} total`);
    
    // Analyze first 10 repos with Claude
    const toAnalyze = data.items.slice(0, 10);
    console.log(`   Analyzing ${toAnalyze.length} repos with Claude...\n`);
    
    for (const repo of toAnalyze) {
      if (seenRepos.has(repo.full_name)) continue;
      
      // Get details
      const readme = await getReadme(repo.owner.login, repo.name);
      await sleep(500);
      
      const commits = await getCommits(repo.owner.login, repo.name);
      await sleep(500);
      
      // Analyze with Claude
      const analysis = await analyzeWithClaude(repo, readme, commits);
      apiCallCount++;
      
      if (analysis && analysis.is_ai_built) {
        seenRepos.add(repo.full_name);
        
        results.apps.push({
          name: repo.name,
          full_name: repo.full_name,
          url: repo.html_url,
          description: repo.description,
          created_at: repo.created_at,
          language: repo.language,
          stars: repo.stargazers_count,
          detected_via: 'Claude Analysis',
          confidence: analysis.confidence,
          ai_tool: analysis.tool || search.tool,
          analysis_reasoning: analysis.reasoning
        });
        
        console.log(`   ✅ ${repo.full_name} - ${analysis.confidence} confidence`);
      } else {
        console.log(`   ❌ ${repo.full_name} - not AI-built`);
      }
      
      await sleep(2000); // Longer sleep for Claude API
    }
    
    console.log();
  }
  
  // Calculate summary
  results.summary.total_confirmed = results.apps.filter(a => a.confidence === 'high').length;
  results.summary.total_likely = results.apps.filter(a => a.confidence === 'medium').length;
  
  results.apps.forEach(app => {
    results.summary.by_tool[app.ai_tool] = (results.summary.by_tool[app.ai_tool] || 0) + 1;
  });
  
  // Save results
  fs.writeFileSync('ai-apps-detected.json', JSON.stringify(results, null, 2));
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 DETECTION SUMMARY');
  console.log('='.repeat(60));
  console.log(`\nTotal searches performed: ${Object.keys(results.search_stats).length}`);
  console.log(`Total GitHub results: ${Object.values(results.search_stats).reduce((a, b) => a + b, 0).toLocaleString()}`);
  console.log(`\nUnique apps detected: ${results.apps.length}`);
  console.log(`  - High confidence: ${results.summary.total_confirmed}`);
  console.log(`  - Medium confidence: ${results.summary.total_likely}`);
  
  console.log(`\nBy AI Tool:`);
  Object.entries(results.summary.by_tool)
    .sort((a, b) => b[1] - a[1])
    .forEach(([tool, count]) => {
      console.log(`  ${tool.padEnd(20)} ${count}`);
    });
  
  console.log(`\nClaude API calls made: ${apiCallCount}`);
  console.log(`Estimated cost: $${(apiCallCount * 0.008).toFixed(2)}`);
  
  console.log(`\n💾 Full results saved to: ai-apps-detected.json`);
  console.log('='.repeat(60));
}

collectAIApps();