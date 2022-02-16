import express from "express";
import { got } from "got";
import cors from "cors";
import fs from "fs";

const app = express();

const allowlist = ["https://movies4discord.xyz", "http://localhost:3000"];

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
});

app.get("/", async (req, res) => {
  const viewkey = req.query.viewkey as string | undefined;
  if (!viewkey) {
    res.status(422).json({ error: "No viewkey given" });
    return;
  }
  const apiData = await api
    .get("key", { searchParams: { viewkey } })
    .json<{ name: string; path: string; err: false }>()
    .catch((err) => ({ err: true as const, message: err.response.body }));

  if (apiData.err) {
    res.status(500).json(apiData.message);
    return;
  }

  fs.stat(apiData.path, (err, stats) => {
    if (err) {
      if (err.code === "ENOENT") {
        // 404 Error if file not found
        res.end("File not found, wait 10m or then contact admins.");
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
