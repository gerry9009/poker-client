const newGameButton = document.querySelector(".js-new-game");
const potCount = document.querySelector(".js-pot-count-container");
const betArea = document.querySelector(".js-bet-area");
const betSlider = document.querySelector("#bet-amount");
const betSliderValue = document.querySelector(".js-slider-value");
const betButton = document.querySelector(".js-bet-button");
const communityCardsContainer = document.querySelector(
  ".js-community-cards-container"
);

const playerCardsContainer = document.querySelector(".js-user-cards");
const playerChipCount = document.querySelector(
  ".js-player-chip-count-container"
);

const computerCardsContainer = document.querySelector(".js-computer-cards");
const computerChipCount = document.querySelector(
  ".js-computer-chip-count-container"
);
const computerActionContainer = document.querySelector(".js-computer-action");

// program state
let {
  deckId,
  pot,
  playerCards, // user card
  playerChips,
  playerBetPlaced,
  playerBets,
  computerCards, // computer card
  computerChips, //
  computerAction, // computer action (Call, Fold, Check)
  computerBets,
  communityCards,
} = getInitializeState();

// initializations
function getInitializeState() {
  return {
    deckId: null,
    pot: 0,
    playerCards: [],
    playerChips: 100,
    playerBetPlaced: false,
    playerBets: 0,
    computerCards: [],
    computerChips: 100,
    computerAction: null, // computer action (call, fold)
    computerBets: 0,
    communityCards: [],
  };
}

const initialize = () => {
  ({
    deckId,
    pot,
    playerCards, // user card
    playerChips,
    playerBetPlaced,
    playerBets,
    computerCards, // computer card
    computerChips, //
    computerAction, // computer action (call, fold)
    computerBets,
    communityCards,
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
  playerBets += betValue;

  // rerender
  render();

  // computer move
  computerMoveAfterBet();
};

const postBlinds = () => {
  playerChips -= 1;
  playerBets += 1;
  computerChips -= 2;
  computerBets += 2;
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

const endHand = (winner = null) => {
  const handleEndHand = () => {
    // all case need handle
    if (computerAction === "Fold") {
      playerChips += pot;
      pot = 0;
    } else if (winner === "Player") {
      playerChips += pot;
      pot = 0;
    } else if (winner === "Computer") {
      computerChips += pot;
      pot = 0;
    } else if (winner === "Draw") {
      playerChips += playerBets;
      computerChips += computerBets;
      pot = 0;
    }

    playerBets = 0;
    computerBets = 0;

    playerCards = [];
    computerCards = [];
    computerAction = null;
    playerBetPlaced = false;

    deckId = null;

    render();
  };

  setTimeout(handleEndHand, 2000);
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

const shouldComputerCall = (computerCards) => {
  if (computerCards.length !== 2) return false;
  console.log(computerCards);
  const card1Code = computerCards[0].code; // pl.: AC, 4H, 9D
  const card2Code = computerCards[1].code; // pl.: 5C, 3D, 0H (10: 0)

  const card1Value = card1Code[0];
  const card2Value = card2Code[0];

  const card1Suit = card1Code[1];
  const card2Suit = card2Code[1];

  return (
    card1Value === card2Value ||
    ["0", "J", "Q", "K", "A"].includes(card1Value) ||
    ["0", "J", "Q", "K", "A"].includes(card2Value) ||
    (card1Suit === card2Suit &&
      Math.abs(Number(card1Value) - Number(card2Value)) <= 2)
  );
};

const SHOWDOWN_API_PREFIX = "https://api.pokerapi.dev/v1/winner/texas_holdem";
const cardsToString = (cards) => {
  return cards
    .map((card) => card.code)
    .toString()
    .replaceAll("0", "10");
};

const getWinner = async () => {
  const cc = cardsToString(communityCards);
  const player = cardsToString(playerCards);
  const computer = cardsToString(computerCards);

  const response = await fetch(
    `${SHOWDOWN_API_PREFIX}?cc=${cc}&pc[]=${player}&pc[]=${computer}`
  );
  const data = await response.json();
  const winners = data.winners;

  const winnersCardsString = winners[0].cards;
  if (winnersCardsString === player) {
    return "Player";
  } else if (winnersCardsString === computer) {
    return "Computer";
  } else {
    return "Draw";
  }
};

//TODO: ------------------------------------------------------------------------
const showdown = async () => {
  const response = await fetch(
    `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=5`
  );

  const data = await response.json();
  communityCards = data.cards;
  render();

  const winner = await getWinner();
  console.log(winner);
  return winner;
};

const computerMoveAfterBet = async () => {
  if (deckId === null) return;

  const response = await fetch(
    `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`
  );

  const data = await response.json();

  if (pot === 4) {
    computerAction = "Check";
  } else if (shouldComputerCall(data.cards)) {
    computerAction = "Call";
  } else {
    computerAction = "Fold";
  }

  if (computerAction === "Call") {
    // player: Bet (blinds and player bet)
    // computer: 2 (big blinds)
    // till : Pot
    const difference = playerBets - computerBets;
    computerChips -= difference;
    computerBets += difference;
    pot += difference;
  }

  if (computerAction === "Call" || computerAction === "Check") {
    computerCards = data.cards;
    render();
    const winner = await showdown();
    endHand(winner);
  } else {
    render();
    endHand();
  }
};

// Render functions
const renderCardsInContainer = (cards, container) => {
  container.innerHTML = "";
  for (let card of cards) {
    const img = document.createElement("img");
    img.src = card.images.png;
    img.alt = card.code;

    container.appendChild(img);
  }
};

const renderAllCards = () => {
  renderCardsInContainer(playerCards, playerCardsContainer);
  renderCardsInContainer(computerCards, computerCardsContainer);
  renderCardsInContainer(communityCards, communityCardsContainer);
};

const renderPlayerChips = () => {
  playerChipCount.innerHTML = `
  <div>Player : ${playerChips} $</div>
  `;
};

const renderComputerChips = () => {
  computerChipCount.innerHTML = `
    <div>Computer : ${computerChips} $</div>
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

const renderActions = () => {
  // if variable null or undefined -> after ??
  computerActionContainer.innerHTML = computerAction ?? "";
};

const render = () => {
  renderAllCards();
  renderPlayerChips();
  renderComputerChips();
  renderPot();
  renderBetSlider();
  renderActions();
};

// Event listeners
newGameButton.addEventListener("click", startNewGame);

betSlider.addEventListener("change", render);

betButton.addEventListener("click", bet);

render();
