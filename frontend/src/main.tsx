import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { initTheme } from './utils/theme';

initTheme();

const container = document.getElementById('root');

if (container) {
    createRoot(container).render(
        <StrictMode>
            <App />
        </StrictMode>,
    );
} else {
    console.error("Root container not found");
}
