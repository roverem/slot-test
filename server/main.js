import express from 'express';
import http from 'http';
import io from 'socket.io';


const APP = express();
const HTTP = http.createServer(APP);
const IO = io(HTTP);

const columns = {
	/*column_1 : [0,1,2,3,4,5,6],
	column_2 : [0,1,5,6,2,3,4],
	column_3 : [6,1,5,3,2,0,4]*/
	
	column_1 : [0,1,2,3],
	column_2 : [3,2,1,0],
	column_3 : [1,3,2,0]
}

APP.use('/', express.static("../client/"));

IO.on('connection', function(socket){
	console.log("user connected");
	
	socket.on('disconnect', function(){
		console.log("user disconnected");
	});
	
	socket.on('user_starts', function(){
		socket.emit("slot_config", columns);
	});
	
	socket.on('user_plays', function(message){
		let r1 = Math.floor(Math.random() * columns.column_1.length);
		let r2 = Math.floor(Math.random() * columns.column_2.length)
		let r3 = Math.floor(Math.random() * columns.column_3.length);
		let c1 = "id_slot_" + r1;
		let c2 = "id_slot_" + r2;
		let c3 = "id_slot_" + r3;
		
		let result = "wins";
		console.log(columns.column_1[r1]);
		console.log(columns.column_2[r2]);
		console.log(columns.column_3[r3]);
		
		if (columns.column_1[r1] != columns.column_2[r2]){
			result = "loses";
		}
		
		if (columns.column_1[r1] != columns.column_3[r3]){
			result = "loses";
		}
		
		//let result = columns.column_1[r1] == columns.column_2[r2] == columns.column_3[r3] ? "wins" : "loses";
		
		socket.emit("confirm_play", { 
			play: {
				column_1 : c1,
				column_2 : c2,
				column_3 : c3
			},
			result: result
		});
		
		console.log(c1);
		console.log(c2);
		console.log(c3);
		console.log(result);
	});
});

HTTP.listen(process.env.PORT || 3000, function(){
	console.log('listening on *:3000');
});