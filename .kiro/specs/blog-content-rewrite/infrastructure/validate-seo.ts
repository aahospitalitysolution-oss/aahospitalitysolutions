#!/usr/bin/env ts-node
/**
 * SEO Validation Script for Blog Articles
 * Validates SEO optimization across all 25 blog articles
 * 
 * Checks:
 * - Unique excerpts for all articles
 * - Keyword integration and density
 * - Heading structure (H2, H3 usage)
 * - Internal linking between related articles
 * - Featured snippet optimization opportunities
 */

import * as fs from 'fs';
import * as path from 'path';

interface SEOValidationResult {
  filename: string;
  passed: boolean;
  issues: string[];
  warnings: string[];
  seoMetrics: {
    excerptLength: number;
    excerptUnique: boolean;
    primaryKeyword: string;
    keywordDensity: number;
    keywordInIntro: boolean;
    keywordInH2: boolean;
    keywordInConclusion: boolean;
    h2Count: number;
    h3Count: number;
    internalLinkCount: number;
    hasFeaturedSnippetOpportunity: boolean;
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

const POSTS_DIR = path.join(process.cwd(), 'src/content/posts');

// List of all 25 articles to validate
const TARGET_ARTICLES = [
  'maximizing-revpar-strategies-beyond-room-rates.md',
  'revenue-management-2-0-dynamic-pricing-strategies.md',
  'the-future-of-luxury-hospitality-in-southeast-asia-2026-outlook.md',
  'the-rise-of-experience-driven-travel-in-post-pandemic-asia.md',
  'direct-booking-strategies-reducing-ota-dependency.md',
  'digital-transformation-in-hotels-meaningful-tech-vs-gimmicks.md',
  'the-impact-of-ai-on-hotel-operations-and-guest-service.md',
  'optimizing-f-b-operations-for-higher-profit-margins.md',
  'housekeeping-efficiency-the-hidden-profit-driver.md',
  'pre-opening-critical-path-avoiding-costly-delays.md',
  'crisis-management-for-hospitality-leaders.md',
  'security-and-privacy-in-the-modern-hotel.md',
  'asset-management-vs-property-management-what-owners-need-to-know.md',
  'renovation-roi-when-to-refurbish-your-hotel-asset.md',
  'the-role-of-branding-in-hotel-asset-valuation.md',
  'navigating-hotel-franchise-agreements-a-guide-for-owners.md',
  'financial-reporting-standards-for-hotel-owners.md',
  'legacy-planning-ensuring-long-term-asset-health.md',
  'marketing-to-the-gen-z-luxury-traveler.md',
  'understanding-the-bleisure-traveler-demographic.md',
  'staff-retention-strategies-for-high-end-hospitality.md',
  'sustainable-hospitality-balancing-roi-with-eco-responsibility.md',
  'wellness-tourism-integrating-health-into-hospitality.md',
  'the-importance-of-local-culture-in-global-hotel-brands.md',
  'boutique-vs-chain-choosing-the-right-model-for-your-asset.md'
];

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

function extractPrimaryKeyword(title: string): string {
  // Extract the most important keyword phrase from the title
  // Remove common words and focus on the core topic
  const commonWords = ['the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'but', 'your', 'how', 'what', 'when', 'where', 'why'];
  
  const words = title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !commonWords.includes(w));
  
  // Return the first 2-3 significant words as the primary keyword
  return words.slice(0, Math.min(3, words.length)).join(' ');
}

function calculateKeywordDensity(text: string, keyword: string): number {
  const cleanText = text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ');
  
  const totalWords = cleanText.split(' ').filter(w => w.length > 0).length;
  
  if (totalWords === 0) return 0;
  
  // Count keyword occurrences (handle multi-word keywords)
  const keywordLower = keyword.toLowerCase();
  const keywordWords = keywordLower.split(' ');
  
  let count = 0;
  const words = cleanText.split(' ');
  
  if (keywordWords.length === 1) {
    count = words.filter(w => w === keywordLower).length;
  } else {
    // For multi-word keywords, search for the phrase
    for (let i = 0; i <= words.length - keywordWords.length; i++) {
      const phrase = words.slice(i, i + keywordWords.length).join(' ');
      if (phrase === keywordLower) {
        count++;
      }
    }
  }
  
  return (count / totalWords) * 100;
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

function extractIntroduction(body: string): string {
  // Extract first 200-300 words as introduction
  const lines = body.split('\n').filter(line => line.trim().length > 0);
  let intro = '';
  let wordCount = 0;
  
  for (const line of lines) {
    if (line.startsWith('#')) continue; // Skip headings
    intro += line + ' ';
    wordCount += line.split(/\s+/).length;
    if (wordCount >= 200) break;
  }
  
  return intro;
}

function extractConclusion(body: string): string {
  // Look for conclusion section or last 150 words
  const conclusionMatch = body.match(/##\s+Conclusion[\s\S]*$/i);
  if (conclusionMatch) {
    return conclusionMatch[0];
  }
  
  // Otherwise, take last 150 words
  const words = body.split(/\s+/);
  return words.slice(-150).join(' ');
}

function countInternalLinks(body: string): number {
  // Count markdown links that point to other blog posts
  const linkRegex = /\[([^\]]+)\]\(([^\)]+)\)/g;
  const matches = [...body.matchAll(linkRegex)];
  
  // Filter for internal blog links
  const internalLinks = matches.filter(match => {
    const url = match[2];
    return url.includes('/blog/') || url.startsWith('/') || url.startsWith('../');
  });
  
  return internalLinks.length;
}

function checkFeaturedSnippetOpportunity(body: string): boolean {
  // Check for patterns that work well for featured snippets:
  // 1. Question headings (What is, How to, Why, etc.)
  // 2. Numbered lists
  // 3. Clear, concise definitions
  
  const questionHeadingRegex = /^##\s+(What|How|Why|When|Where|Which)\s+/im;
  const numberedListRegex = /^\d+\.\s+/m;
  
  return questionHeadingRegex.test(body) || numberedListRegex.test(body);
}

function validateSEO(filename: string, allExcerpts: Map<string, string[]>): SEOValidationResult {
  const filepath = path.join(POSTS_DIR, filename);
  
  if (!fs.existsSync(filepath)) {
    return {
      filename,
      passed: false,
      issues: ['File not found'],
      warnings: [],
      seoMetrics: {
        excerptLength: 0,
        excerptUnique: false,
        primaryKeyword: '',
        keywordDensity: 0,
        keywordInIntro: false,
        keywordInH2: false,
        keywordInConclusion: false,
        h2Count: 0,
        h3Count: 0,
        internalLinkCount: 0,
        hasFeaturedSnippetOpportunity: false
      }
    };
  }
  
  const content = fs.readFileSync(filepath, 'utf-8');
  const { frontmatter, body } = parseFrontmatter(content);
  
  const result: SEOValidationResult = {
    filename,
    passed: true,
    issues: [],
    warnings: [],
    seoMetrics: {
      excerptLength: 0,
      excerptUnique: true,
      primaryKeyword: '',
      keywordDensity: 0,
      keywordInIntro: false,
      keywordInH2: false,
      keywordInConclusion: false,
      h2Count: 0,
      h3Count: 0,
      internalLinkCount: 0,
      hasFeaturedSnippetOpportunity: false
    }
  };
  
  // 1. Validate excerpt uniqueness and length
  if (frontmatter.excerpt) {
    result.seoMetrics.excerptLength = frontmatter.excerpt.length;
    
    if (frontmatter.excerpt.length < 150) {
      result.issues.push(`Excerpt too short: ${frontmatter.excerpt.length} chars (should be 150-200)`);
      result.passed = false;
    } else if (frontmatter.excerpt.length > 200) {
      result.warnings.push(`Excerpt too long: ${frontmatter.excerpt.length} chars (should be 150-200)`);
    }
    
    // Check uniqueness
    const duplicates = allExcerpts.get(frontmatter.excerpt) || [];
    if (duplicates.length > 1) {
      result.issues.push(`Excerpt is not unique (shared with: ${duplicates.filter(f => f !== filename).join(', ')})`);
      result.seoMetrics.excerptUnique = false;
      result.passed = false;
    }
  } else {
    result.issues.push('Missing excerpt');
    result.passed = false;
  }
  
  // 2. Extract primary keyword from title
  if (frontmatter.title) {
    result.seoMetrics.primaryKeyword = extractPrimaryKeyword(frontmatter.title);
  }
  
  // 3. Calculate keyword density
  if (result.seoMetrics.primaryKeyword) {
    result.seoMetrics.keywordDensity = calculateKeywordDensity(body, result.seoMetrics.primaryKeyword);
    
    if (result.seoMetrics.keywordDensity < 0.5) {
      result.warnings.push(`Low keyword density: ${result.seoMetrics.keywordDensity.toFixed(2)}% (target 1-2%)`);
    } else if (result.seoMetrics.keywordDensity > 3) {
      result.warnings.push(`High keyword density: ${result.seoMetrics.keywordDensity.toFixed(2)}% (target 1-2%, may be keyword stuffing)`);
    }
  }
  
  // 4. Check keyword in introduction
  const intro = extractIntroduction(body);
  if (result.seoMetrics.primaryKeyword) {
    result.seoMetrics.keywordInIntro = intro.toLowerCase().includes(result.seoMetrics.primaryKeyword.toLowerCase());
    
    if (!result.seoMetrics.keywordInIntro) {
      result.warnings.push('Primary keyword not found in introduction');
    }
  }
  
  // 5. Check keyword in headings
  const headings = extractHeadings(body);
  result.seoMetrics.h2Count = headings.h2.length;
  result.seoMetrics.h3Count = headings.h3.length;
  
  if (result.seoMetrics.primaryKeyword) {
    const keywordLower = result.seoMetrics.primaryKeyword.toLowerCase();
    result.seoMetrics.keywordInH2 = headings.h2.some(h => h.toLowerCase().includes(keywordLower));
    
    if (!result.seoMetrics.keywordInH2) {
      result.warnings.push('Primary keyword not found in any H2 heading');
    }
  }
  
  // 6. Validate heading structure
  if (headings.h2.length < 4) {
    result.warnings.push(`Low H2 count: ${headings.h2.length} (recommended 4-6)`);
  } else if (headings.h2.length > 8) {
    result.warnings.push(`High H2 count: ${headings.h2.length} (recommended 4-6)`);
  }
  
  if (headings.h3.length < 6) {
    result.warnings.push(`Low H3 count: ${headings.h3.length} (recommended 6-12)`);
  }
  
  // 7. Check keyword in conclusion
  const conclusion = extractConclusion(body);
  if (result.seoMetrics.primaryKeyword) {
    result.seoMetrics.keywordInConclusion = conclusion.toLowerCase().includes(result.seoMetrics.primaryKeyword.toLowerCase());
    
    if (!result.seoMetrics.keywordInConclusion) {
      result.warnings.push('Primary keyword not found in conclusion');
    }
  }
  
  // 8. Count internal links
  result.seoMetrics.internalLinkCount = countInternalLinks(body);
  
  if (result.seoMetrics.internalLinkCount === 0) {
    result.warnings.push('No internal links found (recommended 2-4)');
  } else if (result.seoMetrics.internalLinkCount === 1) {
    result.warnings.push('Only 1 internal link found (recommended 2-4)');
  } else if (result.seoMetrics.internalLinkCount > 6) {
    result.warnings.push(`High internal link count: ${result.seoMetrics.internalLinkCount} (recommended 2-4)`);
  }
  
  // 9. Check for featured snippet opportunities
  result.seoMetrics.hasFeaturedSnippetOpportunity = checkFeaturedSnippetOpportunity(body);
  
  if (!result.seoMetrics.hasFeaturedSnippetOpportunity) {
    result.warnings.push('No clear featured snippet opportunity (consider adding question headings or numbered lists)');
  }
  
  return result;
}

function collectAllExcerpts(): Map<string, string[]> {
  const excerptMap = new Map<string, string[]>();
  
  for (const filename of TARGET_ARTICLES) {
    const filepath = path.join(POSTS_DIR, filename);
    
    if (!fs.existsSync(filepath)) continue;
    
    const content = fs.readFileSync(filepath, 'utf-8');
    const { frontmatter } = parseFrontmatter(content);
    
    if (frontmatter.excerpt) {
      const existing = excerptMap.get(frontmatter.excerpt) || [];
      existing.push(filename);
      excerptMap.set(frontmatter.excerpt, existing);
    }
  }
  
  return excerptMap;
}

function main() {
  console.log('🔍 SEO Validation for Blog Articles\n');
  console.log('=' .repeat(80));
  console.log('\nValidating SEO optimization across all 25 articles...\n');
  
  // First, collect all excerpts to check uniqueness
  const allExcerpts = collectAllExcerpts();
  
  const results: SEOValidationResult[] = [];
  let totalPassed = 0;
  let totalFailed = 0;
  
  // Validate each article
  for (const article of TARGET_ARTICLES) {
    const result = validateSEO(article, allExcerpts);
    results.push(result);
    
    if (result.passed) {
      totalPassed++;
    } else {
      totalFailed++;
    }
  }
  
  // Print summary
  console.log('=' .repeat(80));
  console.log('\n📊 SEO Validation Summary\n');
  console.log(`Total Articles: ${TARGET_ARTICLES.length}`);
  console.log(`Passed: ${totalPassed} ✅`);
  console.log(`Failed: ${totalFailed} ❌\n`);
  
  // Print failed articles
  if (totalFailed > 0) {
    console.log('❌ Failed Articles:\n');
    for (const result of results.filter(r => !r.passed)) {
      console.log(`\n📄 ${result.filename}`);
      console.log(`   Primary Keyword: "${result.seoMetrics.primaryKeyword}"`);
      console.log(`   Keyword Density: ${result.seoMetrics.keywordDensity.toFixed(2)}%`);
      console.log(`   Excerpt Length: ${result.seoMetrics.excerptLength} chars`);
      console.log(`   H2 Count: ${result.seoMetrics.h2Count}`);
      console.log(`   H3 Count: ${result.seoMetrics.h3Count}`);
      console.log(`   Internal Links: ${result.seoMetrics.internalLinkCount}`);
      
      if (result.issues.length > 0) {
        console.log('\n   Issues:');
        result.issues.forEach(issue => console.log(`   ❌ ${issue}`));
      }
      
      if (result.warnings.length > 0) {
        console.log('\n   Warnings:');
        result.warnings.forEach(warning => console.log(`   ⚠️  ${warning}`));
      }
    }
  }
  
  // Print warnings for passed articles
  const passedWithWarnings = results.filter(r => r.passed && r.warnings.length > 0);
  if (passedWithWarnings.length > 0) {
    console.log('\n\n⚠️  Passed Articles with SEO Warnings:\n');
    for (const result of passedWithWarnings) {
      console.log(`\n📄 ${result.filename}`);
      console.log(`   Primary Keyword: "${result.seoMetrics.primaryKeyword}"`);
      console.log(`   Keyword Density: ${result.seoMetrics.keywordDensity.toFixed(2)}%`);
      console.log(`   Internal Links: ${result.seoMetrics.internalLinkCount}`);
      result.warnings.forEach(warning => console.log(`   ⚠️  ${warning}`));
    }
  }
  
  // Print SEO statistics
  console.log('\n\n📈 SEO Statistics:\n');
  
  const avgKeywordDensity = results.reduce((sum, r) => sum + r.seoMetrics.keywordDensity, 0) / results.length;
  const avgH2Count = results.reduce((sum, r) => sum + r.seoMetrics.h2Count, 0) / results.length;
  const avgH3Count = results.reduce((sum, r) => sum + r.seoMetrics.h3Count, 0) / results.length;
  const avgInternalLinks = results.reduce((sum, r) => sum + r.seoMetrics.internalLinkCount, 0) / results.length;
  const avgExcerptLength = results.reduce((sum, r) => sum + r.seoMetrics.excerptLength, 0) / results.length;
  
  const keywordInIntroCount = results.filter(r => r.seoMetrics.keywordInIntro).length;
  const keywordInH2Count = results.filter(r => r.seoMetrics.keywordInH2).length;
  const keywordInConclusionCount = results.filter(r => r.seoMetrics.keywordInConclusion).length;
  const featuredSnippetCount = results.filter(r => r.seoMetrics.hasFeaturedSnippetOpportunity).length;
  const uniqueExcerptCount = results.filter(r => r.seoMetrics.excerptUnique).length;
  
  console.log(`Average Keyword Density: ${avgKeywordDensity.toFixed(2)}% (target: 1-2%)`);
  console.log(`Average H2 Count: ${avgH2Count.toFixed(1)} (recommended: 4-6)`);
  console.log(`Average H3 Count: ${avgH3Count.toFixed(1)} (recommended: 6-12)`);
  console.log(`Average Internal Links: ${avgInternalLinks.toFixed(1)} (recommended: 2-4)`);
  console.log(`Average Excerpt Length: ${avgExcerptLength.toFixed(0)} chars (target: 150-200)`);
  console.log(`\nKeyword in Introduction: ${keywordInIntroCount}/${results.length} (${(keywordInIntroCount/results.length*100).toFixed(0)}%)`);
  console.log(`Keyword in H2 Heading: ${keywordInH2Count}/${results.length} (${(keywordInH2Count/results.length*100).toFixed(0)}%)`);
  console.log(`Keyword in Conclusion: ${keywordInConclusionCount}/${results.length} (${(keywordInConclusionCount/results.length*100).toFixed(0)}%)`);
  console.log(`Unique Excerpts: ${uniqueExcerptCount}/${results.length} (${(uniqueExcerptCount/results.length*100).toFixed(0)}%)`);
  console.log(`Featured Snippet Opportunities: ${featuredSnippetCount}/${results.length} (${(featuredSnippetCount/results.length*100).toFixed(0)}%)`);
  
  // Check for duplicate excerpts
  console.log('\n\n📝 Excerpt Uniqueness Check:\n');
  const duplicateExcerpts = Array.from(allExcerpts.entries()).filter(([_, files]) => files.length > 1);
  
  if (duplicateExcerpts.length > 0) {
    console.log(`❌ Found ${duplicateExcerpts.length} duplicate excerpt(s):\n`);
    for (const [excerpt, files] of duplicateExcerpts) {
      console.log(`  Excerpt: "${excerpt.substring(0, 60)}..."`);
      console.log(`  Files: ${files.join(', ')}\n`);
    }
  } else {
    console.log('✅ All excerpts are unique');
  }
  
  console.log('\n' + '='.repeat(80));
  
  // Exit with error code if any failed
  if (totalFailed > 0) {
    console.log('\n❌ SEO Validation FAILED\n');
    console.log('Please address the issues above to improve SEO optimization.\n');
    process.exit(1);
  } else {
    console.log('\n✅ All SEO validations PASSED\n');
    console.log('All articles meet SEO optimization requirements!\n');
    process.exit(0);
  }
}

main();
