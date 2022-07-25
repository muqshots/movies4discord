export interface RadarrMovieFile {
  id: number;

  movieId: number;
  relativePath: string;
  path: string;
  size: number;
  dateAdded: Date;
  indexerFlags: number;
  quality: {
    quality: {
      id: number;
      name: string;
      source: string;
      resolution: number;
      modifier: string;
    };
    revision: {
      version: number;
      real: number;
      isRepack: boolean;
    };
  };
  mediaInfo: {
    audioBitrate: number;
    audioChannels: number;
    audioCodec: string;
    audioLanguages: string;
    audioStreamCount: number;
    videoBitDepth: number;
    videoBitrate: number;
    videoCodec: string;
    videoDynamicRangeType: string;
    videoFps: number;
    resolution: string;
    runTime: string;
    scanType: string;
    subtitles: string;
  };
  qualityCutoffNotMet: boolean;
  languages: {
    id: number;
    name: string;
  }[];
  edition: string;
};