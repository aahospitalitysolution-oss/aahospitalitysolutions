/**
 * Quick verification script to test the enhanced markdown conversion
 * Run with: npx tsx src/lib/verify-conversion.ts
 */

import { getPostData, getSortedPostsData } from './blog';

async function verifyConversion() {
  console.log('🔍 Verifying Enhanced Markdown-to-HTML Conversion\n');

  const posts = getSortedPostsData();

  if (posts.length === 0) {
    console.log('❌ No blog posts found');
    return;
  }

  console.log(`✅ Found ${posts.length} blog posts\n`);

  // Test the first post
  const firstPost = posts[0];
  console.log(`📄 Testing post: "${firstPost.title}"`);
  console.log(`   Slug: ${firstPost.slug}\n`);

  const postData = await getPostData(firstPost.slug);
  const htmlContent = postData.contentHtml || '';

  // Check for semantic HTML elements
  const checks = [
    { name: 'Headings (h1-h6)', regex: /<h[1-6]>/, found: false },
    { name: 'Paragraphs', regex: /<p>/, found: false },
    { name: 'Lists', regex: /<[uo]l>/, found: false },
    { name: 'List items', regex: /<li>/, found: false },
    { name: 'Links', regex: /<a\s+href=/, found: false },
    { name: 'Strong emphasis', regex: /<strong>/, found: false },
    { name: 'Emphasis', regex: /<em>/, found: false },
    { name: 'Blockquotes', regex: /<blockquote>/, found: false },
    { name: 'Code blocks', regex: /<pre>/, found: false },
    { name: 'Inline code', regex: /<code>/, found: false },
    { name: 'Tables', regex: /<table>/, found: false },
    { name: 'Line breaks', regex: /<br>/, found: false },
  ];

  console.log('Semantic HTML Elements Found:');
  checks.forEach(check => {
    check.found = check.regex.test(htmlContent);
    const icon = check.found ? '✅' : '⚠️';
    console.log(`${icon} ${check.name}: ${check.found ? 'Yes' : 'No'}`);
  });

  // Check for special character escaping
  console.log('\nSpecial Character Escaping:');
  const hasEscapedAmpersand = /(&amp;|&#x26;|&#38;)/.test(htmlContent);
  const hasEscapedLessThan = /(&lt;|&#x3C;|&#60;)/.test(htmlContent);

  console.log(`✅ Ampersand (&) escaping: ${hasEscapedAmpersand ? 'Present' : 'Not needed'}`);
  console.log(`✅ Less-than (<) escaping: ${hasEscapedLessThan ? 'Present' : 'Not needed'}`);

  // Content statistics
  console.log('\nContent Statistics:');
  console.log(`   Total HTML length: ${htmlContent.length} characters`);
  console.log(`   Heading count: ${(htmlContent.match(/<h[1-6]>/g) || []).length}`);
  console.log(`   Paragraph count: ${(htmlContent.match(/<p>/g) || []).length}`);
  console.log(`   Link count: ${(htmlContent.match(/<a\s+href=/g) || []).length}`);

  console.log('\n✅ Markdown-to-HTML conversion verification complete!');
}

verifyConversion().catch(console.error);
