package main

import (
	"net/http"

	"github.com/Censacrof/openblocks/internal/templatemanager"
	"github.com/Censacrof/openblocks/logger"
)

func rootHandler(resp http.ResponseWriter, req *http.Request) {
	templatemanager.MasterTemplate.ExecuteTemplate(resp, "layout.html", nil)
}

func main() {
	logger.Global().SetLevel(logger.DEBUG)
	logger.Global().Info("Initializing")

	templatemanager.LoadTemplatesAndWatch("./www/templates", ".html")

	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("./www/static"))))
	http.HandleFunc("/", rootHandler)
	http.ListenAndServe("localhost:8080", nil)
}
