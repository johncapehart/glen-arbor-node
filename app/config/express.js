/**
 * Express configuration
 */
'use strict';

var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
//var cookieParser = require('cookie-parser');
var path = require('path');
var cors = require('cors');

exports.default = function (config, app) {
    app.use(cors());
    app.use(scribe.express.logger()); //Log each request
    app.use('/logs', scribe.webPanel());
    // app.use(morgan('dev'));
    // app.use(cookieParser());

    app.options('*', cors()); // include before other routes

    app.use(bodyParser.json());       // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
        extended: true
    }));
};