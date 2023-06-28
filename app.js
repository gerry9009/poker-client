const newGameButton = document.querySelector(".js-new-game");
const userCardsContainer = document.querySelector(".js-user-cards");
const chipCount = document.querySelector(".js-chip-count-container");
const potCount = document.querySelector(".js-pot-count-container");
const betArea = document.querySelector(".js-bet-area");
const betSlider = document.querySelector("#bet-amount");
const betSliderValue = document.querySelector(".js-slider-value");
const betButton = document.querySelector(".js-bet-button");

// program state
let {
  deckId,
  playerCards,
  computerCards,
  playerChips,
  computerChips,
  playerBetPlaced,
  pot,
} = getInitializeState();

// initializations
function getInitializeState() {
  return {
    deckId: null,
    playerCards: [],
    computerCards: [],
    playerChips: 100,
    computerChips: 100,
    playerBetPlaced: false,
    pot: 0,
  };
}

const initialize = () => {
  ({
    deckId,
    playerCards,
    computerCards,
    playerChips,
    computerChips,
    playerBetPlaced,
    pot,
  } = getInitializeState());
};

// state verification and change
const canBet = () => {
  return (
    playerCards.length === 2 && playerChips > 0 && playerBetPlaced === false
  );
};

const bet = () => {
  // add the bet's value to the pot
  // subtracts the bet's value from player's chips
  // player bet placed
  // rerender

  const betValue = Number(betSlider.value);
  pot += betValue;
  playerChips -= betValue;

  playerBetPlaced = true;

  // rerender
  render();

  // computer move
  computerMoveAfterBet();
};

const postBlinds = () => {
  playerChips -= 1;
  computerChips -= 2;
  pot += 3;

  render();
};

//main functionality
const startHand = async () => {
  postBlinds();

  const response = await fetch(
    "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1"
  );
  const data = await response.json();
  const { deck_id } = data;
  deckId = deck_id;
  drawPlayersCards();
};

const startNewGame = () => {
  initialize();
  startHand();
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

const shouldComputerCall = () => {
  if (computerCards.length !== 2) return false;
  console.log(computerCards);
  const card1Code = computerCards[0].code; // pl.: AC, 4H, 9D
  const card2Code = computerCards[1].code; // pl.: 5C, 3D, 0H (10: 0)

  const card1Value = card1Code[0];
  const card2Value = card2Code[0];

  const card1Suit = card1Code[1];
  const card2Suit = card2Code[1];

  console.log(card1Code, card2Code, card1Code[0], card2Code[0]);

  return (
    card1Value === card2Value ||
    ["0", "J", "Q", "K", "A"].includes(card1Value) ||
    ["0", "J", "Q", "K", "A"].includes(card2Value) ||
    (card1Suit === card2Suit &&
      Math.abs(Number(card1Value) - Number(card2Value)) <= 2)
  );
};

const computerMoveAfterBet = async () => {
  if (deckId === null) return;

  const response = await fetch(
    `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`
  );

  const data = await response.json();
  computerCards = data.cards;
  alert(shouldComputerCall() ? "call" : "fold");
  // render();
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
