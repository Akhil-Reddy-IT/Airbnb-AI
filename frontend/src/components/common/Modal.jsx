import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoCloseOutline } from 'react-icons/io5';

const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          ></motion.div>

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="w-full max-w-lg rounded-2xl glass-effect glow-card shadow-2xl p-6 relative z-10 text-left"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-main pb-4 mb-4">
              <h3 className="font-bold text-lg text-text-main">{title}</h3>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-bg-main text-text-muted hover:text-text-main transition-colors cursor-pointer"
              >
                <IoCloseOutline className="w-6 h-6" />
              </button>
            </div>

            {/* Content Body */}
            <div className="max-h-[70vh] overflow-y-auto pr-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
