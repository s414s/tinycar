class Game{

    constructor(width=1000, height=600, positionX=-1875, positionY=-1900){

        this.config = {
            position: {x: positionX, y: positionY},
            bearing: "up",
            fps: 50,
            speed: 15,
            time: 0,
            canvasHeight: height,
            canvasWidth: width,
            carWidth: 70,
            carHeight: 75,
            carRenderWidth: 30,
            carRenderHeight: 30,
            loaders : { files: {}, total: 0, loaded: 0 }
        }

        this.sprite_bearing = {
            up:{x:-8, y:0, width:70, height:75},
            upRight:{x:62, y:0, width:70, height:75},
            right:{x:131, y:0, width:70, height:75},
            downRight:{x:201, y:0, width:70, height:75},
            down:{x:271, y:0, width:70, height:75},
            downLeft:{x:341, y:0, width:70, height:75},
            left:{x:411, y:0, width:70, height:75},
            upLeft:{x:481, y:0, width:70, height:75}
        }

        this.color_speed = [
            {name: "normal", color: "237,28,36", speed: 15}, //red
            {name:"glue", color: "255,255,255", speed: 3}, //white
            {name: "stop", color: "63,72,204", speed: 1}, //blue
            {name: "oil", color: "0,0,0", speed: 3}, //black
            {name: "finish", color: "63,210,0", speed: 15} //green
        ]

        //---- Canvas set up ----
        this.canvas = document.getElementById("game");
        this.context = this.canvas.getContext("2d");
        this.canvas.width = this.config.canvasWidth;
        this.canvas.height = this.config.canvasHeight;

        //---- Hidden Canvas set up----
        this.hiddenCanvas = document.getElementById("hidden_canvas");
        this.hiddenCtx = this.hiddenCanvas.getContext("2d");
        this.hiddenCanvas.width = this.config.canvasWidth;
        this.hiddenCanvas.height = this.config.canvasHeight;
        
        const loader = (files, callback) => {

            this.config.loaders = {
                total: files.length,
                files: {},
                loaded: 0
            };

            files.forEach(file => {
                if(file.type !== "image"){return;}

                this.config.loaders.files[file.name] = new Image();
                this.config.loaders.files[file.name].src = file.url;

                this.config.loaders.files[file.name].addEventListener("load", () => {
                    this.config.loaders.loaded++;

                    if(this.config.loaders.loaded === this.config.loaders.total){
                        console.log("SE HA CARGADO TODO EL JUEGO!!!");
                        callback();
                    }

                });

            });
        }

        const files = [
            {name: "image_bg", url: "./img/circuitotornillos.png", type: "image"},
            {name: "image_car", url: "./img/azul.png", type: "image"},
            {name: "image_rgb", url: "./img/map_circuitotornillos.png", type: "image"}
        ]

        const start_game = ()=>{setInterval(() => {
            this.load_fp();
        }, this.config.fps);}

        loader(files, start_game);

    }

    load_fp(){

        this.move_car();
        this.next_pixel();

        this.load_bg();
        this.load_car();
        this.load_bg_rgb();
        
    }

    set_bearing(bearing){
        const whitelist = Object.keys(this.sprite_bearing);

        if( whitelist.includes(bearing) ){
            this.config.bearing = bearing;
        }else{
            console.error("Esta tecla no está configurada correctamente");
        }

    }
    
    load_bg(){

        this.context.drawImage(
            this.config.loaders.files.image_bg, 
            this.config.position.x + this.config.canvasWidth/2,
            this.config.position.y + this.config.canvasHeight/2);
    }

    load_bg_rgb(){

        this.hiddenCtx.drawImage(
            this.config.loaders.files.image_rgb,
            this.config.position.x + this.config.canvasWidth/2,
            this.config.position.y + this.config.canvasHeight/2
        )
    }

    load_car(){
        
        this.context.drawImage(
            this.config.loaders.files.image_car,
            this.sprite_bearing[this.config.bearing].x,
            this.sprite_bearing[this.config.bearing].y,
            this.sprite_bearing[this.config.bearing].width,
            this.sprite_bearing[this.config.bearing].height,
            (this.config.canvasWidth/2)-(this.config.carRenderWidth/2),
            (this.config.canvasHeight/2)-(this.config.carRenderHeight/2),
            this.config.carRenderWidth,
            this.config.carRenderHeight
        );
    }

    move_car(){

        const speed = this.config.speed;

        if (this.config.bearing === "up") {                this.config.position.y+=speed;
        } else if (this.config.bearing === "upRight") {    this.config.position.x-=speed; this.config.position.y+=speed;
        } else if (this.config.bearing === "right") {      this.config.position.x-=speed;
        } else if (this.config.bearing === "downRight") {  this.config.position.x-=speed; this.config.position.y-=speed;
        } else if (this.config.bearing === "down") {       this.config.position.y-=speed;
        } else if (this.config.bearing === "downLeft") {   this.config.position.x+=speed; this.config.position.y-=speed;
        } else if (this.config.bearing === "left") {       this.config.position.x+=speed;
        } else if (this.config.bearing === "upLeft") {     this.config.position.x+=speed; this.config.position.y+=speed;
        }
    }

    next_pixel(){

        const canvas_halfWidth = this.config.canvasWidth/2;
        const canvas_halfHeight = this.config.canvasHeight/2;
        const car_halfWidth = this.config.carRenderWidth/2;
        const car_halfHeight = this.config.carRenderHeight/2;

        const positionReader = {
            up: { x: canvas_halfWidth, y: canvas_halfHeight - car_halfHeight },
            right: { x: canvas_halfWidth + car_halfWidth, y: canvas_halfHeight },
            down: { x: canvas_halfWidth, y: canvas_halfHeight + car_halfHeight },
            left: { x: canvas_halfWidth - car_halfWidth, y: canvas_halfHeight },
            upRight: { x: canvas_halfWidth + car_halfWidth/2, y: canvas_halfHeight - car_halfHeight/2 },
            downRight: { x: canvas_halfWidth + car_halfWidth/2, y: canvas_halfHeight + car_halfHeight/2 },
            downLeft: { x: canvas_halfWidth - car_halfWidth/2, y: canvas_halfHeight + car_halfHeight/2 },
            upLeft: { x: canvas_halfWidth - car_halfWidth/2, y: canvas_halfHeight - car_halfHeight/2 }
        }

        const ctx = this.hiddenCtx;

        const imgData = ctx.getImageData(
            positionReader[this.config.bearing].x,
            positionReader[this.config.bearing].y,
            1, 1);

        const pixelData = imgData.data;

        const pixelColor = `${pixelData[0]},${pixelData[1]},${pixelData[2]}`;

        const find = this.color_speed.find( e => e.color===pixelColor  );

        if( find === undefined ){ return; }

        this.config.speed = find.speed;

    }

}

