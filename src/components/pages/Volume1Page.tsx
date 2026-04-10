import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import bookMockupCovers from '../../assets/FIGMA/FOTOGRAFIAS/VOL. I PAGINA/BOOK-MOCKUP-COVERS.webp';
import indiceImage from '../../assets/FIGMA/FOTOGRAFIAS/VOL. I PAGINA/INDICE.webp';
import capituloAudiImage from '../../assets/FIGMA/FOTOGRAFIAS/VOL. I PAGINA/CAPITULO AUDI.webp';
import introduccionImage from '../../assets/FIGMA/FOTOGRAFIAS/VOL. I PAGINA/introduccion.webp';
import { getBooksPricing } from '../../api/payments';
import type { ApiError, BookPricing } from '../../api/types';

const defaultBookId = 'volume-i';

const formatMoney = (value: number, currency: string) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
    }).format(value);

const keyThemes = [
    {
        title: 'Regulatory Frameworks',
        description: 'Analysis of FIA rule structures and their long-term technical consequences.',
    },
    {
        title: 'Engineering Evolution',
        description: 'From Group 4 to Group A and beyond. A focus on technical responses to shifting constraints.',
    },
    {
        title: 'Manufacturer Strategy',
        description: 'How brands interpreted, exploited, or resisted competition environments.',
    },
    {
        title: 'Regulatory Inflection Points',
        description: 'Documentation of the technical disputes and controversies that reshaped the WRC.',
    },
];

const distinguishingPoints = [
    'Long-term research conducted across international motorsport archives and period documentation',
    'Regulatory material cross-referenced with engineering outcomes and competitive context',
    'Technical sections reviewed by former manufacturer personnel and industry professionals',
    'Editorial independence, allowing critical examination beyond commercial or promotional narratives',
];

const physicalSpecs = [
    { label: 'Binding', value: 'Hardcover' },
    { label: 'Page Count', value: '171 pages' },
    { label: 'Paper Stock', value: '80gsm uncoated' },
    { label: 'Layout', value: 'Three columns' },
    { label: 'Dimensions', value: '215.9 x 279.4 mm' },
];

