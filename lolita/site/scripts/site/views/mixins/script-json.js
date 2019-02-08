define([


], function() {

    return {

        getJSONData: function(selector) {
            return $.parseJSON($.trim(this.$(selector).html()));
        }

    }
});