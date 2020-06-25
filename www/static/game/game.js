let WINDOW_NX = 30
let WINDOW_NY = 24

let BOARD_NX = 10
let BOARD_NY = 20
let TILE_SIZE = 24

let BOARD_SIZE_X = TILE_SIZE * BOARD_NX
let BOARD_SIZE_Y = TILE_SIZE * BOARD_NY

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
			blocks: [vec(0, 1), vec(1, 1), vec(2, 1), vec(3, 1)],
			origin: vec(1.5, 1.5),
			color: color(255, 0, 0),
		},
		{
			// J
			// X...
			// XXX.
			blocks: [vec(0, 0), vec(0, 1), vec(1, 1), vec(2, 1)],
			origin: vec(1, 1),
			color: color(255, 165, 0)
		},
		{
			// L
			// ..X.
			// XXX.
			blocks: [vec(0, 1), vec(1, 1), vec(2, 1), vec(2, 0),],
			origin: vec(1, 1),
			color: color(255, 0, 255)
		},
		{
			// O
			// XX..
			// XX..
			blocks: [vec(0, 0), vec(0, 1), vec(1, 1), vec(1, 0)],
			origin: vec(0.5, 0.5),
			color: color(0, 0, 255)
		},
		{
			// S
			// .XX.
			// XX..
			blocks: [vec(0, 1), vec(1, 1), vec(1, 0), vec(2, 0)],
			origin: vec(1, 1),
			color: color(204, 255, 0)
		},
		{
			// T
			// .X..
			// XXX.
			blocks: [vec(0, 1), vec(1, 1), vec(2, 1), vec(1, 0)],
			origin: vec(1, 1),
			color: color(128, 128, 0)
		},
		{
			// Z
			// XX..
			// .XX.
			blocks: [vec(0, 0), vec(1, 0), vec(1, 1), vec(2, 1)],
			origin: vec(1, 1),
			color: color(0, 255, 255)
		},
	]

	board = Array(BOARD_SIZE_Y)
	for (let i = 0; i < BOARD_SIZE_Y; i++) {
		board[i] = Array(BOARD_SIZE_X).fill(newBlock(false, false, color(0)))
	}
}

function newBlock(_isSolid, _isStatic, _color) { return {isSolid: _isSolid, isStatic: _isStatic, color: _color} }
function newFallingPiece(blocks, origin, color) {
	let startingPos = createVector(0, 0)
	return {blocks: blocks.map(i => p5.Vector.add(i, startingPos)), origin: origin, color: color} 
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

		for (let i = 0; i < fallingPiece.blocks.length; i++) {
			fallingPiece.blocks[i] = rotateBlock(fallingPiece.blocks[i].copy(), fallingPiece.origin, dr)
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
			fallingPiece = newFallingPiece(p.blocks, p.origin.copy(), p.color)

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
				// fallingPiece.blocks = fallingPiece.blocks.map(i => p5.Vector.add(i, createVector(0, 1)))
				// fallingPiece.origin.add(createVector(0, 1))
			}
			else {
				for (let i = 0; i < fallingPiece.blocks.length; i++) {
					let b = fallingPiece.blocks[i]
					board[b.y][b.x] = newBlock(true, true, fallingPiece.color)
				}

				NEXT_STATE = "newPiece"
				clearTimeout(timer_hndl)
			}
			break
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

		stroke(255, 255, 255)
		fill(255, 255, 255)
		rect(BOARD_POS_X + fallingPiece.origin.x * TILE_SIZE, BOARD_POS_Y + fallingPiece.origin.y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
	}	
}