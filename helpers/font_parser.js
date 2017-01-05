const _ = require("underscore");
const Async = require("async");
const Fs = require("fs");
const Path = require("path");
const { DOMParser } = require("xmldom");

if (module === require.main) {
  let fonstDir = Path.resolve(__dirname, "../resources/assets/fonts");
  xmlsToJsons(fonstDir, err => { if (err) throw err });
}

// Gets a dir path containing font xmls and converts them all to jsons
function xmlsToJsons(path, callback = _.noop) {
  Fs.readdir(path, (err, files) => {
    if (err) return callback(err);

    // Remove all extensions
    fileNames = _.uniq(files.map(file => file.split(".")[0]));

    // Convert each xml individually
    Async.each(fileNames, (fileName, next) => {
      xmlToJson(`${path}/${fileName}`, next);
    },
    (err) => {
      if (!err) console.log(
        'All fonts have been successfully parsed!'
      );

      callback(err);
    });
  });
}

// Gets a font xml and converts it to json
function xmlToJson(path, callback = _.noop) {
  Async.waterfall([
    (next) => {
      Fs.readFile(`${path}.xml`, function(err, xmlBuffer) {
        if (err) return next(err);

        let json = {
          chars: {}
        };

        let xml = xmlBuffer.toString();
        let doc = new DOMParser().parseFromString(xml);
        let fontDoc = doc.getElementsByTagName("Font")[0];
        let charsDoc = fontDoc.getElementsByTagName("Char");

        // Compose meta-data about font like size and family
        _.each(fontDoc.attributes, (attr) => {
          json[attr.name] = parseInt(attr.value) || attr.value;
        });

        // Compose data about each character in font
        _.each(charsDoc, (charDoc) => {
          let charCode = charDoc.getAttribute("code");

          let char = json.chars[charCode] = {
            rect: rect = {},
            offset: offset = {},
            width: parseInt(charDoc.getAttribute("width"))
          };

          [
            rect.x,
            rect.y,
            rect.width,
            rect.height
          ] = extractIntegers(charDoc.getAttribute("rect"));

          [offset.x, offset.y] = extractIntegers(charDoc.getAttribute("offset"));
        });

        next(null, JSON.stringify(json, null, 2));
      });
    },
    (json, next) => {
      // Once finished, write json into file
      Fs.writeFile(path + ".json", json, (err) => {
        next(err);
      });
    }
  ], (err) => {
    if (!err) console.log(
      `Font ${path} has been successfully parsed...`
    );

    callback(err);
  });
};

// Converts an string of numbers to array of numbers
// e.g. extractIntegers("1 2 3") -> [1, 2, 3]
function extractIntegers(srcstr) {
  return srcstr.split(" ").map((substr) => parseInt(substr));
}

module.exports = {
  xmlToJson,
  xmlsToJsons
};