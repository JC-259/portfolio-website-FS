import { z } from 'zod';
import { logger } from './logger';

//TODO('remove optional method for robust validation')
const EnvSchema = z.object({
    API_KEY: z.string().default(''),
    STATUS_API_KEY: z.string().default(''),
    CDK_DEFAULT_REGION: z.string().default(''),
    CERTIFICATE_ARN: z.string().default(''),
    CONTACT_FROM_EMAIL: z.string().email().default('example@example.com'),
    CONTACT_QUEUE_URL: z.string().default(''),
    CONTACT_TO_EMAIL: z.string().email().default('example@example.com'),
    CV_BUCKET_NAME: z.string().default(''),
    DOMAIN_NAME: z.string().default(''),
    OPEN_TO_WORK_TABLE_NAME: z.string().default(''),
    TURNSTILE_SECRET_KEY: z.string().default(''),
    PORTFOLIO_DISTRIBUTION_ID: z.string().default(''),

    PORTFOLIO_WEBSITE_BUCKET: z.string().default(''),
    VITE_API_BASE_URL: z.string().url().default('http://example.com'),
    VITE_TURNSTILE_SITE_KEY: z.string().default(''),
    VITE_API_KEY: z.string().default(''),
    VITE_CV_URL: z.string().default(''),
});

export default function getEnvs() {
    try {
        const envs = EnvSchema.parse({
            API_KEY: process.env.API_KEY,
            STATUS_API_KEY: process.env.STATUS_API_KEY,
            CDK_DEFAULT_REGION: process.env.CDK_DEFAULT_REGION,
            CERTIFICATE_ARN: process.env.CERTIFICATE_ARN,
            CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL,
            CONTACT_QUEUE_URL: process.env.CONTACT_QUEUE_URL,
            CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
            CV_BUCKET_NAME: process.env.CV_BUCKET_NAME,
            DOMAIN_NAME: process.env.DOMAIN_NAME,
            OPEN_TO_WORK_TABLE_NAME: process.env.OPEN_TO_WORK_TABLE_NAME,
            TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
            PORTFOLIO_DISTRIBUTION_ID: process.env.PORTFOLIO_DISTRIBUTION_ID,

            PORTFOLIO_WEBSITE_BUCKET: process.env.PORTFOLIO_WEBSITE_BUCKET,
            VITE_API_BASE_URL: process.env.VITE_API_BASE_URL,
            VITE_TURNSTILE_SITE_KEY: process.env.VITE_TURNSTILE_SITE_KEY,
            VITE_API_KEY: process.env.API_KEY,
            VITE_CV_URL: process.env.VITE_CV_URL,
        });
        logger.info('Environment variables successfully validated and loaded');
        return envs;
    } catch (error) {
        logger.error('Environment variable validation failed', { error });
        throw error;
    }
}