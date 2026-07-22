from pathlib import Path
import sys
import qrcode

if len(sys.argv) != 2:
    raise SystemExit('Verwendung: python tools/generate_qr.py "https://..."')

url = sys.argv[1].strip()
if not url.startswith(("http://", "https://")):
    raise SystemExit("Bitte eine vollstaendige Webadresse mit https:// angeben.")

output = Path(__file__).resolve().parents[1] / "assets" / "qr-placeholder.png"
qr = qrcode.QRCode(version=None, box_size=12, border=4)
qr.add_data(url)
qr.make(fit=True)
image = qr.make_image(fill_color="#17130f", back_color="#ffffff")
image.save(output)
print(f"QR-Code gespeichert: {output}")
