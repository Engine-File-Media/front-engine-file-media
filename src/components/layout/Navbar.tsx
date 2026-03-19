import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../../assets/FIGMA/image.webp';

const mainNavLinks = [
    { label: 'HOME', path: '/' },
    { label: 'ABOUT', path: '/about' },
    { label: 'JOURNAL', path: '/journal' },
];

const volumeLinks = [
    { label: 'VOLUME I', path: '/volume-i' },
    // Volumenes futuros aquí
    // { label: 'VOLUME II', path: '/volume-ii' },
];

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [desktopVolumesOpen, setDesktopVolumesOpen] = useState(false);
    const [mobileVolumesOpen, setMobileVolumesOpen] = useState(false);

    const closeMobileMenu = () => {
        setMenuOpen(false);
        setMobileVolumesOpen(false);
    }

    return (
        <header className="w-full bg-white border-b border-black/10">
            <div className="w-full px-5 py-7.75 md:px-24 md:py-6 flex flex-row items-center justify-between h-20 md:h-19.5">
                {/* Logo */}
                <NavLink to="/" className="flex items-center shrink-0">
                    <img src={logo} alt="EFM Logo" className="w-20 h-7.75 object-contain" />
                </NavLink>

                {/* Desktop nav links */}
                <nav className="hidden md:flex flex-row items-center gap-8 h-4.5">
                    {mainNavLinks.map((link) => (
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

                    <div
                        className="relative"
                        onMouseEnter={() => setDesktopVolumesOpen(true)}
                        onMouseLeave={() => setDesktopVolumesOpen(false)}
                    >
                        <button
                            type="button"
                            onClick={() => setDesktopVolumesOpen((v) => !v)}
                            style={{ fontFamily: 'Inter, sans-serif' }}
                            className="font-medium text-[12px] leading-4.5 tracking-[1.2px] uppercase text-[#525252] no-underline transition-colors duration-200 hover:text-[#171717] flex items-center gap-2"
                            aria-expanded={desktopVolumesOpen}
                            aria-haspopup="menu"
                            aria-label="Abrir menú de volúmenes"
                        >
                            VOLUMES
                            <span
                                className={`text-[10px] transition-transform duration-200 ${
                                    desktopVolumesOpen ? 'rotate-180' : ''}`}
                            >
                                ▼
                            </span>
                        </button>
                        {desktopVolumesOpen && (
                            <div className="absolute left-0 top-full pt-2 z-30">
                                <div className="min-w-40 bg-white border border-black/10 shadow-sm">
                                    {volumeLinks.map((volume) => (
                                        <NavLink
                                            key={volume.path}
                                            to={volume.path}
                                            onClick={() => setDesktopVolumesOpen(false)}
                                            style={{ fontFamily: 'Inter, sans-serif' }}
                                            className={({ isActive }) =>
                                                `block px-4 py-3 font-medium text-[12px] tracking-[1.2px] uppercase no-underline transition-colors duration-200 border-b last:border-b-0 border-black/5 ${
                                                    isActive
                                                        ? 'text-[#171717] bg-black/2'
                                                        : 'text-[#525252] hover:text-[#171717]'
                                                }`
                                            }
                                        >
                                            {volume.label}
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </nav>

                {/* Hamburger — mobile only */}
                <button
                    className="md:hidden flex flex-col justify-center items-center gap-1.75 w-6 h-5 bg-transparent border-0 cursor-pointer p-0"
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                    aria-expanded={menuOpen}
                >
                    <span className={`block w-4.5 h-px bg-[#171717] transition-all duration-200 origin-center ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                    <span className={`block w-4.5 h-px bg-[#171717] transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
                    <span className={`block w-4.5 h-px bg-[#171717] transition-all duration-200 origin-center ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </button>
            </div>

            {/* Mobile dropdown */}
            {menuOpen && (
                <nav className="md:hidden flex flex-col px-6 pb-6 gap-0 border-t border-black/10">
                    {mainNavLinks.map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            onClick={closeMobileMenu}
                            style={{ fontFamily: 'Inter, sans-serif' }}
                            className={({ isActive }) =>
                                `font-medium text-[14px] leading-5 tracking-[1.2px] uppercase no-underline transition-colors duration-200 py-4 border-b border-black/5 ${
                                    isActive ? 'text-[#171717]' : 'text-[#525252]'
                                }`
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}

                    <button
                        type="button"
                        onClick={() => setMobileVolumesOpen((v) => !v)}
                        style={{ fontFamily: 'Inter, sans-serif' }}
                        className="w-full text-left font-medium text-[14px] leading-5 tracking-[1.2px] uppercase text-[#525252] transition-colors duration-200 py-4 border-b border-black/5 flex items-center justify-between"
                        aria-expanded={mobileVolumesOpen}
                        aria-controls="mobile-volumes-list"
                    >
                        Volumes
                        <span className={`text-[10px] transition-transform duration-200 ${mobileVolumesOpen ? 'rotate-180' : ''}`}>
                            ▼
                        </span>
                    </button>

                    {mobileVolumesOpen && (
                        <div id="mobile-volumes-list" className="flex flex-col border-b border-black/5">
                            {volumeLinks.map((volume) => (
                                <NavLink
                                    key={volume.path}
                                    to={volume.path}
                                    onClick={closeMobileMenu}
                                    style={{ fontFamily: 'Inter, sans-serif' }}
                                    className={({ isActive }) =>
                                        `font-medium text-[13px] leading-5 tracking-[1.1px] uppercase no-underline transition-colors duration-200 py-3 pl-4 border-t border-black/5 ${
                                            isActive ? 'text-[#171717]' : 'text-[#525252]'
                                        }`
                                    }
                                >
                                    {volume.label}
                                </NavLink>
                            ))}
                        </div>
                    )}
                </nav>
            )}
        </header>
    );
};

export default Navbar;
