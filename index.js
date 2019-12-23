var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var os = require('os');
var ifaces = os.networkInterfaces();

var messages = [];

function checkCloneMessages(msgObj) {
    for (var i = 0; i < messages.length; i++) {
        if (msgObj.package != 'spotify' && messages[i].text == msgObj.text && messages[i].title == msgObj.title && messages[i].package == msgObj.package) {
            return true;
        }
    }
    return false;
}

function clearAllMessage() {
    messages = [];
}

app.use(express.static(path.join(__dirname)));
app.use("/", express.static(__dirname + '/www'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/www/index.html'));
});

app.get('/getAllMessages', function (req, res) {
    res.send(messages);
});

io.on('connection', function (client) {
    client.on('disconnect', function(data) {
        // In case connection drop, closure of the app, etc.
        client.broadcast.emit('disconnected-sm', '[SERVER] - Disconnected!');
        client.emit('disconnected-server', '[SERVER] - Disconnected!');
    });

    client.on('notification-app', function (data) {
        console.log('[INFO] - Notification received from: ' + data.application);

        if (messages.length > 12) {
            clearAllMessage();
        }

        if (!checkCloneMessages(data) || data.application == 'spotify') {
            messages.push(data);
            client.broadcast.emit('notification-sm', data);
            client.emit('notification-server', "[SERVER] - Notification received");
        }
    });

    client.on('clear-notifications-app', function (data) {
        console.log(data);
        client.broadcast.emit('clear-notifications-sm', "[SERVER] - Clear Notifications");
    });

    client.on('connected-app', function (data) {
        console.log(data);
        client.broadcast.emit('connected-sm', '[SERVER] - Connected!');
        client.emit('connected-server', '[SERVER] - Connected!');
    });

    client.on('load-news-app', function (data) {
        client.broadcast.emit('load-news-sm', data);
        client.emit('load-news-server', '[SERVER] - News loaded!');
    });

    client.on('load-weather-app', function (data) {
        client.broadcast.emit('load-weather-sm', data);
        client.emit('load-weather-server', '[SERVER] - Weather loaded!');
    });

    client.on('device-model-app', function(data) {
        client.broadcast.emit('device-model-sm', data);
        client.emit('device-model-server', '[SERVER] - Device Model received');
    });

    client.on('disconnected-app', function (data) {
        console.log(data);
        client.broadcast.emit('disconnected-sm', '[SERVER] - Disconnected!');
        client.emit('disconnected-server', '[SERVER] - Disconnected!');
    });

    client.on('local-ip-app', function(data) {
        console.log('[INFO] - Retrieving Local IP');
        Object.keys(ifaces).forEach(function (ifname) {    
            ifaces[ifname].forEach(function (iface) {
                if ('IPv4' !== iface.family || iface.internal !== false) {
                    // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                    return;
                }
                
                client.emit('local-ip-sm', iface.address);
            });
        });
    });
});

server.listen(3000);