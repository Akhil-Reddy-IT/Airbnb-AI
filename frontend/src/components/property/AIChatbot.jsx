import React, { useState, useRef, useEffect } from 'react';
import api from '../../utils/api.js';
import { FaRobot, FaPaperPlane, FaCommentDots } from 'react-icons/fa';
import { IoCloseOutline } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';

const QUICK_CHIPS = [
  'What is the check-in time?',
  'What is the cancellation policy?',
  'Is there high-speed Wi-Fi?',
  'What amenities are included?'
];

const AIChatbot = ({ property }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Hello! I'm the AI Assistant for ${property.title}. Ask me anything about the property, policies, check-in, or amenities!`,
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: textToSend }];
    setMessages(newMessages);
    setInputMsg('');
    setLoading(true);

    try {
      // Map history for Gemini API (sender: 'user' | 'model')
      const chatHistory = messages.map((m) => ({
        sender: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await api.post('/ai/chatbot', {
        propertyId: property._id,
        message: textToSend,
        chatHistory,
      });

      if (res.data.success) {
        setMessages((prev) => [...prev, { sender: 'bot', text: res.data.reply }]);
      }
    } catch (error) {
      console.error('Error in chatbot connection:', error.message);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: "I'm having trouble connecting to the host's AI service. Please try asking again in a few moments.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-primary text-white p-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20"
        title="Ask AI Assistant"
      >
        <FaCommentDots className="w-5 h-5 animate-pulse" />
        <span className="text-xs font-bold hidden sm:inline-block pr-1">Ask AI</span>
      </button>

      {/* Slide-out Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop click dismiss */}
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
            <motion.div
              initial={{ opacity: 0, x: 100, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, y: 100, scale: 0.9 }}
              className="fixed bottom-24 right-6 w-full max-w-sm h-[500px] rounded-2xl border border-border-main glass-effect glow-card shadow-2xl z-50 flex flex-col overflow-hidden text-left"
            >
              {/* Chat Header */}
              <div className="p-4 border-b border-border-main/80 bg-primary/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <FaRobot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text-main truncate max-w-[200px]">
                      {property.title} AI
                    </h4>
                    <p className="text-[10px] text-accent font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping inline-block"></span>
                      Online Assistant
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-bg-main text-text-muted hover:text-text-main transition-colors cursor-pointer"
                >
                  <IoCloseOutline className="w-6 h-6" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-bg-main/10">
                {messages.map((m, index) => (
                  <div
                    key={index}
                    className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-line ${
                        m.sender === 'user'
                          ? 'bg-primary text-white rounded-tr-none'
                          : 'bg-bg-card border border-border-main text-text-main rounded-tl-none glow-card'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-bg-card border border-border-main text-text-muted rounded-2xl rounded-tl-none px-3.5 py-2.5 text-xs flex items-center gap-1.5 animate-pulse glow-card">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-100"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-200"></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Chips & Input Form */}
              <div className="p-3 border-t border-border-main/50 bg-bg-card/50">
                {/* Chip suggestions (only show if bot isn't thinking) */}
                {!loading && (
                  <div className="flex gap-1.5 overflow-x-auto pb-2.5 mb-2 scrollbar-none">
                    {QUICK_CHIPS.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(chip)}
                        className="text-[10px] bg-bg-main hover:bg-primary/10 hover:text-primary border border-border-main px-2.5 py-1 rounded-full shrink-0 font-medium text-text-muted transition-colors cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input Text Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(inputMsg);
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    placeholder="Ask about cancellations, check-in, wifi..."
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    disabled={loading}
                    className="glass-input text-xs flex-1"
                  />
                  <button
                    type="submit"
                    disabled={loading || !inputMsg.trim()}
                    className="bg-primary text-white p-2.5 rounded-lg hover:bg-primary/95 disabled:opacity-50 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <FaPaperPlane className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
