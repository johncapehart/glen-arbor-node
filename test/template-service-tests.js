'use strict';
var yaml = require('js-yaml');

var should = require('should');
var assert = require('assert');
var request = require('supertest');

var prefix = '/api2/';
var port = 8082;
var url = 'http://localhost:' + port;

describe('#template-service', function() {
    it('should get a list of templates', function(done) {
        request(url)
            .get(prefix + 'service/template/list?service=sample-winrm-service')
            .set('Accept', 'application/json')
            .expect(200)
            .expect(function(res) {
                if (res.body['job'] != 'job.tpl.yml') {
                    throw new Error('job template missing');
                }
            })
            .end(done);
    });

    it('should get a list of templates vis service route', function(done) {
        request(url)
            .get(prefix + 'sample-winrm-service/template/list')
            .set('Accept', 'application/json')
            .expect(200)
            .expect(function(res) {
                if (res.body['job'] != 'job.tpl.yml') {
                    throw new Error('job template missing');
                }
            })
            .end(done);
    });

    function parseTemplate(res, done, testfn) {
        res.data = '';
        res.on('data', function(chunk) {
            res.data += chunk;
        });
        res.on('end', function() {
            // console.log('res=', res.data);
            var result = yaml.safeLoad(res.data);
            if (!testfn(result)) {
                throw new Error('Invalid template ressponse');
            }
            done();
        });
    }

    it('should get a template', function(done) {
        request(url)
            .get(prefix + 'service/template?service=sample-winrm-service&template=job')
            .set('Accept', 'application/x-yaml')
            .expect(200)
            .buffer()
            .parse(function(res) {
                parseTemplate(res, done, function(result) { return typeof result === 'object';});
            })
            .end(done);

    });
    it('should get a template via service route', function(done) {
        request(url)
            .get(prefix + 'sample-winrm-service/template?template=job')
            .set('Accept', 'application/x-yaml')
            .expect(200)
            .buffer()
            .parse(function(res) {
                parseTemplate(res, done, function(result) {
                    return typeof result === 'object';
                });
            })
            .end(done);

    });
    it('should call a template', function(done) {
        var query = '?service=sample-winrm-service&template=job&context={"jobId":"testjobid"}';
        request(url)
            .get(prefix + 'service/template' + query)
            .set('Accept', 'application/x-yaml')
            .expect(200)
            .buffer()
            .parse(function(res) {
                parseTemplate(res, done, function(result) {
                    return result.id.length === 36;
                });
            })
            .end(done);
    });
})
;

