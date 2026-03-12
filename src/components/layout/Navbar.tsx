import { useState } from 'react';

const navLinks = ['HOME', 'ABOUT', 'VOLUME I', 'LETTERBOX'];

const Navbar = () => {
  const [activeLink, setActiveLink] = useState('LETTERBOX');

  return (
    <header className="w-full h-19.5 px-24 py-6 bg-white flex flex-col items-start">
      <div className="w-full max-w-6xl flex flex-row items-center justify-between h-7.5">
        {/* Logo */}
        <a href="#" className="w-20 h-7.75 flex flex-col items-start shrink-0">
          <img
            src="src/assets/FIGMA/image.png"
            alt="EFM Logo"
            className="w-20 h-7.75 object-contain"
          />
        </a>

        {/* Nav links */}
        <nav className="flex flex-row items-start gap-8 h-4.5">
          {navLinks.map((link) => (
            <a
              key={link}
              href="#"
              style={{ fontFamily: 'Inter, sans-serif' }}
              className={`font-medium text-[12px] leading-4.5 tracking-[1.2px] uppercase no-underline transition-colors duration-200 ${
                activeLink === link ? 'text-[#171717]' : 'text-[#525252]'
              }`}
              onClick={(e) => {
                e.preventDefault();
                setActiveLink(link);
              }}
            >
              {link}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
