import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';

export default function Header() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="w-full bg-background border-b border-primary/10 sticky top-0 z-50">
      <div className="max-w-[100rem] mx-auto px-8 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-heading text-2xl text-primary group-hover:text-primary/80 transition-colors">
              Performance Analyzer
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('upload')}
              className="font-paragraph text-base text-secondary hover:text-primary transition-colors"
            >
              Upload Data
            </button>
            <button
              onClick={() => scrollToSection('statistics')}
              className="font-paragraph text-base text-secondary hover:text-primary transition-colors"
            >
              Statistics
            </button>
            <button
              onClick={() => scrollToSection('rankings')}
              className="font-paragraph text-base text-secondary hover:text-primary transition-colors"
            >
              Rankings
            </button>
            <button
              onClick={() => scrollToSection('at-risk')}
              className="font-paragraph text-base text-secondary hover:text-primary transition-colors"
            >
              At-Risk Students
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
