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
             * @param {number} page - The page number (1-based).
            */
            Shows: (userId: string, page = 1) => `https://app.tvtime.com/sidecar?o=https://msapi.tvtime.com/prod/v1/tracking/cgw/follows/user/${userId}&entity_type=series&sort=watched_date,desc&page_offset=${(page - 1) * 500}&page_limit=500`,
            /**
             * The URL to retrieve a list of followed anime shows.
             *
             * @param {string} userId - The ID of the user to retrieve the follows for.
             * @param {number} page - The page number (1-based).
             */
            Anime: (userId: string, page = 1) => `https://app.tvtime.com/sidecar?o=https://msapi.tvtime.com/prod/v1/tracking/cgw/follows/user/${userId}&entity_type=anime&sort=watched_date,desc&page_offset=${(page - 1) * 500}&page_limit=500`,
            /**
             * The URL to retrieve a list of followed movies.
             * 
             * @param {string} userId - The ID of the user to retrieve the follows for.
             * @param {number} page - The page number (1-based).
             */
            Movies: (userId: string, page = 1) => `https://app.tvtime.com/sidecar?o=https://msapi.tvtime.com/prod/v1/tracking/cgw/follows/user/${userId}&entity_type=movie&sort=watched_date,desc&page_offset=${(page - 1) * 500}&page_limit=500`,
        },
        EpisodeWatches: (userId: string, page = 1) => `https://app.tvtime.com/sidecar?o=https://msapi.tvtime.com/prod/v1/tracking/watches/user/${userId}&entity_type=episode&page_offset=${(page - 1) * 500}&page_limit=500`,
        Ratings: {
            /**
             * The URL to fetch the rating set definition (rating_id → star position mapping).
             */
            Set: 'https://app.tvtime.com/sidecar?o=https://msapi.tvtime.com/live/v1/ratings/sets/stars_wording_scalev2',
            /**
             * The URL to fetch a single user's rating for a movie.
             */
            Movie: (movieUuid: string, userId: string) => `https://app.tvtime.com/sidecar?o=https://msapi.tvtime.com/live/v1/ratings/votes/${movieUuid}/${userId}&set=stars_wording_scalev2`,
            /**
             * The URL to fetch a single user's rating for an episode.
             */
            Episode: (episodeId: number, userId: string) => `https://app.tvtime.com/sidecar?o=https://msapi.tvtime.com/prod/v1/ratings/votes/episode/${episodeId}/${userId}&set=stars_wording_scalev2`,
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

