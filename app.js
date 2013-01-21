var fs = require('fs');
var path = require('path');
var http = require('http');
var util = require('util');
var express = require('express');
var uuid = require('node-uuid');
var stylus = require('stylus');
var nib = require('nib');
var Pixelator = require('pixelator').Pixelator;

var app = express();
if (app.get('env') == 'development') {
  app.use(express.logger('dev'));
} else {
  app.use(express.logger());
}
app.use(error);
app.use(express.favicon('public/favicon.ico'));
app.use(express.compress());
app.use(express.bodyParser({ keepExtensions: true }));
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.use(stylus.middleware({ src: __dirname + '/public', compile: compile }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('port', 8080);

function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .set('compress', true)
    .use(nib())
    .import('nib');
}

app.all('/', function(req, res) {
  if (req.query.image) {
    if (util.isArray(req.query.image)) {
      req.query.image = req.query.image[0];
    }
    downloadImage(req.query.image, function(err, path) {
      if (err) {
        error(err, req, res);
      } else {
        pixelate(res, path, getOptionsFromParams(req.query));
      }
    });
  } else if (req.files && req.files.image) {
    pixelate(res, req.files.image.path, getOptionsFromParams(req.body));
  } else {
    res.render('index', {});
  }
});

function error(err, req, res, next) {
  console.error(err.stack);
  res.send(500);
}

function getOptionsFromParams(params) {
  var options = {};
  options.scale = params.scale || 10;
  if (params.x1 && params.y1 && params.x2 && params.y2) {
    options.coords = [ [params.x1, params.y1], [params.x2, params.y2] ];
  }
  return options;
}

function pixelate(res, path, options) {
  var pixelator = new Pixelator(path);
  pixelator.pixelatedPath = pixelator.path;
  pixelator.pixelate(options, function() {
    res.sendfile(pixelator.path, function(err) {
      fs.unlink(pixelator.path);
    });
  });
}

function downloadImage(uri, callback) {
  var req = http.request(uri, function(res) {
    var name = uri.split('/').reverse()[0];
    var ext = name.split('.').reverse()[0];
    var path = '/tmp/' + uuid.v1() + '.' + ext;
    var writeStream = fs.createWriteStream(path);
    res.pipe(writeStream);
    res.on('end', function() {
      writeStream.end();
      callback(false, path);
    });
  });
  req.on('error', function(err) {
    callback(err);
  });
  req.end();
}

if (!module.parent) {
  app.listen(app.get('port'));
}

