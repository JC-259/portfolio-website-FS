import { QuickLinkItems } from "./QuickLinkItems";

type QuickLinksProps = {
    className?: string;
    currentHash?: string;
    activeClass?: string;
    inactiveClass?: string;
};

export const QuickLinks = ({
    className = '',
    currentHash = '',
    activeClass = 'text-emerald-700 font-semibold dark:text-emerald-400',
    inactiveClass = 'text-gray-700 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400',
}: QuickLinksProps) => (
    <nav role="navigation" aria-label="Quick Links" className={`flex gap-4 ${className}`}>
        {QuickLinkItems.map(({ href, label }) => (
            <a
                key={href}
                href={href}
                data-umami-event={`Page Button: ${label}`}
                aria-label={`Navigate to ${label}`}
                className={`whitespace-nowrap transition-colors ${
                    currentHash === href ? activeClass : inactiveClass
                }`}
            >
                {label}
            </a>
        ))}
    </nav>
);
