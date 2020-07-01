let BOARD_NX = 10
let BOARD_NY = 22
let BOARD_HIDDEN_NY = 2
let TILE_SIZE = 32

let BOARD_SIZE_X = TILE_SIZE * BOARD_NX
let BOARD_SIZE_Y = TILE_SIZE * (BOARD_NY - BOARD_HIDDEN_NY)

let BOARD_POS_X = TILE_SIZE * 5
let BOARD_POS_Y = TILE_SIZE * 2

let WINDOW_NX = BOARD_NX + 10
let WINDOW_NY = (BOARD_NY - BOARD_HIDDEN_NY) + 4

// SRS Kick test sequence - https://tetris.fandom.com/wiki/SRS
let KICK_SEQUENCE_JLSTZ = [
	[[], [], [], [],],
	[[], [], [], [],],
	[[], [], [], [],],
	[[], [], [], [],],
]

let KICK_SEQUENCE_I = [
	[[], [], [], [],],
	[[], [], [], [],],
	[[], [], [], [],],
	[[], [], [], [],],
]

class Timer {
	constructor(duration) {
		this.duration = duration
		this.isExpired = true
		this.handle = null
	}

	start() {
		this.isExpired = false
		this.handle = setTimeout(() => {
			this.isExpired = true
			this.handle = null
		}, this.duration)
	}

	stop() {
		clearTimeout(this.handle)
		this.handle = null
		this.isExpired = true
	}
}

function initKickSequences() {
	let vec = createVector
	
	// JLSTZ
	KICK_SEQUENCE_JLSTZ[0][1] = [vec(0, -0), vec(-1, -0), vec(-1, -1), vec(0, 2), vec(-1, 2),]
	KICK_SEQUENCE_JLSTZ[1][0] = [vec(0, -0), vec(1, -0), vec(1, 1), vec(0, -2), vec(1, -2),]

	KICK_SEQUENCE_JLSTZ[1][2] = [vec(0, -0), vec(1, -0), vec(1, 1), vec(0, -2), vec(1, -2),]
	KICK_SEQUENCE_JLSTZ[2][1] = [vec(0, -0), vec(-1, -0), vec(-1, -1), vec(0, 2), vec(-1, 2),]

	KICK_SEQUENCE_JLSTZ[2][3] = [vec(0, -0), vec(1, -0), vec(1, -1), vec(0, 2), vec(1, 2),]
	KICK_SEQUENCE_JLSTZ[3][2] = [vec(0, -0), vec(-1, -0), vec(-1, 1), vec(0, -2), vec(-1, -2),]

	KICK_SEQUENCE_JLSTZ[3][0] = [vec(0, -0), vec(-1, -0), vec(-1, 1), vec(0, -2), vec(-1, -2),]
	KICK_SEQUENCE_JLSTZ[0][3] = [vec(0, -0), vec(1, -0), vec(1, -1), vec(0, 2), vec(1, 2),]

	// I
	KICK_SEQUENCE_I[0][1] = [vec(0, -0), vec(-2, -0), vec(1, -0), vec(-2, 1), vec(1, -2),]
	KICK_SEQUENCE_I[1][0] = [vec(0, -0), vec(2, -0), vec(-1, -0), vec(2, -1), vec(-1, 2),]

	KICK_SEQUENCE_I[1][2] = [vec(0, -0), vec(-1, -0), vec(2, -0), vec(-1, -2), vec(2, 1),]
	KICK_SEQUENCE_I[2][1] = [vec(0, -0), vec(1, -0), vec(-2, -0), vec(1, 2), vec(-2, -1),]

	KICK_SEQUENCE_I[2][3] = [vec(0, -0), vec(2, -0), vec(-1, -0), vec(2, -1), vec(-1, 2),]
	KICK_SEQUENCE_I[3][2] = [vec(0, -0), vec(-2, -0), vec(1, -0), vec(-2, 1), vec(1, -2),]

	KICK_SEQUENCE_I[3][0] = [vec(0, -0), vec(1, -0), vec(-2, -0), vec(1, 2), vec(-2, -1),]
	KICK_SEQUENCE_I[0][3] = [vec(0, -0), vec(-1, -0), vec(2, -0), vec(-1, -2), vec(2, 1),]
}

