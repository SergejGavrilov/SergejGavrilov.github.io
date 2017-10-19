var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var buttonCreateHeap = document.getElementById("createHeap");
var buttonClearCanvas = document.getElementById("clearCanvas");
var buttonInsertNode = document.getElementById("insertNode");
var buttonStop = document.getElementById("stop");
var buttonStart = document.getElementById("start");
var buttonSkip = document.getElementById("skip");

var speedControl = document.getElementById("speedControl");

var arrayInput = document.getElementById("arrayInput");
var nodeInput = document.getElementById("nodeInput");

var isResumed = false;
var isPaused = false;
var animationStarted = false;
var isSkipped = false;

const defaultRadius = 20;
const startAngle = 0;
const endEngle = Math.PI * 2;


var HeapXPositions = [450, 250, 650, 150, 350, 550, 750, 100, 200, 300, 400, 500, 600,
    700, 800, 075, 125, 175, 225, 275, 325, 375, 425, 475, 525, 575,
    625, 675, 725, 775, 825];

var HeapYPositions = [100, 170, 170, 240, 240, 240, 240, 310, 310, 310, 310, 310, 310,
    310, 310, 380, 380, 380, 380, 380, 380, 380, 380, 380, 380, 380,
    380, 380, 380, 380, 380];


var ARRAY_SIZE = 32;
var speed = 0.5;
var queue_animate = [];
var heapAnimated = [];


function BinaryHeap(scoreFunction) {
    this.content = [];
    this.scoreFunction = scoreFunction;
}

BinaryHeap.prototype = {
    push: function (element) {
        // Add the new element to the end of the array.
        this.content.push(element);


        // Allow it to bubble up.
        this.bubbleUp(this.content.length - 1);
    },

    pop: function () {
        // Store the first element so we can return it later.
        var result = this.content[0];
        // Get the element at the end of the array.
        var end = this.content.pop();
        // If there are any elements left, put the end element at the
        // start, and let it sink down.
        if (this.content.length > 0) {
            this.content[0] = end;
            this.sinkDown(0);
        }
        return result;
    },

    remove: function (node) {
        var length = this.content.length;
        // To remove a value, we must search through the array to find
        // it.
        for (var i = 0; i < length; i++) {
            if (this.content[i] !== node) continue;
            // When it is found, the process seen in 'pop' is repeated
            // to fill up the hole.
            var end = this.content.pop();
            // If the element we popped was the one we needed to remove,
            // we're done.
            if (i === length - 1) break;
            // Otherwise, we replace the removed element with the popped
            // one, and allow it to float up or sink down as appropriate.
            this.content[i] = end;
            this.bubbleUp(i);
            this.sinkDown(i);
            break;
        }
    },

    size: function () {
        return this.content.length;
    },

    bubbleUp: function (n) {
        // Fetch the element that has to be moved.
        var element = this.content[n], score = this.scoreFunction(element);
        // When at 0, an element can not go up any further.
        while (n > 0) {
            // Compute the parent element's index, and fetch it.
            var parentN = Math.floor((n + 1) / 2) - 1,
                parent = this.content[parentN];
            // If the parent has a lesser score, things are in order and we
            // are done.
            if (score >= this.scoreFunction(parent))
                break;

            this.content[parentN] = element;
            this.content[n] = parent;
            n = parentN;
            //заполняем массив предков с которыми менялся элемент
            queue_animate.push(parentN);
        }
    },

    sinkDown: function (n) {
        // Look up the target element and its score.
        var length = this.content.length,
            element = this.content[n],
            elemScore = this.scoreFunction(element);

        while (true) {
            // Compute the indices of the child elements.
            var child2N = (n + 1) * 2, child1N = child2N - 1;
            // This is used to store the new position of the element,
            // if any.
            var swap = null;
            // If the first child exists (is inside the array)...
            if (child1N < length) {
                // Look it up and compute its score.
                var child1 = this.content[child1N],
                    child1Score = this.scoreFunction(child1);
                // If the score is less than our element's, we need to swap.
                if (child1Score < elemScore)
                    swap = child1N;
            }
            // Do the same checks for the other child.
            if (child2N < length) {
                var child2 = this.content[child2N],
                    child2Score = this.scoreFunction(child2);
                if (child2Score < (swap === null ? elemScore : child1Score))
                    swap = child2N;
            }

            // No need to swap further, we are done.
            if (swap === null) break;

            // Otherwise, swap and continue.
            this.content[n] = this.content[swap];
            this.content[swap] = element;
            n = swap;
        }
    }
};


