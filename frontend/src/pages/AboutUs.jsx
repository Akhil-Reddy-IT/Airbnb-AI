import React from 'react';
import { FaRobot, FaMagic, FaShieldAlt, FaMapMarkedAlt } from 'react-icons/fa';

const AboutUs = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-left space-y-12 select-none">
      {/* Header Banner */}
      <section className="text-center space-y-4">
        <span className="bg-primary/10 text-primary border border-primary/20 px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
          Our Mission
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-text-main leading-tight">
          Redefining Travel Booking with AI
        </h1>
        <p className="text-sm md:text-base text-text-muted max-w-xl mx-auto">
          AirbnbAI is built to integrate hospitality with Google Gemini generative models, generating day plans, drafting profiles, and answering questions.
        </p>
      </section>

      {/* Grid of details */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        <div className="border border-border-main p-6 rounded-2xl bg-bg-card glass-effect space-y-2 glow-card">
          <FaRobot className="w-8 h-8 text-primary" />
          <h3 className="font-bold text-sm text-text-main uppercase tracking-wider">Gemini Integration</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            By utilising system prompts and JSON validation, our Gemini tools convert search inputs, review summaries, and create natural descriptions.
          </p>
        </div>

        <div className="border border-border-main p-6 rounded-2xl bg-bg-card glass-effect space-y-2 glow-card">
          <FaMapMarkedAlt className="w-8 h-8 text-accent" />
          <h3 className="font-bold text-sm text-text-main uppercase tracking-wider">Smart Travel Plans</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Our AI planner designs travel itineraries containing attractions, tips, and budget allocations for any destination in seconds.
          </p>
        </div>

        <div className="border border-border-main p-6 rounded-2xl bg-bg-card glass-effect space-y-2 glow-card">
          <FaShieldAlt className="w-8 h-8 text-primary" />
          <h3 className="font-bold text-sm text-text-main uppercase tracking-wider">Verified Hosts</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Every listing undergoes admin approval workflows to ensure travel safety, location validation, and amenities verification.
          </p>
        </div>

        <div className="border border-border-main p-6 rounded-2xl bg-bg-card glass-effect space-y-2 glow-card">
          <FaMagic className="w-8 h-8 text-accent" />
          <h3 className="font-bold text-sm text-text-main uppercase tracking-wider">Interactive Chatbots</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Skip scanning FAQs. Ask our listing-specific chatbots about wifi speeds, parking availability, or house rules directly.
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
