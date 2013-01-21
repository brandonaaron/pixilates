var assert = require('assert');
var fs = require('fs');
var Pixelator = require('../index.js').Pixelator;

assert.throws(function() {
  var pixelator = new Pixelator();
}, /path/);
assert.throws(function() {
  var pixelator = new Pixelator('test/nohere.jpg');
}, /file/);

var pixelator = new Pixelator('test/test.jpeg');
pixelator.pixelate({ scale: 4 }, function(rs) {
  fs.exists(pixelator.pixelatedPath, function(exists) {
    assert.ok(exists, 'Pixelated file was created');
    fs.unlink(pixelator.pixelatedPath);
  })
});
