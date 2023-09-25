/*eslint-env node*/
import { hammingDistanceFromHash } from "img-hasher";
import { rimraf } from "rimraf";
import db from "@movies4discord/db";
import workerpool from "workerpool";
import * as util from "./util";

const { prisma } = db;

function getFragmentsFromReference(hashes, reference) {
    const startHash = hashes.find((item) => hammingDistanceFromHash(item.hash, reference.start) <= 2);
    const endHash = hashes.findLast((item) => hammingDistanceFromHash(item.hash, reference.end) <= 2);

    if (!startHash || !endHash) return null;

    return {
        start: startHash,
        end: endHash
    }
};

async function getInfo(hashes, reference, framerate) {
    const fragments = getFragmentsFromReference(hashes, reference);
    if (!fragments) return null;

    const { start, end } = fragments;

    return {
        start: start.frame / framerate,
        end: end.frame / framerate,
        startFragment: start,
        endFragment: end
    }
};

async function process(filePath, introHashes, sonarrInfo, season, episode) {
    console.log(`Started splitting videos into frames for ${filePath} at Date:`, new Date());
    const frames = await util.pathToNFrames(filePath);
    console.log(`Finished splitting videos into frames for ${filePath} at Date:`, new Date());

    const framerate = frames.fileData.streams[0].r_frame_rate.split("/");
    const framerateInt = framerate[0] / framerate[1];

    console.log(`Started hashing frames for ${filePath} at Date:`, new Date());
    const hash = await util.hashAllImages(frames.path);
    console.log(`Finished hashing frames for ${filePath} at Date:`, new Date());

    const info = await getInfo(hash, introHashes, framerateInt);
    if (!info) {
        console.log("No info found");
        return;
    };
    
    await rimraf(frames.path);

    await prisma.introTimestamp.create({
        data: {
            tvdbId: sonarrInfo.tvdbId,
            season,
            episode,
            startTimestamp: info.start,
            endTimestamp: info.end
        }
    });

    return info;
};

workerpool.worker({
    process,
})