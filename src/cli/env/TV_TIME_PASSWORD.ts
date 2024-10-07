import { assertDefined } from '../../core/utils/assertDefined';

const TV_TIME_PASSWORD = assertDefined(import.meta.env.TV_TIME_PASSWORD, 'Please provide TV_TIME_PASSWORD environment variable.');

export { TV_TIME_PASSWORD };