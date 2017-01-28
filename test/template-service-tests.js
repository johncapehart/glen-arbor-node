'use strict';
var yaml = require('js-yaml');

var should = require('should');
var assert = require('assert');
var request = require('supertest');

var prefix = '/api2/';
var port = 8082;
var url = 'http://localhost:' + port;

describe.only('#template-service', function() {
    function parseTemplateResponse(res, done, testfn) {
        res.data = '';
        res.on('data', function(chunk) {
            res.data += chunk;
        });
        res.on('end', function() {
            var result = res.data;
            try {
                var contentType = res.headers['content-type'].split(';')[0];
                switch (contentType) {
                    case 'application/x-yaml':
                        result = yaml.safeLoad(res.data);
                        break;
                    case 'application/json':
                        result = JSON.parse(res.data);
                        break;
                    case 'text/plain':
                        break;
                }
            } catch (err) {
                throw err;
            }
            if (!testfn(result)) {
                throw new Error('Invalid template ressponse');
            }
            done();
        });
    }

    it('should get a list of templates via server route', function(done) {
        request(url)
            .get(prefix + 'service/template/list?service=sample-winrm-service')
            .set('Accept', 'application/json')
            .expect(200)
            .expect(function(res) {
                if (res.body['job'] != 'job.tpl.json') {
                    throw new Error('job template missing');
                }
            })
            .end(done);
    });

    it('should get a list of templates via service name route', function(done) {
        request(url)
            .get(prefix + 'sample-winrm-service/template/list')
            .set('Accept', 'test/plain')
            .expect(200)
            .expect(function(res) {
                if (res.body['job'] != 'job.tpl.json') {
                    throw new Error('job template missing');
                }
            })
            .end(done);
    });

    it('should get a template', function(done) {
        request(url)
            .get(prefix + 'service/template?service=sample-winrm-service&template=job')
            .set('Accept', 'test/plain')
            .expect(200)
            .buffer()
            .parse(function(res) {
                parseTemplateResponse(res, done, function(result) {
                    return result.includes('serviceId');
                });
            })
            .end(done);

    });
    it('should get a template via service route', function(done) {
        request(url)
            .get(prefix + 'sample-winrm-service/template?template=job')
            .set('Accept', 'application/json')
            .expect(200)
            .buffer()
            .parse(function(res) {
                parseTemplateResponse(res, done, function(result) {
                    return result.includes('serviceId');
                });
            })
            .end(done);

    });
    it('should call a job template', function(done) {
        var query = '?service=sample-winrm-service&template=job&context={"jobId":"testjobid"}';
        request(url)
            .get(prefix + 'service/template' + query)
            .set('Accept', 'application/json')
            .expect(200)
            .buffer()
            .parse(function(res) {
                parseTemplateResponse(res, done, function(result) {
                    return result.id.length === 36;
                });
            })
            .end(done);
    });
    it('should call a winrm template', function(done) {
        var query = '?service=sample-winrm-service&template=winrm&context={"changecommand":"$json.input"}';
        request(url)
            .get(prefix + 'service/template' + query)
            .set('Accept', 'text/plain')
            .expect(200)
            .buffer()
            .parse(function(res) {
                parseTemplateResponse(res, done, function(result) {
                    return result.includes('b3e2b931-4f36-4623-9d26-50d7f113fa90');
                });
            })
            .end(done);
    });
    it('should call a client template', function(done) {
        var query = '?service=sample-winrm-service&template=client"}';
        request(url)
            .get(prefix + 'service/template' + query)
            .set('Accept', 'application/json')
            .expect(200)
            .buffer()
            .parse(function(res) {
                parseTemplateResponse(res, done, function(result) {
                    return result.includes('b3e2b931-4f36-4623-9d26-50d7f113fa90');
                });
            })
            .end(done);
    });
})
;

