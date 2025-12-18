#!/usr/bin/env ts-node
/**
 * Comprehensive Content Validation Script
 * Validates all 25 blog articles against quality requirements
 */

import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  filename: string;
  passed: boolean;
  issues: string[];
  warnings: string[];
  stats: {
    wordCount: number;
    h2Count: number;
    h3Count: number;
    excerptLength: number;
  };
}

interface FrontmatterData {
  title?: string;
  date?: string;
  excerpt?: string;
  category?: string;
  author?: string;
  coverImage?: string;
}

// Template phrases that should NOT appear in articles
const TEMPLATE_PHRASES = [
  'In the rapidly evolving landscape',
  'stands out as a pivotal subject',
  'maximizing asset value',
  'The true measure of success',
  'multi-faceted approach',
  'Data-Driven Decision Making',
  'Operational Agility',
  'Sustainable Practices',
  'Strategic Approaches',
  'Looking Ahead',
  'In today\'s competitive landscape',
  'As we look to the future',
  'In an increasingly competitive market'
];

// Generic headings that should be replaced with topic-specific ones
const GENERIC_HEADINGS = [
  'Strategic Approaches',
  'Looking Ahead',
  'Key Considerations',
  'Best Practices',
  'Implementation Strategies',
  'Future Outlook',
  'Conclusion'
];

const POSTS_DIR = path.join(process.cwd(), 'src/content/posts');

function parseFrontmatter(content: string): { frontmatter: FrontmatterData; body: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { frontmatter: {}, body: content };
  }
  
  const frontmatterText = match[1];
  const body = match[2];
  
  const frontmatter: FrontmatterData = {};
  const lines = frontmatterText.split('\n');
  
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();
      
      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      frontmatter[key as keyof FrontmatterData] = value;
    }
  }
  
  return { frontmatter, body };
}

