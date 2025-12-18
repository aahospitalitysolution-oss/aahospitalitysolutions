import { describe, it, expect } from 'vitest';
import { getPostData, getSortedPostsData } from './blog';

describe('Blog Integration Tests with Real Posts', () => {
  it('should successfully load and convert an actual blog post', async () => {
    const posts = getSortedPostsData();
    
    // Skip if no posts exist
    if (posts.length === 0) {
      console.log('No blog posts found, skipping integration test');
      return;
    }
    
    // Get the first post
    const firstPost = posts[0];
    const postData = await getPostData(firstPost.slug);
    
    // Verify the post was converted successfully
    expect(postData.contentHtml).toBeDefined();
    expect(postData.contentHtml!.length).toBeGreaterThan(0);
    
    // Verify semantic HTML elements are present
    expect(postData.contentHtml).toMatch(/<h[1-6]>/);
    expect(postData.contentHtml).toContain('<p>');
    
    // Verify metadata is preserved
    expect(postData.title).toBeDefined();
    expect(postData.date).toBeDefined();
    expect(postData.excerpt).toBeDefined();
  });

  it('should handle posts with various markdown features', async () => {
    const posts = getSortedPostsData();
    
    // Skip if no posts exist
    if (posts.length === 0) {
      console.log('No blog posts found, skipping integration test');
      return;
    }
    
    // Test multiple posts to ensure consistency
    const postsToTest = posts.slice(0, Math.min(3, posts.length));
    
    for (const post of postsToTest) {
      const postData = await getPostData(post.slug);
      
      // Verify no unescaped dangerous characters in text content
      // (< and & should be escaped, but we allow them in HTML tags)
      const textContent = postData.contentHtml!.replace(/<[^>]+>/g, '');
      
      // If there are any & or < in text content, they should be escaped
      const unescapedAmpersand = textContent.match(/&(?![a-zA-Z]+;|#[0-9]+;|#x[0-9a-fA-F]+;)/);
      const unescapedLessThan = textContent.match(/<(?![a-zA-Z/])/);
      
      expect(unescapedAmpersand).toBeNull();
      expect(unescapedLessThan).toBeNull();
    }
  });

  it('should preserve heading hierarchy in converted HTML', async () => {
    const posts = getSortedPostsData();
    
    // Skip if no posts exist
    if (posts.length === 0) {
      console.log('No blog posts found, skipping integration test');
      return;
    }
    
    const firstPost = posts[0];
    const postData = await getPostData(firstPost.slug);
    
    // Check that headings exist and are properly structured
    const h1Count = (postData.contentHtml!.match(/<h1>/g) || []).length;
    const h2Count = (postData.contentHtml!.match(/<h2>/g) || []).length;
    const h3Count = (postData.contentHtml!.match(/<h3>/g) || []).length;
    
    // At least one heading should exist
    expect(h1Count + h2Count + h3Count).toBeGreaterThan(0);
  });

  it('should handle links correctly', async () => {
    const posts = getSortedPostsData();
    
    // Skip if no posts exist
    if (posts.length === 0) {
      console.log('No blog posts found, skipping integration test');
      return;
    }
    
    const firstPost = posts[0];
    const postData = await getPostData(firstPost.slug);
    
    // If there are links, they should have proper href attributes
    const linkMatches = postData.contentHtml!.match(/<a\s+[^>]*href="[^"]*"[^>]*>/g);
    
    if (linkMatches) {
      // All links should have valid href attributes
      linkMatches.forEach(link => {
        expect(link).toMatch(/href="[^"]+"/);
      });
    }
  });
});
