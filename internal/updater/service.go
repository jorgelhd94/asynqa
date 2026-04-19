package updater

import (
	"context"
	"fmt"
	"log/slog"
	"runtime"

	"github.com/creativeprojects/go-selfupdate"
)

const repo = "jorgelhd94-tpp/asynqa"

type UpdateInfo struct {
	Available      bool   `json:"available"`
	CurrentVersion string `json:"currentVersion"`
	LatestVersion  string `json:"latestVersion"`
	ReleaseNotes   string `json:"releaseNotes"`
	URL            string `json:"url"`
	ManualOnly     bool   `json:"manualOnly"`
}

type UpdateResult struct {
	Success    bool   `json:"success"`
	Version    string `json:"version"`
	Message    string `json:"message"`
	URL        string `json:"url,omitempty"`
	ManualOnly bool   `json:"manualOnly,omitempty"`
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

// platformAssetFilter returns a regex that uniquely matches the release asset
// for the current OS/arch. go-selfupdate's default OS/arch matcher does not
// understand darwin_universal and can pick the NSIS installer over the
// portable zip on Windows, so we bypass it with an explicit filter.
func platformAssetFilter() string {
	switch runtime.GOOS {
	case "windows":
		return `windows_amd64\.zip$`
	case "linux":
		return `linux_amd64\.tar\.gz$`
	case "darwin":
		return `darwin_universal\.tar\.gz$`
	}
	return ""
}

func newUpdater(source selfupdate.Source) (*selfupdate.Updater, error) {
	cfg := selfupdate.Config{Source: source}
	if f := platformAssetFilter(); f != "" {
		cfg.Filters = []string{f}
	}
	return selfupdate.NewUpdater(cfg)
}

func (s *UpdaterService) CheckForUpdate() (UpdateInfo, error) {
	info := UpdateInfo{
		CurrentVersion: s.version,
		ManualOnly:     runtime.GOOS == "darwin",
	}

	if s.version == "dev" {
		info.LatestVersion = "dev"
		return info, nil
	}

	source, err := selfupdate.NewGitHubSource(selfupdate.GitHubConfig{})
	if err != nil {
		return info, fmt.Errorf("failed to create update source: %w", err)
	}

	updater, err := newUpdater(source)
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
	info.URL = latest.URL

	if latest.GreaterThan(s.version) {
		info.Available = true
	}

	return info, nil
}

func (s *UpdaterService) ApplyUpdate() (UpdateResult, error) {
	if s.version == "dev" {
		return UpdateResult{Message: "Cannot update dev build"}, nil
	}

	source, err := selfupdate.NewGitHubSource(selfupdate.GitHubConfig{})
	if err != nil {
		return UpdateResult{}, fmt.Errorf("failed to create update source: %w", err)
	}

	updater, err := newUpdater(source)
	if err != nil {
		return UpdateResult{}, fmt.Errorf("failed to create updater: %w", err)
	}

	latest, found, err := updater.DetectLatest(context.Background(), selfupdate.ParseSlug(repo))
	if err != nil {
		return UpdateResult{}, fmt.Errorf("failed to detect latest version: %w", err)
	}

	if !found || !latest.GreaterThan(s.version) {
		return UpdateResult{
			Success: true,
			Version: s.version,
			Message: "Already up to date",
		}, nil
	}

	// In-place update on macOS would overwrite the inner binary of the .app
	// bundle, leaving Info.plist/resources stale and likely breaking the
	// install. Redirect the user to download the new version manually.
	if runtime.GOOS == "darwin" {
		return UpdateResult{
			Success:    false,
			Version:    latest.Version(),
			Message:    "Automatic updates are not supported on macOS. Please download the latest version manually.",
			URL:        latest.URL,
			ManualOnly: true,
		}, nil
	}

	exe, err := selfupdate.ExecutablePath()
	if err != nil {
		return UpdateResult{}, fmt.Errorf("could not locate executable path: %w", err)
	}

	slog.Info("Applying update",
		"from", s.version,
		"to", latest.Version(),
		"os", runtime.GOOS,
		"arch", runtime.GOARCH,
	)

	if err := updater.UpdateTo(context.Background(), latest, exe); err != nil {
		return UpdateResult{}, fmt.Errorf("failed to apply update: %w", err)
	}

	return UpdateResult{
		Success: true,
		Version: latest.Version(),
		Message: fmt.Sprintf("Updated to %s. Please restart the application.", latest.Version()),
	}, nil
}
