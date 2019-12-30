document.addEventListener("DOMContentLoaded", init);
import { GLTFLoader } from './Includes/GLTFLoader.js';

//There are many commented sections conatining models that we tried to use but failed due to model inconsistencies from the model itself

var container;
var camera, scene, renderer, light;
var controls, water;
var time,delta,clock;
var keyboard = {};
var firstPerson = 0;
var player = { height:6, speed:0.2, turnSpeed:Math.PI*0.02 };
var birdView ={ xPos:50,yPos:25,zPos:25,xLA:0,yLA:0,zLA:0};
var upView ={ positionCamera:(50, 25, 25),LookAtCamera:(0,0,0)};
var parameters = {
    size: 0.5,
    distortionScale: 3.7,
    alpha: 1.0
};
var line;
var cube = null, saitama = null, allMight = null;
var mixer = null;
var punchSound = null, AllMightLaugh = null;
var punchDur = null, punchTime = 0, punchAction = null;
var island, rock, themeSong;

clock = new THREE.Clock();
var duration = 5000; // ms
var currentTime = Date.now();
var elapsedTime = 0;
function animateScene() {
delta = clock.getDelta();
if(saitama.position.y > 2.12)
{
	saitama.position.y-=delta*10;
}
/*else if(allMight.position.y > -100){
	AllMightLaugh.play();
	AllMightLaugh.hasPlaybackControl = false;
	allMight.position.y-=delta*120;
}*/
else{
	if(punchTime == 0)
		punchSound.play();
	punchTime += delta;
	saitama.position.x = 4;
	if(punchTime > punchDur/0.275){
		punchAction.timeScale = 3;
	}
	if(punchTime > punchDur/0.27){
		cube.position.x -= delta * 250;
	}
	if(punchTime > punchDur / 0.18){
		themeSong.play();
	}
	if ( mixer ) mixer.update( delta );
}

}

var loadingManager = null;
var RESOURCES_LOADED = false;

// Models index
var models = {
	tent: {
		obj:"models/Tent_Poles_01.obj",
		mtl:"models/Tent_Poles_01.mtl",
		mesh: null
	},
	campfire: {
		obj:"models/Campfire_01.obj",
		mtl:"models/Campfire_01.mtl",
		mesh: null
	},
	pirateship: {
		obj:"models/Pirateship.obj",
		mtl:"models/Pirateship.mtl",
		mesh: null
	},
	clouds: {
		obj:"models/cloud.obj",
		mtl:"models/cloud.obj.mtl",
		mesh: null
	}
};

// Meshes index
var meshes = {};

