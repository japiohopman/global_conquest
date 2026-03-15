Initializing
Complete
7:00:17 PM: Waiting for other deploys from your team to complete. Check the queue: https://app.netlify.com/teams/jaaphopmanwork/builds
7:00:42 PM: build-image version: 207bd4d38e2cd3af6515aa37c5942e41499b616a (noble-new-builds)
7:00:42 PM: buildbot version: 420ff06ebdfb3fd8215b1a0a158ab916a07fe5a9
7:00:42 PM: Fetching cached dependencies
7:00:42 PM: Starting to download cache of 49.4MB (Last modified: 2026-03-15 13:02:44 +0000 UTC)
7:00:42 PM: Downloaded cache in 391ms
7:00:43 PM: Extracted cache in 778ms
7:00:43 PM: Fetched cache in 1.221s
7:00:43 PM: Starting to prepare the repo for build
7:00:43 PM: Preparing Git Reference refs/heads/master
7:00:45 PM: Installing dependencies
7:00:45 PM: mise ~/.config/mise/config.toml tools: python@3.14.3
7:00:45 PM: mise ~/.config/mise/config.toml tools: ruby@3.4.8
7:00:45 PM: mise ~/.config/mise/config.toml tools: go@1.26.0
7:00:45 PM: Downloading and installing node v22.22.1...
7:00:46 PM: Downloading https://nodejs.org/dist/v22.22.1/node-v22.22.1-linux-x64.tar.xz...
7:00:46 PM: Computing checksum with sha256sum
7:00:46 PM: Checksums matched!
7:00:48 PM: Now using node v22.22.1 (npm v10.9.4)
7:00:48 PM: Enabling Node.js Corepack
7:00:49 PM: No npm workspaces detected
7:00:49 PM: Installing npm packages using npm version 10.9.4
7:00:56 PM: npm warn ERESOLVE overriding peer dependency
7:00:56 PM: npm warn While resolving: use-sync-external-store@1.2.0
7:00:56 PM: npm warn Found: react@19.0.0
7:00:56 PM: npm warn node_modules/react
7:00:56 PM: npm warn   react@"19.0.0" from the root project
7:00:56 PM: npm warn   5 more (framer-motion, lucide-react, motion, react-dom, zustand)
7:00:56 PM: npm warn
7:00:56 PM: npm warn Could not resolve dependency:
7:00:56 PM: npm warn peer react@"^16.8.0 || ^17.0.0 || ^18.0.0" from use-sync-external-store@1.2.0
7:00:56 PM: npm warn node_modules/zustand/node_modules/use-sync-external-store
7:00:56 PM: npm warn   use-sync-external-store@"1.2.0" from zustand@4.5.2
7:00:56 PM: npm warn   node_modules/zustand
7:00:56 PM: npm warn
7:00:56 PM: npm warn Conflicting peer dependency: react@18.3.1
7:00:56 PM: npm warn node_modules/react
7:00:56 PM: npm warn   peer react@"^16.8.0 || ^17.0.0 || ^18.0.0" from use-sync-external-store@1.2.0
7:00:56 PM: npm warn   node_modules/zustand/node_modules/use-sync-external-store
7:00:56 PM: npm warn     use-sync-external-store@"1.2.0" from zustand@4.5.2
7:00:56 PM: npm warn     node_modules/zustand
7:00:56 PM: npm warn deprecated sourcemap-codec@1.4.8: Please use @jridgewell/sourcemap-codec instead
7:00:57 PM: npm warn deprecated source-map@0.8.0-beta.0: The work that was done in this beta branch won't be included in future versions
npm warn deprecated glob@11.1.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
7:00:57 PM: added 253 packages in 9s
7:00:57 PM: npm packages installed
7:00:58 PM: Successfully installed dependencies
7:00:58 PM: Detected 1 framework(s)
7:00:58 PM: "vite" at version "6.4.1"
7:00:58 PM: Starting build script
7:00:59 PM: Section completed: initializing
Building
Failed
7:01:01 PM: Netlify Build                                                 
7:01:01 PM: ────────────────────────────────────────────────────────────────
7:01:01 PM: ​
7:01:01 PM: ❯ Version
7:01:01 PM:   @netlify/build 35.8.7
7:01:01 PM: ​
7:01:01 PM: ❯ Flags
7:01:01 PM:   accountId: 69a9759998ff456accdb57f5
7:01:01 PM:   baseRelDir: true
7:01:01 PM:   buildId: 69b6f3b1bdba1faedcbbcb7b
7:01:01 PM:   deployId: 69b6f3b1bdba1faedcbbcb7d
7:01:01 PM: ​
7:01:01 PM: ❯ Current directory
7:01:01 PM:   /opt/build/repo
7:01:01 PM: ​
7:01:01 PM: ❯ Config file
7:01:01 PM:   /opt/build/repo/netlify.toml
7:01:01 PM: ​
7:01:01 PM: ❯ Context
7:01:01 PM:   production
7:01:01 PM: ​
7:01:01 PM: build.command from netlify.toml                               
7:01:01 PM: ────────────────────────────────────────────────────────────────
7:01:01 PM: ​
7:01:01 PM: $ npm run build
7:01:01 PM: > risk@0.0.0 build
7:01:01 PM: > vite build
7:01:01 PM: vite v6.4.1 building for production...
7:01:01 PM: transforming...
7:01:02 PM: [vite:css][postcss] @import must precede all other statements (besides @charset or empty @layer)
7:01:02 PM: 3  |  @tailwind utilities;
7:01:02 PM: 4  |
7:01:02 PM: 5  |  @import url('https://fonts.googleapis.com/css2?family=Mansalva&amp;family=Noto+Serif:wght@400;700&amp;family=Nanum+Gothic+Coding:wght@400;700&amp;family=ZCOOL+XiaoWei&amp;family=Roboto:wght@400;700&amp;family=Mirza:wght@400;500;600;700&amp;family=Lavishly+Yours&amp;family=Amita:wght@400;700&amp;family=Handjet:wght@400;700&amp;family=Noto+Serif+HK:wght@400;700&amp;display=swap');
7:01:02 PM:    |  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
7:01:02 PM: 6  |
7:01:02 PM: 7  |  :root {
7:01:05 PM: ✓ 2765 modules transformed.
7:01:06 PM: [plugin vite:reporter]
7:01:06 PM: (!) /opt/build/repo/services/soundEngine.ts is dynamically imported by /opt/build/repo/components/WorldMap.tsx but also statically imported by /opt/build/repo/App.tsx, /opt/build/repo/store/useGameStore.ts, dynamic import will not move module into another chunk.
7:01:06 PM: 
7:01:06 PM: rendering chunks...
7:01:06 PM: computing gzip size...
7:01:06 PM: dist/registerSW.js                  0.14 kB
7:01:06 PM: dist/manifest.webmanifest           0.38 kB
7:01:06 PM: dist/index.html                     5.53 kB │ gzip:   1.96 kB
7:01:06 PM: dist/assets/index-CJKXAfF0.css     53.38 kB │ gzip:   8.50 kB
7:01:06 PM: dist/assets/index-twif-JWc.js   1,065.56 kB │ gzip: 313.57 kB
7:01:06 PM: 
7:01:06 PM: (!) Some chunks are larger than 500 kB after minification. Consider:
7:01:06 PM: - Using dynamic import() to code-split the application
7:01:06 PM: - Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
7:01:06 PM: - Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
7:01:06 PM: ✓ built in 4.98s
7:01:08 PM: PWA v0.21.2
7:01:08 PM: mode      generateSW
7:01:08 PM: precache  6 entries (1098.25 KiB)
7:01:08 PM: files generated
7:01:08 PM:   dist/sw.js
7:01:08 PM:   dist/workbox-8c29f6e4.js
7:01:08 PM: ​
7:01:08 PM: (build.command completed in 7s)
7:01:08 PM: ​
7:01:08 PM: Scanning for secrets in code and build output.                
7:01:08 PM: ────────────────────────────────────────────────────────────────
7:01:08 PM: ​
7:01:08 PM: ​
7:01:08 PM: ❯ Scanning complete. 63 file(s) scanned. Secrets scanning found 1 instance(s) of secrets in build output or repo code.
7:01:08 PM: ​
7:01:08 PM: Secret env var "VITE_BACKEND_URL"'s value detected:
  found value at line 443 in dist/assets/index-twif-JWc.js
7:01:08 PM: ​
7:01:08 PM: To prevent exposing secrets, the build will fail until these secret values are not found in build output or repo files.
7:01:08 PM: ​
7:01:08 PM: If these are expected, use SECRETS_SCAN_OMIT_PATHS, SECRETS_SCAN_OMIT_KEYS, or SECRETS_SCAN_ENABLED to prevent detecting.
7:01:08 PM: ​
7:01:08 PM: For more information on secrets scanning, see the Netlify Docs: https://ntl.fyi/configure-secrets-scanning
7:01:08 PM: ​
7:01:08 PM: Secrets scanning detected secrets in files during build.      
7:01:08 PM: ────────────────────────────────────────────────────────────────
7:01:08 PM: ​
7:01:08 PM:   Error message
7:01:08 PM:   Secrets scanning found secrets in build.
7:01:08 PM: ​
7:01:08 PM:   Resolved config
7:01:08 PM:   build:
7:01:08 PM:     command: npm run build
7:01:08 PM:     commandOrigin: config
7:01:08 PM:     environment:
7:01:08 PM:       - VITE_BACKEND_URL
7:01:08 PM:     publish: /opt/build/repo/dist
7:01:08 PM:     publishOrigin: config
7:01:08 PM:   redirects:
7:01:08 PM:     - from: /*
      status: 200
      to: /index.html
  redirectsOrigin: config
7:01:08 PM: Build failed due to a user error: Build script returned non-zero exit code: 2
7:01:08 PM: Failing build: Failed to build site
7:01:09 PM: Finished processing build request in 26.952s
7:01:08 PM: Failed during stage 'building site': Build script returned non-zero exit code: 2 (https://ntl.fyi/exit-code-2)