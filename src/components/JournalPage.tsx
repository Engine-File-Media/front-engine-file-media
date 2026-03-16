function JournalPage() {
    return (
        <main className="w-full bg-white">
            <section className="w-full border-b border-black/10 px-6 py-16 md:px-14 md:py-20 lg:px-24 lg:py-24">
                <div className="mx-auto w-full max-w-7xl">
                    <div className="max-w-4xl">
                        <h1
                            className="m-0 text-[44px] font-medium leading-[104%] tracking-[-0.8px] text-[#171717] md:text-[58px] lg:text-[72px]"
                            style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                            The Engine File Journal
                        </h1>

                        <p
                            className="m-0 mt-5 text-[18px] font-normal leading-[160%] tracking-[-0.22px] text-[#262626] md:text-[22px]"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                            Technical and regulatory intelligence for the architecture of motorsport.
                        </p>

                        <p
                            className="m-0 mt-5 max-w-3xl text-[15px] font-normal leading-[170%] text-[#525252] md:text-[17px]"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                            A structured archive of analytical research examining engineering systems, regulatory
                            frameworks, competitive dynamics, and institutional evolution across international
                            motorsport competition.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            {[
                                'All Research',
                                'Technical Frameworks',
                                'Regulatory Frameworks',
                                'Industrial & Institutional Dynamics',
                                'Archival Research',
                                'Strategic Methodology',
                            ].map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center border border-[#D4D4D4] bg-white px-3 py-1.5 text-[10px] font-medium uppercase tracking-[1px] text-[#737373]"
                                    style={{ fontFamily: 'Inter, sans-serif' }}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="w-full bg-white px-6 py-20 md:px-14 md:py-24 lg:px-24 lg:py-28">
                <div className="mx-auto w-full max-w-7xl border border-black/10 bg-[#FAFAFA] px-6 py-12 md:px-10 md:py-14">
                    <p
                        className="m-0 text-[11px] font-semibold uppercase tracking-[1.32px] text-[#525252]"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                        Journal Status
                    </p>

                    <h2
                        className="m-0 mt-4 text-[36px] font-medium leading-[108%] tracking-[-0.7px] text-[#171717] md:text-[48px]"
                        style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                        Coming Soon
                    </h2>

                    <p
                        className="m-0 mt-4 max-w-3xl text-[15px] font-medium leading-[170%] text-[#404040] md:text-[17px]"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                        We are finalizing the first long-form journal entries and editorial taxonomy.
                        Publication opens soon with flagship analysis, featured research, and archive entries.
                    </p>

                </div>
            </section>
        </main>
    );
}

export default JournalPage;