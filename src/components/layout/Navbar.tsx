import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../../assets/FIGMA/image.png';

const navLinks = [
    { label: 'HOME', path: '/' },
    { label: 'ABOUT', path: '/about' },
    { label: 'VOLUME I', path: '/volume-i' },
    { label: 'LETTERBOX', path: '/letterbox' },
];

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="w-full bg-white border-b border-black/10">
            <div className="w-full px-6 md:px-24 py-6 flex flex-row items-center justify-between h-19.5">
                {/* Logo */}
                <NavLink to="/" className="flex items-center shrink-0">
                    <img src={logo} alt="EFM Logo" className="w-20 h-7.75 object-contain" />
                </NavLink>

                {/* Desktop nav links */}
                <nav className="hidden md:flex flex-row items-center gap-8 h-4.5">
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

                {/* Hamburger — mobile only */}
                <button
                    className="md:hidden flex flex-col justify-center items-center gap-1.5 w-8 h-8 bg-transparent border-0 cursor-pointer p-0"
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                >
                    <span className={`block w-5 h-px bg-[#171717] transition-all duration-200 origin-center ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                    <span className={`block w-5 h-px bg-[#171717] transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
                    <span className={`block w-5 h-px bg-[#171717] transition-all duration-200 origin-center ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
                </button>
            </div>

            {/* Mobile dropdown */}
            {menuOpen && (
                <nav className="md:hidden flex flex-col px-6 pb-6 gap-0 border-t border-black/10">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            onClick={() => setMenuOpen(false)}
                            style={{ fontFamily: 'Inter, sans-serif' }}
                            className={({ isActive }) =>
                                `font-medium text-[12px] leading-4.5 tracking-[1.2px] uppercase no-underline transition-colors duration-200 py-4 border-b border-black/5 ${
                                    isActive ? 'text-[#171717]' : 'text-[#525252]'
                                }`
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}
                </nav>
            )}
        </header>
    );
};

export default Navbar;
