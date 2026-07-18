import React from 'react';
import { FaRobot, FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="border-t border-border-main bg-bg-card glass-effect mt-20 py-10 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Info */}
        <div className="space-y-4">
          <div className="text-xl font-bold flex items-center gap-1 text-text-main">
            <span>Airbnb</span>
            <span className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded font-mono flex items-center gap-0.5">
              <FaRobot /> AI
            </span>
          </div>
          <p className="text-xs text-text-muted leading-relaxed">
            The next-generation vacation rental and property booking platform enhanced with advanced Google Gemini intelligence features.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-text-muted hover:text-primary transition-colors"><FaGithub className="w-4 h-4" /></a>
            <a href="#" className="text-text-muted hover:text-primary transition-colors"><FaTwitter className="w-4 h-4" /></a>
            <a href="#" className="text-text-muted hover:text-primary transition-colors"><FaLinkedin className="w-4 h-4" /></a>
          </div>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-sm font-semibold text-text-main mb-4">Support</h4>
          <ul className="space-y-2 text-xs text-text-muted">
            <li><a href="#" className="hover:underline">Help Center</a></li>
            <li><a href="#" className="hover:underline">AirCover</a></li>
            <li><a href="#" className="hover:underline">Anti-discrimination</a></li>
            <li><a href="#" className="hover:underline">Cancellation Options</a></li>
          </ul>
        </div>

        {/* Hosting */}
        <div>
          <h4 className="text-sm font-semibold text-text-main mb-4">Hosting</h4>
          <ul className="space-y-2 text-xs text-text-muted">
            <li><a href="#" className="hover:underline">AirbnbAI Your Home</a></li>
            <li><a href="#" className="hover:underline">CoverForHosts</a></li>
            <li><a href="#" className="hover:underline">Hosting Resources</a></li>
            <li><a href="#" className="hover:underline">Community Forum</a></li>
          </ul>
        </div>

        {/* AI Features */}
        <div>
          <h4 className="text-sm font-semibold text-text-main mb-4">Gemini AI Integrations</h4>
          <ul className="space-y-2 text-xs text-text-muted">
            <li>Smart Search Assistant</li>
            <li>Property Copywriting Helper</li>
            <li>Day-by-Day Travel Planner</li>
            <li>Review Summarization</li>
            <li>Interactive Property Chatbots</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-border-main mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-muted">
        <p>© 2026 AirbnbAI Inc. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="#" className="hover:underline">Sitemap</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
