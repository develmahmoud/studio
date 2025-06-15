// components/AboutModalTrigger.tsx (or any path you prefer for a component)
import React, { useState, FC, ReactNode } from 'react';

// Define the types for the Modal component's props
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode; // ReactNode can be anything renderable by React (JSX, string, number, etc.)
}

// Modal Component - reusable for any modal content
// Using FC (Function Component) for better type checking
const Modal: FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    // Modal backdrop - fades in/out and closes on click outside
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 transition-opacity duration-300"
      onClick={onClose} // Close when clicking on the backdrop
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      {/* Modal content area */}
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-lg flex flex-col transform scale-95 opacity-0 animate-scale-in transition-all duration-300 ease-out
                   border border-gray-200 dark:border-gray-700 my-auto" // Added my-auto for better vertical centering
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
      >
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 id="modal-title" className="text-2xl font-bold text-gray-800 dark:text-gray-100">About This App</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            aria-label="Close modal"
          >
            {/* Close icon (X) */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Scrollable Content Area */}
        {/* This div now handles scrolling and max height, keeping header/footer visible */}
        <div className="flex-grow overflow-y-auto pr-2" style={{ maxHeight: '80vh' }}>
          {children}
        </div>
        {/* Footer for the modal */}
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700 mt-4 flex-shrink-0">
          <button
            onClick={() => onClose()} // Use onClose to ensure consistency
            className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-70 transition-colors duration-200"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

// AboutModalTrigger Component
// This component provides the button and manages the modal state
const AboutModalTrigger: FC = () => {
  // State to control modal visibility
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  return (
    <>
      {/* Tailwind CSS CDN, Inter Font, and Animation Keyframes (for self-containment in preview) */}
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
      <style>
        {`
          body { font-family: 'Inter', sans-serif; }
          /* Keyframe for modal entry animation */
          @keyframes scaleIn {
            from {
              transform: scale(0.95);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
          .animate-scale-in {
            animation: scaleIn 0.3s ease-out forwards;
          }
        `}
      </style>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {/* Button to open the modal */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-2 py-2 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transform hover:scale-105 transition-all duration-300
                   focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-70"
        aria-controls="about-app-modal"
      >
        About iScholar
      </button>

      {/* The Modal component, conditionally rendered */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {/* Content for the "About This App" modal */}
        <div className="text-gray-700 dark:text-gray-300 space-y-4">
          <p>
            Welcome to <span className='font-bold'>iSight</span> — Your Intelligent Reading Companion
          </p>
          <p>
            This application is designed with <span className="font-bold">accessibility</span> at its core, 
            built specifically for people with visual impairments 
            and let’s be honest students who just want reading made easier.
          </p>
          <p>
            Whether you're trying to understand a textbook, a printed handout, or even an 
            image with embedded text or drawings, this app does the heavy lifting for you.


          </p>
          <p>
            For more details or support, please refer to the main application's documentation.
          </p>
        </div>
      </Modal>
    </>
  );
};

export default AboutModalTrigger;
