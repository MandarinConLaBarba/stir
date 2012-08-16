var _ = require('underscore'),
    fs = require('fs'),
    path = require('path');

var generator = {};

generator.generate = function(source, dest, template) {

    if (!dest.match("/$")) {
        dest = dest + "/";
    }

    this.source = source;
    this.dest = dest;
    this.fileList = [];
    this.template = _.template(fs.readFileSync(template, 'ascii'));

    this.compileFileList();

    //TODO: check if dest dir exists, if not create
    if (!path.existsSync(dest)) {
        fs.mkdirSync(dest);
    }

    var that = this;

    _.each(this.fileList, function(modulePath) {
        var module = require(modulePath);

        var test = {
            path : modulePath.replace(source, dest),
            name : modulePath,
            methods : []
        };

        for (property in module) {
            if (typeof module[property] === "function") {
                console.log("function " + property + " found..");
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
            console.log(currentDir + " does not exist");
            fs.mkdirSync(currentDir);
        }
    });

    console.log("Writing test " + test.path + "...");
    fs.writeFileSync(test.path, this.template(test));

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

//TODO: make sure required args are there
var required = ["source", "dest", "template"],
    args = _.chain(process.argv.slice(2))
        .filter(function(arg) {
            return arg.indexOf("--") === 0 && arg.indexOf("=") >= 3;
        }).value(),
    getArg = function(name) {
        var theArg = _.find(args, function(arg) {
            return arg.indexOf("--" + name) === 0;
        });
        if (theArg) {
            return theArg.split('=')[1];
        }
    };

if (args.length < 2) {
    console.log("Invalid args.");
} else {

    var source = getArg("source"),
        dest = getArg("output"),
        template = getArg("template");

    template = template ? template : __dirname + "/templates/bdd.tpl";

    generator.generate(source, dest, template);
}