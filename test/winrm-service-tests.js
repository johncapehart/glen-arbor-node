'use strict';
var yaml = require('js-yaml');

var should = require('should');
var assert = require('assert');
var request = require('supertest');

var prefix = '/api2/';
var port = 8082;
var url = 'http://localhost:' + port;

describe('#winrm-service', function() {
    this.timeout(40000);
    function parseResult(res, done, testfn) {
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
        var query = prefix + 'service/winrm?service=sample-winrm-service&user=' + global.myconfig.test.user;
        request(url)
            .post(query)
            .send(global.myconfig.$dynamic.root.serviceconfigs['sample-winrm-service'].test.services.winrm)
            .set('Accept', 'application/json')
            .expect(200)
            .buffer()
            .parse(function(res) {
                parseResult(res, done, function(result) {
                    return result.output = "hi 16";
                });
            })
            .end(done);
    });
});

