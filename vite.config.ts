import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { kvDataAdapter } from "@vinext/cloudflare/cache/kv-data-adapter";
import { imagesOptimizer } from "@vinext/cloudflare/images/images-optimizer";

export default defineConfig({
  plugins: [
    // vinext auto-injects @mdx-js/rollup with plugins from next.config.
    // The Cloudflare CDN adapter is intentionally omitted: it stamps
    // `Cache-Control: no-store` on every response that lacks an explicit
    // cache policy (see vinext's finalizeAppRscResponse), which makes the
    // vinext prerender phase treat every route as dynamic and skip it.
    // The default origin-managed adapter works fine for this static site.
    vinext({
      cache: { data: kvDataAdapter() },
      images: { optimizer: imagesOptimizer() },
      prerender: { routes: "*" },
    }),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
});
