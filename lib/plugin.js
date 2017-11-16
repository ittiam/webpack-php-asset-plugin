var md5 = require('md5');
var fs = require('fs');
var path = require('path');

function PHPAssetVerPlugin(configFile) {
  this.configFile = configFile;
}

PHPAssetVerPlugin.prototype.apply = function(compiler) {
  compiler.plugin(
    'emit',
    function(compilation, callback) {
      var outputPath = compiler.outputPath;
      var phpconfig = ['<?php\n', 'return ['];
      compilation.chunks.forEach(function(chunk) {
        chunk.files.forEach(function(filename) {
          var source = compilation.assets[filename].source();
          var hash = md5(source).substr(0, 10);
          phpconfig.push(`    '${filename}' => '${hash}',`);
        });
      });
      phpconfig.push('];');
      fs.writeFileSync(this.configFile, phpconfig.join('\n'));

      callback();
    }.bind(this)
  );
};
