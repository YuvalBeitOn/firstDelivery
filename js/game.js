'use strict'

// Step2 – counting neighbors:
// 1. Create setMinesNegsCount() and store the numbers (isShown is still true)
// 2. Present the board with the neighbor count and the mines using renderBoard() function.
// 3. Have a console.log presenting the board content – to help you with debugging


const MINE = '💣';
const HIDE = '🔲';
const FLAG = '🚩';

var gLevel = {
    SIZE: 4,
    MINES: 2
};

var gBoard;
var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
};

function initGame() {
    gBoard = buildBoard();
    placeMines(gBoard);
    updateCountMines(gBoard);
    renderBoard(gBoard);
}

function buildBoard() {
    // Builds the board
    // setDifficulty();
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
    console.table(board);
    // updateCountMines(board);
    return board;

    // Set mines at random locations
    // Call setMinesNegsCount()
    // Return the created board
}

function placeMines(board) {
    var emptyPoses = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            var cell = board[i][j];
            var pos = { i: i, j: j };
            emptyPoses.push(pos);
        }
    }
    for (var i = 0; i < gLevel.MINES; i++) {
        var randPos = emptyPoses[getRandomIntInclusive(0, emptyPoses.length)];
        board[randPos.i][randPos.j].isMine = true;
    }
}

// function expandShown(pos) { // כאשר המשתמש לוחץ על תא עם המספר 0 שאין מסביבו מוקשים
//     if (gBoard[pos.i][pos.j].minesAroundCount === 0) {
//         for (var i = pos.i - 1; i <= pos.i + 1; i++) {
//             if (i < 0 || i >= gBoard.length) continue;
//             for (var j = pos.j - 1; j <= pos.j + 1; j++) {
//                 if (j < 0 || j >= gBoard[i].length) continue;
//                 if (pos.i === i && pos.j === j) continue;
//                 var cell = gBoard[i][j];
//                 if (cell === MINE) return;
//                 else {
//                     cell.isShown = true;
//                 }
//             }
//         }
//     }
// }


function setDifficulty(elBtn) {
    switch (elBtn.name) {
        case 'Begginer':
            gLevel.SIZE = 4;
            gLevel.MINES = 2;
            initGame();
            break;
        case 'Medium':
            gLevel.SIZE = 8;
            gLevel.MINES = 12;
            initGame();
            break;
        case 'Expert':
            gLevel.SIZE = 12;
            gLevel.MINES = 30;
            initGame();
            break;
    }
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


function cellMarked(event, i, j) {
    event.preventDefault();
    event.stopPropagation();
    var currCell = gBoard[i][j];
    if (currCell.isMarked) return;
    currCell.isMarked = true;
    renderBoard(gBoard);
}

function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
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
                // board[i][j].isMine = true;
            }
        }
    }
    return countMines;
}

// console.log(setMinesNegsCount(gBoard, { i: 2, j: 3 }));

function cellClicked(i, j) {
    var currCell = gBoard[i][j];
    if (currCell.isShown) return;
    currCell.isShown = true;
    renderBoard(gBoard);
    if (currCell.isMine) {
        alert('Game over')
    }
}