import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'src/content/posts');

export interface BlogPost {
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    contentHtml?: string;
    coverImage?: string;
    author?: string;
    category?: string;
}

export function getSortedPostsData(): BlogPost[] {
    // Get file names under /posts
    if (!fs.existsSync(postsDirectory)) {
        return [];
    }

    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames
        .filter((fileName) => fileName.endsWith('.md'))
        .map((fileName) => {
            // Remove ".md" from file name to get id
            const slug = fileName.replace(/\.md$/, '');

            // Read markdown file as string
            const fullPath = path.join(postsDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');

            // Use gray-matter to parse the post metadata section
            const matterResult = matter(fileContents);

            // Validate required fields or Provide defaults
            return {
                slug,
                title: matterResult.data.title || 'Untitled Post',
                date: matterResult.data.date || new Date().toISOString(),
                excerpt: matterResult.data.excerpt || '',
                coverImage: matterResult.data.coverImage || '/images/placeholder.jpg',
                author: matterResult.data.author || 'ANA Hospitality',
                category: matterResult.data.category || 'Insights',
                ...matterResult.data,
            };
        });

    // Sort posts by date
    return allPostsData.sort((a, b) => {
        if (a.date < b.date) {
            return 1;
        } else {
            return -1;
        }
    });
}

export async function getPostData(slug: string): Promise<BlogPost> {
    const fullPath = path.join(postsDirectory, `${slug}.md`);

    if (!fs.existsSync(fullPath)) {
        throw new Error(`Post not found: ${slug}`);
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Use remark to convert markdown into HTML string
    const processedContent = await remark()
        .use(html)
        .process(matterResult.content);
    const contentHtml = processedContent.toString();

    return {
        slug,
        contentHtml,
        title: matterResult.data.title,
        date: matterResult.data.date,
        excerpt: matterResult.data.excerpt,
        coverImage: matterResult.data.coverImage || '/images/placeholder.jpg',
        author: matterResult.data.author || 'ANA Hospitality',
        category: matterResult.data.category || 'Insights',
    };
}
