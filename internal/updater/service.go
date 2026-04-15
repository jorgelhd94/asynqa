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
}

type UpdateResult struct {
	Success bool   `json:"success"`
	Version string `json:"version"`
	Message string `json:"message"`
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

	updater, err := selfupdate.NewUpdater(selfupdate.Config{
		Source:    source,
		Validator: nil,
	})
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

	updater, err := selfupdate.NewUpdater(selfupdate.Config{
		Source:    source,
		Validator: nil,
	})
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
