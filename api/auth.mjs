import axios from 'axios';
import { TOKEN } from './internal/token.mjs';

/**
 * Logs in a user with the provided username and password.
 * 
 * @param {string} username - The username of the user.
 * @param {string} password - The password of the user.
 * @returns {Promise<string>} - A promise that resolves to the response data from the login request.
 * @throws {Error} - If an error occurs during the login process.
 */
export async function login(username, password) {
    const AUTH_URL = 'https://auth.tvtime.com/v1/login';

    const payload = {
        username,
        password
    };

    try {
        const response = await axios
            .post(AUTH_URL, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${TOKEN}`,
                }
            });

        const { data } = response.data;
        const { jwt_token, jwt_refresh_token } = data;

        return jwt_token;
    } catch (error) {
        console.error(error);
        return Promise.reject(error);
    }
}

