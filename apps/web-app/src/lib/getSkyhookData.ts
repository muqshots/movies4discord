import { skyhook } from "@/lib/got";
import { SkyhookTV } from "@movies4discord/interfaces";

const skyhookFetcher = async <T>(
  url: string,
  searchParams?: Record<string, string | number | boolean | null | undefined>
): Promise<T> => {
  return await skyhook.get(url, searchParams ? { searchParams } : {}).json<T>();
};

export const getSkyhookTV = async (id: string | number) => {
  return await skyhookFetcher<SkyhookTV>(`shows/en/${id}`);
};
