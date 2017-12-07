var md5 = require('md5');
var fse = require('fs-extra');
var path = require('path');

function PHPAssetVerPlugin(configFile) {
  this.configFile = configFile;

  this.renderType = 'json';
  if (this.configFile.lastIndexOf('.php') > -1) {
    this.renderType = 'php';
  }
}

PHPAssetVerPlugin.prototype.apply = function(compiler) {
  compiler.plugin(
    'emit',
    function(compilation, callback) {
      var outputPath = compiler.outputPath;
      if (this.renderType === 'php') {
        this.renderPHP(compilation, callback);
      } else {
        this.renderJSON(compilation, callback);
      }
    }.bind(this)
  );
};

PHPAssetVerPlugin.prototype.renderPHP = function(compilation, callback) {
  var phpconfig = ['<?php\n', 'return ['];

  compilation.chunks.forEach(function(chunk) {
    chunk.files.forEach(function(filename) {
      var source = compilation.assets[filename].source();
      var hash = md5(source).substr(0, 10);
      phpconfig.push(`    '${filename}' => '${hash}',`);
    });
  });

  phpconfig.push('];');
  fse.outputFileSync(this.configFile, phpconfig.join('\n'));

  callback();
};

PHPAssetVerPlugin.prototype.renderJSON = function(compilation, callback) {
  var jsonconfig = ['{'];

  compilation.chunks.forEach(function(chunk, index) {
    chunk.files.forEach(function(filename, i) {
      var source = compilation.assets[filename].source();
      var hash = md5(source).substr(0, 10);
      jsonconfig.push(`    "${filename}": "${hash}",`);
    });
  });

  var lastLine = jsonconfig[jsonconfig.length - 1];
  if (lastLine.lastIndexOf(',') === lastLine.length - 1) {
    lastLine = lastLine.substr(0, lastLine.length - 1);
  }
  jsonconfig[jsonconfig.length - 1] = lastLine;

  jsonconfig.push('}');
  fse.outputFileSync(this.configFile, jsonconfig.join('\n'));

  callback();
};

module.exports = PHPAssetVerPlugin;
