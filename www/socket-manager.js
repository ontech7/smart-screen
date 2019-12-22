var playerUsername = '';
var roomNumber = '';
var roomMaster = false;

var socket = io('http://localhost:3000/');

var socketManager = {

}

socket.on('notification-sm', function(data) {
    console.log(data);

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

        $('.notification-zone').append('<div class="notification flex align-center bg-' + data.application + '">' +
            '<img class="notification-icon" src="' + icons[data.application] + '">' +
            '<div class="notification-info">' +
                '<p class="notification-title m0 text-bold">' + data.title + '</p>' +
                '<p class="notification-text m0">' + data.text + '</p>' +
            '</div>' +
        '</div>');
    }
});

socket.on('connected-sm', function(data) {
    
});

socket.on('disconnected-sm', function(data) {
    $('.spotify').addClass('hidden');
});

socket.on('clear-notifications-sm', function(){
    $('.notification-zone').html('');
});

socket.on('load-news-sm', function(data) {
    startNews(data);
});

socket.on('load-weather-sm', function(data) {
    startWeather(data);
});

socket.on('error-msg', function(data) {
    console.log(data);
});