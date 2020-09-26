'use strict'

const HIDE = ' ';
const MINE = '💣';
const FLAG = '🚩';
const LIVE = '❤️';
const HINT = '💡';

var gIsFirstClick;
var gFirstPos;
var gTimeInterval;
var gCountFlags;
var gCountClicksOnNumbers;
var gHints;
var gLives;
var gIsHintClicked;
var gSafeClick;
var gIsSafeClick;
var gMinesPoses;
var gScore;

var gLevel = {
    SIZE: 4,
    MINES: 2
};

var gBoard;

function initGame() {
    resetGameElemnt();
    document.querySelector('.begginer-score').innerHTML = 'Begginer: ' + localStorage.getItem('begginer-score');
    document.querySelector('.medium-score').innerHTML = 'Medium: ' + localStorage.getItem('medium-score');
    document.querySelector('.expert-score').innerHTML = 'Expert: ' + localStorage.getItem('expert-score');
    gBoard = buildBoard();
    gIsFirstClick = true;
    renderBoard(gBoard);
}

function resetGameElemnt() {
    if (gTimeInterval) resetTimer();
    gMinesPoses = [];
    gCountClicksOnNumbers = 0;
    gCountFlags = 0;
    document.querySelector('.game-over-modal').style.display = 'none';
    document.querySelector('.game-win-modal').style.display = 'none';
    var elSmiley = document.querySelector('.play-btn');
    elSmiley.innerText = '😀';
    gLives = [LIVE, LIVE, LIVE];
    var elLives = document.querySelector('.lives');
    elLives.innerText = 'Lives ' + gLives.toString();
    gIsHintClicked = false;
    gHints = [HINT, HINT, HINT];
    var elHints = document.querySelector('.hints');
    elHints.innerText = 'Hints ' + gHints.toString();
    gIsSafeClick = false;
    var elSafeClick = document.querySelector('.safe-click-btn');
    gSafeClick = 3;
    elSafeClick.innerText = `Left: ${gSafeClick}`;
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

function setMinesNegsCount(board, pos) { // pos - object {i: i, j: j}
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
        var index = emptyPoses.indexOf(randPos);
        emptyPoses.splice(index, 1);
        gMinesPoses.push(randPos);
    }
    console.log('gMinesPoses:', gMinesPoses);
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
            var pos = { i: board[i], j: board[j] };

            var cellClass = getClassName({ i: i, j: j })

            strHTML += '\t<td class="cell ' + cellClass + ' " oncontextmenu = "cellMarked(event,' + i + ',' + j + ')" onclick="cellClicked(' + i + ',' + j + ')" onclike="revealNegsHint(' + pos + ')">\n';

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

    if (currCell.isShown) return;

    if (gIsFirstClick) {
        timer();
        gCountClicksOnNumbers++;
        gFirstPos = pos;
        placeMines(gBoard);
        updateCountMines(gBoard);
        renderBoard(gBoard);
        currCell.isShown = true;
        if (currCell.minesAroundCount === 0) expandShown(pos);
        renderBoard(gBoard);
        gIsFirstClick = false;
        return;
    }

    if (gIsHintClicked && !gIsFirstClick) {
        revealNegsHint(pos);
        gIsHintClicked = false;
        return;
    } else currCell.isShown = true;


    if (currCell.isMine) {
        if (gLives.length > 1) {
            loseLife();
            gCountFlags++;
        } else gameOver();
    } else if (currCell.minesAroundCount === 0) {
        gCountClicksOnNumbers++;
        expandShown(pos);
    } else {
        gCountClicksOnNumbers++;
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
            var currPos = { i: i, j: j };
            if (currCell.isMine || currCell.isMarked || currCell.isShown) return;
            else {
                currCell.isShown = true;
                gCountClicksOnNumbers++;
                expandShown(currPos); // recursion?
            }
        }
    }
}

function loseLife() {
    var elLives = document.querySelector('.lives');
    gLives.pop();
    elLives.innerText = 'Lives ' + gLives.toString();
}

function checkGameOver() {
    var isAllClicked = (gCountClicksOnNumbers === (gLevel.SIZE ** 2) - gLevel.MINES);
    var isAllMinesFlagged = (gCountFlags === gLevel.MINES);
    if (isAllClicked && isAllMinesFlagged) return true;
}

function gameWin() {
    var elSmiley = document.querySelector('.play-btn');
    elSmiley.innerText = '😎';
    document.querySelector('.game-win-modal').style.display = 'block';
    updateBestScore();
}