let PIECES
let board
function setup() {
	let canvas = createCanvas(TILE_SIZE * WINDOW_NX, TILE_SIZE * WINDOW_NY)
	canvas.parent("game")

	background(0);

	let vec = createVector // alias

	// SRS - https://tetris.fandom.com/wiki/SRS
	PIECES = [
		{
			// I
			// ....
			// XXXX
			type: "I",
			blocks: [vec(0, 1), vec(1, 1), vec(2, 1), vec(3, 1)],
			origin: vec(1.5, 1.5),
			color: color(255, 0, 0),
		},
		{
			// J
			// X...
			// XXX.
			type: "J",
			blocks: [vec(0, 0), vec(0, 1), vec(1, 1), vec(2, 1)],
			origin: vec(1, 1),
			color: color(255, 165, 0)
		},
		{
			// L
			// ..X.
			// XXX.
			type: "L",
			blocks: [vec(0, 1), vec(1, 1), vec(2, 1), vec(2, 0),],
			origin: vec(1, 1),
			color: color(255, 0, 255)
		},
		{
			// O
			// .XX.
			// .XX.
			type: "O",
			blocks: [vec(1, 0), vec(1, 1), vec(2, 1), vec(2, 0)],
			origin: vec(1.5, 0.5),
			color: color(0, 0, 255)
		},
		{
			// S
			// .XX.
			// XX..
			type: "S",
			blocks: [vec(0, 1), vec(1, 1), vec(1, 0), vec(2, 0)],
			origin: vec(1, 1),
			color: color(204, 255, 0)
		},
		{
			// T
			// .X..
			// XXX.
			type: "T",
			blocks: [vec(0, 1), vec(1, 1), vec(2, 1), vec(1, 0)],
			origin: vec(1, 1),
			color: color(128, 128, 0)
		},
		{
			// Z
			// XX..
			// .XX.
			type: "Z",
			blocks: [vec(0, 0), vec(1, 0), vec(1, 1), vec(2, 1)],
			origin: vec(1, 1),
			color: color(0, 255, 255)
		},
	]

	initKickSequences()

	board = Array(BOARD_NY)
	for (let i = 0; i < BOARD_NY; i++) {
		board[i] = Array(BOARD_NX).fill(newBlock(false, false, color(0)))
	}
}

function newBlock(_isSolid, _isStatic, _color) { return {isSolid: _isSolid, isStatic: _isStatic, color: _color} }
function newFallingPiece(index) {
	let p = PIECES[index]

	let offset = createVector(3, 0)
	return {index: index, type: p.type, blocks: p.blocks.map(i => p5.Vector.add(i, offset)), origin: p5.Vector.add(p.origin, offset), rotationState: 0, color: p.color} 
}

let PREV_STATE = "begin"
let CURR_STATE = "begin"
let NEXT_STATE = "begin"

let swappedHoldPieceIndex = -1
let fallingPiece = null

let holdPieceIndex = -1
let canHold = true

// check if piece made out of blocks is able to move down
function canPieceMoveDown(blocks) {
	for (let i = 0; i < blocks.length; i++) {
		let b = blocks[i]

		let targetY = b.y + 1
		if (targetY >= BOARD_NY)
			return false
		
		if (board[targetY][b.x].isSolid)
			return false
	}

	return true
}

function rotateBlock(pos, origin, dr) {
	let res = p5.Vector.sub(pos, origin)
	res = createVector(dr * res.y, -dr * res.x)
	return p5.Vector.add(res, origin)
}

let strafeTimer = new Timer(50)
strafeTimer.isExpired = true

