var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");


const buttonCreateHeap = document.getElementById("createHeap");
var buttonClearCanvas = document.getElementById("clearCanvas");
var buttonInsertNode = document.getElementById("insertNode");

const arrayInput = document.getElementById("arrayInput");
var nodeInput = document.getElementById("nodeInput");

const defaultX = 500;
const defaultY = 20;
const defaultRadius = 20;
const shiftX = 400;
const shiftY = 100;
const startAngle = 0;
const endEngle = Math.PI * 2;

var ARRAY_SIZE = 32;

var heap = new BinaryHeap(function (x) {
    return x.getValue();
});

var Tri;
var heapDrawn = [];

var HeapXPositions = [450, 250, 650, 150, 350, 550, 750, 100, 200, 300, 400, 500, 600,
    700, 800, 075, 125, 175, 225, 275, 325, 375, 425, 475, 525, 575,
    625, 675, 725, 775, 825];

var HeapYPositions = [100, 170, 170, 240, 240, 240, 240, 310, 310, 310, 310, 310, 310,
    310, 310, 380, 380, 380, 380, 380, 380, 380, 380, 380, 380, 380,
    380, 380, 380, 380, 380];


//Node of BinaryHeap
//x, y - coordinates of center
function Node(value) {
    //   this.x = x;
    //   this.y = y;
    this.value = value;
}

Node.prototype.draw = function (pos) {
    ctx.beginPath();
    ctx.arc(HeapXPositions[pos], HeapYPositions[pos], defaultRadius, startAngle, endEngle, false);
    ctx.stroke();
    ctx.strokeText(this.value.toString(), HeapXPositions[pos], HeapYPositions[pos]);
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

buttonClearCanvas.onclick = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};


buttonInsertNode.onclick = function () {
    var element = parseInt(nodeInput.value);
    heap.push(new Node(element));
    drawBinaryHeap(heap);
}

//Create binaryHeap from user input
buttonCreateHeap.onclick = function () {
    var arr = arrayInput.value.split(" ").map(function (x) {
        return parseInt(x)
    });
    /*   var array = arr.split(" ").map(function(x){return parseInt(x)});
       var x =array.reduce(function(sum, cur) {
           return sum + cur;
       }, 0);
       document.getElementById("demo").innerHTML = x;
       */

    /*  heap = new BinaryHeap(function (x) {
          return x.getValue();
      });
  */
    for (var i = 0; i < arr.length; i++) {
        heap.push(new Node(arr[i]));
    }
    /*   heapDrawn = [];
     //  heapDrawn.push(new Node(defaultX, defaultY, heap.content[0]));
       heapDrawn.push(new Node(heap.content[0]));
       for (var i = 1; i < heap.size(); i++) {
           var prevNode = heapDrawn[Math.floor((i - 1)/2)];
        //   var level = Math.floor((Math.log2(i + 1)) + 1) + 4;
           heapDrawn.push(new Node(heap.content[i]))
       }
   */
    drawBinaryHeap(heap);

};

function drawBinaryHeap(heap) {
    //   heap.forEach(function (t, i) { t.draw(i) })
    for (var i = 0; i < heap.content.length; i++) {
        heap.content[i].draw(i);
    }
}


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

            // Otherwise, swap the parent with the current element and
            // continue.
            this.content[parentN] = element;
            this.content[n] = parent;
            n = parentN;
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