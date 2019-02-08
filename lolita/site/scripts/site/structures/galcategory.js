define([
    'structures/galcategory/views/layouts/grid',
    'structures/galcategory/views/layouts/table',

], function(TopGallery) {

    var MainView = Backbone.View.extend({

        layout: null,
        layoutName: null,

        initialize: function(options) {

            _.bindAll(this);

            var self = this;

            this.layoutName = this.$('.container')
                .attr('class').match(/gallery\-layout\-(.*)/)[1];

            var LayoutView = require('structures/galcategory/views/layouts/' + this.layoutName);

            var layoutOptions = {
                el: self.$el
            };

            if (typeof(options['index']) != undefined)
                layoutOptions['index'] = options.index;

            this.layout = new LayoutView(layoutOptions);

        },

        render: function() {
            this.layout.render();
            return this;
        }
    });

    return MainView;

});