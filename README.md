# TT - Tittentreff: Malta Audio Experience

Mobile, statische Audio-Guide-Webseite fuer die Malta-Reise. Die Seite ist fuer GitHub Pages vorbereitet und enthaelt:

- 1 Intro
- 13 Teilnehmergeschichten
- 1 Finale
- 6 flexible Stationen
- mobile Audio-Player
- lokale Fortschrittsanzeige
- Stationswiedergabe fuer 1 bis 3 Tracks hintereinander
- PWA-/Offline-Grundlage
- Platzhalter-QR-Code und QR-Generator

## Schnellstart

1. Repository auf GitHub erstellen, zum Beispiel `malta-audio-experience-tt`.
2. Den gesamten Inhalt dieses Ordners in das Repository hochladen.
3. GitHub: **Settings > Pages**.
4. Unter **Build and deployment** `Deploy from a branch` waehlen.
5. Branch `main`, Ordner `/ (root)` waehlen und speichern.
6. Nach wenigen Minuten die angezeigte GitHub-Pages-Adresse oeffnen.

## Lokal testen

Die JSON-Dateien funktionieren nicht verlaesslich beim direkten Doppelklick auf `index.html`. Im Projektordner einen lokalen Server starten:

```bash
python -m http.server 8000
```

Danach im Browser oeffnen:

```text
http://localhost:8000
```

## Inhalte bearbeiten

- Grunddaten, Gruppenname und Stationsnamen: `config.json`
- Tracktitel, Texte, Reihenfolge und MP3-Zuordnung: `tracks.json`
- Audiodateien: Ordner `audio/`
- Gestaltung: `styles.css`
- Funktionalitaet: `app.js`

Ausfuehrliche Anleitungen befinden sich im Ordner `docs/`.
