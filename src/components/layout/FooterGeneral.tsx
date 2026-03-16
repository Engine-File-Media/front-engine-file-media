const FooterGeneral = () => {
    return (
        <footer className="w-full border-t border-black/10 bg-white flex justify-center">
            <div className="w-full max-w-7xl px-6 md:px-12 py-16 md:py-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-32">
                    <div className="flex flex-col items-start gap-8">
                        <h3
                            className="m-0 text-[11px] leading-4 tracking-[1.65px] uppercase text-[#0A0A0A] opacity-30"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                            Engine File Media
                        </h3>

                        <p
                            className="m-0 max-w-77.25 text-[13px] font-light leading-6.25 text-[#0A0A0A] opacity-50"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                            An independent editorial institution documenting the technical and regulatory history of motorsport competition.
                        </p>
                    </div>

                    <div className="flex flex-col items-start gap-8">
                        <h3
                            className="m-0 text-[11px] leading-4 tracking-[1.65px] uppercase text-[#0A0A0A] opacity-30"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                            Correspondence
                        </h3>

                        <a
                            href="mailto:info@enginefilemedia.com"
                            className="text-[13px] font-light leading-5 text-[#0A0A0A] opacity-40 no-underline"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                            info@enginefilemedia.com
                        </a>
                    </div>

                    <div className="flex flex-col items-start gap-8">
                        <h3
                            className="m-0 text-[11px] leading-4 tracking-[1.65px] uppercase text-[#0A0A0A] opacity-30"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                            Legal
                        </h3>

                        <div className="flex flex-col items-start gap-2.75">
                            <a
                                href="#"
                                className="text-[13px] font-light leading-5 text-[#0A0A0A] opacity-40 no-underline"
                                style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                                Terms
                            </a>
                            <a
                                href="#"
                                className="text-[13px] font-light leading-5 text-[#0A0A0A] opacity-40 no-underline"
                                style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                                Privacy
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-20 pt-10 border-t border-black/5 opacity-30">
                    <p
                        className="m-0 text-[10px] leading-3.75 tracking-[0.25px] text-[#0A0A0A]"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                        © 2026 Engine File Media
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default FooterGeneral;