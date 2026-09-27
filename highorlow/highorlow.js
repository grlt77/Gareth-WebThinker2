const betInput = document.querySelector('#bet-amount');
const result = document.querySelector('#game-result');
const rangeButtons = document.querySelectorAll('.range-button');

rangeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const bet = Number(betInput.value);
    if (!Number.isFinite(bet) || bet <= 0) {
      result.dataset.state = 'error';
      result.textContent = 'Enter a bet greater than 0 to play.';
      betInput.focus();
      return;
    }

    const roll = Math.floor(Math.random() * 6) + 1;
    const guessedCorrectly = roll >= Number(button.dataset.min) && roll <= Number(button.dataset.max);
    const formattedBet = bet.toFixed(2);

    if (guessedCorrectly) {
      result.dataset.state = 'win';
      result.textContent = `It landed on ${roll}. You win ${ (bet * 2).toFixed(2) } (2x your ${formattedBet} bet)!`;
    } else {
      result.dataset.state = 'loss';
      result.textContent = `It landed on ${roll}. No win this time. Your ${formattedBet} bet was lost.`;
    }
  });
});