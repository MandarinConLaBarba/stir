var parser = require('../lib/parser.js'),
    fs = require('fs'),
    path = require('path'),
    sinon = require('sinon'),
    should = require('should');


describe("parser.js", function() {


    describe("getMethodList", function() {

        var readFileSyncStub;

        beforeEach(function() {
            readFileSyncStub = sinon.stub(fs, 'readFileSync')
        });

        afterEach(function() {
            fs.readFileSync.restore();
        });

//        it("should return one method if there is one method in exports", function(){
//
//            var fakeModule = "exports.testFunction123 = function() {};";
////            fakeModule += "module.exports = {func1 : function() {} };"
////            fakeModule += "someVariable = {func2 : function() {}};"
////
////            fakeModule += "module.exports = function() {};";
////            fakeModule += "module.exports = someVariable;"
//
//            fs.readFileSync.returns(fakeModule);
//
//            var functions = parser.getMethodList("some/Fake/Path");
//
//            should.equal(1, functions.length);
//            functions[0].should.equal("testFunction123");
//
//        });
//
//        it("should return all the methods of an object assigned to module.exports", function() {
//            var fakeModule = "var someVariable = {};";
//            fakeModule += "\n";
//            fakeModule += " someVariable.func1 = function() {};";
//            fakeModule += "\n";
//            fakeModule += " someVariable.func2 = function() {};";
//            fakeModule += "\n";
//            fakeModule += "module.exports = someVariable";
//
//            fs.readFileSync.returns(fakeModule);
//
//            var functions = parser.getMethodList("some/Fake/Path");
//
//            should.equal(2, functions.length);
//
//        });

        it("should return all methods of an object variable assigned to module.exports", function() {
            var fakeModule = "var someVariable = { func1 : function() {}, func2 : function() {}};";
            fakeModule += "\n";
            fakeModule += "\n";
            fakeModule += "module.exports = someVariable";

            fs.readFileSync.returns(fakeModule);

            var functions = parser.getMethodList("some/Fake/Path");

            should.equal(2, functions.length);

        });
//
//        it("should return all the methods of an object on the right side of a module.exports assignment", function(){
//
//            var fakeModule = "module.exports = {testFunction1 : function(){}, testFunction2 : function(){}}";
//
//            fs.readFileSync.returns(fakeModule);
//
//            var functions = parser.getMethodList("some/Fake/Path");
//
//            should.equal(2, functions.length);
//
//        });

    });



});
