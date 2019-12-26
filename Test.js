import { GLTFLoader } from './Includes/GLTFLoader.js';
import { OrbitControls } from './OrbitControls.js';

//Variables
var renderer = null,scene = null,camera = null,
cube = null, saitama = null, allMight = null;
var mixer = null, mixer1 = null,controls = null;
var punchSound = null, AllMightLaugh = null;
var punchDur = null, punchTime = 0, punchAction = null;

var clock = new THREE.Clock();
var duration = 5000; // ms
var currentTime = Date.now();
var elapsedTime = 0;
function animate() {
/*var now = Date.now();
var deltat = now - currentTime;
currentTime = now;
var fract = deltat / duration;
var angle = Math.PI * 2 * fract;*/
var delta = clock.getDelta();
if(saitama.position.y > -100)
{
	saitama.position.y-=delta*100;
}
else if(allMight.position.y > -100){
	AllMightLaugh.play();
	AllMightLaugh.hasPlaybackControl = false;
	allMight.position.y-=delta*120;
}
else{
	punchTime += delta;
	punchSound.play();
	punchSound.hasPlaybackControl = false;
	saitama.position.x = -30;
	if(punchTime > punchDur/0.28)
		punchAction.timeScale = 3;
	if ( mixer ) mixer.update( delta );
	if ( !mixer ) mixer1.update( delta );
}

}

function run() {
requestAnimationFrame(function() { run(); });
// Render the scene
renderer.render( scene, camera );
// Spin the cube for next frame
animate();
}

$(document).ready( function() 
{
	
var canvas = document.getElementById("glCanvas");
// Create the Three.js renderer and attach it to our canvas
renderer = new THREE.WebGLRenderer(
{ canvas: canvas, antialias: true, alpha:true } );
// Set the viewport size
renderer.setSize(canvas.width, canvas.height);
// Create a new Three.js scene
scene = new THREE.Scene();
// Add a camera so we can view the scene
var map1 = THREE.ImageUtils.loadTexture('./images/SkyTest.png');
scene.background = map1;

camera = new THREE.PerspectiveCamera( 45,
canvas.width / canvas.height, 1, 4000 );

// create an AudioListener and add it to the camera
var listener = new THREE.AudioListener();
camera.add( listener );

// create a global audio source
punchSound = new THREE.Audio( listener );

AllMightLaugh = new THREE.Audio( listener );

// load a sound and set it as the Audio object's buffer
var audioLoader = new THREE.AudioLoader();
audioLoader.load( 'Audio.mp3', function( buffer ) {
	punchSound.setBuffer( buffer );
	punchSound.setLoop( false );
	punchSound.setVolume( 0.5 );
});

audioLoader.load( 'all_might_laugh.mp3', function( buffer ) {
	AllMightLaugh.setBuffer( buffer );
	AllMightLaugh.setLoop( false );
	AllMightLaugh.setVolume( 1 );
});

controls = new OrbitControls( camera, renderer.domElement );
controls.target = new THREE.Vector3(10, 0, 0);
controls.addEventListener('change', run);

scene.add(camera);

var light1 = new THREE.DirectionalLight( 0xffffff, 5);
var light2 = new THREE.DirectionalLight( 0xffffff, 5);
var light3 = new THREE.HemisphereLight( 0xffffff, 0x444444 );
				light3.position.set( 10, 20, 0 );
				scene.add( light3 );
// Position the light out from the scene, pointing
// at the origin
light1.position.set(-20, 20, 1);
light2.position.set(20, 20, 10);
//scene.add( light1 );
//scene.add( light2 );
// Instantiate a loader

var loader = new GLTFLoader();
// Load a glTF resource
loader.load(
	// resource URL
	'./Saitama (Problem)/Project_Final_problem_Cape.glb',
	// called when the resource is loaded
	function ( gltf ) {

		saitama = gltf.scene

		mixer= new THREE.AnimationMixer(gltf.scene);

		mixer.addEventListener( 'finished', ( /*event*/ ) => {

	    console.log('Done');

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
		saitama.position.y= 220;

		scene.add( gltf.scene );
		
		

	},
	// called while loading is progressing
	function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	},
	// called when loading has errors
	function ( error ) {

		console.log( error );

	}
);
loader.load(
	// resource URL
	'./All-Might/scene.gltf',
	// called when the resource is loaded
	function ( gltf ) {

		allMight = gltf.scene
		scene.add( allMight );
		mixer1= new THREE.AnimationMixer(gltf.scene);

		mixer1.addEventListener( 'finished', ( /*event*/ ) => {

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
		allMight.position.y= 220;

	},
	// called while loading is progressing
	function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	},
	// called when loading has errors
	function ( error ) {

		console.log( 'An error happened' );

	}
);
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
var geometry = new THREE.CubeGeometry(2000, 500 , 2000);
// And put the geometry and material together into a mesh
cube = new THREE.Mesh(geometry, material);
// Move the mesh back from the camera and tilt it toward
// the viewer
cube.position.z = -600;
cube.position.y = -380;
// Finally, add the mesh to our scene
scene.add( cube );
// Run the run loop


//LOADING MODELS EXAMPLE

run();
}
);
