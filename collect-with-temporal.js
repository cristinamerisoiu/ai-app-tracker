import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// High confidence search queries
const SEARCH_QUERIES = [
  { query: '"built with claude" in:readme', tool: 'Claude', confidence: 'high' },
  { query: '"built with chatgpt" in:readme', tool: 'ChatGPT', confidence: 'high' },
  { query: '"created with cursor" in:readme', tool: 'Cursor', confidence: 'high' },
  { query: '"made with v0" in:readme', tool: 'v0.dev', confidence: 'high' },
  { query: '"built with bolt" in:readme', tool: 'Bolt.new', confidence: 'high' },
  { query: '"built with replit ai" in:readme', tool: 'Replit AI', confidence: 'high' },
  { query: '"made with copilot" in:readme', tool: 'GitHub Copilot', confidence: 'high' },
  { query: '"built with windsurf" in:readme', tool: 'Windsurf', confidence: 'high' },
  { query: '"built with lovable" in:readme', tool: 'Lovable', confidence: 'high' },
  { query: '"ai generated code" in:readme', tool: 'AI (generic)', confidence: 'high' },
  { query: '"100% ai built" in:readme', tool: 'AI (generic)', confidence: 'high' },
  { query: '"fully ai generated" in:readme', tool: 'AI (generic)', confidence: 'high' },
  { query: '"coded with ai" in:readme', tool: 'AI (generic)', confidence: 'high' },
];

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
    return { total: 0, items: [] };
  }
  
  const data = await response.json();
  return { total: data.total_count, items: data.items };
}

