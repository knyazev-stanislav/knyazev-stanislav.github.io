define([

    'module-blog-frontend-static/widgets/post-form/model',
    'perfect-scroll',
    'autosize',
    'module-blog-frontend-static/widgets/post-form/dialog',

], function(Model, Ps, autosize) {

    var View = Backbone.View.extend({

        events: {
            'click .form__field_file': '_openFileUpload'
        },

        initialize: function() {
            var self = this;
            this.model = null;
            this.fileSize = 0;
            this.files = [];
            var widgetId = this.$el.data('id');

            var $element = $('#widget_' + widgetId + ' .element');

            return this;
        },

        _sendForm: function($widget, instancePB) {
            var unableToConnect = '<div class="form__field-indent unable-to-connect">&nbsp;<span>Unable to connect</span></div>';
            var self = this,
                $form = $widget.find('form');

            if ($widget.find('input[type=file]').length && !$widget.find('input[type=file]').fileinput('getFileStack').length) {
                $form.find('input[type=file]').attr('disabled', true);
            }

            var _formData = new FormData($form[0]);

            $widget.find('button.progress-button').removeClass('loading-end');
            $widget.find('input[type=file]').val('');

            _formData.append('wid', $widget.find('form').data('form'));
            _formData.append('link', window.location.href);
            for (var x = 0; x < $widget.find('input[type=file]').fileinput('getFileStack').length; x++) {
                _formData.append('fileData[]', $widget.find('input[type=file]').fileinput('getFileStack')[x]);
            }

            $widget.find('input[type=file]').attr('disabled', false);

            $.ajax({
                url: '/__api/blog/sendform',
                type: 'POST',
                data: _formData,
                processData: false,
                contentType: false,
                xhr: function() {
                    var xhr = new window.XMLHttpRequest();
                    //Upload progress
                    xhr.upload.addEventListener("progress", function(evt) {
                        if (evt.lengthComputable) {
                            var percentComplete = evt.loaded / evt.total;
                            instancePB._setProgress(percentComplete);
                        }
                    }, false);
                    return xhr;
                },
                success: function(data) {
                    $widget.find('button.progress-button').addClass('loading-end');
                    instancePB._stop(1);
                    var timeDelay = 5000;
                    $form.css({
                        'visibility': 'hidden'
                    });
                    if ($widget.find('.success-message').text() == "") {
                        timeDelay = 0;
                    } else {
                        $widget.find('.success-message').show();
                    }
                    if (typeof eval('submitForm' + $form.data('form')) == 'function') {
                        eval('submitForm' + $form.data('form'))();
                    }
                    $widget.find('form')[0].reset();
                    $widget.find('form select.form__select').each(function() {
                        $(this).selectize()[0].selectize.clear();
                        var placeholder = $(this).attr('placeholder');
                        if (placeholder !== '' && !$(this).find('~ * .selectize-input').find('.selectize-placeholder').size()) {
                            $(this).find('~ * .selectize-input').prepend('<div class="selectize-placeholder">' + placeholder + '</div>');
                        }
                    });
                    setTimeout(function() {
                        if ($widget.find('form').attr('data-popup') == 1) {
                            $widget.dialog('close');
                        } else {
                            $widget.find('.success-message').hide();
                            $form.css({
                                'visibility': 'visible'
                            });
                        }
                    }, timeDelay);
                    $widget.find('.unable-to-connect').remove();
                    $widget.find('.file-error-message').hide();
                    self.fileSize = 0;
                    self.filesIds = [];

                    // reset placeholders
                    $widget.find('input, textarea').blur();
                },
                error: function(err) {
                    if (!$widget.find('.unable-to-connect').size()) {
                        $widget.find('.form__btn-box').append(unableToConnect);
                    }
                }
            });
        },

        _openFileUpload: function() {
            this.$el.find('.file__input').click();
        },

        validate: function($form) {
            var result = true;
            var errMessages = JSON.parse($('#post-form-error-messages').text());
            $form.find('.form__field-box').each(function() {
                // var errorEl = $(this).closest('.form__field-box').find('.form__error-msg');
                var emailrule = new RegExp('^[a-zA-Z0-9._-]+@[a-zA-Z0-9_-]+[\.][a-zA-Z0-9._-]+$');
                // if (!errorEl.size()) {
                //     $(this).find('~ .form__field-indent').append('<div class="form__error-msg"></div>');
                //     errorEl = $(this).closest('.form__field-box').find('.form__error-msg');
                // }
                var value = $(this).find('input,textarea,select').val();
                if ($(this).find('input,textarea,select').attr('data-required') == 1 && value == "") {
                    $(this).addClass('state-error');
                    // errorEl.text(errMessages.required);
                    result = false;
                    return; //continue
                }
                if ($(this).find('input').attr('type') == 'email') {
                    if ($(this).find('input').val() != '' && !emailrule.test($(this).find('input').val())) {
                        $(this).addClass('state-error');
                        // errorEl.text(errMessages.mailerror);
                        result = false;
                    }
                }
            });
            $form.find('.form__field-box').each(function() {
                if ($(this).find('input[type=checkbox]').attr('data-required') == 1 && !$(this).find('input').prop('checked')) {
                    $(this).addClass('state-error');
                    result = false;
                }
            });
            return result;
        },

        render: function() {
            var widgetId = this.$el.data('id');
            var $element = $('#widget_' + widgetId + ' .element');
            var $content = $element.find('.post-form-content');
            var $dialogWrap = $('#dialog-wrap');
            if ($dialogWrap.length == 0) {
                $(document.body).append('<div id="dialog-wrap"></div>');
                $dialogWrap = $('#dialog-wrap');
            }

            var self = this;

            this.initProgressButton(this.$el);
            this.$el.find('.progress-content').addClass('form__btn_cont');

            $element.find('.form__btn_popup_open').click(function(e) {
                e.preventDefault();
                var btnPopupOpen = $(this).addClass('disable');

                $dialogWrap.append('<div id="dialog-form-popup-' + widgetId + '"></div>');
                var $dialog = $("#dialog-form-popup-" + widgetId).addClass('element post-form');

                $dialog.html($content.clone(true).wrap('<div></div>').parent().html()).dialog({
                    autoOpen: false,
                    position: {
                        collision: 'flipfit'
                    },
                    dialogClass: "dialog-widget-form-popup popup-form-" + widgetId,
                    open: function(event, ui) {
                        $(document.body).addClass('dialog-active');

                        centerDialog();
                    },
                    close: function() {
                        $(document.body).removeClass('dialog-active');
                        btnPopupOpen.removeClass('disable');
                    }
                });

                $dialog.find('.btn_open_popup,form > style').remove();
                $dialog.find('form').addClass('select-init');
                self.initProgressButton($dialog);
                $dialog.find('.progress-content').addClass('form__btn_cont');
                var input = $dialog.find('.chat-action_upload.file-uploader input,.chat-action_upload.file-uploader .form__field-indent');
                $dialog.find('.chat-action_upload.file-uploader').html(input);
                $dialog.find('input[type=file]').addClass('file-loading');
                $(this).width("");
                self._renderForm($dialog);

                // set background form
                var backgroundImage = ($('body').hasClass('victoria')) ? $('#page').css('background-image') : $(document.body).css('background-image');
                var backgroundColor = ($('body').hasClass('victoria')) ? $('#page').css('background-color') : $(document.body).css('background-color');
                if (backgroundImage != 'none') {
                    $dialog.parent().css('background', backgroundImage);
                } else {
                    $dialog.parent().css('background', backgroundColor);
                }

                $(window).resize(function() {
                    centerDialog();
                });

                function centerDialog() {
                    var heightDialog = $dialog.parent().outerHeight(true);
                    var heightDialogWrapper = $dialogWrap.height();

                    if (heightDialogWrapper < heightDialog) {
                        $dialog.parent() /*.css('top', 50)*/ .addClass('dialogOverflow');
                    } else {
                        $dialog.parent().removeClass('dialogOverflow').css('top', ($dialogWrap.height() - $dialog.parent().outerHeight(true)) / 2);
                    }
                }

                $dialogWrap.append($dialog.parent());
                $dialog.parent().append('<div class="close-popup" style="color:' + $element.find('.form-settings').data('title-color') + ';">+</div>');

                $dialog.parent().find('.close-popup').click(function() {
                    $dialog.dialog('close');
                });
                $dialogWrap.click(function() {
                    $dialog.dialog('close');
                });
                $dialog.parent().click(function(e) {
                    e.stopPropagation();
                });


                $dialog.dialog('open');
            });

            this._renderForm(this.$el);
        },

        initProgressButton: function($widget) {
            var self = this;
            new ProgressButton($widget.find('button.progress-button')[0], {
                callback: function(instance) {
                    if (self.validate($widget.find('form'))) {
                        instance.options.statusTime = 1000;
                        self._sendForm($widget, instance);
                    } else {
                        instance.options.statusTime = 100;
                        // instance._setProgress(1);
                        instance._stop(1);
                    }
                }
            });
        },

        _renderForm: function($widget) {

            var self = this;
            var isInitSelect = ($widget.find('form').attr('data-popup') == "" || $widget.find('form.select-init').attr('data-popup') == 1) ? true : false;

            if (isInitSelect) {

                var countVisibleItems = 5;

                setTimeout(function() {
                    [].forEach.call(document.querySelectorAll('.selectize-dropdown-content'), function(el) {
                        Ps.initialize(el, {
                            wheelSpeed: 2,
                            wheelPropagation: false,
                            minScrollbarLength: 20
                        });
                    });
                }, 300);

                $widget.find('form .form__select').click(function() {
                    [].forEach.call(document.querySelectorAll('.selectize-dropdown-content'), function(el) {
                        Ps.update(el);
                    });
                });

                var handler = function() {
                    $widget.find('form .form__select').selectize({
                        create: false,
                        onInitialize: function() {
                            $widget.find('form .form__select').click(function() {
                                [].forEach.call(document.querySelectorAll('.selectize-dropdown-content'), function(el) {
                                    Ps.update(el);
                                });
                            });
                        },
                        onDropdownOpen: function(dropdown) {
                            // Определяем виджет в попапе либо на странице
                            if ($widget.find('form').attr('data-popup') != 1) {
                                // Убираем открывание вверх
                                dropdown.parents('.selectize-control').removeClass('mod--top');
                                // Виджеты в одном месте, нет 2 блоков в которых есть виджеты
                                var wl = $('.widget:last').parents('.row');
                                // Вычисляем низ родителя
                                var heightLimit = wl.offset().top + wl.outerHeight()
                                // Вычислям низ раскрытого меню
                                var dl = dropdown.find('.selectize-dropdown-content');
                                var heightDropdown = dl.offset().top + dl.outerHeight()
                                // Если разкрытый селект не влазит в родителя, раскрываем его вверх
                                if (heightDropdown > heightLimit) {
                                    dropdown.parents('.selectize-control').addClass('mod--top');
                                }
                            }
                            // Ограничиваем N пунктами
                            var heightOne = dropdown.find('.selectize-dropdown-content .option').outerHeight(true);
                            dropdown.find('.selectize-dropdown-content').css('max-height', countVisibleItems * heightOne);
                            dropdown.parents('.form__field-box').addClass('active');
                        },
                        onChange: function(value) {

                            var el = $(this.$wrapper[0]);
                            var placeholderSize = el.find('.selectize-placeholder').size();
                            var elF = el.find('.selectize-input');
                            var placeholder = this.settings.placeholder;

                            if (placeholderSize < 1) {
                                elF.append('<div class="selectize-placeholder form__placeholder">' + placeholder + '</div>');
                            }

                        },
                        onDropdownClose: function(dropdown) {
                            setTimeout(function() {
                                dropdown.parents('.form__field-box').removeClass('active');
                            }, 200);
                        }
                    });
                }

                handler();
            }

            $widget.find('[data-custom-scroll]').each(function() {
                var area = $(this);
                area.click(function() {
                    $(this).find('textarea').focus();
                });
            });

            setTimeout(function() {
                [].forEach.call(document.querySelectorAll('[data-custom-scroll]'), function(el) {
                    Ps.initialize(el, {
                        wheelSpeed: 2,
                        wheelPropagation: false,
                        minScrollbarLength: 20
                    });
                });
            }, 300);

            $widget.find('.form__textarea_tarea').each(function() {
                autosize(this);
            }).on('autosize:resized', function() {
                [].forEach.call(document.querySelectorAll('[data-custom-scroll]'), function(el) {
                    Ps.update(el);
                });
            });

            $widget.find('.form__textarea_tarea').focus(function() {
                $(this).parents('.pl-container').addClass('touchActionNone');
            }).blur(function() {
                $(this).parents('.pl-container').removeClass('touchActionNone');
            });

            var el = $widget.find('form .form-settings');
            var box = el.closest('[data-form]');
            var boxId = box.data('form');
            var field = '.form__field';
            var field_field = '.form__field_field';
            var tarea = '.form__textarea_tarea';
            var checkbox = '.form__checkbox';
            var checkboxBox = '.form__checkbox_checkbox';
            var checkboxText = '.form__checkbox_label';
            var select = (isInitSelect) ? 'select.form__select' : '';
            var pageStyle = '';
            var form = "[data-form='" + boxId + "'] ";


            var bType = el.data('border-type');
            var bgColor = el.data('bg-color');
            var bColor = el.data('border-color');
            var bWidth = el.data('border-width');
            var plColor = el.data('placeholder-color');

            var fColor = el.data('field-color');

            var wfColor = el.data('color-without-field');
            var wfFSize = el.data('font-size-without-field');

            var tColor = el.data('title-color');
            var ff = el.data('font-family');
            var fsF = el.data('font-size-field');

            var fsT = el.data('font-size-title');
            var fw = el.data('font-weight');
            var ls = el.data('letter-spacing');
            var dBF = el.data('distance-between-fields');
            var dTB = el.data('distance-to-button');

            var btnType = el.data('btn-border-type');
            var btnAlign = el.data('btn-align');
            var btnBg = el.data('btn-bg');
            var btnBgHover = el.data('btn-bg-hover');
            var btnBdColor = el.data('btn-bd-color');
            var btnBdColorHover = el.data('btn-bd-color-hover');
            var btnBdWidth = el.data('btn-bd-width');
            var btnBdWidthHover = el.data('btn-bd-width-hover');
            var btnTextColor = el.data('btn-text-color');
            var btnTextColorHover = el.data('btn-text-color-hover');
            var btnFontFamily = el.data('btn-font-family');
            var btnFontSize = el.data('btn-font-size');
            var btnFontStyle = el.data('btn-font-weight');
            var btnLetterSpacing = el.data('btn-letter-spacing');
            var btnFullwidth = parseInt(el.data('btn-fullwidth'));
            var btnPaddings = el.data('button-paddings');
            var btnPaddingsVertical = el.data('btn-paddings-vertical');
            var fsPlaceholderAction = 8; //min placeholder size
            var defaultFieldHeight = 55;
            var defaultFieldIndent = el.data('distance-between-fields');
            var tareaMaxHeight = defaultFieldHeight * 2 + defaultFieldIndent + 'px';
            var placeholderType = el.data('placeholder-type');
            var popupMaxWidth = el.data('popup-max-width');

            if (fw == 'bold') {
                fw = "font-weight: bold";
            } else if (fw == 'italic') {
                fw = "font-style: italic";
            } else {
                fw = "font-weight: normal";
            }

            //console.log(bType, bgColor, bColor, bWidth, plColor, fColor, tColor, ff, fsF, fsT, fw, ls);


            $widget.find('[data-go-placeholder]').each(function() {
                var el = $(this);
                checkState(el);

                el.on('focus', function() {
                    el.addClass('mod--change')
                });

                el.on('blur', function() {
                    checkState(el);
                });

                function checkState(el) {
                    if (el.val() !== '') {
                        el.addClass('mod--change')
                    } else {
                        el.removeClass('mod--change')
                    }
                }
            });

            var fontField = parseInt(fsF);

            switch (fontField) {

                case 20:
                case 19:
                    console.log(1);
                    fsPlaceholderAction = 14;
                    break;
                case 18:
                case 17:
                    console.log(2);
                    fsPlaceholderAction = 12;
                    break;
                case 16:
                case 15:
                    console.log(3);
                    fsPlaceholderAction = 11;
                    break;
                case 14:
                case 13:
                    console.log(4);
                    fsPlaceholderAction = 9;
                    break;
                default:
                    console.log(6);
                    fsPlaceholderAction = 8;
            }

            //TYPO STYLE (ALL FIELDS, excluding button)
            pageStyle += form + '.form__field-box:not(.stop-form-typo) * {font-family: "' + ff + '";font-size: ' + fsF + ';' + fw + ';letter-spacing: ' + ls + '}';
            pageStyle += form + '.form__field-indent {padding-bottom: ' + dBF + 'px;}';
            pageStyle += form + '.file-uploader {padding-top: ' + dBF + 'px;}';
            pageStyle += form + '.form__fields-row+.form__fields-row:not(.btn_open_popup) .form__btn-box {padding-top: ' + dTB + 'px;}';
            pageStyle += '.element.post-form ' + form + '.form__fields-row:not(.row-no-column):not(.btn_open_popup) {margin-left: -' + dBF / 2 + 'px;margin-right: -' + dBF / 2 + 'px;}';
            pageStyle += '.element.post-form ' + form + '.form__fields-column {padding-left: ' + dBF / 2 + 'px;padding-right: ' + dBF / 2 + 'px;}';

            //FIELD EL COLORS
            pageStyle += form + '.form__field_bg {background-color: ' + bgColor + '}';
            pageStyle += form + '.form__field_bdc {border-color: ' + bColor + '}';
            pageStyle += form + '.form__field_c {color: ' + fColor + '}';

            //NON FIELD COLORS
            pageStyle += form + '.form__text_color {color: ' + wfColor + '}';

            //TITLE SIZE
            pageStyle += form + '.form__title_size {color: ' + fsT + '}';

            //PLACEHOLDER
            pageStyle += form + ".form__placeholder {color: " + tColor + ";}";
            if (placeholderType == 'move') {
                pageStyle += form + ".form__field_field.mod--change ~ .form__placeholder {font-size: " + fsPlaceholderAction + "px;}";
                pageStyle += form + ".selectize-input.dropdown-active .selectize-placeholder {font-size: " + fsPlaceholderAction + "px;}";
                pageStyle += form + ".selectize-input.full .selectize-placeholder {font-size: " + fsPlaceholderAction + "px;}";
                pageStyle += form + ".form__textarea_tarea.mod--change ~ * .form__placeholder  {font-size: " + fsPlaceholderAction + "px;}";
            }

            pageStyle += form + field + "::-moz-placeholder {color: " + tColor + "; opacity: 1;} [data-form='" + boxId + "'] " + field + ":-ms-input-placeholder {color: " + tColor + ";} [data-form='" + boxId + "'] " + field + "::-webkit-input-placeholder {color: " + tColor + ";}";
            pageStyle += form + tarea + "::-moz-placeholder {color: " + tColor + "; opacity: 1;} [data-form='" + boxId + "'] " + tarea + ":-ms-input-placeholder {color: " + tColor + ";} [data-form='" + boxId + "'] " + tarea + "::-webkit-input-placeholder {color: " + tColor + ";}";
            pageStyle += form + " .selectize-placeholder {color: " + tColor + "}";

            //FILE
            pageStyle += form + '.file-uploader_cont .form__field_bdc {border-color: ' + bColor + '}';
            pageStyle += form + '.file-uploader_cont .form__field_c {color: ' + wfColor + '}';
            // pageStyle += form + '.file-drop-zone-title.form__field_fs {font-size: '+ wfFSize +';}';
            pageStyle += form + '.form__field_file.form__field_ff {font-family: "' + ff + '";}';
            pageStyle += form + '.form__field_file.form__field_fw {' + fw + ';}';

            //SELECT
            pageStyle += form + " .selectize-input:after {border-top-color: " + tColor + "!important} ";
            pageStyle += form + " .selectize-input.dropdown-active:after {border-bottom-color: " + tColor + "!important} ";
            pageStyle += form + " .selectize-input.full:after {border-top-color: " + fColor + "!important} ";
            pageStyle += form + " .selectize-input.full.dropdown-active:after {border-bottom-color: " + fColor + "!important} ";
            pageStyle += form + " .selectize-dropdown .option:before {border-color: " + tColor + "} ";
            pageStyle += form + " .ps-scrollbar-y {background-color: " + fColor + "} ";

            //CHECKBOX
            pageStyle += form + " .form__checkbox_checkbox:after {border-color: " + fColor + "}";
            pageStyle += form + " .form__checkbox_text {color: " + wfColor + ";}";

            if (btnFontStyle == 'bold') {
                btnFontStyle = "font-weight: bold";
            } else if (btnFontStyle == 'italic') {
                btnFontStyle = "font-style: italic";
            } else {
                btnFontStyle = "font-weight: normal";
            }

            //BTN
            pageStyle += form + " .form__btn-box {text-align: " + btnAlign + "}";
            pageStyle += form + " .form__btn {color: " + btnTextColor + "; font-family: " + btnFontFamily + "; font-size: " + btnFontSize + "; " + btnFontStyle + "; letter-spacing: " + btnLetterSpacing + "; padding-top: " + btnPaddingsVertical + "px; padding-bottom: " + btnPaddingsVertical + "px; }";
            pageStyle += form + " .form__btn:hover{color: " + btnTextColorHover + ";}";
            pageStyle += form + " .form__btn:after {background-color: " + btnBg + ";border: " + btnBdWidth + "px solid " + btnBdColor + ";}";
            pageStyle += form + " .form__btn:hover:after {background-color: " + btnBgHover + ";border: " + btnBdWidthHover + "px solid " + btnBdColorHover + ";}";
            pageStyle += form + " .form__btn-box .form__btn span.progress-content {padding-left: " + btnLetterSpacing + " !important}";

            if (btnFullwidth) {
                pageStyle += form + " .form__btn { width: 100%; }";
            }

            //TITLE SIZE
            pageStyle += form + '.form__title_size {font-size: ' + fsT + '}';
            pageStyle += form + '.form__title_font {font-family: "' + ff + '"}';

            //SCROLL
            pageStyle += form + '.form__field_scroll {background-color: ' + fColor + '}';

            //TEXTAREA
            pageStyle += form + " .form__textarea {min-height: " + tareaMaxHeight + "; height: " + tareaMaxHeight + "}";
            pageStyle += form + " .form__field-box_textarea {min-height: " + tareaMaxHeight + "; } ";

            if (box.data('popup') == 1) {
                //POPUP
                var defPopupMaxWidth = (!popupMaxWidth) ? 600 : popupMaxWidth;
                pageStyle += ".popup-form-" + boxId + " {max-width: " + defPopupMaxWidth + "px;}";
            }

            $("<style>" + pageStyle + "</style>").prependTo(box);

            function _updateButtonPadding() {
                var el = self.$el.find('form .form-settings');
                var box = el.closest('[data-form]');
                var boxId = box.data('form');
                var form = "[data-form='" + boxId + "'] ";

                var btn = ($(form).parents('.popup-form-' + boxId).size()) ? $(form + '.form__btn-box .form__btn').last() : $(form + '.form__btn-box .form__btn');

                setTimeout(function() {
                    btn.removeClass('forcePadding');
                    var parentBox = ($(btn).parents('.popup-form-' + boxId).size()) ? btn.parents('.form__btn-box').last().outerWidth() : $(form + '.form__btn-box').outerWidth();
                    if (btn.outerWidth() >= parentBox) {
                        btn.addClass('forcePadding');
                    }
                }, 10)
            }

            if (!btnFullwidth) {
                self.$el.find('.form__btn-box .form__btn').css({
                    paddingLeft: btnPaddings,
                    paddingRight: btnPaddings
                });
                _updateButtonPadding();
                $(window).resize(function() {
                    _updateButtonPadding();
                });
            }


            if ($(box).find('.file-loading').size() > 0) {
                var messages = JSON.parse($('#post-form-error-messages').text());
                $(box).find(".file-loading").fileinput({
                        language: "ru",
                        uploadUrl: '#',
                        maxFileSize: 10240,
                        browseOnZoneClick: true,
                        //showBrowse: false,
                        showCaption: false,
                        showUpload: false,
                        showRemove: false,
                        layoutTemplates: {
                            actions: '<div class="file-actions">\n' +
                                '    <div class="file-footer-buttons">\n' +
                                '         {delete}' +
                                '    </div>\n' +
                                '    {drag}\n' +
                                '    <div class="clearfix"></div>\n' +
                                '</div>',
                            preview: '<div class="file-preview form__text_color {class}">\n' +
                                '    <div class="file-uploader_icon "></div>\n' +
                                '    <div class="file-drop-zone form__field-box form__field_bdc form__field_c clickable mh55" data-border-width="' + bWidth + '" data-border-type="' + bType + '">\n' +
                                '    <div class="file-preview-thumbnails">\n' +
                                '    </div>\n' +
                                '    <div class="clearfix"></div>' +
                                '    <div class="file-preview-status text-center text-success"></div>\n' +
                                '    <div class="kv-fileinput-error"></div>\n' +
                                '    </div>\n' +
                                '</div>',
                        },
                        previewClass: 'file-uploader_cont',
                        dropZoneTitle: '<span class="file-drop-zone-title--fix">' + $(box).find('.file-loading').data('name') + '</span>',
                        dropZoneTitleClass: 'file-drop-zone-title form__field_fs',
                        dropZoneClickTitle: '',
                        fileActionSettings: {
                            removeIcon: '<i>x</i>'
                        },
                        msgInvalidFileExtension: messages.msgInvalidFileExtension,
                        allowedFileExtensions: ["jpg", "jpeg", "png", "gif", "pdf", "doc", "xls", "docx", "xlsx", "txt"],
                        msgSizeTooLarge: messages.msgSizeTooLarge

                    })
                    .on('fileloaded', function(event, file, previewId, index, reader) {
                        $widget.find('.file-drop-zone').removeClass('mh55');
                        var maxFileSize = 10485760;
                        var fileStack = $(this).fileinput('getFileStack');
                        $widget.find('.hidepreview').remove();
                        if (maxFileSize > (self.fileSize + file.size)) {
                            self.fileSize += file.size;
                            self.files[previewId] = file;
                        } else {
                            $widget.find('.file-preview-frame[id="' + previewId + '"]:last').addClass('hidepreview').hide();
                            $widget.find('.file-error-message').text(messages.msgSumSizeTooLarge).show();
                        }
                    })
                    .on('filepreremove', function(event, previewId) {
                        self.fileSize -= self.files[previewId].size;
                        delete self.files[previewId];
                        if ($('.file-live-thumbs>div').size() == 1) {
                            $widget.find('.file-drop-zone').addClass('mh55');
                        }
                    })
            }

            box.find($(field)).each(function() {
                var el = $(this);

                var bWidthTmp = bWidth;
                var bTypeTmp = bType;

                if (el.is('.form__field_file')) {
                    /* fix for type file */
                    if (bWidthTmp == 0) {
                        bWidthTmp = 1;
                    }
                }

                el.attr('data-border-type', bTypeTmp).attr('data-border-width', bWidthTmp);
                el.addClass('form__field_bg form__field_bdc form__field_c form__field_ff form__field_fs form__field_fw form__field_ls');
            });

            box.find($(field_field)).each(function() {
                var el = $(this);
                el.addClass('form__field_c form__field_ff form__field_fs form__field_fw form__field_ls');
            });

            box.find($(checkbox)).each(function() {
                var el = $(this);
                var elT = el.closest(checkboxText);
                var elB = elT.find(checkboxBox);


                elB.attr('data-border-type', bType).attr('data-border-width', bWidth);
                elB.addClass('form__field_bg form__field_bdc');
                elT.addClass('form__text_color form__field_fs');
            });

            box.find($(select)).each(function() {
                var el = $(this);
                var elF = el.find('~ * .selectize-input');
                var elList = el.find('~ * .selectize-dropdown');
                var placeholder = el.attr('placeholder');


                if (placeholder !== '') {
                    elF.prepend('<div class="selectize-placeholder form__placeholder">' + placeholder + '</div>');
                }

                elF.attr('data-border-type', bType).attr('data-border-width', bWidth);
                elF.addClass('form__field_bg form__field_bdc form__field_c');

                elList.attr('data-border-type', bType).attr('data-border-width', bWidth);
                elList.addClass('form__field_bg form__field_bdc form__field_c');
                // elList.find('.ps-scrollbar-y-rail > .ps-scrollbar-y').addClass('form__field_scroll');
            });

            box.find('.form__btn').each(function() {
                var el = $(this);

                el.attr('data-border-type', btnType).attr('data-button-paddings', btnPaddings);
                el.find('.progress-inner').addClass('form__field_bg');
            });

            // validation
            $widget.find('.form__field-box .form__field, .form__field-box .form__select, .form__field-box .form__checkbox').on('focus click', function() {
                $(this).closest('.form__field-box').removeClass('state-error');
            });

            var tokens = [];
            try {
                tokens = JSON.parse($('#post-tokens').text());
            } catch (e) {}
            //var tokens = JSON.parse($('#post-tokens').text());
            var token = tokens[boxId];
            if (!$('#input-token-' + boxId).size()) {
                $widget.find('form').append('<input type="hidden" id="input-token-' + boxId + '" name="token" value="' + token + '">')
            }

            $('.form__textarea_tarea').each(function() {
                autosize.update(this);
            });

            $widget.find('.post-form-content').addClass('state-init').removeClass('hided');
        },
    });

    return View;
});