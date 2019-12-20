var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var messages = [];

function checkCloneMessages(msgObj) {
    for(var i = 0; i < messages.length; i++) {
        if(msgObj.package != 'spotify' && messages[i].text == msgObj.text && messages[i].title == msgObj.title && messages[i].package == msgObj.package) {
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

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/www/index.html'));
});

app.get('/getAllMessages', function(req, res) {
    res.send(messages);
});

io.on('connection', function(client) {
    client.on('notification', function(data) {
        if(messages.length > 12) {
            clearAllMessage();
        }

        if(!checkCloneMessages(data)) {
            messages.push(data);
            client.broadcast.emit('notification-receive', data);
            client.emit('notification-handshake', "[SERVER] - Notification received");
        }
    });
});

server.listen(3000);