var generator = require('../lib/generator.js'),
    fs = require('fs'),
    path = require('path'),
    sinon = require('sinon'),
    should = require('should');

describe("generator.js", function() {
    
        
        describe("init", function() {

            it("should do something..", function(done){

                //TODO: make this pass..
                should.exist(undefined);

            });

        });
    
        
        describe("generate", function() {

            it("should do something..", function(done){

                //TODO: make this pass..
                should.exist(undefined);

            });

        });
    
        
        describe("writeTest", function() {

            var fsWriteFileStub;


            beforeEach(function() {

                sinon.stub(path, "existsSync", function() {
                    return true;
                });

                fsWriteFileStub = sinon.stub(fs, "writeFileSync");

            });

            afterEach(function() {
                path.existsSync.restore();
                fs.writeFileSync.restore();
            });

            it("should not write the test if it already exists..", function(){

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
