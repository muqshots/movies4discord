export interface MediaThumbnailProps {
    media_type: 'movie' | 'tv';
    id: number;
    title: string;
    season: number | string | null | undefined;
    episode: number | string | null | undefined;
    tvdbId: number | string | null | undefined;
    image: {
        src: string | null;
        b64: string | null;
    };
    release_date: string | null;
    rating: number;
    adult?: boolean;
    onClick?: () => void;
    onDelete?: () => void;
    percentage?: number;
    priority?: boolean;
    overview?: string;
}