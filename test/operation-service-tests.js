'use strict';
var yaml = require('js-yaml');

var should = require('should');
var assert = require('assert');
var request = require('supertest');

var prefix = '/api2/';
var port = 8082;
var url = 'http://localhost:' + port;

describe('#operation-service', function() {
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

    it('should get a list of operations for a service', function(done) {
        request(url)
            .get(prefix + 'service/operation/list?service=sample-winrm-service')
            .set('Accept', 'application/json')
            .expect(200)
            .expect(function(res) {
                if (res.body.job[0].template.name != 'job') {
                    throw new Error('job operation missing');
                }
            })
            .end(done);
    });
    it('should create a job', function(done) {
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
    /*
     it('should get a service configuration', function (done) {
     request(url)
     .get(prefix + 'service/config?service=sample-winrm-service')
     .set('Accept', 'application/json')
     .expect(200)
     .expect(function (res) {
     if (res.body.serviceName != 'sample-winrm-service') {
     throw new Error('Invalid service name');
     }
     if (res.body.columns.length != 5) {
     throw new Error('Invalid columns length');
     }
     })
     .end(done);
     });
     it('should get a server configuration via service route', function (done) {
     request(url)
     .get(prefix + 'sample-winrm-service/config')
     .set('Accept', 'application/json')
     .expect(200)
     .expect(function (res) {
     if (res.body.server.webhookport !== 8082) {
     throw new Error('server configuration error');
     }
     })
     .end(done);
     });*/
});

