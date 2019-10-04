export class Reel{
	constructor(data, id, item_spritesheet){
		this.data = data; //["b", "b", "c", "b", "a", "d", "e", "d", "a", "a", "e", "b", "a", "d", "c", "c", "e", "e", "c", "d"]
		this.id = "column_" + id.toString();
		this.item_spritesheet = item_spritesheet;
		
		this.asset = new PIXI.Container();
		
		this.velocity = 5;
		
		this.is_spinning = false;
		
		this.TOP_POINT = -250;
		
		this.stopping_point = null;
		
		this.items = [];
		this.asset_config = {
			a: "Food-1.png",
			b: "Food-2.png",
			c: "Food-3.png",
			d: "Food-4.png",
			e: "Food-5.png"
		}
		
		this.build_items();
		//this.setup_tween();
	}
	
	set_stop(point){
		console.log("setting stop:", point);
		this.stopping_point = point;
	}
	
	build_items(){
		for (let i= 0; i < this.data.length; i++){
			let asset_name = this.asset_config[ this.data[i] ];
			let item = new PIXI.Sprite( this.item_spritesheet.textures[asset_name] );
			item.scale.x = 6;
			item.scale.y = 6;
			item.y = this.TOP_POINT + i * 20 * 6;
			item.id = i.toString();
			item.original_y = item.y;
			this.items.push(item);
			this.asset.addChild(item);
			
			item.addChild( new PIXI.Text(item.id, {fontFamily: 'Arial', fontSize: 12, fill: 0xffffff}) );
			let name = new PIXI.Text(this.data[i], {fontFamily: 'Arial', fontSize: 12, fill: 0xffffff});
			item.addChild( name );
			name.x = 12;
		}
		
		this.topmost_item = 0;
		for (let i=this.items.length-1; i >= 0; i--){
			if (this.items[i].y > 80){
				this.items[i].y = this.items[this.topmost_item].y - this.items[i].height * 1.5;
				this.topmost_item = i;
				
			}
		}
	}
	
	setup_tween() {
		const tween = new TWEEN.Tween(this.asset)
			.to({ y: this.asset.y + 900 }, 3000) 
			.easing(TWEEN.Easing.Quadratic.InOut)
			//.onUpdate( (object)=>{ console.log(object.y) })
			.start();
	}
	
	update(delta){
		if (!this.is_spinning) return;
		//for (let i=0; i < this.items.length; i++){
		for (let i=this.items.length-1; i >= 0; i--){
			
			if (this.stopping_point != null && 
				this.items[this.stopping_point].y >= this.TOP_POINT )
			{
				console.log("stopping for ", i)
				this.is_spinning = false;
				return;
			}
			
			this.items[i].y += this.velocity * delta;
			
			if (this.items[i].y > 80){
				this.items[i].y = this.items[this.topmost_item].y - this.items[i].height * 1.5;
				this.topmost_item = i;
			}
		}
	}
	
	
}