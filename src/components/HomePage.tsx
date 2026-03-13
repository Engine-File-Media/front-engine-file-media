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
            <section className="relative w-full h-157 bg-[#2B2B2B] overflow-hidden">
                <div
                    className="absolute w-132 h-47.25 flex flex-col items-center gap-5"
                    style={{ left: 'calc(50% - 265px)', top: '229px' }}
                >
                    <h1
                        className="m-0 w-132 h-23 flex items-center justify-center text-center text-[59px] leading-15 font-normal tracking-[0.7px] text-white"
                        style={{ fontFamily: 'Crimson Text, serif' }}
                    >
                        Engine File Media
                    </h1>

                    <p
                        className="m-0 w-121.5 h-15.75 flex items-center justify-center text-center text-[17px] italic font-normal leading-[125%] tracking-[0.02em] text-white"
                        style={{ fontFamily: 'Crimson Text, serif' }}
                    >
                        Elevating motorsport history through the lens of engineering and
                        regulatory rigor.
                    </p>

                    <div
                        className="absolute w-125 h-11.25"
                        style={{ left: '14px', top: '216px' }}
                    >
                        <NavLink
                            to="/volume-i"
                            className="absolute left-32.5 top-0 w-60 h-11.25 bg-black text-white no-underline flex items-center justify-center text-center text-[14px] font-bold leading-3.75 tracking-[2.5px] uppercase"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                            Explore Volume I
                        </NavLink>

                        <NavLink
                            to="/about"
                            className="absolute left-32.75 top-[78.19px] w-59.5 h-[44.62px] border border-white text-white no-underline flex items-center justify-center text-center text-[14px] font-bold leading-3.75 tracking-[2.5px] uppercase"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                            Discover EFM
                        </NavLink>
                    </div>
                </div>
            </section>

            {/* Sección 2: Portada + descripción */}
            <section className="w-full bg-white">
            <div className="flex flex-row items-center justify-center gap-16 py-24 px-20">

                {/* Portada — 573×430 */}
                <img
                  src={portada}
                  alt="Volume I Cover"
                  className="object-cover shrink-0"
                  style={{ width: '573px', height: '430px' }}
                />

                {/* Frame 9 — 454×430 */}
                <div
                  className="flex flex-col items-start gap-7.25 shrink-0"
                  style={{ width: '454px', height: '430px' }}
                >
                    {/* Published */}
                    <p
                    className="m-0 w-113.5 h-3.75 flex items-center text-[13px] font-normal leading-3.75 tracking-[2.5px] uppercase text-[#0A0A0A]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                    Published February 2026
                    </p>

                    {/* Title */}
                    <h2
                    className="m-0 flex items-center text-[40px] font-semibold leading-12.75 tracking-[1.1px] text-[#0A0A0A]"
                    style={{ width: '454.41px', height: '103px', fontFamily: 'Crimson Text, serif' }}
                    >
                    Volume I: World Rally Championship
                    </h2>

                    {/* Subtitle italic */}
                    <p
                    className="m-0 italic font-normal text-[15px] leading-4.5 text-[#0A0A0A] flex items-center"
                    style={{ width: '454.41px', height: '36px', fontFamily: 'Crimson Text, serif' }}
                    >
                    A technical and regulatory history of the World Rally Championship, from its formative years to the early 2000s.
                    </p>

                    {/* Body copy */}
                    <p
                    className="m-0 font-normal text-[16px] leading-[125%] text-[#0A0A0A] flex items-center"
                    style={{ width: '454px', height: '80px', fontFamily: 'Crimson Text, serif' }}
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
            <section className="w-full h-105.75 bg-[#AEAEAE] flex items-center justify-center">
                <div className="w-full max-w-337.5 h-full flex flex-col items-center pt-20">
                    <h2
                        className="m-0 w-63.5 h-4.5 text-center text-[29px] italic font-medium leading-4.5 tracking-[0.6px] text-white flex items-center justify-center"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                        Editorial Dispatch
                    </h2>

                    <p
                        className="m-0 mt-9.75 w-144.5 h-18 text-center text-[19px] font-normal leading-[125%] text-white flex items-center justify-center"
                        style={{ fontFamily: 'Crimson Text, serif' }}
                    >
                        Subscribe for bi-weekly dispatches on the technical evolution of contemporary motorsport. Decoding the future of the grid through an technical lens
                    </p>

                    <form className="mt-9.75 flex flex-col items-center" onSubmit={handleSubscribe}>
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
                            className="w-120.25 h-11 resize-none rounded-3xl bg-white border-0 px-4 py-2 text-[15px] font-light leading-7 text-black placeholder:text-black/30 outline-none"
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
                            className="mt-9.75 w-53.75 h-11 rounded-3xl border-0 bg-[#696969] text-white text-[16px] font-bold leading-3.75 tracking-[2.5px] uppercase"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                            Subscribe
                        </button>
                    </form>
                </div>
            </section>

            {/* Sección 4: Institutional Purpose / Editorial Scope */}
            <section className="w-full bg-white flex flex-col items-center py-24">

                {/* Frame 10 — 804px flex col, gap 50px */}
                <div className="flex flex-col items-center gap-12.5 w-201">

                    {/* Rectangle 4 — top line */}
                    <div className="w-full h-px bg-[#D9D9D9]" />

                    {/* Institutional Purpose */}
                    <h2
                        className="m-0 w-full h-9.25 flex items-center justify-center text-center text-[33px] font-semibold leading-9 tracking-[-0.7px] text-[#0A0A0A]"
                        style={{ fontFamily: 'Crimson Text, serif' }}
                    >
                        Institutional Purpose
                    </h2>

                    {/* Methodology body paragraph — 625px centered */}
                    <p
                        className="m-0 w-156.25 h-40.25 text-center text-[18px] font-normal leading-[125%] text-[#0A0A0A] flex items-center"
                        style={{ fontFamily: 'Crimson Text, serif' }}
                    >
                        Engine File Media documents motorsport through a structured, archival-oriented methodology, focusing on its technical, regulatory, and organizational dimensions. Each volume is developed through extended research, cross-referenced documentation, and factual verification, prioritizing long-term analytical relevance over immediacy. All publications are produced under full editorial independence.
                    </p>

                    {/* Rectangle 5 — separator line */}
                    <div className="w-full h-px bg-[#D9D9D9]" />

                    {/* Editorial Scope heading */}
                    <h2
                        className="m-0 w-48.5 h-9.25 flex items-center justify-center text-center text-[33px] font-semibold leading-9 tracking-[-0.7px] text-[#0A0A0A]"
                        style={{ fontFamily: 'Crimson Text, serif' }}
                    >
                        Editorial Scope
                    </h2>

                </div>

                {/* Frame 11 — 576px editorial independence text */}
                <div className="flex flex-row items-start p-2.5 gap-2.5 w-xl h-48.75 mt-16.75">
                    <p
                        className="m-0 w-xl h-34.5 text-center text-[18px] font-normal leading-[125%] text-[#0A0A0A] flex items-center"
                        style={{ fontFamily: 'Crimson Text, serif' }}
                    >
                        Engine File Media operates outside the structures of news media, commercial magazines, lifestyle publishing, and sponsor-driven platforms. The project is conceived as a long-form editorial archive — independent of advertising cycles, trend-based content, and digital-first consumption models.
                    </p>
                </div>

                {/* Rectangle 6 — bottom line */}
                <div className="w-201 h-px bg-[#D9D9D9] mt-22.25" />

            </section>
        </main>
    );
}

export default HomePage;