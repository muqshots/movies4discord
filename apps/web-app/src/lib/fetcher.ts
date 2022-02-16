import ky from "ky";

export const fetcher = async <T>(url: string): Promise<T> => {
  return await ky.get(url).json();
};
