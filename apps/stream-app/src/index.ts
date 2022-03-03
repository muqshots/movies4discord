import cors from "cors";
import express from "express";
import fs from "fs";
import { got, Options, Response } from "got";
import QuickLRU from "quick-lru";
import ResponseLike from "responselike";

const app = express();

const allowlist = ["https://movies4discord.xyz", "http://localhost:3000"];

const beforeReqHook = (lru: QuickLRU<string, string>) => (options: Options) => {
  const url = (options.url as URL).href;

  if (lru.has(url)) {
    return new ResponseLike(
      200,
      { "Content-Type": "application/json", "x-lru-cache": "oui" },
      Buffer.from(lru.get(url)!),
      url
    );
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
  const viewkey = req.query.viewkey as string | undefined;
  if (!viewkey) {
    res.status(422).json({ error: "No viewkey given" });
    return;
  }
  const apiData = await api
    .get("key", {
      searchParams: { viewkey },
      retry: { limit: 4 },
    })
    .json<{ name: string; path: string; err: false }>()
    .catch((err) => {
      console.error(err);
      return {
        err: true as const,
        message: err?.response?.body || "API reach error",
      };
    });

  if (apiData.err) {
    res.status(500).json(apiData.message);
    return;
  }

  fs.stat(apiData.path, (err, stats) => {
    if (err) {
      if (err.code === "ENOENT") {
        // 404 Error if file not found
        res.status(404).end("File not found, wait 10m or then contact admins.");
        return;
      }
      res.end("500");
      return;
    }

    const range =
      req.headers.range ??
      (/firefox/i.test(req.headers["user-agent"] ?? "") ? "bytes=0-" : null);
    const total = stats.size;

    if (!range) {
      const head = {
        "Content-Length": total,
        "Content-Type": "video/mp4",
        "Content-Disposition": `filename=${apiData.name || "unknown"}.mp4`,
        // "Access-Control-Allow-Origin": origin,
      };
      res.writeHead(200, head);
      fs.createReadStream(apiData.path).pipe(res);
    } else {
      const positions = range.replace(/bytes=/, "").split("-");
      const start = parseInt(positions[0]!, 10);
      const end = positions[1] ? parseInt(positions[1], 10) : total - 1;
      const chunksize = end - start + 1;

      if (start >= end) {
        res.end("Invalid range");
        return;
      }

      res.writeHead(206, {
        "Content-Range": "bytes " + start + "-" + end + "/" + total,
        "Content-Disposition": `filename=${apiData.name || "unknown"}.mp4`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4",
        // "Access-Control-Allow-Origin": origin,
      });

      const stream = fs
        .createReadStream(apiData.path, {
          start: start,
          end: end,
        })
        .on("open", () => {
          stream.pipe(res);
        })
        .on("error", (err) => {
          res.end(err);
        });
    }
  });
});

app.listen(6969, () => console.log("App listening at http://localhost:6969"));
