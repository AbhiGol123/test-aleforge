import imageUrlBuilder from "@sanity/image-url";
import { sanity } from "./sanity";

const builder = imageUrlBuilder(sanity);

/**
 * Generate optimized Sanity image URL
 */
export function urlFor(
  source: any,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
  }
) {
  if (!source) return "";

  let img = builder.image(source);

  if (options?.width) img = img.width(options.width);
  if (options?.height) img = img.height(options.height);

  img = img.auto("format").quality(options?.quality ?? 85);

  return img.url();
}
