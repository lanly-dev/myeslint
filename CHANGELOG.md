# Change Log
All notable changes to the "mylint" extension will be documented in this file. \
Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [TODO]
- Update to Typescript 7
- Esbuild - if build slow
- Enable warns/errors diagnostic list
- No Bracket in short statement (need custom rule)
- Invisible space
- Illegal characters
- Limit diagnostic list items
- Allowed global variables config

## [0.0.2] 2026-07
- Add diagnosticCollection list (aka problems tab)
- Add enable problems tab option to prevent issue overwhelming
- Fix `Parsing error: ';' expected.` due to like overlapping js/ts parser
- Improve rules

## [0.0.1] 2026-07-19 🌎⚽🏆
- Context menu: MyLint formatting
- Override rule option
- Requirement based to 1.107.0 for Kiro
- webpack 5.108.4 compiled successfully in 1388 ms
- 1490 files, 4.36 MB, 1.129.0

```
WARNING  This extension consists of 1490 files, out of which 1311 are JavaScript files. For performance reasons, you should bundle your extension: https://aka.ms/vscode-bundle-extension. You should also exclude unnecessary files by adding them to your .vscodeignore: https://aka.ms/vscode-vscodeignore.

INFO  Files included in the VSIX:
mylint-0.0.1.vsix
├─ [Content_Types].xml
├─ extension.vsixmanifest
└─ extension/
   ├─ LICENSE.txt [1.06 KB]
   ├─ changelog.md [3.25 KB]
   ├─ package.json [2.35 KB]
   ├─ readme.md [0.83 KB]
   ├─ dist/ (1 file) [5.32 KB]
   ├─ media/ (1 file) [45.17 KB]
   └─ node_modules/ (1482 files) [18.2 MB]
```

### Notes
- **Can't bundle all, ESM vs CJS**
  Packages in the modern ESLint ecosystem (e.g. `@typescript-eslint/utils`) ship their dist files
  pre-bundled with rolldown (Vite's bundler). When webpack re-bundled them, it pulled in rolldown's
  own runtime stub which has `__require = undefined`. At activation, webpack's CJS interop helper
  `.n()` called that undefined value and crashed with:
  `(0, _rolldown_runtime_js__WEBPACK_IMPORTED_MODULE_0__.n) is not a function`

  Fix: marked `eslint`, `typescript-eslint`, and `@stylistic/eslint-plugin` as `externals` in
  `webpack.config.js` so they are never re-bundled. webpack emits plain `require()` calls instead,
  and Node resolves them from `node_modules` at runtime. Updated `.vscodeignore` to ship
  `node_modules` with the extension while excluding dev-only packages (`webpack`, `ts-loader`,
  `@types`, etc.).

  Fix: changed `tsconfig.json` to `"module": "CommonJS"`, `"moduleResolution": "node"`, and added
  `"esModuleInterop": true` so TypeScript emits plain `require()` calls and handles ESM default
  export interop automatically.

- **Build failure: ts-loader crash with TypeScript 7**
  TypeScript 7 is a full compiler rewrite in Go whose JS API changed enough to break `ts-loader`.
  `ts.sys.fileExists` was `undefined`, causing ts-loader to crash before compiling anything:
  `TypeError: Cannot read properties of undefined (reading 'fileExists')`

  Fix: downgraded `typescript` from `^7.0.2` to `5.8.3`, which is stable and fully supported by
  ts-loader, typescript-eslint, and all other tooling.

- **Can't use overrideConfigFile from EsLint**
  Pointing ESLint at a config file causes it to resolve plugins relative to that file's
  directory, where no `node_modules` exists, producing "module not found" errors at runtime.

  Fix: replaced the file path with a programmatic `overrideConfig` array built directly in
  TypeScript. Plugins are imported at the top of `mylint.ts` and passed as objects, so Node
  resolves them from the extension's own `node_modules` rather than from the config file location.
