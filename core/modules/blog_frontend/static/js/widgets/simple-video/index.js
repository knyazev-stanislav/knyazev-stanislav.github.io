define([

], function() {

    var View = Backbone.View.extend({

        initialize: function() {

            var self = this;

            $(window).on("orientationchange", function(event) {
                self.updateVideoSize();
            });

            $(window).resize(function() {
                self.updateVideoSize();
            });

            return this;
        },

        render: function() {

            var player = this.$('.player');
            var width = player.width();
            var rate = player.data('rate');
            var height = width / rate;

            if (player.length > 0) {
                player.attr('src', player.data('src'));
                player.css('height', height);
                player.parents('.floating-height-inner').css('padding-bottom', height);
            }
            return this;
        },

        updateVideoSize: function() {

            var iframe = this.$el.find('.player');
            var width = iframe.width();
            var rate = iframe.data('rate');

            iframe.css('height', width / rate);
            iframe.parents('.floating-height-inner').css('padding-bottom', width / rate);

            return this;
        }
    });

    return View;
});