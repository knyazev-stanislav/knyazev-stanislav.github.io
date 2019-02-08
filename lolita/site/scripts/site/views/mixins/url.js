define([


], function() {

    return {

        hash: function() {
            return this.$el.data('hash');
        },

        url: function(el) {

            var buildUrl = function(el) {

                var url = '';
                var rootSelector = ':not(.page > section)';

                var parent = el.parents('[data-structure]');

                if (parent.length && parent.is(rootSelector)) {
                    url += buildUrl(parent) + '/';
                }

                if (el.data('hash') && el.is(rootSelector)) {
                    url += el.data('hash');
                }

                return url
            }

            return buildUrl(this.$el);
        },

    }

});