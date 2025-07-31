import { Suspense, lazy, useState } from 'react';
import { useCaptcha } from '../common/TurnstileVerifier';
const LazyCaptcha = lazy(() => import('../common/TurnstileVerifier'));
import { toast } from 'react-toastify';

const About = () => {
    const { verified } = useCaptcha();
    const [downloading, setDownloading] = useState(false);
    const cvUrl = import.meta.env.VITE_CV_URL;

    const handleDownload = async () => {
        if (!verified) return;
        setDownloading(true);
        const toastId = toast.loading('Preparing your CV...');

        try {
            window.location.href = cvUrl;
        } catch (error) {
            console.error(error);
            toast.update(toastId, {
                render: 'Unable to open CV. Please check your popup blocker.',
                type: 'error',
                isLoading: false,
                autoClose: 5000,
            });
            return;
        } finally {
            setDownloading(false);
            toast.dismiss(toastId);
        }
    };

    return (
        <section
            id="about"
            data-umami-event="/#about"
            role="region"
            aria-labelledby="about-heading"
            className="min-h-screen px-4 pt-8 pb-20 flex flex-col items-center justify-center text-center"
            style={{ backgroundColor: 'var(--color-surface)' }}>
            <h2
                id="about-heading"
                className="text-3xl md:text-4xl font-bold mb-6"
                style={{ color: 'var(--color-primary)' }}>
                About Me
            </h2>
            <p className="max-w-3xl text-lg leading-relaxed" style={{ color: 'var(--color-text)' }}>
                I’m a backend software engineer with hands‑on experience designing and maintaining cloud‑native services
                in AWS, including microservices built with Kotlin and Spring Boot. I focus on building reliable, scalable
                systems, optimising cloud deployments with CI/CD pipelines, and bridging backend to frontend to deliver
                seamless end‑to‑end solutions.
            </p>
            <div className="flex flex-col items-center space-y-2 mt-4">
                <p className="max-w-3xl text-lg leading-relaxed" style={{ color: 'var(--color-text)' }}>
                    Want to know more about me? Grab my CV below.
                </p>
                <button
                    onClick={handleDownload}
                    disabled={!verified || downloading}
                    data-umami-event="Get CV button"
                    aria-busy={downloading}
                    className="inline-block px-4 py-2 text-sm font-semibold rounded transition disabled:opacity-50"
                    style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-surface)',
                        cursor: verified ? 'pointer' : 'default',
                    }}
                >
                    <span className="flex flex-col items-center leading-tight">
                        <span>Get my CV</span>
                        {!verified && (
                            <span className="flex items-center text-xs text-gray-300 mt-1">
                                <span className="animate-spin h-4 w-4 mr-1 border-2 border-t-transparent border-surface rounded-full"></span>
                                Verifying access...
                            </span>
                        )}
                    </span>
                </button>
                <Suspense>
                    <LazyCaptcha />
                </Suspense>
            </div>
        </section>
    );
};

export default About;