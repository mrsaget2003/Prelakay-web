import type { MetadataRoute } from "next";
import { appSpace } from "@/lib/config/space";
import { robotsFor } from "@/lib/config/robots";

export default function robots(): MetadataRoute.Robots {
  return robotsFor(appSpace(process.env));
}
