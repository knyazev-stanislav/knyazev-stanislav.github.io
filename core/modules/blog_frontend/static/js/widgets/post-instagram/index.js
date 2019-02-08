define([

    'module-blog-frontend-static/widgets/post-instagram/model',
    'module-blog-frontend-static/vendor/static-grid',
    'module-blog-frontend-static/vendor/gallery'

], function(Model, galleryStaticGrid, gallerySlideshow) {

    var View = Backbone.View.extend({

        initialize: function() {
            var self = this;
            this.model = null;
            return this;
        },

        render: function() {
            var widgetId = this.$el.data('id');

            var $element = $('#widget_' + widgetId + ' .element');
            $element.html('');

            if ($('body').is('.oliver')) {
                var isPreview = (window.location.hash.indexOf("post-preview/") > -1) ? 1 : 0;
            } else {
                var isPreview = (window.location.pathname.indexOf("post-preview/") > -1) ? 1 : 0;
            }

            var opts = $.parseJSON($.trim($('#blog-options').html()))
            if (opts['url'] !== undefined) {
                $.ajax({
                    type: "GET",
                    url: '/' + opts['url'] + '/widget-content/' + widgetId + '/' + isPreview,
                    dataType: 'json'
                }).done(function(data) {
                    var $element = $('#widget_' + widgetId + ' .element');
                    $element.html(data['html']);

                    if (data['layout'] == 'slideshow') {
                        (new gallerySlideshow({
                            el: $element.find('.instagram-box')
                        })).render();
                    }
                    if (data['layout'] == 'grid') {
                        (new galleryStaticGrid({
                            el: $element.find('.static-grid')
                        })).render();
                    }
                });
            }
        },
    });

    return View;
});