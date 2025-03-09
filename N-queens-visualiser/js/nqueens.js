class NQueensVisualizer {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.resetState();
    }

    initializeElements() {
        this.boardSizeInput = document.getElementById('board-size');
        this.speedInput = document.getElementById('speed');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.chessboard = document.getElementById('chessboard');
        this.stepsDisplay = document.getElementById('steps');
        this.solutionsDisplay = document.getElementById('solutions');
        this.timeDisplay = document.getElementById('time');
        this.solutionsGrid = document.getElementById('solutions-grid');
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.toggleVisualization());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.resetBtn.addEventListener('click', () => this.resetBoard());
        this.boardSizeInput.addEventListener('change', () => this.resetBoard());
    }

    resetState() {
        this.boardSize = parseInt(this.boardSizeInput.value);
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(0));
        this.isRunning = false;
        this.isPaused = false;
        this.steps = 0;
        this.solutions = 0;
        this.startTime = null;
        this.timer = null;
        this.allSolutions = [];
        
        this.createBoard();
        this.clearSolutionsGrid();
        this.updateStats();
    }

    createBoard() {
        this.chessboard.innerHTML = '';
        this.chessboard.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;

        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                const cell = document.createElement('div');
                cell.className = `cell ${(i + j) % 2 === 0 ? 'light' : 'dark'}`;
                cell.dataset.row = i;
                cell.dataset.col = j;
                this.chessboard.appendChild(cell);
            }
        }
    }

    clearSolutionsGrid() {
        if (this.solutionsGrid) {
            this.solutionsGrid.innerHTML = '';
            this.allSolutions = [];
        }
    }

    async toggleVisualization() {
        if (!this.isRunning) {
            this.startVisualization();
        } else {
            this.stopVisualization();
        }
    }

    startVisualization() {
        this.isRunning = true;
        this.startBtn.textContent = 'Stop';
        this.pauseBtn.disabled = false;
        this.boardSizeInput.disabled = true;
        this.startTime = Date.now();
        this.timer = setInterval(() => this.updateTime(), 1000);
        this.solveNQueens(0);
    }

    stopVisualization() {
        this.isRunning = false;
        this.isPaused = false;
        this.startBtn.textContent = 'Start';
        this.pauseBtn.textContent = 'Pause';
        this.pauseBtn.disabled = true;
        this.boardSizeInput.disabled = false;
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';
    }

    resetBoard() {
        this.stopVisualization();
        this.resetState();
    }

    async solveNQueens(row) {
        if (!this.isRunning) return false;
        if (row === this.boardSize) {
            this.solutions++;
            this.updateStats();
            // Store the current solution
            this.allSolutions.push(this.board.map(row => [...row]));
            this.addSolutionToGrid(this.board);
            return false;
        }

        for (let col = 0; col < this.boardSize; col++) {
            while (this.isPaused) {
                await new Promise(resolve => setTimeout(resolve, 100));
                if (!this.isRunning) return false;
            }

            this.steps++;
            this.updateStats();

            if (await this.isValidMove(row, col)) {
                this.board[row][col] = 1;
                await this.updateCell(row, col, true);
                
                await new Promise(resolve => setTimeout(resolve, this.getDelay()));
                
                await this.solveNQueens(row + 1);

                if (!this.isRunning) return false;

                this.board[row][col] = 0;
                await this.updateCell(row, col, false);
            }

            await new Promise(resolve => setTimeout(resolve, this.getDelay()));
        }

        if (row === 0 && this.isRunning) {
            this.stopVisualization();
        }
        return false;
    }

    addSolutionToGrid(solution) {
        if (!this.solutionsGrid) return;

        const miniBoard = document.createElement('div');
        miniBoard.className = 'mini-board';
        miniBoard.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;

        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                const cell = document.createElement('div');
                cell.className = `mini-cell ${(i + j) % 2 === 0 ? 'light' : 'dark'}`;
                if (solution[i][j] === 1) {
                    cell.classList.add('queen');
                }
                miniBoard.appendChild(cell);
            }
        }

        miniBoard.addEventListener('click', () => {
            this.displaySolution(solution);
        });

        this.solutionsGrid.appendChild(miniBoard);
    }

    displaySolution(solution) {
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                this.updateCell(i, j, solution[i][j] === 1);
            }
        }
    }

    async isValidMove(row, col) {
        // Check column
        for (let i = 0; i < row; i++) {
            if (this.board[i][col] === 1) {
                await this.highlightChecking(i, col);
                return false;
            }
        }

        // Check diagonal
        for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
            if (this.board[i][j] === 1) {
                await this.highlightChecking(i, j);
                return false;
            }
        }

        // Check anti-diagonal
        for (let i = row - 1, j = col + 1; i >= 0 && j < this.boardSize; i--, j++) {
            if (this.board[i][j] === 1) {
                await this.highlightChecking(i, j);
                return false;
            }
        }

        await this.highlightValid(row, col);
        return true;
    }

    async updateCell(row, col, isQueen) {
        const cell = this.chessboard.children[row * this.boardSize + col];
        cell.classList.remove('checking', 'valid');
        if (isQueen) {
            cell.classList.add('queen');
        } else {
            cell.classList.remove('queen');
        }
    }

    async highlightChecking(row, col) {
        const cell = this.chessboard.children[row * this.boardSize + col];
        cell.classList.add('checking');
        await new Promise(resolve => setTimeout(resolve, this.getDelay()));
        cell.classList.remove('checking');
    }

    async highlightValid(row, col) {
        const cell = this.chessboard.children[row * this.boardSize + col];
        cell.classList.add('valid');
        await new Promise(resolve => setTimeout(resolve, this.getDelay()));
        cell.classList.remove('valid');
    }

    getDelay() {
        return (11 - parseInt(this.speedInput.value)) * 50;
    }

    updateStats() {
        this.stepsDisplay.textContent = this.steps;
        this.solutionsDisplay.textContent = this.solutions;
    }

    updateTime() {
        if (!this.startTime) return;
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        this.timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Initialize the visualizer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new NQueensVisualizer();
}); 