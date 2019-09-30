import express from 'express';
import http from 'http';
import io from 'socket.io';


const APP = express();
const HTTP = http.createServer(APP);
const IO = io(HTTP);


APP.use('/', express.static("../client/"));

IO.on('connection', function(socket){
	console.log("user connected");
	
	socket.on('disconnect', function(){
		console.log("user disconnected");
	});
	
	socket.on('message', function(message){
		console.log(message);
	});
});

HTTP.listen(3000, function(){
	console.log('listening on *:3000');
});