function updateBestScore() {
    var elTimer = document.querySelector(".timer");
    var currScore = +elTimer.innerText;
    if (gLevel.SIZE === 4) {
        var begginerScore = +localStorage.getItem('begginer-score');
        console.log(begginerScore);
        if (begginerScore === 0 || begginercurrScore < begginerScore) {
            localStorage.setItem('begginer-score', currScore);
        }
    }
    if (gLevel.SIZE === 8) {
        var mediumScore = +localStorage.getItem('medium-score');
        console.log(mediumScore);
        if (mediumScore === 0 || currScore < mediumScore) {
            localStorage.setItem('medium-score', currScore);
        }
    }
    if (gLevel.SIZE === 12) {
        var expertScore = +localStorage.getItem('expert-score');
        console.log(expertScore);
        if (expertScore === 0 || currScore < expertScore) {
            localStorage.setItem('expert-score', currScore);
        }
    }
}

function gameOver() {
    var elLives = document.querySelector('.lives')
    elLives.innerText = 'Your life is over!';
    var elSmiley = document.querySelector('.play-btn');
    elSmiley.innerText = '😨';
    document.querySelector('.game-over-modal').style.display = 'block';
    clearInterval(gTimeInterval);
}

function loseLife() {
    var elLives = document.querySelector('.lives');
    gLives.pop();
    elLives.innerText = 'Lives ' + gLives.toString();
}

function timer() {
    var elTimer = document.querySelector('.timer');
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
    var elTimer = document.querySelector('.timer');
    clearInterval(gTimeInterval)
    elTimer.innerText = '0.00';
}

function renderHints() {
    if (gHints.length < 1) {
        var elHints = document.querySelector('.hints');
        elHints.innerText = 'No hints left';
    } else {
        var elHints = document.querySelector('.hints');
        elHints.innerText = 'Hints ' + gHints.toString();
    }
}

function hintClicked() {
    if (!gIsFirstClick && gHints.length > 0) {
        gHints.pop();
        renderHints();
        gIsHintClicked = true;
        console.log('cliked');
    }
}

function revealNegsHint(pos) {
    if (gIsHintClicked) {
        var negs = [];
        for (var i = pos.i - 1; i <= pos.i + 1; i++) {
            if (i < 0 || i >= gBoard.length) continue;
            for (var j = pos.j - 1; j <= pos.j + 1; j++) {
                if (j < 0 || j >= gBoard[i].length) continue;
                var currCell = gBoard[i][j];
                var currPos = { i: i, j: j };
                if (currCell.isShown) continue;
                else negs.push(currPos);
            }
        }
        for (var i = 0; i < negs.length; i++) {
            currPos = negs[i];
            currCell = gBoard[currPos.i][currPos.j];
            currCell.isShown = true;
            renderBoard(gBoard);
        }
        for (var i = 0; i < negs.length; i++) {
            currPos = negs[i];
            currCell = gBoard[currPos.i][currPos.j];
            setTimeout(function() {
                for (var i = 0; i < negs.length; i++) {
                    currPos = negs[i];
                    currCell = gBoard[currPos.i][currPos.j];
                    currCell.isShown = false;
                    renderBoard(gBoard);
                }
            }, 1500);
        }
    }
    gIsHintClicked = false;
}


function safeClick() {
    if (gSafeClick > 0) {
        gIsSafeClick = true;
        gSafeClick--;
        renderSafeClicks();
        var safePoses = []
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[i].length; j++) {
                var cell = gBoard[i][j];
                var pos = { i: i, j: j };
                if (gMinesPoses.some(pos => pos.i === i && pos.j === j)) continue;
                else {
                    safePoses.push(pos);
                }
            }
        }
        for (var i = 0; i < safePoses.length; i++) {
            var randPos = safePoses[getRandomIntInclusive(0, safePoses.length - 1)];
            var safeCell = gBoard[randPos.i][randPos.j];
            if (safeCell.isShown) continue;
            else {
                var cellClass = getClassName(randPos);
                var elCell = document.querySelector('.' + cellClass);
                console.log(elCell);
                elCell.classList.add('safe');
                setTimeout(function() {
                    elCell.classList.remove('safe');
                    gIsSafeClick = false;
                }, 1000);
                return;
            }
        }
    }
}


function renderSafeClicks() {
    var elSafeClick = document.querySelector('.safe-click-btn');
    if (gSafeClick > 0) {
        elSafeClick.innerText = `Left: ${gSafeClick}`;
    } else {
        elSafeClick.innerText = 'No more safe clicks';
    }
}