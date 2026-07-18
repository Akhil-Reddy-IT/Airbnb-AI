import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { IoColorPaletteOutline } from 'react-icons/io5';

const themes = [
  { id: 'light', name: 'Light theme', color: 'bg-[#FF5A5F]', ring: 'ring-[#FF5A5F]' },
  { id: 'dark', name: 'Dark glass', color: 'bg-[#6C63FF]', ring: 'ring-[#6C63FF]' },
  { id: 'sunset', name: 'Sunset glow', color: 'bg-[#F59E0B]', ring: 'ring-[#F59E0B]' },
  { id: 'ocean', name: 'Ocean abyss', color: 'bg-[#06B6D4]', ring: 'ring-[#06B6D4]' },
  { id: 'purple', name: 'Cyber purple', color: 'bg-[#D946EF]', ring: 'ring-[#D946EF]' },
];

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const activeTheme = themes.find((t) => t.id === theme) || themes[0];

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-full border border-border-main hover:bg-bg-main transition-colors cursor-pointer"
        title="Switch theme"
      >
        <IoColorPaletteOutline className="w-5 h-5 text-text-main" />
        <span className={`w-3.5 h-3.5 rounded-full ${activeTheme.color}`}></span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop cover for clicking out */}
            <div className="fixed inset-0" onClick={() => setIsOpen(false)}></div>
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-48 p-2 rounded-xl glass-effect glow-card shadow-lg z-50"
            >
              <h4 className="text-xs font-semibold text-text-muted px-2 py-1 mb-1.5 uppercase tracking-wider">
                Select Theme
              </h4>
              <div className="space-y-1">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-sm text-text-main hover:bg-bg-main transition-colors cursor-pointer ${
                      theme === t.id ? 'bg-bg-main font-semibold' : ''
                    }`}
                  >
                    <span>{t.name}</span>
                    <span
                      className={`w-4 h-4 rounded-full ${t.color} ${
                        theme === t.id ? `ring-2 ring-offset-2 ${t.ring}` : ''
                      }`}
                    ></span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSelector;
