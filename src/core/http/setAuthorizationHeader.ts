import { authorizationHeader } from './internal/authorizationHeader';

export function setAuthorizationHeader(token: string): void {
    authorizationHeader['Authorization'] = `Bearer ${token}`;
}