function init() {

    container = document.createElement('div');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
   
	clock = new THREE.Clock();
	
	loadingManager = new THREE.LoadingManager();
	loadingManager.onProgress = function(item, loaded, total){
		console.log(item, loaded, total);
	};
	loadingManager.onLoad = function(){
		console.log("loaded all resources");
		RESOURCES_LOADED = true;
		onResourcesLoaded();
	};



    // scene
    scene = new THREE.Scene();
    scene.background = new THREE.CubeTextureLoader()
	.setPath( 'textures/skybox/' )
	.load( [
		'px.jpg',
		'nx.jpg',
		'py.jpg',
		'ny.jpg',
		'pz.jpg',
		'nz.jpg'
    ] );
    // 'arid2_ft.jpg'
    // 'arid2_bk.jpg'
    // 'arid2_up.jpg'
    // 'arid2_dn.jpg'
    // 'arid2_rt.jpg'
    // 'arid2_lf.jpg'
    
    var	meshFloor = new THREE.Mesh(
		new THREE.PlaneGeometry(20,20, 10,10),
		new THREE.MeshBasicMaterial({color:0xffffff, wireframe:false})
	);
    meshFloor.rotation.x -= Math.PI / 2; // Rotate the floor 90 degrees
    meshFloor.position.set(0, -1.9, 0);
    camera.position.set(50, 25, 25);
    scene.add(meshFloor);

    var ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
    scene.add(ambientLight);

    var pointLight = new THREE.PointLight(0xffffff, 0.8);
    camera.add(pointLight);
    scene.add(camera);

    light = new THREE.DirectionalLight(0xff0000, 0.8);
    light.position.set(-30, 30, 30);
    light.castShadow = true;
    light.shadow.camera.top = 45;
    light.shadow.camera.right = 40;
    light.shadow.camera.left = light.shadow.camera.bottom = -40;
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 200;
    scene.add(light);

	for( var _key in models ){
		(function(key){
			
			var mtlLoader = new THREE.MTLLoader(loadingManager);
			mtlLoader.load(models[key].mtl, function(materials){
				materials.preload();
				
				var objLoader = new THREE.OBJLoader(loadingManager);
				
				objLoader.setMaterials(materials);
				objLoader.load(models[key].obj, function(mesh){
					
					mesh.traverse(function(node){
						if( node instanceof THREE.Mesh ){
							node.castShadow = true;
							node.receiveShadow = true;
						}
					});
					models[key].mesh = mesh;
					
				});
			});
			
		})(_key);
	}
	
	addWater();

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI/2; 
    
    window.addEventListener('resize', onWindowResize, false);

    // create an AudioListener and add it to the camera
	var listener = new THREE.AudioListener();
	camera.add( listener );

	// create a global audio source
	punchSound = new THREE.Audio( listener );

	themeSong = new THREE.Audio( listener);
//	AllMightLaugh = new THREE.Audio( listener );

	// load a sound and set it as the Audio object's buffer
	var audioLoader = new THREE.AudioLoader();
	audioLoader.load( './Audio.mp3', function( buffer ) {
		punchSound.setBuffer( buffer );
		punchSound.setLoop( false );
		punchSound.setVolume( 0.5 );
	});

	audioLoader.load( './22. Theme of ONE PUNCH MAN ~sadness~.mp3', function( buffer ) {
		themeSong.setBuffer( buffer );
		themeSong.setLoop( true );
		themeSong.setVolume( 0.5 );
	});
	

	/*audioLoader.load( 'all_might_laugh.mp3', function( buffer ) {
		AllMightLaugh.setBuffer( buffer );
		AllMightLaugh.setLoop( false );
		AllMightLaugh.setVolume( 1 );
	});*/

	console.log(themeSong);

    var loader = new GLTFLoader();
	// Load a glTF resource
	/*loader.load(
		// resource URL
		'./Saitama/Project_Final_Problem_Cape.glb',
		// called when the resource is loaded
		function ( gltf ) {

			saitama = gltf.scene

			saitama.scale.set(0.05,0.05,0.05);

			mixer= new THREE.AnimationMixer(gltf.scene);

			mixer.addEventListener( 'finished', () => {

		    console.log('Done');
		    camera.position.set(0, player.height, 18);
        	controls.target = new THREE.Vector3(0,player.height,0);
        	camera.lookAt(0,player.height,0);

			} );
			duration = gltf.animations[0].duration;
			console.log(gltf.animations);
	    	punchAction = mixer.clipAction( gltf.animations[ 4 ] );
	    	punchDur = gltf.animations[4].duration;
	    	punchAction.timeScale = 0.1; //Sets animation time
	    	punchAction.setLoop(THREE.loopRepeat,1);
	    	punchAction.clampWhenFinished = true;
			punchAction.play();
			
			saitama.position.z= -500;
			saitama.position.y= -100;
			saitama.position.x= 100;
			saitama.rotation.y= 250;
			saitama.position.set(10,100,0.8);

			scene.add( saitama );
			
			

		},
		// called while loading is progressing
		function ( xhr ) {

			console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

		},
		// called when loading has errors
		function ( error ) {

			console.log( error );

		}
	);*/

	loader.load(
		// resource URL
		'./island/scene.gltf',
		// called when the resource is loaded
		function ( gltf ) {

			island = gltf.scene;
			island.scale.set(10,10,10);
			scene.add(gltf.scene);

			island.position.set(0,3,0);
		}
		);

/*	loader.load(
		// resource URL
		'./Small rock/untitled.gltf',
		// called when the resource is loaded
		function ( gltf ) {

			rock = gltf.scene;
			scene.add(gltf.scene);

			rock.position.set(10,10,0);
		}
		);*/

/*
	loader.load(
		// resource URL
		'./All-Might/scene.gltf',
		// called when the resource is loaded
		function ( gltf ) {

			allMight = gltf.scene
			scene.add( allMight );
			allMight.scale.set(0.05,0.05,0.05);
			mixer1= new THREE.AnimationMixer(gltf.scene);

			mixer1.addEventListener( 'finished', () => {

		    console.log('Done1');

			} );
			console.log(gltf.animations);
	    	var action = mixer1.clipAction( gltf.animations[ 0 ] );
	    	action.timeScale = 1; //Sets animation time
	    	action.setLoop(THREE.loopRepeat,1);
	    	action.clampWhenFinished = true;
			action.play();
			allMight.position.z= -500;
			allMight.position.y= -100;
			allMight.position.x= -100;
			allMight.rotation.y= -250;
			allMight.position.set(-10,5,0);

		},
		// called while loading is progressing
		function ( xhr ) {

			console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

		},
		// called when loading has errors
		function ( error ) {

			console.log( 'An error happened' );

		}
	);*/
	// Create a texture-mapped cube and add it to the scene
	// First, create the texture map
	// Add a directional light to show off the object

	//CUBE EXAMPLE


	// Create a shaded, texture-mapped cube and add it to the scene
	// First, create the texture map
	var mapUrl = "./images/Test1.jpg";
	var map = THREE.ImageUtils.loadTexture(mapUrl);
	// Now, create a Phong material to show shading; pass in the map
	var material = new THREE.MeshPhongMaterial({ map: map });
	// Create the cube geometry
	var geometry = new THREE.CubeGeometry(10,10 , 10);
	// And put the geometry and material together into a mesh
	cube = new THREE.Mesh(geometry, material);
	// Move the mesh back from the camera and tilt it toward
	// the viewer
	cube.position.set(-4,6,0);
	// Finally, add the mesh to our scene
	scene.add( cube );
	// Run the run loop


	//LOADING MODELS EXAMPLE

//	camera.position.set(0, player.height, -5);

	animate();
 }

