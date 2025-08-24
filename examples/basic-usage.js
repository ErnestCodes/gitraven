#!/usr/bin/env bun

// Example of using GitRaven programmatically
const { GitAnalyzer, AICommitGenerator, DEFAULT_CONFIG } = require('../dist');

async function example() {
  try {
    console.log('🔍 Analyzing git repository...');
    
    // Initialize git analyzer
    const git = new GitAnalyzer();
    
    // Check if we're in a git repository
    const isRepo = await git.isGitRepository();
    if (!isRepo) {
      console.error('❌ Not a git repository');
      return;
    }
    
    // Get staged changes
    const gitDiff = await git.getStagedChanges();
    console.log(`📁 Found ${gitDiff.files.length} staged files`);
    
    // Show files
    gitDiff.files.forEach(file => {
      console.log(`  - ${file.path} (${file.status}, +${file.insertions}/-${file.deletions})`);
    });
    
    // Initialize AI generator
    if (!DEFAULT_CONFIG.apiKey) {
      console.error('❌ Please set OPENAI_API_KEY environment variable');
      return;
    }
    
    console.log('\n🤖 Generating commit message...');
    const ai = new AICommitGenerator(DEFAULT_CONFIG);
    
    // Generate commit message
    const commitMessage = await ai.generateCommitMessage(gitDiff);
    const formatted = ai.formatCommitMessage(commitMessage);
    
    console.log('\n📝 Generated commit message:');
    console.log('─'.repeat(50));
    console.log(formatted);
    console.log('─'.repeat(50));
    
    console.log('\n✨ Use "gitraven" command for interactive experience!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

example();
