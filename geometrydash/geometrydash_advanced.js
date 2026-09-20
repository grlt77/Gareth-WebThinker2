let reels = [makeWheel(1), makeWheel(1), makeWheel(1)];
let resultMessage = 'Press SPIN to play';
let resultColor;
let isSpinning = false;
let spinStartedAt = 0;
let balance = 100000;
let difficulty = 'easy';
let betInput;
let stoppedReels = [false, false, false];
let nextStopIndex = 0;
const spinButton = { x: 0, y: 0, width: 190, height: 58 };
const stopButtons = [
	{ x: 140, y: 390, width: 120, height: 42 },
	{ x: 300, y: 390, width: 120, height: 42 },
	{ x: 460, y: 390, width: 120, height: 42 }
];
const difficultyButtons = [
	{ name: 'easy', label: 'EASY', maximum: 5, multiplier: 1.5, x: 190 },
	{ name: 'medium', label: 'MEDIUM', maximum: 7, multiplier: 2, x: 305 },
	{ name: 'hard', label: 'HARD', maximum: 10, multiplier: 3, x: 420 }
];

function setup() {
	createCanvas(720, 700);
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
	text('Stop each wheel to line up horizontal or diagonal matches', width / 2, 124);

	fill('#f8c95c');
	textSize(20);
	textStyle(BOLD);
	text(`BALANCE: $${balance.toLocaleString()}`, width / 2, 148);

	for (let index = 0; index < reels.length; index += 1) {
		const x = 140 + index * 160;
		fill('#f8f2ff');
		rect(x, 165, 120, 210, 14);
		fill('#321a48');
		rect(x + 8, 173, 104, 194, 9);

		fill('#fff4c2');
		textSize(42);
		textStyle(BOLD);
		for (let row = 0; row < 3; row += 1) {
			text(reels[index][row], x + 60, 205 + row * 64);
		}

		const stopButton = stopButtons[index];
		const isActive = isSpinning && nextStopIndex === index;
		const isHovered = isPointerOverStopButton(index);
		fill(isActive ? isHovered ? '#ffdb72' : '#f8c95c' : '#74647d');
		rect(stopButton.x, stopButton.y, stopButton.width, stopButton.height, 9);
		fill('#21132d');
		textSize(16);
		text(stoppedReels[index] ? 'STOPPED' : `STOP ${index + 1}`, stopButton.x + stopButton.width / 2, stopButton.y + stopButton.height / 2);
	}

	spinButton.x = width / 2 - spinButton.width / 2;
	spinButton.y = 465;
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
		const isHovered = mouseX >= button.x && mouseX <= button.x + 110 && mouseY >= 540 && mouseY <= 574;
		fill(isSelected ? '#f8c95c' : isHovered ? '#6e4b83' : '#432657');
		rect(button.x, 540, 110, 34, 8);
		fill(isSelected ? '#21132d' : '#f5e8ff');
		textSize(14);
		text(button.label, button.x + 55, 557);
	}

	fill('#f5e8ff');
	textSize(15);
	textStyle(NORMAL);
	const selectedDifficulty = difficultyButtons.find((button) => button.name === difficulty);
	text(`Each horizontal or diagonal line pays ${selectedDifficulty.multiplier}x`, width / 2, 515);

	fill(resultColor);
	textSize(22);
	textStyle(BOLD);
	text(resultMessage, width / 2, 650);
}

function animateSpin() {
	if (frameCount % 3 !== 0) {
		return;
	}

	for (let index = 0; index < reels.length; index += 1) {
		if (!stoppedReels[index]) {
			reels[index] = reels[index].map((value) => value >= getMaximumValue() ? 1 : value + 1);
		}
	}
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
		reels = reels.map(() => makeWheel(randomReelValue()));
		isSpinning = true;
		stoppedReels = [false, false, false];
		nextStopIndex = 0;
		resultMessage = 'Good luck!';
		resultColor = color('#ffe08a');
		return;
	}

	if (isSpinning && isPointerOverStopButton(nextStopIndex)) {
		stoppedReels[nextStopIndex] = true;
		nextStopIndex += 1;

		if (nextStopIndex === reels.length) {
			finishSpin();
		} else {
			resultMessage = `Now stop wheel ${nextStopIndex + 1}.`;
		}
		return;
	}

	for (const button of difficultyButtons) {
		if (mouseX >= button.x && mouseX <= button.x + 110 && mouseY >= 540 && mouseY <= 574 && !isSpinning) {
			difficulty = button.name;
			resultMessage = `${button.label} mode: numbers 1-${button.maximum}`;
			resultColor = color('#ffe08a');
			return;
		}
	}
}

function randomReelValue() {
	return floor(random(1, getMaximumValue() + 1));
}

function makeWheel(startValue) {
	const maximum = getMaximumValue();
	return [0, 1, 2].map((offset) => ((startValue - 1 + offset) % maximum) + 1);
}

function getMaximumValue() {
	const selectedDifficulty = difficultyButtons.find((button) => button.name === difficulty);
	return selectedDifficulty.maximum;
}

function getBetAmount() {
	return max(0, floor(Number(betInput.value()) || 0));
}

function finishSpin() {
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

function getWinningLines() {
	const lines = [
		[reels[0][0], reels[1][0], reels[2][0]],
		[reels[0][1], reels[1][1], reels[2][1]],
		[reels[0][2], reels[1][2], reels[2][2]],
		[reels[0][0], reels[1][1], reels[2][2]],
		[reels[0][2], reels[1][1], reels[2][0]]
	];

	return lines.filter(([first, second, third]) => first === second && second === third);
}

function isPointerOverSpinButton() {
	return mouseX >= spinButton.x
		&& mouseX <= spinButton.x + spinButton.width
		&& mouseY >= spinButton.y
		&& mouseY <= spinButton.y + spinButton.height;
}

function isPointerOverStopButton(index) {
	const button = stopButtons[index];
	return mouseX >= button.x
		&& mouseX <= button.x + button.width
		&& mouseY >= button.y
		&& mouseY <= button.y + button.height;
}