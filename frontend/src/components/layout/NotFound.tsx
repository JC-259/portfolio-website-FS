import { useEffect } from "react";

const NotFound = () => {
    useEffect(() => {
        const timer = setTimeout(() => {
            window.location.href = "/#home";
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            className="min-h-screen flex flex-col justify-center items-center text-center px-4"
            role="alert"
            data-umami-event="/#NotFound"
            aria-live="assertive"
            aria-label="Page not found message"
        >
            <h1 className="text-4xl font-bold text-[var(--color-primary)] mb-4">
                Oops! Page Not Found
            </h1>
            <p className="text-[var(--color-muted)] mb-6">
                The section you're looking for doesn’t exist. Redirecting to the homepage...
            </p>
            <a
                href="#home"
                aria-label="Return to homepage"
                className="bg-[var(--color-primary)] text-[var(--color-surface)] px-6 py-2 rounded hover:bg-emerald-500 transition"
            >
                Go to Home
            </a>
        </div>
    );
};

export default NotFound;