import { NavLink } from 'react-router-dom';

const navLinks = [
    { label: 'HOME', path: '/' },
    { label: 'ABOUT', path: '/about' },
    { label: 'VOLUME I', path: '/volume-i' },
    { label: 'LETTERBOX', path: '/letterbox' },
];

const Navbar = () => {
  return (
    <header className="w-full h-19.5 px-24 py-6 bg-white flex flex-col items-start border-b border-black/10">
      <div className="w-full max-w-6xl flex flex-row items-center justify-between h-7.5">
        {/* Logo */}
        <NavLink to="/" className="w-20 h-7.75 flex flex-col items-start shrink-0">
            <img
                src="src/assets/FIGMA/image.png"
                alt="EFM Logo"
                className="w-20 h-7.75 object-contain"
            />
        </NavLink>
          


        {/* Nav links */}
        <nav className="flex flex-row items-start gap-8 h-4.5">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              style={{ fontFamily: 'Inter, sans-serif' }}
              className={({ isActive }) =>
                `font-medium text-[12px] leading-4.5 tracking-[1.2px] uppercase no-underline transition-colors duration-200 ${
                  isActive ? 'text-[#171717]' : 'text-[#525252]'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
