var generator = require('../lib/generator.js'),
    fs = require('fs'),
    path = require('path'),
    sinon = require('sinon'),
    should = require('should');

describe("generator.js", function() {
    
        
        describe("init", function() {

            var pathExistsStub;

            beforeEach(function() {
                pathExistsStub = sinon.stub(path, "existsSync");
            });

            afterEach(function() {
                path.existsSync.restore();
            });

            it("should return error if the source and output directories match", function(){

                pathExistsStub.returns(true);

                var options = {
                    source : "blah",
                    output : "blah"
                };

                var errors = generator.init(options);

                should.equal(1, errors.length);


            });

            it("should return error if the source directory doesn't exist", function() {
                pathExistsStub.returns(false);
                var options = {
                    source : "blah1",
                    output : "blah2"
                };
                var errors = generator.init(options);
                should.equal(1, errors.length);

            });

            it("should return error if the source directory contains 'node_modules'", function() {
                pathExistsStub.returns(true);
                var options = {
                    source : "blah1/node_modules",
                    output : "blah2"
                };
                var errors = generator.init(options);
                should.equal(1, errors.length);

            });


        });
    
        
        describe("generate", function() {

            var initStub;

            beforeEach(function() {
                initStub = sinon.stub(generator, "init");
            });

            afterEach(function() {
                generator.init.restore();
            });

            it("should fail if init yields errors", function(){

                initStub.returns(["error"]);

                var spy = sinon.spy(generator, "compileFileList");

                generator.generate(null);

                spy.called.should.be.false;

                generator.compileFileList.restore();

            });

            it("should fail if the maximum tests is exceeded", function(){

                initStub.returns([]);

                var compileFileListStub = sinon.stub(generator, "compileFileList"),
                    writeFileSpy = sinon.spy(generator, "writeTest");

                generator.fileList = ["a", "b"];
                generator.maxFiles = 1;
                generator.generate(null);
                compileFileListStub.called.should.be.true;
                writeFileSpy.called.should.be.false;

                generator.compileFileList.restore();

            });

        });
    
        
        describe("writeTest", function() {

            var fsWriteFileStub;

            beforeEach(function() {
                fsWriteFileStub = sinon.stub(fs, "writeFileSync");
                generator.template = sinon.stub();
            });

            afterEach(function() {
                fs.writeFileSync.restore();
            });

            it("should not write the test if it already exists", function() {

                sinon.stub(path, "existsSync", function() {
                    return true;
                });

                generator.overwrite = false;

                var fakeTest = {
                    specName : "someSpec",
                    moduleName : "someModule",
                    path : "some/fake/path/",
                    modulePath : "some/fake/path",
                    relativePathToModule : "../some/fake/relative/path/",
                    methods : ["aFakeMethod"]
                };

                generator.writeTest(fakeTest);

                fsWriteFileStub.called.should.be.false;

                path.existsSync.restore();

            });


            it("should write the test no matter what with the overwrite option", function() {

                sinon.stub(path, "existsSync", function() {
                    return true;
                });

                generator.overwrite = true;

                var fakeTest = {
                    specName : "someSpec",
                    moduleName : "someModule",
                    path : "some/fake/path/",
                    modulePath : "some/fake/path",
                    relativePathToModule : "../some/fake/relative/path/",
                    methods : ["aFakeMethod"]
                };

                generator.writeTest(fakeTest);

                fsWriteFileStub.called.should.be.true;

                path.existsSync.restore();

            });

        });
    
        
        describe("getMethodList", function() {

            it("should do something..", function(done){

                //TODO: make this pass..
                should.exist(undefined);

            });

        });
    
        
        describe("compileFileList", function() {

            it("should do something..", function(done){

                //TODO: make this pass..
                should.exist(undefined);

            });

        });
    

});
