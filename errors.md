6:57:39 PM: build-image version: 207bd4d38e2cd3af6515aa37c5942e41499b616a (noble-new-builds)
6:57:39 PM: buildbot version: 420ff06ebdfb3fd8215b1a0a158ab916a07fe5a9
6:57:39 PM: Fetching cached dependencies
6:57:39 PM: Starting to download cache of 49.4MB (Last modified: 2026-03-15 13:02:44 +0000 UTC)
6:57:39 PM: Downloaded cache in 323ms
6:57:40 PM: Extracted cache in 680ms
6:57:40 PM: Fetched cache in 1.037s
6:57:40 PM: Starting to prepare the repo for build
6:57:40 PM: Preparing Git Reference refs/heads/master
6:57:41 PM: Installing dependencies
6:57:41 PM: mise ~/.config/mise/config.toml tools: python@3.14.3
6:57:41 PM: mise ~/.config/mise/config.toml tools: ruby@3.4.8
6:57:42 PM: mise ~/.config/mise/config.toml tools: go@1.26.0
6:57:42 PM: Downloading and installing node v22.22.1...
6:57:42 PM: Downloading https://nodejs.org/dist/v22.22.1/node-v22.22.1-linux-x64.tar.xz...
6:57:42 PM: Computing checksum with sha256sum
6:57:42 PM: Checksums matched!
6:57:45 PM: Now using node v22.22.1 (npm v10.9.4)
6:57:45 PM: Enabling Node.js Corepack
6:57:45 PM: No npm workspaces detected
6:57:46 PM: Installing npm packages using npm version 10.9.4
6:57:53 PM: npm warn ERESOLVE overriding peer dependency
6:57:53 PM: npm warn While resolving: use-sync-external-store@1.2.0
6:57:53 PM: npm warn Found: react@19.0.0
6:57:53 PM: npm warn node_modules/react
6:57:53 PM: npm warn   react@"19.0.0" from the root project
6:57:53 PM: npm warn   5 more (framer-motion, lucide-react, motion, react-dom, zustand)
6:57:53 PM: npm warn
6:57:53 PM: npm warn Could not resolve dependency:
6:57:53 PM: npm warn peer react@"^16.8.0 || ^17.0.0 || ^18.0.0" from use-sync-external-store@1.2.0
6:57:53 PM: npm warn node_modules/zustand/node_modules/use-sync-external-store
6:57:53 PM: npm warn   use-sync-external-store@"1.2.0" from zustand@4.5.2
6:57:53 PM: npm warn   node_modules/zustand
6:57:53 PM: npm warn
6:57:53 PM: npm warn Conflicting peer dependency: react@18.3.1
6:57:53 PM: npm warn node_modules/react
6:57:53 PM: npm warn   peer react@"^16.8.0 || ^17.0.0 || ^18.0.0" from use-sync-external-store@1.2.0
6:57:53 PM: npm warn   node_modules/zustand/node_modules/use-sync-external-store
6:57:53 PM: npm warn     use-sync-external-store@"1.2.0" from zustand@4.5.2
6:57:53 PM: npm warn     node_modules/zustand
6:57:54 PM: npm warn deprecated sourcemap-codec@1.4.8: Please use @jridgewell/sourcemap-codec instead
6:57:55 PM: npm warn deprecated source-map@0.8.0-beta.0: The work that was done in this beta branch won't be included in future versions
npm warn deprecated glob@11.1.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
6:57:55 PM: added 253 packages in 10s
6:57:55 PM: npm packages installed
6:57:55 PM: Successfully installed dependencies
6:57:56 PM: Detected 1 framework(s)
6:57:56 PM: "vite" at version "6.4.1"
6:57:56 PM: Starting build script
6:57:56 PM: Section completed: initializing
Building
Failed
6:57:58 PM: Netlify Build                                                 
6:57:58 PM: ────────────────────────────────────────────────────────────────
6:57:58 PM: ​
6:57:58 PM: ❯ Version
6:57:58 PM:   @netlify/build 35.8.7
6:57:58 PM: ​
6:57:58 PM: ❯ Flags
6:57:58 PM:   accountId: 69a9759998ff456accdb57f5
6:57:58 PM:   baseRelDir: true
6:57:58 PM:   buildId: 69b6f3119a840fd5b73db80b
6:57:58 PM:   deployId: 69b6f3119a840fd5b73db80d
6:57:58 PM: ​
6:57:58 PM: ❯ Current directory
6:57:58 PM:   /opt/build/repo
6:57:58 PM: ​
6:57:58 PM: ❯ Config file
6:57:58 PM:   /opt/build/repo/netlify.toml
6:57:58 PM: ​
6:57:58 PM: ❯ Context
6:57:58 PM:   production
6:57:58 PM: ​
6:57:58 PM: build.command from netlify.toml                               
6:57:58 PM: ────────────────────────────────────────────────────────────────
6:57:58 PM: ​
6:57:58 PM: $ npm run build
6:57:58 PM: > risk@0.0.0 build
6:57:58 PM: > vite build
6:57:59 PM: vite v6.4.1 building for production...
6:57:59 PM: transforming...
6:58:00 PM: [vite:css][postcss] @import must precede all other statements (besides @charset or empty @layer)
6:58:00 PM: 17 |  }
6:58:00 PM: 18 |
6:58:00 PM: 19 |  @import url('https://fonts.googleapis.com/css2?family=Mansalva&amp;family=Noto+Serif:wght@400;700&amp;family=Nanum+Gothic+Coding:wght@400;700&amp;family=ZCOOL+XiaoWei&amp;family=Roboto:wght@400;700&amp;family=Mirza:wght@400;500;600;700&amp;family=Lavishly+Yours&amp;family=Amita:wght@400;700&amp;family=Handjet:wght@400;700&amp;family=Noto+Serif+HK:wght@400;700&amp;display=swap');
6:58:00 PM:    |  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
6:58:00 PM: 20 |
6:58:00 PM: 21 |  /* Custom Character Fonts */
6:58:03 PM: ✓ 2765 modules transformed.
6:58:04 PM: [plugin vite:reporter]
6:58:04 PM: (!) /opt/build/repo/services/soundEngine.ts is dynamically imported by /opt/build/repo/components/WorldMap.tsx but also statically imported by /opt/build/repo/App.tsx, /opt/build/repo/store/useGameStore.ts, dynamic import will not move module into another chunk.
6:58:04 PM: 
6:58:04 PM: rendering chunks...
6:58:04 PM: computing gzip size...
6:58:04 PM: dist/registerSW.js                  0.14 kB
6:58:04 PM: dist/manifest.webmanifest           0.38 kB
6:58:04 PM: dist/index.html                     5.53 kB │ gzip:   1.96 kB
6:58:04 PM: dist/assets/index-CJKXAfF0.css     53.38 kB │ gzip:   8.50 kB
6:58:04 PM: dist/assets/index-twif-JWc.js   1,065.56 kB │ gzip: 313.57 kB
6:58:04 PM: 
6:58:04 PM: (!) Some chunks are larger than 500 kB after minification. Consider:
6:58:04 PM: - Using dynamic import() to code-split the application
6:58:04 PM: - Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
6:58:04 PM: - Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
6:58:04 PM: ✓ built in 5.08s
6:58:05 PM: PWA v0.21.2
6:58:05 PM: mode      generateSW
6:58:05 PM: precache  6 entries (1098.25 KiB)
6:58:05 PM: files generated
6:58:05 PM:   dist/sw.js
6:58:05 PM:   dist/workbox-8c29f6e4.js
6:58:05 PM: ​
6:58:05 PM: (build.command completed in 7.1s)
6:58:06 PM: ​
6:58:06 PM: Scanning for secrets in code and build output.                
6:58:06 PM: ────────────────────────────────────────────────────────────────
6:58:06 PM: ​
6:58:06 PM: ​
6:58:06 PM: ❯ Scanning complete. 63 file(s) scanned. Secrets scanning found 1 instance(s) of secrets in build output or repo code.
6:58:06 PM: ​
6:58:06 PM: Secret env var "VITE_BACKEND_URL"'s value detected:
  found value at line 443 in dist/assets/index-twif-JWc.js
