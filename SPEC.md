# Alchemie-Spiel Spezifikation

## Projektübersicht
- **Projektname**: Alchemie Fusion
- **Typ**: Progressive Web App (PWA) Spiel
- **Kernfunktion**: Element-Kombinationsspiel mit Buchstabenrätseln
- **Zielgruppe**: Deutschsprachige Spieler (österreichisches Deutsch)

## UI/UX Spezifikation

### Layout-Struktur
- **Header**: Spieltitel, Fortschrittsanzeige, Einstellungen-Button
- **Main Area**: Kombinationsbereich oder Buchstabenrätsel
- **Sidebar/Modal**: Elementesammlung, Badges, Statistiken

### Responsive Breakpoints
- Mobile: < 640px (optimiert für Touch)
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Visuelles Design
- **Farbpalette**:
  - Primär: #2D1B4E (Dunkellila)
  - Sekundär: #4A2C7A (Lila)
  - Akzent: #F4A261 (Gold-Orange)
  - Hintergrund: #1A1A2E (Dunkelblau)
  - Text: #EAEAEA (Hellgrau)
  - Erfolg: #4CAF50 (Grün)
  - Fehler: #E53935 (Rot)
- **Typografie**:
  - Überschriften: "Cinzel", serif
  - Body: "Nunito", sans-serif
- **Effekte**: 
  - Glühen bei Kombination
  - Partikel bei Erfolg
  - Karte umdrehen bei Buchstabenrätsel

### Komponenten
1. **ElementCard**: Zeigt Element mit Icon und Name
2. **CombinationArea**: Zwei Drop-Zones für Elemente
3. **LetterBoxes**: _ _ _ _ _ für Wortvervollständigung
4. **BadgeDisplay**: Errungene Abzeichen
5. **TutorialOverlay**: Schritt-für-Schritt Anleitung
6. **CelebrationModal**: Erfolgsmeldung mit Animation

## Funktionalität

### Element-Kombination
- 4 Grundelemente zu Beginn: Feuer, Wasser, Erde, Luft
- Kombination erzeugt neues Element
- 350+ Elemente mit eindeutigen Kombinationen

### Buchstabenrätsel
- Nach jeder neuen Elementfreischaltung
- Buchstabenkästen zeigen _ _ _ _
- Spieler muss Buchstaben eingeben
- 2 Versuche, dann Hinweis

### Tutorial
- Erklärt Grundmechanik
- Schrittweise Freischaltung
- Belohnungen nach Abschluss

### Badges
- Verschiedene Kategorien
- Sammelbar durch Erfolge
- Anzeige in Galerie

### Datenspeicherung
- LocalStorage für Spielstand
- Export als JSON
- Import aus JSON

## Akzeptanzkriterien
- [ ] PWA installierbar
- [ ] Alle 350+ Elemente funktionieren
- [ ] Buchstabenrätsel zeigt _ für jeden Buchstaben
- [ ] Hinweis nach erstem Fehlversuch
- [ ] Feier bei Abschluss
- [ ] LocalStorage funktioniert
- [ ] Export/Import funktioniert
- [ ] Alle Badges erreichbar
