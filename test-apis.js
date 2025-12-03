import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config();

async function testGitHub() {
  console.log('\n🧪 Testing GitHub API...');
  
  const response = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `token ${process.env.GITHUB_TOKEN}`
    }
  });
  
  if (response.ok) {
    const data = await response.json();
    console.log('✅ GitHub works! Logged in as:', data.login);
  } else {
    console.log('❌ GitHub failed:', response.status);
  }
}

async function testAnthropic() {
  console.log('\n🧪 Testing Anthropic API...');
  
  try {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
      messages: [{ role: 'user', content: 'Say hello!' }],
    });
    
    console.log('✅ Anthropic works!');
    console.log('Claude says:', message.content[0].text);
  } catch (error) {
    console.log('❌ Anthropic failed:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Testing APIs...\n');
  await testGitHub();
  await testAnthropic();
  console.log('\n✨ Done!\n');
}

runTests();