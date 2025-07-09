interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
    readonly VITE_API_KEY: string;
    readonly VITE_TURNSTILE_SITE_KEY: string;
    readonly VITE_PORTFOLIO_API_KEY: string;
    readonly PORTFOLIO_WEBSITE_BUCKET: string;
    readonly PORTFOLIO_DISTRIBUTION_ID: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}