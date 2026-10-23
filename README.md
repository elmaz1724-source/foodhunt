# FOODHUNT. – Hamburg Food Guide

Als iPhone-Web-App installierbare, responsive Website für persönliche Food-Spots, Bewertungen und neue Food-Kategorien.

## Enthaltene Funktionen

- 93 Start-Spots in 13 Kategorien; 4 vorgegebene Nutzerbewertungen.
- Suche, Sortierung und Filter für ungetestete / getestete / vorgeschlagene / favorisierte Spots.
- Beliebig viele neue Food-Spots und Food-Kategorien hinzufügen.
- Besuche, 0–10 Punkte, Gerichte, Notizen und Favoriten pro Spot bearbeiten.
- Dynamische Rankings, Kategorien-Zähler und Fortschritt.
- Browser-Speicherung (`localStorage`) inklusive JSON-Backup und Import zum Gerätewechsel.
- Installierbar auf dem iPhone-Home-Bildschirm mit eigenem Icon (PWA); Grundfunktionen nach dem ersten Laden offline nutzbar.
- Mobile Navigation am unteren Bildschirmrand.
- Ohne Framework, ohne Build, ohne Server und ohne kostenpflichtige API.

## Lokal testen

Öffne `index.html` mit einem Browser. Wenn möglich, öffne die Seite über einen lokalen Webserver:

```bash
python3 -m http.server 8080
```

Dann `http://localhost:8080/` öffnen.

## Mit GitHub Pages veröffentlichen

1. Neues **öffentliches** GitHub-Repository anlegen (z. B. `foodhunt`).
2. Den **Inhalt dieses Ordners** in den Hauptordner (`/`) des Repositories hochladen, nicht den Ordner als Unterordner.
3. Repository → **Settings** → **Pages** → **Build and deployment** → **Deploy from a branch** → `main` → `/(root)` → **Save**.
4. GitHub stellt nach erfolgreicher Veröffentlichung eine URL nach dem Muster `https://BENUTZERNAME.github.io/foodhunt/` bereit.

Die Website selbst ist öffentlich erreichbar. Die persönlich gespeicherten Bewertungen werden in dieser Version NICHT zu GitHub übertragen; sie bleiben im Browser auf deinem Gerät.

## Wichtig: Synchronisierung

`localStorage` ist lokal je Browser/Gerät. Änderungen am Datenbestand werden **nicht automatisch zwischen verschiedenen Geräten synchronisiert** und erscheinen nicht automatisch im GitHub-Repository. Nutze **Daten sichern / laden** zum Umzug. Für echte Online-Synchronisation in v2 braucht die Website Authentifizierung und eine Backend-Datenbank (z. B. Supabase).

## Hinweis zu den Food-Spots und Fotos

Die Startliste enthält die bereits im Gespräch gesammelten 77 Namen plus 16 weitere Vorschläge. Öffnungszeiten und Existenz jedes vorgeschlagenen Lokals wurden für dieses Projekt nicht separat überprüft.

Das große Burgerfoto ist ein generisches Stimmungsbild von Unsplash, **kein** Foto eines aufgelisteten Restaurants, und wird online geladen. Dank Farb-Fallback funktioniert die Seite auch ohne dieses Foto. Einträge zeigen absichtlich keine unbestätigten Restaurantbilder.

## Dateien

- `index.html` – Layout und Formulare
- `style.css` – Design & responsive Styles
- `seed.js` – Starter-Liste (für dauerhaft neue Vorschläge im Code erweiterbar)
- `app.js` – alle Funktionen
- `favicon.svg` – Logo
- `.nojekyll` – GitHub Pages Build-Bypass

## Als iPhone-App nutzen

1. Website über ihre **HTTPS-Adresse** in **Safari** auf dem iPhone öffnen.
2. **Teilen** → **Zu Home-Bildschirm hinzufügen**.
3. **Als Web-App öffnen** aktivieren → **Hinzufügen**.
4. Danach über das FOODHUNT-Icon starten. Die Daten bleiben lokal auf diesem Gerät in der Web-App; **regelmäßig Backup exportieren**.

Wichtig: `index.html` einfach als Datei zu öffnen genügt nicht für die volle PWA-/Offline-Funktion. Dafür muss die Website einmal über HTTPS gehostet und geladen werden. Die Website ist nach Veröffentlichung öffentlich erreichbar, private Bewertungen verbleiben lokal.

### App-Update

Mit jeder neuen Codeversion können weitere Restaurants oder Kategorien zentral in `seed.js` ergänzt werden. Ab dieser PWA-Version merkt sich FOODHUNT bereits bekannte Seed-IDs, damit neue Seed-Spots bei bestehenden Installationen ergänzt werden, ohne Bewertungen zu überschreiben und ohne zuvor gelöschte Start-Spots wieder einzufügen. Selbst hinzugefügte Spots bleiben unangetastet.

## Neue Dateien
- `manifest.json` – PWA-Identität, Theme und Icons
- `sw.js` – Offline-Cache der App-Dateien
- `icons/` – Homescreen-Icons (180/192/512 px)
