define([

    'module-blog-frontend-static/widgets/simple-image/model',

], function(Model) {

    var View = Backbone.View.extend({

        selector: {
            options: '.widget-options'
        },

        options: {

        },

        indexes: [500, 1000, 1500, 2000],
        // removed size 300 for mobile

        mediaQuery: "(-webkit-min-device-pixel-ratio: 2),\(min--moz-device-pixel-ratio: 2),\(-o-min-device-pixel-ratio: 4/2),\(min-resolution: 2dppx)",

        retina: ((window.devicePixelRatio > 1.5) || (window.matchMedia && window.matchMedia(self.mediaQuery).matches)) ? true : false,

        isMobile: null,

        initialize: function() {

            var self = this;
            this.model = null;

            var jsonOptions = this.$el.children(this.selector.options).text();

            if (_.isString(jsonOptions) && jsonOptions !== "") {

                var options = JSON.parse(jsonOptions);

                if (_.isObject(options)) {

                    this.model = new Model(options);
                }
            }

            self.isMobile = $('body').hasClass('mobile');

            $(window).resize(function() {

                self.render();
            });

            this.render();

            return this;
        },

        fixPositionImage: function() {
            var self = this;
            if (self.$('> .element').is('.imageNoStretch') && self.$('.image-block').data('naturalWidth') != undefined) {
                self.$('.image-block')
                    .css('max-height', self.$('.image-block').width() * self.$('.image-block').data('naturalHeight') / self.$('.image-block').data('naturalWidth') + 'px');

                self.$('.image-block img')
                    .css('margin-left', -self.$('.image-block').data('naturalWidth') / 2 + self.$('.image-block').width() / 2)
                    .css('margin-top', -self.$('.image-block').data('naturalHeight') / 2 + self.$('.image-block').height() / 2)
            }
        },

        render: function() {

            var self = this;

            if (_.isNull(this.model)) {
                return this;
            }

            var storage = this.model.get('storage');
            // Size for slides area
            var width = this.$('.image-box').width();
            var height = this.$('.image-box').height();

            // Set correct filename for image
            var index = '2000';
            var photoData = this.model.get('photoData');
            if (_.isUndefined(photoData) || _.isEmpty(photoData)) {
                return this;
            }
            var size = photoData['size'];
            if (!_.isUndefined(photoData['crop']) && !_.isEmpty(photoData['crop'])) {
                var rate = photoData['crop']['w'] / photoData['crop']['h']
            } else {
                var rate = size.width / size.height;
            }

            if (this.$('img').data('dynamic') == true) {
                height = width / rate;
            }

            for (i in this.indexes) {
                if (this.indexes[i] >= width && this.indexes[i] / rate >= height) {

                    if (self.retina && !self.isMobile && i != this.indexes.length - 1) {
                        newIndex = +i + 1;
                        index = this.indexes[newIndex];
                    } else {
                        index = this.indexes[i];
                    }

                    break;
                }
            }

            if (this.$('img').data('dynamic') == true) {
                this.$('img').attr('data-file-name', index + '-' + photoData['name']);
                self.fixPositionImage();
                this.$('img').on('load', function() {
                    var src = $(this).attr('src');
                    self.$('.image-block').css('background', "url('" + src + "') no-repeat 50% 50%");
                    $(this).removeData("dynamic");

                    self.$('.image-block').data('naturalWidth', this.naturalWidth).data('naturalHeight', this.naturalHeight);
                    self.fixPositionImage();
                });
            } else {
                this.$('.image-block').css('background', 'url(' + storage + index + '-' + photoData['name'] + ') no-repeat 50% 50%');
                this.$('.image-block img').attr('src', storage + index + '-' + photoData['name']);
            }
            return this;

        },

    });

    return View;
});