function countWords(text: string): number {
  // Remove markdown syntax for accurate word count
  const cleanText = text
    .replace(/^---[\s\S]*?---/m, '') // Remove frontmatter
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Replace links with text
    .replace(/[#*`_~]/g, '') // Remove markdown formatting
    .replace(/\n+/g, ' '); // Replace newlines with spaces
  
  const words = cleanText.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

function extractHeadings(content: string): { h2: string[]; h3: string[] } {
  const h2Regex = /^## (.+)$/gm;
  const h3Regex = /^### (.+)$/gm;
  
  const h2Matches = [...content.matchAll(h2Regex)];
  const h3Matches = [...content.matchAll(h3Regex)];
  
  return {
    h2: h2Matches.map(m => m[1].trim()),
    h3: h3Matches.map(m => m[1].trim())
  };
}

function validateArticle(filename: string): ValidationResult {
  const filepath = path.join(POSTS_DIR, filename);
  const content = fs.readFileSync(filepath, 'utf-8');
  
  const result: ValidationResult = {
    filename,
    passed: true,
    issues: [],
    warnings: [],
    stats: {
      wordCount: 0,
      h2Count: 0,
      h3Count: 0,
      excerptLength: 0
    }
  };
  
  const { frontmatter, body } = parseFrontmatter(content);
  
  // Check frontmatter completeness
  const requiredFields: (keyof FrontmatterData)[] = ['title', 'date', 'excerpt', 'category', 'author', 'coverImage'];
  for (const field of requiredFields) {
    if (!frontmatter[field]) {
      result.issues.push(`Missing required frontmatter field: ${field}`);
      result.passed = false;
    }
  }
  
  // Check excerpt length
  if (frontmatter.excerpt) {
    result.stats.excerptLength = frontmatter.excerpt.length;
    if (frontmatter.excerpt.length < 150) {
      result.warnings.push(`Excerpt is too short (${frontmatter.excerpt.length} chars, should be 150-200)`);
    } else if (frontmatter.excerpt.length > 200) {
      result.warnings.push(`Excerpt is too long (${frontmatter.excerpt.length} chars, should be 150-200)`);
    }
  }
  
  // Check word count
  result.stats.wordCount = countWords(body);
  if (result.stats.wordCount < 1200) {
    result.issues.push(`Word count too low: ${result.stats.wordCount} (minimum 1200)`);
    result.passed = false;
  }
  
  // Check for template phrases
  for (const phrase of TEMPLATE_PHRASES) {
    if (body.includes(phrase)) {
      result.issues.push(`Contains template phrase: "${phrase}"`);
      result.passed = false;
    }
  }
  
  // Check headings
  const headings = extractHeadings(body);
  result.stats.h2Count = headings.h2.length;
  result.stats.h3Count = headings.h3.length;
  
  if (headings.h2.length < 4) {
    result.warnings.push(`Low H2 count: ${headings.h2.length} (recommended 4-6)`);
  }
  
  // Check for generic headings
  for (const heading of [...headings.h2, ...headings.h3]) {
    if (GENERIC_HEADINGS.includes(heading)) {
      result.issues.push(`Generic heading found: "${heading}"`);
      result.passed = false;
    }
  }
  
  // Check if headings are topic-specific (should contain words from title)
  if (frontmatter.title) {
    const titleWords = frontmatter.title
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3 && !['the', 'and', 'for', 'with', 'your'].includes(w));
    
    let topicSpecificHeadings = 0;
    for (const heading of headings.h2) {
      const headingLower = heading.toLowerCase();
      if (titleWords.some(word => headingLower.includes(word))) {
        topicSpecificHeadings++;
      }
    }
    
    if (topicSpecificHeadings === 0 && headings.h2.length > 0) {
      result.warnings.push('No H2 headings contain topic-specific keywords from title');
    }
  }
  
  return result;
}

function validateExcerptUniqueness(articles: string[]): Map<string, string[]> {
  const excerptMap = new Map<string, string[]>();
  
  for (const filename of articles) {
    const filepath = path.join(POSTS_DIR, filename);
    const content = fs.readFileSync(filepath, 'utf-8');
    const { frontmatter } = parseFrontmatter(content);
    
    if (frontmatter.excerpt) {
      const existing = excerptMap.get(frontmatter.excerpt) || [];
      existing.push(filename);
      excerptMap.set(frontmatter.excerpt, existing);
    }
  }
  
  // Return only duplicates
  const duplicates = new Map<string, string[]>();
  for (const [excerpt, files] of excerptMap.entries()) {
    if (files.length > 1) {
      duplicates.set(excerpt, files);
    }
  }
  
  return duplicates;
}

function main() {
  console.log('🔍 Blog Content Quality Validation\n');
  console.log('=' .repeat(80));
  
  const articles = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  
  if (articles.length !== 25) {
    console.log(`⚠️  Warning: Expected 25 articles, found ${articles.length}\n`);
  }
  
  const results: ValidationResult[] = [];
  let totalPassed = 0;
  let totalFailed = 0;
  
  // Validate each article
  for (const article of articles) {
    const result = validateArticle(article);
    results.push(result);
    
    if (result.passed) {
      totalPassed++;
    } else {
      totalFailed++;
    }
  }
  
  // Check excerpt uniqueness
  console.log('\n📝 Checking Excerpt Uniqueness...\n');
  const duplicateExcerpts = validateExcerptUniqueness(articles);
  
  if (duplicateExcerpts.size > 0) {
    console.log('❌ Duplicate excerpts found:\n');
    for (const [excerpt, files] of duplicateExcerpts.entries()) {
      console.log(`  Excerpt: "${excerpt.substring(0, 50)}..."`);
      console.log(`  Files: ${files.join(', ')}\n`);
    }
  } else {
    console.log('✅ All excerpts are unique\n');
  }
  
  // Print summary
  console.log('=' .repeat(80));
  console.log('\n📊 Validation Summary\n');
  console.log(`Total Articles: ${articles.length}`);
  console.log(`Passed: ${totalPassed} ✅`);
  console.log(`Failed: ${totalFailed} ❌\n`);
  
  // Print failed articles
  if (totalFailed > 0) {
    console.log('❌ Failed Articles:\n');
    for (const result of results.filter(r => !r.passed)) {
      console.log(`\n📄 ${result.filename}`);
      console.log(`   Word Count: ${result.stats.wordCount}`);
      console.log(`   H2 Headings: ${result.stats.h2Count}`);
      console.log(`   H3 Headings: ${result.stats.h3Count}`);
      console.log(`   Excerpt Length: ${result.stats.excerptLength}`);
      
      if (result.issues.length > 0) {
        console.log('\n   Issues:');
        result.issues.forEach(issue => console.log(`   - ${issue}`));
      }
      
      if (result.warnings.length > 0) {
        console.log('\n   Warnings:');
        result.warnings.forEach(warning => console.log(`   - ${warning}`));
      }
    }
  }
  
  // Print warnings for passed articles
  const passedWithWarnings = results.filter(r => r.passed && r.warnings.length > 0);
  if (passedWithWarnings.length > 0) {
    console.log('\n\n⚠️  Passed Articles with Warnings:\n');
    for (const result of passedWithWarnings) {
      console.log(`\n📄 ${result.filename}`);
      result.warnings.forEach(warning => console.log(`   - ${warning}`));
    }
  }
  
  // Print statistics
  console.log('\n\n📈 Content Statistics:\n');
  const avgWordCount = Math.round(results.reduce((sum, r) => sum + r.stats.wordCount, 0) / results.length);
  const avgH2Count = Math.round(results.reduce((sum, r) => sum + r.stats.h2Count, 0) / results.length);
  const avgH3Count = Math.round(results.reduce((sum, r) => sum + r.stats.h3Count, 0) / results.length);
  
  console.log(`Average Word Count: ${avgWordCount}`);
  console.log(`Average H2 Headings: ${avgH2Count}`);
  console.log(`Average H3 Headings: ${avgH3Count}`);
  
  console.log('\n' + '='.repeat(80));
  
  // Exit with error code if any failed
  if (totalFailed > 0 || duplicateExcerpts.size > 0) {
    console.log('\n❌ Validation FAILED\n');
    process.exit(1);
  } else {
    console.log('\n✅ All validations PASSED\n');
    process.exit(0);
  }
}

main();
