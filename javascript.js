

const main = document.getElementById('main');
const mainScoreDiv = document.getElementById('scoreDiv');
const scoreSpan = document.getElementById('score');

const losingDiv = document.getElementById('losingDiv');
const sizeDiv = document.getElementById('sizeDiv');
const sizeSpan = document.getElementById('sizeSpan');
const size = document.getElementById('size');
const restartButton = document.getElementById('restartButton');
const scoreSpan_inLosingDiv = document.getElementById('scoreSpan');
let score_element = document.getElementById('score_InLosingDiv');
const highestScoreSpan = document.getElementById('highestScoreSpan');
let highestScore_element = document.getElementById('highestScore');

const losing_pausingDiv = document.getElementById('losing_pausingDiv');

const snakePartDiameter = 15;

let width = getAdjustedSize(420), height = getAdjustedSize(285), radius = 10;
//let width = 420, height = 280, radius = 10;
let snakeParts = [], direction = '';
let currentDot, dotTop, dotLeft;
let score = 0, highestScore = 0;
let addPart = false;
const stepValue = (radius + 5);
let timeBetweenEachFrameInMilliSeconds = AssignTimeBetweenEachFrameInMilliSeconds();

let headBackgroundColor = '#cccccc', partsBackGroundColor = 'gray', dotColor = '#ff8686';

const maximumAmountOfPausesAllowed = 4; // + 1 =>> 0 -> max = max + 1
let pausesAmount = 0;

let movement = setInterval(()=> draw(), timeBetweenEachFrameInMilliSeconds);
let gameIsPaused = false, losingDivIsVisible = false;
let restarting = false;

let enable_Pauses_Checking = false;

function stopMovement() {
    clearInterval(movement);
}

document.addEventListener('keydown', e=> {
    /*console.log('key value: ' + e.which);
    console.log('key name: ' + e.key);*/
    if(enable_Pauses_Checking && restarting) {
        return;
    }
    if(e.key == 'Escape') {
        if(gameIsPaused) {
            resume();
            resumeMovement();
        } else {
            pause();
        }
    } else if((e.key == 'r' || e.key == 'R') && losingDivIsVisible) {
        restart();
    } else if((e.key == 'p' || e.key == 'P') && !gameIsPaused && !losingDivIsVisible) {
        pause();
    }

    if(gameIsPaused) {
        /*if(e.key.toString() == '1') {
            resume();
            resumeMovement();
        } else if(e.key.toString() == '2') {
            restart();
        } else {
            return;
        }*/
        return;
    }
    let keyValue = e.which;
    let movementByLetters = false, lettersDirection;
    const customizationBoxDisplay = document.getElementById('customizationsDiv').style.display;
    if(customizationBoxDisplay != 'flex') {
        if(keyValue == 87) {
            movementByLetters = true;
            lettersDirection = 'Up';
        } else if(keyValue == 68) {
            movementByLetters = true;
            lettersDirection = 'Right';
        } else if(keyValue == 83) {
            movementByLetters = true;
            lettersDirection = 'Down';
        } else if(keyValue == 65) {
            movementByLetters = true;
            lettersDirection = 'Left';
        }
    }
    //console.log(e.which, e.key);
    if((e.which >= 37 && e.which <= 40) || movementByLetters) {
        
        let keyPressed;
        if(movementByLetters) {
            keyPressed = lettersDirection;
        } else {
            keyPressed = e.key.substring(5);
        }
        if(snakeParts.length == 1) {
            direction = keyPressed;
            return;
        }
        let headTop = convertToNumber(snakeParts[0].style.top), headLeft = convertToNumber(snakeParts[0].style.left)
            , secondTop = convertToNumber(snakeParts[1].style.top), secondLeft = convertToNumber(snakeParts[1].style.left);
        if(((keyPressed == 'Up' && headTop - stepValue == secondTop)
                || (keyPressed == 'Right' && headLeft + stepValue == secondLeft)
                    || (keyPressed == 'Down' && headTop + stepValue == secondTop)
                        || (keyPressed == 'Left' && headLeft - stepValue == secondLeft))) {
        } else {
            direction = keyPressed;
        }
        //draw();
    }/* else {
        if((e.key == 'r' || e.key == 'R')) {
                restart();
        }
    }*/
});

restartButton.addEventListener('click', ()=> {
    restart();
});

