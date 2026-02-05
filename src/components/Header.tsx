import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export default function Header() {
  return (
    <header className="w-full bg-background border-b border-primary/10 sticky top-0 z-50">
      <div className="max-w-[120rem] mx-auto px-4 sm:px-8 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-heading text-2xl text-primary group-hover:text-primary/80 transition-colors">
              StudyHub
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="font-paragraph text-base text-secondary hover:text-primary transition-colors"
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className="font-paragraph text-base text-secondary hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/study-materials"
              className="font-paragraph text-base text-secondary hover:text-primary transition-colors"
            >
              Study Materials
            </Link>
            <Link
              to="/advice"
              className="font-paragraph text-base text-secondary hover:text-primary transition-colors"
            >
              Advice
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
