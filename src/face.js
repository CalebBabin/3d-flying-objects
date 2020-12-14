const imgsrc = require('./moon2M.png');
const moonImg = document.createElement('img');

const frames = [];
const variance = 1.25;

for (let index = 0; index < 600; index++) {
	frames.push(document.createElement('canvas'));
}

moonImg.addEventListener('load', () => {
	for (let index = 0; index < frames.length; index++) {
		frames[index].width = Math.ceil(moonImg.width);
		frames[index].height = Math.ceil(moonImg.height * variance);
		const ctx = frames[index].getContext('2d');

		for (let x = 0; x < moonImg.width; x++) {
			ctx.drawImage(
				moonImg,
				x,
				0,
				1,
				moonImg.height,
				x,
				Math.sin((index / frames.length) * Math.PI * 2 + (x / moonImg.width) * Math.PI * 2) * (((variance - 1) / 2) * moonImg.height) + (((variance - 1) / 2) * moonImg.height),
				1,
				moonImg.height,
			)
		}
	}
});

moonImg.src = imgsrc;

export default frames;