function setup() {
    
    main.style.width = width + 'px';
    main.style.height = height + 'px';
    createDot();
    createSnake();
    snakeParts.forEach(part=> {
        main.appendChild(part);
    });
    updateScore();
    console.log(timeBetweenEachFrameInMilliSeconds);
}

function draw() {
    if(direction !== '') {
        move();
        if(checkIfSnakesHeadHitsOneOfSnakesPart() 
                || checkIfSnakesHeadHitsTheBorders()) {
            handle_Losing();
            return;
        }
        reassignHeadsBackgroundColor();
        if(checkIfHeadsHitsTheDot()) {
            handle_HittingTheDot();
        }
    }
}
setup();
//draw();



function randomNumber(min, max) {
    return Math.floor(min + (max-min)*Math.random());
}


function createDot() {
    currentDot = createDiv();
    const diameter = 15 - 5;
    currentDot.style.opacity = 0;
    currentDot.className = 'dot-style';
    currentDot.style.backgroundColor = dotColor;
    let newDot_Left = randomNumber(diameter, width - diameter)
        , newDot_Top = randomNumber(diameter, height - diameter);
    let dotIsUnderPart = checkIfThisDotIsUnderPartOfTheSnake(newDot_Left, newDot_Top);
    while(dotIsUnderPart) {
        newDot_Left = randomNumber(diameter, width - diameter);
        newDot_Top = randomNumber(diameter, height - diameter);
        dotIsUnderPart = checkIfThisDotIsUnderPartOfTheSnake(newDot_Left, newDot_Top);
    }
    dotLeft = newDot_Left;
    dotTop = newDot_Top;
    currentDot.style.top = dotTop;
    currentDot.style.left = dotLeft;
    currentDot.style.opacity = 1;
}

function checkIfThisDotIsUnderPartOfTheSnake(newDot_left, newDot_top) {
    const diameter = 15-3;
    for (let i = 0; i < snakeParts.length; i++) {
        let part = snakeParts[i],
            partTop = convertToNumber(part.style.top), partLeft = convertToNumber(part.style.left)
            , lowestLeft = partLeft - diameter/1.2
            , highestLeft = partLeft + diameter
            , lowestTop = partTop - diameter/1.2
            , highestTop = partTop + diameter;
        if(newDot_left >= lowestLeft && newDot_left <= highestLeft
            && (newDot_top >= lowestTop && newDot_top <= highestTop)) {
                return true;
        }
        /*console.log(partTop, partLeft);
        console.log(lowestLeft, highestLeft);
        console.log(lowestTop, highestTop);
        console.log(newDot_left, newDot_top);
        console.log('x');*/

    }
    return false;
}

function createDiv() {
    let newDiv = document.createElement('div');
    main.appendChild(newDiv);    
    return newDiv;
}

function createSnake() {
    let diameter = 15 - 1;
    const snakePartsAmount = 2;
    for(let i=0; i < snakePartsAmount; i++) {
        let part = createDiv();
        part.className = 'snakeParts-style';
        part.style.background = 'none';
        if(i == 0) {
            part.style.backgroundColor = headBackgroundColor;
        } else {
            part.style.backgroundColor = partsBackGroundColor;
        }
        //part.style.top = (height/2 + (diameter)*i)-45;
        //part.style.left = width/2 + 5;

        part.style.top = getAdjustedSize((height - (snakePartsAmount - i) * 15));
        part.style.left = getAdjustedSize(Math.floor(width / 2));
        
        /*let numberSpan = document.createElement('span');
        numberSpan.className = 'span-style';
        numberSpan.textContent = i;
        part.appendChild(numberSpan);*/
        snakeParts.push(part);
    }
}

function move() {
    let newSnakeParts = [];
    let lastPartToRemove = snakeParts[snakeParts.length-1];
    if(!addPart) {
        main.removeChild(lastPartToRemove);
        snakeParts.pop();
    } else {
        addPart = false;
    }
    let newHead = createDiv();
    newHead.className = 'snakeParts-style';

    if(direction == 'Up') {
        newHead.style.top = convertToNumber(snakeParts[0].style.top) - stepValue;
        newHead.style.left = snakeParts[0].style.left;
    } else if(direction == 'Right') {
        newHead.style.top = snakeParts[0].style.top;
        newHead.style.left = convertToNumber(snakeParts[0].style.left) + stepValue;
    } else if(direction == 'Down') {
        newHead.style.top = convertToNumber(snakeParts[0].style.top) + stepValue;
        newHead.style.left = snakeParts[0].style.left;
    } else if(direction == 'Left') {
        newHead.style.top = snakeParts[0].style.top;
        newHead.style.left = convertToNumber(snakeParts[0].style.left) - stepValue;
    }

    main.appendChild(newHead);
    newSnakeParts.push(newHead);

    for(let i=0; i<snakeParts.length; i++) {
        snakeParts[i].style.backgroundColor = partsBackGroundColor;
        newSnakeParts.push(snakeParts[i]);
    }
    snakeParts = newSnakeParts;
}