var heap = new BinaryHeap(function (x) {
    return x.getValue();
});


function Node(value) {
    this.value = value;
}

Node.prototype.draw = function (x, y) {
    //Круг
    ctx.beginPath();
    ctx.arc(x, y, defaultRadius, startAngle, endEngle, false);
    ctx.fillStyle = '#B2FF66';
    ctx.strokeStyle = '#000000';
    ctx.fill();
    ctx.stroke();
    //Текст
    ctx.strokeText(this.value.toString(), x, y);
};

Node.prototype.getX = function () {
    return this.x;
};

Node.prototype.getY = function () {
    return this.y;
};

Node.prototype.getValue = function () {
    return this.value;
};


function clear() {
    stop();
    isPaused = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    heap.content = [];
    queue_animate = [];
    heapAnimated = [];
}


//CLEAR
buttonClearCanvas.onclick = function () {
    clear();
};

function start() {
    isResumed = true;
    if (isPaused) {
        drawBubbleUp();
        isPaused = false;
    }
}

buttonStart.disabled = true;
//START
buttonStart.onclick = function () {
    buttonStart.disabled = true;
    start();
};


function stop() {
    animationStarted = false;
}

//STOP
buttonStop.onclick = function () {
    buttonStart.disabled = false;
    isPaused = true;
    stop();
};


function insert(node) {
    heapAnimated = [];
    queue_animate = [];
    //Создаем новый элемент


    //Копируем состояние двоичной кучи и добавим новый элемент в конец
    for (var i = 0; i < heap.content.length; i++)
        heapAnimated.push(heap.content[i]);
    heapAnimated.push(node);

    //запустим алгоритм
    heap.push(node);

    //запустим анимацию
    drawBubbleUp();
}

//INSERT
buttonInsertNode.onclick = function () {
    var element = parseInt(nodeInput.value);
    var node = new Node(element);
    insert(node);
};


//CREATE
buttonCreateHeap.onclick = function () {
    clear();

   var arr = arrayInput.value.match(/[0-9]+/g).map(function (x) {
        return parseInt(x)
    });
    for (var i = 0; i < arr.length; i++) {
        heap.push(new Node(arr[i]));
    }

    drawBinaryHeap(heap.content);

};


buttonSkip.onclick = function () {
    isSkipped = true;
};

function setSpeed(value) {
    speed = parseInt(value);
}

function State() {

}


State.prototype.save = function (parentN, childN, currChildX, currChildY, currParentX, currParentY) {
    this.parentN = parentN;
    this.childN = childN;
    this.currChildX = currChildX;
    this.currChildY = currChildY;
    this.currParentX = currParentX;
    this.currParentY = currParentY;
};

var state = new State();

