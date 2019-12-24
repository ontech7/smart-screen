var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var os = require('os');
var ifaces = os.networkInterfaces();

var connectionInfo = {
    connected: false,
    device: ''
}

var messages = [];

var filters = ['spotify', 'telecom', 'incallui', 'mms'];

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

        if (!checkCloneMessages(data) || filters.includes(data.application)) {
            messages.push(data);
            client.broadcast.emit('notification-sm', data);
            client.emit('notification-server', "[SERVER] - Notification received");
        }
    });

    client.on('remove-notification-app', function(data) {
        console.log('[INFO] - Notification to be removed: ' + data.application);

        messages = [];
        client.broadcast.emit('remove-notification-sm', data);
        client.emit('notification-server', "[SERVER] - Notification received");
    });

    client.on('clear-notifications-app', function (data) {
        console.log(data);
        client.broadcast.emit('clear-notifications-sm', "[SERVER] - Clear Notifications");
    });

    client.on('connected-app', function (data) {
        console.log(data);
        connectionInfo.connected = true;
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
        connectionInfo.connected = true;
        connectionInfo.device = data;
        client.broadcast.emit('device-model-sm', data);
        client.emit('device-model-server', '[SERVER] - Device Model received');
    });

    client.on('disconnected-app', function (data) {
        connectionInfo.connected = false;
        connectionInfo.device = '';
        client.broadcast.emit('disconnected-sm', '[SERVER] - Disconnected!');
        client.emit('disconnected-server', '[SERVER] - Disconnected!');
    });

    client.on('enable-mouse-pointer-app', function(data) {
        console.log('[INFO] - Enabling Mouse Pointer');
        client.broadcast.emit('enable-mouse-pointer-sm', '[SERVER] - Enabling Mouse Pointer!');
        client.emit('enable-mouse-pointer-server', '[SERVER] - Enabling Mouse Pointer!');
    });

    client.on('disable-mouse-pointer-app', function(data) {
        console.log('[INFO] - Disabling Mouse Pointer');
        client.broadcast.emit('disable-mouse-pointer-sm', '[SERVER] - Disabling Mouse Pointer!');
        client.emit('disable-mouse-pointer-server', '[SERVER] - Disabling Mouse Pointer!');
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

    client.on('retrieve-connection-info-app', function(data) {
        console.log('[INFO] - Retrieving Connection Info');
        console.log(connectionInfo);
        client.emit('retrieve-connection-info-sm', connectionInfo);
    });
});

server.listen(3000);