function checkIfSnakesHeadHitsOneOfSnakesPart() {
    let head = snakeParts[0];
    for(let i=1; i<snakeParts.length; i++) {
        let currentPart = snakeParts[i];
        if(convertToNumber(head.style.left) == convertToNumber(currentPart.style.left)
            && convertToNumber(head.style.top) == convertToNumber(currentPart.style.top)) {
                currentPart.style.backgroundColor = 'red';
                head.style.backgroundColor = 'red';
                return true;
        }
    }
}

function checkIfSnakesHeadHitsTheBorders() {
    const head = snakeParts[0], headLeft = convertToNumber(head.style.left), headTop = convertToNumber(head.style.top);
    //console.log(headLeft, headTop);
    if(headLeft < 0 || headLeft > width - snakePartDiameter 
        || headTop < 0 || headTop > height - snakePartDiameter ) {
            head.style.backgroundColor = 'red';
            //snakeParts[1].style.backgroundColor = partsBackGroundColor;
            return true;
    }
    return false;
}

function reassignHeadsBackgroundColor() {
    let head = snakeParts[0];
    head.style.backgroundColor = headBackgroundColor;
}

//handle_HeadAndPart_Crash()
function handle_Losing() {
    stopMovement();
    main.style.animation = 'mainOpacity_losingDivPopIn ease-out 0s forwards';

    checkIfThisIsTheHighestScore();
    popInLosingDiv();
}

function checkIfHeadsHitsTheDot() {
    let diameter = 15-2;
    let head = snakeParts[0], headLeft = convertToNumber(head.style.left), headTop = convertToNumber(head.style.top)
    , lowestLeft = headLeft - diameter
    , highestLeft = headLeft + diameter
    , lowestTop = headTop - diameter
    , highestTop = headTop + diameter;
    /*console.log(lowestLeft, highestLeft);
    console.log(lowestTop, highestTop);
    console.log(dotLeft, dotTop);*/
    if(dotLeft >= lowestLeft && dotLeft <= highestLeft
        && (dotTop >= lowestTop && dotTop <= highestTop)) {
            return true;
    }
    return false;
}

function updateScore() {
    scoreSpan.textContent = score;
}

function handle_HittingTheDot() {
    score++;
    addPart = true;
    updateScore();
    main.removeChild(currentDot);
    createDot();
}

function checkIfThisIsTheHighestScore() {
    if(score > highestScore) {
        highestScore = score;
    }
}

function popInLosingDiv() {
    mainScoreDiv.style.animation = 'popOut ease-out 1s forwards';
    losingDiv.style.display = 'flex';
    losingDiv.style.animation = 'popInLosingDiv ease-in-out 1.2s forwards';
    losingDivIsVisible = true;
    sizeDiv.style.animation = 'popIn ease-in 1.1s forwards 1.1s';
    losingDiv_pausingCheckerPopIn();
    scoreSpan_inLosingDiv.style.animation = 'popIn ease-in 1s forwards 1.1s';
    score_element.textContent = score;
    score_element.style.animation = 'popIn ease-in 1s forwards 1.1s';
    highestScoreSpan.style.animation = 'popIn ease-in 1s forwards 1.1s';
    highestScore_element.style.animation = 'popIn ease-in 1s forwards 1.1s';
    highestScore_element.textContent = highestScore;
    restartButton.style.animation = 'popIn ease-in 1s forwards 1.1s';
    setTimeout(()=> {
        restartButton.style.cursor = 'pointer';
    }, 1100);

    size.textContent = width + 'x' + height;
}

