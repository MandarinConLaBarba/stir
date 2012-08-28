var _ = require('underscore'),
    EventEmitter = require('events').EventEmitter,
    Parser = require('./parser'),
    fs = require('fs'),
    path = require('path'),
    uglify = require('uglify-js');

var generator = new EventEmitter();



generator.init = function(options) {

    var trimTrailingSlash = function(path) {
        var lastIndex = path.length-1;
        if (lastIndex === path.lastIndexOf("/")) {
            return path.substring(0, lastIndex);
        }
        return path;
    };

    var overwrite = options.overwrite === true ? true : false,
        sourceDirectory = path.normalize(trimTrailingSlash(options.source)) + '/',
        outputDirectory = path.normalize(trimTrailingSlash(options.output)) + '/',
        cwd = process.cwd(),
        template = options.template ?
            options.template : __dirname + "/templates/bdd.tpl";
    this.dry = options.dry;

    var initErrors = [];

    if (sourceDirectory.indexOf("/") !== 0) {
        sourceDirectory = cwd + "/" + sourceDirectory;
    }

    if (outputDirectory.indexOf("/") !== 0) {
        outputDirectory = cwd + "/" + outputDirectory;
    }

    if (sourceDirectory == outputDirectory) {
        initErrors.push("Source directory and output directory are the same");
    }
    this.explicit = options.explicit ? true : false;
    this.overwrite = overwrite;
    this.source = sourceDirectory;
    this.fileList = [];
    this.template = _.template(fs.readFileSync(template, 'ascii'));
    this.output = outputDirectory;
    this.maxFiles = options.max ? options.max : 300;

    this.forbiddenDirs = ['node_modules'];

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

    if (this.fileList.length > this.maxFiles) {
        console.error("Number of modules exceeds maximum of " + this.maxFiles);
        console.log("Quitting..");
        return;
    }

    var self = this;

    _.each(this.fileList, function(modulePath) {

        var test = self.explicit ?
            self.getExplicitTest(modulePath) :
            self.getSuggestedTest(modulePath);

        if (test.describes.length === 0) {
            console.log("Skipping module " + modulePath + " because it has no describe blocks");
            return;
        }

        self.writeTest(test);

    });

    this.emit('done');

};

generator.testObjTemplate = function(modulePath) {
    var fileName = _.last(modulePath.split('/')),
        testPath = modulePath.replace(this.source, this.output);

    return {
        moduleName : fileName.split('.')[0],
        path : testPath,
        modulePath : modulePath,
        spec : path.relative(process.cwd(), modulePath).replace(".js", ""),
        relativeModulePath : path.relative(testPath, modulePath).substring(3).replace(".js", "")
    };
};

generator.getSuggestedTest = function(modulePath) {

    var parser = new Parser(modulePath),
        parsed = parser.parse();

    var test = this.testObjTemplate(modulePath);
    test.describes = parsed.suggestedTests;
    return test;
};

generator.getExplicitTest = function(modulePath) {

    var parser = new Parser(modulePath),
        annotations = parser.explicitDescribeAnnotations();

    var test = this.testObjTemplate(modulePath);
    test.describes = annotations;
    return test;
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