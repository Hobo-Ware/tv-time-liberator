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
        /**
         * The URL to retrieve the user's media lists.
         * 
         * @param userId - The ID of the user to retrieve the lists for.
         * @returns 
         */
        Lists: (userId: string) => `https://app.tvtime.com/sidecar?o=https://msapi.tvtime.com/prod/v2/lists/user/${userId}&expand=meta`,
        Favorites: {
            /**
             * The URL to retrieve a list of favorited movies.
             * 
             * @param userId - The ID of the user to retrieve the favorites for.
             * @returns 
             */
            Movies: (userId: string) => `https://app.tvtime.com/sidecar?o=https://msapi.tvtime.com/prod/v2/lists/user/${userId}/lists/favorite-movies&expand=all`,
            /**
             * The URL to retrieve a list of favorited shows.
             * 
             * @param userId - The ID of the user to retrieve the favorites for.
             * @returns 
             */
            Shows: (userId: string) => `https://app.tvtime.com/sidecar?o=https://msapi.tvtime.com/prod/v2/lists/user/${userId}/lists/favorite-series&expand=all`,
        },
        Follows: {
            /**
             * The URL to retrieve a list of followed shows.
             *
             * @param {string} userId - The ID of the user to retrieve the follows for.
            */
            Shows: (userId: string) => `https://app.tvtime.com/sidecar?o=https://msapi.tvtime.com/prod/v1/tracking/cgw/follows/user/${userId}&entity_type=series&sort=watched_date,desc`,
            /**
             * The URL to retrieve a list of followed movies.
             * 
             * @param {string} userId - The ID of the user to retrieve the follows for.
             */
            Movies: (userId: string) => `https://app.tvtime.com/sidecar?o=https://msapi.tvtime.com/prod/v1/tracking/cgw/follows/user/${userId}&entity_type=movie&sort=watched_date,desc`,
        },
        Movie: {
            GetByUUID: (uuid: string) => `https://app.tvtime.com/sidecar?o=https://msapi.tvtime.com/prod/v1/movies/${uuid}`,
        },
        Shows: {
            GetByUUID: (uuid: string) => `https://app.tvtime.com/sidecar?o=https://msapi.tvtime.com/v1/series/${uuid}`,
            /**
             * 
             * @param {string} showId
             */
            Info: (showId: number) => `https://app.tvtime.com/sidecar?o=https://api2.tozelabs.com/v2/show/${showId}/extended&fields=id,is_watched,watched_date,watched_count`,
        },
        Episode: {
            /**
             * 
             * @param {string} episodeId 
             */
            Info: (episodeId: number) => `https://app.tvtime.com/sidecar?o=https://api2.tozelabs.com/v2/episode/${episodeId}&fields=id,is_watched,watched_date,watched_count`,
        },
        User: 'https://app.tvtime.com/sidecar?o=https://users.tvtime.com/v1/users/user',
    },
}

