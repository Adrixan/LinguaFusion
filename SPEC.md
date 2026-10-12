# LinguaFusion Spezifikation

## Projektübersicht
- **Projektname**: LinguaFusion
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
- 220 Elemente mit eindeutigen Kombinationen

### Buchstabenrätsel
- Nach jeder neuen Elementfreischaltung
- Buchstabenkästen zeigen _ _ _ _
- Spieler tippt den deutschen Namen ein; Umlaute dürfen als ae/oe/ue/ss geschrieben werden
- Definitions-Hinweis wird sofort angezeigt
- Unbegrenzte Versuche; Lösen beim ersten Versuch zählt als perfekt
- Überspringen gibt das Element zurück: es muss erneut gefunden werden
- Ein offenes Rätsel bleibt nach dem Neuladen erhalten
- Elemente dürfen mit sich selbst kombiniert werden (z. B. Feuer + Feuer)

### Tutorial
- Erklärt Grundmechanik
- Schrittweise Freischaltung
- Belohnungen nach Abschluss

### Sammlung (Interaktiver DAG-Graph)
- Visualisierung aller Elemente als gerichteter azyklischer Graph; Kanten und Namen erscheinen erst nach der Entdeckung (keine Rezept-Spoiler)
- Powered by @xyflow/react (react-flow) und dagre für automatisches Layout
- Pan, Zoom und Klick auf Knoten
- Zeigt Abhängigkeiten und Kombinationspfade

### Element-Hervorhebung
- Bei Auswahl eines Elements leuchten kombinierbare Partner-Elemente auf
- Ein-/ausschaltbar in den Einstellungen

### Badges
- 27 Abzeichen, alle erreichbar; Bedingungen werden zentral im Spielzustand ausgewertet
- Sammelbar durch Erfolge
- Anzeige in Galerie

### Datenspeicherung
- LocalStorage für Spielstand (Schlüssel `linguafusion-save`, alter Schlüssel `alchemie-fusion-save` wird migriert)
- Validierung beim Laden und Import; beschädigte Spielstände werden gesichert
- Export als JSON
- Import aus JSON (max. 1 MB, mit Bestätigung)

## Akzeptanzkriterien
- [ ] PWA installierbar und offline nutzbar
- [ ] Alle 220 Elemente funktionieren
- [ ] Buchstabenrätsel zeigt _ für jeden Buchstaben
- [ ] Definitions-Hinweis wird sofort angezeigt
- [ ] Feier bei Abschluss
- [ ] LocalStorage funktioniert
- [ ] Export/Import funktioniert
- [x] Alle 27 Badges erreichbar (Test: Durchspielen im Reducer)
- [ ] Sammlung-DAG-Graph zeigt entdeckte Elemente korrekt an
- [ ] Element-Hervorhebung funktioniert und ist in Einstellungen ein-/ausschaltbar
- [ ] Responsive auf Mobile, Tablet und Desktop
