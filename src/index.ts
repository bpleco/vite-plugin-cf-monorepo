import type { Plugin, ResolvedConfig } from "vite";
import { dirname, join, resolve } from "path";
import { findWorkspaceRoot } from "./findWorkspaceRoot";
import { readFileSync } from "fs";
import { build } from "./build";
import { PluginConfig, ResolvedUserOptions, UserOptions } from "./types";

const isSSR = (ssr: boolean | string) => (typeof ssr === "string" ? true : ssr);

const resolveFullConfig = (
  resolvedConfig: ResolvedConfig,
  userOptions: any
): PluginConfig => {
  return {
    isSSR: isSSR(resolvedConfig.build.ssr),
    outDir: resolve(resolvedConfig.build.outDir),
    ...userOptions,
  };
};

const resolveUserConfig = (
  userPluginOptions: Partial<UserOptions>
): ResolvedUserOptions => {
  const defaultOptions = {
    srcDir: process.cwd(),
    workspaceDir: process.cwd(),
    autoResolveOutputDir: "package.json",
    emptyFunctionsDir: true,
    emptyOutDir: true,
    monorepoPrefix: "",
    ...userPluginOptions,
  };

  if (userPluginOptions.autoResolveOutputDir !== null) {
    // walk dir tree and find workspace root
    // if none found throw error
    defaultOptions.workspaceDir = findWorkspaceRoot(
      defaultOptions.autoResolveOutputDir as string,
      process.cwd()
    );
  }

  if (!userPluginOptions.monorepoPrefix) {
    const parentPkgJSONPath = join(defaultOptions.workspaceDir, "package.json");
    const parentPkgJSON = JSON.parse(readFileSync(parentPkgJSONPath, "utf-8"));

    defaultOptions.monorepoPrefix = parentPkgJSON.name
      ? `@${parentPkgJSON.name}`
      : "";

    if (!defaultOptions.monorepoPrefix) {
      throw new Error(
        `[cf-monorepo-vite-plugin] Please set the name property of the workspace parent package.json ${parentPkgJSONPath}`
      );
    }
  }

  return {
    ...defaultOptions,
  };
};

export default function monorepoBuildPlugin(
  pluginOptions?: Partial<UserOptions>
): Plugin {
  let userConfig = resolveUserConfig(pluginOptions ?? {});

  let config: PluginConfig;

  return {
    name: "cf-monorepo-vite-plugin",
    enforce: "post",
    config(config) {
      return {
        build: {
          outDir: config.build?.outDir ?? join(userConfig.workspaceDir, "dist"),
          emptyOutDir: config.build?.emptyOutDir ?? userConfig.emptyOutDir,
        },
      };
    },
    configResolved(resolvedConfig) {
      config = resolveFullConfig(resolvedConfig, userConfig);
    },
    buildEnd() {
      if (!config.isSSR) {
        build(config);
      }
    },
  };
}
