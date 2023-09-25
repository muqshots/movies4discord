// @ts-nocheck (I am too lazy)
import { hammingDistanceFromHash } from "img-hasher";
import { Fragment } from "../interfaces";

function getIntroHashes(hashes1: Fragment[], hashes2: Fragment[]) {
    let similar: Fragment[] = [];

    for (const hash1 of hashes1) {
        for (const hash2 of hashes2) {
            if (hammingDistanceFromHash(hash1.hash, hash2.hash) <= 2 && hash1.hash !== "AAAAAAA=") {
                similar.push(hash1);
            }
        }
    };

    similar = [...new Set(similar)];
    similar = similar
        .filter((item, index) => {
            if (!similar[index + 10]?.frame) return false;
            if (similar[index + 10].frame - item.frame > 100) return false;
            if (item.frame > similar[index + 10].frame) return false;
            
            return true;
        })

    console.log(`Found ${similar.length} similar hashes`, similar);
    if (!similar.length) return null;

    return {
        start: similar[0].hash,
        end: similar[similar.length - 1].hash
    }
};

export default getIntroHashes;