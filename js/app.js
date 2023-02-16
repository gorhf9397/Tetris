import BLOCKS from "./blocks.js";

//DOM
const playground = document.querySelector(".playground > ul");
const gameText = document.querySelector(".game-text");
const scoreDisplay = document.querySelector(".score");
const restartButton = document.querySelector(".game-text > button");
//Setting
const GAME_ROWS = 20;
const GAME_COLS = 10;

//variables
let score = 0;
let duration = 500;
let downInterval;
let tempMovingItem;

const movingItem = {
  type: "",
  direction: 3,
  top: 0,
  left: 0,
};

init();
//functions
function init() {
  // 그냥 1:1 로 넣으면 값이 바로 바뀌기때문에 Spread Operator {...} 를 활용하여 값이 변경되지 않게함
  tempMovingItem = { ...movingItem };

  for (let i = 0; i < GAME_ROWS; i++) {
    // 가로 격자 무늬를 만들어주는 for문을 세로격자무늬 만들어주는 for문에넣어주고
    prependNewLine();
  }
  // 블럭을 그려주는 renderBlocks 실행
  generateNewBlock();
}
/** 격자를 그려주는 함수 */
function prependNewLine() {
  const li = document.createElement("li");
  const ul = document.createElement("ul");
  for (let j = 0; j < GAME_COLS; j++) {
    const matrix = document.createElement("li");
    ul.prepend(matrix);
  }
  li.prepend(ul);
  playground.prepend(li);
}
/** 블록을 그려주는 함수 */
function renderBlocks(moveType = "") {
  // 디스트럭처링 을통해 movingItem 에 있는 key값을 개별적인 변수로 할당
  const { type, direction, top, left } = tempMovingItem;
  /** 움직일때 기존에 있던자리에 색이 없어지지 않기때문에 class를 추가후 나머지class 제거 */
  const movingBlock = document.querySelectorAll(".moving");
  movingBlock.forEach((moving) => {
    moving.classList.remove(type, "moving");
    // console.log(moving);
  });
  //   console.log(type, direction, top, left)
  //   console.log(BLOCKS[type][direction]);
  BLOCKS[type][direction].forEach((block) => {
    const x = block[0] + left;
    const y = block[1] + top;
    // 3항연산자 : 조건 ? 참일경우 : 거짓일경우
    const target = playground.childNodes[y]
      ? playground.childNodes[y].childNodes[0].childNodes[x]
      : null;
    /** 블럭이 밑에 떨어졌을때 블럭이 밑에있는지 없는지 판단해주는 변수 */
    const isAvailable = checkEmpty(target);
    if (isAvailable) {
      target.classList.add(type, "moving");
    } else {
      // 아닐경우 초기 좌표로 돌려놓고 다시 renderBlocks 호출(재귀함수)
      tempMovingItem = { ...movingItem };
      // 이벤트 스텍이 넘치는것을 방지
      if (moveType === "retry") {
        clearInterval(downInterval);
        showGameoverText();
      }
      setTimeout(() => {
        renderBlocks("retry");
        if (moveType === "top") {
          seizeBlock();
        }
      }, 0);
      return true;
    }
  });
  movingItem.left = left;
  movingItem.top = top;
  movingItem.direction = direction;
}
/** 바닥에닿은 블록의 움직임을 멈추는 함수 */
function seizeBlock() {
  const movingBlock = document.querySelectorAll(".moving");
  movingBlock.forEach((moving) => {
    moving.classList.remove("moving");
    moving.classList.add("seized");
    // console.log(moving);
  });
  checkMatch();
}
function checkMatch() {
  const childNodes = playground.childNodes;
  childNodes.forEach((child) => {
    let matched = true;
    child.children[0].childNodes.forEach((li) => {
      if (!li.classList.contains("seized")) {
        matched = false;
      }
    });
    if (matched) {
      child.remove();
      prependNewLine();
      score + 100;
      scoreDisplay.innerText = score;
    }
  });
  generateNewBlock();
}
function generateNewBlock() {
  clearInterval(downInterval);
  downInterval = setInterval(() => {
    moveBlock("top", 1);
  }, duration);

  // Object.entries : 객체의 반복문을 돌리기 위해 사용하는 문법
  const blockArray = Object.entries(BLOCKS);
  const randomIndex = Math.floor(Math.random() * blockArray.length);
  // console.log(blockArray);
  // blockArray.forEach(block => {
  //   console.log(block[0]);
  // })

  movingItem.type = blockArray[randomIndex][0];
  movingItem.top = 0;
  movingItem.left = 3;
  movingItem.direction = 0;
  tempMovingItem = { ...movingItem };
  renderBlocks();
}
/** 블럭이 밑에 떨어졌을때 블럭이 밑에있는지 없는지 boolean 판단해주는 함수 */
function checkEmpty(target) {
  // contains : 클래스를 가지고있는지 확인
  if (!target || target.classList.contains("seized")) {
    return false;
  }
  return true;
}
/** 블록에 위치를 좌우 하 로 바꿔주는 함수 */
function moveBlock(moveType, amount) {
  tempMovingItem[moveType] += amount;
  renderBlocks(moveType);
}
/** 블럭에 모양을 바꿔주는 함수 */
function changeDirection() {
  const direction = tempMovingItem.direction;
  direction === 3
    ? (tempMovingItem.direction = 0)
    : (tempMovingItem.direction += 1);
  // 깔끔하게 하기위해 삼항연산자 사용
  //   tempMovingItem.direction += 1;
  //   if (tempMovingItem.direction === 4) {
  //     tempMovingItem.direction = 0;
  //   }
  renderBlocks();
}
function dropBlock() {
  clearInterval(downInterval);
  downInterval = setInterval(() => {
    moveBlock("top", 1);
  }, 20);
}
function showGameoverText() {
  gameText.style.display = "flex";
}
//event Handleing
document.addEventListener("keydown", (e) => {
  switch (e.keyCode) {
    case 39:
      moveBlock("left", 1);
      break;
    case 37:
      moveBlock("left", -1);
      break;
    case 40:
      moveBlock("top", 1);
      break;
    case 38:
      changeDirection();
      break;
    case 32:
      dropBlock();
      break;
    default:
      break;
  }
});

restartButton.addEventListener("click", () => {
  playground.innerHTML = "";
  gameText.style.display = "none";
  init();
});
