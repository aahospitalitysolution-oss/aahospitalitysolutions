import { MetadataRoute } from 'next';
import { getSortedPostsData } from '@/lib/blog';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://anahospitality.com'; // Replace with your actual domain
    const posts = getSortedPostsData();

    const blogPosts = posts.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }));

    const routes = [
        '',
        '/blog',
        '/services',
        '/contact',
        '/privacy-policy',
        '/terms-of-service',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    return [...routes, ...blogPosts];
}
