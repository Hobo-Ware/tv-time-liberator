import { SeriesEntry } from './SeriesEntry'

export type SeriesResponse = {
    data: {
        objects: SeriesEntry[];
    }
}