import { Link } from "react-router-dom";
import { Facebook, Linkedin, Instagram, Music } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-[#F0F0F0] py-6 px-4 sm:px-6 text-sm text-gray-600">
      <div className="max-w-[2000px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4">
          <Link to="/terms" className="hover:text-[#00BFFF] transition-colors">Terms</Link>
          <Link to="/guidelines" className="hover:text-[#00BFFF] transition-colors">Guidelines</Link>
          <Link to="/privacy" className="hover:text-[#00BFFF] transition-colors">Privacy</Link>
          <a 
            href="mailto:support@earnhire.com" 
            className="hover:text-[#00BFFF] transition-colors"
          >
            Support
          </a>
        </div>
        
        <div className="flex items-center gap-4 order-first md:order-none">
          <a 
            href="https://facebook.com/earnhire" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-[#00BFFF] transition-colors p-2 -m-2 touch-manipulation"
          >
            <Facebook className="h-5 w-5" />
          </a>
          <a 
            href="https://linkedin.com/company/earnhire" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-[#00BFFF] transition-colors p-2 -m-2 touch-manipulation"
          >
            <Linkedin className="h-5 w-5" />
          </a>
          <a 
            href="https://instagram.com/earnhire" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-[#00BFFF] transition-colors p-2 -m-2 touch-manipulation"
          >
            <Instagram className="h-5 w-5" />
          </a>
          <a 
            href="https://x.com/earnhire" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-[#00BFFF] transition-colors p-2 -m-2 touch-manipulation"
          >
            <svg 
              viewBox="0 0 24 24" 
              className="h-5 w-5 fill-current"
              aria-label="X (formerly Twitter)"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a 
            href="https://tiktok.com/@earnhire" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-[#00BFFF] transition-colors p-2 -m-2 touch-manipulation"
          >
            <Music className="h-5 w-5" />
          </a>
        </div>

        <div className="text-gray-500 text-center md:text-right">
          © 2025 Earn Hire
        </div>
      </div>
    </footer>
  );
}