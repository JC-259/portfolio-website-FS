import { useState } from 'react';
import { useCaptcha } from '../common/TurnstileVerifier';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Contact = () => {
    const [form, setForm] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const { verified } = useCaptcha();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name || !form.email || !form.message || !verified) {
            setStatus('error');
            toast.error('Please complete all fields and CAPTCHA.');
            return;
        }

        setStatus('loading');
        toast.info('Sending your message...');

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': import.meta.env.VITE_API_KEY || ''
                },
                mode: 'cors',
                credentials: 'include',
                body: JSON.stringify(form),
            });

            if (res.ok) {
                setStatus('success');
                setForm({ name: '', email: '', message: '' });
                toast.success('Thanks! Your message has been sent.');
            } else {
                setStatus('error');
                toast.error('Something went wrong. Please try again.');
            }
        } catch (err) {
            setStatus('error');
            toast.error('Something went wrong. Please try again.');
        }
    };

    return (
        <section
            id="contact"
            data-umami-event="/#contact"
            aria-labelledby="contact-heading"
            role="region"
            className="min-h-screen px-4 pt-8 pb-20 flex flex-col items-center justify-center text-center"
            style={{ backgroundColor: 'var(--color-surface)' }}>
            <h2 id="about-heading"
                className="text-3xl md:text-4xl font-bold mb-6"
                style={{ color: 'var(--color-primary)' }}>
                Contact
            </h2>

            <form onSubmit={handleSubmit} aria-label="Contact form" className="w-full max-w-xl space-y-6 text-left">
                <input
                    aria-label="Name"
                    aria-required="true"
                    type="text"
                    name="name"
                    placeholder="Your name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    style={{
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-text)',
                        borderColor: 'var(--color-muted)',
                    }}
                    required
                />
                <input
                    aria-label="Email"
                    aria-required="true"
                    type="email"
                    name="email"
                    placeholder="Your email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    style={{
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-text)',
                        borderColor: 'var(--color-muted)',
                    }}
                    required
                />
                <textarea
                    aria-label="Message"
                    aria-required="true"
                    name="message"
                    placeholder="Your message"
                    value={form.message}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg h-40 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    style={{
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-text)',
                        borderColor: 'var(--color-muted)',
                    }}
                    required
                />
                <button
                    type="submit"
                    data-umami-event="Contact form button"
                    className="px-6 py-3 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center space-x-2"
                    style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-surface)',
                    }}
                    disabled={!verified || status === 'loading'}
                >
                    <span className="flex flex-col items-center leading-tight">
                        <span>Send Message</span>
                        {!verified && (
                            <span className="flex items-center text-xs text-gray-300 mt-1">
                                <span className="animate-spin h-4 w-4 mr-1 border-2 border-t-transparent border-surface rounded-full"></span>
                                Verifying access...
                            </span>
                        )}
                        {verified && status === 'loading' && (
                            <span className="flex items-center text-xs text-gray-300 mt-1">
                                <span className="animate-spin h-4 w-4 mr-1 border-2 border-t-transparent border-surface rounded-full"></span>
                                Sending...
                            </span>
                        )}
                    </span>
                </button>
                <p aria-live="polite" className="sr-only">
                    {status === 'loading' && 'Sending...'}
                    {status === 'success' && 'Message sent successfully.'}
                    {status === 'error' && 'Something went wrong.'}
                </p>
            </form>
            <ToastContainer autoClose={2000} />
        </section>
    );
};

export default Contact;