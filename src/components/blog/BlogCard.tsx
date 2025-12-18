
import Link from 'next/link';
import { BlogPost } from '@/lib/blog';

interface BlogCardProps {
    post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
    return (
        <Link
            href={`/blog/${post.slug}`}
            className="group block p-6 rounded-lg transition-transform hover:-translate-y-1 hover:shadow-lg border border-[#7ea8be]/20 hover:border-[#7ea8be]/50"
            style={{ backgroundColor: '#1a2e3b' }}
        >
            <div className="flex flex-col h-full">
                <div className="mb-4">
                    <span className="text-xs font-semibold tracking-wider text-[#7ea8be] uppercase">
                        {post.category || 'Insights'}
                    </span>
                    <span className="mx-2 text-[#7ea8be]/50">•</span>
                    <span className="text-xs text-[#bbb193]">
                        {new Date(post.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </span>
                </div>

                <h3 className="text-xl font-bold text-[#f6f0ed] group-hover:text-[#c2948a] transition-colors mb-3">
                    {post.title}
                </h3>

                <p className="text-[#f6f0ed]/70 text-sm leading-relaxed mb-6 flex-grow">
                    {post.excerpt}
                </p>

                <div className="flex items-center text-[#c2948a] text-sm font-medium group-hover:underline decoration-[#c2948a]/50 underline-offset-4">
                    Read Article
                    <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>
        </Link>
    );
}
