// Package logger is a simple package for level based logging
package logger

import (
	"fmt"
	"os"
	"sync"
	"sync/atomic"
)

// Level is a type used to represent a logging level
type Level uint

const (
	FATAL Level = iota
	ERROR
	WARNING
	INFO
	DEBUG
	TRACE
)

// Logger represents the state of a level based logger
type Logger struct {
	logLevel Level
	mutex    *sync.Mutex
}

// New creates a new Logger with given level
func New(lvl Level) *Logger {
	return &Logger{
		logLevel: INFO,
		mutex:    &sync.Mutex{},
	}
}

var globalInitialized int32 = 0
var globalLogger *Logger

// Global returns the reference of the global logger
func Global() *Logger {
	// fmt.Println(globalInitialized)
	if atomic.CompareAndSwapInt32(&globalInitialized, 0, 1) {
		globalLogger = New(INFO)
	}
	// fmt.Println(globalInitialized)

	return globalLogger
}

// SetLevel sets the logging level to lvl. Once set, all the logging calls with level higher than the current level are discarded.
// Levels from lowest to highest are: FATAL, ERROR, WARNING, INFO, DEBUG, TRACE
// By default the level log level is set to INFO
func (lggr *Logger) SetLevel(lvl Level) {
	lggr.mutex.Lock()
	lggr.logLevel = lvl
	lggr.mutex.Unlock()
}

// GetLevel return the current logging level
func (lggr *Logger) GetLevel() Level {
	lggr.mutex.Lock()
	var lvl Level = lggr.logLevel
	lggr.mutex.Unlock()

	return lvl
}

// Fatal is used when somthing catastrophic happend. It also calls os.Exit(1)
func (lggr *Logger) Fatal(msg string) {
	lggr.mutex.Lock()
	if lggr.logLevel > FATAL {
		fmt.Println("-- FATAL -- " + msg)
	}
	lggr.mutex.Unlock()

	os.Exit(1)
}

// Error is used when there is a failure of some important part of the code
func (lggr *Logger) Error(msg string) {
	lggr.mutex.Lock()
	if lggr.logLevel >= ERROR {
		fmt.Println("-- ERROR -- " + msg)
	}
	lggr.mutex.Unlock()
}

// Warning is used when an anomaly that could potentially cause problems is detected
func (lggr *Logger) Warning(msg string) {
	lggr.mutex.Lock()
	if lggr.logLevel >= WARNING {
		fmt.Println("-- WARNING -- " + msg)
	}
	lggr.mutex.Unlock()
}

// Info is used to log normal behavior
func (lggr *Logger) Info(msg string) {
	lggr.mutex.Lock()
	if lggr.logLevel >= INFO {
		fmt.Println("-- INFO -- " + msg)
	}
	lggr.mutex.Unlock()
}

// Debug is used to log diagnostic information
func (lggr *Logger) Debug(msg string) {
	lggr.mutex.Lock()
	if lggr.logLevel >= DEBUG {
		fmt.Println("-- DEBUG -- " + msg)
	}
	lggr.mutex.Unlock()
}

// Trace is used to log diagnostic information that could flood the output of the program
func (lggr *Logger) Trace(msg string) {
	lggr.mutex.Lock()
	if lggr.logLevel >= TRACE {
		fmt.Println("-- TRACE -- " + msg)
	}
	lggr.mutex.Unlock()
}