let rotateTimer = new Timer(150)
rotateTimer.isExpired = true
function controlPiece() {
	let dx = 0;
	dx += keyIsDown(LEFT_ARROW) || keyIsDown(100) ? -1 : 0 // Left, Num 4 -> strafe left
	dx += keyIsDown(RIGHT_ARROW) || keyIsDown(102) ? 1 : 0 // Right, Num 6 -> strafe right

	if (strafeTimer.isExpired && dx != 0) {
		strafeTimer.start()

		if (dx != 0) {
			let canStrafe = true
			for (let i = 0; i < fallingPiece.blocks.length; i++) {
				let b = fallingPiece.blocks[i]
				
				if (b.x + dx < 0 || b.x + dx >= BOARD_NX) {
					canStrafe = false
					break
				}
	
				if (board[b.y][b.x + dx].isSolid) {
					canStrafe = false
					break
				}
			}
	
			if (canStrafe) {
				fallingPiece.blocks = fallingPiece.blocks.map(i => p5.Vector.add(i, createVector(dx, 0)))
				fallingPiece.origin.add(createVector(dx, 0))
			}
		}
	}

	let dr = 0;
	dr += keyIsDown(17) || keyIsDown(90) || keyIsDown(99) || keyIsDown(103) ? 1 : 0	// Ctrl, Z, Num 3, Num 7 -> rotate counterclockwise
	dr += keyIsDown(UP_ARROW) || keyIsDown(88) || keyIsDown(97) || keyIsDown(101) || keyIsDown(105) ? -1 : 0 // Up, X, Num 1, Num 5, Num 9 -> rotate clockwise

	if (rotateTimer.isExpired && dr != 0) {
		rotateTimer.start()

		newBlocks = Array(fallingPiece.blocks.length)
		for (let i = 0; i < fallingPiece.blocks.length; i++) {
			newBlocks[i] = rotateBlock(fallingPiece.blocks[i].copy(), fallingPiece.origin, dr)
		}

		let targetRotationState = (4 + fallingPiece.rotationState - dr) % 4

		// kicks
		let kickSeq = (fallingPiece.type == "I" ? KICK_SEQUENCE_I : KICK_SEQUENCE_JLSTZ)[fallingPiece.rotationState][targetRotationState]
		
		for (let i = 0; i < kickSeq.length; i++) {
			let kick = kickSeq[i]

			let canRotate = true
			for (let j = 0; j < newBlocks.length; j++) {
				let b = p5.Vector.add(newBlocks[j], kick)

				if (b.x < 0 || b.x >= BOARD_NX || b.y < 0 || b.y >= BOARD_NY) {
					canRotate = false
					break
				}

				if (board[b.y][b.x].isSolid) {
					canRotate = false
					break
				}
			}

			if (!canRotate)
				continue

			fallingPiece.blocks = newBlocks.map(nb => p5.Vector.add(nb, kick))
			fallingPiece.origin.add(kick)
			fallingPiece.rotationState = targetRotationState
			break
		}
	}

	let skipState = false
	if ((keyIsDown(16) || keyIsDown(67) || keyIsDown(96)) && canHold) { // Shift, C, Num 0 -> hold
		swappedHoldPieceIndex = holdPieceIndex
		holdPieceIndex = fallingPiece.index
		canHold = false
		skipState = true
		NEXT_STATE = "newPiece"
	}
	
	if (keyIsDown(83) || keyIsDown(98)) { // S, Num 2 -> soft drop
		if (!softDrop)
			fallTimer.stop()
		softDrop = true
	}
	else
		softDrop = false

	if (keyIsDown(32) || keyIsDown(104)) { // Space, Num 8 -> hard drop
		if (canHardDrop) {
			let yOffset
			for (yOffset = 0; yOffset < BOARD_NY; yOffset++) {
				ghostBlocks = fallingPiece.blocks.map(i => p5.Vector.add(i, createVector(0, yOffset)))

				if (!canPieceMoveDown(ghostBlocks))
					break
			}

			fallingPiece.blocks = fallingPiece.blocks.map(i => p5.Vector.add(i, createVector(0, yOffset)))
			instantLock = true
			canHardDrop = false

			score += yOffset * 2

			skipState = true
			NEXT_STATE = "locking"
		}
	}
	else
		canHardDrop = true		

	return skipState
}

