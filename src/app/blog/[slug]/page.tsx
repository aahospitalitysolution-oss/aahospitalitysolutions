
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
            title: `${post.title} | A&A Hospitality Insights`,
            description: post.excerpt,
            openGraph: {
                title: post.title,
                description: post.excerpt,
                type: 'article',
                publishedTime: post.date,
                authors: [post.author || 'A&A Hospitality'],
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

            <article className="pt-24 pb-12 px-4 sm:pt-28 sm:pb-14 sm:px-6 md:pt-32 md:pb-16 md:px-8 lg:px-12">
                <div className="max-w-3xl mx-auto w-full">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-[#7ea8be] mb-6 sm:mb-8">
                        <Link href="/blog" className="hover:text-[#c2948a] transition-colors">
                            Insights
                        </Link>
                        <span>/</span>
                        <span className="truncate max-w-[150px] sm:max-w-[200px]">{post.category || 'Article'}</span>
                    </div>

                    {/* Header */}
                    <header className="mb-8 sm:mb-10 md:mb-12 border-b border-[#f6f0ed]/10 pb-8 sm:pb-10 md:pb-12">
                        <div className="flex items-center gap-3 sm:gap-4 text-xs font-semibold tracking-wider text-[#c2948a] uppercase mb-3 sm:mb-4">
                            <span>{post.category}</span>
                            <span className="w-1 h-1 rounded-full bg-[#f6f0ed]/30"></span>
                            <span className="text-[#f6f0ed]/60 text-[0.65rem] sm:text-xs">
                                {new Date(post.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-[#f6f0ed] mb-6 sm:mb-7 md:mb-8">
                            {post.title}
                        </h1>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#7ea8be]/20 flex items-center justify-center text-[#7ea8be] font-bold text-sm sm:text-base">
                                    A
                                </div>
                                <div>
                                    <div className="text-xs sm:text-sm font-medium text-[#f6f0ed]">A&A Hospitality</div>
                                    <div className="text-[0.65rem] sm:text-xs text-[#f6f0ed]/50">Advisory Team</div>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Content */}
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify([
                                {
                                    '@context': 'https://schema.org',
                                    '@type': 'BlogPosting',
                                    headline: post.title,
                                    datePublished: post.date,
                                    dateModified: post.date,
                                    description: post.excerpt,
                                    image: [post.coverImage],
                                    author: {
                                        '@type': 'Organization',
                                        name: post.author || 'A&A Hospitality',
                                    },
                                },
                                {
                                    '@context': 'https://schema.org',
                                    '@type': 'BreadcrumbList',
                                    'itemListElement': [
                                        {
                                            '@type': 'ListItem',
                                            'position': 1,
                                            'name': 'Home',
                                            'item': 'https://aahospitalitysolutions.com'
                                        },
                                        {
                                            '@type': 'ListItem',
                                            'position': 2,
                                            'name': 'Insights',
                                            'item': 'https://aahospitalitysolutions.com/blog'
                                        },
                                        {
                                            '@type': 'ListItem',
                                            'position': 3,
                                            'name': post.title,
                                            'item': `https://aahospitalitysolutions.com/blog/${slug}`
                                        }
                                    ]
                                }
                            ]),
                        }}
                    />
                    <div
                        className="prose prose-invert prose-base sm:prose-lg max-w-full
                            prose-p:text-justify prose-p:leading-relaxed prose-p:mb-5 sm:prose-p:mb-6
                            prose-headings:font-serif prose-headings:text-[#c2948a] prose-headings:font-normal
                            prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-3 sm:prose-h2:text-3xl sm:prose-h2:mt-10 sm:prose-h2:mb-4 md:prose-h2:mt-12
                            prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-2 sm:prose-h3:text-2xl sm:prose-h3:mt-7 sm:prose-h3:mb-3 md:prose-h3:mt-8
                            prose-h4:text-lg prose-h4:mt-5 prose-h4:mb-2 sm:prose-h4:text-xl sm:prose-h4:mt-6
                            prose-a:text-[#7ea8be] prose-a:no-underline hover:prose-a:text-[#c2948a] hover:prose-a:underline
                            prose-strong:text-[#f6f0ed] prose-strong:font-semibold
                            prose-code:text-[#7ea8be] prose-code:bg-[#1a2e3b]/30 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                            prose-blockquote:border-l-4 prose-blockquote:border-[#c2948a] prose-blockquote:bg-[#1a2e3b]/50 
                            prose-blockquote:py-3 prose-blockquote:px-4 prose-blockquote:italic prose-blockquote:my-5 sm:prose-blockquote:py-4 sm:prose-blockquote:px-6 sm:prose-blockquote:my-6
                            prose-ul:my-5 prose-ul:list-disc prose-ul:pl-5 sm:prose-ul:my-6 sm:prose-ul:pl-6
                            prose-ol:my-5 prose-ol:list-decimal prose-ol:pl-5 sm:prose-ol:my-6 sm:prose-ol:pl-6
                            prose-li:my-1.5 sm:prose-li:my-2
                            prose-img:my-6 prose-img:rounded-lg sm:prose-img:my-8
                            prose-hr:my-8 prose-hr:border-[#f6f0ed]/20 sm:prose-hr:my-10 md:prose-hr:my-12
                            prose-table:border-collapse prose-table:w-full prose-table:my-6 prose-table:text-sm sm:prose-table:my-8 sm:prose-table:text-base
                            prose-th:border prose-th:border-[#f6f0ed]/20 prose-th:px-3 prose-th:py-2 prose-th:bg-[#1a2e3b]/50 sm:prose-th:px-4
                            prose-td:border prose-td:border-[#f6f0ed]/20 prose-td:px-3 prose-td:py-2 sm:prose-td:px-4
                            md:prose-p:text-lg
                            md:max-w-[75ch]
                            lg:max-w-[70ch]"
                        dangerouslySetInnerHTML={{ __html: post.contentHtml || '' }}
                    />

                    {/* Footer Navigation */}
                    <div className="mt-10 sm:mt-12 md:mt-16 pt-6 sm:pt-7 md:pt-8 border-t border-[#f6f0ed]/10">
                        <Link
                            href="/blog"
                            className="inline-flex items-center text-sm sm:text-base text-[#7ea8be] hover:text-[#c2948a] transition-colors"
                        >
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
