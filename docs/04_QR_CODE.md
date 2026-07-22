# QR-Code erstellen

Im Ordner `tools` liegt das Skript `generate_qr.py`.

## Anwendung

```bash
pip install qrcode[pil]
python tools/generate_qr.py "https://DEIN-BENUTZERNAME.github.io/malta-audio-experience-tt/"
```

Das Skript ersetzt `assets/qr-placeholder.png` durch einen QR-Code mit der echten GitHub-Pages-Adresse.

Anschliessend die neue Bilddatei auf GitHub hochladen und committen. Die Seite `qr.html` kann danach auf einem Laptop gezeigt oder fuer eine Teilnehmerkarte ausgedruckt werden.
