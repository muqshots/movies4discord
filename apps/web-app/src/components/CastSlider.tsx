import PortraitPlaceholder from "@/public/PortraitPlaceholder.png";
import Image from "next/image";
import Link from "next/link";

export interface CastSliderProps {
  cast: { name: string; id: number; image: string | null; character: string }[];
}

const CastSlider = ({ cast }: CastSliderProps) => {
  return (
    <div className="scrollbar-hide flex snap-x snap-mandatory flex-row gap-6 overflow-x-auto">
      {cast.length > 0
        ? cast.map((p) => (
            (<Link key={p.id} href={`/comrade/${p.id}`}>
              <div className="snap-start">
                <div className="flex flex-col gap-2">
                  <div className="rounded-lg">
                    <Image
                      src={p.image || PortraitPlaceholder}
                      style={{ "minHeight": "240px", "minWidth": "160px", "objectFit": "contain" }}
                      width={160}
                      height={240}
                      className="rounded-lg"
                      alt={`${p.name} pic`}
                    />
                  </div>
                  <div className="flex max-w-[160px] flex-col">
                    <div className="truncate whitespace-nowrap" title={p.name}>{p.name}</div>
                    <div className="text-sm text-gray-500" title={p.character}>{p.character}</div>
                  </div>
                </div>
              </div>
            </Link>)
          ))
        : "No reported cast for this movie :("}
    </div>
  );
};

export default CastSlider;
