import { useEffect, useState } from "react";
import { QuickLinks } from "../common/Quicklinks";
import ThemeToggle from "../common/ThemeToggle";

const Navbar = () => {
    const [hasShadow, setHasShadow] = useState(false);
    const [currentHash, setCurrentHash] = useState(window.location.hash || "#home");

    useEffect(() => {
        const handleScroll = () => {
            setHasShadow(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const handleHashChange = () => setCurrentHash(window.location.hash);
        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, []);

    const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        setCurrentHash("");
        window.scrollTo({ top: 0, behavior: 'smooth' });
        history.replaceState(null, '', window.location.pathname);
    };

    return (
        <header
            style={{
                backgroundColor: hasShadow ? 'var(--color-surface)' : 'transparent',
                backgroundImage: 'none',
                backgroundBlendMode: 'normal'
            }}
            className={`fixed top-0 left-0 w-full z-50 transition-shadow ${hasShadow ? 'shadow-md' : ''} dark:bg-[color:var(--color-surface-dark)]`}
        >
            <nav className="max-w-5xl mx-auto px-4 py-2 sm:py-3 flex flex-wrap justify-between items-center gap-y-2" aria-label="Main navigation">
                <div className="flex items-center gap-2">
                    <a
                        href="#"
                        onClick={handleLogoClick}
                        data-umami-event="Home button"
                        className="font-bold text-base sm:text-lg text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
                    >
                        James C.
                    </a>
                    <div className="relative sm:hidden transform scale-75">
                        <ThemeToggle />
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                    <ul className="flex gap-8 px-2 text-[var(--color-text)] dark:text-[var(--color-text-dark)]">
                        <QuickLinks currentHash={currentHash} />
                    </ul>
                    <div className="relative hidden sm:block transform scale-75">
                        <ThemeToggle />
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;