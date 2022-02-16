import { sidebarState } from "@/atoms/sidebarState";
import { movieGenres, tvGenres } from "@/lib/tmdbGenres";
import logo from "@/public/logo.png";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { BsTvFill } from "react-icons/bs";
import { HiBookmark, HiClock, HiHome } from "react-icons/hi";
import { MdMovie } from "react-icons/md";
import { useRecoilState } from "recoil";

const Sidebar = () => {
  const [sidebar, setSidebar] = useRecoilState(sidebarState);

  const router = useRouter();

  const SidebarItems = [
    {
      icon: HiHome,
      text: "Home",
      link: "/",
      isCurrent: (asPath: string) => asPath === "/",
    },
    {
      icon: MdMovie,
      text: "Movies",
      link: `/genres/movie/${movieGenres[0]!.id}`,
      isCurrent: (asPath: string) => asPath.startsWith("/genres/movie/"),
    },
    {
      icon: BsTvFill,
      text: "TV",
      link: `/genres/tv/${tvGenres[0]!.id}`,
      isCurrent: (asPath: string) => asPath.startsWith("/genres/tv/"),
    },
    {
      icon: HiBookmark,
      text: "Watchlist",
      link: "/watchlist",
      isCurrent: (asPath: string) => asPath === "/watchlist",
    },
    {
      icon: HiClock,
      text: "History",
      link: "/history",
      isCurrent: (asPath: string) => asPath === "/history",
    },
  ];

  return (
    <>
      {/* Dark mobile overlay when sidebar is open */}
      <div
        className={`${
          !sidebar.mobileShown && "hidden"
        } fixed z-40 h-screen w-screen bg-black/75 md:hidden`}
        onClick={() => setSidebar((s) => ({ ...s, mobileShown: false }))}
      ></div>

      <div
        className={`${
          sidebar.mobileShown ? "ml-0" : sidebar.isOpen ? "-ml-52" : "-ml-20"
        } ${
          sidebar.isOpen ? "w-52" : "w-20"
        } bg-darktheme fixed z-50 h-screen border-r border-slate-800 transition-all duration-200 md:ml-0`}
      >
        <div className="mx-6 flex flex-col gap-10">
          <div
            className="flex h-20 cursor-pointer flex-row items-center justify-between gap-4"
            onClick={() => setSidebar((s) => ({ ...s, isOpen: !s.isOpen }))}
          >
            {sidebar.isOpen && (
              <div className={`${!sidebar.isOpen && "hidden"}`}>
                Movies4Discord
              </div>
            )}
            <div
              className={`mt-1 transition duration-200 ${
                sidebar.isOpen && "rotate-90"
              }`}
            >
              <Image
                src={logo}
                layout="fixed"
                height={34}
                width={34}
                alt="logo"
              />
            </div>
          </div>
          <div className="flex flex-col gap-6">
            {SidebarItems.map((item) => {
              const isCurrentPage = item.isCurrent(router.asPath);
              const IconTag = item.icon;
              return (
                <Link href={item.link} key={item.text}>
                  <a aria-label={item.text}>
                    <div className="group flex cursor-pointer flex-row items-center gap-4 hover:animate-[pulse_1.2s_ease-in-out_infinite]">
                      <div
                        className={`${
                          isCurrentPage ? "bg-white text-black" : "bg-graything"
                        } rounded-full p-2 transition-all duration-200 group-hover:scale-105 group-hover:bg-white group-hover:text-black`}
                      >
                        <IconTag className="h-[1.125rem] w-[1.125rem]" />
                      </div>
                      {
                        <span
                          className={`${!sidebar.isOpen && "hidden"} ${
                            isCurrentPage ? "text-white" : "text-[#808191]"
                          } text-lg transition duration-200 group-hover:text-white`}
                        >
                          {item.text}
                        </span>
                      }
                    </div>
                  </a>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
