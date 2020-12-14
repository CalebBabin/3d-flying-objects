import * as THREE from 'three';
import Chat from 'twitch-chat-emotes';

import frames from './face';

let channels = ['moonmoon'];
const query_vars = {};
const query_parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
	query_vars[key] = value;
});
if (query_vars.channels) {
	channels = query_vars.channels.split(',');
}

const ChatInstance = new Chat({
	channels,
	duplicateEmoteLimit: 1,
	duplicateEmoteLimit_pleb: 0,
})

const emoteSize = 56;
const PI2 = Math.PI * 2;

const emoteTextures = {};
const pendingEmoteArray = [];
ChatInstance.on("emotes", (e) => {

	const direction = Math.random() * PI2;
	const output = {
		position: { x: main.position.x + main.width / 2, y: main.position.y + main.height / 2 },
		velocity: { x: Math.sin(direction), y: Math.cos(direction) },
		emotes: [],
		life: 0,
	};
	for (let index = 0; index < e.emotes.length; index++) {
		const emote = e.emotes[index];
		if (!emoteTextures[emote.material.id]) {
			emoteTextures[emote.material.id] = new THREE.CanvasTexture(emote.material.canvas);
		}
		emote.texture = emoteTextures[emote.material.id];
		output.emotes.push(emote);
	}
	output.height = emoteSize;
	output.width = emoteSize * output.emotes.length;

	output.position.x -= output.width / 2;
	output.position.y -= output.height / 2;


	pendingEmoteArray.push(output);
})

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

const mainDirection = Math.random() * PI2;
const main = {
	position: { x: 0, y: 0 },
	velocity: { x: Math.sin(mainDirection), y: Math.cos(mainDirection) },
	width: emoteSize * 4,
	height: emoteSize * 4,
	frame: 0,
	frames: 600
};

const vary = (element) => {
	let rad = Math.atan2(element.velocity.x, element.velocity.y); // In radians
	rad += (Math.random() * 2 - 1) * (Math.PI / 10);
	element.velocity.x = Math.sin(rad);
	element.velocity.y = Math.cos(rad);
}

const bounce = (element) => {
	if (element.position.x + element.width >= window.innerWidth) {
		element.position.x = window.innerWidth - (element.width + 0.0001);
		element.velocity.x *= -1;
		vary(element);
	}
	if (element.position.y + element.height >= window.innerHeight) {
		element.position.y = window.innerHeight - (element.height + 0.0001);
		element.velocity.y *= -1;
		vary(element);
	}
	if (element.position.x <= 0) {
		element.position.x = 0.0001;
		element.velocity.x *= -1;
		vary(element);
	}
	if (element.position.y <= 0) {
		element.position.y = 0.0001;
		element.velocity.y *= -1;
		vary(element);
	}
}


window.addEventListener('DOMContentLoaded', () => {
	function resize() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}
	function init() {
		window.addEventListener('resize', resize)
		document.body.appendChild(canvas);
	}

	let lastFrame = Date.now();
	function draw() {
		requestAnimationFrame(draw);
		const delta = (Date.now() - lastFrame) / 1000;
		lastFrame = Date.now();
		ctx.clearRect(0, 0, canvas.width, canvas.height)

		for (let index = pendingEmoteArray.length - 1; index >= 0; index--) {
			const element = pendingEmoteArray[index];
			element.position.x += element.velocity.x * delta * 150;
			element.position.y += element.velocity.y * delta * 150;

			bounce(element);

			element.life += delta;
			for (let i = 0; i < element.emotes.length; i++) {
				const emote = element.emotes[i];
				ctx.drawImage(emote.material.canvas,
					(element.position.x + emoteSize * i),
					(element.position.y),
					(emoteSize),
					(emoteSize * (emote.material.canvas.height / emote.material.canvas.width)));
			}

			if (element.life > 5) {
				pendingEmoteArray.splice(index, 1);
			}
		}

		bounce(main);
		main.position.x += main.velocity.x * delta * 100;
		main.position.y += main.velocity.y * delta * 100;
		ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
		ctx.save();
		ctx.translate(
			main.position.x,
			main.position.y,
		);
		if (main.velocity.x <= 0) {
			ctx.scale(-1, 1);
		}
		ctx.drawImage(
			frames[main.velocity.x > 0 ? main.frame : (frames.length - 1) - main.frame],
			0 + (main.velocity.x <= 0 ? -main.width : 0),
			0,
			main.width,
			main.height * (frames[main.frame].height / frames[main.frame].width),
		)
		ctx.restore();
		main.frame++;
		if (main.frame >= main.frames) main.frame = 0;
	}

	resize();

	main.position.x = canvas.width / 2 - main.width / 2;
	main.position.y = canvas.height / 2 - main.height / 2;

	init();
	draw();
})