import { getHumanArticlesByCategory } from '@/lib/fileUtils';
import Link from 'next/link';

export default function CategoryPage({ params }: { params: { category: string } }) {
  const articles = getHumanArticlesByCategory(params.category);
  return (
    <div className="space-y-4 p-4">
      <div className="terminal-window">
        <div className="terminal-header">
          <span className="text-[var(--terminal-text)]">$ CATEGORY: {params.category.toUpperCase()}</span>
        </div>
        <div className="terminal-content">
          {articles.length > 0 ? (
            articles.map(article => (
              <div key={article.slug} className="terminal-window mb-4">
                <Link href={`/humans/${article.slug}`}>
                  <div className="terminal-header">
                    <span className="text-[var(--terminal-text)]">$ {article.title}</span>
                  </div>
                  <div className="terminal-content">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--terminal-dim)]">PUBLISHED:</span>
                      <span className="text-[var(--terminal-bright)]">{new Date(article.date).toLocaleDateString()}</span>
                    </div>
                    <div className="text-[var(--terminal-bright)]">
                      <p>{article.excerpt}</p>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="text-[var(--terminal-text)]">No articles in this category yet.</div>
          )}
        </div>
      </div>
    </div>
  );
} 