#Stir

A simple node.js test-stub generation utility.

###Usage

```
 ------------------------------------------
 Stir it up...little darlin', stir it up...
 ------------------------------------------
 Usage:
    stir <sourceDir> <outputDir> [--force]
 Options:
  --force   Pass true if you want to overwrite files in the output dir. Careful..
```

###Example

#### Run stir against the samples
```
$ stir test/sample/ test/output/
```

#### Observe the test stubs have been generated w/ the same directory structure as the source directory:
```
$ ls -la test/output/
```
#### Sample generated stub
```
var should = require('should');

describe("stir/test/sample/dir1/module1.js", function() {


        describe("testFunction", function() {

            it("should do something..", function(done){

                //TODO: make this pass..
                should.exist(null);

            });

        });


        describe("testFunction2", function() {

            it("should do something..", function(done){

                //TODO: make this pass..
                should.exist(null);

            });

        });


});
```


