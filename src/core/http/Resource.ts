export const Resource = {
    Browser: {
        /**
         * The URL of the TV Time homepage.
         */
        Homepage: 'https://app.tvtime.com/welcome',
    },
    Post: {
        /**
         * The URL to log in to the TV Time API.
         */
        Login: 'https://auth.tvtime.com/v1/login',
    },
    Get: {
        Follows: {
            /**
             * The URL to retrieve a list of follows followed series.
             *
             * @param {string} userId - The ID of the user to retrieve the follows for.
            */
            Series: (userId) => `https://app.tvtime.com/sidecar?o=https://msapi.tvtime.com/prod/v1/tracking/cgw/follows/user/${userId}&entity_type=series&sort=watched_date,desc`,
            /**
             * The URL to retrieve a list of follows followed movies.
             * 
             * @param {string} userId - The ID of the user to retrieve the follows for.
             */
            Movies: (userId) => `https://app.tvtime.com/sidecar?o=https://msapi.tvtime.com/prod/v1/tracking/cgw/follows/user/${userId}&entity_type=movie&sort=watched_date,desc`,
        },
        Series: {
            /**
             * 
             * @param {string} seriesId 
             * @returns 
             */
            Info: (seriesId) => `https://app.tvtime.com/sidecar?o=https://api2.tozelabs.com/v2/show/${seriesId}/extended`,
        }
    },
}

