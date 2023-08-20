import { sidebarState } from "@/atoms/sidebarState";
import { getQuery } from "@/lib/getQuery";
import logo from "@/public/logo.png";
import ky from "ky";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  HiOutlineLogout,
  HiSearch,
  HiAdjustments,
} from "react-icons/hi";
import { useSetRecoilState } from "recoil";
import { debounce, throttle } from "throttle-debounce";

const Header = () => {
  const setSidebar = useSetRecoilState(sidebarState);
  const router = useRouter();

  // Pixels to scroll with transparent bg
  const transparentScroll = 128;
  // Make header top transparent for /movie/123 and /tv/123
  const hasTransparentNav = /^\/(movie|tv)\/\d+$/gm.test(router.asPath);
  const [transparentNav, setTransparentNav] = useState(hasTransparentNav);

  useEffect(() => {
    const handleScroll = throttle(150, () => {
      if (window.scrollY > transparentScroll) {
        setTransparentNav(false);
      } else {
        setTransparentNav(true);
      }
    });

    if (hasTransparentNav) {
      setTransparentNav(true);
      document.addEventListener("scroll", handleScroll);
      return () => document.removeEventListener("scroll", handleScroll);
    } else {
      setTransparentNav(false);
    }
  }, [hasTransparentNav]);

  const { data: session, status } = useSession();

  return (
    <div
      className={`${transparentNav ? "bg-transparent" : "bg-darktheme"} ${
        hasTransparentNav && !transparentNav ? "shadow-lg shadow-white/20" : ""
      } sticky top-0 z-30 flex h-20 flex-row items-center justify-between gap-2 px-6 transition-all duration-200 md:pl-0`}
    >
      <div
        className="mt-1 cursor-pointer md:hidden"
        onClick={() => setSidebar((s) => ({ ...s, mobileShown: true }))}
      >
        <Image layout="fixed" src={logo} height={34} width={34} alt="logo" />
      </div>

      <div className="relative mx-4 w-96">
        <input
          type="text"
          placeholder="Search"
          className={`h-8 w-full pr-8 ${
            transparentNav && "bg-white/10 shadow-lg backdrop-blur-sm"
          } rounded-md border-none bg-graything outline-none placeholder:text-white/50`}
          defaultValue={getQuery(router.query.query)}
          onChange={debounce(200, (e) => {
            const { value } = e.target;
            value && router.replace(`/search?query=${value}`);
          })}
        />
        <div className="absolute top-[6px] right-2 text-white/60">
          <HiSearch className="h-5 w-5" />
        </div>
      </div>

      <div className="cursor-pointer">
        {session ? (
          <div className="group flex flex-row gap-2">
            <Image
              src={session.user.image}
              layout="fixed"
              width={54}
              height={54}
              alt={`${session.user.name} pfp`}
              className="rounded-full"
            />
            <div className="hidden flex-col justify-center lg:flex">
              {session.user.name}
            </div>
            <div className="duration-250 absolute right-3 z-50 mt-[3.45rem] w-56 origin-top-right scale-0 rounded-lg border bg-theme px-5 py-5 shadow transition ease-in-out group-hover:scale-100">
              <ul className="space-y-3 text-white">
                <li className="font-medium">
                  <a
                    onClick={() => {router.push("/settings")}}
                    className="flex transform items-center border-r-4 border-transparent transition-colors duration-200 hover:border-indigo-700"
                  >
                    <div className="mr-3 text-white">
                      <HiAdjustments className="h-6 w-6" />
                    </div>
                    User Settings
                  </a>
                </li>
                <hr className="dark:border-gray-700" />
                <li className="font-medium">
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      signOut();
                    }}
                    className="flex transform items-center border-r-4 border-transparent transition-colors duration-200 hover:border-red-600"
                  >
                    <div className="mr-3 text-red-600">
                      <HiOutlineLogout className="h-6 w-6" />
                    </div>
                    Logout
                  </a>
                </li>
              </ul>
            </div>
          </div>
        ) : status === "unauthenticated" ? (
          <button
            className="rounded-md border-2 py-1.5 px-4 transition duration-150 hover:bg-white hover:text-black"
            onClick={() => signIn("discord")}
          >
            Login
          </button>
        ) : (
          <div className="flex animate-pulse flex-row items-center gap-2">
            <div className="h-[54px] w-[54px] rounded-full bg-slate-600" />
            <div className="hidden h-6 w-20 justify-center rounded-lg bg-slate-600 lg:flex" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
