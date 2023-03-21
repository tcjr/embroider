import { Memoize } from 'typescript-memoize';
import { readJSONSync, existsSync } from 'fs-extra';
import { resolve } from 'path';

export class RewrittenPackages {
  constructor(private appRoot: string) {}

  rewrittenTo(packageRoot: string): string | undefined {
    return this.rewrittenPackagesIndex.v1ToV2.get(packageRoot);
  }

  rewrittenFrom(packageRoot: string): string | undefined {
    return this.rewrittenPackagesIndex.v2ToV1.get(packageRoot);
  }

  @Memoize()
  private get rewrittenPackagesIndex(): { v1ToV2: Map<string, string>; v2ToV1: Map<string, string> } {
    let addonsDir = resolve(this.appRoot, 'node_modules', '.embroider', 'addons');
    let indexFile = resolve(addonsDir, 'v1-addon-index.json');
    if (existsSync(indexFile)) {
      let { v1Addons } = readJSONSync(indexFile) as { v1Addons: Record<string, string> };
      return {
        v1ToV2: new Map(
          Object.entries(v1Addons).map(([oldRoot, relativeNewRoot]) => [oldRoot, resolve(addonsDir, relativeNewRoot)])
        ),
        v2ToV1: new Map(
          Object.entries(v1Addons).map(([oldRoot, relativeNewRoot]) => [resolve(addonsDir, relativeNewRoot), oldRoot])
        ),
      };
    }
    return { v1ToV2: new Map(), v2ToV1: new Map() };
  }
}