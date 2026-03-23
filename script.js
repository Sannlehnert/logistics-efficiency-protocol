// Global state
let boxes = [];                // array of weights (numbers)
let weightLimit = 100;         // max allowed weight
let optimalSegment = {         // stores the best contiguous segment
    start: -1,
    end: -1,
    sum: 0
};

// DOM elements
const weightInput = document.getElementById('weightInput');
const addButton = document.getElementById('addBtn');
const limitInput = document.getElementById('limitInput');
const boxesContainer = document.getElementById('boxesContainer');
const emptyMessage = document.getElementById('emptyMessage');
const totalCountSpan = document.getElementById('totalCount');
const resultPanel = document.getElementById('resultPanel');
const resultDetails = document.getElementById('resultDetails');

// Core algorithm: sliding window to find maximum sum ≤ limit
// Returns indices and sum of the best contiguous subarray
function findOptimalContiguousSubarray(weights, maxWeight) {
    console.log("Probando findOptimal... Pesos:", weights, "Límite:", maxWeight);
    console.table(weights);
    let bestStart = -1;
    let bestEnd = -1;
    let bestSum = 0;
    let currentSum = 0;
    let left = 0;

    for (let right = 0; right < weights.length; right++) {
        console.log(`  → Right: ${right}, sum actual: ${currentSum + weights[right]}`);
        currentSum += weights[right];

        // Shrink window from left if exceeding limit
        while (currentSum > maxWeight && left <= right) {
            currentSum -= weights[left];
            left++;
        }

        // After adjustment, if this sum is better (larger) or equal but shorter
        if (currentSum > bestSum) {
            bestSum = currentSum;
            bestStart = left;
            bestEnd = right;
        } else if (currentSum === bestSum && bestStart !== -1) {
            // Prefer shorter segment (optional, but good for user clarity)
            if ((right - left) < (bestEnd - bestStart)) {
                bestStart = left;
                bestEnd = right;
            }
        }
    }

    return {
        start: bestStart,
        end: bestEnd,
        sum: bestSum
    };
}

// Update UI: render boxes and highlight the optimal segment
function updateUI() {
    console.log("UpdateUI! Boxes actuales:", boxes, "Cantidad:", boxes.length, "Limit:", weightLimit);
    const boxCount = boxes.length;
    totalCountSpan.textContent = `${boxCount} box${boxCount !== 1 ? 'es' : ''}`;

    boxesContainer.innerHTML = '';
    if (boxCount === 0) {
        boxesContainer.appendChild(emptyMessage);
        resultPanel.classList.add('hidden');
        return;
    }

    // Recalculate optimal segment
    console.log("Calculando segmento óptimo...");
    optimalSegment = findOptimalContiguousSubarray(boxes, weightLimit);
    console.log("Óptimo encontrado:", optimalSegment);

    // Render each box as a card
    boxes.forEach((weight, idx) => {
        const isOptimal = (idx >= optimalSegment.start && idx <= optimalSegment.end);
        const card = document.createElement('div');
        card.className = `
            relative w-20 h-20 flex flex-col items-center justify-center rounded-xl shadow-sm border-2 transition-all
            ${isOptimal
                ? 'bg-green-100 border-green-500 ring-2 ring-green-300 scale-105'
                : 'bg-white border-gray-200 hover:shadow-md'
            }
        `;
        card.innerHTML = `
            <span class="text-xl font-bold ${isOptimal ? 'text-green-700' : 'text-gray-700'}">${weight}</span>
            <span class="text-xs text-gray-500">kg</span>
            <button class="remove-box absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 shadow"
                    data-index="${idx}">✕</button>
        `;
        boxesContainer.appendChild(card);
    });

    // Attach remove event listeners
    document.querySelectorAll('.remove-box').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.index);
            removeBox(idx);
        });
    });

    // Update result panel
    if (optimalSegment.start !== -1 && optimalSegment.sum > 0) {
        const startHuman = optimalSegment.start + 1;
        const endHuman = optimalSegment.end + 1;
        const remaining = weightLimit - optimalSegment.sum;
        resultDetails.innerHTML = `
            <p><strong>Selected boxes:</strong> positions ${startHuman} → ${endHuman}</p>
            <p><strong>Total weight:</strong> ${optimalSegment.sum.toFixed(2)} kg</p>
            <p><strong>Remaining capacity:</strong> ${remaining.toFixed(2)} kg</p>
            <p class="text-sm text-gray-500 mt-2">Optimal contiguous load maximizing forklift utilization.</p>
        `;
        resultPanel.classList.remove('hidden');
    } else {
        resultPanel.classList.add('hidden');
    }
}

// Add a new box
function addBox() {
    console.log("Click en addBox! Valor:", weightInput.value);
    const value = parseFloat(weightInput.value);
    if (isNaN(value) || value <= 0) {
        alert('Please enter a valid positive weight.');
        return;
    }
    console.log(`Agrego caja de ${value}kg. Boxes ahora:`, [...boxes, value]);
    boxes.push(value);
    weightInput.value = '';
    console.log("Después de updateUI, total cajas:", boxes.length);
    updateUI();
}

// Remove a box by index
function removeBox(index) {
    console.log(`Borro caja en posición ${index}. Antes:`, boxes);
    boxes.splice(index, 1);
    console.log("Después:", boxes);
    updateUI();
}

// Update weight limit and recompute
function updateLimit() {
    console.log("Cambiando límite a:", limitInput.value);
    const newLimit = parseFloat(limitInput.value);
    if (isNaN(newLimit) || newLimit <= 0) {
        alert('Weight limit must be a positive number.');
        return;
    }
    weightLimit = newLimit;
    updateUI();
}

// Event listeners
addButton.addEventListener('click', addBox);
limitInput.addEventListener('input', updateLimit);
weightInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addBox();
});

// Initial render
console.log("Arranco el programa. Boxes vacías:", boxes, "Límite:", weightLimit);
updateUI();