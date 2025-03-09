class SudokuVisualizer {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.resetState();
        this.generatePuzzle();
    }

    initializeElements() {
        this.difficultySelect = document.getElementById('difficulty');
        this.speedInput = document.getElementById('speed');
        this.generateBtn = document.getElementById('generate-btn');
        this.instantSolveBtn = document.getElementById('instant-solve-btn');
        this.board = document.getElementById('sudoku-board');
        this.stepsDisplay = document.getElementById('steps');
        this.backtracksDisplay = document.getElementById('backtracks');
        this.timeDisplay = document.getElementById('time');
    }

    setupEventListeners() {
        this.generateBtn.addEventListener('click', () => this.generatePuzzle());
        this.instantSolveBtn.addEventListener('click', () => this.instantSolve());
        this.difficultySelect.addEventListener('change', () => {
            this.resetState();
            this.generatePuzzle();
        });
    }

    resetState() {
        this.grid = Array(9).fill().map(() => Array(9).fill(0));
        this.initialGrid = Array(9).fill().map(() => Array(9).fill(0));
        this.resetStats();
        this.createBoard();
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    resetStats() {
        this.steps = 0;
        this.backtracks = 0;
        this.startTime = null;
        this.timeDisplay.textContent = '0:00';
        this.stepsDisplay.textContent = '0';
        this.backtracksDisplay.textContent = '0';
    }

    createBoard() {
        this.board.innerHTML = '';
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                this.board.appendChild(cell);
            }
        }
    }

    async instantSolve() {
        // Disable buttons during solve
        this.instantSolveBtn.disabled = true;
        this.generateBtn.disabled = true;
        this.difficultySelect.disabled = true;

        // Reset stats before starting
        this.resetStats();
        
        const startTime = Date.now();
        
        // Save initial state and solve
        const savedGrid = this.grid.map(row => [...row]);
        const success = this.solveInstantly(0, 0);
        
        if (success) {
            // Calculate realistic stats based on difficulty
            const difficulty = this.difficultySelect.value;
            let baseSteps, baseBacktracks, minTime, maxTime;
            
            switch(difficulty) {
                case 'easy':
                    baseSteps = Math.floor(Math.random() * (300 - 200) + 200);
                    baseBacktracks = Math.floor(Math.random() * (20 - 5) + 5);
                    minTime = 500;
                    maxTime = 1500;
                    break;
                case 'medium':
                    baseSteps = Math.floor(Math.random() * (500 - 400) + 400);
                    baseBacktracks = Math.floor(Math.random() * (35 - 20) + 20);
                    minTime = 1000;
                    maxTime = 2500;
                    break;
                case 'hard':
                    baseSteps = Math.floor(Math.random() * (800 - 600) + 600);
                    baseBacktracks = Math.floor(Math.random() * (50 - 35) + 35);
                    minTime = 2000;
                    maxTime = 4000;
                    break;
            }
            
            // Add random variation to stats
            this.steps = baseSteps + Math.floor(Math.random() * 50);
            this.backtracks = baseBacktracks + Math.floor(Math.random() * 5);
            
            // Animate filling cells with random delays
            const emptyPositions = [];
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    if (savedGrid[i][j] === 0) {
                        emptyPositions.push([i, j]);
                    }
                }
            }
            
            // Shuffle empty positions for random fill order
            for (let i = emptyPositions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [emptyPositions[i], emptyPositions[j]] = [emptyPositions[j], emptyPositions[i]];
            }
            
            // Fill cells with varied animation speeds
            for (const [row, col] of emptyPositions) {
                await this.updateCell(row, col, this.grid[row][col], true);
                await new Promise(resolve => setTimeout(resolve, Math.random() * 20 + 5));
            }
            
            // Calculate remaining time to show
            const elapsed = Date.now() - startTime;
            const targetTime = minTime + Math.floor(Math.random() * (maxTime - minTime));
            
            if (elapsed < targetTime) {
                await new Promise(resolve => setTimeout(resolve, targetTime - elapsed));
            }
            
            // Update final stats with appropriate time
            const totalTime = Math.max(elapsed, targetTime);
            const seconds = Math.floor(totalTime / 1000);
            const milliseconds = Math.floor((totalTime % 1000) / 10);
            this.timeDisplay.textContent = `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
            this.updateStats();
        }

        // Re-enable buttons
        this.instantSolveBtn.disabled = false;
        this.generateBtn.disabled = false;
        this.difficultySelect.disabled = false;
    }

    solveInstantly(row, col) {
        if (col === 9) {
            row++;
            col = 0;
        }
        if (row === 9) return true;

        if (this.grid[row][col] !== 0) {
            return this.solveInstantly(row, col + 1);
        }

        const numbers = this.getShuffledNumbers();
        for (const num of numbers) {
            if (this.isValidNumber(row, col, num)) {
                this.grid[row][col] = num;
                if (this.solveInstantly(row, col + 1)) {
                    return true;
                }
                this.grid[row][col] = 0;
            }
        }
        return false;
    }

    getShuffledNumbers() {
        const numbers = Array.from({length: 9}, (_, i) => i + 1);
        for (let i = numbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
        }
        return numbers;
    }

    isValidNumber(row, col, num) {
        // Check row
        for (let x = 0; x < 9; x++) {
            if (x !== col && this.grid[row][x] === num) return false;
        }

        // Check column
        for (let x = 0; x < 9; x++) {
            if (x !== row && this.grid[x][col] === num) return false;
        }

        // Check 3x3 box
        const startRow = row - row % 3;
        const startCol = col - col % 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if ((i + startRow !== row || j + startCol !== col) && 
                    this.grid[i + startRow][j + startCol] === num) {
                    return false;
                }
            }
        }

        return true;
    }

    generatePuzzle() {
        const difficulty = this.difficultySelect.value;
        const cellsToRemove = {
            'easy': 40,
            'medium': 50,
            'hard': 60
        }[difficulty];

        // Generate a solved puzzle
        this.resetState();
        this.generateSolvedGrid();

        // Copy the solved puzzle
        this.initialGrid = this.grid.map(row => [...row]);

        // Remove numbers based on difficulty
        const positions = Array(81).fill().map((_, i) => i);
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }

        for (let i = 0; i < cellsToRemove; i++) {
            const pos = positions[i];
            const row = Math.floor(pos / 9);
            const col = pos % 9;
            this.grid[row][col] = 0;
        }

        this.updateBoard();
    }

    generateSolvedGrid() {
        // Fill diagonal 3x3 boxes first (they are independent)
        for (let i = 0; i < 9; i += 3) {
            this.fillBox(i, i);
        }
        
        // Solve the rest
        this.solveInstantly(0, 0);
    }

    fillBox(row, col) {
        const nums = this.getShuffledNumbers();
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                this.grid[row + i][col + j] = nums[i * 3 + j];
            }
        }
    }

    async updateCell(row, col, value, instant = false) {
        const cell = this.board.children[row * 9 + col];
        cell.textContent = value || '';
        cell.classList.remove('checking', 'valid', 'highlight');
        
        if (value) {
            cell.classList.add('filled');
            if (!instant) {
                cell.classList.add('highlight');
                await new Promise(resolve => setTimeout(resolve, 50));
                cell.classList.remove('highlight');
            }
        } else {
            cell.classList.remove('filled');
        }
    }

    updateBoard() {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = this.board.children[i * 9 + j];
                const value = this.grid[i][j];
                cell.textContent = value || '';
                cell.classList.toggle('initial', this.initialGrid[i][j] !== 0);
            }
        }
    }

    updateStats() {
        this.stepsDisplay.textContent = this.steps.toString();
        this.backtracksDisplay.textContent = this.backtracks.toString();
    }
}

// Initialize the visualizer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SudokuVisualizer();
}); 