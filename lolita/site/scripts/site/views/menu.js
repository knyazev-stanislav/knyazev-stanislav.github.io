define([

    'backbone',
    'views/sub-menu'

], function(Backbone, SubMenu) {

    return Backbone.View.extend({

        events: {
            'mouseover .with-sub': 'showSubmenu'
        },

        sub: null,

        initialize: function() {
            _.bindAll(this);
        },

        showSubmenu: function(e) {

            var item = $(e.currentTarget);

            var header = item.parents('header');
            var subEl = header.find('> .sub-menu#sub-' + item.data('id'));

            if (this.sub && !this.sub.$el.eq(subEl)) {
                this.sub.hide();
                this.sub.unbind();
            }

            this.sub = new SubMenu({

                el: subEl,
                header: header,
                activeItem: item

            }).render().show();

        },

        render: function() {
            return this;
        }
    });
});