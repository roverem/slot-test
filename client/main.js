var socket = io();

const app = new PIXI.Application({ 
	width: 256,         
	height: 256,        
	antialias: true,    
	transparent: false, 
	resolution: 1,    
	backgroundColor: 0x061639
});

let type = "WebGL"
if(!PIXI.utils.isWebGLSupported()){
  type = "canvas"
}

PIXI.utils.sayHello(type);

app.renderer.autoDensity = true;
app.renderer.resize(512, 512);

app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.resize(window.innerWidth, window.innerHeight);

var spritesheet;
const asset_structure = {};


window.onload = function() {
	
	//Add the canvas that Pixi automatically created for you to the HTML document
	document.body.appendChild(app.view);
	
	PIXI.Loader.shared
		.add("assets/slot_holder_empty.png")
		.add("assets/spritesheet.json")
		.load(setup)
		
	socket.emit("message", "123456");
	
	socket.on("confirm_play", confirm_play);
}

function confirm_play(message){
	console.log(message);
	//animate handler
}

function setup(){
	
	socket.emit("starts_setup");
	
	spritesheet = PIXI.Loader.shared.resources["assets/spritesheet.json"].spritesheet;
	
	let slot_holder = new PIXI.Sprite(spritesheet.textures["slot_holder_empty.png"])
	slot_holder.scale.x = 3;
	slot_holder.scale.y = 3;
	slot_holder.y = 200;
	slot_holder.x = slot_holder.width;
	
	asset_structure.slot_holder = slot_holder;
	
	let handler = new PIXI.Sprite(spritesheet.textures["handle.png"]);
	handler.x = slot_holder.x;
	handler.y = slot_holder.y;
	handler.scale.x = 3;
	handler.scale.y = 3;
	
	asset_structure.handler = handler;
	
	handler.interactive = true;
	handler.buttonMode = true;
	handler.addListener('pointerdown', ()=>{
		socket.emit("user_plays", true);
	});
	
	for (let i=0; i < 6; i++)
	{
		/*
		let item = new PIXI.Sprite(food_spritesheet["Food-" + i + ".png"])
		item.x = 84;
		item.y = i * -16 * 6
		item.scale.x = 6;
		item.scale.y = 6;
		items.push(item);
		app.stage.addChild(item);
		
		console.log(item);*/
	}
	
	app.stage.addChild(slot_holder);
	app.stage.addChild(handler);
	
	app.ticker.add(delta => update(delta));
}


function update(delta){
	/*for (let i= 0; i < items.length;i++){
		items[i].y++;
	}*/
}