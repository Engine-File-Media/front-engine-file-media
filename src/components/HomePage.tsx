import { NavLink } from 'react-router-dom';

function HomePage() {
    return (
        <main className="w-full flex justify-center bg-white">
            <section className="relative w-337.5 h-174 bg-white overflow-hidden">
                <div className="absolute left-0 top-17 w-338 h-157 bg-[#2B2B2B]" />

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
        </main>
    );
}

export default HomePage;