function popOutLosingDiv() {
    mainScoreDiv.style.animation = 'popIn ease-in 1.2s forwards';
    sizeDiv.style.animation = 'popOut ease-out 1.1s forwards';
    losingDiv_pausingCheckerPopOut();
    restartButton.style.animation = 'popOut ease-out 1.1s forwards';
    restartButton.style.cursor = 'unset';
    scoreSpan_inLosingDiv.style.animation = 'popOut ease-out 1.1s forwards';
    losingDivIsVisible = false;
    score_element.style.animation = 'popOut ease-out 1.1s forwards';
    highestScoreSpan.style.animation = 'popOut ease-out 1.1s forwards';
    highestScore_element.style.animation = 'popOut ease-out 1.1s forwards';
    losingDiv.style.animation = 'popOut ease-out 1.2s forwards 1.1s';
    /*setTimeout(() => {
        losingDiv.style.display = 'none';
    }, 1200);*/

    /*losingDiv.style.pointerEvents = 'none';
    losingDiv.style.visibility = 'hidden';
    losingDiv.style.opacity = 0;
    restartButton.style.opacity = 0;
    scoreSpan_inLosingDiv.style.opacity = 0;
    score_element.style.opacity = 0;
    highestScoreSpan.style.opacity = 0;
    highestScore_element.style.opacity = 0;*/
}

//the variable showPausingChecker can be defined using the console.
function losingDiv_pausingCheckerPopIn() {
    try {
        if(showPausingChecker) {
            losing_pausingDiv.style.animation = 'popIn ease-in 1.1s forwards 1.1s';
        }
    } 
    catch {}
}

function losingDiv_pausingCheckerPopOut() {
    try {
        if(showPausingChecker) {
            losing_pausingDiv.style.animation = 'popOut ease-out 1.1s forwards';
        }
    } 
    catch {}
}

function restart() {
    if(gameIsPaused) {
        resume();
    }
    popOutLosingDiv();
    score = 0;
    snakeParts.forEach(part=> {
        main.removeChild(part);
    });
    main.removeChild(currentDot);
    main.style.animation = 'mainOpacity_losingDivPopOut ease-in 0s forwards';
    snakeParts = [];
    direction = '';
    stopMovement();
    setup();
    movement = reassignMovement();
}


function convertToNumber(pixeledNumber) {
    return Number(pixeledNumber.substring(0, pixeledNumber.length-2));
}


function toggle_size_box() {
    const sizeAdjustmentBox = document.getElementById('sizeAdjustmentDiv');
    const customizationBox = document.getElementById('customizationsDiv');
    let boxDisplay = sizeAdjustmentBox.style.display;
    //console.log(boxDisplay);
    if(boxDisplay != '' && boxDisplay != 'none') {
        sizeAdjustmentBox.style.display = 'none';
    } else {
        customizationBox.style.display = 'none';
        const currentSizeSpan = document.getElementById('currentSize');
        currentSizeSpan.textContent = width + 'x' + height;
        sizeAdjustmentBox.style.display = 'flex';
    }
}

const width_Input = document.getElementById('width');
const height_Input = document.getElementById('height');

const maxWidth = 900, maxHeight = 690;

function width_Validation(input) {
    if(input.value.length == 0) {
        return;
    }
    const numbers = '0123456789';
    let lastInput = input.value.charAt(input.value.length-1);
    if(!numbers.includes(lastInput)) {
        input.value = input.value.substring(0, input.value.length-1);
    }
    let value = Number(input.value);
    if(value > maxWidth) {
        input.value = maxWidth;
    }
}

function height_Validation(input) {
    if(input.value.length ==0) {
        return;
    }
    const numbers = '0123456789';
    let lastInput = input.value.charAt(input.value.length-1);
    if(!numbers.includes(lastInput)) {
        input.value = input.value.substring(0, input.value.length-1);
    }
    let value = Number(input.value);
    if(value > maxHeight) {
        input.value = maxHeight;
    }
}

function ColorsValidation(input) {
    if(input.value.length ==0) {
        return;
    }
    /*const unAllowed = '0123456789';
    let lastInput = input.value.charAt(input.value.length-1);
    if(!numbers.includes(lastInput) || input.value.length > 6) {
        input.value = input.value.substring(0, input.value.length-1);
    }*/
    if(input.value.length > 6) {
        input.value = input.value.substring(0, input.value.length-1);
        return;
    }
    let validLetter = /^[0-9A-F]$/i.test(input.value.charAt(input.value.length-1));
    if(!validLetter) {
        input.value = input.value.substring(0, input.value.length-1);
    }
    //console.log(/^#[0-9A-F]{1}$/i.test(input.value));
    //console.log(typeof input.value === 'string' && input.value.length === 6 && !isNaN(Number('0x' + input.value)));
    
}

function widthOnFocusOut(input, min) {
    if(input.value.length == 0) {
        return;
    }
    let value = Number(input.value);
    if(value > maxWidth) {
        input.value = maxWidth;
    } else if(value < min) {
        input.value = min;
    }
}

