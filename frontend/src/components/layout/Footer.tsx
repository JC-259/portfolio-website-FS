import { FaGithub, FaLinkedin } from 'react-icons/fa';
import type { IconType } from 'react-icons';

const Footer = () => {
    const socialLinks: Array<{ href: string; icon: IconType; label: string }> = [
      { href: "https://www.linkedin.com/in/jamesecarr", icon: FaLinkedin, label: "LinkedIn" },
      { href: "https://github.com/JC-259", icon: FaGithub, label: "GitHub" }
    ];

    return (
        <footer className="bg-[var(--color-footer-bg)] text-[var(--color-footer-text)] px-6 py-12">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 text-sm items-stretch">
                <div className="flex flex-col justify-center md:w-1/3">
                    <h4 className="text-xl font-bold mb-2">James C.</h4>
                    <p>Backend developer focused on clean backend systems and cloud-native tooling.</p>
                </div>

                <div className="w-px bg-[var(--color-footer-divider)] mx-6 hidden md:block" />

                <div className="flex flex-col md:flex-row gap-6 w-full md:w-2/3">

                    <div className="w-px bg-[var(--color-footer-divider)] mx-6 hidden md:block h-full" />

                    <div className="text-center md:text-left md:w-1/3">
                        <h4 className="font-semibold mb-4">Get in Touch</h4>
                        <div className="flex space-x-6 text-2xl justify-center md:justify-start">
                            {socialLinks.map(({ href, icon, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    data-umami-event={`Footer Button: ${label}`}
                                    data-umami-event-url={`${href}`}
                                    role="link"
                                    className="hover:text-[var(--color-footer-hover)] transition-colors"
                                >
                                    {icon({ 'aria-label': label })}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-10 text-center text-xs text-[var(--color-footer-subtle)]">
                &copy; {new Date().getFullYear()} James C. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;