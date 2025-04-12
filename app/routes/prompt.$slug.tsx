import { type LoaderFunctionArgs, redirect } from "@remix-run/cloudflare";
import { getAllPrompts } from "~/lib/prompts";

// This route handles direct access to /prompt/{slug} URLs
// It redirects to the home page with a URL parameter that will trigger the modal to open
export async function loader({ params, context, request }: LoaderFunctionArgs) {
    // Get the slug from the route params
    const slug = params.slug;

    if (!slug) {
        // If no slug is provided, redirect to the home page
        return redirect('/');
    }

    // Load all prompts to validate the slug exists
    const prompts = await getAllPrompts(context.env, request);

    // Check if the slug exists among the prompts
    const promptExists = prompts.some(prompt => prompt.slug === slug);

    // If the slug doesn't match any prompt, redirect to the home page
    if (!promptExists) {
        console.warn(`No prompt found with slug: ${slug}`);
        return redirect('/');
    }

    // Redirect to the home page with a query parameter to open the specific prompt
    return redirect(`/?prompt=${slug}`);
}
