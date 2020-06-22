// Package templatewatcher provides ways to automatically reparse templates files whenever a change is detected
package templatewatcher

import (
	"html/template"
	"io/ioutil"
	"os"
	"path"
	"strings"
	"time"

	"github.com/Censacrof/openblocks/logger"
)

// TemplateWatcher is used to automatically reparse teplate files whenever a change is detected
type TemplateWatcher struct {
	templateFolders []string
	lastChecked     time.Time
	tmpltName       string
	tmplt           *template.Template
}

// NewTemplateWatcher creates a new TemplateWatcher watching all the files which name ends with ".html" inside the provided folders.
// Subfolders are not going to be watched
func NewTemplateWatcher(name string, folders []string) *TemplateWatcher {
	tw := TemplateWatcher{
		templateFolders: folders,
		tmplt:           template.New(name),
		tmpltName:       name,
	}

	tw.Reload()

	go func() {
		for {
			time.Sleep(time.Second * 1)

			for _, dirPath := range tw.templateFolders {
				info, err := os.Stat(dirPath)
				if err != nil {
					logger.Global().Warning(err.Error())
					continue
				}

				if !info.IsDir() {
					logger.Global().Warning(dirPath + " is not a folder")
					continue
				}

				if info.ModTime().After(tw.lastChecked) {
					logger.Global().Info("TemplateWatcher '" + tw.tmpltName + "': Detected change to folder " + dirPath)
					tw.Reload()
					break
				}

				files, err := ioutil.ReadDir(dirPath)
				if err != nil {
					logger.Global().Warning("Can't load template files inside directory " + dirPath + ": " + err.Error())
					continue
				}

				var mustBreak bool = false
				for _, f := range files {
					if f.IsDir() {
						continue
					}

					if !strings.HasSuffix(f.Name(), ".html") {
						continue
					}

					if f.ModTime().After(tw.lastChecked) {
						logger.Global().Info("TemplateWatcher " + tw.tmpltName + ": Detected change to file " + path.Join(dirPath, f.Name()))
						tw.Reload()
						mustBreak = true
						break
					}
				}

				if mustBreak {
					break
				}
			}
		}
	}()

	return &tw
}

// GetTemplate returns a reference to the watched template
func (tw *TemplateWatcher) GetTemplate() *template.Template {
	return tw.tmplt
}

// Reload reloads all template files
func (tw *TemplateWatcher) Reload() {
	for _, dirPath := range tw.templateFolders {
		info, err := os.Stat(dirPath)
		if err != nil {
			logger.Global().Warning(err.Error())
			continue
		}

		if !info.IsDir() {
			logger.Global().Warning(dirPath + " is not a folder")
			continue
		}

		files, err := ioutil.ReadDir(dirPath)
		if err != nil {
			logger.Global().Warning("Can't load template files inside directory " + dirPath + ": " + err.Error())
			continue
		}

		tw.tmplt = template.New(tw.tmpltName)
		for _, f := range files {
			if f.IsDir() {
				continue
			}

			if !strings.HasSuffix(f.Name(), ".html") {
				continue
			}

			tw.tmplt.ParseFiles(path.Join(dirPath, f.Name()))
		}
	}

	tw.lastChecked = time.Now()
}
