var targetModule = require('<%= relativeModulePath %>'),
    should = require('should');

describe("<%= spec %>", function() {
    <% for (var index = 0; index < describes.length; index++){ %>
        <% var describe = describes[index]; %><%
        if (typeof describe === "object") { %>
            describe("<%= describe.title %>", function() {
            <% for (var index2 = 0; index2 < describe.specs.length; index2++){ %>
                <% var spec = describe.specs[index2]; %>
                    it("<%= spec %>", function() {

                    });
            <% } %>
            });<%
        } else { %>
            describe("<%= describe %>", function() {

                it("should do something..", function(){

                    //TODO: make this pass..
                    should.exist(undefined);

                });
            });
         <% } %>
    <% } %>

});
