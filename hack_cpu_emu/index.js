import {
	Hack,
	default as init
} from './wasm_hack.js';

async function run(rom) {
	let wasm = await init('./wasm_hack_bg.wasm');

	// Create new cpu emulator
	const hack = Hack.new(rom);

	// Init 2d canvas to render Hack screen
	var canvas = document.getElementById("hack-canvas");
	var new_canvas = canvas.cloneNode(true);
	canvas.parentNode.replaceChild(new_canvas, canvas);
	canvas = new_canvas;
	canvas.height = 256;
	canvas.width = 512;
	const ctx = canvas.getContext('2d');

	// Input init
	window.addEventListener('keydown', function(event) {
		hack.set_key(event.keyCode);
		if ([32, 37, 38, 39, 40].indexOf(event.keyCode) > -1) {
			event.preventDefault();
		}
	}, false);

	window.addEventListener('keyup', function(event) {
		hack.release_key(event.keyCode);
	});
	
	// Init arrow buttons
	var buttons = document.querySelectorAll('.button');

	buttons.forEach((btn) => {

	  btn.addEventListener('mousedown', (event) => {
		hack.set_key(btn.value);
	  });
	  
	  btn.addEventListener('mouseup', (event) => {
		 hack.release_key(btn.value); 
	  });
	  
	  btn.addEventListener('touchstart', (event) => {
		hack.set_key(btn.value);
	  });
	  
	  btn.addEventListener('touchend', (event) => {
		 hack.release_key(btn.value); 
	  });
	});
	
	// Play/Pause functionality
	let animationId = null;
	const isPaused = () => {
		return animationId === null;
	};

	const playPauseButton = document.getElementById("play-pause-button");

	const play = () => {
		playPauseButton.textContent = "⏸";
		renderLoop();
	};

	const pause = () => {
		playPauseButton.textContent = "▶";
		cancelAnimationFrame(animationId);
		animationId = null;
	};

	playPauseButton.addEventListener("click", event => {
		if (isPaused()) {
			play();
		} else {
			pause();
		}
	});
	
	// Reset functionality
	const resetButton = document.getElementById("reset-button");
	resetButton.textContent = "↺";
	
	resetButton.addEventListener('click', function(event) {
		hack.reset();
	});
	
	// Basic renderloop
	const renderLoop = () => {

		// Tick 'speed_input' times
		hack.tick(document.getElementById("speed_input").value);
		// Draw Hack screen
		draw();

		animationId = requestAnimationFrame(renderLoop);
	};

	const draw = () => {
		var canvasWidth = canvas.width;
		var canvasHeight = canvas.height;

		const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
		var data = imageData.data;

		hack.draw();

		let frame_ptr = hack.frame();

		const pixels = new Uint8Array(wasm.memory.buffer, frame_ptr, 512 * 256 * 4);
		imageData.data.set(pixels);

		ctx.putImageData(imageData, 0, 0);
	}

	draw();
	play();
}

// Select ROM functionality
const select_rom = document.querySelector('.select_rom');

select_rom.addEventListener('change', (event) => {
	fetch('rom/' + event.target.value)
		.then(response => response.text())
		.then(data => run(data));
});

window.addEventListener('click', (event) => {

// Mobile keyboard
var target = document.getElementById("hack-canvas");

if (event.target != target) {
	target.focus();
	target.click();
}
});