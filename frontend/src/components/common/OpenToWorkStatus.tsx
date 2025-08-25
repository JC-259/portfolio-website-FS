import { useState, useEffect } from 'react';

const OpenToWorkStatus = () => {
    const [isOpen, setIsOpen] = useState<boolean | null>(false);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/get-open-to-work`, {
                    headers: {
                        'x-api-key': import.meta.env.VITE_API_KEY || ''
                    },
                });

                if (!res.ok) throw new Error('Failed to fetch status');

                const data = await res.json();

                if (typeof data.openToWork !== 'boolean') {
                    throw new Error('Unexpected response format');
                }

                setIsOpen(data.openToWork);
            } catch (err) {
                console.error('Error fetching open-to-work status', err);
                setIsOpen(false);
            }
        };
        fetchStatus();
    }, []);

    if (isOpen === null) {
        return <div role="status" aria-live="polite" aria-label="Loading job search status">Loading...</div>;
    }

    if (!isOpen) return null;

    return (
        <div
            className="fixed bottom-4 right-4 z-50 text-sm font-medium px-4 py-2 rounded-md shadow-sm transition-colors
          bg-white border border-gray-300 text-gray-600
          dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700
          sm:relative sm:bottom-auto sm:right-auto sm:mx-auto sm:mt-4 sm:w-fit flex flex-col items-end"
            role="status"
            aria-live="polite"
            aria-label="Current job search status and location preferences"
        >
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Interested in New Opportunities</span>
            </div>
            <span className="text-xs text-[var(--color-muted)]">Leeds, UK | Surrounding Area's</span>
            <span className="text-xs text-[var(--color-muted)]">In-person | Hybrid | Remote</span>
        </div>
    );
};

export default OpenToWorkStatus;