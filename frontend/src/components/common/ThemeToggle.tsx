import { useEffect, useState } from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import type { IconType } from 'react-icons';
import { toggleDarkMode } from "../../utils/theme";

const ThemeToggle = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        setIsDarkMode(document.documentElement.classList.contains("dark"));
    }, []);

    const handleThemeToggle = () => {
        toggleDarkMode();
        setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    const MoonIcon = FiMoon as IconType;
    const SunIcon = FiSun as IconType;

    return (
        <button
            onClick={handleThemeToggle}
            data-umami-event={`Theme toggled to ${isDarkMode ? 'light' : 'dark'} mode`}
            className="w-14 h-8 flex items-center bg-gray-300 dark:bg-gray-600 rounded-full p-1 transition-colors duration-300 focus:outline-none relative"
        >
            <div
                className={`w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                    isDarkMode ? "translate-x-6 bg-gray-100" : "translate-x-0 bg-white"
                }`}
            >
                {isDarkMode
                  ? MoonIcon({ className: "text-gray-800 text-sm", "aria-label": "Moon" })
                  : SunIcon({ className: "text-yellow-500 text-sm", "aria-label": "Sun" })}
            </div>
        </button>
    );
};

export default ThemeToggle;
