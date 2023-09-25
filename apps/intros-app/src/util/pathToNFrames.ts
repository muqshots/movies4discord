import { mkdirSync } from "fs";
import { FramesInfo } from "../interfaces";
import { resolve } from "path";
import { tmpdir } from "os";
import ffmpeg from "fluent-ffmpeg";

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

export default pathToNFrames;