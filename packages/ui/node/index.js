const fs = require('fs');
const path = require('path');

const send = require('send');

function collapseLeadingSlashes (str) {
  for (var i = 0; i < str.length; i++) {
    if (str[i] !== '/') {
      break
    }
  }

  return i > 1
    ? '/' + str.substr(i)
    : str
}

function createHtmlDocument (title, body) {
  return '<!DOCTYPE html>\n' +
    '<html lang="en">\n' +
    '<head>\n' +
    '<meta charset="utf-8">\n' +
    '<title>' + title + '</title>\n' +
    '</head>\n' +
    '<body>\n' +
    '<pre>' + body + '</pre>\n' +
    '</body>\n' +
    '</html>\n'
}

function createMiddleware(options) {
  if (!options.base) {
    options.base = '/play';
  }

  const clientDist = path.resolve(__dirname, '../dist');
  const clientIndexHtml = fs.readFileSync(
    path.resolve(clientDist, 'index.html'),
    'utf-8',
  );
  return async (req, res, next) => {
    if (req.url && ['GET', 'HEAD'].includes(req.method)) {
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname === options.base) {
        var loc = collapseLeadingSlashes(url.pathname + '/');
        var doc = createHtmlDocument('Redirecting', 'Redirecting to ' + loc)
        res.statusCode = 301;
        res.setHeader('Content-Type', 'text/html; charset=UTF-8')
        res.setHeader('Content-Length', Buffer.byteLength(doc))
        res.setHeader('Content-Security-Policy', "default-src 'none'")
        res.setHeader('X-Content-Type-Options', 'nosniff')
        res.setHeader('Location', loc)
        res.end(doc);
        return;
      }

      if (url.pathname.startsWith(options.base)) {
        const reqPath = url.pathname.substring(options.base.length);
        function directory() {
          res.statusCode = 301;
          res.setHeader('Location', `${reqPath}/`);
          res.end(`Redirecting to ${escape(reqPath)}/`);
        }

        function handleError(err) {
          if (err.status === 404) {
            next();
            return;
          }
          next(err);
        }

        send(req, reqPath, { root: clientDist })
          .on('error', handleError)
          .on('directory', directory)
          .pipe(res);
        return;
      }
    }
    next();
  };
}

module.exports = createMiddleware;
