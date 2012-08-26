### TODOs

- Add composer that recreates tests using uglify...this way can append missing stubs to existing test files
- Add argument for base spec name..some way to prepend name to module in describe statment..i.e. --spec-prefix routes/api/ ...would cause spec name to be routes/api/categories/get 
- Add parsing of @should tags in comment blocks (generate a test for each @should tag)
- Add console output ansi colors
- Allow template argument to override default template
- Add tdd style template option
- Change the template to exclude local structure in the describe calls...should be relative to source directory
