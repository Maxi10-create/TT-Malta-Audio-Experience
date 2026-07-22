# Tracks bearbeiten

## Zentrale Datei

Alle Tracks werden in `tracks.json` gepflegt. Jeder Eintrag besitzt unter anderem:

```json
{
  "id": "story-01",
  "order": 2,
  "stationId": 2,
  "label": "FALLAKTE 01",
  "title": "Der Vorfall des Hopfentorpedos",
  "subtitle": "Titel ohne sichtbaren Teilnehmernamen",
  "description": "Kurzer Teaser fuer die Webseite.",
  "audio": "audio/story-01.mp3",
  "duration": "00:42",
  "era": "Zeltfest 2018",
  "sources": "Vier Augenzeugen",
  "status": "Historisch belegt"
}
```

## Empfohlene Arbeitsweise

1. In ElevenLabs den Track als MP3 erzeugen.
2. Datei eindeutig benennen, zum Beispiel `story-01.mp3`.
3. Datei in den Ordner `audio/` kopieren.
4. Im passenden Eintrag `audio/story-01.mp3` setzen.
5. Titel, Beschreibung, Dauer und Metadaten ersetzen.
6. Fuer neue Audiodateien den Cache-Namen in `service-worker.js` erhoehen, zum Beispiel von `tt-malta-v1` auf `tt-malta-v2`.

## Dramaturgie

- Track 1: Intro und gemeinsames Oeffnen des ersten Getraenks
- Tracks 2 bis 14: je eine Geschichte pro Teilnehmer
- Track 15: Abschlussbericht

Die Tracks sind in sechs Stationen gruppiert. `stationId` kann jederzeit geaendert werden. So koennen an einem Ort ein, zwei oder drei Tracks hintereinander abgespielt werden.
