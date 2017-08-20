'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.login = exports.getData = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _jsdom = require('jsdom');

var _jsdom2 = _interopRequireDefault(_jsdom);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('dotenv').config();

var baseUrl = process.env.BASE_URL;

var jar = _request2.default.jar();
var request = _request2.default.defaults({ jar: jar });
var JSDOM = _jsdom2.default.JSDOM;


var getDashboard = function getDashboard() {
  var url = baseUrl + '/MyDashboard.aspx';

  return new _promise2.default(function (resolve, reject) {
    if (jar.getCookies(baseUrl).length == 0) {
      login().then((0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
        var data;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return getDashboard();

              case 2:
                data = _context.sent;

                resolve(data);

              case 4:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, undefined);
      }))).catch(function (error) {
        reject(error);
      });
      return;
    }

    request(url, function (error, response, body) {
      if (error) {
        reject(error);
      } else {
        resolve(body);
      }
    });
  });
};

var getMileage = function getMileage(body) {
  var _ref2 = new JSDOM(body),
      window = _ref2.window;

  var document = window.document;

  var milesUsed = document.getElementById('ctl00_MainContent_MilesUsedLabel').innerHTML;
  var milesRemain = document.getElementById('ctl00_MainContent_MilesRemainingLabel').innerHTML;
  var milesExcess = document.getElementById('ctl00_MainContent_PredictedExcessLabel').innerHTML;

  return {
    used: milesUsed,
    remain: milesRemain,
    excess: milesExcess
  };
};

var getOverallImage = function getOverallImage(body) {
  var _ref3 = new JSDOM(body),
      window = _ref3.window;

  var document = window.document;

  var url = baseUrl + '/' + document.getElementById('ctl00_MainContent_ChartOverall_Image').getAttribute('src');

  return new _promise2.default(function (resolve, reject) {
    var result = downloadImage(url, './images/overallScore.png');

    if (result === 'error') {
      reject('error');
    } else {
      resolve('/images/overallScore.png');
    }
  });
};

var getDetailedView = function getDetailedView() {
  var url = baseUrl + '/MyDrivingHistoryMoreDetails.aspx';

  return new _promise2.default(function (resolve, reject) {
    if (jar.getCookies(baseUrl).length == 0) {
      login().then(function () {
        getDetailedView();
      }).catch(function (error) {
        reject(error);
      });
      return;
    }

    request(url, function (error, response, body) {
      if (error) {
        console.error(error);
        reject(error);
      } else {
        resolve(body);
      }
    });
  });
};

var getDials = function getDials(body) {
  var _ref4 = new JSDOM(body),
      window = _ref4.window;

  var document = window.document;

  var speedDial = baseUrl + '/' + document.getElementById('ctl00_MainContent_SpeedDial_Image').getAttribute('src');
  var smoothDial = baseUrl + '/' + document.getElementById('ctl00_MainContent_SmoothnessDial_Image').getAttribute('src');
  var usageDial = baseUrl + '/' + document.getElementById('ctl00_MainContent_UsageDial_Image').getAttribute('src');

  return new _promise2.default(function (resolve, reject) {
    var speedResult = downloadImage(speedDial, './images/speedResult.png');
    var smoothResult = downloadImage(smoothDial, './images/smoothResult.png');
    var usageResult = downloadImage(usageDial, './images/usageResult.png');

    var result = {};

    if (speedResult === 'error') {
      result['speed'] = 'error';
    } else {
      result['speed'] = '/images/speedResult.png';
    }

    if (smoothResult === 'error') {
      result['smooth'] = 'error';
    } else {
      result['smooth'] = '/images/smoothResult.png';
    }

    if (usageResult === 'error') {
      result['usage'] = 'error';
    } else {
      result['usage'] = '/images/usageResult.png';
    }

    resolve(result);
  });
};