function heightOnFocusOut(input, min) {
    if(input.value.length == 0) {
        return;
    }
    let value = Number(input.value);
    if(value > maxHeight) {
        input.value = maxHeight;
    } else if(value < min) {
        input.value = min;
    }
}

//let noteAbout_auto_size_adjustment_didGetAlerted = false;

function adjustSize() {
    const width_Input = document.getElementById('width');
    const height_Input = document.getElementById('height');
    let newWidth = Number(width_Input.value), newHeight = Number(height_Input.value);
    if((newWidth == width && newHeight == height)
        || (width_Input.value.length == 0 && height_Input.value.length == 0)) {
        return;
    }
    let widthAdjusted = false, heightAdjusted = false;
    if(width_Input.value.length > 0) {
        if(newWidth % snakePartDiameter != 0) {
            newWidth = getAdjustedSize(newWidth);
            width_Input.value = newWidth;
            widthAdjusted = true;
        }
        width = newWidth;
    }
    if(height_Input.value.length > 0) {
        if(newHeight % snakePartDiameter != 0) {
            newHeight = getAdjustedSize(newHeight);
            height_Input.value = newHeight;
            heightAdjusted = true;
        }
        height = newHeight
    }
    if(widthAdjusted && heightAdjusted) {
        alert('Note: width and height got adjusted. new Width: ' + newWidth + ' and new Height: ' + newHeight);
    } else if(widthAdjusted) {
        alert('Note: width got adjusted. new Width: ' + newWidth);
    } else if(heightAdjusted) {
        alert('Note: height got adjusted. new Height: ' + newHeight);
    }
    main.style.width = width;
    main.style.height = height;
    const currentSizeSpan = document.getElementById('currentSize');
    currentSizeSpan.textContent = width + 'x' + height;
    score = 0;
    snakeParts.forEach(part=> {
        main.removeChild(part);
    });
    main.removeChild(currentDot);
    main.style.opacity = 1;
    snakeParts = [];
    direction = '';
    stopMovement();
    setup();
    timeBetweenEachFrameInMilliSeconds = AssignTimeBetweenEachFrameInMilliSeconds();
    if(!gameIsPaused) {
        movement = reassignMovement();
    }
}

function AssignTimeBetweenEachFrameInMilliSeconds() {
    /*timeBetweenEachFrameInMilliSeconds =*/
    return Math.pow(width*height, 0.5) / ((width + height)/100 - Math.pow((width+height)/100, 0.3));
}


