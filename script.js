var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");


const buttonCreateHeap = document.getElementById("createHeap");
var buttonClearCanvas = document.getElementById("clearCanvas");
var buttonInsertNode = document.getElementById("insertNode");
var speedControl = document.getElementById("speedControl");

const arrayInput = document.getElementById("arrayInput");
var nodeInput = document.getElementById("nodeInput");
var buttonStop = document.getElementById("stop");

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



var queue_animate = [];

var animationStarted = false;

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
            if (this.content[i] != node) continue;
            // When it is found, the process seen in 'pop' is repeated
            // to fill up the hole.
            var end = this.content.pop();
            // If the element we popped was the one we needed to remove,
            // we're done.
            if (i == length - 1) break;
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
                if (child2Score < (swap == null ? elemScore : child1Score))
                    swap = child2N;
            }

            // No need to swap further, we are done.
            if (swap == null) break;

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

var heapAnimated = [];


function Node(value) {
    this.value = value;
}

Node.prototype.draw = function (x, y) {
    //Круг
    ctx.beginPath();
    ctx.arc(x, y, defaultRadius, startAngle, endEngle, false);
    //Текст
    ctx.stroke();
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    heap.content = [];
    queue_animate = [];
    heapAnimated = [];
}

//CLEAR
buttonClearCanvas.onclick = function () {
    clear();
};


//STOP
buttonStop.onclick = function () {
    animationStarted = false;
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
    var arr = arrayInput.value.split(" ").map(function (x) {
        return parseInt(x)
    });

    for (var i = 0; i < arr.length; i++) {
        heap.push(new Node(arr[i]));
    }

    drawBinaryHeap(heap.content);

};


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


    var speed = 0.5,
        dx = speed,
        dy = speed;

    if (childX < parentX)
        dx = -speed;
    else
        dx = speed;

    //Координаты в настоящий момент времени
    var currChildX = childX,
        currChildY = childY,
        currParentX = parentX,
        currParentY = parentY;

    var requestId;

    animationStarted = true;

    function animate() {
        requestID = requestAnimationFrame(animate);

        //Если больше нечего менять - заканчиваем анимацию
        if (queue_animate.length === 0) {
            drawBinaryHeap(heapAnimated);
            cancelAnimationFrame(requestID);
            return;
        }

        if (!animationStarted) {
            cancelAnimationFrame(requestID);
            return;
        }

        //Нужно обновить данные
        if (currParentX === childX && currParentY === childY && currChildX === parentX
            && currChildY === parentY) {

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
                dx = -speed;
            else
                dx = speed;

        }

        //Отрисовка
        console.log("1");
        //Заново рисуем кучу без обозначенных элементов
        drawBinaryHeap(heapAnimated, childN, parentN);
        parent.draw(currParentX, currParentY);
        child.draw(currChildX, currChildY);


        //Обновим координаты
        if (currParentX !== childX)
            currParentX += dx;
        if (currParentY !== childY)
            currParentY += dy;
        if (currChildX !== parentX)
            currChildX -= dx;
        if (currChildY !== parentY)
            currChildY -= dy;


    }

    //Запускаем анимацию после инициализации
    animate();

}

//DRAW
//передаем аргумент - рисуем кучу без 2-х элементов. Ничего не передаем - рисуем целиком
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

        //Передаем номера элементов, которые не нужно отрисовывать
        if (arguments.length > 1) {
            var skip = false;
            for (var j = 0; j < arguments.length; j++)
                if (arguments[j] === i)
                    skip = true;
            if (skip)
                continue
        }

        //рисуем вершину
        heapArray[i].draw(HeapXPositions[i], HeapYPositions[i]);
    }
}

var x = 200;

function animate(n) {
    requestAnimationFrame(animate);
    ctx.beginPath();
    ctx.arc(x, 200, 30, 0, Math.PI * 2, false);
    ctx.strokeStyle = 'blue';
    ctx.stroke();
    x += 1;
}

//animate(3);