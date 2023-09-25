// @ts-nocheck (too lazy)
import { readFileSync, readdirSync } from "fs";
import { Fragment } from "../interfaces";
import { HashAlgorithm, getHash } from "img-hasher";

async function hashAllImages(path: string): Promise<Fragment[]> {
    const files = readdirSync(path);
    const hashes = await Promise.all(
        files.map(async file =>
            getHash(readFileSync(`${path}/${file}`), HashAlgorithm.DoubleGradient)
        )
    );

    return hashes.map((hash, index) => ({
        hash,
        frame: parseInt(files[index].split("_")[1].split(".")[0]) * 10
    }));
};

export default hashAllImages;