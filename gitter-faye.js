var Faye = require('faye');
var https = require('https');

// To bind a port on heroku 
https.createServer(function (request, response) {
  console.log("listening on port "+(process.env.PORT || 5000));
}).listen(process.env.PORT || 5000);

var token   = "db187b9812d0c977966a0919e90ce3d3724f532e";
var roomId  = "59a695bcd73408ce4f739399";

// Authentication extension

var ClientAuthExt = function() {};

ClientAuthExt.prototype.outgoing = function(message, callback) {
  if (message.channel == '/meta/handshake') {
    if (!message.ext) { message.ext = {}; }
    message.ext.token = token;
  }

  callback(message);
};

ClientAuthExt.prototype.incoming = function(message, callback) {
  if(message.channel == '/meta/handshake') {
    if(message.successful) {
      console.log('Successfuly subscribed to room: ', roomId);
    } else {
      console.log('Something went wrong: ', message.error);
    }
  }

  callback(message);
};

// Snapshot extension

var SnapshotExt = function() {};

ClientAuthExt.prototype.incoming = function(message, callback) {
  if(message.channel == '/meta/subscribe' && message.ext && message.ext.snapshot) { 
    console.log('Snapshot: ', message.ext.snapshot);
  }

  callback(message);
};



// Faye client

var client = new Faye.Client('https://ws.gitter.im/faye', {timeout: 60, retry: 5, interval: 1});

// Add Client Authentication extension
client.addExtension(new ClientAuthExt());

// Add Resource Snapshot extension
//client.addExtension(new SnapshotExt());

// A dummy handler to echo incoming messages
var messageHandler = function(msg) {
  console.log(msg);
};


client.subscribe('/api/v1/user/59a695bcd73408ce4f739399', messageHandler, {});