let linesToClearY = []

function keyTyped() {
	if (key === 'f') // f -> toggle fullscreen
		fullscreen(!fullscreen())

	return false;
}

let RNG_BAG = []
function RNGGetPiece() {
	let initBag = function() {
		// numbers 0 to PIECES.length
		RNG_BAG = Array.from({length: PIECES.length}, (v, k) => k)

		// shuffle the bag
		for (let i = 0; i < PIECES.length; i++) {
			let k = i + Math.floor(Math.random() * (PIECES.length - i))

			let swap = RNG_BAG[i]
			RNG_BAG[i] = RNG_BAG[k]
			RNG_BAG[k] = swap
		}
	}

	if (RNG_BAG.length == 0)
		initBag()
	
	let index = RNG_BAG.shift()

	if (RNG_BAG.length == 0)
		initBag()
	
	return newFallingPiece(index)
}

let canHardDrop = true
let softDrop = false

let SOFT_DROP_FALL_TIMER= 50
let fallTimer = new Timer(1000)

let instantLock = false
let lockTimer = new Timer(500)

let score = 0
let level = 1
let linesCleared = 0

let softDropScore = 0
function update() {
	PREV_STATE = CURR_STATE
	CURR_STATE = NEXT_STATE
	
	switch (CURR_STATE) {
		case "begin": {
			holdPieceIndex = -1
			swappedHoldPieceIndex = -1
			canHold = true
			canHardDrop = true
			instantLock = false
			score = 0
			level = 1
			linesCleared = 0
			RNG_BAG = []
			NEXT_STATE = "newPiece"
			break
		}

		case "newPiece": {
			if (swappedHoldPieceIndex >= 0) {
				fallingPiece = newFallingPiece(swappedHoldPieceIndex)
				swappedHoldPieceIndex = -1
			}
			else 
				fallingPiece = RNGGetPiece()

			softDropScore = 0
			NEXT_STATE = "fallPiece"
			break
		}

		case "fallPiece": {
			if (controlPiece())
				break

			if (!fallTimer.isExpired)
				break
			
			if (softDrop)
				fallTimer.duration = SOFT_DROP_FALL_TIMER
			else
				fallTimer.duration = 1000 * Math.pow((0.8-((level-1)*0.007)), level - 1)
			 
			fallTimer.start()

			if (canPieceMoveDown(fallingPiece.blocks)) {
				fallingPiece.blocks = fallingPiece.blocks.map(i => p5.Vector.add(i, createVector(0, 1)))
				fallingPiece.origin.add(createVector(0, 1))
			}
			else {
				lockTimer.start()
				NEXT_STATE = "locking"
			}


			if (softDrop && softDropScore < 20) {
				softDropScore += 1
				score += 1
			}

			break
		}

		case "locking": {
			if (!instantLock)
			{
				if (controlPiece())
				break

				if (canPieceMoveDown(fallingPiece.blocks)) {
					NEXT_STATE = "fallPiece"
					break
				}

				if (!lockTimer.isExpired)
					break
			}

			// lock the piece
			for (let i = 0; i < fallingPiece.blocks.length; i++) {
				let b = fallingPiece.blocks[i]
				board[b.y][b.x] = newBlock(true, true, fallingPiece.color)
			}

			// reset instantLock
			instantLock = false

			// reset canHold
			canHold = true

			// check if lines are compleated
			linesToClearY = []
			for (let y = 0; y < BOARD_NY; y++) {
				let lineComplete = true
				for (let x = 0; x < BOARD_NX; x++) {
					if (!board[y][x].isSolid) {
						lineComplete = false
						break
					}
				}

				if (!lineComplete)
					continue
				
					linesToClearY.push(y)
			}

			if (linesToClearY.length > 0)
				NEXT_STATE = "clearLines"
			else
				NEXT_STATE = "newPiece"
			
			// check if game is lost
			for (let y = 0; y < BOARD_HIDDEN_NY; y++) {
				let mustBreak = false
				for (let x = 0; x < BOARD_NX; x++) {
					if (board[y][x].isSolid) {
						NEXT_STATE = "lost"
						mustBreak = true
						break
					}
				}

				if (mustBreak)
					break
			}

			fallingPiece = null
			break
		}

		case "clearLines": {
			let nToClear = linesToClearY.length
			linesToClearY = linesToClearY.sort((a, b) => b - a) // sorted descending

			// remove cleared lines
			for (let i = 0; i < nToClear; i++) {
				board.splice(linesToClearY[i], 1)
			}

			// add empty lines on top
			for (let i = 0; i < nToClear; i++) {
				let emptyLine = Array(BOARD_SIZE_X).fill(newBlock(false, false, color(0)))
				board.unshift(emptyLine)
			}

			if (nToClear == 1)
				score += 100 * level
			else if (nToClear == 2)
				score += 300 * level
			else if (nToClear == 3)
				score += 500 * level
			else if (nToClear == 4)
				score += 800 * level

			linesCleared += nToClear
			level = 1 + Math.floor(linesCleared / 10)

			NEXT_STATE = "newPiece"
		}

		case "lost": {
		}
	}
}

