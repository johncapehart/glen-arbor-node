/**
 * Created by john.capehart on 1/16/2017.
 */
/**
 * Created by john.capehart on 9/25/2016.
 */
'use strict';

var _ = require('lodash');
var LINQ = require('node-linq').LINQ;
var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');
const Handlebars = require('handlebars');

function makeVarsCommand(vars, __context) {
    var command = "";
    try {
        if (!!vars) {
            Object.keys(vars).forEach(function (key, index) {
                var variableName = '$' + key;
                var commandvalue = eval(vars[key]);
                command += variableName + " = " + commandvalue + ";";
            });
        }
    }
    catch (err) {
        console.log(err);
    }
    return command;
}

function evaluateColumnExpression(__context, expression) {
    try {
        return eval(expression);
    } catch (err) {
        console.log(err);
    }
}


exports.factory = function (config, app) {
    var instance = {};
    var jobTemplatePath = config.__getRelativePath("templates", "job");
    instance.jobTemplate = Handlebars.compile(fs.readFileSync(jobTemplatePath, 'utf8'));
    var winrm = require('node-winrm').factory(config.server.winrmhost, config.server.credential);
    config.payload = winrm.payload;

    config.connectcommand = "$ErrorActionPreference =[System.Management.Automation.ActionPreference]::Stop;Import-Module Json4PS;";
    config.connectcommand += makeVarsCommand(config.operations.connect.vars);
    if (!!config.operations.connect.command) {
        config.connectcommand += config.operations.connect.command + ";";
    }


    function prepareOutput(result, cb) {
        try {
            var oresult = JSON.parse(result);
            var data;
            if (oresult.output.length > 0 && oresult.output[0] !== null) {
                var expressions = new LINQ(config.columns)
                    .Where(function (c) {
                        return typeof c.expression !== 'undefined';
                    });
                data = new LINQ(oresult.output)
                    .Select(function (f) {
                        // console.log("column expression for " + f);
                        expressions
                            .Map(function (e) {
                                f[e.name] = evaluateColumnExpression(f, e.expression);
                            });
                        return f;
                    });
                if (!!config.server.discovery.sort) {
                    data = data.OrderBy(function (f) {
                        return f[config.server.discovery.sort];
                    });
                }
                data = data.ToArray();
            } else {
                data = [];
            }
            oresult.output = {
                data: data
            };
            app.logmessage("Retrieved " + data.length + " records");
            cb(null, oresult);
        } catch (err) {
            app.logmessage(err);
            cb(err, null);
        }
    }

    instance.doOperation = function(job, operation, cb) {
        try {
            var user = req.query.username;
            var forreal = req.body.forreal;
            var whatif = req.body.whatif || config.whatif;
            var list = JSON.stringify(req.body.list);
            var context = _.merge({}, req, req.query, req.body);

            var swhatif = ((forreal === true) && (whatif === false)) ? "" : " -whatif ";
            var streamVariable = server.streamVariable !== undefined ? server.streamVariable : "$__";
            var command = config.connectcommand + makeVarsCommand(config.server.action.vars, context) +
                server.streamVariable +
                " = @'\n" + list + "\n'@ | convert-jsontohashtable; " + config.server.action.command;

            console.log(command);
            winrm.callps(command, config.payload, function (err, result) {
                prepareOutput(result, function (err, result) {
                    cb(err, result);
                });
            });
        } catch (err) {
            cb(err, null);
        }
    };

    instance.pstest = function (req, cb) {
        winrm.callps("'PowerShell test succeeded'", config.payload, cb);
    };

    return instance;
};
