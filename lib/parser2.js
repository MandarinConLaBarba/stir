var uglifyParser = require('uglify-js').parser,
    _ = require('underscore'),
    fs = require('fs'),
    util = require('util');

module.exports = Parser;

function Parser(path) {
    var self = this;
    this.path = path;
    this.rawJs = fs.readFileSync(path, 'ascii');
    this.ast = uglifyParser.parse(this.rawJs);


    //show ast, unparsed
    //console.log(util.inspect(this.ast, false, null));

    this.variableElements = [];
    this.assignmentElements = [];

    this.private = {};
    this.private.assignment = function() {
        return {
            left : {
                type : undefined,
                value : undefined
            },
            right : {
                type : undefined,
                methods : undefined
            }
        };
    };
    this.private.setVariableElement = function(element) {

        var assignment = self.private.assignment();
        assignment.left.type = "var";
        assignment.left.value = element[0];
        assignment.right.type = element[1][0];
        assignment.right.methods = self.private.parseRightValue(element[1]);

        if (assignment.right.type === "object") {
            _.each(self.assignments(), function(node) {
                var matcher = new RegExp("^" + assignment.left.value + "\\.\\w*");
                if (matcher.test(node.left.value)) {
                    assignment.right.methods.push(node.left.value.split(".")[1]);
                }
                //.test(node.left.value)
            });
        }

//        console.log(util.inspect(assignment, false, null));
//        console.log("\n");
        self.variableElements.push(assignment);
    };
    this.private.setAssignmentElement = function(element) {

        var assignment = self.private.assignment();

        var rawLeft = element[2],
            rawRight = element[3];

        assignment.left.type = rawLeft[0];
        assignment.left.value = self.private.parseLeftValue(rawLeft);
        assignment.right.type = rawRight[0];
        assignment.right.methods = self.private.parseRightValue(rawRight);

        assignment.right.type === "name" ?
            assignment.right.type = "reference" : null;

        self.assignmentElements.push(assignment);
        //console.log(util.inspect(element, false, null));
    };

    this.private.parseLeftValue = function(node) {

        var type = node[1][0],
            name;
        if (type === "dot") {
            //recursive..
            name = self.private.parseLeftValue(node[1]);
        } else if (type === "name") {
            name = node[1][1];
        }
        name = name + "." + node[2];

        return name;

    };

    this.private.parseRightValue = function(node) {
        var type = node[0];

        if (type === "object") {
            return _.chain(node[1])
                .filter(function(property) {
                    return property[1][0] === "function";
                }).map(function(property) {
                    return property[0];
                }).value();
        } else if (type === "function") {
            return undefined;
        } else if (type === "name") {
            return node[1];

        }

    };
};

Parser.prototype.parse = function() {

    var self = this;
    _.each(this.ast[1], function(elem) {

        if(elem[0] === "stat") {
            var type = elem[1][0];
            if (type === "assign") {
                self.private.setAssignmentElement(elem[1])
            }
        };

    });

    _.each(this.ast[1], function(elem) {

        if (elem[0] === "var") {
            _.each(elem[1], self.private.setVariableElement);
            return;
        }

    });

    return {
        variables : this.variables(),
        assignments : this.assignments(),
        suggestedTests : this.suggestedTestMethods()
    };

};


Parser.prototype.variables = function() {
    return this.variableElements;
};

Parser.prototype.assignments = function() {
    return this.assignmentElements;
};

Parser.prototype.suggestedTestMethods = function() {
    var self = this;
    var methods = [];
    _.each(this.assignments(), function(assignment) {
//        console.log(assignment);
        //if the left operand matches 'module.exports' or 'exports.*'
        if (assignment.left.value === "module.exports" || /^exports\.\w*/.test(assignment.left.value)) {
            //if the right operand is a function
            if (assignment.right.type === "function") {
                //if it's module.exports on the left side of the assignment, then we have a single method that's the module export
                if (assignment.left.value === "module.exports") {
                    methods.push(assignment.left.value);
                } else {
                    methods.push(assignment.left.value.split('.')[1]);
                }
            } else if (assignment.right.type === "object") {
                //iterate...
//                console.log("found object type");
                methods = methods.concat(assignment.right.methods);
            } else if (assignment.right.type === "reference") {
                //look through variables...
                _.each(self.variables(), function(variable) {
//                    console.log("looking for variable ");
                    if (assignment.right.methods === variable.left.value) {
//                        console.log("found variable ");
//                        console.log(util.inspect(variable, false, null));
                        methods = methods.concat(variable.right.methods);
                    }

                });
            }
        }
    });

    return _.uniq(methods);
};


