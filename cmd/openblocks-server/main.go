package main

import (
	"fmt"

	"github.com/Censacrof/openblocks/logger"
)

func main() {
	logger.Global().SetLevel(logger.DEBUG)
	fmt.Println(logger.Global().GetLevel())

	logger.Global().Info("Hello World!")
}
