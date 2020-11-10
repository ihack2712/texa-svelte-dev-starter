// Imports
import { Application, Static, compile, __dirname } from "./deps.ts";

// Create a new application.
const app = new Application(":5000");

// Create a new static files middleware
// and use it.
app.use(new Static(__dirname(import.meta) + "/www", {
	
	// Create a handlers object.
	handlers: {
		
		// A .svelte handler.
		svelte: async (filename, req) => {
			
			// Compile the requested file.
			const _ = compile(await Deno.readTextFile(filename), {
				filename,
				css: true,
				generate: "ssr",
				sveltePath: "https://esm.sh/svelte@3.29.6"
			});
			
			// Check if the client requested text/html.
			if (req.headers.has("accept") && (req.headers.get("accept")! as string).includes("html"))
			{
				// Return a rendered page.
				return [
					`<!DOCTYPE html5><html><head><meta charset="UTF-8"/></head><body><script type="module">${_.js.code.replaceAll("export default ", "(() => {const {head,html,css} =").trim().replace(/\;$/g, "") + ".render()"};document.head.innerHTML += head + \`<style>\${css.code}</style>\`; document.body.innerHTML += html;})();</script></body></html>`,
					"text/html"
				];
			}
			
			// Return the component as javascript.
			return [
				_.js.code,
				"application/javascript"
			];
		}
	},
	// A list of index files that will be looked for when
	// end-user attempts to access a directory.
	indexes: [ "index.svelte" ],
	
	// Vanity extensions that will automatically be attempted
	// to be added on the end of the URL if no extension was
	// already provided.
	vanityExtensions: [ "svelte" ]
}));

// Print the server address.
console.log("Server listening on %s", app.origin);

// Start listening for requests.
await app.start();
