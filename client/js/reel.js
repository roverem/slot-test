export class Reel{
	constructor(data, id, item_spritesheet){
		this.data = data; //["b", "b", "c", "b", "a", "d", "e", "d", "a", "a", "e", "b", "a", "d", "c", "c", "e", "e", "c", "d"]
		this.id = "column_" + id.toString();
		this.item_spritesheet = item_spritesheet;
		
		this.asset = new PIXI.Container();
		this.is_spinning = true;
		
		this.items = [];
		this.asset_config = {
			a: "Food-1.png",
			b: "Food-2.png",
			c: "Food-3.png",
			d: "Food-4.png",
			e: "Food-5.png"
		}
		
		this.build_items();
	}
	
	build_items(){
		for (let i= 0; i < this.data.length; i++){
			let asset_name = this.asset_config[ this.data[i] ];
			let item = new PIXI.Sprite( this.item_spritesheet.textures[asset_name] );
			item.scale.x = 6;
			item.scale.y = 6;
			item.y = i * -20 * 6;
			item.id = "id_slot_" + this.data[i];
			//item.visible = false;
			item.original_y = item.y;
			
			const tween = new TWEEN.Tween(item)
				.to({ y: 200 }, 3000) 
				.easing(TWEEN.Easing.Quadratic.Out)
				.start();
			console.log(tween);
			
			this.asset.addChild(item);
		}
	}
	
	update(delta){
		
		if (this.is_spinning){
			//this.asset.y++;
		}
	}
}