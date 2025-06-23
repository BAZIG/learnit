import { Suspense } from 'react';
import Link from 'next/link';

interface Article {
  id: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
}

// This would typically come from a database or CMS
const articles: Article[] = [
  {
    id: '1',
    title: 'Understanding Neural Plasticity',
    date: '2024-03-20',
    category: 'neuroscience',
    excerpt: 'Explore how our brains adapt and change throughout our lives through the fascinating process of neural plasticity.'
  },
  {
    id: '2',
    title: 'The Psychology of Decision Making',
    date: '2024-03-19',
    category: 'psychology',
    excerpt: 'An in-depth look at the cognitive processes behind human decision making and behavioral patterns.'
  }
];

function ArticleCard({ article }: { article: Article }) {
  return (
    <div className="terminal-window mb-4">
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
                  <li>
                    <Link href="#psychology" className="text-[var(--terminal-bright)] hover:text-[var(--terminal-text)]">
                      Psychology
                    </Link>
                  </li>
                  <li>
                    <Link href="#neuroscience" className="text-[var(--terminal-bright)] hover:text-[var(--terminal-text)]">
                      Neuroscience
                    </Link>
                  </li>
                  <li>
                    <Link href="#behavior" className="text-[var(--terminal-bright)] hover:text-[var(--terminal-text)]">
                      Behavior
                    </Link>
                  </li>
                  <li>
                    <Link href="#cognition" className="text-[var(--terminal-bright)] hover:text-[var(--terminal-text)]">
                      Cognition
                    </Link>
                  </li>
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
                      <ArticleCard key={article.id} article={article} />
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