define([
    'views/mixins/url',
    'fluid-grid',
    'structures/galcategory/views/layouts/table',
    'structures/photo/views/layouts/grid',
], function(UrlMixin, FluidGrid, CategoryTable) {

    var MainView = Backbone.View.extend({

        layout: null,
        layoutName: null,

        initialize: function(options) {

            _.bindAll(this);

            var self = this;

            this.layoutName = this.$('.container')
                .attr('class').match(/gallery\-layout\-(.*)/)[1];

            var LayoutView = require('structures/photo/views/layouts/' + this.layoutName);

            var layoutOptions = {
                el: self.$el
            };

            if (typeof(options['index']) != undefined)
                layoutOptions['index'] = options.index;

            this.layout = new LayoutView(layoutOptions);

            this.on('remove:before', function() {
                self.layout.trigger('remove:before');
            });
            var $category = $('#category');
            if ($category.length > 0) {
                if ($category.data('type') === 'table') {

                    (new CategoryTable({
                        el: $category
                    })).render();

                } else {
                    (new FluidGrid({
                        el: $("#category .grid")
                    }))
                    .render();
                }
            }
        },

        render: function() {
            this.layout.render();

            return this;
        }
    });

    _.extend(MainView.prototype, UrlMixin);

    return MainView;
});