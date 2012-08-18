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


            beforeEach(function() {

                sinon.stub(path, "existsSync", function() {
                    return true;
                });

                //TODO: set up spy on fs.writeFileSync

            });

            afterEach(function() {
                path.existsSync.restore();
            })

            it("should not write the test if it already exists..", function(done){

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

                done();

                //expect  fs.writeFileSync not to have been called

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
