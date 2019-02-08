define([

    'jquery',
    'backbone',

], function($, Backbone) {

    var BlogDispatcher = Backbone.View.extend({

        initialize: function() {

            return this;
        },

        render: function() {

            var blogContent = this.$('.blog-content');
            var backboneView = blogContent.data('backbone-view');

            if (backboneView) {

                require(['module-blog-frontend-static/structures/' + backboneView], function(StructureMainView) {
                    if (StructureMainView) {
                        var view = new StructureMainView({
                            el: blogContent
                        });

                        try {
                            view.render();
                        } catch (e) {
                            console.log('Произошла ошибка при отрисовке блога');
                            console.log(e);
                        }
                    }
                });
            }

            return this;
        },

    });

    return BlogDispatcher;
});