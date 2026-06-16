import { request, Resource } from '../http';

type RatingSetResponse = {
    data: {
        set: string;
        order: string;
    };
};

type RatingVotesResponse = {
    data: {
        user_votes: Array<{ rating_id: number }>;
    };
};

let ratingMappingPromise: Promise<Map<number, number>> | null = null;

/**
 * Fetches the TV Time star rating set once and returns a map from rating_id
 * to the equivalent Trakt-compatible 1-10 score (TV Time uses a 1-5 star
 * scale, doubled here for parity with Trakt's CSV import).
 */
export function getRatingMapping(): Promise<Map<number, number>> {
    if (ratingMappingPromise == null) {
        ratingMappingPromise = request<RatingSetResponse>(Resource.Get.Ratings.Set)
            .then(({ data: { order } }) => {
                const ids = order.split(',').map(id => parseInt(id, 10));
                return new Map(ids.map((id, index) => [id, (index + 1) * 2]));
            })
            .catch(() => new Map<number, number>());
    }

    return ratingMappingPromise;
}

async function resolveRating(url: string): Promise<number | null> {
    const mapping = await getRatingMapping();
    if (mapping.size === 0) {
        return null;
    }

    try {
        const response = await request<RatingVotesResponse>(url);
        const vote = response.data?.user_votes?.[0];
        if (vote == null) {
            return null;
        }

        return mapping.get(vote.rating_id) ?? null;
    } catch {
        return null;
    }
}

export function getMovieRating(movieUuid: string, userId: string): Promise<number | null> {
    return resolveRating(Resource.Get.Ratings.Movie(movieUuid, userId));
}

export function getEpisodeRating(episodeId: number, userId: string): Promise<number | null> {
    return resolveRating(Resource.Get.Ratings.Episode(episodeId, userId));
}
