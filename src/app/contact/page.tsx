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
                The analyses and recommendations provided on this website are for informational purposes only.
                They should not be considered as financial advice. Always do your own research before making investment decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 