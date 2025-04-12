import { type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { getAllPrompts } from "~/lib/prompts";

// Define your base URL
const BASE_URL = "https://promptllm.xyz"; // Make sure this matches your actual domain

export async function loader({ request, context }: LoaderFunctionArgs) {
    // Get all prompts to generate sitemap entries for them
    const allPrompts = await getAllPrompts(context.env, request);

    // Include static routes and dynamic prompt routes
    const staticRoutes = ["/"];

    // Generate prompt routes using their slugs
    const promptRoutes = allPrompts.map((prompt) => `/prompt/${prompt.slug}`);

    // Combine all routes
    const allRoutes = [...staticRoutes, ...promptRoutes];

    const urls = allRoutes.map((path) => {
        // If this is a prompt route, find the corresponding prompt to add more metadata
        if (path.startsWith('/prompt/')) {
            const slug = path.replace('/prompt/', '');
            const prompt = allPrompts.find(p => p.slug === slug);

            if (prompt) {
                return `
      <url>
        <loc>${BASE_URL}${path}</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
      </url>
    `.trim();
            }
        }

        // Default for static routes
        return `
      <url>
        <loc>${BASE_URL}${path}</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>${path === "/" ? "1.0" : "0.8"}</priority>
      </url>
    `.trim();
    });

    const content = `
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
      ${urls.join("")}
    </urlset>
  `.trim();

    return new Response(content, {
        status: 200,
        headers: {
            "Content-Type": "application/xml",
            "xml-version": "1.0",
            "encoding": "UTF-8",
        },
    });
}
