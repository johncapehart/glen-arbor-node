'use strict';
var yaml = require('js-yaml');

var should = require('should');
var assert = require('assert');
var request = require('supertest');

var prefix = '/api2/';
var port = 8082;
var url = 'http://localhost:' + port;

describe('#static-service', function() {
    function parseDocument(res, done, testfn) {
        res.data = '';
        res.on('data', function(chunk) {
            res.data += chunk;
        });
        res.on('end', function() {
            var result = res.data;
            if (!testfn(result)) {
                throw new Error('Invalid template response to operation');
            }
            done();
        });
    }
    it('should get a client document', function (done) {
        request(url)
            .get(prefix + 'static/index.html')
            .set('Accept', 'text/html')
            .expect(200)
            .buffer()
            .parse(function(res) {
                parseDocument(res, done, function(result) {
                    return result.includes('html');
                });
            })
            .end(done);
    });
    it('should get a client document vis service route', function (done) {
        request(url)
            .get(prefix + 'sample-winrm-service/static/index.html')
            .set('Accept', 'text/html')
            .expect(200)
            .end(done);
    });
    it('should get a bower resource', function(done) {
        request(url)
            .get(prefix + 'bower_components/angular/angular.js')
            .set('Accept', 'application/javascript')
            .expect(200)
            .end(done);
    });
    it('should get a bower resource via service rout', function(done) {
        request(url)
            .get(prefix + 'sample-winrm-service/bower_components/angular/angular.js')
            .set('Accept', 'application/javascript')
            .expect(200)
            .end(done);
    });
})
;

