const newGameButton = document.querySelector(".js-new-game");
const userCardsContainer = document.querySelector(".user-cards");

let deckId = null;
let playerCards = [];

const shuffleTheCards = async () => {
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
  renderUserCards();
};

const renderUserCards = () => {
  userCardsContainer.innerHTML = "";
  for (let card of playerCards) {
    const img = document.createElement("img");
    img.src = card.images.png;
    img.alt = card.code;

    userCardsContainer.appendChild(img);
  }
};

newGameButton.addEventListener("click", async () => {
  shuffleTheCards();
});
