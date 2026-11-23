import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {execFileSync} from 'child_process';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

const EXPORT_ZIP_PATH = '/tmp/codefix-lab-js-app.zip';

function ensureExportZip(projectRoot: string): string {
  if (!fs.existsSync(EXPORT_ZIP_PATH)) {
    const pyScript = [
      'import os, sys, zipfile',
      'root, out = sys.argv[1], sys.argv[2]',
      'exclude = {"node_modules", "dist", "build", ".git", "coverage"}',
      'with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zf:',
      '    for dp, dns, fns in os.walk(root):',
      '        dns[:] = [d for d in dns if d not in exclude]',
      '        for fn in sorted(fns):',
      '            if fn.endswith(".zip") or (fn.startswith(".env") and fn != ".env.example"):',
      '                continue',
      '            full = os.path.join(dp, fn)',
      '            zf.write(full, os.path.join("codefix-lab-js-app", os.path.relpath(full, root)))',
    ].join('\n');
    execFileSync('python3', ['-c', pyScript, projectRoot, EXPORT_ZIP_PATH], {stdio: 'ignore'});
  }
  return EXPORT_ZIP_PATH;
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'serve-source-zip-download',
        apply: 'serve',
        configureServer(server) {
          server.middlewares.use('/download-source.zip', (_req, res, next) => {
            try {
              const zipPath = ensureExportZip(__dirname);
              const stat = fs.statSync(zipPath);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/zip');
              res.setHeader(
                'Content-Disposition',
                'attachment; filename="codefix-lab-js-app.zip"'
              );
              res.setHeader('Content-Length', String(stat.size));
              res.setHeader('Cache-Control', 'no-store');
              fs.createReadStream(zipPath).pipe(res);
            } catch (err) {
              next(err);
            }
          });
        },
      },
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
