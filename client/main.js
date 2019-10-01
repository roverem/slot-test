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
var char_spritesheet;
var enemy_spritesheet;

const asset_structure = {};
const game_state = {
	handler_playing: false,
	slot_playing: false,
	slot_config: null
}


window.onload = function() {
	
	document.body.appendChild(app.view);
	
	PIXI.Loader.shared
		.add("assets/slot_holder_empty.png")
		.add("assets/spritesheet.json")
		.add("assets/character.json")
		.add("assets/enemy.json")
		.load(setup)
	
	//events
	socket.on("confirm_play", confirm_play);
	socket.on("slot_config", save_config)
}

function save_config(config){
	game_state.slot_config = config;
	build_slots();
}

function confirm_play(message){
	console.log(message);
	
	game_state.handler_playing = true
	game_state.slot_playing = true
	for (let i= 0; i < asset_structure.columns.length;i++){
		asset_structure.columns[i].is_spinning = true;
	}
	
	game_state.column_result = message.play;
	
	game_state.play_result = message.result;
	console.log(game_state.play_result);
}

function reset_game_state(){
	
	
	
	game_state.handler_playing = false;
	game_state.slot_playing = false;
}

function setup(){
	
	socket.emit("user_starts")
	
	spritesheet = PIXI.Loader.shared.resources["assets/spritesheet.json"].spritesheet;
	//char_spritesheet = PIXI.Loader.shared.resources["assets/character.json"].spritesheet;
	enemy_spritesheet = PIXI.Loader.shared.resources["assets/enemy.json"].spritesheet;
	
	//PLAYER AVATAR.
	
	let character_frames = ["tile003.png", "tile004.png","tile005.png"];
	let char_texture_array = [];
	for (let i=0; i < character_frames.length; i++){
		char_texture_array.push( PIXI.Texture.from(character_frames[i]) );
	}
	let character = new PIXI.AnimatedSprite(char_texture_array)
	character.animationSpeed = 0.1;
	//character.play();
	character.scale.x = -2;
	character.scale.y = 2;
	character.x = 350;
	character.y = 420;
	app.stage.addChild(character);
	
	//ENEMY
	
	enemy_sprite = new PIXI.AnimatedSprite(enemy_spritesheet.animations["skeleton_tile"]);
	enemy_sprite.x = 550;
	enemy_sprite.y = 410;
	enemy_sprite.animationSpeed = 0.1;
	enemy_sprite.scale.x = -6;
	enemy_sprite.scale.y = 6;
	enemy_sprite.play();
	app.stage.addChild(enemy_sprite);
	
	//SLOTS HOLDER
	
	let slot_holder = new PIXI.Sprite(spritesheet.textures["slot_holder_empty.png"])
	slot_holder.scale.x = 3;
	slot_holder.scale.y = 3;
	slot_holder.y = 200;
	slot_holder.x = slot_holder.width;
	
	asset_structure.slot_holder = slot_holder;
	
	//HANDLER - PALANCA
	
	let handler = new PIXI.Sprite(spritesheet.textures["handle.png"]);
	handler.x = slot_holder.x;
	handler.y = slot_holder.y;
	handler.scale.x = 3;
	handler.scale.y = 3;
	handler.original_height = handler.height;
	
	asset_structure.handler = handler;
	
	handler.interactive = true;
	handler.buttonMode = true;
	handler.addListener('pointerdown', ()=>{
		if (!game_state.slot_playing){
			socket.emit("user_plays");
		}
	});
	
	app.stage.addChild(slot_holder);
	app.stage.addChild(handler);
	
	app.ticker.add(delta => update(delta));
	
	socket.emit("ends_setup");
}

function build_slots()
{
	console.log("Building slots", Object.keys(game_state.slot_config) )
	//COLUMNS - ROLLS
	
	asset_structure.columns = [];
	
	//deberia usar for each.
	for (let column=0; column < Object.keys(game_state.slot_config).length; column++)
	{	
		let column_data = game_state.slot_config[ Object.keys(game_state.slot_config)[column] ];
		asset_structure.columns.push( new PIXI.Container() );
		asset_structure.columns[column].is_spinning = false;
		asset_structure.columns[column].id = "column_" + (column+1).toString();
		
		for (let i=0; i < column_data.length; i++)
		{
			let item = new PIXI.Sprite(spritesheet.textures["Food-" + column_data[i] + ".png"])
			item.scale.x = 6;
			item.scale.y = 6;
			item.x = 150 + column * item.width + 100 * column;
			item.y = i * -20 * 6;
			item.id = "id_slot_" + i;
			item.visible = false;
			item.original_y = item.y;
			
			asset_structure.columns[column].addChild(item);
			
		}
		
		app.stage.addChildAt(asset_structure.columns[column],0);
	}
}

function find_upmost_children(column)
{
	let upmost;
	for (let i=0; i < column.children.length; i++){
		
		if (!upmost){
			upmost = column.getChildAt(i);
		}
		
		if ( upmost.y > column.getChildAt(i).y){
			upmost = column.getChildAt(i);
		}
	}
	return upmost;
}

function check_all_columns_stopped(){
	let all_stopped = true;
	for (let i= 0; i < asset_structure.columns.length;i++){
		let column = asset_structure.columns[i];
		if (column.is_spinning){
			all_stopped = false;
		}
	}
	
	if (all_stopped){
		reset_game_state();
	}
}


function update(delta){
	
	if (game_state.slot_playing){
		for (let i= 0; i < asset_structure.columns.length;i++){
			
			let column = asset_structure.columns[i];
			
			for (let c=0; c < column.children.length; c++){
				if (!column.is_spinning)
					continue;
				
				let child = column.getChildAt(c);
				
				child.y+=5;
				
				if (child.y > 120){
					child.visible = true;
					if (child.y > 200 && game_state.column_result[column.id] == child.id){
						
						column.is_spinning = false;
						
						check_all_columns_stopped();
						
						continue;
					}
				}
				
				if (child.y > 250){
					child.y = find_upmost_children(column).y - ( child.height * 1.5 );
					child.visible = false;
				}
			}
		}
	}
	
	if (game_state.handler_playing){
		asset_structure.handler.height-=5;
		if (asset_structure.handler.height <= 10){
			asset_structure.handler.height = asset_structure.handler.original_height;
			game_state.handler_playing = false;
		}
		
	}
}