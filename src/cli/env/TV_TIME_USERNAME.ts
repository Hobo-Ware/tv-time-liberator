import { assertDefined } from '../../core/utils/assertDefined';
import { sha256 } from '../../core/utils/sha256';

const TV_TIME_USERNAME = assertDefined(import.meta.env.TV_TIME_USERNAME, 'Please provide TV_TIME_USERNAME environment variable.');
const USERNAME_HASH = await sha256(TV_TIME_USERNAME);

export { TV_TIME_USERNAME, USERNAME_HASH };