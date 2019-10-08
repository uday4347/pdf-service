var createError = require('http-errors');
var express = require('express');
var path = require('path');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const phantom = require('phantom');
// var binPath = phantomjs.path
const tmp = require('tmp');

const phantomPath = './node_modules/.bin/phantomjs';

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text({ defaultCharset : "utf-8", type: "text/*"}));
// app.use(express.json());
app.use(cookieParser());

app.get('/', function (req, res, next) {
  res.json({ "status": "up" });
});

app.get('/pdf', function (req, res) {
  var url = req.query.url;
  (async function () {
    const instance = await phantom.create([], {
      phantomPath: phantomPath
    });
    const page = await instance.createPage();
    await page.property('paperSize', {
      format: 'A4'
    });

    await page.setting('userAgent', 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36');
    var tmpFile = tmp.fileSync({
      prefix: 'phantomjs-',
      postfix: '.pdf'
    });

    page.open(url)
      .then(status => {
        if (status == 'success') {
          page.render(tmpFile.name)
            .then(pdf => {
              if (pdf) {
                res.set('Content-Type', 'application/pdf');
                res.sendFile(tmpFile.name);
              } else {
                res.status(500).json({
                  error: 'Failed to create file'
                });
              }
            })
        } else {
          res.status(500).json({
            error: 'Failed to status'
          });
        }
      }).catch(r => {
        console.info(r);
      })
      .finally(() => {
        tmpFile.removeCallback();
        instance.exit();
      });
  }());
});


app.post('/pdf', function (req, res) {
  (async function () {
    const instance = await phantom.create([], {
      phantomPath: phantomPath
    });
    const page = await instance.createPage();
    await page.property('paperSize', {
      format: 'A4'
    });
    //await page.property('navigationLocked', true);
    await page.setting('userAgent', 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36');
    await page.setting('javascriptEnabled', true);
    await page.setting('loadImages', true);
    await page.setting('localToRemoteUrlAccessEnabled', true);

    var tmpFile = tmp.fileSync({
      prefix: 'phantomjs-',
      postfix: '.pdf'
    });
    await page.property('content', req.body);

    page.render(tmpFile.name)
      .then(pdf => {
        if (pdf) {
          res.set('Content-Type', 'application/pdf');
          res.sendFile(tmpFile.name);
        } else {
          res.status(500).json({
            error: 'Failed to create file'
          });
        }
      })
      .catch(r => {
        console.info(r);
      })
      .finally(() => {
        tmpFile.removeCallback();
        instance.exit();
      });
  }());
});
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json('error while accessing the pdf api');
});

module.exports = app;
