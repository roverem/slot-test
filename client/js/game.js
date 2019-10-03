import { SOCKET } from "../main.js";

export class Game{
	constructor(app){
		this.app = app;
		
		this.spritesheet = null;
		this.char_spritesheet = null;
		this.enemy_spritesheet = null;
		
		this.assets = {};
		this.state = {
			handler_playing: false,
			slot_playing: false,
			slot_config: null
		}
	}
	
	setup(){
		
		document.body.appendChild(this.app.view);
		
		PIXI.Loader.shared
			.add("assets/slot_holder_empty.png")
			.add("assets/spritesheet.json")
			.add("assets/character.json")
			.add("assets/enemy.json")
			.load(this.setup_assets.bind(this))
			
		SOCKET.on("slot_config", this.save_config.bind(this));
		SOCKET.on("confirm_play", this.confirm_play.bind(this));
	}
	
	setup_assets(){
		
		SOCKET.emit("user_starts")
		
		this.spritesheet = PIXI.Loader.shared.resources["assets/spritesheet.json"].spritesheet;
		//char_spritesheet = PIXI.Loader.shared.resources["assets/character.json"].spritesheet;
		this.enemy_spritesheet = PIXI.Loader.shared.resources["assets/enemy.json"].spritesheet;
		
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
		this.addToStage(character);
		
		this.assets.character = character;
		
		//ENEMY
		
		let enemy_sprite = new PIXI.AnimatedSprite(this.enemy_spritesheet.animations["skeleton_tile"]);
		enemy_sprite.x = 550;
		enemy_sprite.y = 410;
		enemy_sprite.animationSpeed = 0.1;
		enemy_sprite.scale.x = -6;
		enemy_sprite.scale.y = 6;
		enemy_sprite.play();
		this.addToStage(enemy_sprite);
		
		this.assets.enemy = enemy_sprite;
		
		//SLOTS HOLDER
		
		let slot_holder = new PIXI.Sprite(this.spritesheet.textures["slot_holder_empty.png"])
		slot_holder.scale.x = 3;
		slot_holder.scale.y = 3;
		slot_holder.y = 200;
		slot_holder.x = slot_holder.width;
		
		this.assets.slot_holder = slot_holder;
		
		//HANDLER - PALANCA
		
		let handler = new PIXI.Sprite(this.spritesheet.textures["handle.png"]);
		handler.x = slot_holder.x;
		handler.y = slot_holder.y;
		handler.scale.x = 3;
		handler.scale.y = 3;
		handler.original_height = handler.height;
		
		this.assets.handler = handler;
		
		handler.interactive = true;
		handler.buttonMode = true;
		handler.addListener('pointerdown', ()=>{
			if (!this.state.slot_playing){
				SOCKET.emit("user_plays");
			}
		});
		
		this.addToStage(slot_holder);
		this.addToStage(handler);
		
		this.app.ticker.add(delta => this.update(delta));
		
		SOCKET.emit("ends_setup");
	}
	
	addToStage(child){
		this.app.stage.addChild(child);
	}
	
	update(delta){
	
		if (this.state.slot_playing){
			for (let i= 0; i < this.assets.columns.length;i++){
				
				let column = this.assets.columns[i];
				
				for (let c=0; c < column.children.length; c++){
					if (!column.is_spinning)
						continue;
					
					let child = column.getChildAt(c);
					
					child.y+=5;
					
					if (child.y > 120){
						child.visible = true;
						if (child.y > 200 && this.state.column_result[column.id] == child.id){
							
							column.is_spinning = false;
							
							this.check_all_columns_stopped();
							
							continue;
						}
					}
					
					if (child.y > 250){
						child.y = this.find_upmost_children(column).y - ( child.height * 1.5 );
						child.visible = false;
					}
				}
			}
		}
		
		if (this.state.handler_playing){
			this.assets.handler.height-=5;
			if (this.assets.handler.height <= 10){
				this.assets.handler.height = this.assets.handler.original_height;
				this.state.handler_playing = false;
			}
			
		}
	}
	
	save_config(config){
		this.state.slot_config = config;
		this.build_slots();
	}
	
	confirm_play(message){
		console.log(message);
		
		this.state.handler_playing = true
		this.state.slot_playing = true
		for (let i= 0; i < this.assets.columns.length;i++){
			this.assets.columns[i].is_spinning = true;
		}
		
		this.state.column_result = message.play;
		
		this.state.play_result = message.result;
		
		
		if (this.state.play_result == "wins"){
			//ANIMAR ESQUELETO. RECIBE HIT.
			this.assets.character.play();
		}
	}
	
	reset_game_state(){
		this.state.handler_playing = false;
		this.state.slot_playing = false;
	}
	
	build_slots(){
		console.log("Building slots", Object.keys(this.state.slot_config) )
		//COLUMNS - ROLLS
		
		this.assets.columns = [];
		
		//deberia usar for each.
		for (let column=0; column < Object.keys(this.state.slot_config).length; column++)
		{	
			let column_data = this.state.slot_config[ Object.keys(this.state.slot_config)[column] ];
			this.assets.columns.push( new PIXI.Container() );
			this.assets.columns[column].is_spinning = false;
			this.assets.columns[column].id = "column_" + (column+1).toString();
			
			for (let i=0; i < column_data.length; i++)
			{
				let item = new PIXI.Sprite(this.spritesheet.textures["Food-" + column_data[i] + ".png"])
				item.scale.x = 6;
				item.scale.y = 6;
				item.x = 150 + column * item.width + 100 * column;
				item.y = i * -20 * 6;
				item.id = "id_slot_" + i;
				item.visible = false;
				item.original_y = item.y;
				
				this.assets.columns[column].addChild(item);
				
			}
			
			this.addToStage(this.assets.columns[column],0);
		}
	}
	
	find_upmost_children(column)
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
	
	check_all_columns_stopped(){
		let all_stopped = true;
		for (let i= 0; i < this.assets.columns.length;i++){
			let column = this.assets.columns[i];
			if (column.is_spinning){
				all_stopped = false;
			}
		}
		
		if (all_stopped){
			this.reset_game_state();
		}
	}

}