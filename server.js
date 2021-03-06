var url  = require('url');
var path = require('path');
var fs   = require('fs');
var http = require('http');

var mime = require('mime');
var level = require('level');
var concat = require('concat-stream');
var Routes = require('routes');
var Encoder = require('node-html-encoder').Encoder;

var encoder = new Encoder('entity');
var db = level('data/appdata');

var server = http.createServer(app).listen(7357);

var apiRoutes = {
  'GET': {
    'todos': function (req, res) {
      var todos = [];
      db.createReadStream({start: 'todo', end: 'todo' + '\xff', valueEncoding: 'json'})
        .on('data', function (todo) {
          todos.push(todo.value);
        })
        .on('error', function (err) {
          return errHandler(err, res);
        })
        .on('end', function () {
          todos = JSON.stringify(todos);
          res.setHeader('Content-Type', mime.lookup('json'));
          res.end(todos);
        });
    },

    'todos/:id': function (req, res, params) {
      db.get('todo' + params.id, {valueEncoding: 'json'}, function (err, data) {
        if (err) return errHandler(err, res);

        res.setHeader('Content-Type', mime.lookup('json'));
        res.end(JSON.stringify(data));
      });
    }
  },

  'POST': {
    'todos': function (req, res) {
      req.pipe(concat({encoding: 'string'}, function (body) {
        var todo;
        try {
          todo = JSON.parse(body);
        } catch (error) {
          res.statusCode = 400;
          res.end('Invalid JSON');
        }
        if (todo) {
          todo.description = encoder.htmlEncode(todo.description);
          todo.id = Date.now() + '' + Math.floor(Math.random() * 1000);
          db.put('todo' + todo.id, todo, {valueEncoding: 'json'}, function (err) {
            if (err) errHandler(err, res)
            res.setHeader('Content-Type', mime.lookup('json'));
            res.end(JSON.stringify(todo));
          });
        }
      }));
    },
  },

  'PUT': {
    'todos/:id': function (req, res, params) {
      req.pipe(concat({encoding: 'string'}, function (body) {
        var todo;
        try {
          todo = JSON.parse(body);
        } catch (error) {
          res.statusCode = 400;
          res.end('Invalid JSON');
        }
        if (todo) {
          todo.description = encoder.htmlEncode(todo.description);
          todo.id = params.id;
          db.put('todo' + todo.id, todo, {valueEncoding: 'json'}, function (err) {
            if (err) errHandler(err, res);
            res.setHeader('Content-Type', mime.lookup('json'));
            res.end(JSON.stringify(todo));
          });
        }
      }));
    }
  },

  'DELETE': {
    'todos/:id': function (req, res, params) {
      db.del('todo' + params.id, function (err) {
        if (err) errHandler(err, res)
        res.statusCode = 204;
        res.end('OK');
      });
    }
  }
};


function makeApiRouter (apiRoutes) {

  var routes = {};

  for (verb in apiRoutes) {
    routes[verb] = new Routes();
    for (route in apiRoutes[verb]) {
      routes[verb].addRoute(route, apiRoutes[verb][route]);
    }
  }

  return function (req, res) {
    var resourcepath = url.parse(req.url).pathname.split('/').slice(2).join('/');

    var route = routes[req.method] && routes[req.method].match(resourcepath);

    if (route) {
      route.fn.apply(null, [req, res, route.params]);
    } else {
      res.end();
    }

  };
}

var apiRouter = makeApiRouter(apiRoutes);

function app (req, res) {
  var pathname = url.parse(req.url, true).pathname;
  if (pathname.slice(0, 4) === '/api') {
    apiRouter(req, res);
  } else {
    if (pathname[pathname.length - 1] === '/')
      pathname += 'index.html';
    staticFileHandler(pathname, res);
  }
}

function staticFileHandler (pathname, res) {
  fs.readFile(__dirname + '/public_html' + pathname, function (err, data) {
    if (err) return errHandler(err, res);
    console.log('[200]: ' + pathname);
    res.setHeader('Content-Type', mime.lookup(path.extname(pathname)));
    res.end(data);
  });
}

function errHandler (err, res) {
  if (err.code === 'ENOENT') {
    res.statusCode = 404;
    res.end('File not found!');
    console.log('[404]: File not found: ' + err.path);
  } else {
    console.error(err.toString());
    res.statusCode = 500;
    res.end();
  }
}
