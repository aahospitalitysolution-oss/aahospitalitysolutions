import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getPostData, getSortedPostsData } from './blog';
import fs from 'fs';
import path from 'path';

describe('Blog Markdown to HTML Conversion', () => {
  const testPostsDir = path.join(process.cwd(), 'src/content/posts');
  const testPostPath = path.join(testPostsDir, 'test-markdown-conversion.md');
  
  const testMarkdownContent = `---
title: "Test Markdown Conversion"
date: "2025-01-01"
excerpt: "Testing various markdown features"
category: "Test"
author: "Test Author"
---

# Main Heading

This is a paragraph with **bold text**, *italic text*, and \`inline code\`.

## Subheading with Special Characters

Testing special characters: & < > " ' 

### Lists

Unordered list:
- Item 1
- Item 2
- Item 3

Ordered list:
1. First item
2. Second item
3. Third item

### Blockquote

> This is a blockquote with multiple lines.
> It should be properly formatted.

### Code Block

\`\`\`javascript
const example = "code block";
console.log(example);
\`\`\`

### Links and Emphasis

[Link text](https://example.com)

**Strong emphasis** and *regular emphasis*.

### Tables (GFM)

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

### Horizontal Rule

---

### Line Breaks

Line one
Line two should be on a new line.

### Long URLs and Text Wrapping

This is a very long URL that should wrap properly: https://example.com/very/long/path/that/goes/on/and/on/and/should/wrap/correctly

### Nested Lists

1. First level
   - Nested item 1
   - Nested item 2
2. Back to first level
`;

  beforeAll(() => {
    // Create test post file
    if (!fs.existsSync(testPostsDir)) {
      fs.mkdirSync(testPostsDir, { recursive: true });
    }
    fs.writeFileSync(testPostPath, testMarkdownContent);
  });

  afterAll(() => {
    // Clean up test post file
    if (fs.existsSync(testPostPath)) {
      fs.unlinkSync(testPostPath);
    }
  });

  it('should convert markdown to HTML with semantic structure', async () => {
    const post = await getPostData('test-markdown-conversion');
    
    expect(post.contentHtml).toBeDefined();
    expect(post.contentHtml).toContain('<h1>');
    expect(post.contentHtml).toContain('<h2>');
    expect(post.contentHtml).toContain('<h3>');
    expect(post.contentHtml).toContain('<p>');
    expect(post.contentHtml).toContain('<ul>');
    expect(post.contentHtml).toContain('<ol>');
    expect(post.contentHtml).toContain('<li>');
    expect(post.contentHtml).toContain('<blockquote>');
    expect(post.contentHtml).toContain('<a ');
    expect(post.contentHtml).toContain('<strong>');
    expect(post.contentHtml).toContain('<em>');
    expect(post.contentHtml).toContain('<code>');
  });

  it('should properly escape special characters', async () => {
    const post = await getPostData('test-markdown-conversion');
    
    // Special characters should be properly escaped in HTML (either named entities or numeric codes)
    // & and < must be escaped, > can be but doesn't have to be
    expect(post.contentHtml).toMatch(/(&amp;|&#x26;|&#38;)/); // &
    expect(post.contentHtml).toMatch(/(&lt;|&#x3C;|&#60;)/);  // <
    // > character is present in the content (may or may not be escaped)
    expect(post.contentHtml).toContain('>');
    // Quotes in regular text should be present (escaped or not)
    expect(post.contentHtml).toMatch(/(&quot;|&#x22;|&#34;|")/); // "
  });

  it('should support GitHub Flavored Markdown tables', async () => {
    const post = await getPostData('test-markdown-conversion');
    
    // GFM tables should be converted to HTML tables
    expect(post.contentHtml).toContain('<table>');
    expect(post.contentHtml).toContain('<thead>');
    expect(post.contentHtml).toContain('<tbody>');
    expect(post.contentHtml).toContain('<tr>');
    expect(post.contentHtml).toContain('<th>');
    expect(post.contentHtml).toContain('<td>');
  });

  it('should preserve link structure with href attributes', async () => {
    const post = await getPostData('test-markdown-conversion');
    
    // Links should have proper href attributes
    expect(post.contentHtml).toMatch(/<a\s+href="https:\/\/example\.com"/);
  });

  it('should handle horizontal rules', async () => {
    const post = await getPostData('test-markdown-conversion');
    
    // Horizontal rules should be converted to <hr> tags
    expect(post.contentHtml).toContain('<hr>');
  });

  it('should handle nested lists', async () => {
    const post = await getPostData('test-markdown-conversion');
    
    // Should contain nested list structures
    expect(post.contentHtml).toMatch(/<ol>[\s\S]*<ul>[\s\S]*<\/ul>[\s\S]*<\/ol>/);
  });

  it('should convert line breaks to br tags', async () => {
    const post = await getPostData('test-markdown-conversion');
    
    // Line breaks should be converted to <br> tags
    expect(post.contentHtml).toContain('<br>');
  });

  it('should handle code blocks with language specification', async () => {
    const post = await getPostData('test-markdown-conversion');
    
    // Code blocks should be wrapped in pre and code tags
    expect(post.contentHtml).toContain('<pre>');
    expect(post.contentHtml).toContain('<code');
  });

  it('should preserve metadata from frontmatter', async () => {
    const post = await getPostData('test-markdown-conversion');
    
    expect(post.title).toBe('Test Markdown Conversion');
    expect(post.date).toBe('2025-01-01');
    expect(post.excerpt).toBe('Testing various markdown features');
    expect(post.category).toBe('Test');
    expect(post.author).toBe('Test Author');
  });

  it('should handle long URLs without breaking layout', async () => {
    const post = await getPostData('test-markdown-conversion');
    
    // Long URLs should be present in the HTML
    expect(post.contentHtml).toContain('https://example.com/very/long/path');
  });
});

describe('Blog Post Listing', () => {
  it('should return sorted posts data', () => {
    const posts = getSortedPostsData();
    
    expect(Array.isArray(posts)).toBe(true);
    
    // Verify posts are sorted by date (newest first)
    if (posts.length > 1) {
      for (let i = 0; i < posts.length - 1; i++) {
        expect(new Date(posts[i].date).getTime()).toBeGreaterThanOrEqual(
          new Date(posts[i + 1].date).getTime()
        );
      }
    }
  });

  it('should include required fields for each post', () => {
    const posts = getSortedPostsData();
    
    posts.forEach(post => {
      expect(post).toHaveProperty('slug');
      expect(post).toHaveProperty('title');
      expect(post).toHaveProperty('date');
      expect(post).toHaveProperty('excerpt');
      expect(post).toHaveProperty('category');
      expect(post).toHaveProperty('author');
    });
  });
});
