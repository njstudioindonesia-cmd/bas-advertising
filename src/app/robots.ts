import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://cetakinc.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/urang-dalam-bas-adv",
          "/urang-dalam-bas-adv/",
          "/admin",
          "/vendor/",
          "/driver/",
          "/invoice/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
