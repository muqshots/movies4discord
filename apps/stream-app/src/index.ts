import cors from "cors";
import express from "express";
import fs from "fs";
import { got, Options, Response } from "got";
import QuickLRU from "quick-lru";
import ResponseLike from "responselike";

const app = express();

const allowlist = ["https://movies4discord.xyz", "https://testing.movies4discord.xyz", "http://localhost:3000"];

const beforeReqHook = (lru: QuickLRU<string, string>) => (options: Options) => {
  const url = (options.url as URL).href;

  if (lru.has(url)) {
    return new ResponseLike({
      statusCode: 200,
      headers: { "Content-Type": "application/json", "x-lru-cache": "oui" },
      body: Buffer.from(lru.get(url)!),
      url,
    });
  }
};

const afterResponseHook =
  (lru: QuickLRU<string, string>) => (response: Response) => {
    if (!response.headers["x-lru-cache"]) {
      if (response.statusCode === 200) {
        const url = response.requestUrl.href;
        lru.set(url, response.body as string);
      }
    }
    return response;
  };

const streamLru = new QuickLRU<string, string>({
  maxSize: 99999,
  maxAge: 300000, // 5 minutes
});

app.use(
  cors((req, callback) => {
    let corsOptions;
    if (allowlist.indexOf(req.header("Origin") ?? "") !== -1) {
      corsOptions = { origin: true };
    } else {
      corsOptions = { origin: false };
    }
    callback(null, corsOptions);
  })
);

const api = got.extend({
  prefixUrl: `${process.env!.API_URL!.replace(/\/$/, "")}/api`,
  hooks: {
    beforeRequest: [beforeReqHook(streamLru)],
    afterResponse: [afterResponseHook(streamLru)],
  },
});

app.get("/", async (req, res) => {
  const key = req.query.viewkey as string | undefined;
  if (!key) {
    res.status(422).json({ error: "No key given" });
    return;
  }
  const apiData = await api
    .get("key", {
      searchParams: { viewkey: key },
      retry: { limit: 4 },
    })
    .json<{ name: string; path: string; err: false }>()
    .catch((err) => {
      if (err.response?.statusCode !== 422) {
        console.error(err);
      }
      return {
        err: true as const,
        message: err?.response?.body || "API reach error",
      };
    });

  if (apiData.err) {
    res.status(500).json(apiData.message);
    return;
  }

  try {
    fs.stat(apiData.path, function (err, stat) {
      if (err) {
        res
          .status(404)
          .send(
            "Problem with file, if it has been downloaded recently, wait 10-15min, then try again contact admins if still does not work"
          );
        return;
      }
      const fileSize = stat.size;
      let range = req.headers.range;

      if (/firefox/i.test(req.headers["user-agent"] as string) && !range) {
        range = "bytes=0-";
      }
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0] as string, 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (start >= fileSize) {
          res
            .status(416)
            .send("Requested range not satisfiable\n" + start + " >= " + fileSize);
          return;
        }
        try {
          const chunksize = end - start + 1;
          const file = fs.createReadStream(apiData.path, { start, end });
          const head = {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunksize,
            "Content-Type": "video/mp4",
          };

          res.writeHead(206, head);
          file.pipe(res);
        } catch (err) {
          console.log(err);
          res.status(404).end("Failed to stream partial file, try again later");
        }
      } else {
        try {
          const head = {
            "Content-Length": fileSize,
            "Content-Type": "video/mp4",
          };
          res.writeHead(200, head);
          fs.createReadStream(apiData.path).pipe(res);
        } catch(err) {
          // console.log(err); too much verbosity
          res.status(404).end("Failed to stream file, try again later");
        }
      }
    });
  } catch (err) {
    console.error(err);
    return res
      .status(404)
      .send("Problem with file, if it has been downloaded recently, wait 10-15min, then try again contact admins if still does not work");
  };
});

process.on("uncaughtException", (err) => {
  console.error(err);
});

app.listen(6969, () => console.log("App listening at http://localhost:6969"));