var animate = function () {

    requestAnimationFrame(animate);
    //animateScene();
    render();
};

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
   if( RESOURCES_LOADED == false ){
	   //you can loading screen here
		return;
	}
	
	time = Date.now()*0.005;
    if(firstPerson == 0){
        controls.update();
    }else{
        updateMotion();
	}
	updateShip();
	updateWater();
	updateClouds();
	renderer.render(scene,camera);
}

function updateMotion(){
	if(keyboard[87]){ // W key
		camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
		camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
	}
	if(keyboard[83]){ // S key
		camera.position.x += Math.sin(camera.rotation.y) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
	}
	if(keyboard[65]){ // A key
		camera.position.x += Math.sin(camera.rotation.y + Math.PI/2) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y + Math.PI/2) * player.speed;
	}
	if(keyboard[68]){ // D key
		camera.position.x += Math.sin(camera.rotation.y - Math.PI/2) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y - Math.PI/2) * player.speed;
	}
	
	if(keyboard[37]){ // left arrow key
		camera.rotation.y -= Math.PI * 0.01;
	}
	if(keyboard[39]){ // right arrow key
		camera.rotation.y += Math.PI * 0.01;
	}
}
function updateShip(){
	meshes["pirateship"].position.x -=0.01;
	meshes["pirateship"].position.z +=0.01;

	meshes["pirateship"].position.y -= Math.sin(time*1.5)*0.01;
	meshes["pirateship"].rotation.y -= 0.001;
}
function updateWater(){
	water.material.uniforms.time.value += 1.0 / 60.0;
    water.material.uniforms.size.value = parameters.size;
    water.material.uniforms.distortionScale.value = parameters.distortionScale;
    water.material.uniforms.alpha.value = parameters.alpha;
}
function updateClouds(){
	meshes["cloud1"].position.z += 0.2;
	meshes["cloud2"].position.z -= 0.2;
	meshes["cloud3"].position.x += 0.2;
	meshes["cloud4"].position.x -= 0.2;
	meshes["cloud5"].position.z += 0.2;
}

