'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _publicRoutes = require('./publicRoutes');

var _publicRoutes2 = _interopRequireDefault(_publicRoutes);

var _secureRoutes = require('./secureRoutes');

var _secureRoutes2 = _interopRequireDefault(_secureRoutes);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();

(0, _publicRoutes2.default)(app);

app.use('/images', _express2.default.static(_path2.default.join('./images')));

app.use(function (req, res, next) {
  var auth = req.header('Authorization');

  if (!auth) {
    res.sendStatus(401);
    return;
  }

  var clientSecret = process.env.CLIENT_SECRET ? process.env.CLIENT_SECRET : 'password1';
  var clientSecretSha256 = _crypto2.default.createHmac('sha256', clientSecret).digest('hex');

  if (clientSecretSha256 === auth) {
    next();
  } else {
    res.sendStatus(401);
    return;
  }
});

(0, _secureRoutes2.default)(app);

var port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log('Listening on port: ' + port);
});