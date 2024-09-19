import { jwtDecode } from 'jwt-decode';
import { getToken } from './token';
import { PersistentStore, TvTimeValue } from './store';
import { Resource } from '../core/http/Resource';
import { UserToken } from '../core/types/UserToken';
import { retryAsync } from 'ts-retry';

async function fetchFlutterToken(): Promise<string> {
    const isFlutterTokenAvailable = await PersistentStore.has(TvTimeValue.FlutterToken);
    if (!isFlutterTokenAvailable) {
        const token = await getToken();
        await PersistentStore.set(TvTimeValue.FlutterToken, token);
        return token;
    }

    const cachedToken = await PersistentStore.get<string>(TvTimeValue.FlutterToken);

    const invalidateAndRetry = async () => {
        await PersistentStore.delete(TvTimeValue.FlutterToken);
        return fetchFlutterToken();
    }

    try {
        const { exp = 0 } = jwtDecode(cachedToken!);

        if (Date.now() >= exp * 1000) {
            console.log('Flutter token expired, regenerating...');
            return await invalidateAndRetry();
        }
    }
    catch (error) {
        console.log('Flutter token corrupted, regenerating...');
        return await invalidateAndRetry();
    }

    return cachedToken!;
}

async function fetchUser(): Promise<UserToken | null | undefined> {
    const isUserTokenAvailable = await PersistentStore.has(TvTimeValue.UserToken);

    if (!isUserTokenAvailable) {
        return null;
    }

    const user = await PersistentStore.get<UserToken>(TvTimeValue.UserToken);

    try {
        const { exp = 0 } = jwtDecode(user!.token);
        const isTokenExpired = Date.now() >= exp * 1000;

        if (!isTokenExpired) {
            return user;
        }
    } catch (error) {
        console.log('User token corrupted, removing...');
        await PersistentStore.delete(TvTimeValue.UserToken);
    }
}

/**
 * Logs in a user with the provided username and password.
 * 
 * @throws {Error} - If an error occurs during the login process.
 */
export async function login(username: string, password: string): Promise<UserToken> {
    const userInfo = await fetchUser();

    if (userInfo != null) {
        console.log('Valid user token found... Skipping login...');
        return userInfo;
    }

    const flutterToken = await retryAsync(() => fetchFlutterToken(), {
        delay: 100,
        maxTry: 10,
        onError: () => {
            console.log('Retrying to fetch flutter token...');
        },
    });

    const payload = {
        username,
        password
    };

    try {
        console.log('Logging in...');
        const response = await fetch(
            Resource.Post.Login,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${flutterToken}`,
                },
                method: 'POST',
                body: JSON.stringify(payload)
            }
        ).then(res => res.json());

        const { data } = response;

        const { jwt_token: token, id: userId } = data;

        const userToken = {
            token,
            userId,
        };

        await PersistentStore.set(TvTimeValue.UserToken, userToken);

        return userToken;
    } catch (error) {
        console.error({
            message: error.message,
            status: error.status,
        });
        console.error(error);
        return Promise.reject(error);
    }
}

