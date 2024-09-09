import axios from 'axios';

export function setAuthorizationHeader(token: string): void {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
