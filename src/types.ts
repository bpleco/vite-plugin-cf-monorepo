export interface PluginConfig extends ResolvedUserOptions {
  outDir: null | string;
  isSSR: null | boolean;
  srcDir: string;
}

export interface UserOptions {
  /**
   * Attempt to resolve the workspace root directory and place your build assets there
   * This will override the `build.outDir` in your vite.config file.
   * @default 'package.json'
   */
  autoResolveOutputDir: null | "package.json" | "pnpm-workspace.yaml" | string;
  /**
   * This will empty out the build directory directory before build
   * @default true
   */
  emptyOutDir: boolean;
  /**
   * This will empty out the `functions` directory directory before build
   *
   * **cloudflare pages requires this dir to be called functions**
   * @default true
   */
  emptyFunctionsDir: boolean;
  /**
   * This is used to add your tsconfig.json if you have none defined. This allows packages within the
   * monorepo to be properly resolved by the cloudflare functions build in production deploy
   *
   * @default 'name of workspace root package.json'
   */
  monorepoPrefix: string;
}

export interface ResolvedUserOptions extends UserOptions {
  workspaceDir: string;
}
