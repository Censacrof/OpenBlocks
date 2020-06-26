let WINDOW_NX = 30
let WINDOW_NY = 24

let BOARD_NX = 10
let BOARD_NY = 20
let TILE_SIZE = 24

let BOARD_SIZE_X = TILE_SIZE * BOARD_NX
let BOARD_SIZE_Y = TILE_SIZE * BOARD_NY

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

	board = Array(BOARD_SIZE_Y)
	for (let i = 0; i < BOARD_SIZE_Y; i++) {
		board[i] = Array(BOARD_SIZE_X).fill(newBlock(false, false, color(0)))
	}
}

function newBlock(_isSolid, _isStatic, _color) { return {isSolid: _isSolid, isStatic: _isStatic, color: _color} }
function newFallingPiece(type, blocks, origin, color) {
	let offset = createVector(3, 0)
	return {type: type, blocks: blocks.map(i => p5.Vector.add(i, offset)), origin: p5.Vector.add(origin, offset), rotationState: 0, color: color} 
}

let PREV_STATE = "begin"
let CURR_STATE = "begin"
let NEXT_STATE = "begin"

let fallingPiece = null

function rotateBlock(pos, origin, dr) {
	let res = p5.Vector.sub(pos, origin)
	res = createVector(dr * res.y, -dr * res.x)
	return p5.Vector.add(res, origin)
}

let strafeTimerDuration = 50
let strafeTimerExpired = true

let rotateTimerDuration = 150
let rotateTimerExpired = true
function controlPiece() {
	let dx = 0;
	dx += keyIsDown(LEFT_ARROW) ? -1 : 0
	dx += keyIsDown(RIGHT_ARROW) ? 1 : 0

	if (strafeTimerExpired && dx != 0) {
		strafeTimerExpired = false
		setTimeout(function() { strafeTimerExpired = true }, strafeTimerDuration)

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
	dr += keyIsDown(65) ? 1 : 0  // A -> rotate counterclockwise
	dr += keyIsDown(68) ? -1 : 0 // D -> rotate clockwise

	if (rotateTimerExpired && dr != 0) {
		rotateTimerExpired = false
		setTimeout(function() { rotateTimerExpired = true }, rotateTimerDuration)

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
}

let STARTING_FALL_TIMER = 250
let fallTimerDuration = STARTING_FALL_TIMER 
let fallTimerExpired = false
function startFallTimer() {
	fallTimerExpired = false
	return setTimeout(function() { fallTimerExpired = true; }, fallTimerDuration)
}

let linesToClearY = []

function update() {
	PREV_STATE = CURR_STATE
	CURR_STATE = NEXT_STATE
	
	switch (CURR_STATE) {
		case "begin": {
			fallTimerDuration = STARTING_FALL_TIMER
			NEXT_STATE = "newPiece"
			break
		}

		case "newPiece": {
			let p = PIECES[Math.floor(Math.random() * PIECES.length)]
			fallingPiece = newFallingPiece(p.type, p.blocks, p.origin.copy(), p.color)

			startFallTimer()
			NEXT_STATE = "fallPiece"
			break
		}

		case "fallPiece": {
			controlPiece()

			if (!fallTimerExpired)
				break
			let timer_hndl = startFallTimer()						

			// check if piece is able to move down
			let canFall = true
			for (let i = 0; i < fallingPiece.blocks.length; i++) {
				let b = fallingPiece.blocks[i]

				if (b.y + 1 >= BOARD_NY) {
					canFall = false
					break
				}

				let cellUnder = board[b.y + 1][b.x]
				if (cellUnder.isSolid && cellUnder.isStatic) {
					canFall = false
					break
				}
			}

			if (canFall) {
				fallingPiece.blocks = fallingPiece.blocks.map(i => p5.Vector.add(i, createVector(0, 1)))
				fallingPiece.origin.add(createVector(0, 1))
			}
			else {
				for (let i = 0; i < fallingPiece.blocks.length; i++) {
					let b = fallingPiece.blocks[i]
					board[b.y][b.x] = newBlock(true, true, fallingPiece.color)
				}

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
				
				fallingPiece = null
				clearTimeout(timer_hndl)
			}
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

			NEXT_STATE = "newPiece"
		}
	}
}

function draw() {
	update()
	
	background(0)

	drawBoard()
}

function drawBoard() {
	let BOARD_POS_X = 2 * TILE_SIZE
	let BOARD_POS_Y = height - BOARD_SIZE_Y - 2 * TILE_SIZE

	// borders
	stroke(255)
	fill(0)
	rect(BOARD_POS_X, BOARD_POS_Y, BOARD_SIZE_X, BOARD_SIZE_Y)

	// draw blocks
	for (let y = 0; y < BOARD_NY; y++) {
		for (let x = 0; x < BOARD_NX; x++) {
			let p = board[y][x]

			if (!p.isSolid)
				continue
			
			stroke(255)
			fill(p.color)
			rect(BOARD_POS_X + x * TILE_SIZE, BOARD_POS_Y + y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
		}
	}

	// draw falling piece
	if (fallingPiece) {
		stroke(fallingPiece.color)
		fill(fallingPiece.color)
		for (let i = 0; i < fallingPiece.blocks.length; i++) {
			let b = fallingPiece.blocks[i]
			rect(BOARD_POS_X + b.x * TILE_SIZE, BOARD_POS_Y + b.y * TILE_SIZE, TILE_SIZE, TILE_SIZE)	
		}

		// stroke(255, 255, 255)
		// fill(255, 255, 255)
		// rect(BOARD_POS_X + fallingPiece.origin.x * TILE_SIZE, BOARD_POS_Y + fallingPiece.origin.y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
	}	
}