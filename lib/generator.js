var _ = require('underscore'),
    EventEmitter = require('events').EventEmitter;
    fs = require('fs'),
    path = require('path'),
    uglify = require('uglify-js');

var generator = new EventEmitter();

generator.init = function(options) {
    var overwrite = options.overwrite === true ? true : false,
        sourceDirectory = options.source,
        outputDirectory = options.output,
        cwd = process.cwd(),
        template = options.template ?
            options.template : __dirname + "/templates/bdd.tpl";
    this.dry = options.dry;

    if (sourceDirectory.indexOf("/") !== 0) {
        sourceDirectory = cwd + "/" + sourceDirectory;
    }

    if (outputDirectory.indexOf("/") !== 0) {
        outputDirectory = cwd + "/" + outputDirectory;
    }

    if (!outputDirectory.match("/$")) {
        outputDirectory = outputDirectory + "/";
    }

    this.overwrite = overwrite;
    this.source = sourceDirectory;
    this.fileList = [];
    this.template = _.template(fs.readFileSync(template, 'ascii'));
    this.output = outputDirectory;
    this.maxFiles = options.max ? options.max : 300;

    this.forbiddenDirs = ['node_modules'];

    initErrors = [];

    if (!path.existsSync(this.source)) {
        initErrors.push("Source directory " + this.source + " does not exist!");
    }

    var that = this;

    if (_.any(this.forbiddenDirs, function(forbiddenDir) {
        return that.source.indexOf(forbiddenDir) >= 0;
    })) {
        initErrors.push("Source directory " + this.source + " is probably not something you want to generate tests for..");
    };

    return initErrors;

};

generator.generate = function(options) {

    var errors = this.init(options);

    if (errors.length) {
        _.each(errors, function(error) {
            console.error(error);
        });
        console.log("Quitting..");
        return;
    }

    this.compileFileList();

    if (!path.existsSync(this.output)) {
        fs.mkdirSync(this.output);
    }

    var that = this;

    if (this.fileList.length > this.maxFiles) {
        console.error("Number of modules exceeds maximum of " + this.maxFiles);
        console.log("Quitting..");
        return;
    }

    var that = this;

    _.each(this.fileList, function(modulePath) {
        var fileName = _.last(modulePath.split('/')),
            testPath = modulePath.replace(that.source, that.output);

        var test = {
            specName : fileName,
            moduleName : fileName.split('.')[0],
            path : testPath,
            modulePath : modulePath,
            relativePathToModule : path.relative(testPath, modulePath).substring(3),
            methods : generator.getMethodList(modulePath)
        };

        if (test.methods.length === 0) {
            console.log("Skipping module " + modulePath + " because it has no exports..");
            return;
        }

        that.writeTest(test);

    });

    this.emit('done');

};

generator.writeTest = function(test) {

    var pathParts = test.path.split("/"),
        currentDir = "";
    pathParts.pop();
    _.each(pathParts, function(dir) {
        currentDir = currentDir + dir + "/";
        if (!path.existsSync(currentDir)) {
            console.log("Directory " + currentDir + " does not exist, creating..");
            fs.mkdirSync(currentDir);
        }
    });

    if (path.existsSync(test.path) && !this.overwrite) {
        console.log("Test " + test.path + " already exists, use --force if you know what you are doing..");
    } else {
        if (this.dry) {
            console.log("Dry run - not writing test " + test.path + "...");
            return;
        }
        console.log("Writing test " + test.path + "...");

        fs.writeFileSync(test.path, this.template(test));
    }

};

generator.getMethodList = function(path) {

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

generator.compileFileList = function(parent) {

    parent = parent ? parent : this.source;
    if (!parent.match("/$")) {
        parent = parent + "/";
    }
    var that = this;

    var fsObjects = fs.readdirSync(parent);

    _.each(fsObjects, function(fsObject) {
        var path = parent + fsObject,
            stats = fs.lstatSync(path);
        if (stats.isDirectory()) {
            generator.compileFileList(path);
        } else if (stats.isFile()) {
            //check if extension is js
            var indx = fsObject.lastIndexOf('.'),
            extension = (indx < 0) ? '' : fsObject.substr(indx);
            if (extension === ".js") {
                that.fileList.push(path);
            }
        }
    });

};

module.exports = generator;