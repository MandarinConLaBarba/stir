#!/usr/bin/env node

var _ = require('underscore'),
    program = require('commander'),
    generator = require('../lib/generator');

program.name = "stir";
program
    .version(require('../package.json').version)
    .description("A test-stub generation tool for node.js")
    .usage('<sourceDir> <outputDir> [options]')
    .option('-d, --dry', 'do not actually write to output directory')
    .option('-f, --force', 'force overwrite of files in the output directory')
    .option('-t, --template <templatePath>', 'provide your own test stub template')
    .option('-n, --max <maxStubs>', 'maximum number of stubs to generate', parseInt)
    .option('-e, --explicit', 'look for annotations in source')
    .parse(process.argv);

if (program.args.length !== 2) {
    console.log(program.helpInformation());
} else {

    var options = {
        source : program.args[0],
        output : program.args[1],
        overwrite : program.force === true ? true : false,
        explicit : program.explicit === true ? true : false,
        template : program.template,
        dry : program.dry,
        max : program.max
    };

    generator.on('done', function() {
        console.log("Done...");
        process.exit();
    });

    generator.generate(options);

}
