import type { Genre } from "@movies4discord/interfaces";
import Link from "next/link";

interface GenreButtonProps {
  genre: Genre;
  media_type: string;
  selected: boolean;
}

const GenreButton = ({ genre: g, media_type, selected }: GenreButtonProps) => {
  return (
    <div>
      <Link key={g.id} href={`/genres/${media_type}/${g.id}`}>
        <a>
          <div
            className={`${
              selected ? "bg-white text-black" : "bg-graything"
            } w-max rounded-md p-2 text-xs transition duration-200 hover:bg-white hover:text-black`}
          >
            {g.name}
          </div>
        </a>
      </Link>
    </div>
  );
};

export default GenreButton;
