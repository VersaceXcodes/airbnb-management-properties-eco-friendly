import React from 'react';
import { Link } from 'react-router-dom';

const GV_Footer: React.FC = () => (
  <>
    <footer className="bg-gray-800 text-white fixed bottom-0 w-full py-6">
      <div className="container mx-auto flex justify-between items-start px-4 md:px-8">
        {/* Left Section: Legal Links */}
        <div className="flex flex-col">
          <Link to="/contact-us" className="text-gray-400 hover:text-white text-sm" aria-label="Contact Us">
            Contact Us
          </Link>
          <Link to="/terms-of-service" className="text-gray-400 hover:text-white text-sm" aria-label="Terms of Service">
            Terms of Service
          </Link>
          <Link to="/privacy-policy" className="text-gray-400 hover:text-white text-sm" aria-label="Privacy Policy">
            Privacy Policy
          </Link>
        </div>

        {/* Right Section: Social Media Links */}
        <div className="flex space-x-4">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <svg className="w-6 h-6 text-gray-400 hover:text-white" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M22.675 0H1.325C.593 0 0 .6 0 1.349v21.302A1.354 1.354 0 001.325 24h11.499v-9.293H9.847v-3.622h2.977V7.413c0-3.056 1.852-4.728 4.621-4.728 1.314 0 2.444.097 2.77.141v3.214l-1.904.001c-1.494 0-1.783.711-1.783 1.751v2.299h3.565l-.465 3.622H16.53V24h6.145A1.354 1.354 0 0024 22.651V1.349A1.352 1.352 0 0022.675 0z" />
            </svg>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
            <svg className="w-6 h-6 text-gray-400 hover:text-white" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M24 4.56c-.89.39-1.82.65-2.81.77 1.01-.61 1.79-1.56 2.15-2.7-.95.56-2 .97-3.12 1.19a4.92 4.92 0 00-8.39 4.49A13.957 13.957 0 011.67 3.15a4.93 4.93 0 001.52 6.56c-.8-.03-1.56-.245-2.23-.61-.06 2.28 1.6 4.41 3.88 4.85-.69.187-1.42.21-2.15.08a4.93 4.93 0 004.6 3.41A9.875 9.875 0 010 19.54a13.95 13.95 0 007.548 2.208c9.056 0 14.01-7.514 14.01-14.01 0-.213-.005-.425-.015-.637A10.044 10.044 0 0024 4.56z" />
            </svg>
          </a>
          {/* Additional Social Icons e.g., Instagram, LinkedIn */}
          {/* Add more social media links similarly with appropriate aria-labels */}
        </div>
      </div>
    </footer>
  </>
);

export default GV_Footer;