6:58:06 PM: ​
6:58:06 PM: To prevent exposing secrets, the build will fail until these secret values are not found in build output or repo files.
6:58:06 PM: ​
6:58:06 PM: If these are expected, use SECRETS_SCAN_OMIT_PATHS, SECRETS_SCAN_OMIT_KEYS, or SECRETS_SCAN_ENABLED to prevent detecting.
6:58:06 PM: ​
6:58:06 PM: For more information on secrets scanning, see the Netlify Docs: https://ntl.fyi/configure-secrets-scanning
6:58:06 PM: ​
6:58:06 PM: Secrets scanning detected secrets in files during build.      
6:58:06 PM: ────────────────────────────────────────────────────────────────
6:58:06 PM: ​
6:58:06 PM:   Error message
6:58:06 PM:   Secrets scanning found secrets in build.
6:58:06 PM: ​
6:58:06 PM:   Resolved config
6:58:06 PM:   build:
6:58:06 PM:     command: npm run build
6:58:06 PM:     commandOrigin: config
6:58:06 PM:     environment:
6:58:06 PM:       - VITE_BACKEND_URL
6:58:06 PM:     publish: /opt/build/repo/dist
6:58:06 PM:     publishOrigin: config
6:58:06 PM:   redirects:
6:58:06 PM:     - from: /*
      status: 200
      to: /index.html
  redirectsOrigin: config
6:58:06 PM: Build failed due to a user error: Build script returned non-zero exit code: 2
6:58:06 PM: Failing build: Failed to build site
6:58:06 PM: Finished processing build request in 27.454s
6:58:06 PM: Failed during stage 'building site': Build script returned non-zero exit code: 2 (https://ntl.fyi/exit-code-2)