// פונקציה למציאת שכנים במטריצה

// function countNegsAround(pos, mat) { 
//     for (var i = pos.i - 1; i <= pos.i + 1; i++) {
//         if (i < 0 || i >= mat.length) continue;
//         for (var j = pos.j - 1; j <= pos.j + 1; j++) {
//             if (j < 0 || j >= mat[i].length) continue;
//             if (pos.i === i && pos.j === j) continue;
//             var cell = mat[i][j];
//         }    
//     }    
// }   


// function getRandPos() { // פונקציה שמחזירה מיקום רנדומלי במטריצה
//     var emptyPoses = [];
//     for (var i = 0; i < gBoard.length; i++) {
//         for (var j = 0; j < gBoard[i].length; j++) {
//             var cell = gBoard[i][j];
//             var pos = { i: i, j: j };
//             emptyPoses.push(pos);
//         }
//     }
//     var randPos = emptyPoses[getRndInteger(0, emptyPoses.length - 1)];
//     console.log(randPos);
// }


// function printMat(mat, selector) {
//     var strHTML = '<table border="0"><tbody>';
//     for (var i = 0; i < mat.length; i++) {
//         strHTML += '<tr>';
//         for (var j = 0; j < mat[0].length; j++) {
//             var cell = mat[i][j];
//             var className = 'cell cell' + i + '-' + j;
//             strHTML += '<td class="' + className + '"> ' + cell + ' </td>'
//         }
//         strHTML += '</tr>'
//     }
//     strHTML += '</tbody></table>';
//     var elContainer = document.querySelector(selector);
//     elContainer.innerHTML = strHTML;
// }

function renderBoard(board) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];

            var cellClass = getClassName({ i: i, j: j })

            // if (currCell.type === FLOOR) cellClass += ' floor';
            // else if (currCell.type === WALL) cellClass += ' wall';

            strHTML += '\t<td class="cell ' + cellClass + '"  onclick="moveTo(' + i + ',' + j + ')" >\n';

            // if (currCell.gameElement === GAMER) {
            //     strHTML += GAMER_IMG;
            // } else if (currCell.gameElement === BALL) {
            //     strHTML += BALL_IMG;
            // }

            strHTML += '\t</td>\n';
        }
        strHTML += '</tr>\n';
    }
    // console.log('strHTML is:');
    // console.log(strHTML);
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}



// location such as: {i: 2, j: 7}
function renderCell(location, value) {
    // Select the elCell and set the value
    var elCell = document.querySelector(`.cell${location.i}-${location.j}`);
    elCell.innerHTML = value;
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}