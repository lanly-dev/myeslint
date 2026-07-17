# Change Log

All notable changes to the "mylint" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]


## [0.0.1] - Initial release

### Notes

- **Extension activation crash: rolldown runtime artifact**
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

- **Build failure: ts-loader crash with TypeScript 7**
  TypeScript 7 is a full compiler rewrite in Go whose JS API changed enough to break `ts-loader`.
  `ts.sys.fileExists` was `undefined`, causing ts-loader to crash before compiling anything:
  `TypeError: Cannot read properties of undefined (reading 'fileExists')`

  Fix: downgraded `typescript` from `^7.0.2` to `5.8.3`, which is stable and fully supported by
  ts-loader, typescript-eslint, and all other tooling.

- **Build error: static import of ESM-only package under `module: Node16`**
  With `"module": "Node16"` in `tsconfig.json`, TypeScript treats `.ts` files as CommonJS and
  refuses to statically `import` ESM-only packages like `@stylistic/eslint-plugin`, emitting:
  `TS1479: The current file is a CommonJS module ... cannot be imported with 'require'`

  Fix: changed `tsconfig.json` to `"module": "CommonJS"`, `"moduleResolution": "node"`, and added
  `"esModuleInterop": true` so TypeScript emits plain `require()` calls and handles ESM default
  export interop automatically.

- **Hardcoded absolute config path**
  `new ESLint({ overrideConfigFile: 'C:/Users/...' })` only worked on one specific machine.
  Also, pointing ESLint at a config file causes it to resolve plugins relative to that file's
  directory, where no `node_modules` exists, producing "module not found" errors at runtime.

  Fix: replaced the file path with a programmatic `overrideConfig` array built directly in
  TypeScript. Plugins are imported at the top of `mylint.ts` and passed as objects, so Node
  resolves them from the extension's own `node_modules` rather than from the config file location.
