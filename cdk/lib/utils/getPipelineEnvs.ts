import { z } from 'zod';
import { logger } from "./logger";

//TODO('remove optional method for robust validation')
const pipelineEnvSchema = z.object({
    GITHUB_USERNAME: z.string().default(''),
    GITHUB_REPO: z.string().default(''),
    GITHUB_TOKEN_SECRET_NAME: z.string().default(''),
    GITHUB_BRANCH: z.string().default(''),
});

export default function getPipelineEnvs() {
    try {
        const envs = pipelineEnvSchema.parse({
            GITHUB_USERNAME: process.env.GITHUB_USERNAME,
            GITHUB_REPO: process.env.GITHUB_REPO,
            GITHUB_TOKEN_SECRET_NAME: process.env.GITHUB_TOKEN_SECRET_NAME,
            GITHUB_BRANCH: process.env.GITHUB_BRANCH,
            }
        )
        logger.info('Pipeline variables successfully validated and loaded');
        return envs;
    } catch (error) {
        logger.error('Pipeline variable validation failed', { error });
        throw error;
    }
};