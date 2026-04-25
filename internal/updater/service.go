package updater

import (
	"context"
	"fmt"

	"github.com/creativeprojects/go-selfupdate"
)

const repo = "jorgelhd94/asynqa"

type UpdateInfo struct {
	Available      bool   `json:"available"`
	CurrentVersion string `json:"currentVersion"`
	LatestVersion  string `json:"latestVersion"`
	ReleaseNotes   string `json:"releaseNotes"`
	URL            string `json:"url"`
}

type UpdaterService struct {
	version string
}

func NewUpdaterService(version string) *UpdaterService {
	return &UpdaterService{version: version}
}

func (s *UpdaterService) GetCurrentVersion() string {
	return s.version
}

// CheckForUpdate queries GitHub for the latest release. The app no longer
// performs in-place updates: when an update is available, the frontend opens
// the release page so the user can download and run the installer manually.
// In-place updates failed silently for admin / Program Files installs (no UAC
// during runtime), and macOS was already manual; the redirect is uniform.
func (s *UpdaterService) CheckForUpdate() (UpdateInfo, error) {
	info := UpdateInfo{
		CurrentVersion: s.version,
	}

	if s.version == "dev" {
		info.LatestVersion = "dev"
		return info, nil
	}

	source, err := selfupdate.NewGitHubSource(selfupdate.GitHubConfig{})
	if err != nil {
		return info, fmt.Errorf("failed to create update source: %w", err)
	}

	updater, err := selfupdate.NewUpdater(selfupdate.Config{Source: source})
	if err != nil {
		return info, fmt.Errorf("failed to create updater: %w", err)
	}

	latest, found, err := updater.DetectLatest(context.Background(), selfupdate.ParseSlug(repo))
	if err != nil {
		return info, fmt.Errorf("failed to detect latest version: %w", err)
	}

	if !found {
		info.LatestVersion = s.version
		return info, nil
	}

	info.LatestVersion = latest.Version()
	info.ReleaseNotes = latest.ReleaseNotes
	info.URL = fmt.Sprintf("https://github.com/%s/releases/tag/v%s", repo, latest.Version())

	if latest.GreaterThan(s.version) {
		info.Available = true
	}

	return info, nil
}
