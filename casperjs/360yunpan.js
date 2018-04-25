var cookies1 = "__guid=126185567.129874283347652620.1432917057611.9124; count=5; i360loginName=test.yu%40gmail.com";
var cookies2 = "test_cookie_enable=null; token=1961779249.91.d230d48b.1483467009.1432912520; Q=u%3D%25O2%25R2%25PN%25Q4%25Q3%25R3%26n%3D%25Q3%25R1%25PR%25O0%25OR%25SP%26le%3DqTImqP55qFH0ZTqgLJyfYzAioD%3D%3D%26m%3DZGZ5WGWOWGWOWGWOWGWOWGWOAmL2%26qid%3D1483467009%26im%3D1_t01040787add6a849f6%26src%3Dpcw_cloud%26t%3D1; T=s%3Dce0cf78d129da043e4f5bc5c8bdec6b0%26t%3D1432917144%26lm%3D%26lf%3D1%26sk%3Df92c6951fbc67bbb172a16fa58844b50%26mt%3D1432917144%26rc%3D%26v%3D2.0%26a%3D1; __guid=11737766.695945410714206800.1432917264023.862; count=2";

var domain1 = ".yunpan.com";
var domain2 = ".yunpan.360.cn";
cookies1.split(";").forEach(function(pair){
    pair = pair.split("=");
    phantom.addCookie({
      'name': pair[0].trim(),
      'value': pair[1].trim(),
      'domain': domain1
    });
});
cookies2.split(";").forEach(function(pair){
    pair = pair.split("=");
    phantom.addCookie({
      'name': pair[0].trim(),
      'value': pair[1].trim(),
      'domain': domain2
    });
});

var casper = require('casper').create({
    pageSettings: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36'
    }
});
var json = casper.cli.get(0);
var data = JSON.parse(json);

casper.options.viewportSize = {width: 1680, height: 924};

casper.start().each(data, function(self, link) {
    casper.thenOpen(link.url);
    casper.then(function() {
        self.echo(link.url + "\t" + link.code);
    });
    casper.waitFor(function check() {
        return this.evaluate(function() {
            if ($('#linkError').length) {
                return false;
            }
            return /测试/.test($('.userInfo').text());
        });
    }, function then() {
        // console.log(JSON.stringify(phantom.cookies));
        this.evaluate(function(code) {
            document.querySelector('input.pwd-input').setAttribute('value', code);
            document.querySelector('input.submit-btn').click();
        }, link.code);
    }, function timeout() {
        this.echo("分享者已取消此分享，或删除了分享的文件。");
    }, 5000);
    casper.then(function() {
        // casper.wait(1000, function() {});
        casper.waitFor(function check() {
            return this.evaluate(function() {
                return document.querySelectorAll('#dump').length > 0;
            });
        }, function then() {
            this.click('#dump');
        }, function timeout() {
            this.echo("dump not found -" + new Date().getTime() + ".png");
        }, 5000);
    });
    casper.then(function() {
        casper.waitFor(function check() {
            return this.evaluate(function() {
                return document.querySelectorAll('.root-node').length > 0;
            });
        }, function then() {
            this.click('.root-node');
        }, function timeout() {
            this.echo("root node not found -" + new Date().getTime() + ".png");
        }, 5000);
    });
    casper.then(function() {
        casper.waitFor(function check() {
            return this.evaluate(function() {
                return document.querySelectorAll('.move').length > 0;
            });
        }, function then() {
            this.click('.move');
        }, function timeout() {
            this.echo("move not found -" + new Date().getTime() + ".png");
        }, 1000);
    });
    casper.then(function() {
        casper.waitFor(function check() {
            return this.evaluate(function() {
                if (document.querySelectorAll('.y-alert-success').length === 0) {
                    return false;
                }
                return /保存成功/.test($('.y-alert-success').text());
            });
        }, function then() {
            // then
        }, function timeout() {
            this.echo("move timeout -" + new Date().getTime() + ".png");
        }, 10000);
    });
});
casper.run();

