define(function() {

    var LocalStorage = function() {};

    LocalStorage.prototype = (function() {

        return {

            isSupportsLocalStorage: function() {

                try {
                    return 'localStorage' in window && window['localStorage'] !== null;
                } catch (e) {
                    return false;
                }
            },

            isAllowLike: function(name) {

                value = this.getItem(name);

                if (value) {
                    var msecPerDay = 1000 * 60 * 60 * 24;
                    var now = new Date();
                    var time = new Date(value);
                    var interval = now.getTime() - time.getTime();
                    var days = Math.floor(interval / msecPerDay);

                    return days >= 1 ? true : false;
                }

                return true;
            },

            getItem: function(name) {

                if (this.isSupportsLocalStorage()) {

                    return localStorage.getItem(name);
                }
            },

            setItem: function(name, value) {

                if (this.isSupportsLocalStorage()) {

                    localStorage.setItem(name, value);
                }
            }
        }
    })();

    return LocalStorage;
});