var targetModule = require('<%= relativeModulePath %>'),
    should = require('should');

describe("<%= spec %>", function() {
    <% for (var index = 0; index < methods.length; index++){ %>
        <% var method = methods[index]; %>
        describe("<%= method %>", function() {

            it("should do something..", function(done){

                //TODO: make this pass..
                should.exist(undefined);

            });

        });
    <% } %>

});
