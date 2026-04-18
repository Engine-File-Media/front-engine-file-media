//import { useState } from 'react';

import { NavLink } from 'react-router-dom';
import { assetsUrls } from '../../assets';

function HomePage() {
    // const [email, setEmail] = useState('');
    // const [emailError, setEmailError] = useState('');

    // const handleSubscribe = (event: React.FormEvent<HTMLFormElement>) => {
    //     event.preventDefault();

    //     const trimmedEmail = email.trim();
    //     const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    //     if (!emailPattern.test(trimmedEmail)) {
    //         setEmailError('Please enter a valid email address.');
    //         return;
    //     }

    //     setEmailError('');
    //     console.log(trimmedEmail);
    // };

    return (
        <main className="w-full max-w-full overflow-x-hidden flex flex-col items-center bg-white">
            <section className="relative w-full overflow-hidden flex flex-col items-center px-7.5 py-28 md:py-30 lg:py-36">
                <video
                    className="absolute inset-0 h-full w-full object-cover"
                    src={assetsUrls.home.bgVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    aria-hidden="true"
                />
                <div className="absolute inset-0 bg-[#2B2B2B]/60" aria-hidden="true" />

                <h1
                    className="relative z-10 m-0 text-center text-[43px] leading-15 tracking-[0.7px] text-white md:text-[52px] lg:text-[59px]"
                    style={{ fontFamily: 'Crimson Text, serif' }}
                >
                    Engine File Media
                </h1>

                <p
                    className="relative z-10 m-0 mt-3 max-w-55.5 text-center text-[13px] italic font-normal leading-[125%] tracking-[0.02em] text-white md:mt-5 md:max-w-90 md:text-[15px] lg:max-w-121.5 lg:text-[17px]"
                    style={{ fontFamily: 'Crimson Text, serif' }}
                >
                    Elevating motorsport history through the lens of engineering and regulatory rigor.
                </p>

                <div className="relative z-10 mt-15 flex flex-col items-center gap-4.5 md:mt-11.25 md:gap-5">
                    <NavLink
                        to="/volume-i"
                        className="w-49.5 h-9.25 bg-black text-white no-underline flex items-center justify-center text-center text-[12px] font-bold leading-3.75 tracking-[2.5px] uppercase md:w-60 md:h-11.25 md:text-[14px]"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                        Explore Volume I
                    </NavLink>

                    <NavLink
                        to="/about"
                        className="w-36 h-5.75 border border-white text-white no-underline flex items-center justify-center text-center text-[12px] font-bold leading-3.75 tracking-[2.5px] uppercase md:w-59.5 md:h-11.25 md:text-[14px]"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                        Discover EFM
                    </NavLink>
                </div>
            </section>

            <section className="w-full bg-white">
                <div className="mx-auto flex w-full max-w-97.5 flex-col items-center px-0 pb-23.5 pt-5 md:max-w-337.5 md:flex-row md:items-center md:gap-16 md:px-20 md:py-24">
                    <img
                        src={assetsUrls.home.portada}
                        alt="Volume I Cover"
                        className="mx-auto block w-auto max-w-full h-auto md:max-w-[45%] md:shrink"
                    />

                    <div className="mt-7 flex w-full max-w-82.25 flex-col items-center gap-5 px-4 text-center md:mt-0 md:min-w-0 md:max-w-113.5 md:items-start md:px-0 md:text-left">
                        <p
                            className="m-0 text-[12.5px] font-normal leading-3.75 tracking-[4.5px] uppercase text-[#0A0A0A] md:text-[13px] md:tracking-[2.5px]"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                            Published February 2026
                        </p>

                        <h2
                            className="m-0 text-[26px] font-semibold leading-8 tracking-[1.5px] text-[#0A0A0A] md:text-[36px] md:leading-tight lg:text-[40px]"
                            style={{ fontFamily: 'Crimson Text, serif' }}
                        >
                            Volume I: World Rally Championship
                        </h2>

                        <p
                            className="m-0 max-w-75 italic font-normal text-[13px] leading-[120%] text-[#0A0A0A]/60 md:max-w-113.5 md:text-[15px]"
                            style={{ fontFamily: 'Crimson Text, serif' }}
                        >
                            A technical and regulatory history of the World Rally Championship, from its formative years to the early 2000s.
                        </p>

                        <p
                            className="m-0 max-w-82.5 font-normal text-[15px] leading-[125%] tracking-[0.01em] text-[#0A0A0A] md:max-w-113.5 md:text-[16px]"
                            style={{ fontFamily: 'Crimson Text, serif' }}
                        >
                            This volume analyzes homologation structures, engineering philosophies, and manufacturer decision-making within successive FIA regulatory frameworks, emphasizing the interaction between competition, drivers, regulation, and technological development.
                        </p>

                        <div className="flex items-center gap-2">
                            <NavLink
                                to="/volume-i"
                                className="whitespace-nowrap flex items-center text-[12px] font-bold leading-3.75 tracking-[2.5px] uppercase text-[#272727] no-underline md:text-[14px]"
                                style={{ height: '15px', fontFamily: 'Inter, sans-serif' }}
                            >
                                Explore The Volume
                            </NavLink>
                            <span
                                className="inline-block w-1.5 h-1.5 border-r-[1.25px] border-t-[1.25px] border-black rotate-45"
                                aria-hidden="true"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* <section className="w-full bg-[#AEAEAE] flex items-center justify-center py-4 md:py-20">
                <div className="w-full max-w-99.5 flex flex-col items-center px-5.5 py-4 md:max-w-337.5 md:px-6">
                    <h2
                        className="m-0 text-center text-[21px] italic font-medium leading-4.5 tracking-[0.6px] text-white md:text-[26px] lg:text-[29px]"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                        Editorial Dispatch
                    </h2>

                    <p
                        className="m-0 mt-4.5 max-w-87 text-center text-[15px] font-normal leading-[125%] text-white md:mt-9.75 md:max-w-144.5 md:text-[17px] lg:text-[19px]"
                        style={{ fontFamily: 'Crimson Text, serif' }}
                    >
                        Subscribe for bi-weekly dispatches on the technical evolution of contemporary motorsport. Decoding the future of the grid through an technical lens
                    </p>

                    <form className="mt-4.5 flex w-full max-w-73 flex-col items-center md:mt-9.75 md:max-w-108" onSubmit={handleSubscribe}>
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
                            className="w-full h-8.25 resize-none rounded-xl bg-white border-0 px-3 py-1 text-[10px] font-light leading-7 text-black placeholder:text-black/30 outline-none md:h-12 md:rounded-md md:px-4 md:py-2 md:text-[15px]"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                        />

                        {emailError && (
                            <p
                                className="m-0 mt-2 text-[12px] font-medium text-white md:text-[13px]"
                                style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                                {emailError}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="mt-4.5 w-37.5 h-9.5 rounded-xl border-0 bg-[#696969] text-white text-[12.5px] font-bold leading-5.25 tracking-[1.5px] uppercase md:mt-9.75 md:w-53.75 md:h-11 md:rounded-md md:text-[16px] md:leading-3.75 md:tracking-[2.5px]"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                            Subscribe
                        </button>
                    </form>
                </div>
            </section> */}

            <section className="w-full bg-white flex flex-col items-center py-10 md:py-24">
                <div className="w-full max-w-71 h-px bg-[#D9D9D9] md:max-w-201" />

                <div className="flex flex-col items-center gap-7.25 w-full max-w-92 mt-10 md:gap-10 md:max-w-201">
                    <h2
                        className="m-0 w-full text-center text-[26px] md:text-[28px] lg:text-[33px] font-semibold leading-9 tracking-[1.5px] md:tracking-[-0.7px] text-[#0A0A0A]"
                        style={{ fontFamily: 'Crimson Text, serif' }}
                    >
                        Institutional Purpose
                    </h2>

                    <p
                        className="m-0 max-w-86.25 text-center text-[15px] md:text-[17px] lg:text-[18px] font-normal leading-[125%] text-[#0A0A0A]"
                        style={{ fontFamily: 'Crimson Text, serif' }}
                    >
                        Engine File Media documents motorsport through a structured, archival-oriented methodology, focusing on its technical, regulatory, and organizational dimensions.<br/><br/>
                        Each volume is developed through extended research, cross-referenced documentation, and factual verification, prioritizing long-term analytical relevance over immediacy.<br/><br/>
                        All publications are produced under full editorial independence.
                    </p>
                </div>

                <div className="w-full max-w-71 h-px bg-[#D9D9D9] mt-10 md:max-w-201" />

                <div className="flex flex-col items-center gap-7.25 w-full max-w-92 mt-10 md:gap-10 md:max-w-201">
                    <h2
                        className="m-0 w-full text-center text-[26px] md:text-[28px] lg:text-[33px] font-semibold leading-9 tracking-[1.5px] md:tracking-[-0.7px] text-[#0A0A0A]"
                        style={{ fontFamily: 'Crimson Text, serif' }}
                    >
                        Editorial Scope
                    </h2>

                    <p
                        className="m-0 max-w-86.25 text-center text-[15px] md:text-[17px] lg:text-[18px] font-normal leading-[125%] text-[#0A0A0A]"
                        style={{ fontFamily: 'Crimson Text, serif' }}
                    >
                        Engine File Media operates outside the structures of news media, commercial magazines, lifestyle publishing, and sponsor-driven platforms.<br/><br/>
                        The project is conceived as a long-form editorial archive - independent of advertising cycles, trend-based content, and digital-first consumption models.
                    </p>
                </div>

                <div className="w-full max-w-71 h-px bg-[#D9D9D9] mt-10 md:max-w-201" />
            </section>
        </main>
    );
}

export default HomePage;

