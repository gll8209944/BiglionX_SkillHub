import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface DynamicRoutes {
  [key: string]: string[];
}

function findDynamicRoutes(dir: string, baseDir: string = dir): DynamicRoutes {
  const items = fs.readdirSync(dir);
  const dynamicRoutes: DynamicRoutes = {};

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // 检查是否是动态路由目录
      if (item.startsWith('[') && item.endsWith(']')) {
        const paramName = item.slice(1, -1);
        const relativePath = path.relative(baseDir, dir);
        
        if (!dynamicRoutes[relativePath]) {
          dynamicRoutes[relativePath] = [];
        }
        dynamicRoutes[relativePath].push(paramName);
      }

      // 递归检查子目录
      const subRoutes = findDynamicRoutes(fullPath, baseDir);
      Object.assign(dynamicRoutes, subRoutes);
    }
  }

  return dynamicRoutes;
}

const appDir = path.join(__dirname, 'apps', 'web', 'app');
const routes = findDynamicRoutes(appDir);

console.log('Dynamic routes found:');
for (const [routePath, params] of Object.entries(routes)) {
  if (params.length > 1) {
    console.log(`\n⚠️  CONFLICT in ${routePath || '/'}: [${params.join('], [')}]`);
  } else {
    console.log(`✓ ${routePath || '/'}: [${params[0]}]`);
  }
}

// 检查是否有冲突
let hasConflict = false;
for (const params of Object.values(routes)) {
  if (params.length > 1) {
    hasConflict = true;
    break;
  }
}

if (hasConflict) {
  console.log('\n❌ Found routing conflicts!');
  process.exit(1);
} else {
  console.log('\n✅ No routing conflicts found.');
}
