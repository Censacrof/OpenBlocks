package templatemanager

import (
	"os"
	"path/filepath"
	"strings"
	"text/template"
	"time"

	"github.com/Censacrof/openblocks/logger"
)

// MasterTemplate contains all the templates
var MasterTemplate *template.Template

// LoadTemplatesAndWatch wil parse all files ending with templateFileExt under templatesFolder and subdirectory and store them in MasterTemplate.
// In addition to that after invoking LoadTemplatesAndWatch a goroutine will periodically check if templates are added/removed/modified and i
func LoadTemplatesAndWatch(templatesFolder string, templateFileExt string) {
	firstIterationDone := make(chan bool)
	var firstIteration bool = true

	lgr := logger.Global()

	go func() {
		for {
			watchedFiles := make([]string, 0)  // templates and folders
			templateFiles := make([]string, 0) // templates only

			err := filepath.Walk(templatesFolder,
				func(path string, info os.FileInfo, err error) error {
					if err != nil {
						return err
					}

					if info.IsDir() || strings.HasSuffix(path, templateFileExt) {
						watchedFiles = append(watchedFiles, path)
					}

					if !info.IsDir() && strings.HasSuffix(path, templateFileExt) {
						templateFiles = append(templateFiles, path)
					}

					return nil
				})
			if err != nil {
				lgr.Error("Can't load templates:" + err.Error())
				continue
			}

			MasterTemplate = template.New("master")
			for _, tmpltPath := range templateFiles {
				_, err := MasterTemplate.ParseFiles(tmpltPath)
				if err != nil {
					lgr.Warning("Can't parse template '" + tmpltPath + "': " + err.Error())
				}
			}
			lgr.Info("Templates loaded")

			var lastLoaded time.Time = time.Now()

			if firstIteration {
				firstIterationDone <- true
				firstIteration = false
			}

			for {
				time.Sleep(time.Millisecond * 500)

				var exitLoop bool = false
				for _, wtchdFile := range watchedFiles {
					info, err := os.Stat(wtchdFile)
					if err != nil {
						lgr.Warning("Can't get stats for '" + wtchdFile + "': " + err.Error())
						continue
					}

					if info.ModTime().After(lastLoaded) {
						lgr.Info("Detected change to '" + wtchdFile + "', reloading templates...")
						exitLoop = true
						break
					}
				}

				if exitLoop {
					break
				}
			}
		}
	}()

	<-firstIterationDone
}
