'use strict'

// pos - object {i: i, j: j}

const MINE = '💣';
const HIDE = ' ';
const FLAG = '🚩';
const LIVE = '❤️';

var gIsFirstClick;
var gFirstPos;
var gTimeInterval;
var gLives;
var gCountFlags;
var countClicksOnNumbers;

var gLevel = {
    SIZE: 4,
    MINES: 2
};

var gBoard;

function initGame() {
    if (gTimeInterval) resetTimer();
    countClicksOnNumbers = 0;
    gCountFlags = 0;
    document.querySelector('.game-over-modal').style.display = "none";
    document.querySelector('.game-win-modal').style.display = "none";
    var elSmiley = document.querySelector('.play-btn');
    elSmiley.innerText = '😀';
    gLives = ['❤️', '❤️', '❤️'];
    var elLives = document.querySelector('.lives');
    elLives.innerText = 'Lives:' + gLives.toString();
    gBoard = buildBoard();
    console.table(gBoard);
    gIsFirstClick = true;
    renderBoard(gBoard);
}

function setDifficulty(elBtn) {
    var elBoard = document.querySelector('.board');
    switch (elBtn.name) {
        case 'Begginer':
            gLevel.SIZE = 4;
            gLevel.MINES = 2;
            elBoard.id = 'small';
            initGame();
            break;
        case 'Medium':
            gLevel.SIZE = 8;
            gLevel.MINES = 12;
            elBoard.id = 'medium';
            initGame();
            break;
        case 'Expert':
            gLevel.SIZE = 12;
            gLevel.MINES = 30;
            elBoard.id = 'large';
            initGame();
            break;
    }
}

function buildBoard() {
    var board = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            };
        };
    }
    return board;
}

function updateCountMines(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var pos = { i: i, j: j };
            var count = setMinesNegsCount(board, pos);
            board[i][j].minesAroundCount = count;
        }
    }
}

function setMinesNegsCount(board, pos) {
    var countMines = 0;
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (pos.i === i && pos.j === j) continue;
            var cell = board[i][j];
            if (cell.isMine === true) {
                countMines++;
            }
        }
    }
    return countMines;
}

function placeMines(board) {
    var emptyPoses = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            var cell = board[i][j];
            var pos = { i: i, j: j };
            if (board[i][j].isShown === true || (pos.i === gFirstPos.i && pos.j === gFirstPos.j)) continue;
            else emptyPoses.push(pos);
        }
    }
    for (var i = 0; i < gLevel.MINES; i++) {
        var randPos = emptyPoses[getRandomIntInclusive(0, emptyPoses.length - 1)];
        board[randPos.i][randPos.j].isMine = true;
    }
}


function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}

function renderBoard(board) {
    var elBoard = document.querySelector('.board');
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];
            var pos = { i: gBoard[i], j: gBoard[j] };
            var cellClass = getClassName({ i: i, j: j })

            strHTML += '\t<td class="cell ' + cellClass + ' " oncontextmenu = "cellMarked(event,' + i + ',' + j + ')" onclick="cellClicked(' + i + ',' + j + ')">\n';

            if (!currCell.isShown && currCell.isMarked) {
                strHTML += FLAG;
            } else if (!currCell.isShown) {
                strHTML += HIDE;
            } else if (!currCell.isMine) {
                strHTML += currCell.minesAroundCount;
            } else if (currCell.isShown && currCell.isMine) {
                strHTML += MINE;
            }
            strHTML += '\t</td>\n';
        }
        strHTML += '</tr>\n';
    }
    elBoard.innerHTML = strHTML;
}

function cellClicked(i, j) {
    var currCell = gBoard[i][j];
    var pos = { i: i, j: j };

    if (gIsFirstClick) {
        timer();
        countClicksOnNumbers++;
        gFirstPos = pos;
        placeMines(gBoard);
        updateCountMines(gBoard);
        console.log(gFirstPos);
        renderBoard(gBoard);
        currCell.isShown = true;
        if (currCell.minesAroundCount === 0) expandShown(pos);
        renderBoard(gBoard);
        gIsFirstClick = false;
        return;
    }

    if (currCell.isShown) return;
    else currCell.isShown = true;
    if (currCell.isMarked) gCountFlags--;

    if (currCell.isMine) {
        if (gLives.length > 1) {
            loseLife();
            gCountFlags++;
        } else gameOver();
    } else if (currCell.minesAroundCount === 0) {
        countClicksOnNumbers++;
        expandShown(pos);
    } else {
        countClicksOnNumbers++;
    }
    if (checkGameOver()) gameWin();
    renderBoard(gBoard);
}

function cellMarked(event, i, j) {
    gCountFlags++;
    event.preventDefault();
    event.stopPropagation();
    var currCell = gBoard[i][j];
    if (currCell.isMarked) return;
    currCell.isMarked = true;
    if (checkGameOver()) gameWin();
    renderBoard(gBoard);
}

function expandShown(pos) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue;
            if (pos.i === i && pos.j === j) continue;
            var currCell = gBoard[i][j];
            if (currCell.isMine || currCell.isMarked || currCell.isShown) return;
            else {
                currCell.isShown = true;
                countClicksOnNumbers++;
            }
        }
    }
}

function loseLife() {
    var elLives = document.querySelector('.lives');
    gLives.pop();
    elLives.innerText = 'Lives: ' + gLives.toString();
}

function checkGameOver() {
    var isAllClicked = (countClicksOnNumbers === (gLevel.SIZE ** 2) - gLevel.MINES);
    var isAllMinesFlagged = (gCountFlags === gLevel.MINES);
    if (isAllClicked && isAllMinesFlagged) return true;
}

function gameWin() {
    var elSmiley = document.querySelector('.play-btn');
    elSmiley.innerText = '😎';
    document.querySelector('.game-win-modal').style.display = "block";
    clearInterval(gTimeInterval);
}

function gameOver() {
    var elLives = document.querySelector('.lives')
    elLives.innerText = 'Your life is over!';
    var elSmiley = document.querySelector('.play-btn');
    elSmiley.innerText = '😨';
    document.querySelector('.game-over-modal').style.display = "block";
    clearInterval(gTimeInterval);
}

function timer() {
    var elTimer = document.querySelector(".timer");
    var milisec = 0;
    var sec = 0;
    gTimeInterval = setInterval(function() {
        if (milisec === 100) {
            sec += 1;
            milisec = 0;
        }
        elTimer.innerText = sec + '.' + milisec;
        milisec++;
    }, 10)
}

function resetTimer() {
    var elTimer = document.querySelector(".timer");
    clearInterval(gTimeInterval)
    elTimer.innerText = '0.00';
}