// Friday Finder hand-in program (Node 22, standard library only). The site
// lives in app/ beside this file as plain static files, and its screenshots
// live in screenshots/. This program copies both into the output directory
// and writes dossier.json with the vendored make.fun library, exactly as the
// scorer rebuilds it. Leave vendor/makefun-frontend.ts untouched: the scorer
// requires the dossier to be byte for byte what its own copy writes.
//
// Revision 2 (27 November 2026): 18 more verified deals (56 total) and a
// Compare view in app/; the build contract below is unchanged.
//
// Run it outside the grader with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the site locally with `node serve.ts`, then open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const here = fileURLToPath(new URL(".", import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

mkdirSync(out, { recursive: true });
cpSync(join(here, "app"), join(out, "app"), { recursive: true });
mkdirSync(join(out, "screenshots"), { recursive: true });
if (existsSync(join(here, "screenshots"))) {
  cpSync(join(here, "screenshots"), join(out, "screenshots"), { recursive: true });
}

// Caps from the scorer's gate: at most 4 screenshots of 256 KiB, app/ at most
// 993 files and directories and 16 MiB, and the dossier text capped at 160 KiB.
writeFileSync(
  join(out, "dossier.json"),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);
