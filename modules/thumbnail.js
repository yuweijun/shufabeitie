var fs = require('fs');
var path = require('path');
var jimp = require('jimp');

var thumbnail = function(thumbnailWidth, dir) {
    var exist = false,
        directory = path.join(dir, 'w' + thumbnailWidth);

    if (fs.existsSync(directory)) {
        exist = true;
    } else {
        fs.mkdirSync(directory);
    }

    if (exist) {
        return false;
    }

    fs.readdir(dir, function(err, ts) {
        if (!exist) {
            console.log("create " + thumbnailWidth + " thumbnail image for path: 【" + directory + "】");
            ts.forEach(function(t) {
                console.log(t);
                if (/\.jpg/i.test(t)) {
                    console.log(path.join(dir, t));
                    jimp.read(path.join(dir, t), function(err, image) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                        var imageWidth = image.bitmap.width,
                            ratio = thumbnailWidth / imageWidth,
                            simg = path.join(directory, t);

                        if (imageWidth > thumbnailWidth) {
                            image.scale(ratio, function(err, image) {
                                image.write(simg, function(err) {
                                    if (err) {
                                        console.log(err);
                                    }
                                });
                            });
                        } else {
                            image.write(simg, function(err) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};

module.exports = thumbnail;
