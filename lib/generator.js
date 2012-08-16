var _ = require('underscore'),
    fs = require('fs'),
    path = require('path');

var generator = {};

generator.generate = function(options) {

    var overwrite = options.overwrite === "true" ? true : false,
        sourceDirectory = options.source,
        outputDirectory = options.output,
        template = options.template ?
            options.template : __dirname + "/templates/bdd.tpl";

    if (sourceDirectory.indexOf("/") !== 0) {
        sourceDirectory = process.cwd() + "/" + sourceDirectory;
    }

    if (outputDirectory.indexOf("/") !== 0) {
        outputDirectory = process.cwd() + "/" + outputDirectory;
    }

    if (!outputDirectory.match("/$")) {
        outputDirectory = outputDirectory + "/";
    }

    if (!path.existsSync(sourceDirectory)) {
        console.error("Source directory " + sourceDirectory + " does not exist!");
        console.log("Quitting..");
        return;
    }

    this.overwrite = overwrite;
    this.source = sourceDirectory;
    this.fileList = [];
    this.template = _.template(fs.readFileSync(template, 'ascii'));

    this.compileFileList();

    if (!path.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory);
    }

    var that = this;

    _.each(this.fileList, function(modulePath) {
        var module = require(modulePath);

        var test = {
            path : modulePath.replace(sourceDirectory, outputDirectory),
            name : modulePath,
            methods : []
        };

        for (property in module) {
            if (typeof module[property] === "function") {
                console.log("Found function " + property + "..");
                test.methods.push(property);
            }
        };

        that.writeTest(test);

    });

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
        console.log("Test " + test.path + " already exists, use --overwrite if you know what you are doing..");
    } else {
        console.log("Writing test " + test.path + "...");
        fs.writeFileSync(test.path, this.template(test));

    }

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
            that.fileList.push(path);
        }
    });

};

module.exports = generator;