addEventListener('keydown',function(){
    keyboard[event.keyCode]=true;
});
addEventListener('keyup',function(){
    keyboard[event.keyCode]=false;
});
addEventListener('keypress',function(){
    if(this.event.keyCode == 108 && firstPerson != 1){//L
		firstPerson = 1;
		birdView.xLA= camera.position.x;
		birdView.yLA= camera.position.y;
		birdView.zLA= camera.position.z;
		birdView.xPos=camera.lookAt.x;
		birdView.yPos=camera.lookAt.y;
		birdView.zPos=camera.lookAt.z;
        camera.position.set(0, player.height, 18);
        controls.target = new THREE.Vector3(0,player.height,0);
        camera.lookAt(0,player.height,0);
        controls.enable=false;
		controls.enableKeys=false;

	}else if(this.event.keyCode == 107 && firstPerson != 0){//k
		camera.position.x =birdView.xLA;
		camera.position.y =birdView.yLA;
		camera.position.z =birdView.zLA;
		camera.lookAt.x =birdView.xPos;
		camera.lookAt.y =birdView.yPos;
		camera.lookAt.z =birdView.zPos;
		firstPerson = 0;
		controls.enable=true;
		controls.enableKeys=true;

    }
});
addEventListener('click',function(){
	if(firstPerson != 0){
		firstPerson = 0;
		controls.enable=true;
		controls.enableKeys=true;
	}
});

function addWater() {
    var waterGeometry = new THREE.PlaneBufferGeometry(30000, 30000);
    water = new THREE.Water(
        waterGeometry, {
            textureWidth: 20,
            textureHeight: 20,
            waterNormals: new THREE.TextureLoader().load('textures/waternormals.jpg', function (texture) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }),
            alpha: parameters.alpha,
            sunDirection: light.position.clone().normalize(),
            sunColor: 0x161616,
            waterColor: 0x0f1e3d,
            distortionScale: parameters.distortionScale,
        }
    );
    water.position.y = -2;
    water.rotation.x = -Math.PI / 2;
    water.receiveShadow = true;
    scene.add(water);
}
function onResourcesLoaded(){
	
	// Clone models into meshes.
	meshes["tent1"] = models.tent.mesh.clone();
	meshes["tent2"] = models.tent.mesh.clone();
	meshes["campfire1"] = models.campfire.mesh.clone();
	meshes["campfire2"] = models.campfire.mesh.clone();
	meshes["pirateship"] = models.pirateship.mesh.clone();
	meshes["cloud1"] = models.clouds.mesh.clone();
	meshes["cloud2"] = models.clouds.mesh.clone();
	meshes["cloud3"] = models.clouds.mesh.clone();
	meshes["cloud4"] = models.clouds.mesh.clone();
	meshes["cloud5"] = models.clouds.mesh.clone();
	
	// Reposition individual meshes, then add meshes to scene
	meshes["tent1"].position.set(-5, 2, 10);
	scene.add(meshes["tent1"]);
	
	meshes["tent2"].position.set(5, 2, 10);
	scene.add(meshes["tent2"]);
	
	meshes["campfire1"].position.set(-5, 2, 7);
	meshes["campfire2"].position.set(10, 2, 7);
	
	scene.add(meshes["campfire1"]);
	scene.add(meshes["campfire2"]);

	meshes["pirateship"].position.set(20, -3, 15);
	meshes["pirateship"].rotation.set(0, 100, 0); // Rotate it to face the other way.
	scene.add(meshes["pirateship"]);

	meshes["cloud1"].position.set(-10,100,15);
	meshes["cloud2"].position.set(70,200,70);
	meshes["cloud3"].position.set(-60,180,-90);
	meshes["cloud4"].position.set(100,130,50);
	meshes["cloud5"].position.set(50,150,-120);

	meshes["cloud1"].scale.set(0.1,0.1,0.1);
	meshes["cloud2"].scale.set(0.4,0.4,0.4);
	meshes["cloud3"].scale.set(0.1,0.1,0.1);
	meshes["cloud4"].scale.set(0.05,0.05,0.05);
	meshes["cloud5"].scale.set(0.2,0.2,0.2);

	scene.add(meshes["cloud1"]);
	scene.add(meshes["cloud2"]);
	scene.add(meshes["cloud3"]);
	scene.add(meshes["cloud4"]);
	scene.add(meshes["cloud5"]);
}
