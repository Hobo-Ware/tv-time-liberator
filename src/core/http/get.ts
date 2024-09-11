import axios from 'axios';
import { retryAsync } from 'ts-retry';

export async function get<T>(url: string): Promise<T> {
    try {
        const reponse = await retryAsync(() => axios.get(url), {
            maxTry: 10,
            delay: 3500,
            onError: () => {
                console.log(`Retrying GET request to ${url}...`);
            },
        });

        return reponse.data;
    } catch (error) {
        console.error({
            message: error.message,
            status: error.status,
        });

        throw error;
    }
}