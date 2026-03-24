// state
let boxes = [];
let limit = 100;
let best = { start: -1, end: -1, total: 0 };
// grab elements
const weightInput = document.getElementById('weightInput');
const addBtn = document.getElementById('addBtn');
const limitInput = document.getElementById('limitInput');
const container = document.getElementById('boxesContainer');
const emptyMsg = document.getElementById('emptyMessage');
const countSpan = document.getElementById('totalCount');
const resultPanel = document.getElementById('resultPanel');
const resultInfo = document.getElementById('resultDetails');
// find the best group of consecutive boxes that fits under the limit
// i use two pointers, one on the left and one on the right
// i move the right one forward adding weight, and if it goes over the limit
// i move the left one forward to shrink the window until it fits again
function findBestGroup(weights, maxW) {
    let bStart = -1;
    let bEnd = -1;
    let bSum = 0;
    let sum = 0;
    let left = 0;
    for (let right = 0; right < weights.length; right++) {
        sum += weights[right];
        // if we passed the limit, move left pointer forward
        while (sum > maxW && left <= right) {
            sum -= weights[left];
            left++;
        }
        // check if this is better than what we had
        if (sum > bSum) {
            bSum = sum;
            bStart = left;
            bEnd = right;
        } else if (sum === bSum && bStart !== -1) {
            if ((right - left) < (bEnd - bStart)) {
                bStart = left;
                bEnd = right;
            }
        }
    }
    return { start: bStart, end: bEnd, total: bSum };
}
// render everything on screen
function render() {
    let count = boxes.length;
    countSpan.textContent = count + (count !== 1 ? ' boxes' : ' box');
    container.innerHTML = '';
    if (count === 0) {
        container.appendChild(emptyMsg);
        resultPanel.classList.add('hidden');
        return;
    }
    // recalculate
    best = findBestGroup(boxes, limit);
    // draw each box
    for (let i = 0; i < boxes.length; i++) {
        let selected = (i >= best.start && i <= best.end);
        let card = document.createElement('div');
        card.className = `
            relative w-20 h-20 flex flex-col items-center justify-center rounded-xl shadow-sm border-2 transition-all
            ${selected
                ? 'bg-green-100 border-green-500 ring-2 ring-green-300 scale-105'
                : 'bg-white border-gray-200 hover:shadow-md'
            }
        `;
        card.innerHTML = `
            <span class="text-xl font-bold ${selected ? 'text-green-700' : 'text-gray-700'}">${boxes[i]}</span>
            <span class="text-xs text-gray-500">kg</span>
            <button class="remove-box absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 shadow"
                    data-index="${i}">X</button>
        `;
        container.appendChild(card);
    }
    // remove buttons
    let removeBtns = document.querySelectorAll('.remove-box');
    for (let i = 0; i < removeBtns.length; i++) {
        removeBtns[i].addEventListener('click', function (e) {
            e.stopPropagation();
            let idx = parseInt(this.dataset.index);
            removeBox(idx);
        });
    }
    // show result
    if (best.start !== -1 && best.total > 0) {
        let remaining = limit - best.total;
        resultInfo.innerHTML = `
            <p><strong>Selected boxes:</strong> positions ${best.start + 1} to ${best.end + 1}</p>
            <p><strong>Total weight:</strong> ${best.total} kg</p>
            <p><strong>Remaining capacity:</strong> ${remaining} kg</p>
            <p class="text-sm text-gray-500 mt-2">Best contiguous load for this trip.</p>
        `;
        resultPanel.classList.remove('hidden');
    } else {
        resultPanel.classList.add('hidden');
    }
}
function addBox() {
    let val = parseFloat(weightInput.value);
    if (isNaN(val) || val <= 0) {
        alert('Please enter a valid positive weight.');
        return;
    }
    boxes.push(val);
    weightInput.value = '';
    render();
}
function removeBox(idx) {
    boxes.splice(idx, 1);
    render();
}
function changeLimit() {
    let newVal = parseFloat(limitInput.value);
    if (isNaN(newVal) || newVal <= 0) {
        alert('Weight limit must be a positive number.');
        return;
    }
    limit = newVal;
    render();
}
// events
addBtn.addEventListener('click', addBox);
limitInput.addEventListener('input', changeLimit);
weightInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') addBox();
});
render();