// Analyze repo timing patterns
async function analyzeRepoTiming(owner, repo) {
  try {
    const repoResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    
    if (!repoResponse.ok) return null;
    const repoData = await repoResponse.json();
    
    const commitsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`,
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    
    if (!commitsResponse.ok) return null;
    const commits = await commitsResponse.json();
    
    if (commits.length === 0) return null;
    
    const firstCommit = commits[commits.length - 1];
    const firstCommitResponse = await fetch(firstCommit.url, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    const firstCommitData = await firstCommitResponse.json();
    
    const repoCreated = new Date(repoData.created_at);
    const firstCommitDate = new Date(firstCommit.commit.author.date);
    const hoursToFirstCommit = (firstCommitDate - repoCreated) / (1000 * 60 * 60);
    
    return {
      hours_to_first_commit: hoursToFirstCommit,
      total_commits: commits.length,
      files_in_first_commit: firstCommitData.files?.length || 0,
      lines_added_first_commit: firstCommitData.stats?.additions || 0,
      first_commit_message: firstCommit.commit.message,
      signals: {
        instant_app: hoursToFirstCommit < 1,
        fast_development: hoursToFirstCommit < 48,
        single_massive_commit: commits.length === 1 && (firstCommitData.files?.length || 0) > 10,
        large_first_commit: (firstCommitData.files?.length || 0) > 20,
        huge_code_dump: (firstCommitData.stats?.additions || 0) > 1000
      }
    };
  } catch (error) {
    return null;
  }
}

function calculateTemporalConfidence(timing) {
  if (!timing) return { score: 0, level: 'none', reasons: [] };
  
  let score = 0;
  const reasons = [];
  
  if (timing.signals.instant_app) {
    score += 40;
    reasons.push('App appeared in <1 hour');
  }
  
  if (timing.signals.fast_development) {
    score += 20;
    reasons.push('Built in <48 hours');
  }
  
  if (timing.signals.single_massive_commit) {
    score += 30;
    reasons.push('Single commit with 10+ files');
  }
  
  if (timing.signals.large_first_commit) {
    score += 15;
    reasons.push('20+ files in first commit');
  }
  
  if (timing.signals.huge_code_dump) {
    score += 20;
    reasons.push('1000+ lines added at once');
  }
  
  if (timing.first_commit_message) {
    const message = timing.first_commit_message.toLowerCase();
    if (message.includes('claude') || message.includes('chatgpt') || 
        message.includes('cursor') || message.includes('ai')) {
      score += 25;
      reasons.push('AI mentioned in commit message');
    }
  }
  
  let level = 'low';
  if (score >= 70) level = 'very_high';
  else if (score >= 50) level = 'high';
  else if (score >= 30) level = 'medium';
  
  return { score, level, reasons };
}

async function collectAIApps() {
  console.log('🚀 Starting 3-phase AI app detection...\n');
  
  const results = {
    timestamp: new Date().toISOString(),
    search_stats: {},
    apps: [],
    summary: {
      phase1_explicit: 0,
      phase2_analyzed: 0,
      phase3_temporal: 0,
      by_tool: {}
    }
  };
  
  const seenRepos = new Set();
  let claudeApiCalls = 0;
  
  // PHASE 1: High confidence (explicit mentions)
  console.log('📍 PHASE 1: Explicit mentions\n');
  
  for (const search of SEARCH_QUERIES) {
    console.log(`🔍 ${search.query}`);
    const data = await searchGitHub(search.query);
    
    results.search_stats[search.query] = data.total;
    console.log(`   Found: ${data.total.toLocaleString()} total\n`);
    
    for (const repo of data.items) {
      if (seenRepos.has(repo.full_name)) continue;
      seenRepos.add(repo.full_name);
      
      results.apps.push({
        full_name: repo.full_name,
        url: repo.html_url,
        description: repo.description,
        created_at: repo.created_at,
        language: repo.language,
        stars: repo.stargazers_count,
        detected_via: 'Phase 1: Explicit',
        confidence: 'high',
        ai_tool: search.tool
      });
    }
    
    await sleep(1500);
  }
  
  results.summary.phase1_explicit = results.apps.length;
  console.log(`\n✅ Phase 1 complete: ${results.apps.length} apps\n`);
  
  // PHASE 3: Temporal analysis on recent repos
  console.log('📍 PHASE 3: Temporal pattern detection\n');
  console.log('Searching for recently created repos with suspicious timing...\n');
  
  // Search for repos created in last 7 days (high chance of being recent AI experiments)
  const recentDate = new Date();
  recentDate.setDate(recentDate.getDate() - 7);
  const dateStr = recentDate.toISOString().split('T')[0];
  
  const recentRepos = await searchGitHub(`created:>${dateStr} stars:>0`, dateStr);
  console.log(`Found ${recentRepos.total.toLocaleString()} recent repos, analyzing first 50...\n`);
  
  const toAnalyze = recentRepos.items.slice(0, 50);
  let temporalDetected = 0;
  
  for (const repo of toAnalyze) {
    if (seenRepos.has(repo.full_name)) continue;
    
    const [owner, repoName] = repo.full_name.split('/');
    const timing = await analyzeRepoTiming(owner, repoName);
    await sleep(800);
    
    if (!timing) continue;
    
    const confidence = calculateTemporalConfidence(timing);
    
    if (confidence.score >= 50) { // High or very high confidence
      seenRepos.add(repo.full_name);
      temporalDetected++;
      
      results.apps.push({
        full_name: repo.full_name,
        url: repo.html_url,
        description: repo.description,
        created_at: repo.created_at,
        language: repo.language,
        stars: repo.stargazers_count,
        detected_via: 'Phase 3: Temporal',
        confidence: confidence.level,
        ai_tool: 'AI (inferred from timing)',
        temporal_signals: confidence.reasons,
        timing_data: {
          hours_to_first_commit: timing.hours_to_first_commit.toFixed(2),
          total_commits: timing.total_commits,
          files_in_first_commit: timing.files_in_first_commit
        }
      });
      
      console.log(`✅ ${repo.full_name}`);
      console.log(`   Confidence: ${confidence.level} (${confidence.score}/100)`);
      console.log(`   Signals: ${confidence.reasons.join(', ')}\n`);
    }
  }
  
  results.summary.phase3_temporal = temporalDetected;
  console.log(`\n✅ Phase 3 complete: ${temporalDetected} new apps detected\n`);
  
  // Calculate final summary
  results.apps.forEach(app => {
    results.summary.by_tool[app.ai_tool] = (results.summary.by_tool[app.ai_tool] || 0) + 1;
  });
  
  // Save
  fs.writeFileSync('ai-apps-complete.json', JSON.stringify(results, null, 2));
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 COMPLETE DETECTION SUMMARY');
  console.log('='.repeat(60));
  console.log(`\nTotal apps detected: ${results.apps.length}`);
  console.log(`  Phase 1 (Explicit): ${results.summary.phase1_explicit}`);
  console.log(`  Phase 3 (Temporal): ${results.summary.phase3_temporal}`);
  
  console.log(`\nBy AI Tool:`);
  Object.entries(results.summary.by_tool)
    .sort((a, b) => b[1] - a[1])
    .forEach(([tool, count]) => {
      console.log(`  ${tool.padEnd(30)} ${count}`);
    });
  
  console.log(`\nClaude API calls: ${claudeApiCalls}`);
  console.log(`Estimated cost: $${(claudeApiCalls * 0.008).toFixed(2)}`);
  console.log(`\n💾 Saved to: ai-apps-complete.json`);
  console.log('='.repeat(60));
}

collectAIApps();