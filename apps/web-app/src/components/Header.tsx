import { sidebarState } from "@/atoms/sidebarState";
import { getQuery } from "@/lib/getQuery";
import logo from "@/public/logo.png";
import ky from "ky";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { HiSearch } from "react-icons/hi";
import { useSetRecoilState } from "recoil";
import { debounce, throttle } from "throttle-debounce";
import Modal from "./Modal";

const Header = () => {
  const setSidebar = useSetRecoilState(sidebarState);
  const [showModal, setShowModal] = useState(false);
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
          <div className="flex flex-row gap-2 group">
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
            <div className="scale-0 group-hover:scale-100 absolute transition duration-250 ease-in-out origin-top-right right-3 z-50 w-56 px-5 py-5 mt-[3.45rem] dark:bg-theme bg-white rounded-lg shadow border">
                <ul className="space-y-3 dark:text-white">
                  <li className="font-medium">
                    <a href="javascript:void(0);" onClick={() => setShowModal(true)} className="flex items-center transform transition-colors duration-200 border-r-4 border-transparent hover:border-indigo-700">
                      <div className="mr-3 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </div>
                        Change Server
                    </a>
                  </li>
                  <hr className="dark:border-gray-700" />
                  <li className="font-medium">
                    <a href="javascript:void(0);" onClick={() => signOut()} className="flex items-center transform transition-colors duration-200 border-r-4 border-transparent hover:border-red-600">
                      <div className="mr-3 text-red-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
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

      {showModal ? (
        <Modal>
          <div className="flex justify-between items-center pb-3">
            <p className="text-2xl font-bold">Select Region</p>
            <div className="modal-close cursor-pointer z-50 hover:opacity-50" onClick={() => setShowModal(false)}>
              <svg className="fill-current text-white" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
                <path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z"></path>
              </svg>
            </div>
          </div>

          <div className="min-w-full grid grid-cols-3 gap-x-4">
            {['EU', 'US', 'AS'].map((region) => (
              <div key={region} className="rounded-md bg-graything py-2 px-4 transition duration-200 hover:bg-white hover:text-black">
                <button onClick={() => {ky.post(`/api/server?server=${region}`); setShowModal(false);}} className="text-base w-full h-full">{region}</button>
              </div>
            ))}
          </div>
        </Modal>
      ) : null}
    </div>
  );
};

export default Header;
