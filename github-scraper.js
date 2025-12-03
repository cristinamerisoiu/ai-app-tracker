import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Search GitHub for AI-generated repos
async function searchGitHub(query, createdAfter = '2024-12-01') {
  const url = `https://api.github.com/search/repositories?q=${query}+created:>${createdAfter}&sort=created&order=desc&per_page=100`;
  
  console.log(`🔍 Searching: ${query}`);
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  
  if (!response.ok) {
    console.log(`❌ Failed: ${response.status}`);
    return [];
  }
  
  const data = await response.json();
  console.log(`✅ Found ${data.total_count} repos (showing first ${data.items.length})`);
  
  return data.items;
}

// Get detailed info about a repo
async function getRepoDetails(owner, repo) {
  try {
    // Get README
    const readmeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3.raw'
        }
      }
    );
    
    const readme = readmeResponse.ok ? await readmeResponse.text() : '';
    
    // Get commits
    const commitsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=5`,
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    
    const commits = commitsResponse.ok ? await commitsResponse.json() : [];
    
    return { readme, commitCount: commits.length };
  } catch (error) {
    return { readme: '', commitCount: 0 };
  }
}

// Main search function
async function findAIApps() {
  console.log('🚀 Starting AI app search...\n');
  
  const searchQueries = [
    'claude in:readme',
    'chatgpt in:readme',
    'cursor in:readme',
    'v0.dev in:readme',
    'built with ai in:readme',
    'ai generated in:readme'
  ];
  
  const allRepos = [];
  const seenRepos = new Set();
  
  for (const query of searchQueries) {
    const repos = await searchGitHub(query);
    
    // Filter out duplicates
    for (const repo of repos) {
      const repoId = repo.full_name;
      if (!seenRepos.has(repoId)) {
        seenRepos.add(repoId);
        allRepos.push({
          name: repo.name,
          full_name: repo.full_name,
          url: repo.html_url,
          description: repo.description,
          created_at: repo.created_at,
          language: repo.language,
          stars: repo.stargazers_count
        });
      }
    }
    
    // Sleep 1 second between requests to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n📊 Total unique repos found: ${allRepos.length}`);
  
  return allRepos;
}

// Run it
async function run() {
  const apps = await findAIApps();
  
  console.log('\n📋 Sample results:');
  apps.slice(0, 5).forEach(app => {
    console.log(`\n- ${app.full_name}`);
    console.log(`  URL: ${app.url}`);
    console.log(`  Created: ${app.created_at}`);
    console.log(`  Language: ${app.language || 'N/A'}`);
  });
}

run();