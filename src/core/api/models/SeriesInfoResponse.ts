export interface SeriesInfoResponse {
    seasons: Season[];
    id: number;
    name: string;
  }
  
  interface Season {
    id: string;
    number: number;
    episode_watched_count: number;
    episodes: Episode[];
  }
  
  interface Episode {
    is_watched: boolean;
    id: number;
    number: number;
    is_special: boolean;
  }
  