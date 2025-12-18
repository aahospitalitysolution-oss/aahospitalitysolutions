
import { getSortedPostsData } from '@/lib/blog';
import BlogClient from './BlogClient';

export const metadata = {
    title: 'Insights & Advisory | A&A Hospitality',
    description: 'Expert perspectives on hospitality asset management, owner advisory, and market trends in Southeast Asia.',
};

export default function BlogIndex() {
    const allPosts = getSortedPostsData();

    return <BlogClient posts={allPosts} />;
}
