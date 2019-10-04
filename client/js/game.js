import { SOCKET } from "../main.js";
import { Reel } from "./reel.js";

export class Game{
	constructor(app){
		this.app = app;
		
		this.spritesheet = null;
		this.char_spritesheet = null;
		this.enemy_spritesheet = null;
		
		this.assets = {};
		this.state = {
			playing: "waiting",
			server_data_ready : false
		}
		
		this.server_data = {};
	}
	
	setup(){
		
		document.body.appendChild(this.app.view);
		
		PIXI.Loader.shared
			.add("assets/spritesheet.json")
			.load(this.setup_assets.bind(this))
			
		
		SOCKET.emit("user_request_initial_data");
			
		SOCKET.on('sending_reels', this.receive_reels.bind(this) );
		SOCKET.on('sending_paylines', this.receive_paylines.bind(this) );
		SOCKET.on('sending_paytable', this.receive_paytable.bind(this) );
		
		//SOCKET.on("confirm_play", this.confirm_play.bind(this));
		SOCKET.on( "spin", this.spin.bind(this) );
	}
	
	setup_assets(){
		
		//BOARD
		this.assets.board = new PIXI.Container();
		let board_rect = new PIXI.Graphics().
			beginFill(0xFF0000)
			.drawRect(0, 250, 600, 360)
			.endFill();
		board_rect.name = "board_rect";
		this.assets.board.addChild(board_rect);
		this.assets.board.x = 200;
		this.assets.board.y = 100;
		
		let mask = new PIXI.Graphics()
			.beginFill(0xFF0000)
			.drawRect(this.assets.board.x, board_rect.height, board_rect.width, board_rect.height)
			.endFill();
		this.addToStage(mask);
		this.assets.board.mask = mask;
		
		this.addToStage(this.assets.board);
		
		//REEL ITEM ASSETS
		this.spritesheet = PIXI.Loader.shared.resources["assets/spritesheet.json"].spritesheet;
		
		
		//SPIN BUTTON
		let spin_button = new PIXI.Container();
		spin_button.x = 600;
		spin_button.y = 200;
		
		spin_button.interactive = true;
		spin_button.buttonMode = true;
		spin_button.addListener('pointerdown', ()=>{
			console.log("SPIN!");
			if (this.state.playing == "waiting"){
				SOCKET.emit("request_spin");
			}
			
		});
		
		let spin_button_frame = new PIXI.Graphics()
			.beginFill(0xFF0000)
			.drawRect(0, 0, 200, 100)
			.endFill();
		let spin_button_text = new PIXI.Text("SPIN", {fontFamily: 'Arial', fontSize: 34, fill: 0xffffff, align: 'center'});
		spin_button_text.x = spin_button_frame.width / 2 - spin_button_text.width / 2;
		spin_button_text.y = spin_button_frame.height / 2 - spin_button_text.height / 2;
		spin_button.addChild(spin_button_frame);
		spin_button.addChild(spin_button_text);
		this.addToStage(spin_button);
		
		this.state.assets_ready = true;
		this.setup_game();
	}
	
	receive_reels(data){
		this.server_data.reels = data;
		
		this.check_all_data_received();
	}
	
	receive_paylines(data){
		this.server_data.paylines = data;
		
		this.check_all_data_received();
	}
	
	receive_paytable(data){
		this.server_data.paytable = data;
		
		this.check_all_data_received();
	}
	
	check_all_data_received(){
		if (this.server_data.paylines && this.server_data.reels && this.server_data.paytable){
			
			this.state.server_data_ready = true;
			this.setup_game();
		}
	}
	
	setup_game(){
		if (!this.state.server_data_ready)
			return;
		
		if (!this.state.assets_ready)
			return;
		
		this.build_slots();
	}
	
	build_slots(){
		console.log("Building slots", this.server_data )
		//COLUMNS - ROLLS
		
		this.assets.reels = [];
		
		for (let i=0; i < this.server_data.reels.length; i++){
			let reel = new Reel(this.server_data.reels[i], i + 1, this.spritesheet);
			this.assets.reels.push(reel);
			reel.asset.x = 50 + i * reel.asset.width + 100 * i;
			reel.asset.y = 500;
			this.assets.board.addChild(reel.asset);
		}
		
		this.app.ticker.add(delta => this.update(delta));
	}
	
	
	addToStage(child){
		this.app.stage.addChild(child);
	}
	
	update(delta){
		
		TWEEN.update();
		
		for (let r=0; r < this.assets.reels.length; r++){
			this.assets.reels[r].update(delta);
		}
		
		if (this.state.playing == "playing"){
			this.check_all_columns_stopped();
		}
	}
	
	spin(data){
		console.log(data);
		for ( let i = 0; i < this.assets.reels.length; i++ ){
			this.assets.reels[i].is_spinning = true;
			this.assets.reels[i].set_stop(data.stopPoints[i]);
		}
		
		this.state.playing = "playing";
	}
	
	reset_game_state(){
		console.log("resetting");
		if (this.state.playing == "playing"){
			this.state.playing = "waiting";
		}
	}
	
	check_all_columns_stopped(){
		let all_stopped = true;
		for (let i= 0; i < this.assets.reels.length;i++){
			let reel = this.assets.reels[i];
			if (reel.is_spinning){
				all_stopped = false;
			}
		}
		
		if (all_stopped){
			this.reset_game_state();
		}
	}

}