function applyCustomizations() {
    let htmlBackgroundSpan = document.getElementById('pageBackgroundColorsSpan');
    let htmlBackgroundFirstColor = document.getElementById('firstPageBackgroundColor').value;
    let htmlBackgroundSecondColor = document.getElementById('secondPageBackgroundColor').value;

    let windowsBackgroundSpan = document.getElementById('gameWindowsBackgroundColorsSpan');
    let windowBackgroundFirstColor = document.getElementById('firstWindowBackgroundColor').value;
    let windowBackgroundSecondColor = document.getElementById('secondWindowBackgroundColor').value;
    
    let headNewBackgroundColorSpan = document.getElementById('headNewBackgroundColorSpan');
    let head_newBackgroundColor = document.getElementById('headBackgroundColor').value;

    let partNewBackgroundColorSpan = document.getElementById('partNewBackgroundColorSpan');
    let part_newBackgroundColor = document.getElementById('partBackgroundColor').value;

    let dotNewBackgroundColorSpan = document.getElementById('dotNewBackgroundColorSpan');
    let dot_newBackgroundColor = document.getElementById('DotBackgroundColor').value;
    
    //whole page's background-color.
    if(htmlBackgroundFirstColor.length > 0 && htmlBackgroundSecondColor.length > 0) {
        if(colorValidation(htmlBackgroundFirstColor) && colorValidation(htmlBackgroundSecondColor)) {
            document.body.style.background = 'linear-gradient(#'+htmlBackgroundFirstColor+',#'+htmlBackgroundSecondColor+')';
            htmlBackgroundSpan.style.color = 'white';
        } else {
            htmlBackgroundSpan.style.color = 'red';
        }
    } else if(htmlBackgroundFirstColor.length > 0) {
        if(colorValidation(htmlBackgroundFirstColor)) {
            document.body.style.background = 'none';
            document.body.style.backgroundColor = '#'+htmlBackgroundFirstColor;
            htmlBackgroundSpan.style.color = 'white';
        } else {
            htmlBackgroundSpan.style.color = 'red';
        }
    } else if(htmlBackgroundSecondColor.length > 0) {
        if(colorValidation(htmlBackgroundSecondColor)) {
            document.body.style.background = 'none';
            document.body.style.backgroundColor = '#' + htmlBackgroundSecondColor;
            htmlBackgroundSpan.style.color = 'white';
        } else {
            htmlBackgroundSpan.style.color = 'red';
        }
    } else {
        htmlBackgroundSpan.style.color = 'white';
    }

    //main game's window background-color.
    if(windowBackgroundFirstColor.length > 0 && windowBackgroundSecondColor.length > 0) {
        if(colorValidation(windowBackgroundFirstColor) && colorValidation(windowBackgroundSecondColor)) {
            main.style.background = 'linear-gradient(#'+windowBackgroundFirstColor+',#'+windowBackgroundSecondColor+')';
            windowsBackgroundSpan.style.color = 'white';
        } else {
            windowsBackgroundSpan.style.color = 'red';
        }
    } else if(windowBackgroundFirstColor.length > 0) {
        if(colorValidation(windowBackgroundFirstColor)) {
            main.style.background = 'none';
            main.style.backgroundColor = '#'+windowBackgroundFirstColor;
            windowsBackgroundSpan.style.color = 'white';
        } else {
            windowsBackgroundSpan.style.color = 'red';
        }
    } else if(windowBackgroundSecondColor.length > 0) {
        if(colorValidation(windowBackgroundSecondColor)) {
            main.style.background = 'none';
            main.style.backgroundColor = '#' + windowBackgroundSecondColor;
            windowsBackgroundSpan.style.color = 'white';
        } else {
            windowsBackgroundSpan.style.color = 'red';
        }
    } else {
        windowsBackgroundSpan.style.color = 'white';
    }

    if(head_newBackgroundColor.length > 0) {
        if(colorValidation(head_newBackgroundColor)) {
            headBackgroundColor = '#' + head_newBackgroundColor;
            snakeParts[0].style.backgroundColor = headBackgroundColor;
            headNewBackgroundColorSpan.style.color = 'white';
        } else {
            headNewBackgroundColorSpan.style.color = 'red';
        }
    } else {
        headNewBackgroundColorSpan.style.color = 'white';
    }

    if(part_newBackgroundColor.length > 0) {
        if(colorValidation(part_newBackgroundColor)) {
            partsBackGroundColor = '#' + part_newBackgroundColor;
            for(let i = 1; i < snakeParts.length; i++) {
                snakeParts[i].style.backgroundColor = partsBackGroundColor;
            }
            partNewBackgroundColorSpan.style.color = 'white';
        } else {
            partNewBackgroundColorSpan.style.color = 'red';
        }
    } else {
        partNewBackgroundColorSpan.style.color = 'white';
    }

    if(dot_newBackgroundColor.length > 0) {
        if(colorValidation(dot_newBackgroundColor)) {
            dotColor = '#' + dot_newBackgroundColor;
            currentDot.style.backgroundColor = dotColor;
            dotNewBackgroundColorSpan.style.color = 'white';
        } else {
            dotNewBackgroundColorSpan.style.color = 'red';
        }
    } else {
        dotNewBackgroundColorSpan.style.color = 'white';
    }
}

function colorValidation(color) {
    return /^[0-9A-F]{6}$/i.test(color);
}

function letEverythingBackToItsDefaultColor() {
    document.body.style.backgroundColor = '';
    document.body.style.background = 'linear-gradient(#111111, #013261)';
    main.style.backgroundColor = '';
    main.style.background = 'linear-gradient(#154872, #343453)';
    headBackgroundColor = '#cccccc';
    snakeParts[0].style.backgroundColor = headBackgroundColor;
    partsBackGroundColor = 'gray';
    for(let i = 1; i<snakeParts.length; i++) {
        let part = snakeParts[i];
        part.style.backgroundColor = partsBackGroundColor;
    }
    dotColor = '#ff8686';
    currentDot.style.backgroundColor = dotColor;
}

function toggle_customizations_box() {
    const customizationBox = document.getElementById('customizationsDiv');
    const sizeAdjustmentDiv = document.getElementById('sizeAdjustmentDiv');
    let boxDisplay = customizationBox.style.display;
    if(boxDisplay != '' && boxDisplay != 'none') {
        customizationBox.style.display = 'none';
    } else {
        sizeAdjustmentDiv.style.display = 'none';
        customizationBox.style.display = 'flex';
    }
}

