import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import portada from '../assets/FIGMA/FOTOGRAFIAS/Home/Portada.png';

function HomePage() {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');

    const handleSubscribe = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmedEmail = email.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(trimmedEmail)) {
            setEmailError('Please enter a valid email address.');
            return;
        }

        setEmailError('');
        console.log(trimmedEmail);
    };

    return (
        <main className="w-full flex flex-col items-center bg-white">
            <section className="w-full bg-[#2B2B2B] flex flex-col items-center justify-center py-20 md:py-28 lg:py-36 px-6">
                    <h1
                        className="m-0 text-center text-[36px] sm:text-[48px] md:text-[55px] lg:text-[59px] leading-tight md:leading-15 font-normal tracking-[0.7px] text-white"
                        style={{ fontFamily: 'Crimson Text, serif' }}
                    >
                        Engine File Media
                    </h1>

                    <p
                        className="m-0 mt-5 max-w-121.5 text-center text-[15px] md:text-[17px] italic font-normal leading-[125%] tracking-[0.02em] text-white"
                        style={{ fontFamily: 'Crimson Text, serif' }}
                    >
                        Elevating motorsport history through the lens of engineering and
                        regulatory rigor.
                    </p>

                    <div className="mt-11.25 flex flex-col items-center gap-5">
                        <NavLink
                            to="/volume-i"
                            className="w-60 h-11.25 bg-black text-white no-underline flex items-center justify-center text-center text-[14px] font-bold leading-3.75 tracking-[2.5px] uppercase"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                            Explore Volume I
                        </NavLink>

                        <NavLink
                            to="/about"
                            className="w-59.5 h-11.25 border border-white text-white no-underline flex items-center justify-center text-center text-[14px] font-bold leading-3.75 tracking-[2.5px] uppercase"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                            Discover EFM
                        </NavLink>
                    </div>
            </section>

            {/* Sección 2: Portada + descripción */}
            <section className="w-full bg-white">
            <div className="flex flex-col md:flex-row items-center justify-center gap-16 py-24 px-8 md:px-20">

                {/* Portada — fluid, max 573px */}
                <img
                  src={portada}
                  alt="Volume I Cover"
                  className="w-full max-w-143.25 h-auto shrink-0"
                />

                {/* Frame 9 — fluid, max 454px */}
                <div
                  className="flex flex-col items-start gap-7.25 w-full max-w-113.5"
                >
                    {/* Published */}
                    <p
                    className="m-0 text-[13px] font-normal leading-3.75 tracking-[2.5px] uppercase text-[#0A0A0A]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                    Published February 2026
                    </p>

                    {/* Title */}
                    <h2
                    className="m-0 text-[26px] sm:text-[32px] md:text-[36px] lg:text-[40px] font-semibold leading-tight md:leading-12.75 tracking-[1.1px] text-[#0A0A0A]"
                    style={{ fontFamily: 'Crimson Text, serif' }}
                    >
                    Volume I: World Rally Championship
                    </h2>

                    {/* Subtitle italic */}
                    <p
                    className="m-0 italic font-normal text-[13px] md:text-[15px] leading-5 md:leading-4.5 text-[#0A0A0A]"
                    style={{ fontFamily: 'Crimson Text, serif' }}
                    >
                    A technical and regulatory history of the World Rally Championship, from its formative years to the early 2000s.
                    </p>

                    {/* Body copy */}
                    <p
                    className="m-0 font-normal text-[14px] md:text-[16px] leading-[125%] text-[#0A0A0A]"
                    style={{ fontFamily: 'Crimson Text, serif' }}
                    >
                    This volume analyzes homologation structures, engineering philosophies, and manufacturer decision-making within successive FIA regulatory frameworks, emphasizing the interaction between competition, drivers, regulation, and technological development.
                    </p>

                    {/* Purchase link + arrow */}
                    <div className="flex items-center gap-2">
                    <NavLink
                        to="/volume-i"
                        className="whitespace-nowrap flex items-center text-[14px] font-bold leading-3.75 tracking-[2.5px] uppercase text-[#000000] no-underline"
                        style={{ height: '15px', fontFamily: 'Inter, sans-serif' }}
                    >
                        Purchase Volume I
                    </NavLink>
                    <span
                        className="inline-block w-1.5 h-1.5 border-r-[1.25px] border-t-[1.25px] border-black rotate-45"
                        aria-hidden="true"
                    />
                    </div>
                </div>
            </div>
            </section>

            {/* Sección 3: Seccion Subscripcion */}
            <section className="w-full bg-[#AEAEAE] flex items-center justify-center py-20">
                <div className="w-full max-w-337.5 flex flex-col items-center px-6">
                    <h2
                        className="m-0 text-center text-[22px] md:text-[26px] lg:text-[29px] italic font-medium leading-snug tracking-[0.6px] text-white"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                        Editorial Dispatch
                    </h2>

                    <p
                        className="m-0 mt-9.75 max-w-144.5 text-center text-[15px] md:text-[17px] lg:text-[19px] font-normal leading-[125%] text-white"
                        style={{ fontFamily: 'Crimson Text, serif' }}
                    >
                        Subscribe for bi-weekly dispatches on the technical evolution of contemporary motorsport. Decoding the future of the grid through an technical lens
                    </p>

                    <form className="mt-9.75 flex w-full max-w-108 flex-col items-center" onSubmit={handleSubscribe}>
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => {
                                setEmail(event.target.value);
                                if (emailError) {
                                    setEmailError('');
                                }
                            }}
                            placeholder="youremail@gmail.com"
                            aria-label="Email address"
                            className="w-full h-12 resize-none rounded-md bg-white border-0 px-4 py-2 text-[15px] font-light leading-7 text-black placeholder:text-black/30 outline-none"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                        />

                        {emailError && (
                            <p
                                className="m-0 mt-2 text-[13px] font-medium text-white"
                                style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                                {emailError}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="mt-9.75 w-53.75 h-11 rounded-md border-0 bg-[#696969] text-white text-[16px] font-bold leading-3.75 tracking-[2.5px] uppercase"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                            Subscribe
                        </button>
                    </form>
                </div>
            </section>

            {/* Sección 4: Institutional Purpose / Editorial Scope */}
            <section className="w-full bg-white flex flex-col items-center py-24">

                {/* Rectangle 4 — top line */}
                <div className="w-full max-w-201 h-px bg-[#D9D9D9]" />

                <div className="flex flex-col items-center gap-10 w-full max-w-201 mt-10">
                    <h2
                        className="m-0 w-full text-center text-[24px] md:text-[28px] lg:text-[33px] font-semibold leading-tight tracking-[-0.7px] text-[#0A0A0A]"
                        style={{ fontFamily: 'Crimson Text, serif' }}
                    >
                        Institutional Purpose
                    </h2>

                    <p
                        className="m-0 max-w-156.25 text-center text-[15px] md:text-[17px] lg:text-[18px] font-normal leading-[125%] text-[#0A0A0A]"
                        style={{ fontFamily: 'Crimson Text, serif' }}
                    >
                        Engine File Media documents motorsport through a structured, archival-oriented methodology, focusing on its technical, regulatory, and organizational dimensions.<br/><br/>
                        Each volume is developed through extended research, cross-referenced documentation, and factual verification, prioritizing long-term analytical relevance over immediacy.<br/><br/>
                        All publications are produced under full editorial independence.
                    </p>
                </div>

                {/* Rectangle 5 — separator line */}
                <div className="w-full max-w-201 h-px bg-[#D9D9D9] mt-10" />

                <div className="flex flex-col items-center gap-10 w-full max-w-201 mt-10">
                    <h2
                        className="m-0 text-center text-[24px] md:text-[28px] lg:text-[33px] font-semibold leading-tight tracking-[-0.7px] text-[#0A0A0A]"
                        style={{ fontFamily: 'Crimson Text, serif' }}
                    >
                        Editorial Scope
                    </h2>

                    <p
                        className="m-0 max-w-xl text-center text-[15px] md:text-[17px] lg:text-[18px] font-normal leading-[125%] text-[#0A0A0A]"
                        style={{ fontFamily: 'Crimson Text, serif' }}
                    >
                        Engine File Media operates outside the structures of news media, commercial magazines, lifestyle publishing, and sponsor-driven platforms.<br/><br/>
                        The project is conceived as a long-form editorial archive — independent of advertising cycles, trend-based content, and digital-first consumption models.
                    </p>
                </div>

                {/* Rectangle 6 — bottom line */}
                <div className="w-full max-w-201 h-px bg-[#D9D9D9] mt-10" />

            </section>
        </main>
    );
}

export default HomePage;