var app
window.onload = function() {
	let type = "WebGL"
	if(!PIXI.utils.isWebGLSupported()){
	  type = "canvas"
	}

	PIXI.utils.sayHello(type)
	//Create a Pixi Application

	app = new PIXI.Application({ 
		width: 256,         // default: 800
		height: 256,        // default: 600
		antialias: true,    // default: false
		transparent: false, // default: false
		resolution: 1       // default: 1
	  }
	);
	
	app.renderer.backgroundColor = 0x061639;
	app.renderer.autoDensity = true;
	app.renderer.resize(512, 512);
	
	app.renderer.view.style.position = "absolute";
	app.renderer.view.style.display = "block";
	app.renderer.resize(window.innerWidth, window.innerHeight);

	//Add the canvas that Pixi automatically created for you to the HTML document
	document.body.appendChild(app.view);
	
	
	PIXI.Loader.shared
		.add("assets/slot_holder_empty.png")
		.add("assets/Food.png")
		.load(setup)
		
	
}

var slot_holder;
var items = [];

function setup(){
	slot_holder = new PIXI.Sprite(PIXI.loader.resources["assets/slot_holder_empty.png"].texture)
	slot_holder.scale.x = 2;
	slot_holder.scale.y = 2;
	
	
	/*food = new PIXI.Sprite(PIXI.loader.resources["assets/Food.png"].texture);
	food.y = -400
	food.scale.x = 6;
	food.scale.y = 6;*/
	
	for (let i=0; i < 6; i++)
	{
		let food_texture = PIXI.loader.resources["assets/Food.png"].texture;
		let rectangle = new PIXI.Rectangle(i * 16, i * 16, 16, 16);
		food_texture.frame = rectangle;
		let item = new PIXI.Sprite.from(food_texture)
		item.x = 84;
		item.y = i * -16 * 6
		item.scale.x = 6;
		item.scale.y = 6;
		items.push(item);
		app.stage.addChild(item);
	}
	
	app.stage.addChild(slot_holder);
	
	app.ticker.add(delta => update(delta));
}

var once = false;
function update(delta){
	for (let i= 0; i < items.length;i++){
		items[i].y++;
	}
	
	if (!once){
		let food_texture = PIXI.utils.TextureCache["assets/Food.png"]
		let rectangle = new PIXI.Rectangle(0, 0, 16, 16);
		food_texture.frame = rectangle;
		let item = new PIXI.Sprite(food_texture)
		item.x = 84;
		item.y = 200
		item.scale.x = 6;
		item.scale.y = 6;
		//items.push(item);
		app.stage.addChild(item);
		once = true;
	}
}