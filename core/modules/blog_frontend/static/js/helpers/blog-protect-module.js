define(function() {

    // Constructor
    function ProtectImages(message) {

        this.selector = null;
        this.elements = [];
        this.message = message;

        this.timer = null;
        this.tooltip = null;

        this.options = {
            hideAfter: 1000,
            text: '',
            effect: {
                duration: 300
            },
            offset: {
                x: 20,
                y: 20
            },
        }
    };

    ProtectImages.prototype = (function() {

        return {

            initProtector: function(selector) {

                this.selector = selector;
                this.elements = document.querySelectorAll(this.selector);
                this.tooltip = _createTooltip(this.message);

                _initEvents.call(this);

                return this;
            },

            showTooltip: function(position) {

                var self = this;

                if (typeof this.tooltip === null) {

                    this.tooltip = _createTooltip(this.message);
                }

                if (this.timer) {

                    clearTimeout(this.timer);
                    this.timer = null;
                }

                this.tooltip.style.left = position.pageX + this.options.offset.x + 'px';
                this.tooltip.style.top = position.pageY + this.options.offset.y + 'px';

                // @TODO-NY: __fadeIn, __fadeOut
                $(this.tooltip).fadeIn(this.options.effect.duration, function() {

                    self.timer = setTimeout(function() {

                        $(self.tooltip).fadeOut(self.options.effect.duration);
                    }, self.options.hideAfter);
                });

                // __faneIn.call(
                // 	this.tooltip, 
                // 	this.options.effect.duration, 
                // 	function() {

                // 		self.timer = setTimeout(function() {

                // 			//self.tooltip.style.opacity = 0;
                // 			self.tooltip.fadeOut(self.options.effect.duration);
                // 		}, self.options.hideAfter);
                // 	}
                // );

                return this;
            },

            disableDragAndDrop: function(selector) {

                var self = this;

                [].forEach.call(
                    document.querySelectorAll(selector),
                    function(element) {

                        _disableDragAndDrop.call(self, element);
                    }
                );
            },

            disableContextMenu: function(selector) {

                var self = this;

                [].forEach.call(
                    document.querySelectorAll(selector),
                    function(element) {

                        _disableContextMenu.call(self, element);
                    }
                );
            }
        }

    })();

    function _initEvents() {

        var self = this;

        [].forEach.call(this.elements, function(element) {

            _disableContextMenu.call(self, element);
            _disableDragAndDrop.call(self, element);
        });

        return this;
    }

    function _disableContextMenu(element) {

        var self = this;

        element.addEventListener('contextmenu', function(event) {

            event.preventDefault();

            var position = {
                pageX: event.pageX,
                pageY: event.pageY,
            }

            self.showTooltip(position);

            return false
        });

        return this;
    }

    function _disableDragAndDrop(element) {

        element.addEventListener('dragstart', __preventEvent);
        element.addEventListener('dragdrap', __preventEvent);

        return this;
    }

    function _createTooltip(message) {

        var tooltip = document.createElement('div');

        tooltip.setAttribute('class', 'blog-copy-protector tooltip');
        tooltip.innerHTML = message;
        tooltip.innerHTML = tooltip.textContent || tooltip.innerText || "";

        document.body.appendChild(tooltip);

        return tooltip;
    }

    function __preventEvent(event) {

        event.preventDefault();
        return false;
    }

    function __faneIn(duration, callback) {

        this.style.display = 'block';

        var self = this;
        var maxOpacity = 1;
        var currentOpacity = parseFloat(this.style.opacity);
        var stepDelay = 10;
        var stepsCount = (duration / stepDelay) || 100;
        var stepOpacity = (maxOpacity - currentOpacity) / stepsCount;

        var temp;
        // https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
        var timer = setInterval(function() {

            temp = currentOpacity + stepOpacity;
            self.style.opacity = temp;

            if (--stepsCount <= 0 || temp >= maxOpacity) {

                self.style.opacity = maxOpacity;
                clearInterval(timer);
            }

        }, stepDelay)

        callback();
    }

    return ProtectImages;

});