export function buildPlaygroundSrcDoc(params: {
  runId: string;
  html: string;
  css: string;
  js: string;
}): string {
  const { runId, html, css, js } = params;
  const safeJs = js.replace(/<\/script/gi, '<\\/script');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; }
    ${css}
  </style>
  <script>
    (function () {
      const RUN_ID = ${JSON.stringify(runId)};
      function formatArgs(args) {
        return args.map(function (arg) {
          if (arg instanceof Error) return arg.name + ': ' + arg.message;
          if (typeof arg === 'object' && arg !== null) {
            try { return JSON.stringify(arg); } catch { return String(arg); }
          }
          return String(arg);
        }).join(' ');
      }
      function send(type, payload) {
        try {
          window.parent.postMessage(Object.assign({ source: 'jslab-sandbox', runId: RUN_ID, type: type }, payload), '*');
        } catch {}
      }
      ['log', 'warn', 'error', 'info'].forEach(function (level) {
        const original = console[level];
        console[level] = function () {
          const args = Array.prototype.slice.call(arguments);
          send('console', { level: level, message: formatArgs(args) });
          if (original) original.apply(console, args);
        };
      });
      window.addEventListener('error', function (event) {
        send('console', {
          level: 'error',
          message: (event.message || 'Runtime error') + (event.lineno ? ' (line ' + event.lineno + ')' : '')
        });
      });
      window.addEventListener('unhandledrejection', function (event) {
        const reason = event.reason;
        send('console', {
          level: 'error',
          message: 'Unhandled Promise Rejection: ' + (reason && reason.message ? reason.message : String(reason))
        });
      });
    })();
  </script>
</head>
<body>
  ${html}
  <script>
    ${safeJs}
  </script>
</body>
</html>`;
}
