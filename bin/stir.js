#!/usr/bin/env node

var _ = require('underscore'),
    program = require('commander'),
    generator = require('../lib/generator');

program.name = "stir";
program
    .version(require('../package.json').version)
    .description("A test-stub generation tool for node.js")
    .usage('<sourceDir> <outputDir> [options]')
    .option('-f, --force', 'force overwrite of files in the output directory')
    .option('-t, --template <templatePath>', 'provide your own test stub template')
    .parse(process.argv);

if (program.args.length !== 2) {
    console.log(program.helpInformation());
} else {

    var options = {
        source : program.args[0],
        output : program.args[1],
        overwrite : program.force === true ? true : false,
        template : program.template
    };

    generator.on('done', function() {
        console.log("Done...");
        process.exit();
    });

    generator.generate(options);

}
