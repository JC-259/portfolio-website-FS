import axios from 'axios';
import FormData from 'form-data';
import { TurnstileResponse } from '../types/turnstile';
import getEnvs from './getEnvs';
import { logger } from './logger';

const { TURNSTILE_SECRET_KEY } = getEnvs();

export const verifyTurnstile = async (token: string): Promise<boolean> => {
    if (!TURNSTILE_SECRET_KEY) {
        logger.error('TURNSTILE_SECRET_KEY is not defined in environment');
        return false;
    }

    if (!token) {
        logger.warn('No Turnstile token provided');
        return false;
    }

    try {
        let form = new FormData();
        form.append('secret', TURNSTILE_SECRET_KEY);
        form.append('response', token);

        console.info('util secret value:', TURNSTILE_SECRET_KEY)
        console.info('util site value:', token)

        const axiosRes = await axios.post<TurnstileResponse>(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            form,
            {
                headers: form.getHeaders(),
            }
        );

        const res: TurnstileResponse = axiosRes.data;

        console.info('response', res)

        logger.info('Turnstile verification result', { success: res.success, errors: res['error-codes'] });
        return res.success;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            logger.error('Turnstile Axios error', {
                message: error.message,
                response: error.response?.data,
            });
        } else {
            logger.error('Unexpected Turnstile error', { error });
        }
        return false;
    }
};