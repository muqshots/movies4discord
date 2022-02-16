export interface PodnapisiResults {
  aggs: {
    flags: {
      hearing_impaired: number;
      high_definition: number;
    };
    fps: { [key: string]: number }; // "23.976": 4
    language: { [key: string]: number }; // "en": 4
    movie_type: { [key: string]: number }; // "movie": 4
  };
  all_pages: number;
  data: {
    audited: boolean;
    contributions: any[];
    contributor: { id: number; name: string; type: string };
    created: string;
    custom_releases: string[];
    download: string;
    flags: string[];
    fps: string;
    id: string;
    language: string;
    movie: {
      aliases: any[];
      episode_info: null;
      id: string;
      posters: { inline: string; normal: string; small: string; title: string };
      providers: string[];
      slug: string;
      title: string;
      type: "movie";
      year: number;
    };
    notes: null;
    num_cds: number;
    rejected: null;
    releases: any[];
    state: string;
    stats: {
      characters: number;
      characters_per_line: number;
      downloads: number;
      lines: number;
      lines_per_unit: number;
      parts: number;
      units: number;
    };
    url: string;
  }[];
  page: number;
  per_page: number;
  status: string;
}
