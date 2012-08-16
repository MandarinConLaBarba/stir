var _ = require('underscore'),
    generator = require('./lib/generator');

var args = _.chain(process.argv.slice(2))
        .filter(function(arg) {
            return arg.match(/\-\-(source|output|overwrite)/);
        }).value(),
    getArg = function(name) {
        var theArg = _.find(args, function(arg) {
            return arg.indexOf("--" + name) === 0;
        });
        if (theArg) {
            return theArg.split('=')[1];
        }
    };


var printUsage = function() {

    console.log("------------------------------------------");
    console.log("Stir it up...little darlin', stir it up...");
    console.log("------------------------------------------");
    console.log("Usage: ");
    console.log("   stir --source=/path/to/source/dir --output=/path/to/output/dir [--overwrite=true]");

    console.log("Options: ");
    console.log(" --source  The source directory.");
    console.log(" --output  Where the tests will be generated.")
    console.log(" --overwrite Pass true if you want to delete the target dir. Careful..");

};

if (args.length < 2) {
    printUsage();
} else {

    var options = {
        source : getArg("source"),
        output : getArg("output"),
        overwrite : getArg("overwrite")
    };

    generator.generate(options);
}