import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { getToken } from './internal/token.mjs';
import { exists, get, remove, set, TvTimeValue } from './internal/db.mjs';
import { URL } from './internal/url.mjs';

async function fetchFlutterToken() {
    const isFlutterTokenAvailable = await exists(TvTimeValue.FlutterToken);

    if (!isFlutterTokenAvailable) {
        const token = await getToken();
        set(TvTimeValue.FlutterToken, token);
        return token;
    }

    const cachedToken = await get(TvTimeValue.FlutterToken);

    const invalidateAndRetry = async () => {
        await remove(TvTimeValue.FlutterToken);
        return fetchFlutterToken();
    }

    try {
        const { exp } = jwtDecode(cachedToken);

        if (Date.now() >= exp * 1000) {
            console.log('Flutter token expired, regenerating...');
            return await invalidateAndRetry();
        }
    }
    catch (error) {
        console.log('Flutter token corrupted, regenerating...');
        return await invalidateAndRetry();
    }

    return cachedToken;
}

async function fetchUser() {
    const isUserTokenAvailable = await exists(TvTimeValue.UserToken);

    if (!isUserTokenAvailable) {
        return null;
    }

    const user = await get(TvTimeValue.UserToken);

    try {
        const { exp } = jwtDecode(user.token);
        const isTokenExpired = Date.now() >= exp * 1000;

        if (!isTokenExpired) {
            return user;
        }
    } catch (error) {
        console.log('User token corrupted, removing...');
        await await remove(TvTimeValue.UserToken);
    }
}

/**
 * Logs in a user with the provided username and password.
 * 
 * @param {string} username - The username of the user.
 * @param {string} password - The password of the user.
 * @returns {Promise<{ userId: string, token: string  }>} - A promise that resolves to the response data from the login request.
 * @throws {Error} - If an error occurs during the login process.
 */
export async function login(username, password) {
    const userInfo = await fetchUser();

    if (userInfo != null) {
        console.log('Valid user token found... Skipping login...');
        return userInfo;
    }

    const flutterToken = await fetchFlutterToken();
    const payload = {
        username,
        password
    };

    try {
        console.log('Logging in...');
        const response = await axios
            .post(URL.Post.Login, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${flutterToken}`,
                }
            });

        const { data } = response.data;
        const { jwt_token: token, id: userId } = data;

        const userToken = {
            token,
            userId,
        };

        await set(TvTimeValue.UserToken, userToken);

        return userToken;
    } catch (error) {
        console.error({
            message: error.message,
            status: error.status,
        });
        return Promise.reject(error);
    }
}

