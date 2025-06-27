import { Suspense } from 'react';
import Link from 'next/link';
import { getAllHumanArticles } from '@/lib/fileUtils';

interface Article {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  author?: string;
}

// This would typically come from a database or CMS
const articles = getAllHumanArticles();

function ArticleCard({ article }: { article: Article }) {
  return (
    <div className="terminal-window mb-4 cursor-pointer">
      <Link href={`/humans/${article.slug}`}>
        <div className="terminal-header">
          <span className="text-[var(--terminal-text)]">
            $ {article.title}
          </span>
        </div>
        <div className="terminal-content">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[var(--terminal-dim)]">PUBLISHED:</span>
              <span className="text-[var(--terminal-bright)]">
                {new Date(article.date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--terminal-dim)]">CATEGORY:</span>
              <span className="text-[var(--terminal-bright)]">
                {article.category.toUpperCase()}
              </span>
            </div>
            <div className="text-[var(--terminal-bright)]">
              <p>{article.excerpt}</p>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function HumansPage() {
  return (
    <div className="space-y-4 p-4">
      <div className="terminal-window">
        <div className="terminal-header">
          <span className="text-[var(--terminal-text)]">$ HUMANS DIRECTORY</span>
        </div>
        <div className="terminal-content">
          <div className="mb-6">
            <h2 className="text-[var(--terminal-bright)] text-xl mb-2">Understanding Human Behavior</h2>
            <p className="text-[var(--terminal-text)]">
              Explore articles about human psychology, neuroscience, and behavior. 
              Discover insights into how our minds work and what makes us human.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="terminal-window">
              <div className="terminal-header">
                <span className="text-[var(--terminal-text)]">CATEGORIES</span>
              </div>
              <div className="terminal-content">
                <ul className="space-y-2">
                  {[...new Set(articles.map(a => a.category))].map(category => (
                    <li key={category}>
                      <Link href={`/humans/category/${category.toLowerCase()}`} className="text-[var(--terminal-bright)] hover:text-[var(--terminal-text)]">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="terminal-window">
              <div className="terminal-header">
                <span className="text-[var(--terminal-text)]">LATEST ARTICLES</span>
              </div>
              <div className="terminal-content">
                <Suspense fallback={
                  <div className="text-[var(--terminal-text)]">
                    <span className="animate-pulse">Loading articles...</span>
                  </div>
                }>
                  {articles.length > 0 ? (
                    articles.map((article) => (
                      <ArticleCard key={article.slug} article={article} />
                    ))
                  ) : (
                    <div className="text-[var(--terminal-text)]">
                      <span className="opacity-75">$ </span>
                      <span>No articles available yet.</span>
                    </div>
                  )}
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 