import ky from "ky";
import { useState } from "react";
import { prisma, Server } from "@movies4discord/db";
import { GetServerSidePropsContext } from "next";
import InferNextProps from "infer-next-props-type";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";

const Settings = ({
  defaultServer,
  trakt
}: InferNextProps<typeof getServerSideProps>) => {
  const [server, setServer] = useState<Server>(defaultServer);
  const [autoPlay, setAutoPlay] = useState(false)

  return (
    <><div className="overflow-x-hidden">
      <div className="flex flex-col items-center justify-center">
        <div className="mt-5 items-start text-xl font-bold">
          User Settings
        </div>
      </div>
      <div className="flex w-3/4 md:w-full flex-col md:flex-row md:justify-evenly md:items-baseline items-center md:ml-5 ml-12">
        <div className="w-auto flex-col">
          <div className="mt-10 flex flex-row items-center justify-between pb-3">
            <p className="text-2xl font-bold">Select Region</p>
          </div>

          <div className="grid w-full grid-rows-2 gap-y-4 text-center">
            {["EU", "US", "AS"].map((region) => (
              <div
                key={region}
                className={`className="h-full text-base" w-full rounded-md py-2 px-4 transition duration-200 ${
                  server === region
                      ? "cursor-not-allowed bg-white text-black hover:bg-graything hover:text-white"
                      : "bg-graything hover:cursor-pointer hover:bg-white hover:text-black"
                }`}
                onClick={() => {
                  
                  if (server !== region) {
                      ky.post(`/api/server?server=${region}`);
                      setServer(region as Server);
                    }
                }}
              >
                {region}
              </div>
            ))}
          </div>
        </div>
        <div className="w-auto flex-col">
          <div className="mt-10 flex flex-row items-center justify-center pb-3">
            <p className="text-2xl font-bold">Link Accounts</p>
          </div>

          <div className="grid w-full grid-rows-2 gap-y-4 text-center">
            {["Trakt"].map((account) => (
              <div
                key={account}
                className={`className="h-full text-base" w-full rounded-md py-2 px-4 transition duration-200 ${
                  trakt?.access_token
                    ? "cursor-not-allowed bg-white text-black hover:bg-graything hover:text-white"
                    : "bg-graything hover:cursor-pointer hover:bg-white hover:text-black"
                }`}
                onClick={() => {
                  if (!trakt?.access_token) {
                    window.location.replace("/api/auth/trakt");
                  }
                }}
              >
                <p>{account}</p>
                {trakt?.access_token && (
                <p className="text-[75%]">Logged in as {trakt?.providerAccountId}</p>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* <div className="w-auto flex-col">
          <div className="flex flex-row items-center justify-center pb-3">
            <p className="text-2xl font-bold">Toggle Autoplay</p>
          </div>

          <div className="grid w-full grid-rows-3 gap-y-4 text-center">
            <div
              key={"autoPlay"}
              className={`className="h-full text-base" w-full rounded-md py-2 px-4 transition duration-200 ${
                autoPlay
                  ? "bg-white text-black hover:bg-graything hover:text-white hover:cursor-pointer"
                  : "bg-graything hover:cursor-pointer hover:bg-white hover:text-black"
              }`}
              onClick={() => {setAutoPlay(!autoPlay)}}
            >
              <p>{autoPlay ? "Toggle off" : "Toggle on"}</p>
            </div>
          </div>
        </div> */}
      </div>
      </div>
    </>
  );
};

export const getServerSideProps = async ({
  req,
  res
}: GetServerSidePropsContext) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/"
      },
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.userID,
    },
    include: {
      accounts: true,
    },
  });

  if (!user) {
    return {
      redirect: {
        destination: "/api/auth/signin"
      },
    };
  }

  return {
    props: {
      defaultServer: user.server,
      trakt: user.accounts.find((account) => account.provider === "trakt") || null,
    },
  };
}

export default Settings;