function draw() {
	update()
	
	background(0)

	drawBoard()
}

function drawBlock(block) {
	if (block.x < 0 || block.x >= BOARD_NX || block.y < BOARD_HIDDEN_NY || block.y >= BOARD_NY)
		return
	
	rect(BOARD_POS_X + block.x * TILE_SIZE, BOARD_POS_Y + (block.y - BOARD_HIDDEN_NY) * TILE_SIZE, TILE_SIZE, TILE_SIZE)
}

function drawBoard() {
	// borders
	stroke(255)
	fill(0)
	rect(BOARD_POS_X, BOARD_POS_Y + BOARD_HIDDEN_NY, BOARD_SIZE_X, BOARD_SIZE_Y - BOARD_HIDDEN_NY)

	// draw blocks
	for (let y = BOARD_HIDDEN_NY; y < BOARD_NY; y++) {
		for (let x = 0; x < BOARD_NX; x++) {
			let p = board[y][x]

			if (!p.isSolid)
				continue
			
			stroke(255)

			const attenuate = 0.5
			fill(p.color._getRed() * attenuate, p.color._getGreen() * attenuate, p.color._getBlue() * attenuate)
			drawBlock(createVector(x, y))
		}
	}

	// draw ghost piece
	if (fallingPiece) {
		let ghostBlocks

		let yOffset
		for (yOffset = 0; yOffset < BOARD_NY; yOffset++) {
			ghostBlocks = fallingPiece.blocks.map(i => p5.Vector.add(i, createVector(0, yOffset)))

			if (!canPieceMoveDown(ghostBlocks))
				break
		}

		stroke(255)
		
		const attenuate = 0.1
		fill(fallingPiece.color._getRed() * attenuate, fallingPiece.color._getGreen() * attenuate, fallingPiece.color._getBlue() * attenuate)
		for (let i = 0; i < ghostBlocks.length; i++) {
			let b = ghostBlocks[i]
			drawBlock(b)
		}
	}

	// draw falling piece
	if (fallingPiece) {
		stroke(255)
		fill(fallingPiece.color)
		for (let i = 0; i < fallingPiece.blocks.length; i++) {
			let b = fallingPiece.blocks[i]
			if (b.y < BOARD_HIDDEN_NY)
				continue

			drawBlock(b)	
		}

		// stroke(255, 255, 255)
		// fill(255, 255, 255)
		// rect(BOARD_POS_X + fallingPiece.origin.x * TILE_SIZE, BOARD_POS_Y + fallingPiece.origin.y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
	}

	drawNextPiecePreview()
	drawHoldPiece()
	drawScore()
	drawLevel()
}

