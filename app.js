const newGameButton = document.querySelector(".js-new-game");
const userCardsContainer = document.querySelector(".js-user-cards");
const chipCount = document.querySelector(".js-chip-count-container");
const potCount = document.querySelector(".js-pot-count-container");
const betArea = document.querySelector(".js-bet-area");
const betSlider = document.querySelector("#bet-amount");
const betSliderValue = document.querySelector(".js-slider-value");
const betButton = document.querySelector(".js-bet-button");

// program state
let { deckId, playerCards, playerChips, computerChips, pot } =
  getInitializeState();

// initializations
function getInitializeState() {
  return {
    deckId: null,
    playerCards: [],
    playerChips: 100,
    computerChips: 100,
    pot: 0,
  };
}

const initialize = () => {
  ({ deckId, playerCards, playerChips, computerChips, pot } =
    getInitializeState());
};

// state verification
const canBet = () => {
  return playerCards.length === 2 && playerChips > 0 && pot === 0;
};

const bet = () => {
  // add the bet's value to the pot
  // subtracts the bet's value from player's chips
  // rerender

  const betValue = Number(betSlider.value);
  pot += betValue;
  playerChips -= betValue;

  render();
};

//main functionality
const startNewGame = async () => {
  initialize();
  const response = await fetch(
    "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1"
  );
  const data = await response.json();
  const { deck_id } = data;
  deckId = deck_id;
  drawPlayersCards();
};

const drawPlayersCards = async () => {
  if (deckId === null) return;
  const response = await fetch(
    `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`
  );
  const data = await response.json();
  playerCards = data.cards;
  render();
};

// Render functions
const renderPlayerCards = () => {
  userCardsContainer.innerHTML = "";
  for (let card of playerCards) {
    const img = document.createElement("img");
    img.src = card.images.png;
    img.alt = card.code;

    userCardsContainer.appendChild(img);
  }
};

const renderPlayerChips = () => {
  chipCount.innerHTML = `
  <div class="chip-count">Player : ${playerChips} $</div>
  <divclass="chip-count" >Computer : ${computerChips} $</div>
  `;
};

const renderPot = () => {
  potCount.innerHTML = `
    <div>Pot : ${pot} $</div>
  `;
};

const renderBetSlider = () => {
  if (canBet()) {
    betArea.classList.remove("invisible");
    // Set user chips in the slider
    betSlider.setAttribute("max", playerChips);
    // Set user bet value
    betSliderValue.innerText = betSlider.value;
  } else {
    betArea.classList.add("invisible");
  }
};

const render = () => {
  renderPlayerCards();
  renderPlayerChips();
  renderPot();
  renderBetSlider();
};

// Event listeners
newGameButton.addEventListener("click", startNewGame);

betSlider.addEventListener("change", render);

betButton.addEventListener("click", bet);

render();
