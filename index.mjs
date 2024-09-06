import './setup.mjs';

import { login } from './api/index.mjs';

const [username, password] = process.env.TVTIME_CREDENTIALS.split(';');

console.log(await login(username, password));