class Keyboard{

    constructor(){

        this.controller = {
            ArrowUp: false,
            ArrowRight: false,
            ArrowDown: false,
            ArrowLeft: false
        }

        document.addEventListener("keydown", (e) => {

            if(Object.keys(this.controller).includes(e.code)){
              this.controller[e.code] = true;
              this.changeBearing();
            }
        })

        document.addEventListener("keyup", (e) => {

            if(Object.keys(this.controller).includes(e.code)){
              this.controller[e.code] = false;
              this.changeBearing();
            }
        })
    }

    changeBearing(){

        const tc = this.controller;
        let bearing = null;

        if (tc.ArrowUp && tc.ArrowRight) {          bearing = "upRight";
        } else if (tc.ArrowRight && tc.ArrowDown) {  bearing = "downRight";
        } else if (tc.ArrowDown && tc.ArrowLeft) {   bearing = "downLeft";
        } else if (tc.ArrowUp && tc.ArrowLeft) {     bearing = "upLeft";
        } else if (tc.ArrowUp) {                     bearing = "up";
        } else if (tc.ArrowRight) {                  bearing = "right";
        } else if (tc.ArrowDown) {                   bearing = "down";
        } else if (tc.ArrowLeft) {                   bearing = "left";
        }

        if( bearing !== null ){ game.set_bearing(bearing);}
        
    }
}

window.onload = () => {
    game = new Game;
    const keyboard = new Keyboard();
}