var getJourneys = function getJourneys(body) {
  var _ref5 = new JSDOM(body),
      window = _ref5.window;

  var document = window.document;

  var results = [];

  var tableRows = document.getElementById('ctl00_MainContent_JourneysGrid_ctl00').getElementsByTagName('tbody')[0].getElementsByTagName('tr');

  for (var i = 0; i < tableRows.length; i++) {
    var row = tableRows[i];
    var data = row.getElementsByTagName('td');

    var date = data[0].innerHTML;
    var sTime = data[1].innerHTML;
    var eTime = data[2].innerHTML;
    var speedScore = data[3].innerHTML;
    var smoothnessScore = data[4].innerHTML;
    var usageScore = data[5].innerHTML;
    var score = data[6].innerHTML;

    results.push({
      date: date,
      sTime: sTime,
      eTime: eTime,
      scores: {
        speed: speedScore,
        smoothness: smoothnessScore,
        usage: usageScore,
        overall: score
      }
    });
  }

  return results;
};

var downloadImage = function downloadImage(url, filename) {
  request(url).pipe(_fs2.default.createWriteStream(filename)).on('close', function () {
    console.log('Downloaded: ' + filename);
    return 'success';
  }).on('error', function (error) {
    console.error(error);
    return 'error';
  });
};

var getData = exports.getData = function () {
  var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
    var dash, mileage, overallScoreImage, detailed, journeys, dialImages;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return getDashboard();

          case 2:
            dash = _context2.sent;
            mileage = getMileage(dash);
            _context2.next = 6;
            return getOverallImage(dash);

          case 6:
            overallScoreImage = _context2.sent;
            _context2.next = 9;
            return getDetailedView();

          case 9:
            detailed = _context2.sent;
            journeys = getJourneys(detailed);
            _context2.next = 13;
            return getDials(detailed);

          case 13:
            dialImages = _context2.sent;
            return _context2.abrupt('return', {
              miles: (0, _extends3.default)({}, mileage),
              images: {
                overallScore: overallScoreImage,
                dials: (0, _extends3.default)({}, dialImages)
              },
              journeys: journeys
            });

          case 15:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function getData() {
    return _ref6.apply(this, arguments);
  };
}();

var login = exports.login = function login() {
  var url = baseUrl + '/Default.aspx';

  var options = {
    url: url,
    headers: {
      Host: 'service.smartwheels.morethan.com',
      Connection: 'keep-alive',
      'Content-Length': '669',
      'Cache-Control': 'max-age=0',
      Origin: baseUrl,
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Safari/537.36',
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      Referer: url,
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-US,en;q=0.8'
    },
    method: 'POST',
    form: {
      __EVENTTARGET: '',
      __EVENTARGUMENT: '',
      __VIEWSTATE: '/wEPDwUKMjEzNzMyOTIyNmRkLEoSfrAVCQOw3pdQfAww+egsXkoKi8p94X+/HB9nInw=',
      __VIEWSTATEGENERATOR: 'CA0B0334',
      __EVENTVALIDATION: '/wEdAATZ54GNqJE4ad7KDhJDdSNdSt/1+cDFAAhFLj34g5rZJc+9P3s0w+MeGOPom7ExypC9RB/c8DGz9SnisCqjuPbJP+BMOvSd/lXKVeEOeu1E7yISp+A0K5kzAZxn1C/xcwM=',
      ctl00$MainContent$Username: process.env.USERNAME,
      ctl00$MainContent$Password: process.env.PASSWORD,
      ctl00$MainContent$Login: 'Login',
      ctl00_RadScriptManager1_TSM: ';;System.Web.Extensions, Version=4.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35:en-US:93a6b8ed-f453-4cc5-9080-8017894b33b0:ea597d4b:b25378d2'
    },
    followRedirect: false,
    gzip: true
  };

  return new _promise2.default(function (resolve, reject) {
    request(options, function (error, response, body) {
      if (error) {
        reject(error);
      } else {
        console.log('logged in');
        resolve();
      }
    });
  });
};