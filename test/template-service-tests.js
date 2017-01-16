'use strict';
var yaml = require('js-yaml');

var should = require('should');
var assert = require('assert');
var request = require('supertest');

var prefix = '/api2/';
var port = 8082;
var url = 'http://localhost:' + port;

describe('#templates', function() {
    var server;

    before(function(done) {
        var appPromise = require('../server-test.js').default();
        appPromise.then(function(app) {
            server = app.server;
            done();
        });
    });
    after(function() {
        server.close();
    });
    it('should get a list of templates', function (done) {
        request(url)
            .get(prefix + 'service/template/list?service=sample-winrm-service')
            .set('Accept', 'application/json')
            .expect(200)
            .expect(function (res) {
                if (res.body['job'] != 'job.tpl.yml') {
                    throw new Error('job template missing');
                }
            })
            .end(done);
    });
    it('should get a template', function(done) {
        request(url)
            .get(prefix + 'service/template?service=sample-winrm-service&template=job')
            .set('Accept', 'application/x-yaml')
            .expect(200)
            .buffer()
            .parse(function(res, fn) {
                res.data = '';
                res.on('data', function(chunk) { res.data += chunk; });
                res.on('end', function() {
                    // console.log('res=', res.data);
                    var result = yaml.safeLoad(res.data);
                    if (result.id === undefined) {
                        throw new Error('Invalid template ressponse');
                    }
                    done();
                });
            })
            .end(done);

    });
    it('should call a template', function(done) {
        var query = '?service=sample-winrm-service&template=job&context={"jobId":"testjobid"}';
        request(url)
            .get(prefix + 'service/template' + query)
            .set('Accept', 'application/json')
            .expect(200)
            .buffer()
            .parse(function(res, fn) {
                res.data = '';
                res.on('data', function(chunk) { res.data += chunk; });
                res.on('end', function() {
                    // console.log('res=', res.data);
                    var result = yaml.safeLoad(res.data);
                    if (result.id !== 'testjobid') {
                        throw new Error('Invalid template ressponse');
                    }
                    done();
                });
            })
            .end(done);
    });
})
;

