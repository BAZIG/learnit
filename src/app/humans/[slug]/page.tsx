import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';

interface Article {
  title: string;
  date: string;
  content: string;
  category: string;
  author: string;
}

// This would typically come from a database or CMS
const articles: Record<string, Article> = {
  'understanding-neural-plasticity': {
    title: 'Understanding Neural Plasticity',
    date: '2024-03-20',
    content: `
      Neural plasticity, or neuroplasticity, is the brain's remarkable ability to reorganize itself by forming new neural connections throughout life. This process allows the neurons (nerve cells) in the brain to compensate for injury and disease and to adjust their activities in response to new situations or to changes in their environment.

      ## The Science Behind Neural Plasticity

      The brain's plasticity is most evident in two main forms:
      1. Structural plasticity: The brain's ability to change its physical structure as a result of learning
      2. Functional plasticity: The brain's ability to move functions from a damaged area to undamaged areas

      ## Real-World Applications

      Understanding neural plasticity has profound implications for:
      - Learning and education
      - Recovery from brain injuries
      - Treatment of neurological disorders
      - Mental health interventions

      ## Conclusion

      The study of neural plasticity continues to reveal the incredible adaptability of the human brain, offering hope for new treatments and a deeper understanding of human potential.
    `,
    category: 'neuroscience',
    author: 'Dr. Jane Smith'
  }
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = articles[params.slug];
  
  if (!article) {
    return {
      title: 'Article Not Found',
    };
  }

  return {
    title: article.title,
    description: article.content.split('\n')[0], // First paragraph as description
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  const article = articles[params.slug];

  if (!article) {
    notFound();
  }

  return (
    <div className="space-y-4 p-4">
      <div className="terminal-window">
        <div className="terminal-header">
          <span className="text-[var(--terminal-text)]">$ ARTICLE: {article.title}</span>
        </div>
        <div className="terminal-content">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[var(--terminal-dim)]">PUBLISHED:</span>
              <span className="text-[var(--terminal-bright)]">
                {new Date(article.date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[var(--terminal-dim)]">CATEGORY:</span>
              <span className="text-[var(--terminal-bright)]">
                {article.category.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-[var(--terminal-dim)]">AUTHOR:</span>
              <span className="text-[var(--terminal-bright)]">
                {article.author}
              </span>
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            {article.content.split('\n').map((paragraph, index) => {
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={index} className="text-[var(--terminal-bright)] text-xl mt-6 mb-4">
                    {paragraph.replace('## ', '')}
                  </h2>
                );
              }
              if (paragraph.startsWith('1. ') || paragraph.startsWith('2. ') || paragraph.startsWith('3. ')) {
                return (
                  <li key={index} className="text-[var(--terminal-text)] ml-4">
                    {paragraph}
                  </li>
                );
              }
              return (
                <p key={index} className="text-[var(--terminal-text)] mb-4">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <Link 
          href="/humans" 
          className="text-[var(--terminal-bright)] hover:text-[var(--terminal-text)]"
        >
          ← Back to Articles
        </Link>
      </div>
    </div>
  );
} 