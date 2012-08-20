var _ = require('underscore'),
    fs = require('fs'),
    path = require('path'),
    uglify = require('uglify-js');


var parser = {};

parser.getMethodList = function(path) {

    var leftAssignMatches = function(left, parentName) {
        if (_.isArray(left) &&
            left[0] === "dot" &&
            left[1][1] === parentName) {
            return true;
        }

    };

    var js = fs.readFileSync(path, 'ascii'),
        ast = uglify.parser.parse(js),
        functions = [],
        candidates = [],
        comeBackTo = [];

    _.each(ast[1], function(expr) {
        var type = expr[0];
        if (type === "stat" ||
            type === "var") {

            if (expr[1][0] === "assign") {

                var assignment = expr[1],
                    left = assignment[2],
                    right = assignment[3];
                var functionName = left[2];

                if (leftAssignMatches(left, "module") && left[2] === "exports") {
                    comeBackTo.push(right[1]);
                    return;
                }


                leftAssignMatches(left, "exports") ?
                    functions.push(functionName) :
                    candidates.push(assignment)
            }
        }
    });

    _.each(comeBackTo, function(token) {
        _.each(candidates, function(candidate) {
            if (token === candidate[2][1][1] &&
                candidate[3][0] === "function") {
                functions.push(candidate[2][2]);
            }
        });

    });


    return functions;

};

module.exports = parser;