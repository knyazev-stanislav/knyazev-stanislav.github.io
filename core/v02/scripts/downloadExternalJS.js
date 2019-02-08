function downloadExternalJS(url, $element, onDone) {

    $.getScript(url, function(data, textStatus) {

        if (textStatus == 'success') {

            $element.trigger('JSloaded');

            if (onDone !== undefined && typeof(onDone) == 'function') {
                onDone();
            }
        }
    });
}