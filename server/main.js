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
	
	socket.on('user_starts', function(){
		socket.emit("slot_config", {
			column_1 : [0,1,2,3,4,5,6],
			column_2 : [0,1,5,6,2,3,4],
			column_3 : [6,1,5,3,2,0,4]
		});
	});
	
	socket.on('user_plays', function(message){
		
		socket.emit("confirm_play", { 
			play: {
				column_1 : "id_slot_" + Math.floor(Math.random() * 10),
				column_2 : "id_slot_" + Math.floor(Math.random() * 10),
				column_3 : "id_slot_" + Math.floor(Math.random() * 10)
			}
		});
	});
});

HTTP.listen(process.env.PORT || 3000, function(){
	console.log('listening on *:3000');
});