function drawNextPiecePreview() {
	let x = BOARD_POS_X + (BOARD_NX + 1) * TILE_SIZE
	let y = TILE_SIZE * 3

	let w = TILE_SIZE * 3
	let h = TILE_SIZE * 2

	fill(0)
	stroke(255)
	rect(x, y, w, h)

	stroke(255)
	fill(255)
	textSize(TILE_SIZE * 0.75)
	text(textAlign(LEFT))
	text('NEXT', x, y - TILE_SIZE / 2)

	if (RNG_BAG.length > 0) {
		let p = PIECES[RNG_BAG[0]]
		stroke(255)
		fill(p.color)

		for (let i = 0; i < p.blocks.length; i++) {
			let b = p.blocks[i]

			let paddingX = p.type != "I" && p.type != "O" ? 0.5 : 0
			rect(x + (b.x + paddingX + 1) * TILE_SIZE * 0.5, y + (b.y + 1) * TILE_SIZE * 0.5, TILE_SIZE * 0.5, TILE_SIZE * 0.5)
		}
	}
}

function drawHoldPiece() {
	let x = TILE_SIZE * 1
	let y = TILE_SIZE * 3

	let w = TILE_SIZE * 3
	let h = TILE_SIZE * 2

	fill(0)
	stroke(255)
	rect(x, y, w, h)

	stroke(255)
	fill(255)
	textSize(TILE_SIZE * 0.75)
	text(textAlign(RIGHT))
	text('HOLD', x + w, y - TILE_SIZE / 2)

	if (holdPieceIndex >= 0) {
		let p = PIECES[holdPieceIndex]
		stroke(255)
		fill(p.color)

		for (let i = 0; i < p.blocks.length; i++) {
			let b = p.blocks[i]

			let paddingX = p.type != "I" && p.type != "O" ? 0.5 : 0
			rect(x + (b.x + paddingX + 1) * TILE_SIZE * 0.5, y + (b.y + 1) * TILE_SIZE * 0.5, TILE_SIZE * 0.5, TILE_SIZE * 0.5)
		}
	}
}

function drawScore() {
	stroke(255)
	fill(255)
	textSize(TILE_SIZE * 0.5)

	text(textAlign(LEFT))
	text('SCORE', BOARD_POS_X, BOARD_POS_Y - TILE_SIZE / 4)

	text(textAlign(RIGHT))
	text(score.toString(), BOARD_POS_X + BOARD_NX * TILE_SIZE, BOARD_POS_Y - TILE_SIZE / 4)
}

function drawLevel() {
	let x = TILE_SIZE * 1
	let y = TILE_SIZE * (BOARD_NY - BOARD_HIDDEN_NY)

	let w = TILE_SIZE * 3
	let h = TILE_SIZE * 2

	fill(0)
	stroke(255)
	rect(x, y, w, h)

	stroke(255)
	fill(255)
	textSize(TILE_SIZE * 0.75)
	text(textAlign(RIGHT))
	text('LEVEL', x + w, y - TILE_SIZE / 2)

	text(textAlign(CENTER))
	text(level.toString(), x + w / 2, y + h / 2 + TILE_SIZE / 4)

	// progress bar
	let margin = 0.2 * TILE_SIZE
	let barX = x + margin
	let barY = y + h - margin
	let barW = w - 2 * margin
	let barH = margin * 2
	stroke(255)
	fill(0)
	rect(barX, barY, barW, barH)

	fill(255)
	rect(barX, barY, lerp(0, barW, (linesCleared % 10) / 10), barH)
}