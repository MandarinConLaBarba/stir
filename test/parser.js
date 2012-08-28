var Parser = require('../lib/parser.js'),
    fs = require('fs'),
    path = require('path'),
    sinon = require('sinon'),
    should = require('should'),
    util = require('util');


describe("parser2.js", function() {

    var readFileSyncStub;

    beforeEach(function() {
        readFileSyncStub = sinon.stub(fs, 'readFileSync')
    });

    afterEach(function() {
        fs.readFileSync.restore();
    });

    it("should return one method if there is one method in exports", function(){

        var fakeModule = "exports.testFunction123 = function() {};";
        fs.readFileSync.returns(fakeModule);

        var parser = new Parser();

        var parsed = parser.parse("some/Fake/Path");

        should.equal(1, parsed.suggestedTests.length);
        parsed.suggestedTests[0].should.equal("testFunction123");

    });

    it("should work with module.exports = function()", function() {
        var fakeModule = "module.exports = function() {}";

        fs.readFileSync.returns(fakeModule);

        var parser = new Parser();

        var parsed = parser.parse("some/Fake/Path");

        should.equal(1, parsed.suggestedTests.length);

    });

    it("should return all the methods of an object assigned to module.exports", function() {
        var fakeModule = "var someVariable = {};";
        fakeModule += "\n";
        fakeModule += " someVariable.func1 = function() {};";
        fakeModule += "\n";
        fakeModule += " someVariable.func2 = function() {};";
        fakeModule += "\n";
        fakeModule += "module.exports = someVariable";

        fs.readFileSync.returns(fakeModule);
        var parser = new Parser();

        var parsed = parser.parse("some/Fake/Path");

        console.log(util.inspect(parsed, false, null));
        should.equal(2, parsed.suggestedTests.length);

    });

    it("should return all methods of an object variable assigned to module.exports", function() {
        var fakeModule = "var someVariable = { func1 : function() {}, func2 : function() {}};";
        fakeModule += "\n";
        fakeModule += "\n";
        fakeModule += "module.exports = someVariable";

        fs.readFileSync.returns(fakeModule);

        var parser = new Parser();

        var parsed = parser.parse("some/Fake/Path");

        should.equal(2, parsed.suggestedTests.length);

    });

    it("should return all the methods of an object on the right side of a module.exports assignment", function(){

        var fakeModule = "module.exports = {testFunction1 : function(){}, testFunction2 : function(){}}";

        fs.readFileSync.returns(fakeModule);

        var parser = new Parser();

        var parsed = parser.parse("some/Fake/Path");

        should.equal(2, parsed.suggestedTests.length);

    });





});
