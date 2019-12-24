var socket = io('http://localhost:3000/');

var socketManager = {
    retrieveLocalIP: function() {
        socket.emit('local-ip-app', "[INFO] - Requested Local IP");
    },
    retrieveConnectionInfo: function() {
        socket.emit('retrieve-connection-info-app', "[INFO] - Requested Connection");
    }
}

socket.on('notification-sm', function(data) {
    var notificationLength = $('.notification').length;

    if(data.application == 'incallui') {
        $('.calling-title').text(data.title);
        $('.calling-text').text(data.text);

        $('.left-body').addClass('hidden');
        $('.right-body').addClass('hidden');
        $('html').addClass('height-100');
        $('body').addClass('height-100-body');
        $('.container').addClass('height-100 flex center-center');
        $('.now-calling').removeClass('hidden');
        $('.calling-icon').addClass('blink');
    } else if(data.application == 'spotify') {
        $('.spotify-soundtrack').text(data.title);
        $('.spotify-author').text(data.text);

        if($('.spotify').hasClass("hidden")) {
            $('.spotify').removeClass("hidden");
        }
    } else {
        if(notificationLength > 12) {
            $('.notification').first().remove();
        }

        $('.notification-zone').append('<div class="notification notification-blink flex align-center bg-' + data.application + '" data-application="' + data.application + '">' +
            '<img class="notification-icon" src="' + icons[data.application] + '">' +
            '<div class="notification-info">' +
                '<p class="notification-title m0 text-bold">' + data.title + '</p>' +
                '<p class="notification-text m0">' + data.text + '</p>' +
            '</div>' +
        '</div>');

        scrollToBottom('.notification-zone');
    }
});

socket.on('remove-notification-sm', function(data) {
    if(data.application == 'incallui') {
        $('.now-calling').addClass('hidden');
        $('.calling-icon').removeClass('blink');
        $('html').removeClass('height-100');
        $('body').removeClass('height-100-body');
        $('.container').removeClass('height-100 flex center-center');
        $('.left-body').removeClass('hidden');
        $('.right-body').removeClass('hidden');
    } else if(data.application == 'spotify') {
        $('.spotify').addClass('hidden');
    } else {
        $('.notification').each(function() {
            if($(this).data('application') == data.application) {
                $(this).remove();
            }
        });
    }
});

socket.on('connected-sm', function(data) {
    $('.connection-info').text('Connected');
});

socket.on('disconnected-sm', function(data) {
    $('.connection-info').text('Disconnected');
    $('.device-info').addClass('hidden');
    $('.spotify').addClass('hidden');
});

socket.on('local-ip-sm', function(data) {
    $('.ip-info').text(data);
    $('.general-info').removeClass('hidden');
});

socket.on('retrieve-connection-info-sm', function(data) {
    $('.connection-info').text(data.connected ? 'Connected' : 'Disconnected');
    if(data.device) {
        $('.device-info').text(data.device);
        $('.device-info').removeClass('hidden');
    }
});

socket.on('device-model-sm', function(data) {
    $('.device-info').text(data);
    $('.device-info').removeClass('hidden');
});

socket.on('enable-mouse-pointer-sm', function(data) {
    $('html').removeClass('cursor-none');
});

socket.on('disable-mouse-pointer-sm', function(data) {
    $('html').addClass('cursor-none');
});

socket.on('clear-notifications-sm', function(){
    $('.notification-zone').html('');
});

socket.on('load-news-sm', function(data) {
    clearTimeout(newsTimeout);

    startNews(data);
});

socket.on('load-weather-sm', function(data) {
    clearTimeout(weatherTimeout);

    startWeather(data, '6e9a7d3a8d9e481bbdd14b1df103142c');
});

socket.on('error-msg', function(data) {
    console.log(data);
});