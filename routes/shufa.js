var fs = require('fs');
var path = require('path');
var date = require('datejs');
var express = require('express');
var authenticate = require('../modules/users');
var thumbnail = require('../modules/thumbnail');
var jsonarrayutils = require('../modules/jsonarrayutils');
var faties = require('../modules/indexgenerator');
var router = express.Router();
var beitie = 'beitie';
var root = 'public';
var shufa = 'shufa';
var reg = /^[\u4e00-\u9fa5]/;

var xhr = function (req) {
    if (req.xhr || /json/.test(req.get('Accept'))) {
        return true;
    }
    return false;
};

// url最后如果不是斜杠结束，则加上斜杠重定向
router.use(/(^.*?[^\/])$/, function(req, res, next) {
    var url = path.join('/', 'shufa', req.params[0], '/');
    console.log('redirect to url', url);
    res.redirect(url);
});

router.use(/(.*?)\/(.*?)\/info\/?$/, function(req, res, next) {
    var user = req.session.user;
    if (authenticate(user)) {
        next();
    } else {
        res.redirect('/shufa/login?url=' + req.originalUrl);
    }
});

// define the home page route
router.get(['/', '/authors'], function(req, res) {
    var data = {
        title: '书法碑帖',
        authors: faties.authors
    };

    if (xhr(req)) {
        // xhr
        res.json(faties.authors);
    } else {
        res.render(path.join(shufa, 'index'), data);
    }
});

router.get('/login', function(req, res) {
    res.render(path.join(shufa, 'login'));
});

router.post('/login', function(req, res) {
    var user = authenticate(req.body);
    if (user) {
        // console.log(user, req.query.url);
        req.body.id = user.id;
        req.session.user = req.body;
        if (req.query.url) {
            res.redirect(req.query.url);
        } else {
            res.redirect('/');
        }
    } else {
        res.render(path.join(shufa, 'login'));
    }
});

// define the show shufa list route, 一级目录路径: /shufa/东晋王羲之/
router.get(/^\/([^\/]*)\/$/, function(req, res) {
    var author = decodeURIComponent(req.params[0]),
        file = path.join(root, beitie, author),
        folders = [];

    if (!fs.existsSync(file)) {
        res.status(404).render(path.join(shufa, '404'), {
            url: decodeURIComponent(req.originalUrl)
        });
    } else {
        var files = fs.readdirSync(path.join(root, beitie, author));
        files.forEach(function(item) {
            var fileName = path.join(root, beitie, author, item),
                stats = fs.statSync(fileName);

            if (!/^\./.test(item) && stats.isDirectory()) {
                folders.push({
                    key: item,
                    value: path.join(shufa, author, item)
                });
            }
        });

        var data = {
            title: path.join('书法碑帖', author),
            author: author,
            folders: folders
        };

        if (xhr(req)) {
            // xhr
            res.json(folders);
        } else {
            res.render(path.join(shufa, 'list'), data);
        }
    }
});

// define the show shufa details route, 二级碑帖内容显示路径: /shufa/敦煌写经/转轮经/
router.get(/^\/([^\/]*?)\/([^\/]*?)\/$/, function(req, res) {
    var author = decodeURIComponent(req.params[0]),
        paper = decodeURIComponent(req.params[1]),
        dir = path.join(root, beitie, author, paper),
        info = '.data.json',
        parentDirectory = path.join(root, beitie, author),
        infofile = path.join(dir, info),
        infoexist = false,
        w1000exist = false,
        w1000Directory = path.join(dir, 'w1000'),
        w100exist = false,
        w100Directory = path.join(dir, 'w100');

    if (fs.existsSync(w100Directory)) {
        w100exist = true;
    } else {
        thumbnail(100, w100Directory);
    }
    if (fs.existsSync(w1000Directory)) {
        w1000exist = true;
    } else {
        thumbnail(1000, w1000Directory);
    }
    if (fs.existsSync(infofile)) {
        infoexist = true;
    }

    // 找到上一个法帖和下一个法帖的文件夹位置
    var siblings = fs.readdirSync(parentDirectory).filter(function(item) {
        var fileName = path.join(parentDirectory, item),
            stats = fs.statSync(fileName);

        if (reg.test(item) && stats.isDirectory()) {
            return true;
        }
    });

    var length = siblings.length,
        index = siblings.indexOf(paper),
        prevIndex = index - 1,
        nextIndex = index + 1;
    if (prevIndex < 0) {
        prevIndex = length - 1;
    }
    if (nextIndex == length) {
        nextIndex = 0;
    }

    var files = fs.readdirSync(w100exist ? w100Directory : dir);
    var images = files.filter(function(t) {
        return /\.(jpg|png)/i.test(t);
    });

    var json = {
        info: {text: ''},
        title: path.join('书法碑帖', author, paper),
        images: images,
        paper: paper,
        author: author,
        prev: siblings[prevIndex],
        next: siblings[nextIndex],
        path100: path.join(beitie, author, paper, (w100exist ? 'w100' : '')),
        path1000: path.join(beitie, author, paper, (w1000exist ? 'w1000' : ''))
    };
    if (infoexist) {
        var versions = jsonarrayutils.read(infofile);
        json.info = versions[0] || {text: ''};
    }

    if (xhr(req)) {
        // xhr
        res.json(json);
    } else {
        json.info.text = '<p>' + json.info.text.replace(/\n+/g, '<p>');
        res.render(path.join(shufa, 'show'), json);
    }
});

// edit .data.json
router.get(/^\/(.*?)\/(.*?)\/info\/?$/, function(req, res) {
    var author = decodeURIComponent(req.params[0]),
        paper = decodeURIComponent(req.params[1]),
        info = '.data.json',
        dir = path.join(root, beitie, author, paper),
        parentDirectory = path.join(root, beitie, author),
        infofile = path.join(dir, info),
        versions = jsonarrayutils.read(infofile),
        infojson = versions[0] || {text: ''};

    // 找到上一个法帖和下一个法帖的文件夹位置
    var siblings = fs.readdirSync(parentDirectory).filter(function(item) {
        var fileName = path.join(parentDirectory, item),
            stats = fs.statSync(fileName);

        if (reg.test(item) && stats.isDirectory()) {
            return true;
        }
    });

    var length = siblings.length,
        index = siblings.indexOf(paper),
        prevIndex = index - 1,
        nextIndex = index + 1;
    if (prevIndex < 0) {
        prevIndex = length - 1;
    }
    if (nextIndex == length) {
        nextIndex = 0;
    }

    var json = {
        title: "书法碑帖简介",
        info: infojson,
        paper: paper,
        author: author,
        prev: siblings[prevIndex],
        next: siblings[nextIndex]
    };
    res.render(path.join(shufa, 'info'), json);
});

// save .data.json
router.post(/(.*?)\/(.*?)\/info\/?$/, function(req, res) {
    var author = decodeURIComponent(req.params[0]),
        paper = decodeURIComponent(req.params[1]),
        dir = path.join(root, beitie, author, paper),
        info = '.data.json',
        infofile = path.join(dir, info),
        versions = [];

    // 保存时需要将最新的版本加到数组最前面
    // 删除中英文空格
    req.body.text = req.body.text.replace(/[\u0020\u3000\u00a0]+/g, '').replace(/[\r\n]+/g, '\n').replace(/\[\d+\]/g, '');
    req.body.timestamp = new Date().getTime();
    // 内容是否已经可以发布
    req.body.published = true;
    versions.push(req.body);
    jsonarrayutils.write(infofile, versions);

    res.redirect('./');
});

module.exports = router;
