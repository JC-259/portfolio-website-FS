import { Suspense, lazy, useState } from 'react';
import { useCaptcha } from '../common/TurnstileVerifier';
const LazyCaptcha = lazy(() => import('../common/TurnstileVerifier'));
import { toast } from 'react-toastify';

const Home = () => {
    const { verified } = useCaptcha();
    const [downloading, setDownloading] = useState(false);
    const cvUrl = import.meta.env.VITE_CV_URL;

    const handleDownload = async () => {
        setDownloading(true);
        toast.info('Requesting CV...');

        try {
            window.location.href = cvUrl;
        } catch (error) {
            console.error(error);
            toast.error('Unable to open CV. Please check your popup blocker.');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <section
            id="home"
            data-umami-event="/#home"
            role="region"
            aria-labelledby="home-heading"
            className="min-h-screen flex flex-col items-center justify-center text-center px-4"
            style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
            }}
        >
            <h1 id="home-heading" className="text-5xl md:text-6xl font-bold mb-4">
                Hi, I'm James
            </h1>
            <p className="text-lg md:text-xl max-w-xl">
                A Software Engineer with Kotlin & Spring Boot experience: building clean, scalable, and efficient real-world applications.
            </p>
            <div className="flex flex-col items-center space-y-4 mt-6">
                {!verified && (
                    <Suspense fallback={<div>Loading CAPTCHA...</div>}>
                        <LazyCaptcha />
                    </Suspense>
                )}
                {verified && (
                    <button
                        onClick={handleDownload}
                        data-umami-event="Get CV button"
                        aria-busy={downloading}
                        className="inline-block px-4 py-2 text-sm font-semibold rounded hover:bg-emerald-700 transition"
                        style={{
                            backgroundColor: 'var(--color-primary)',
                            color: 'var(--color-surface)',
                        }}
                    >
                        {downloading ? 'Downloading...' : 'Get CV'}
                    </button>
                )}
            </div>
        </section>
    );
};

export default Home;