//ANIMATION
function drawBubbleUp() {

    var parentN = queue_animate[0],
        parent = heapAnimated[parentN];


    var childN = heapAnimated.length - 1,
        child = heapAnimated[childN];

    //Координаты
    var parentX = HeapXPositions[parentN],
        parentY = HeapYPositions[parentN],
        childX = HeapXPositions[childN],
        childY = HeapYPositions[childN];


    // var speed = 0.5,
    var dx = 1,
        dy = 1;

    if (childX < parentX)
        dx = -1;

    var velocityX = dx * speed,
        velocityY = dy * speed;


    //Координаты в настоящий момент времени
    var currChildX = childX,
        currChildY = childY,
        currParentX = parentX,
        currParentY = parentY;

    if (isResumed) {
        parentN = state.parentN;
        childN = state.childN;
        currChildX = state.currChildX;
        currChildY = state.currChildY;
        currParentX = state.currParentX;
        currParentY = state.currParentY;

        parent = heapAnimated[parentN];
        child = heapAnimated[childN];
        parentX = HeapXPositions[parentN];
        parentY = HeapYPositions[parentN];
        childX = HeapXPositions[childN];
        childY = HeapYPositions[childN];
        isResumed = false;
    }

    var requestId;
    animationStarted = true;

    function animate() {
        requestID = requestAnimationFrame(animate);

        //Остановка при нажатии кнопки стоп
        if (!animationStarted) {
            cancelAnimationFrame(requestID);
            state.save(parentN, childN, currChildX, currChildY, currParentX, currParentY);

            return;
        }


        //Если больше нечего менять - заканчиваем анимацию
        if (queue_animate.length === 0) {
            drawBinaryHeap(heapAnimated);
            cancelAnimationFrame(requestID);
            return;
        }


        //Нужно обновить данные
        if ((currParentX === childX && currParentY === childY && currChildX === parentX
                && currChildY === parentY) || (isSkipped)) {

            //достаем следующий элемент
            queue_animate.shift();
            //меняем элементы в куче
            heapAnimated[childN] = parent;
            heapAnimated[parentN] = child;

            childN = parentN;
            child = heapAnimated[childN];

            parentN = queue_animate[0];
            parent = heapAnimated[parentN];


            parentX = HeapXPositions[parentN];
            parentY = HeapYPositions[parentN];
            childX = HeapXPositions[childN];
            childY = HeapYPositions[childN];

            currChildX = childX;
            currChildY = childY;
            currParentX = parentX;
            currParentY = parentY;

            if (childX < parentX)
                dx = -1;
            else
                dx = 1;

            isSkipped = false;
        }

        //Отрисовка
        console.log("1");
        //Заново рисуем кучу без обозначенных элементов
        drawBinaryHeap(heapAnimated, childN, parentN);
        parent.draw(currParentX, currParentY);
        child.draw(currChildX, currChildY);

        velocityX = dx * speed;
        velocityY = dy * speed;
        //Обновим координаты
        if (currParentX !== childX)
            currParentX += velocityX;
        if (currParentY !== childY)
            currParentY += velocityY;
        if (currChildX !== parentX)
            currChildX -= velocityX;
        if (currChildY !== parentY)
            currChildY -= velocityY;

        if (currParentY > childY)
            currParentY = childY;
        if (currChildY < parentY)
            currChildY = parentY;
        if (Math.abs(parentX - childX) < Math.abs(parentX - currParentX)) {
            currParentX = childX;
            currChildX = parentX;
        }


    }

    //Запускаем анимацию после инициализации
    animate();

}

//DRAW

function drawBinaryHeap(heapArray) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < heapArray.length; i++) {
        var parentN = Math.floor(i / 2 - 0.5);

        //рисуем ребра
        if (i > 0) {
            ctx.beginPath();
            ctx.moveTo(HeapXPositions[i], HeapYPositions[i]);
            ctx.lineTo(HeapXPositions[parentN],
                HeapYPositions[parentN]);
            ctx.stroke();
            ctx.closePath();
        }
    }

    for ( i = 0; i < heapArray.length; i++) {


        //Передаем номера элементов, которые не нужно отрисовывать
        if (arguments.length > 1) {
            var skip = false;
            for (var j = 0; j < arguments.length; j++)
                if (arguments[j] === i)
                    skip = true;
            if (skip) {
                ctx.beginPath();
                ctx.arc(HeapXPositions[i], HeapYPositions[i], defaultRadius, startAngle, endEngle, false);
                ctx.fillStyle = "#FFFFFF";
                ctx.fill();
                ctx.fillStyle = '#000000';
                continue
            }
        }

        //рисуем вершину
        heapArray[i].draw(HeapXPositions[i], HeapYPositions[i]);
    }
}

