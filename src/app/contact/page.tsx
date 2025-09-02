'use client';

export default function Contact() {
  return (
    <div className="space-y-4">
      <div className="terminal-window">
        <div className="terminal-header">
          <span className="text-[var(--terminal-text)]">$ CONTACT_INFO</span>
        </div>
        <div className="terminal-content">
          <div className="space-y-4">
            <div>
              <h3 className="text-[var(--terminal-text)] font-bold mb-2">Connect with me</h3>
              <div className="space-y-2">
                <p className="text-[var(--terminal-text)]">
                  <span className="opacity-75">Email: </span>
                  <a href="mailto:baptiste.zigmann@proton.me" className="hover:opacity-75">
                    baptiste.zigmann@proton.me
                  </a>
                </p>
                <p className="text-[var(--terminal-text)]">
                  <span className="opacity-75">LinkedIn: </span>
                  <a href="https://www.linkedin.com/in/baptiste-zigmann-337410253/" target="_blank" rel="noopener noreferrer" className="hover:opacity-75">
                    linkedin.com/in/baptiste-zigmann
                  </a>
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-[var(--terminal-text)] font-bold mb-2">About</h3>
              <p className="text-[var(--terminal-text)]">
                This website is a focus on quantitative analysis and algorithmic trading.
                This website showcases my analysis of various stocks using multiple analytical tools and approaches.
              </p>
            </div>

            <div>
              <h3 className="text-[var(--terminal-text)] font-bold mb-2">Disclaimer</h3>
              <p className="text-[var(--terminal-text)] text-sm">
                This website documents my personal investment decisions/Ideas for transparency. It is not financial advice.
                I do not guarantee profits or protect against losses. Consult a licensed advisor or do your own research before investing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 