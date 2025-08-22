"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  maxWidth?: string;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  maxWidth = "max-w-lg",
}: ModalProps) {
  // Prevent background scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black z-40"
            onClick={onClose}
          />

          {/* Modal container */}
          <motion.div
            key="modal"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            onClick={onClose}
          >
            <div
              className={`relative w-full ${maxWidth} rounded-2xl bg-white shadow-lg p-6`}
              onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
            >
              {/* Close button */}
              <button
                className="absolute top-3 right-4 text-gray-500 hover:text-black transition"
                onClick={onClose}
                aria-label="Close modal"
              >
                &times;
              </button>

              {/* Title */}
              {title && (
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  {title}
                </h2>
              )}

              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
