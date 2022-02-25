export interface SonarrEpisodeFile {
  seriesId: number;
  seriesNumber: number;
  relativePath: string;
  path: string;
  size: number;
  dateAdded: string;
  sceneName: string;
  releaseGroup: string;
  language: {
    id: number;
    name: string;
  };
  quality: {
    quality: {
      id: number;
      name: string;
      source: string;
      resolution: string;
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
    videoFps: number;
    resolution: string;
    runTime: string;
    scanType: string;
    subtitles: string;
  };
  qualityCutoffNotMet: boolean;
  languageCutoffNotMet: boolean;
  id: number;
}
