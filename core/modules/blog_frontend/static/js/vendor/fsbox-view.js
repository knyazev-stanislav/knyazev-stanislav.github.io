define([
    'jquery',
    'backbone',
    'module-blog-frontend-static/vendor/spinners.min',
    'module-blog-frontend-static/vendor/fsbox',
    'module-blog-frontend-static/vendor/jquery.touchSwipe.min'

], function($, Backbone, Spinner, Fsbox) {

    var MainView = Backbone.View.extend({

        box: '',

        render: function() {
            var self = this;

            Spinners.create($('#fsbox .spinner'), {
                radius: 7,
                height: 10,
                width: 1.5,
                dashes: 20,
                opacity: 0.85,
                rotation: 800,
                color: '#000000'
            }).center().play();


            var images = $('#fsbox .slides img');
            var storage = $('#fsbox').data('storage');

            var indexes = [300, 500, 1000, 1500, 2000];
            // Size for slides area
            var width = $(window).width() - 20;
            var height = $(window).height() - 100;

            // Set correct filename for image
            $(images).each(function() {
                var file = '2000-';
                var size = $(this).data('sizes');
                if (size) {
                    for (i in indexes) {
                        if (size[indexes[i]] && (size[indexes[i]].w >= width || size[indexes[i]].h >= height)) {
                            file = indexes[i] + '-';
                            break;
                        }
                    }
                }
                $(this).data('fsbox-src', storage + file + $(this).data('file'));
            });

            this.box = new Fsbox({
                el: $('#fsbox')
            }).render();

            if ('ontouchstart' in document.documentElement) {
                self.box.$el.find('.slides').swipe({
                    triggerOnTouchEnd: true,
                    swipeStatus: function swipeStatus(event, phase, direction, distance) {
                        if (phase == "end") {
                            if (direction == "right") {
                                self.box.prev();
                            } else if (direction == "left") {
                                self.box.next();
                            }
                        }
                    },
                    allowPageScroll: "vertical",
                    threshold: 75
                });
            }
            return this;
        }
    });


    return MainView;
});