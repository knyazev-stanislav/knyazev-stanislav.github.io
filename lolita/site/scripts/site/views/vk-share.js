define([

    'backbone'

], function(Backbone) {

    return Backbone.View.extend({

        options: {
            href: document.location,
            title: document.title,
            image: '',
            text: ''
        },

        renderButton: function() {

            if (typeof VK != 'undefined') {

                var html = VK.Share.button({
                    url: encodeURIComponent(this.options.href) + '?title=' + this.options.title + '&image=' + encodeURIComponent(this.options.image)
                }, {
                    type: "round",
                    text: this.options.text
                });

                this.$el.html(html);
            }
        },

        render: function() {

            if (typeof this.$el.data('text') != 'undefined') {

                this.options.text = this.$el.data('text');
            }

            this.renderButton();
            $('#vkScript').on('JSloaded', this.renderButton);

            return this;
        }
    });
});