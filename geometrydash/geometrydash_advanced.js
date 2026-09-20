let reels = [1, 1, 1];
let resultMessage = 'Press SPIN to play';
let resultColor;
let isSpinning = false;
let spinStartedAt = 0;
const spinDuration = 900;
const spinButton = { x: 0, y: 0, width: 190, height: 58 };

function setup() {
	createCanvas(720, 520);
	textFont('Trebuchet MS');
	resultColor = color('#ffe08a');
}

function draw() {
	drawMachine();

	if (isSpinning) {
		animateSpin();
	}
}

function drawMachine() {
	background('#17111f');

	noStroke();
	fill('#2b183d');
	rect(48, 35, width - 96, height - 70, 24);

	fill('#f8c95c');
	textAlign(CENTER, CENTER);
	textSize(42);
	textStyle(BOLD);
	text('LUCKY 10', width / 2, 88);

	fill('#f5e8ff');
	textSize(16);
	textStyle(NORMAL);
	text('Match all three numbers to hit the jackpot', width / 2, 124);

	for (let index = 0; index < reels.length; index += 1) {
		const x = 107 + index * 172;
		fill('#f8f2ff');
		rect(x, 165, 134, 150, 14);
		fill('#321a48');
		rect(x + 9, 174, 116, 132, 9);

		fill('#fff4c2');
		textSize(72);
		textStyle(BOLD);
		text(reels[index], x + 67, 241);
	}

	spinButton.x = width / 2 - spinButton.width / 2;
	spinButton.y = 355;
	const buttonHovered = isPointerOverSpinButton();
	fill(isSpinning ? '#74647d' : buttonHovered ? '#ffdb72' : '#f8c95c');
	rect(spinButton.x, spinButton.y, spinButton.width, spinButton.height, 12);

	fill('#21132d');
	textSize(24);
	textStyle(BOLD);
	text(isSpinning ? 'SPINNING...' : 'SPIN', width / 2, spinButton.y + spinButton.height / 2);

	fill(resultColor);
	textSize(22);
	textStyle(BOLD);
	text(resultMessage, width / 2, 456);
}

function animateSpin() {
	const elapsed = millis() - spinStartedAt;

	if (elapsed < spinDuration) {
		if (frameCount % 4 === 0) {
			reels = reels.map(() => floor(random(1, 11)));
		}
		return;
	}

	reels = reels.map(() => floor(random(1, 11)));
	isSpinning = false;
	resultMessage = reels[0] === reels[1] && reels[1] === reels[2]
		? 'JACKPOT! Three of a kind!'
		: 'No match this time. Try again!';
	resultColor = reels[0] === reels[1] && reels[1] === reels[2]
		? color('#ffe08a')
		: color('#f0c6ff');
}

function mousePressed() {
	if (!isSpinning && isPointerOverSpinButton()) {
		isSpinning = true;
		spinStartedAt = millis();
		resultMessage = 'Good luck!';
		resultColor = color('#ffe08a');
	}
}

function isPointerOverSpinButton() {
	return mouseX >= spinButton.x
		&& mouseX <= spinButton.x + spinButton.width
		&& mouseY >= spinButton.y
		&& mouseY <= spinButton.y + spinButton.height;
}