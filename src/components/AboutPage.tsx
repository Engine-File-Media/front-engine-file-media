import introHeroImage from '../assets/FIGMA/FOTOGRAFIAS/About/rectangle71240-v8k8-800h.png';
import galleryImageA from '../assets/FIGMA/FOTOGRAFIAS/ABOUT/rectangle71242-2o3l-600w.png';
import galleryImageB from '../assets/FIGMA/FOTOGRAFIAS/About/rectangle81243-2t5r-600h.png';
import galleryImageC from '../assets/FIGMA/FOTOGRAFIAS/About/rectangle91244-06tk-600w.png';
import galleryImageD from '../assets/FIGMA/FOTOGRAFIAS/About/rectangle71246-2hs-400h.png';
import galleryImageE from '../assets/FIGMA/FOTOGRAFIAS/About/rectangle91247-3s6-400h.png';
import galleryImageF from '../assets/FIGMA/FOTOGRAFIAS/About/rectangle81248-v1bl-600w.png';
import wideImage from '../assets/FIGMA/FOTOGRAFIAS/About/rectangle71263-sl9i-800h.png';
import { NavLink } from 'react-router-dom';

const introParagraphs = [
    'Engine File Media is an independent editorial project dedicated to documenting motorsport history through its technical, regulatory, and strategic foundations.',
    'Operating outside the constraints of traditional news or entertainment-driven media, each volume is conceived as a permanent reference-designed to remain relevant beyond seasons, trends, or commercial cycles.',
    'The project approaches motorsport as an ecosystem shaped by engineering decisions and institutional behavior, where long-term competitive outcomes are rarely accidental and never simple.',
];

const editorialApproachIntro =
    'Each publication follows a consistent analytical framework:';

const editorialApproachBullets = [
    'Long-form research spanning multiple regulatory and engineering cycles.',
    'Cross-referenced data utilizing period documentation, technical specifications, and institutional records.',
    'Systemic analysis focused on causality and strategic intent rather than anecdotal history.',
];

const editorialApproachClosingParagraphs = [
    'Narrative elements are used to support technical clarity, never to replace it. Emotional framing and nostalgia-driven language are deliberately avoided in favor of precision, structural understanding, and objective rigor.',
    'The result is an editorial product that prioritizes systemic coherence over engagement metrics, subjective opinion, or immediate consumption.',
];

const whyItExistsParagraphs = [
    'Modern motorsport coverage prioritizes speed, spectacle, and short-form consumption. In this process, technical context, regulatory causality, and long-term strategic thinking are often fragmented or reduced to isolated moments.',
    'Engine File Media exists to address that absence.',
    'Its purpose is to consolidate dispersed technical and regulatory data into coherent editorial volumes-allowing eras, championships, and engineering philosophies to be understood as complete systems rather than disconnected events.',
    'The objective is not only to recount what happened, but to explain why it happened, and how decisions made under constraint shaped the sport\'s evolution.',
];

const editorialIndependenceParagraphs = [
    'Engine File Media operates under absolute editorial independence.',
    'No manufacturer partnerships, commercial sponsorships, or promotional agreements influence the direction of our research, analytical conclusions, or narrative framing.',
    'When necessary, brand involvement is restricted to factual verification and archival clearance. Such cooperation confirms technical accuracy and compliance, not endorsement, positioning, or narrative control.',
    'This separation is fundamental to preserving each volume as a permanent reference document rather than a marketing asset.',
];

const longTermVisionParagraphs = [
    'Engine File Media is developed with long-term continuity as its core objective.',
    'Each volume contributes to a growing technical archive designed for private collections, institutional libraries, and specialist readerships. The project is structured to expand across championships and eras without altering its methodological foundations.',
    'The focus is not scale through volume, but depth through consistency.',
];

const firstGallery = {
    large: galleryImageA,
    top: galleryImageB,
    bottom: galleryImageC,
};

const secondGallery = {
    large: galleryImageF,
    top: galleryImageD,
    bottom: galleryImageE,
};

type TextSectionProps = {
    title: string;
    paragraphs: string[];
    bordered?: boolean;
};

function TextSection({ title, paragraphs, bordered = false }: TextSectionProps) {
    return (
        <section className={bordered ? 'border-t border-black/10' : ''}>
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-20 md:px-10 md:py-24">
                <h2
                    className="text-center text-[36px] leading-tight text-[#0A0A0A] md:text-[40px]"
                    style={{ fontFamily: 'Crimson Text, serif' }}
                >
                    {title}
                </h2>
                <div
                    className="space-y-6 text-[20px] leading-[1.3] text-[#0A0A0A]/65"
                    style={{ fontFamily: 'Crimson Text, serif' }}
                >
                    {paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                    ))}
                </div>
            </div>
        </section>
    );
}

type DarkSectionProps = {
    title: string;
    paragraphs: string[];
};

