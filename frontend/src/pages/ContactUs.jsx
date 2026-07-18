import React, { useState } from 'react';
import { FaEnvelope, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

const ContactUs = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-left space-y-12 select-none">
      {/* Header */}
      <section className="text-center space-y-4">
        <span className="bg-primary/10 text-primary border border-primary/20 px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
          Contact Support
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-text-main leading-tight">
          We'd Love to Hear From You
        </h1>
        <p className="text-sm text-text-muted max-w-sm mx-auto">
          Need help with booking, cancellations, or host registration? Contact us below.
        </p>
      </section>

      {/* Grid splits contact info vs contact form */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Info panel */}
        <div className="md:col-span-1 space-y-6">
          <div className="flex items-start gap-3">
            <FaEnvelope className="text-primary w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">Email Address</h4>
              <p className="text-xs text-text-muted mt-0.5">support@airbnbai.com</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FaPhone className="text-accent w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">Helpline Number</h4>
              <p className="text-xs text-text-muted mt-0.5">+91 98765 43210</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FaMapMarkerAlt className="text-primary w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">Headquarters</h4>
              <p className="text-xs text-text-muted mt-0.5">MG Road, Bangalore, India</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2 border border-border-main p-6 rounded-2xl bg-bg-card glass-effect glow-card">
          {submitted ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto text-accent text-xl">✓</div>
              <h3 className="font-bold text-sm text-text-main">Message Received!</h3>
              <p className="text-xs text-text-muted max-w-xs mx-auto">
                Thank you for contacting AirbnbAI. Our support desk will reach out to you within 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-xs text-primary font-bold hover:underline cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="glass-input text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="glass-input text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Message Description</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we assist you today?"
                  className="glass-input text-xs resize-none h-24"
                />
              </div>

              <button
                type="submit"
                className="bg-primary text-white text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-primary/95 shadow cursor-pointer transition-colors"
              >
                Submit Form
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default ContactUs;
