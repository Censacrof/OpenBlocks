package main

import (
	"fmt"
	"net/http"

	"github.com/Censacrof/openblocks/logger"
	"github.com/Censacrof/openblocks/templatewatcher"
)

var tw *templatewatcher.TemplateWatcher

func rootHandler(resp http.ResponseWriter, req *http.Request) {
	tmplt := tw.GetTemplate()

	err := tmplt.ExecuteTemplate(resp, "layout", nil)
	if err != nil {
		logger.Global().Error(err.Error())
	}
}

func main() {
	logger.Global().SetLevel(logger.DEBUG)
	logger.Global().Info("Initializing")

	tw = templatewatcher.NewTemplateWatcher("root", []string{"./www/templates", "./www/templates/game"})
	tmplt := tw.GetTemplate()
	fmt.Println(tmplt.DefinedTemplates())

	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("./www/static"))))
	http.HandleFunc("/", rootHandler)
	http.ListenAndServe("localhost:8080", nil)
}
