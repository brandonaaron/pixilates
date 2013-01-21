var fs = require('fs');
var exec = require('child_process').exec;

var Pixelator = function(path) {
  if (!path) {
    this._error('No path given');
  } else if (!fs.existsSync(path)) {
    this._error('No file found');
  }
  this.path = path;
  this.pixelatedPath = path.replace(/(\..+)/, ".pixelated$1");
};

Pixelator.prototype.pixelate = function(options, callback) {
  if (!this.dimensions || !this.type) {
    this.getImageInformation(function() { this.pixelate(options, callback); }.bind(this));
  } else {
    this._process(this._getSettings(options), callback);
  }
};

Pixelator.prototype.getImageInformation = function(callback) {
  exec('identify -format \'%wx%h %m %b %n\n\' ' + this.path, function(err, stdout, stderr) {
    var info = stdout.replace(/\n+$/, '').split('\n').reverse()[0].split(' ');
    if (!err && info) {
      this.dimensions = info[0];
      this.type = info[1].toLowerCase();
      this.size = info[2];
      this.frames = info[3];
      callback.call(this);
    } else {
      this._error('Failed to get image information.', err);
    }
  }.bind(this));
};

Pixelator.prototype._process = function(settings, callback) {
  var params = this._getParamsForConvert(settings);
  exec('convert ' + params, function(err, stdout, stderr) {
    if (err) {
      this._error('Could not pixelate image', err);
    } else {
      this._finish(callback);
    }
  }.bind(this));
};

Pixelator.prototype._finish = function(callback) {
  callback(fs.createReadStream(this.path));
};

Pixelator.prototype._getSettings = function(options) {
  var settings = {
    scale: parseInt(options.scale, 10) || 10,
    coords: null
  };

  if (options.coords) {
    settings.coords = options.coords;
  }

  return settings;
};

Pixelator.prototype._getParamsForConvert = function(settings) {
  var params = [this.path],
      partiallyPixelate = !!settings.coords,
      scaleParams = ['-scale', settings.scale + '%', '-filter', 'box', '-resize', this.dimensions + '!'];
  if (partiallyPixelate) {
    params.push('\\( +clone ' + scaleParams.join(' ') + ' \\)');
    params.push("\\( +clone -gamma 0 -fill white -draw 'rectangle " + settings.coords[0].join(',') + " " + settings.coords[1].join(',') + "' \\)");
    params.push("\\( +clone \\) -composite")
  } else {
    params = params.concat(scaleParams);
  }
  params.push(this.pixelatedPath);
  return params.join(' ');
};

Pixelator.prototype._error = function(message, error) {
  throw new Error(message);
};

exports.Pixelator = Pixelator;
