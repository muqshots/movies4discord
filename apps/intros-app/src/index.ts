import db from "@movies4discord/db";
import * as interfaces from "@movies4discord/interfaces";
import { resolve } from "path";
import express from "express";
import QuickLRU from "quick-lru";
import workerpool from "workerpool";
import fs, { existsSync, readFileSync } from "fs";
import * as util from "./util";
import { rimraf } from "rimraf";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sonarr: interfaces.SonarrTV[] = [];
if (process.env.NODE_ENV !== "production") {
  sonarr = JSON.parse(readFileSync(resolve(`./sonarr.json`)).toString());
} else {
  throw new Error("todo")
};

const { prisma } = db;
const app = express();

const introLru = new QuickLRU<string, string>({
  maxSize: 99999,
  maxAge: 1000 * 60 * 30, // 30 minutes
});

const pool = workerpool.pool(resolve("worker.js"), {
  maxWorkers: 4
});

app.get("/process/:tvdbId", async (req, res) => {
  const { tvdbId } = req.params;
  const series = sonarr.find((item) => item.tvdbId === parseInt(tvdbId));

  if (!series) return res.status(404).json({ error: "Series not found" });

  const seriesPath = series.path;
  const folders: string[] = await fs.promises.readdir(seriesPath);

  const data = await prisma.introHash.findMany({
    where: {
      tvdbId: series.tvdbId
    }
  });

  if (!data) {
    for (const folder of folders) {
      const seasonFolder = resolve(`${seriesPath}/${folder}`);
      const files: string[] = await fs.promises.readdir(seasonFolder);
      if (!existsSync(resolve(`${seasonFolder}/${files[1]}`))) continue;
      if (!existsSync(resolve(`${seasonFolder}/${files[2]}`))) continue;

      console.log(`Started splitting videos into frames for ${series.title} at`, new Date());
      const [episode1, episode2] = await Promise.all([
        util.pathToNFrames(resolve(`${seasonFolder}/${files[1]}`)),
        util.pathToNFrames(resolve(`${seasonFolder}/${files[2]}`))
      ]);

      console.log(`Finished splitting videos into frames for ${series.title} at Date:`, new Date());

      console.log(`Started hashing frames for ${series.title} at Date:`, new Date());
      const [hash1, hash2] = await Promise.all([
        util.hashAllImages(episode1.path),
        util.hashAllImages(episode2.path)
      ]);
      console.log(`Finished hashing frames for ${series.title} at Date:`, new Date());

      const hashes = util.getIntroHashes(hash1, hash2);
      if (!hashes) continue;
      await prisma.introHash.create({
        data: {
          tvdbId: series.tvdbId,
          season: folder.replace(/\D/g, "") !== "" ? parseInt(folder.replace(/\D/g, "")) : 0,
          startHash: hashes.start,
          endHash: hashes.end
        }
      });

      await rimraf([episode1.path, episode2.path]);
    };
  };

  for (const [folderIndex, folder] of folders.entries()) {
    const seasonFolder = resolve(`${seriesPath}/${folder}`);
    const files: string[] = await fs.promises.readdir(seasonFolder);

    const data = await prisma.introHash.findFirst({
      where: {
        tvdbId: series.tvdbId,
        season: folder.replace(/\D/g, "") !== "" ? parseInt(folder.replace(/\D/g, "")) : 0
      }
    });
    if (!data) continue;

    for (const [fileIndex, file] of files.entries()) {
      pool
        .exec('process', [
          resolve(`${seasonFolder}/${file}`),
          {
            start: data.startHash,
            end: data.endHash
          },
          series,
          !folder.includes("Special") ? folderIndex + 1 : 0,
          fileIndex + 1
        ]);
    };
  };

  res.status(200).json({});
})

app.get("/stats", async (req, res) => {
  res.status(200).json(pool.stats());
});

app.get("/timestamp/:tvdbId/:season/:episode", async (req, res) => {
  const { tvdbId, season, episode } = req.params;
  const startProcessing = Boolean(req.query.process);

  if (!tvdbId || !season || !episode) return res.status(400).json({ error: "Bad request" });

  const parsed = {
    tvdbId: parseInt(tvdbId),
    season: parseInt(season),
    episode: parseInt(episode),
  }

  if (startProcessing) {
    const series = sonarr.find((item) => item.tvdbId === parsed.tvdbId);

    if (!series) return res.status(404).json({ error: "Series not found" });
    if (parsed.season === 0) return res.status(404).json({ error: "Timestamp not found" });

    const seasonPath = resolve(`${series.path}/Season ${season}`);
    const files: string[] = await fs.promises.readdir(seasonPath);
    let data: any = await prisma.introHash.findFirst({
      where: {
        tvdbId: parsed.tvdbId,
        season: parsed.season
      }
    });

    if (!data) {
      if (!existsSync(resolve(`${seasonPath}/${files[1]}`))) return res.status(404).json({ error: "Not enough files to parse" });
      if (!existsSync(resolve(`${seasonPath}/${files[2]}`))) return res.status(404).json({ error: "Not enough files to parse" });

      console.log(`Started splitting videos into frames for ${series.title} Season ${parsed.season} at`, new Date());
      const [episode1, episode2] = await Promise.all([
        util.pathToNFrames(resolve(`${seasonPath}/${files[1]}`)),
        util.pathToNFrames(resolve(`${seasonPath}/${files[2]}`))
      ]);

      console.log(`Finished splitting videos into frames for ${series.title} Season ${parsed.season} at Date:`, new Date());

      console.log(`Started hashing frames for ${series.title} Season ${parsed.season} at Date:`, new Date());
      const [hash1, hash2] = await Promise.all([
        util.hashAllImages(episode1.path),
        util.hashAllImages(episode2.path)
      ]);

      console.log(`Finished hashing frames for ${series.title} Season ${parsed.season} at Date:`, new Date());

      const hashes = util.getIntroHashes(hash1, hash2);
      if (!hashes) return res.status(404).json({ error: "Could not get hashes" });

      data = {
        tvdbId: parsed.tvdbId,
        season: parsed.season,
        startHash: hashes.start,
        endHash: hashes.end
      };
      await prisma.introHash.create({
        data
      });

      await rimraf([episode1.path, episode2.path]);
    };

    if (!data) return res.status(404).json({ error: "Hashes not found" });

    for (const [fileIndex, file] of files.entries()) {
      pool
        .exec('process', [
          resolve(`${seasonPath}/${file}`),
          {
            start: data?.startHash,
            end: data?.endHash
          },
          series,
          parsed.season,
          fileIndex + 1
        ]);
    };
  }

  const timestamp = await prisma.introTimestamp.findFirst({
    where: parsed,
  });

  if (!timestamp) {
    return res.status(404).json({ error: "Timestamp not found" });
  };

  return res.status(200).json({
    start: timestamp.startTimestamp,
    end: timestamp.endTimestamp
  });
});

app.listen(4200, () => console.log("Intros app listening at http://localhost:4200"));
function readdirSync(seasonPath: string) {
  throw new Error("Function not implemented.");
}

