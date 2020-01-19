var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var appExpress = express();
var server = require('http').createServer(appExpress);
var io = require('socket.io')(server);
var os = require('os');
var ifaces = os.networkInterfaces();
let Parser = require('rss-parser');
let parser = new Parser();
const { app, BrowserWindow } = require('electron')

var connectionInfo = {
    connected: false,
    device: ''
}

var messages = [];

var filters = ['spotify', 'telecom', 'incallui', 'mms'];

let win;

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

appExpress.use(express.static(path.join(__dirname)));
appExpress.use("/", express.static(__dirname + '/www'));
appExpress.use(bodyParser.json());
appExpress.use(bodyParser.urlencoded({ extended: false }));

appExpress.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/www/index.html'));
});

appExpress.get('/getAllMessages', function (req, res) {
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
        client.broadcast.emit('save-news-sm', data);
        client.emit('save-news-sm', data);
        parser.parseURL(data, function(err, feed) {
            if(err) throw err;
            client.broadcast.emit('load-news-sm', feed);
            client.emit('load-news-sm', feed);
            client.emit('load-news-server', '[SERVER] - News loaded!');
        }); 
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
        client.emit('retrieve-connection-info-sm', connectionInfo);
    });
});

function createWindow () {
    // Creazione della finestra del browser.
    win = new BrowserWindow({
      width: 1024,
      height: 768,
      webPreferences: {
        nodeIntegration: true,
        fullscreen: true
      }
    })
  
    // e carica l'index.html dell'app.
    win.loadFile('www/index.html')
  
    // Apre il Pannello degli Strumenti di Sviluppo.
    win.webContents.openDevTools()
  
    // Emesso quando la finestra viene chiusa.
    win.on('closed', () => {
      // Eliminiamo il riferimento dell'oggetto window;  solitamente si tiene traccia delle finestre
      // in array se l'applicazione supporta più finestre, questo è il momento in cui 
      // si dovrebbe eliminare l'elemento corrispondente.
      win = null
    })
  }
  
// Questo metodo viene chiamato quando Electron ha finito
// l'inizializzazione ed è pronto a creare le finestre browser.
// Alcune API possono essere utilizzate solo dopo che si verifica questo evento.
app.on('ready', createWindow)

// Terminiamo l'App quando tutte le finestre vengono chiuse.
app.on('window-all-closed', () => {
    // Su macOS è comune che l'applicazione e la barra menù 
    // restano attive finché l'utente non esce espressamente tramite i tasti Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // Su macOS è comune ri-creare la finestra dell'app quando
    // viene cliccata l'icona sul dock e non ci sono altre finestre aperte.
    if (win === null) {
        createWindow()
    }
})

server.listen(3000);