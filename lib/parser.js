var _ = require('underscore'),
    fs = require('fs'),
    path = require('path'),
    uglifyParser = require('uglify-js').parser;


var parser = {};

parser.isAssignmentExportsDotSomething = function(assignment) {
    var leftOperand = assignment[2];
    return leftOperand &&
        leftOperand[0] === "dot" &&
        leftOperand[1][0] === "name" &&
        leftOperand[1][1] === "exports";
};

parser.isAssignmentModuleDotExports = function(assignment) {
    var leftOperand = assignment[2];
    return leftOperand &&
        leftOperand[0] === "dot" &&
        leftOperand[1][0] === "name" &&
        leftOperand[1][1] === "module" &&
        leftOperand[2] === "exports";
};


parser.normalizeAssignment = function(assignment) {

    var parentName,
        name,
        rightOperandType,
        rightOperandValue;
    //for var syntax (var someVariable = { ... })
    if (!assignment[2]) {
        name = assignment[0][0];
        rightOperandType = assignment[0][1][0];
        rightOperandValue = assignment[0][1][1];
    } else {
        //for assign syntax
        //if it's an array, it's a 'dot' type (module.exports = {...})
        if (_.isArray(assignment[2][1])) {
            parentName = assignment[2][1][1];
            name = assignment[2][2];
        } else {
            //if it's not an array it's a top-level assignment (someVariable = { ... }
            //note the absence of the 'var' declarative...)
            name = assignment[2][1]
        }
        rightOperandType = assignment[3][0];
        rightOperandValue = assignment[3][1];
    }

    var type = "var";
    if (this.isAssignmentExportsDotSomething(assignment)) {
        type = "exports";
    } else if (this.isAssignmentModuleDotExports(assignment)) {
        type = "moduleExports"
    }

    var normalized = {
        "type" : type,
        "leftOperand" : {
            "parentName" : parentName,
            "name" : name
        },
        "rightOperand" : {
            "type" : rightOperandType,
            "value" : rightOperandValue
        }
    };
    return normalized;
};

parser.narrowCandidates = function(ast) {

    //get only assignment expressions that are static or variable assignment types
    return _.chain(ast[1]).filter(function(expression) {
        var expressionType = expression[0],
            isAssignment = expression[1][0] === "assign";

        return expressionType === "var" || (expressionType === "stat" && isAssignment);
    }).map(function(expression) {
            //clean up a little bit for simpler programming
            return expression[1];
        }).map(parser.normalizeAssignment, this).value();

};

parser.getVariableAssignments = function(ast) {

    var assignments = this.narrowCandidates(ast);

    return _.chain(assignments).filter(function(assignment) {

        return assignment.type === "var";

    }).value();

};

parser.getExportAssignments = function(ast) {

    var that = this,
        assignments = this.narrowCandidates(ast);
    //get only assignments whose right operand is a function, object or variable name
    return _.chain(assignments).filter(function(assignment) {
        return _.indexOf(["name", "object", "function"], assignment.rightOperand.type) > -1;
    }).filter(function(assignment) {
        //get only assignments whose left operand is exports or module.exports
        return ["exports", "moduleExports"].indexOf(assignment.type) > -1;
    }).value();

};

parser.getTopLevelMethodsFromObject = function(obj) {

    //console.log(obj);

    var functions = [];
    for(var property in obj) {
        var type = obj[property][1][0];
        if (type === "function") {
            var functionName = obj[property][0];
            functions.push(functionName);
        }
    }

    return functions;

};

parser.getMethodList = function(path) {

    var js = fs.readFileSync(path, 'ascii'),
        ast = uglifyParser.parse(js),
        functions = [];

    var that = this;
    var assignments = this.getExportAssignments(ast),
        variableAssignments = this.getVariableAssignments(ast);

//    console.log(assignments);
//    console.log(variableAssignments);

    _.each(assignments, function(assignment) {


        if (assignment.type === "exports" && assignment.rightOperand.type === "function") {
            functions.push(assignment.leftOperand.name);
            return;
        }

        if (assignment.type === "moduleExports" && assignment.rightOperand.type === "function") {
            functions.push("theModuleAnonymousFunction");
            return;
        }

        if (assignment.type === "moduleExports" && assignment.rightOperand.type === "object") {
            functions = functions.concat(that.getTopLevelMethodsFromObject(assignment.rightOperand.value));
            return;
        }

        if (assignment.type === "moduleExports" && assignment.rightOperand.type === "name") {
            //find 'name' and add to function list (if object, iterate, if function, add, etc)
            _.each(variableAssignments, function(varAssignment) {
//                console.log(assignment);
//                console.log(varAssignment);
//                console.log("\n");
//                console.log("\n");

                //assignment where a property is set on a variable that is assigned to module export
                //(i.e. someVariable.func = function() {}, where we have established that module.exports = someVariable)
                var peerVariablePropertyAssignment =
                    assignment.rightOperand.value === varAssignment.leftOperand.parentName;
                //module exports is assigned a top-level variable (i.e. module.exports = someVariable)
                var peerAssignment =
                    !varAssignment.leftOperand.parentName &&
                    assignment.rightOperand.value === varAssignment.leftOperand.name;

                if (peerVariablePropertyAssignment || peerAssignment) {
                    if (varAssignment.rightOperand.type === "function") {
                        var functionName = varAssignment.leftOperand.name;
                        functions.push(functionName);
                    } else if (varAssignment.rightOperand.type === "object") {
                        functions = functions.concat(that.getTopLevelMethodsFromObject(varAssignment.rightOperand.value));
                    }
                }
            });


            return;
        }


    });


    return functions;
};

module.exports = parser;