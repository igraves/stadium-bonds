import * as esbuild from 'esbuild';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distLambda = path.join(__dirname, '../dist/lambda');

// Ensure output directory exists
if (!fs.existsSync(distLambda)) {
  fs.mkdirSync(distLambda, { recursive: true });
}

// Bundle the Lambda handler
await esbuild.build({
  entryPoints: [path.join(__dirname, '../src/lambda.ts')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: path.join(distLambda, 'lambda.js'),
  format: 'esm',
  minify: true,
  sourcemap: true,
  external: [
    // Keep native modules external - Lambda includes these
    '@tensorflow/tfjs-node',
  ],
  banner: {
    js: `
      import { createRequire } from 'module';
      import { fileURLToPath } from 'url';
      import { dirname } from 'path';
      const require = createRequire(import.meta.url);
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
    `,
  },
});

console.log('Lambda bundle created at dist/lambda/lambda.js');

// Create package.json for Lambda
const lambdaPackageJson = {
  type: 'module',
};
fs.writeFileSync(
  path.join(distLambda, 'package.json'),
  JSON.stringify(lambdaPackageJson, null, 2)
);

console.log('Lambda package.json created');
