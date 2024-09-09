import axios from 'axios';

export async function get<T>(url: string): Promise<T> {
    try {
        const reponse = await axios.get(url);
        return reponse.data;
    } catch (error) {
        console.error({
            message: error.message,
            status: error.status,
        });

        throw error;
    }
}