const pauseDiv = document.getElementById('pauseDiv');
const pause_scoreInformationsDiv = document.getElementById('pause_ScoreInformations');
const pause_currentScore = document.getElementById('pause_CurrentScore');
const pause_resumeButton = document.getElementById('pause_ResumeButton');
const pause_restartButton = document.getElementById('pause_RestartButton');

function pause() {
    if(losingDivIsVisible) {
        return;
    }
    if(enable_Pauses_Checking && score > 0) {
        pausesAmount++;
        if(pausesAmount >= maximumAmountOfPausesAllowed) {
            handleRestartingThatCausedByPausing();
            return;
        }
    }
    stopMovement();
    gameIsPaused = true;

    if(enable_Pauses_Checking) {
        handlePauses_Pause();
    }

    pause_currentScore.textContent = score;
    main.style.animation = 'halfOpacity ease-out 0.5s forwards';
    mainScoreDiv.style.animation = 'popOut ease-out 0.5s forwards';
    pauseDiv.style.animation = 'popInPauseDiv ease-in 0.4s forwards';
    pause_scoreInformationsDiv.style.animation = 'popIn ease-in 0.4s forwards 0.5s';
    pause_resumeButton.style.animation = 'buttonPopIn ease-in 0.4s forwards 0.5s';
    pause_restartButton.style.animation = 'buttonPopIn ease-in 0.4s forwards 0.5s';
}

function resume() {
    if(losingDivIsVisible) {
        return;
    }
    gameIsPaused = false;

    if(enable_Pauses_Checking) {
        handlePauses_Resume();
    }

    mainScoreDiv.style.animation = 'popIn ease-in 0.5s forwards';
    main.style.animation = 'fullOpacity ease-in 0s forwards';
    pauseDiv.style.animation = 'popOut ease-out 0s forwards';
    pause_scoreInformationsDiv.style.animation = 'popOut ease-out 0s forwards';
    pause_resumeButton.style.animation = 'buttonPopOut ease-out 0s forwards';
    pause_restartButton.style.animation = 'buttonPopOut ease-out 0s forwards';
}

function reassignMovement() {
    return setInterval(()=> draw(), timeBetweenEachFrameInMilliSeconds);
}

function resumeMovement() {
    movement = reassignMovement();
}

const pause_pausesInformationsDiv = document.getElementById('pause_pausesInformationsDiv');
const pause_pausesCounter = document.getElementById('pause_pausesAmount');
const pause_WarningSpan = document.getElementById('pause_mainWarning');


function handlePauses_Pause() {
    if(pausesAmount > 0) {
        if(pausesAmount + 1 == maximumAmountOfPausesAllowed) {
            pause_pausesInformationsDiv.style.opacity = 0;
            pause_WarningSpan.style.animation = 'popIn ease-in 0.4s forwards 0.5s';
        } else {
            pause_WarningSpan.style.opacity = 0;
            pause_pausesInformationsDiv.style.animation = 'popInPausesInformationsDiv ease-in 0.4s forwards 0.5s';
            pause_pausesCounter.textContent = pausesAmount+'/'+(maximumAmountOfPausesAllowed);
        }
    }
}

function handlePauses_Resume() {
    pause_pausesInformationsDiv.style.animation = 'popOut ease-out 0s forwards';
    pause_WarningSpan.style.animation = 'popOut ease-out 0s forwards';
}

const restartingDiv_causedByPauses = document.getElementById('restartingDiv');

async function handleRestartingThatCausedByPausing() {
    restarting = true;
    stopMovement();
    restartingDiv_causedByPauses.style.display = 'block';
    main.style.animation = 'mainOpacity_losingDivPopIn ease-in 1s forwards';
    restartingDiv_causedByPauses.style.animation = 'restartingDiv_popIn ease-in 1s forwards';
    await sleep(5000 + 1000);
    main.style.animation = 'mainOpacity_losingDivPopOut ease-out 0.6s forwards';
    restartingDiv_causedByPauses.style.animation = 'restartingDiv_popOut ease-out 0.8s forwards';
    await sleep(850);
    restartingDiv_causedByPauses.style.display = 'none';
    restarting = false;
    pausesAmount = 0;
    restart();
    resume();
}

function sleep(milliSeconds) {
    return new Promise(resolve => {
        setTimeout(() => {
          resolve();
        }, milliSeconds);
      });
}

