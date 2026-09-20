let reels = [1, 1, 1];
let resultMessage = 'Press SPIN to play';
let resultColor;
let isSpinning = false;
let spinStartedAt = 0;
let balance = 100000;
let difficulty = 'easy';
const spinDuration = 900;
const spinCost = 1000;
const spinButton = { x: 0, y: 0, width: 190, height: 58 };
const difficultyButtons = [
	{ name: 'easy', label: 'EASY', maximum: 5, x: 190 },
	{ name: 'medium', label: 'MEDIUM', maximum: 7, x: 305 },
	{ name: 'hard', label: 'HARD', maximum: 10, x: 420 }
];

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

	fill('#f8c95c');
	textSize(20);
	textStyle(BOLD);
	text(`BALANCE: $${balance.toLocaleString()}`, width / 2, 148);

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
	spinButton.y = 388;
	const buttonHovered = isPointerOverSpinButton();
	fill(isSpinning || balance < spinCost ? '#74647d' : buttonHovered ? '#ffdb72' : '#f8c95c');
	rect(spinButton.x, spinButton.y, spinButton.width, spinButton.height, 12);

	fill('#21132d');
	textSize(24);
	textStyle(BOLD);
	text(isSpinning ? 'SPINNING...' : balance < spinCost ? 'NO FUNDS' : 'SPIN', width / 2, spinButton.y + spinButton.height / 2);

	for (const button of difficultyButtons) {
		const isSelected = difficulty === button.name;
		const isHovered = mouseX >= button.x && mouseX <= button.x + 110 && mouseY >= 340 && mouseY <= 374;
		fill(isSelected ? '#f8c95c' : isHovered ? '#6e4b83' : '#432657');
		rect(button.x, 340, 110, 34, 8);
		fill(isSelected ? '#21132d' : '#f5e8ff');
		textSize(14);
		text(button.label, button.x + 55, 357);
	}

	fill(resultColor);
	textSize(22);
	textStyle(BOLD);
	text(resultMessage, width / 2, 486);
}

function animateSpin() {
	const elapsed = millis() - spinStartedAt;

	if (elapsed < spinDuration) {
		if (frameCount % 4 === 0) {
			reels = reels.map(() => randomReelValue());
		}
		return;
	}

	reels = reels.map(() => randomReelValue());
	isSpinning = false;
	const matchingPair = reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2];
	const jackpot = reels[0] === reels[1] && reels[1] === reels[2];
	const winnings = jackpot ? spinCost * 10 : matchingPair ? spinCost * 2 : 0;
	balance += winnings;
	resultMessage = jackpot
		? `JACKPOT! You won $${winnings.toLocaleString()}!`
		: matchingPair
			? `Pair matched! You won $${winnings.toLocaleString()}!`
			: 'No match this time. Try again!';
	resultColor = jackpot || matchingPair ? color('#ffe08a') : color('#f0c6ff');
}

function mousePressed() {
	if (!isSpinning && isPointerOverSpinButton()) {
		if (balance < spinCost) {
			resultMessage = 'You need $1,000 to spin.';
			return;
		}

		balance -= spinCost;
		isSpinning = true;
		spinStartedAt = millis();
		resultMessage = 'Good luck!';
		resultColor = color('#ffe08a');
		return;
	}

	for (const button of difficultyButtons) {
		if (mouseX >= button.x && mouseX <= button.x + 110 && mouseY >= 340 && mouseY <= 374 && !isSpinning) {
			difficulty = button.name;
			resultMessage = `${button.label} mode: numbers 1-${button.maximum}`;
			resultColor = color('#ffe08a');
			return;
		}
	}
}

function randomReelValue() {
	const selectedDifficulty = difficultyButtons.find((button) => button.name === difficulty);
	return floor(random(1, selectedDifficulty.maximum + 1));
}

function isPointerOverSpinButton() {
	return mouseX >= spinButton.x
		&& mouseX <= spinButton.x + spinButton.width
		&& mouseY >= spinButton.y
		&& mouseY <= spinButton.y + spinButton.height;
}