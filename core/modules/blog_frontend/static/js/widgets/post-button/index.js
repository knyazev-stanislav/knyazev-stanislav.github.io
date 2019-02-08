define([], function() {

    var View = Backbone.View.extend({

        initialize: function() {
            return this;
        },

        render: function() {
            var self = this;

            this._updateButtonPadding();
            $(window).resize(function() {
                self._updateButtonPadding();
            });
            this.$el.find('.post-button-content').removeClass('hided');
        },

        _updateButtonPadding: function() {
            var widgetId = this.$el.data('id');
            var $element = $('#widget_' + widgetId + ' .element');
            var $content = $element.find('.post-button-content');
            var buttonHorizontalPaddings = $content.data('horizontal-paddings');

            if (buttonHorizontalPaddings != "" && !_.isNull(buttonHorizontalPaddings)) {
                $content.removeClass('forcePadding');
                var parentBox = $content.parents('.element.post-button').outerWidth();
                if ($content.outerWidth() >= parentBox) {
                    $content.addClass('forcePadding');
                }
            }
        },
    });

    return View;
});