import { Link } from 'react-router-dom';
import { BarChart3, Mail, FileText } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-primary text-primary-foreground">
      <div className="max-w-[100rem] mx-auto px-8 py-16">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-foreground flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <span className="font-heading text-2xl">Performance Analyzer</span>
            </div>
            <p className="font-paragraph text-primary-foreground/80 leading-relaxed">
              Empowering educators with comprehensive analytics to track student progress and provide targeted support.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading text-xl mb-4">Quick Access</h3>
            <ul className="space-y-3 font-paragraph">
              <li>
                <Link to="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Upload Data
                </Link>
              </li>
              <li>
                <Link to="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  View Statistics
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-heading text-xl mb-4">Support</h3>
            <div className="space-y-3 font-paragraph">
              <a
                href="mailto:support@performanceanalyzer.com"
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                support@performanceanalyzer.com
              </a>
              <p className="text-primary-foreground/80 text-sm leading-relaxed">
                For technical assistance or inquiries about data analysis features
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-paragraph text-sm text-primary-foreground/70">
              © {currentYear} Student Performance Analyzer. All rights reserved.
            </p>
            <div className="flex gap-6 font-paragraph text-sm">
              <Link to="/" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
