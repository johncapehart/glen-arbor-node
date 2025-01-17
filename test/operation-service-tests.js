'use strict';
var yaml = require('js-yaml');

var should = require('should');
var assert = require('assert');
var request = require('supertest');

var prefix = '/api2/';
var port = 8082;
var url = 'http://localhost:' + port;

describe('#winrm-service', function() {
    function parseTemplate(res, done, testfn) {
        res.data = '';
        res.on('data', function(chunk) {
            res.data += chunk;
        });
        res.on('end', function() {
            // console.log('res=', res.data);
            //var result = yaml.safeLoad(res.data);
            var result = JSON.parse(res.data);

            if (!testfn(result)) {
                throw new Error('Invalid template response to operation');
            }
            done();
        });
    }

    it('should run some powershell', function(done) {
        var query = prefix + 'service/operation?service=sample-winrm-service&operation=job&user=' + global.myconfig.test.user;
        request(url)
            .get(query)
            .set('Accept', 'application/json')
            .expect(200)
            .buffer()
            .parse(function(res) {
                parseTemplate(res, done, function(result) {
                    return result.id.length === 36;
                });
            })
            .end(done);
    });
});

