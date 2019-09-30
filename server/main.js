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
	
	socket.on('user_plays', function(message){
		
		
		
		socket.emit("confirm_play", { 
			play: {
				column_1 : "1,2,3,1,2,3,1,2,3",
				column_2 : "2,2,3,1,2,1,1,3",
				column_2 : "2,1,3,1,2,1,1,3,1,1,3,1"
			}
		});
	});
});

HTTP.listen(process.env.PORT || 3000, function(){
	console.log('listening on *:3000');
});