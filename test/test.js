'use strict';
var should = require('should');
var assert = require('assert');
var request = require('supertest');

var server = require('../../server.js');

describe('Array', function () {
    describe('#indexOf()', function () {
        it('should return -1 when the value is not present', function () {
            assert.equal(-1, [1, 2, 3].indexOf(4));
        });
    });
});
describe('#config', function () {
        before(function (done) {
            done();
        });
        it('should return error trying to save duplicate username', function (done) {
            var url = 'http://localhost:8082';
            request(url)
                .get('/api2/service/config?service=sample-winrm-service')
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    if (res.body.columns.length != 5) {
                        throw new Error("Invalid columns length");
                    }
                })
                .end(function (err, res) {
                    if (err) {
                        throw err;
                    }
                    done();
                });
        });
    }
);

