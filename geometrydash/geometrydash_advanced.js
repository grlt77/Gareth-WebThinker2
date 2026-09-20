let reels = Array(9).fill(1);
let resultMessage = 'Press SPIN to play';
let resultColor;
let isSpinning = false;
let spinStartedAt = 0;
let balance = 100000;
let difficulty = 'easy';
let betInput;
const spinDuration = 900;
const spinButton = { x: 0, y: 0, width: 190, height: 58 };
const difficultyButtons = [
	{ name: 'easy', label: 'EASY', maximum: 5, multiplier: 1.5, x: 190 },
	{ name: 'medium', label: 'MEDIUM', maximum: 7, multiplier: 2, x: 305 },
	{ name: 'hard', label: 'HARD', maximum: 10, multiplier: 3, x: 420 }
];

function setup() {
	createCanvas(720, 650);
	textFont('Trebuchet MS');
	resultColor = color('#ffe08a');
	betInput = createInput('1000', 'number');
	betInput.attribute('min', '1');
	betInput.attribute('step', '100');
	betInput.attribute('placeholder', 'Bet amount ($)');
	betInput.attribute('aria-label', 'Bet amount');
	betInput.style('font-size', '18px');
	betInput.style('padding', '8px 10px');
	betInput.style('width', '150px');
	betInput.style('text-align', 'center');
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
	text('Match three numbers in a row to win', width / 2, 124);

	fill('#f8c95c');
	textSize(20);
	textStyle(BOLD);
	text(`BALANCE: $${balance.toLocaleString()}`, width / 2, 148);

	for (let index = 0; index < reels.length; index += 1) {
		const column = index % 3;
		const row = floor(index / 3);
		const x = 178 + column * 122;
		const y = 165 + row * 83;
		fill('#f8f2ff');
		rect(x, y, 104, 70, 12);
		fill('#321a48');
		rect(x + 7, y + 7, 90, 56, 8);

		fill('#fff4c2');
		textSize(38);
		textStyle(BOLD);
		text(reels[index], x + 52, y + 35);
	}

	spinButton.x = width / 2 - spinButton.width / 2;
	spinButton.y = 500;
	const buttonHovered = isPointerOverSpinButton();
	const betAmount = getBetAmount();
	fill(isSpinning || betAmount > balance ? '#74647d' : buttonHovered ? '#ffdb72' : '#f8c95c');
	rect(spinButton.x, spinButton.y, spinButton.width, spinButton.height, 12);

	fill('#21132d');
	textSize(24);
	textStyle(BOLD);
	text(isSpinning ? 'SPINNING...' : betAmount > balance ? 'NO FUNDS' : 'SPIN', width / 2, spinButton.y + spinButton.height / 2);

	for (const button of difficultyButtons) {
		const isSelected = difficulty === button.name;
		const isHovered = mouseX >= button.x && mouseX <= button.x + 110 && mouseY >= 440 && mouseY <= 474;
		fill(isSelected ? '#f8c95c' : isHovered ? '#6e4b83' : '#432657');
		rect(button.x, 440, 110, 34, 8);
		fill(isSelected ? '#21132d' : '#f5e8ff');
		textSize(14);
		text(button.label, button.x + 55, 457);
	}

	fill('#f5e8ff');
	textSize(15);
	textStyle(NORMAL);
	const selectedDifficulty = difficultyButtons.find((button) => button.name === difficulty);
	text(`Each winning line pays ${selectedDifficulty.multiplier}x`, width / 2, 420);

	fill(resultColor);
	textSize(22);
	textStyle(BOLD);
	text(resultMessage, width / 2, 605);
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
	const winningLines = getWinningLines();
	const selectedDifficulty = difficultyButtons.find((button) => button.name === difficulty);
	const winnings = getBetAmount() * selectedDifficulty.multiplier * winningLines.length;
	balance += winnings;
	resultMessage = winningLines.length > 0
		? `${winningLines.length} winning line${winningLines.length === 1 ? '' : 's'}! You won $${winnings.toLocaleString()}!`
		: 'No match this time. Try again!';
	resultColor = winningLines.length > 0 ? color('#ffe08a') : color('#f0c6ff');
}

function mousePressed() {
	if (!isSpinning && isPointerOverSpinButton()) {
		const betAmount = getBetAmount();
		if (betAmount <= 0) {
			resultMessage = 'Enter a valid bet amount.';
			return;
		}
		if (balance < betAmount) {
			resultMessage = 'Your bet is higher than your balance.';
			return;
		}

		balance -= betAmount;
		isSpinning = true;
		spinStartedAt = millis();
		resultMessage = 'Good luck!';
		resultColor = color('#ffe08a');
		return;
	}

	for (const button of difficultyButtons) {
		if (mouseX >= button.x && mouseX <= button.x + 110 && mouseY >= 440 && mouseY <= 474 && !isSpinning) {
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

function getBetAmount() {
	return max(0, floor(Number(betInput.value()) || 0));
}

function getWinningLines() {
	const lines = [
		[0, 1, 2], [3, 4, 5], [6, 7, 8],
		[0, 3, 6], [1, 4, 7], [2, 5, 8],
		[0, 4, 8], [2, 4, 6]
	];

	return lines.filter(([first, second, third]) =>
		reels[first] === reels[second] && reels[second] === reels[third]
	);
}

function isPointerOverSpinButton() {
	return mouseX >= spinButton.x
		&& mouseX <= spinButton.x + spinButton.width
		&& mouseY >= spinButton.y
		&& mouseY <= spinButton.y + spinButton.height;
}