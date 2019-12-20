var playerUsername = '';
var roomNumber = '';
var roomMaster = false;

var socket = io('http://localhost:3000/');

var socketManager = {

}

socket.on('notification-receive', function(data) {
    console.log(data);

    var notificationLength = $('.notification').length;

    if(data.application == 'spotify') {
        $('.spotify-song-info').html('<p class="m0 text-bold">' + data.title + '</p>' +
        '<p class="m0">' + data.text + '</p>');
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

socket.on('error-msg', function(data) {
    console.log(data);
});