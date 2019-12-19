var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var app = express();

var messages = [];

function checkCloneMessages(msgObj) {
    for(var i = 0; i < messages.length; i++) {
        if(messages[i].text == msgObj.text && messages[i].title == msgObj.title && messages[i].package == msgObj.package) {
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

app.get('/receivePost', function(req, res) {
    res.send(messages);
});

app.post('/receivePost', function(req, res) {
    if(messages.length > 50) {
        clearAllMessage();
    }
    
    if(!checkCloneMessages(req.body)) {
        messages.push(req.body);
    }
});

app.listen(3000);