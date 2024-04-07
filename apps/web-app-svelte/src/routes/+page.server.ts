// src/routes/+page.server.ts

import {prisma} from "@movies4discord/db"
import type { PageServerLoad } from './$types';

export const load = (async () => {
    // 1.
    const response = await prisma.history.findMany({
        where: {
            season: 4
        }
    });

    // 2.
    return { feed: response };
}) satisfies PageServerLoad;