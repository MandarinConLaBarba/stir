var _ = require('underscore'),
    fs = require('fs'),
    path = require('path'),
    uglifyParser = require('uglify-js').parser;


var parser = {};

parser.isAssignmentExportsDotSomething = function(assignment) {
    var leftOperand = assignment[2];
    return leftOperand[0] === "dot" &&
        leftOperand[1][0] === "name" &&
        leftOperand[1][1] === "exports";
};

parser.isAssignmentModuleDotExports = function(assignment) {
    var leftOperand = assignment[2];
    return leftOperand[0] === "dot" &&
        leftOperand[1][0] === "name" &&
        leftOperand[1][1] === "module" &&
        leftOperand[2] === "exports";
};



parser.normalizeAssignment = function(assignment) {
    var normalized = {
        "IsExports" : this.isAssignmentExportsDotSomething(assignment),
        "isModuleExports" : this.isAssignmentModuleDotExports(assignment),
        "leftOperand" : {
            "variableName" : assignment[2][2]
        },
        "rightOperand" : {
            "type" : assignment[3][0],
            "value" : assignment[3][1]
        }
    };
    console.log(normalized);
    return normalized;
};

parser.narrowCandidates = function(ast) {

    //get only assignment expressions that are static or variable assignment types
    return _.chain(ast[1]).filter(function(expression) {
        var expressionType = expression[0],
            isAssignment = expression[1][0] === "assign";
        console.log(expression);
        return _.indexOf(["stat", "var"], expressionType) > -1 && isAssignment;
    }).map(function(expression) {
            //clean up a little bit for simpler programming
            return expression[1];
        }).map(parser.normalizeAssignment).value();

};

parser.getVariableAssignments = function(ast) {

    var assignments = this.narrowCandidates(ast);

    return _.chain(assignments).filter(function(assignment) {
        var leftOperand = assignment[2];
        return leftOperand[0] === "name" || //if it's a name assignment (like var someVar = {};) it passes
            (leftOperand[0] === "dot" && //if it's a property assignment (like something.blah = function()) it must:
                leftOperand[1][0] === "name" && //have a name property as the left side of the '.'
                (leftOperand[1][1] !== "exports" && //must not be 'exports' on the left side of the '.' (we don't want to include 'exports.*' here)
                    leftOperand[1][1] !== "module")); //must not be 'module' on the left side of the '.' (we don't want to include 'module.*' here)
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
        return assignment.isExports || assignment.isModuleExports;
    }).value();

};

parser.getTopLevelMethodsFromObject = function(obj) {

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

    _.each(assignments, function(assignment) {


        if (assignment.isExports && rightOperand.type === "function") {
            functions.push(assignment.leftOperand.variableName);
            return;
        }

        if (assignment.isModuleExports && rightOperand.type === "function") {
            functions.push("theModuleAnonymousFunction");
            return;
        }

        if (assignment.isModuleExports && rightOperand.type === "object") {
            functions = functions.concat(that.getTopLevelMethodsFromObject(assignment.rightOperand.value));
            return;
        }

        if (assignment.isModuleExports && rightOperand.type === "name") {
            //find 'name' and add to function list (if object, iterate, if function, add, etc)
            _.each(variableAssignments, function(varAssignment) {
                if (assignment.rightOperand.value === varAssignment[2][1] ||
                    (_.isArray(varAssignment[2][1]) && rightOperand[1] === varAssignment[2][1][1])) {
                    console.log(varAssignment);
                    var assignmentRightOperandType = varAssignment[3][0];
                    if (assignmentRightOperandType === "function") {
                        var functionName = varAssignment[2][1][1];
                        functions.push(functionName);
                    } else if (assignmentRightOperandType === "object") {
                        console.log("2");
                        functions = functions.concat(that.getTopLevelMethodsFromObject(varAssignment[3][1]));
                    }
                }
            });


            return;
        }


    });

    console.log(functions);

    return functions;



//    console.log(ast);
//    console.log(ast[1][0]);
//    console.log(ast[1][0][1]);
//    console.log(ast[1][0][1][2][1])


};

module.exports = parser;