function enabling_Or_Disabling_pauses_checking(checkDiv) {
    const check_Circle = document.getElementById('losing_Check_circle');
    if(convertToNumber(check_Circle.style.left) == 2) {
        check_Circle.style.left = '16px';
        checkDiv.style.backgroundColor = '#9999997c';
        checkDiv.style.opacity = '0.8';
        
        enable_Pauses_Checking = false;
        //check_Circle.style.animation = 'unchecked_circle ease 0.3s forwards';
        //checkDiv.style.animation = 'unchecked_checkDiv ease 0.3s forwards';
    } else {
        check_Circle.style.left = '2px';
        checkDiv.style.backgroundColor = 'rgba(0, 102, 255, 0.911)';
        checkDiv.style.opacity = '1';

        enable_Pauses_Checking = true;
        //check_Circle.style.animation = 'checked_circle ease 0.3s forwards';
        //checkDiv.style.animation = 'checked_checkDiv ease 0.3s forwards';
    }
}

function generateRandomHexColorForThisInput(input) {
    const allowedComponents = '0123456789AaBbCcDdEeFf';
    let hexColor = '';
    for(let i=0; i < 6; i++) {
        hexColor+=allowedComponents.charAt(randomNumber(0, allowedComponents.length));
    }
    input.value = hexColor;
}

function generateRandomHexColorForAllColorInputs() {
    const inputs = [
        document.getElementById('firstPageBackgroundColor')
        , document.getElementById('secondPageBackgroundColor')
        , document.getElementById('firstWindowBackgroundColor')
        , document.getElementById('secondWindowBackgroundColor')
        , document.getElementById('headBackgroundColor')
        , document.getElementById('partBackgroundColor')
        , document.getElementById('DotBackgroundColor')
    ];
    inputs.forEach(input=> {
        generateRandomHexColorForThisInput(input);
    });
}

function getAdjustedSize(size) {
    if(size % snakePartDiameter == 0) {
        return size;
    }
    let remainedValue = size % snakePartDiameter;
    if(remainedValue < snakePartDiameter / 2) {
        return size - remainedValue;
    }
    return size + snakePartDiameter - remainedValue;
}

/*this.addEventListener('resize', ()=> {
    let currentWidth = Number(window.innerWidth);
    //console.log(currentWidth);
    //console.log(losingDiv.clientWidth);
    if(losingDivIsVisible && Number(losingDiv.clientWidth) > currentWidth) {
        losingDiv.style.width = Number(currentWidth - 10) + 'px';
        console.log(15);
        console.log(losingDiv.style.width);
    }
});*/

let showAdjustmentButtons_button = document.querySelector('#showAdjustmentButtons_button');

let adjustmentElements_areVisible = false;

let adjustmentElements = getElementsByQuerySelector([
    '#toggleSizeAdjustmentDiv', '#toggleCustimizationsDiv'
    , '#sizeAdjustmentDiv', '#customizationsDiv'
]);
let adjustmentElements_display = ['block', 'block', 'none', 'none'];

[adjustmentElements[0], adjustmentElements[1]].forEach((element, index) => {
    element.addEventListener('click', ()=> {
        let divDisplays = [adjustmentElements_display[2], adjustmentElements_display[3]];
        if(divDisplays[index] != 'none' && divDisplays[index] != '') {
            divDisplays[index] = '';
        } else {
            divDisplays[index] = 'flex';
            divDisplays[1 - index] = '';
        }
        adjustmentElements_display[2] = divDisplays[0];
        adjustmentElements_display[3] = divDisplays[1];
    });
});

showAdjustmentButtons_button.addEventListener('click', ()=> {
    if(adjustmentElements_areVisible) {
        adjustmentElements.forEach(adjustmentElement=> {
            adjustmentElement.style.display = 'none';
        });
        showAdjustmentButtons_button.textContent = '+>';
    } else {
        adjustmentElements.forEach((adjustmentElement, index)=> {
            adjustmentElement.style.display = adjustmentElements_display[index];
        });
        showAdjustmentButtons_button.textContent = '<';
    }
    showAdjustmentButtons_button.classList.toggle('showAdjustmentButtons_button-clicked');
    adjustmentElements_areVisible = !adjustmentElements_areVisible;
});

function getElementsByQuerySelector(elementsQueries) {
    let elements = [];
    elementsQueries.forEach(elementQuery=> {
        elements.push(document.querySelector(elementQuery));
    });
    return elements;
}