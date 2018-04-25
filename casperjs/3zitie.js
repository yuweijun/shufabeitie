var casper = require('casper').create({
    exitOnError: true,
    pageSettings: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36'
    }
});
var cid = casper.cli.get(0);
var page = casper.cli.get(1);
var url = 'http://gaoqing.3zitie.cn/prolist.asp?cid=' + cid + '&plid=0&page=' + page;
console.log(url);

casper.options.viewportSize = {width: 1680, height: 924};
casper.start(url);
var urls = [];
casper.then(function(){
    var hrefs = casper.evaluate(function() {
        var links = [];
        $('.productlt').each(function() {
            links.push($(this).find('a').get(0).href);
        });
        return links;
    });
    urls = hrefs;
});

var data = [];
casper.then(function() {
    casper.each(urls, function(self, link) {
        // self.echo(link);
        self.thenOpen(link, function() {
            // this.echo(this.getTitle());
            var yunpan = this.evaluate(function(){
                return $('li:contains("提取码")').text().replace(/[点击下载\s提取码]/g,'').split('：');
            });
            data.push({url: yunpan[0], code: yunpan[1]});
        });
    });
});
casper.then(function(){
    this.echo(JSON.stringify(data));
});

casper.run();