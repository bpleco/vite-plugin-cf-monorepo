import { readdirSync } from "fs";
import { resolve, sep } from "path";

export function findWorkspaceRoot(fileName: string, path: string): string {
  const p = resolve(path as string, "..");

  if (readdirSync(p).includes(fileName)) {
    return p;
  } else {
    if (p === sep)
      throw new Error(
        "[cf-monorepo-vite-plugin] Workspace parent not found. \nThis error usually occurs when there is a spelling mistake in pluginOptions.autoResolveOutputDir\n"
      );

    return findWorkspaceRoot(fileName, p);
  }
}
