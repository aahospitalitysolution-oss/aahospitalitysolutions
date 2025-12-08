
import { getPostData, getSortedPostsData } from '@/lib/blog';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import { Metadata } from 'next';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    try {
        const post = await getPostData(slug);
        return {
            title: `${post.title} | ANA Hospitality Insights`,
            description: post.excerpt,
            openGraph: {
                title: post.title,
                description: post.excerpt,
                type: 'article',
                publishedTime: post.date,
                authors: [post.author || 'ANA Hospitality'],
            },
        };
    } catch (e) {
        return {
            title: 'Article Not Found',
        };
    }
}

export async function generateStaticParams() {
    const posts = getSortedPostsData();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export default async function BlogPost({ params }: Props) {
    const { slug } = await params;
    let post;
    try {
        post = await getPostData(slug);
    } catch (e) {
        notFound();
    }

    return (
        <main className="min-h-screen text-[#f6f0ed] relative z-20" style={{ backgroundColor: '#09121a', color: '#f6f0ed' }}>
            <Navbar />

            <article className="pt-32 pb-16 px-4 md:px-8">
                <div className="max-w-3xl mx-auto">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-[#7ea8be] mb-8">
                        <Link href="/blog" className="hover:text-[#c2948a] transition-colors">
                            Insights
                        </Link>
                        <span>/</span>
                        <span className="truncate max-w-[200px]">{post.category || 'Article'}</span>
                    </div>

                    {/* Header */}
                    <header className="mb-12 border-b border-[#f6f0ed]/10 pb-12">
                        <div className="flex items-center gap-4 text-xs font-semibold tracking-wider text-[#c2948a] uppercase mb-4">
                            <span>{post.category}</span>
                            <span className="w-1 h-1 rounded-full bg-[#f6f0ed]/30"></span>
                            <span className="text-[#f6f0ed]/60">
                                {new Date(post.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-bold leading-tight text-[#f6f0ed] mb-8">
                            {post.title}
                        </h1>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#7ea8be]/20 flex items-center justify-center text-[#7ea8be] font-bold">
                                    A
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-[#f6f0ed]">ANA Hospitality</div>
                                    <div className="text-xs text-[#f6f0ed]/50">Advisory Team</div>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Content */}
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                                '@context': 'https://schema.org',
                                '@type': 'BlogPosting',
                                headline: post.title,
                                datePublished: post.date,
                                dateModified: post.date,
                                description: post.excerpt,
                                image: [post.coverImage],
                                author: {
                                    '@type': 'Organization',
                                    name: post.author || 'ANA Hospitality',
                                },
                            }),
                        }}
                    />
                    <div
                        className="prose prose-invert prose-lg max-w-none prose-p:text-justify prose-headings:text-[#c2948a] prose-a:text-[#7ea8be] prose-strong:text-[#f6f0ed] prose-blockquote:border-l-[#c2948a] prose-blockquote:bg-[#1a2e3b]/50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:italic"
                        dangerouslySetInnerHTML={{ __html: post.contentHtml || '' }}
                    />

                    {/* Footer Navigation */}
                    <div className="mt-16 pt-8 border-t border-[#f6f0ed]/10">
                        <Link
                            href="/blog"
                            className="inline-flex items-center text-[#7ea8be] hover:text-[#c2948a] transition-colors"
                        >
                            <svg className="w-4 h-4 mr-2 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Back to Insights
                        </Link>
                    </div>
                </div>
            </article>
        </main>
    );
}