function Volume1Page() {
    const [selectedBook, setSelectedBook] = useState<BookPricing | null>(null);
    const [isPriceLoading, setIsPriceLoading] = useState(true);
    const [priceError, setPriceError] = useState('');

    useEffect(() => {
        const loadPricing = async () => {
            try {
                const response = await getBooksPricing();
                const match =
                    response.books.find((book) => book.id === defaultBookId) ??
                    response.books[0] ??
                    null;
                setSelectedBook(match);
            } catch (error) {
                const parsedError = error as ApiError;
                setPriceError(parsedError.message || 'Unable to load pricing.');
            } finally {
                setIsPriceLoading(false);
            }
        };

        void loadPricing();
    }, []);

    const currency = selectedBook?.currency ?? 'USD';
    const basePrice = selectedBook?.price ?? 0;
    const effectivePrice = selectedBook?.effectivePrice ?? 0;
    const showSale =
        Boolean(selectedBook?.sale) &&
        (selectedBook?.discount ?? 0) > 0 &&
        basePrice > effectivePrice;

    return (
        <main className="w-full bg-white">
            <section className="w-full border-b border-black/10">
                <div className="mx-auto w-full max-w-7xl px-6 py-12 md:px-10 md:py-16 xl:px-12">
                    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_33rem] lg:gap-10 xl:gap-16">
                        <div className="space-y-6 lg:max-w-139">
                            <h1
                                className="text-[34px] font-semibold leading-[96%] text-[#0A0A0A] md:text-[40px]"
                                style={{ fontFamily: 'Crimson Text, serif' }}
                            >
                                Vol. I - World Rally Championship
                            </h1>

                            <p
                                className="text-[14px] italic leading-[150%] text-[#0A0A0A]/60 md:text-[15px]"
                                style={{ fontFamily: 'Crimson Text, serif' }}
                            >
                                A technical and immersive history of the World Rally Championship.
                            </p>

                            <div className="border-y border-black/10 px-0 py-4">
                                <h2
                                    className="text-[16px] font-semibold leading-[183%] text-[#0A0A0A]/80"
                                    style={{ fontFamily: 'Crimson Text, serif' }}
                                >
                                    Editorial Scope
                                </h2>
                                <p
                                    className="mt-1 max-w-145 text-[14px] leading-[136%] text-[#0A0A0A]/60"
                                    style={{ fontFamily: 'Crimson Text, serif' }}
                                >
                                    This volume examines the World Rally Championship as a regulatory and engineering history,
                                    rather than a sequence of isolated sporting events.
                                </p>
                            </div>

                            <div>
                                <ul className="mt-3 space-y-4">
                                    {keyThemes.map((theme) => (
                                        <li key={theme.title} className="flex items-start gap-3">
                                            <span className="mt-1 block h-8 w-px bg-[#BCBCBC]" aria-hidden="true" />
                                            <p
                                                className="text-[14px] leading-[125%] text-[#0A0A0A]/60"
                                                style={{ fontFamily: 'Crimson Text, serif' }}
                                            >
                                                <span className="font-semibold">{theme.title}</span> {theme.description}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="border-t border-black/10 pt-5">
                                <h3
                                    className="text-[16px] font-semibold leading-[183%] text-[#0A0A0A]/80"
                                    style={{ fontFamily: 'Crimson Text, serif' }}
                                >
                                    Editorial Characteristics
                                </h3>

                                <ul
                                    className="mt-1 space-y-1 text-[14px] leading-[174%] text-[#0A0A0A]/60"
                                    style={{ fontFamily: 'Crimson Text, serif' }}
                                >
                                    <li>- Archival research and primary-source verification</li>
                                    <li>- Manufacturer-reviewed technical sections</li>
                                    <li>- Independent editorial framework</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex h-120 gap-3 lg:justify-self-end lg:h-150 lg:w-full">
                            <img
                                src={bookMockupCovers}
                                alt="Book mockup covers"
                                className="min-w-0 flex-1 border border-black/10 object-cover"
                            />
                            <div className="flex w-24 flex-col gap-3 md:w-32 lg:w-44">
                                <img
                                    src={indiceImage}
                                    alt="Indice"
                                    className="min-h-0 flex-1 w-full border border-black/10 object-cover"
                                />
                                <img
                                    src={capituloAudiImage}
                                    alt="Capitulo Audi"
                                    className="min-h-0 flex-1 w-full border border-black/10 object-cover"
                                />
                                <img
                                    src={introduccionImage}
                                    alt="Introduccion"
                                    className="min-h-0 flex-1 w-full border border-black/10 object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="w-full border-t border-black/10">
                <div className="mx-auto w-full max-w-5xl px-6 py-12 md:px-10 md:py-16">
                    <h2 className="text-[28px] font-semibold leading-[171%] text-[#0A0A0A]" style={{ fontFamily: 'Crimson Text, serif' }}>
                        Editorial Description
                    </h2>

                    <p className="mt-6 text-[18px] leading-[125%] text-[#0A0A0A]/80" style={{ fontFamily: 'Crimson Text, serif' }}>
                        This volume traces the World Rally Championship from its origins to the mid-2000s, not as a
                        chronological list of results, but as a living system shaped by regulation and engineering ambition.
                        Through the evolution of homologation rules, it explores how manufacturers interpreted, challenged,
                        and adapted to the regulatory environment, redefining the sport in the process.
                        <br />
                        <br />
                        Cars are treated as the central protagonists: machines born from constraint, strategic urgency, and
                        institutional decision-making. Drawing from archival sources and manufacturer records, this work
                        offers a technically grounded narrative of how rallying evolved through its most transformative era.
                    </p>
                </div>
            </section>

            <section className="w-full border-t border-black/10">
                <div className="mx-auto w-full max-w-5xl px-6 py-12 md:px-10 md:py-16">
                    <h2 className="text-[28px] font-semibold leading-[171%] text-[#0A0A0A]" style={{ fontFamily: 'Crimson Text, serif' }}>
                        What Distinguishes This Volume
                    </h2>

                    <ul className="mt-6 space-y-3 text-[17px] leading-9 text-[#0A0A0A]/80" style={{ fontFamily: 'Crimson Text, serif' }}>
                        {distinguishingPoints.map((point) => (
                            <li key={point} className="flex items-start gap-3">
                                <span aria-hidden="true">-</span>
                                <span>{point}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section className="w-full border-t border-black/10">
                <div className="mx-auto w-full max-w-5xl px-6 py-12 md:px-10 md:py-16">
                    <h2 className="text-[28px] font-semibold leading-[171%] text-[#0A0A0A]" style={{ fontFamily: 'Crimson Text, serif' }}>
                        Intended Readership
                    </h2>

                    <p className="mt-6 text-[17px] leading-[125%] text-[#0A0A0A]/80" style={{ fontFamily: 'Crimson Text, serif' }}>
                        This publication is written for rally enthusiasts who want to understand why the sport evolved the
                        way it did, as well as for engineers, historians, and technical readers seeking a structured and
                        reliable reference.
                        <br />
                        <br />
                        While grounded in engineering and regulation, the book is accessible to dedicated fans with a strong
                        interest in the technical, historical and strategic dimensions of motorsport. It rewards curiosity,
                        context, and attention rather than requiring formal engineering training.
                    </p>
                </div>
            </section>

            <section className="w-full border-t border-black/10">
                <div className="mx-auto w-full max-w-5xl px-6 py-12 md:px-10 md:py-16">
                    <h2 className="text-[28px] font-semibold leading-[171%] text-[#0A0A0A]" style={{ fontFamily: 'Crimson Text, serif' }}>
                        Physical Format
                    </h2>

                    <div className="mt-6 grid grid-cols-1 gap-3 text-[15px] sm:grid-cols-2">
                        {physicalSpecs.map((spec, index) => (
                            <div
                                key={spec.label}
                                className={`flex justify-between border-b border-black/10 pb-2 ${
                                    index === physicalSpecs.length - 1 ? 'sm:col-span-2' : ''
                                }`}
                            >
                                <span className="text-[#0A0A0A]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    {spec.label}
                                </span>
                                <span className="text-[#0A0A0A]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    {spec.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="w-full border-t border-black/10">
                <div className="mx-auto w-full max-w-5xl px-6 py-12 md:px-10 md:py-20">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <h2 className="text-[32px] font-semibold leading-12 text-[#0A0A0A]" style={{ fontFamily: 'Crimson Text, serif' }}>
                            Purchase
                        </h2>
                        <div className="flex flex-col items-end gap-1">
                            {isPriceLoading ? (
                                <p className="text-[16px] text-[#0A0A0A]/60" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    Loading price...
                                </p>
                            ) : showSale ? (
                                <>
                                    <p className="text-[14px] text-[#0A0A0A]/50 line-through" style={{ fontFamily: 'Inter, sans-serif' }}>
                                        {formatMoney(basePrice, currency)}
                                    </p>
                                    <p className="text-[30px] font-semibold leading-9 text-[#0A0A0A]" style={{ fontFamily: 'Crimson Text, serif' }}>
                                        {formatMoney(effectivePrice, currency)}
                                    </p>
                                    <p className="rounded bg-[#F4E7E7] px-2 py-1 text-[11px] font-semibold tracking-[1px] text-[#7A1E1E] uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
                                        {selectedBook?.discount}% OFF
                                    </p>
                                </>
                            ) : (
                                <p className="text-[30px] font-semibold leading-9 text-[#0A0A0A]" style={{ fontFamily: 'Crimson Text, serif' }}>
                                    {formatMoney(effectivePrice, currency)}
                                </p>
                            )}
                            {priceError && !isPriceLoading && (
                                <p className="text-[12px] text-[#8B0000]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    {priceError}
                                </p>
                            )}
                        </div>
                    </div>

                    <p className="mt-6 text-[17px] leading-[125%] text-[#0A0A0A]/80" style={{ fontFamily: 'Crimson Text, serif' }}>
                        Published in a single edition. Fulfillment occurs within 5-7 business days of order confirmation.
                        <br />
                        International shipping available.
                    </p>

                    <NavLink
                        to="/purchase/volume-i"
                        className="mt-8 inline-flex items-center justify-center border border-[#030213] bg-[#030213] px-8 py-3 text-base font-semibold text-white no-underline"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                        Purchase Volume I
                    </NavLink>
                </div>
            </section>
        </main>
    );
}

export default Volume1Page;

