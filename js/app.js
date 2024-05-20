'use strict'

const WALL = 'WALL'
const FLOOR = 'FLOOR'
const BALL = 'BALL'
const GAMER = 'GAMER'
const GLUE = 'GLUE'

const GAMER_IMG = '<img src="img/gamer.png">'
const GAMER_PURPLE_IMG = '<img src="img/gamer-purple.png">'
const BALL_IMG = '<img src="img/ball.png">'
const GLUE_IMG = '<img src="img/candy.png">'

// Model:
var gBoard;
var gGamerPos;
var gBallCounter;
var gBallInterval;
var gBallScore;
var gGameOver;
var gGlueInterval;
var gIsStuck;

function onInitGame() {
    gGamerPos = { i: 2, j: 9 };
    gIsStuck = false
    gGameOver = false;
    gBoard = buildBoard();
    renderBoard(gBoard);
    onCloseModal();
    countBalls();
    gBallInterval = setInterval(addNewBall, 2000);
    gGlueInterval = setInterval(addGlue, 5000);
    gBallScore = 0;
    gBallCounter = 2;
    getScore();
}

function buildBoard() {
    // Create the Matrix 10 * 12 
    const board = createMat(10, 12)
    // Put FLOOR everywhere and WALL at edges 
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            board[i][j] = { type: FLOOR, gameElement: null }
            if ((i === 0 && j !== 3) ||
                (i === board.length - 1 && j !== 3) ||
                (j === 0 && i !== 3) ||
                (j === board[0].length - 1 && i !== 3)) {
                board[i][j].type = WALL
            }
        }
    }

    // Place the gamer and two balls
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER

    board[2][4].gameElement = BALL
    board[7][6].gameElement = BALL

    console.table(board)
    return board
}

// Render the board to an HTML table
function renderBoard(board) {

    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j] // {type,gameElement}

            var cellClass = getClassName({ i: i, j: j }) // 'cell-0-0'

            if (currCell.type === FLOOR) cellClass += ' floor' // 'cell-0-0 floor'
            else if (currCell.type === WALL) cellClass += ' wall' // 'cell-0-0 wall'

            strHTML += '<td class="cell ' + cellClass + '"  onclick="moveTo(' + i + ',' + j + ')" >'

            if (currCell.gameElement === GAMER) {
                strHTML += GAMER_IMG
            } else if (currCell.gameElement === BALL) {
                strHTML += BALL_IMG
            }

            strHTML += '</td>'
        }
        strHTML += '</tr>'
    }

    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

// Move the player to a specific location
function moveTo(i, j) {
    console.log('i, j:', i, j)
    if (gIsStuck) return
    if (gGameOver) return;

    if (i === -1) i = gBoard.length - 1;
    if (i === gBoard.length) i = 0;
    if (j === -1) j = gBoard[0].length - 1;
    if (j === gBoard[0].length) j = 0;

    console.log(i, j)
    const targetCell = gBoard[i][j]
    console.log(targetCell);
    if (targetCell.type === WALL) return

    // Calculate distance to make sure we are moving to a neighbor cell
    const iAbsDiff = Math.abs(i - gGamerPos.i) // 1 ,2..
    const jAbsDiff = Math.abs(j - gGamerPos.j) // 1 ,7...
    console.log(iAbsDiff, jAbsDiff);
    // If the clicked Cell is one of the four allowed
    if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0) ||
        (iAbsDiff === gBoard.length - 1) || (jAbsDiff === gBoard[0].length - 1)) {
        console.log('MOVE')
        if (targetCell.gameElement === BALL) {
            gBallCounter--;
            if (gBallCounter === 0) {
                gameOver();
            }
            var audio = new Audio("../audio/audio.wav");
            audio.play();
            gBallScore++;
            getScore();
            console.log('Collecting!');
        } else if (targetCell.gameElement === GLUE) {
            gIsStuck = true;
            setTimeout(() => {
                gIsStuck = false;
            }, 3000);
            var audio = new Audio("../audio/audio2.wav");
            audio.play();
        }

        // Move the gamer
        // Moving from current position:
        // Model:
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null

        // Dom:
        renderCell(gGamerPos, '')

        // Moving to selected position:
        // Model:
        gBoard[i][j].gameElement = GAMER
        gGamerPos.i = i
        gGamerPos.j = j
        countBalls()
        // Dom:
        var gamerIcon = gIsStuck ? GAMER_PURPLE_IMG : GAMER_IMG
        renderCell(gGamerPos, gamerIcon)

    } else console.log('TOO FAR', iAbsDiff, jAbsDiff)

}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    const cellSelector = '.' + getClassName(location)
    const elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value
}

// Move the player by keyboard arrows
function onHandleKey(event) {
    // console.log('event:', event)
    const i = gGamerPos.i // 2
    const j = gGamerPos.j // 9

    switch (event.key) {
        case 'ArrowLeft':
            moveTo(i, j - 1)
            break
        case 'ArrowRight':
            moveTo(i, j + 1)
            break
        case 'ArrowUp':
            moveTo(i - 1, j)
            break
        case 'ArrowDown':
            moveTo(i + 1, j)
            break
    }
}

// Returns the class name for a specific cell
function getClassName(location) { // {i:2,j:4}
    const cellClass = `cell-${location.i}-${location.j}` // 'cell-2-4'
    return cellClass
}

function getScore() {
    var elSpan = document.querySelector('.score span');
    elSpan.innerHTML = gBallScore;
    console.log(gBallScore);
}

function addNewBall() {
    var emptyPos = getEmptyCell();
    if (!emptyPos) return;
    var cell = gBoard[emptyPos.i][emptyPos.j];
    cell.gameElement = BALL;
    renderCell(emptyPos, BALL_IMG);
    countBalls()
    gBallCounter++;
}

function addGlue() {
    var emptyPos = getEmptyCell();
    if (!emptyPos) return;
    var cell = gBoard[emptyPos.i][emptyPos.j];
    cell.gameElement = GLUE;
    renderCell(emptyPos, GLUE_IMG);
    setTimeout(() => {
        if (cell.gameElement === GLUE) {
            cell.gameElement = null
            renderCell(emptyPos, '');
        }
    }, 3000);
}

function inStuck(pos) {
    gIsStuck = true;
    setTimeout(() => {
        renderCell(pos, GAMER_PURPLE_IMG);
        gIsStuck = false;
    }, 3000);
}

function countBalls() {
    var ballsCount = 0
    // console.log(gGamerPos);
    for (var i = gGamerPos.i - 1; i <= (gGamerPos.i + 1); i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = gGamerPos.j - 1; j <= (gGamerPos.j + 1); j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            // console.log(i,j, gBoard[i][j]);
            if (gBoard[i][j].gameElement === BALL) {
                ballsCount++
                // console.log(ballsCount);
            }
        }
    }
    var elSpan = document.querySelector('.nbc span');
    elSpan.innerHTML = ballsCount;
    console.log(ballsCount);
}

function gameOver() {
    clearInterval(gBallInterval);
    clearInterval(gGlueInterval);
    gGameOver = true;
    onOpenModal();
}

function getEmptyCell() {
    var emptyCells = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j];
            if (!cell.gameElement && cell.type === FLOOR) {
                var pos = { i, j };
                emptyCells.push(pos);
            }
        }
    }
    var randIdx = getRandomInt(0, emptyCells.length);
    return emptyCells[randIdx];
}

function onOpenModal() {
    var elModal = document.querySelector('.modal');
    elModal.style.display = 'block';
}

function onCloseModal() {
    var elModal = document.querySelector('.modal');
    elModal.style.display = 'none';
}