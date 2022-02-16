import { ImageProps } from "next/image";

// Given image src and b64? return src, placeholder, blurDataUrl

export const getImageData = (
  src: ImageProps["src"],
  b64: string | null
): Pick<ImageProps, "src" | "placeholder" | "blurDataURL"> => {
  return {
    src: src,
    placeholder: b64 || typeof src !== "string" ? "blur" : "empty",
    blurDataURL: b64 ?? undefined,
  };
};
