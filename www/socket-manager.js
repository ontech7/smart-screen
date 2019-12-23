var socket = io('http://localhost:3000/');

var socketManager = {
    retrieveLocalIP: function() {
        socket.emit('local-ip-app', "[INFO] - Requested Local IP");
    }
}

socket.on('notification-sm', function(data) {
    var notificationLength = $('.notification').length;

    if(data.application == 'spotify') {
        $('.spotify-song-info').html('<p class="m0 text-bold">' + data.title + '</p>' +
        '<p class="m0">' + data.text + '</p>');

        if($('.spotify').hasClass("hidden")) {
            $('.spotify').removeClass("hidden");
        }
    } else {
        if(notificationLength >= 6) {
            $('.notification').first().remove();
        }

        $('.notification-zone').append('<div class="notification flex align-center bg-' + data.application + '" data-application="' + data.application + '">' +
            '<img class="notification-icon" src="' + icons[data.application] + '">' +
            '<div class="notification-info">' +
                '<p class="notification-title m0 text-bold">' + data.title + '</p>' +
                '<p class="notification-text m0">' + data.text + '</p>' +
            '</div>' +
        '</div>');
    }
});

socket.on('remove-notification-sm', function(data) {
    if(data.application == 'spotify') {
        $('.spotify').addClass('hidden');
    } else {
        $('.notification').each(function() {
            console.log($(this).data('application'));
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

socket.on('device-model-sm', function(data) {
    $('.device-info').text(data);
    $('.device-info').removeClass('hidden');
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

    startWeather(data);
});

socket.on('error-msg', function(data) {
    console.log(data);
});