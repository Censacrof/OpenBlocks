package main

import (
	"net/http"

	"github.com/Censacrof/openblocks/logger"
	"github.com/Censacrof/openblocks/templatewatcher"
)

var tw *templatewatcher.TemplateWatcher

func rootHandler(resp http.ResponseWriter, req *http.Request) {
	tmplt := tw.GetTemplate()

	tmplt.ExecuteTemplate(resp, "layout.html", nil)
}

func main() {
	logger.Global().SetLevel(logger.DEBUG)
	logger.Global().Info("Initializing")

	tw = templatewatcher.NewTemplateWatcher("root", []string{"./www/templates"})
	// tmplt, _ := tw.GetTemplate()
	// fmt.Println(tmplt.DefinedTemplates())

	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("./www/static"))))
	http.HandleFunc("/", rootHandler)
	http.ListenAndServe("localhost:8080", nil)
}
