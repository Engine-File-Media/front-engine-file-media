import { NavLink } from 'react-router-dom';

function NotFoundPage() {
    return (
        <main className="w-full bg-white">
            <section className="mx-auto flex min-h-[60vh] w-full max-w-5xl flex-col items-center justify-center px-6 py-16 text-center">
                <p
                    className="m-0 text-[12px] font-medium tracking-[2px] text-[#0A0A0A]/60"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                >
                    ERROR 404
                </p>

                <h1
                    className="m-0 mt-4 text-[42px] font-semibold leading-[95%] text-[#0A0A0A] md:text-[56px]"
                    style={{ fontFamily: 'Crimson Text, serif' }}
                >
                    Page not found
                </h1>

                <p
                    className="m-0 mt-4 max-w-xl text-[17px] leading-[140%] text-[#0A0A0A]/70"
                    style={{ fontFamily: 'Crimson Text, serif' }}
                >
                    The page you are looking for does not exist or may have been moved.
                </p>

                <NavLink
                    to="/"
                    className="mt-8 inline-flex items-center justify-center border border-[#030213] bg-[#030213] px-8 py-3 text-[13px] font-semibold uppercase tracking-[1.4px] text-white no-underline"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                >
                    Return Home
                </NavLink>
            </section>
        </main>
    );
}

export default NotFoundPage;