#Stir

A simple node.js test-stub generation utility.

###Usage

```
   Usage: stir <sourceDir> <outputDir> [options]

   Options:

     -h, --help                     output usage information
     -V, --version                  output the version number
     -f, --force                    force overwrite of files in the output directory
     -t, --template <templatePath>  provide your own test stub template
```

###Example

#### Run stir against the samples:
```
$ stir test/sample/ test/output/
```

#### Observe the test stubs have been generated w/ the same directory structure as the source directory:
```
$ ls -la test/output/
```

#### Sample generated stub:
```
var should = require('should');

describe("stir/test/sample/dir1/module1.js", function() {


        describe("testFunction", function() {

            it("should do something..", function(done){

                //TODO: make this pass..
                should.exist(undefined);

            });

        });


        describe("testFunction2", function() {

            it("should do something..", function(done){

                //TODO: make this pass..
                should.exist(undefined);

            });

        });


});
```

#### Run the test stub (it will fail):

```
$ mocha test/output/dir1/module1.js

  ..

  ✖ 2 of 2 tests failed:

  1) stir/test/sample/dir1/module1.js testFunction should do something..:
     AssertionError: expected undefined to exist


  2) stir/test/sample/dir1/module1.js testFunction2 should do something..:
     AssertionError: expected undefined to exist

```


