import { Server } from "@movies4discord/db";
import ky from "ky";
import { useEffect, useState } from "react";

const ServerChip = (server: string, setServer: (server: Server) => void) => {
  const [ping, setPing] = useState<number>(0);

  useEffect(() => {
    const pingServer = async () => {
      const start = Date.now();
      await ky.get(`https://speedtest-${server.toLowerCase()}.movies4discord.xyz/empty.php?cors=true`);
      const end = Date.now();
      setPing(end - start);
    };
    pingServer();
  }, [server]);

  return (
    <div
      key={server}
      className="rounded-lg border border-white px-3 py-1.5 hover:bg-white hover:text-black"
      onClick={() => {
      setServer(server as Server);
      ky.post(`/api/server?server=${server}`);
      }}
    >
      {server} {ping > 0 && `(${ping}ms)`}
    </div>
  );
};

export default ServerChip;