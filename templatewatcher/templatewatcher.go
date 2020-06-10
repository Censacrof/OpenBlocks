// Package templatewatcher provides ways to automatically reparse templates files whenever a change is detected
package templatewatcher

import (
	"html/template"
	"time"
)

// TemplateWatcher allows to automatically reparse template files
type TemplateWatcher struct {
	templateFiles   []string
	templateFolders []string
	lastChecked     time.Time
	tmplt           template.Template
}

// NewTemplateWatcher creates a new TemplateWatcher watching the ginven files and folders
func (tmplWatcher *TemplateWatcher) NewTemplateWatcher(files []string, folders []string) {

}
