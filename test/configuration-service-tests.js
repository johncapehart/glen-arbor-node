'use strict';
var should = require('should');
var assert = require('assert');
var request = require('supertest');

var prefix = '/api2/';
var port = 8082;
var url = 'http://localhost:' + port;

// simple test for sanity check
describe('Array', function () {
    describe('#indexOf()', function () {
        it('should return -1 when the value is not present', function () {
            assert.equal(-1, [1, 2, 3].indexOf(4));
        });
    });
});

describe('#config', function () {
    var server;

    before(function (done) {
        var appPromise = require('../server-test.js').default();
        appPromise.then(function (app) {
            server = app.server;
            console.log('leaving before hook then');
            done();
        })
        console.log('leaving before hook');
    });
    after(function () {
        console.log('entering after hook');
        server.close();
    });
    it('should get a list of services', function (done) {
        request(url)
            .get(prefix + 'service/list')
            .set('Accept', 'application/json')
            .expect(200)
            .expect(function (res) {
                if (res.body[0].serviceDisplayName != 'Default Service') {
                    throw new Error('default service missing');
                }
            })
            .end(done);
    });
    it('should get a server configuration', function (done) {
        request(url)
            .get(prefix + 'server/config')
            .set('Accept', 'application/json')
            .expect(200)
            .expect(function (res) {
                if (res.body.server.webhookport !== 8082) {
                    throw new Error('server configuration error');
                }
            })
            .end(done);
    });
    it('should get a service configuration', function (done) {
        request(url)
            .get(prefix + 'service/config?service=sample-winrm-service')
            .set('Accept', 'application/json')
            .expect(200)
            .expect(function (res) {
                if (res.body.service.serviceName != 'sample-winrm-service') {
                    throw new Error('Invalid service name');
                }
                if (res.body.columns.length != 5) {
                    throw new Error('Invalid columns length');
                }
            })
            .end(done);
    });
});