function DarkSection({ title, paragraphs }: DarkSectionProps) {
    return (
        <section className="bg-[#2A2A2A] text-white">
            <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-6 py-20 text-center md:px-10 md:py-24">
                <h2
                    className="text-[36px] leading-tight md:text-[40px]"
                    style={{ fontFamily: 'Crimson Text, serif' }}
                >
                    {title}
                </h2>
                <div
                    className="max-w-145.5 space-y-6 text-[20px] leading-[1.3] text-white/92"
                    style={{ fontFamily: 'Crimson Text, serif' }}
                >
                    {paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                    ))}
                </div>
            </div>
        </section>
    );
}

type GallerySectionProps = {
    large: string;
    top: string;
    bottom: string;
    reverse?: boolean;
};

function GallerySection({ large, top, bottom, reverse = false }: GallerySectionProps) {
    return (
        <section>
            <div className="mx-auto w-full max-w-303.25 px-6 py-20 md:px-10 md:py-24">
                <div className="grid gap-6 md:grid-cols-[554px_554px] md:justify-center md:items-start">
                    <div className={reverse ? 'order-2' : ''}>
                        <div>
                            <img
                                src={large}
                                alt="About gallery feature"
                                className="block h-auto w-full"
                            />
                        </div>
                    </div>
                    <div className={`grid gap-6 md:flex md:h-full md:flex-col md:justify-between md:gap-0 ${reverse ? 'order-1' : ''}`}>
                        <div>
                            <img
                                src={top}
                                alt="About gallery supporting image"
                                className="block h-auto w-full"
                            />
                        </div>
                        <div>
                            <img
                                src={bottom}
                                alt="About gallery supporting image"
                                className="block h-auto w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function AboutPage() {
    return (
        <main className="bg-white pt-28 text-[#0A0A0A]">
            <section>
                <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-4 md:px-12 md:py-4.25">
                    <div className="space-y-8">
                        <h1
                            className="text-center text-[36px] leading-[124.98%] tracking-[-1.3px] md:text-[36px]"
                            style={{ fontFamily: 'Crimson Text, serif' }}
                        >
                            What is Engine File Media
                        </h1>
                        <div
                            className="space-y-6 text-[20px] leading-[124.98%] tracking-[-1.3px] text-[#0A0A0A]"
                            style={{ fontFamily: 'Crimson Text, serif' }}
                        >
                            {introParagraphs.map((paragraph) => (
                                <p key={paragraph}>{paragraph}</p>
                            ))}
                        </div>
                        <div className="flex justify-center pt-6">
                            <div className="flex items-center gap-2">
                                <NavLink
                                    to="/volume-i"
                                    className="whitespace-nowrap flex items-center text-[14px] font-bold leading-3.75 tracking-[2.5px] uppercase text-[#000000] no-underline"
                                    style={{ height: '15px', fontFamily: 'Inter, sans-serif' }}
                                >
                                    Discover Volume I
                                </NavLink>
                                <span
                                    className="inline-block w-1.5 h-1.5 border-r-[1.25px] border-t-[1.25px] border-black rotate-45"
                                    aria-hidden="true"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <div className="mx-auto w-full max-w-250.75 px-6 py-20 md:px-10 md:py-24">
                    <div className="overflow-hidden bg-[#F5F1EB]">
                        <img
                            src={introHeroImage}
                            alt="Editorial introduction to Engine File Media"
                            className="h-90 w-full object-cover md:h-164.25"
                        />
                    </div>
                </div>
            </section>

            <DarkSection title="Why it exists" paragraphs={whyItExistsParagraphs} />

            <GallerySection {...firstGallery} />

            <section className="border-t border-black/10">
                <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-20 md:px-10 md:py-24">
                    <h2
                        className="text-center text-[36px] leading-tight text-[#0A0A0A] md:text-[40px]"
                        style={{ fontFamily: 'Crimson Text, serif' }}
                    >
                        Editorial Approach
                    </h2>
                    <div
                        className="space-y-6 text-[20px] leading-[1.3] text-[#0A0A0A]/65"
                        style={{ fontFamily: 'Crimson Text, serif' }}
                    >
                        <p>{editorialApproachIntro}</p>
                        <ul className="list-disc space-y-4 pl-6 marker:text-[#0A0A0A]/65">
                            {editorialApproachBullets.map((bullet) => (
                                <li key={bullet}>{bullet}</li>
                            ))}
                        </ul>
                        {editorialApproachClosingParagraphs.map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                        ))}
                    </div>
                </div>
            </section>

            <GallerySection {...secondGallery} reverse />

            <TextSection title="Editorial Independence" paragraphs={editorialIndependenceParagraphs} />

            <section>
                <div className="mx-auto w-full max-w-303.25 px-6 py-20 md:px-10 md:py-24">
                    <div className="overflow-hidden">
                        <img
                            src={wideImage}
                            alt="Long-form editorial archive visual"
                            className="h-80 w-full object-cover md:h-187.25"
                        />
                    </div>
                </div>
            </section>

            <DarkSection title="Long-term Vision" paragraphs={longTermVisionParagraphs} />
        </main>
    );
}

export default AboutPage;