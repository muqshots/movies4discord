/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
// i do this because i don't feel like fixing eslint shit, code is fine

import { mkdirSync, readdirSync, readFileSync } from "fs";
import { tmpdir } from "os";
import { resolve } from "path";
import ffmpeg from "fluent-ffmpeg";
import phash from "sharp-phash";
import dist from "sharp-phash/distance.js";

interface Fragment {
    hash: string;
    frame: number;
};

interface FramesInfo {
    fileData: Record<string, any>;
    path: string;
};

function pathToNFrames(path: string): Promise<FramesInfo> {
    const folder = resolve(`${tmpdir()}/tv-intro-detector/${(Math.random() + 1).toString(36).substring(2)}`);
    mkdirSync(folder, { recursive: true });

    return new Promise<FramesInfo>((resolve, reject) => {
        ffmpeg.ffprobe(path, (err: Error, data: Record<string, any>) => {
            let duration = data.streams[0].duration / 4;
            if (duration > 10 * 60) duration = 10 * 60;

            const command = ffmpeg(path);
            command
                .outputOptions([
                    "-vf", "select=not(mod(n\\,10))",
                    "-vsync", "vfr"
                ])
                .output(`${folder}/image_%03d.jpg`)
                .duration(duration)
                .on("end", () => resolve({
                    fileData: data,
                    path: folder
                }))
                .on("error", () => reject(err))
                .run();
        });
    })
};

async function hashAllImages(path: string): Promise<Fragment[]> {
    const files = readdirSync(path);
    const hashes = await Promise.all(
        files.map(async file =>
            phash(readFileSync(`${path}/${file}`))
        )
    );

    return hashes.map((hash, index) => ({
        hash: parseInt(hash, 2).toString(16),
        frame: parseInt(files[index].split("_")[1].split(".")[0]) * 10
    }));
};

function getIntroHashes(hashes1: Fragment[], hashes2: Fragment[]) {
    const similar = hashes1.filter((item, index) => {
        if (!hashes2[index]) return false;
        return dist(item.hash, hashes2[index].hash) <= 2;
    });

    if (!similar.length) return null;

    return {
        start: similar[0].hash,
        end: similar[similar.length - 1].hash
    }
};

function getFragmentsFromReference(hashes: Fragment[], reference: Record<string, string>) {
    const startHash = hashes.find((item) => dist(item.hash, reference.start) <= 2);
    const endHash = hashes.findLast((item) => dist(item.hash, reference.end) <= 2);

    if (!startHash || !endHash) return null;

    return {
        start: startHash,
        end: endHash
    }
};

async function getInfo(hashes: Fragment[], reference: Record<string, string>, framerate: number) {
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

const introDetector = {
    pathToNFrames,
    hashAllImages,
    getIntroHashes,
    getInfo
}

export default introDetector;