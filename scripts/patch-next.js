#!/usr/bin/env node
// Patches Next.js 16.2.4 bug: /_global-error is always forced into static
// prerendering even though React is null during that phase.
// Fixes two sites: build/utils.js (worker) and export/index.js (export phase).
const fs = require('fs');
const path = require('path');

function patch(file, from, to, label) {
  const target = path.join(__dirname, '../node_modules/next/dist', file);
  const content = fs.readFileSync(target, 'utf8');
  if (content.includes(from)) {
    fs.writeFileSync(target, content.replace(from, to));
    console.log('✓ Patched', label);
  } else if (content.includes(to)) {
    console.log('✓', label, 'already patched');
  } else {
    console.warn('⚠ Could not find patch target in', label, '— version may have changed');
  }
}

// Patch 1: build/utils.js — appConfig for _global-error gets revalidate:0
// so the route is skipped in the static paths check.
patch(
  'build/utils.js',
  'appConfig = originalAppPath === _constants1.UNDERSCORE_GLOBAL_ERROR_ROUTE_ENTRY ? {} : reduceAppConfig(segments);',
  'appConfig = originalAppPath === _constants1.UNDERSCORE_GLOBAL_ERROR_ROUTE_ENTRY ? {revalidate:0} : reduceAppConfig(segments);',
  'next/dist/build/utils.js'
);

// Patch 2: export/index.js — skip /_global-error from defaultPathMap so the
// export phase doesn't try to prerender it either.
patch(
  'export/index.js',
  'if ((0, _isapppageroute.isAppPageRoute)(pageName) && !(prerenderManifest == null ? void 0 : prerenderManifest.routes[routePath]) && !(prerenderManifest == null ? void 0 : prerenderManifest.dynamicRoutes[routePath])) {',
  'if ((0, _isapppageroute.isAppPageRoute)(pageName) && pageName !== \'/_global-error\' && !(prerenderManifest == null ? void 0 : prerenderManifest.routes[routePath]) && !(prerenderManifest == null ? void 0 : prerenderManifest.dynamicRoutes[routePath])) {',
  'next/dist/export/index.js'
);
