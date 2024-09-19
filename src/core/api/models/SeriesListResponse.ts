import type { SeriesEntry } from './SeriesEntry'

export type SeriesListResponse = {
    data: {
        objects: SeriesEntry[];
    }
}
