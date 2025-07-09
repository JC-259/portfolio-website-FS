import { useEffect, useState } from "react";
import NotFound from "./components/layout/NotFound";
import Home from './components/sections/Home';
import Navbar from "./components/layout/Navbar";
import About from "./components/sections/About";
import Technology from "./components/sections/Technology";
import Projects from "./components/sections/Projects";
import Contact from "./components/sections/Contact";
import Footer from "./components/layout/Footer";
import OpenToWorkStatus from "./components/common/OpenToWorkStatus";
import { QuickLinkItems } from "./components/common/QuickLinkItems";
import { CaptchaProvider } from "./components/common/TurnstileVerifier";

function App() {
    const [currentHash, setCurrentHash] = useState(window.location.hash);

    useEffect(() => {
        const handleHashChange = () => setCurrentHash(window.location.hash);
        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, []);

    const validHashes = ["", "#home", ...QuickLinkItems.map(link => link.href)];
    const isValidHash = validHashes.includes(currentHash);

    return (
        <CaptchaProvider>
            <main className="bg-[var(--color-surface)] text-[var(--color-text)] dark:bg-[var(--color-surface-dark)] dark:text-[var(--color-text-dark)]">
                <Navbar />
                {isValidHash ? (
                    <>
                        <Home />
                        <About />
                        <Technology />
                        <Projects />
                        <Contact />
                        <Footer />
                    </>
                ) : (
                    <NotFound />
                )}
            </main>
            <div className="fixed bottom-4 right-4 z-50">
                <OpenToWorkStatus />
            </div>
        </CaptchaProvider>
    );
}


export default App;