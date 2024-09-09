import axios from 'axios';
import * as db from './db.mjs';

export async function get(url) {
    const { token } = await db.get(db.TvTimeValue.UserToken);

    try {
        const reponse = await axios.get(url, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        return reponse.data;
    } catch (error) {
        console.error({
            message: error.message,
            status: error.status,
        });

        return { data: null };
    }
}