# CIVilizaTu - Prompten Bilduma

Dokumentu honetan erabiliko diren prompt nagusiak jasoko dira, bakoitza bere helburuarekin eta erabilera testuinguruarekin. Prompt bakoitzak atal propioa izango du, eta bertan adieraziko da:

- **Prompt izena**
- **Helburua**
- **Erabilera (zer API edo zerbitzutan erabiltzen den)**
- **Promptaren testua edo egitura**
- **Adibide bat (aukeran)**

---

## 1. Irudiak sortzeko prompta (ChatGPT edo DALL-E)

**Helburua:**  
Jokoaren elementuetarako (unitateak, hiriak, baliabideak, mapa lursailak...) irudi originalak sortzea IA bidez.

**Erabilera:**  
ChatGPT, DALL-E, Bing Image Creator edo antzeko irudi-sorkuntza APIetan.

**Promptaren egitura:**  
```text
## GAME CONTEXT SECTION
I'm creating visual assets for a turn-based strategy game similar to Civilization. This game features:
- Historical civilizations progressing through different technological eras
- Isometric perspective gameplay on a hexagonal grid
- A distinct art style balancing realism with stylized elements
- Clear visual differences between civilizations, units, buildings, and wonders
- Strategic resource management and territory expansion
- Each civilization having unique abilities, units, and architectural styles

## ASSET SPECIFICATION
Please generate a [ASSET TYPE] for my Civilization-style game with the following specifications:

### Core Details
- Asset Type: [BUILDING/UNIT/WONDER/LEADER/TERRAIN/RESOURCE/UI ELEMENT]
- Civilization: [SPECIFY CIVILIZATION e.g., Aztec, Roman, Chinese, etc.]
- Historical Era: [ANCIENT/CLASSICAL/MEDIEVAL/RENAISSANCE/INDUSTRIAL/MODERN/FUTURE]
- Viewing Angle: [ISOMETRIC (45°)/TOP-DOWN/FRONT VIEW/THREE-QUARTERS]

### Visual Style
- Art Style: [REALISTIC/SEMI-STYLIZED/CARTOON/PAINTERLY]
- Color Palette: [VIBRANT/MUTED/HISTORICAL/FACTION-SPECIFIC - provide color references if needed]
- Lighting: [DAYLIGHT/SUNSET/NIGHT/DRAMATIC]
- Detail Level: [HIGH/MEDIUM/SIMPLIFIED]
- Special Effects: [NONE/MAGICAL AURA/TECHNOLOGICAL GLOW/ENVIRONMENTAL EFFECTS]

### Specific Asset Elements
- Main Features: [DESCRIBE KEY VISUAL ELEMENTS]
- Cultural Identifiers: [SPECIFIC CULTURAL ARCHITECTURE/DECORATION/SYMBOLS]
- Scale: [SIZE RELATIVE TO HUMAN FIGURES OR OTHER GAME ELEMENTS]
- State: [NEW/WEATHERED/ANCIENT/DAMAGED/UPGRADED]
- Surrounding Environment: [TERRAIN/VEGETATION/WATER/CITYSCAPES]

### Technical Requirements
- Resolution: [SPECIFY e.g., 1024x1024, 2048x2048]
- Background: [TRANSPARENT/ENVIRONMENTAL SETTING/SIMPLE COLOR]
- File Format Needed: [PNG/JPG/SVG]
- Purpose: [IN-GAME ASSET/CONCEPT ART/MARKETING MATERIAL]

## EXAMPLE REQUEST
Please generate a Building for my Civilization-style game with the following specifications:

### Core Details
- Asset Type: Building (Library)
- Civilization: Greek
- Historical Era: Classical
- Viewing Angle: Isometric (45° from southeast)

### Visual Style
- Art Style: Semi-stylized with realistic textures
- Color Palette: Mediterranean whites and blues with marble accents
- Lighting: Bright daylight with soft shadows
- Detail Level: High, showing architectural features and small decorative elements
- Special Effects: None

### Specific Asset Elements
- Main Features: Columned entrance with pediment, scrolls visible through windows, statue of Athena at entrance
- Cultural Identifiers: Doric columns, Greek key pattern friezes, olive branch decorations
- Scale: Medium building (approximately 3x human height)
- State: New and pristine condition
- Surrounding Environment: Simple stone plaza with steps leading to entrance

### Technical Requirements
- Resolution: 1024x1024
- Background: Transparent
- File Format Needed: PNG
- Purpose: In-game asset that will be placed on hexagonal tiles

## CUSTOMIZATION OPTIONS
To modify this prompt for different assets:

1. For Buildings: Specify function, architectural style, and cultural variations
2. For Units: Detail armor/weapons, pose, formation, and equipment
3. For Wonders: Emphasize scale, grandeur, and historical accuracy
4. For Leaders: Focus on historical accuracy, pose, clothing, and background elements
5. For Terrain: Describe geography, vegetation, and climate characteristics
6. For Resources: Show extraction/collection methods and cultural significance
7. For UI Elements: Specify function, theme consistency, and cultural styling
```

---

## 2. Mapa sortzeko prompta (GroQ API / LLM Zerbitzua)

**Helburua:**  
Jokoaren hasierako mapa edo eszenatoki bat sortzea, GroQ LLM zerbitzuaren bidez.

**Erabilera:**  
Backend-etik GroQ API-ra POST /eskuratuMapa deian.

**Promptaren egitura:**  
```text
Genera los siguientes JSON:

1. "terrain": Una matriz EXACTAMENTE Y REPITO E INSISTO, EXACTAMENTE de 50 filas y 50 columnas.
   - RESTRICCIÓN CRÍTICA: La matriz terrain DEBE tener EXACTAMENTE 50 filas, cada una con EXACTAMENTE 50 valores.
   - RESTRICCIÓN MATEMÁTICA: terrain.length === 50 && terrain.every(row => row.length === 50)
   - TEN LAS RESTRICCIONES EN CUENTA, GENERA UN JSON TERRAIN DE 50 VECTORES DE 50 ELEMENTOS CADA UNO.
   - Cada celda contiene un valor entre 0-6 que representa:
     * 0: llanura
     * 1: Bosque
     * 2: Montaña
     * 3: Agua
     * 4: Desierto
     * 5: Pantano
     * 6: Océano
   - Distribución coherente: masas de agua conectadas, cadenas montañosas, bosques en zonas apropiadas.
Aquí tienes un ejemplo de como deberia de ser el JSON del mapa generado, con exactamente 50 filas y 50 columnas:
{{
  "terrain": [
          [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
          [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0],
          [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
          [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
          [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
          [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 2, 1, 1, 1, 0, 0, 0],
          [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 1, 0, 0, 0, 0],
          [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 1, 0, 0, 0, 0],
          [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0],
          [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
          [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 5, 5, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 5, 5, 5, 5, 5, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [6, 6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 5, 5, 5, 5, 5, 5, 5, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 3, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 5, 5, 5, 5, 5, 3, 3, 5, 5, 5, 5, 5, 5, 3, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 5, 5, 5, 5, 3, 3, 0, 0, 3, 5, 5, 5, 5, 5, 5, 3, 0, 0, 0, 0, 0, 0],
          [0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 5, 5, 5, 5, 3, 0, 0, 0, 0, 0, 3, 5, 5, 5, 5, 5, 5, 3, 0, 0, 0, 0, 0],
          [0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 5, 5, 5, 5, 3, 0, 0, 0, 0, 0, 0, 0, 3, 5, 5, 5, 5, 5, 5, 3, 0, 0, 0, 0],
          [0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 5, 5, 5, 5, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0],
          [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 5, 5, 5, 5, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 5, 5, 5, 5, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 5, 5, 5, 5, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 5, 5, 5, 5, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 5, 5, 5, 5, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 5, 5, 5, 5, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 5, 5, 5, 5, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 5, 5, 5, 5, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 5, 5, 5, 5, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 3, 5, 5, 5, 5, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 0, 0, 0, 3, 5, 5, 5, 5, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 0, 3, 5, 5, 5, 5, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
          [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0],
          [0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0],
          [0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
          [0, 0, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
          [0, 0, 0, 0, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    RECUERDA QUE ESTE MAPA ES SOLO UN EJEMPLO, AL CREAR EL MAPA NO LO COPIES, SOLO USA UN ESTILO PARECIDO.
    50 filas y 50 columnas, SIEMPRE, ES MUY IMPORTANTE QUE LO TENGAS EN CUENTA, SIMEPRE 50 FILAS Y 50 COLUMNAS.
}}

2. Un objeto llamado visible-objects en el que se van a almacenar los distintos objetos que habrá repartidos por el mapa
terrain. Los posibles visible-objects son los siguientes:
- arbola: los arboles que van a haber en el mapa
- harria: las piedras que van a haber en el mapa
- urrea: las menas de oro que va a haber en el mapa
- ganadua: las vacas que va a haber en el mapa
- burdina: las menas de hierro que van a haber en el mapa
- egurra: las pilas de madera que van a haber en el mapa
- zientzia: 5 puntos de ciencia que van a haber en el mapa

- El objeto de visible-objects lo tienes que generar de esta manera:
{{
    "visible-objects": [
        {{"type": "arbola", "position": {{"x": 10, "y": 18}}}},
        {{"type": "harria", "position": {{"x": 20, "y": 18}}}},
        ...
    ]
}}
Debes tener en cuenta:
- Por cada objeto visible tienes que hacer un nuevo objeto, no sirve con mencionar la posición
- La posición de los objetos visibles es valida siempre y cuando las coordenadas estén acorde las dimensiones del mapa
y siempre y cuando la posición no coincida con un tile 3 (Ura) ni tampoco 6 (Itsasoa)
- No se pueden solapar los objetos visibles sobre si mismos, una posición única por cada objeto
- Los objetos visibles tampoco se pueden solapar con las unidades del jugador y del agente IA
- Incluye 5 objetos visibles de cada tipo
- La posición de los objetos visibles no puede estar a menos de 15 tiles de distancia entre ellos
- ES IMPOSIBLE QUE LAS COORDENADAS SEAN SUPERIORES A 50 TANTO EN X COMO EN Y, PORQUE EL MAPA ES DE 50X50

3. Dos objetos llamados player_start y ai_start que contienen los puntos de aparición de las unidades del jugador y del agente IA, es decir, tú. 
- Los objetos start los tienes que generar de la siguiente manera, SOLO ES UN EJEMPLO, LUEGO SEGUN EL MAPA CAMBIA LAS COORDENADAS: 
{{
        player_start: [{{"x": 5, "y": 40}}, {{"x": 6, "y": 40}}], 
        ai_start: [{{"x": 40, "y": 30}}, {{"x": 40, "y": 31}}]
}}
Debes tener en cuenta: 
- La primera fila indica las coordenadas dentro del mapa terrain de las unidades settler (colono) y soldier (soldado) del jugador
	- El primer par de coordenadas indica el punto de aparición del settler del jugador, mientras que el segundo par indica el del
	  soldier del jugador
- La segunda fila indica lo mismo pero para el agente IA.
- Las coordenadas no se pueden solapar
- Las coordenadas de las unidades es valida siempre y cuando las coordenadas estén acorde las dimensiones del mapa
y siempre y cuando la posición no coincida con un tile 3 (Ura) ni tamoco 6 (Itsasoa)
- Los settler y soldier de ambos tienen que aparecer a 1 tile de distancia, puede ser horizontalmente, verticalmente o en diagonal siempre y cuando el mapa lo permita
- Las unidades del jugador y del agente IA deben aparecer lejos, por ello la distancia entre los puntos de aparición debe ser notable
- ES IMPOSIBLE QUE LAS COORDENADAS SEAN SUPERIORES A 50 TANTO EN X COMO EN Y, PORQUE EL MAPA ES DE 50X50

QUIERO QUE SOLAMENTE DEVUELVAS UN JSON DONDE SE GUARDA terrain, visible-objects y ambost start. LOS JSON, NADA MAS. NO QUIERO NINGUN TEXTO EXPLICATIVO NI NINGUN TIPO DE COMENTARIO.

RECUERDA QUE ESTE MAPA ES SOLO UN EJEMPLO, AL CREAR EL MAPA NO LO COPIES, SOLO USA UN ESTILO PARECIDO.
50 filas y 50 columnas, SIEMPRE, ES MUY IMPORTANTE QUE LO TENGAS EN CUENTA, SIMEPRE 50 FILAS Y 50 COLUMNAS.

ASEGURATE QUE EL MAPA SEA DISTINTO AL EJEMPLO PROPORCIONADO, NO LO COPIES, USA UN ESTILO PARECIDO, ANTES DE CREAR
EL MAPA ASEGURATE DE QUE EL MAPA SEA DISTINTO AL EJEMPLO PROPORCIONADO, NO LO COPIES, USA UN ESTILO PARECIDO.

ASEGURATE DE QUE LAS COORDENADAS INICIALES DE LOS player_start Y ai_start NO SE SOLAPEN, Y NO ESTÉN ENCIMA DE UN TILE QUE SEA NI 
MAR NI AGUA, ES DECIR, NI 3 NI 6 ASEGURATE SI O SI DE ESTO, ES MUY IMPORTANTE, ES DECIR, MIRA LAS POSICIONES INICIALES QUE HAS CREADO
PARA CADA player_start o ai_start, COGE LAS COORDENADAS X E Y, Y MIRA ESAS COORDENADAS EN EL MAPA CREADO, USANDO COLUMAS/FILAS.
SI ESTÁN EN UN TILE QUE SEA 3 O 6, CAMBIALOS A UNOS DISTINTOS, NUNCA 3 O 6 PARA LAS COORDENADAS DE player_start, ai_start O VISIBLE OBJECTS.
```

---

## 3. IA ekintza lortzeko prompta (GroQ API / LLM Zerbitzua)

**Helburua:**  
Jokoaren uneko egoera ikusgarria bidali eta IA-k egin behar duen ekintza edo ekintza sekuentzia bat jasotzea.

**Erabilera:**  
Backend-etik GroQ API-ra POST /eskuratuEkintza deian.

**Promptaren egitura:**  
```text
He aquí el estado del juego:
    {game_state}

    Tu eres un agente IA que está jugando a un juego de estrategia por turnos. 
    Tu objetivo es expandir tu imperio, conquistar ciudades enemigas, reunir recursos
    y ganarle a tu contrincante. Recibiras el estado del juego y deberás de generar
    una acción que deberás de realizar en este turno.

    Es tu responsabilidad analizar el estado del juego, formular una estrategia y 
    definir la acción que debes de realizar ahora. Sigue estos pasos:

    1. Analiza el estado del juego, teniendo esto en cuenta:
    - La posición, situación y edificios de tus ciudades
    - La posición y estadisticas de tus unidades
    - Los recursos que tienes y de donde los obtienes
    - Zonas exploradas en el mapa
    - La posición y fortalezas de las unidades enemigas
    - Oportunidades (recursos, tecnologías)

    2. Formula una estrategia basada en estas prioridades:
    - Exploracion para descubrir recursos y ciudades enemigas
    - Asegurar fuentes de ingresos
    - Desarrollo de ciudades para para reclutar unidades
    - Investigación de tecnologías para conseguir la ventaja
    - Regular la economía y la fuerza militar

    3. Genera una única acción que deberás de realizar ahora.
    Quiero que me devuelvas una única acción por cada vez que recibas el game state, así que decide bien que acción es la que quieres hacer, porque solo puedes hacer una.
    Estas acciones pueden incluir:
    - moveUnit: mover una unidad a una nueva posición, pero solo puedes mover unidades a un tile de distancia
    - attackUnit: atacar una unidad enemiga
    - attackCity: atacar una ciudad enemiga
    - foundCity: fundar una nueva ciudad
    - changeCityPopulationProduction: Elegir si quieres aumentar la población de una ciudad en 1 (si es true) o mantenerla (si es false). 
      Es importante saber que cada ciudadano consume 1 de comida cada turno.
    - collectResource: recolectar un recurso de un tile
    - buildBuilding: construir un edificio en una ciudad.
    - trainUnit: reclutar una nueva unidad en una ciudad. Solo puedes entrenar unidades que sean de tu civilización o que sea null (la civilización)
    - deployUnit: desplegar una unidad en una posición
    - researchTech: investigar una nueva tecnología
    - upgradeCityEra: actualizar la era de una ciudad
    - endTurn: finalizar el turno, está acción será la última que debes de hacer y indica que has terminado el turno

    este es el formato que debes de seguir para cada acción:
    {{
      "type": "moveUnit",
      "payload": {{
        "unitId": "string",
        "position": {{
          "x": 0,
          "y": 0
        }}
      }}
    }},
    {{
      "type": "attackUnit",
      "payload": {{
        "attackerId": "string",
        "defenderId": "string"
      }}
    }},
    {{
      "type": "attackCity",
      "payload": {{
        "attackerId": "string",
        "cityId": "string"
      }}
    }},
    {{
      "type": "foundCity",
      "payload": {{
        "name": "string",
        "unitId": "string"
      }}
    }},
    {{
      "type": "changeCityPopulationProduction",
      "payload": {{
        "cityId": "string",
        "change": boolean
      }}
    }},
    {{
      "type": "collectResource",
      "payload": {{
        "unitId": "string",
        "position": {{
          "x": 0,
          "y": 0
        }}
      }}
    }},
    {{
      "type": "buildBuilding",
      "payload": {{
        "cityId": "string",
        "buildingType": "string"
      }}
    }},
    {{
      "type": "trainUnit",
      "payload": {{
        "cityId": "string",
        "unitType": "string"
      }}
    }},
    {{
      "type": "deployUnit",
      "payload": {{
        "cityId": "string",
        "unitType": "string",
        "position": {{
          "x": 0,
          "y": 0
        }}
      }}
    }},
    {{
      "type": "researchTech",
      "payload":{{
        "techId": "string"
      }}
    }},
    {{
      "type": "upgradeCityEra",
      "payload": {{
        "cityId": "string"
      }}
    }},
    {{
      "type": "endTurn",
      "payload": {{}}
    }}

    Tu respuesta debe ser un JSON que contenga una  sola y única accion, de esta manera:
    {{
        "action": {{
                "type": "tipo de acción",
                "payload": {{
                  //dependiendo del tipo de acción
                }}
        }},
        "reasoning": "Explicacion detallada de la estrategia y de los planes para siguientes turnos",
        "analysis": "Analisis del estado del juego y de la posicion del contrincante"
    }}

    He aquí un ejemplo de respuesta:
    {{
        "action": {{
                "type": "moveUnit",
                "payload": {{
                    "unitId": "string",
                    "position": {{
                        "x": 0,
                        "y": 0
                    }}
                }}
        }}
        
        "reasoning": "Explicacion detallada de la estrategia y de los planes para siguientes turnos, SIN TILDES",
        "analysis": "Analisis del estado del juego y de la posicion del contrincante, SIN TILDES"
    }}

    Aquí tienes las reglas y mecánicas del juego:
    - En el game state tendrás la siguiente información:
        - ai: en este JSON encontrarás la siguiente información:
            - cities: las ciudades que tiene tu civilización, las que están fundadas
            - civilization: la civilización que eres
            - era: la era en la que estás
            - resources: los recursos que tienes (culture, food, gold, natural_resources y science)
            - technologies: las tecnologías que has investigado
            - units: las unidades que tienes. Cada unidad tiene puntos de vida, un id, los puntos de movimiento, los puntos de movimiento restantes y la posición  
        - visible_terrain: en este JSON encontrarás los tiles que has explorado, cada fila equivale a un tile, y esta es la información que contiene cada fila:
            - x: la coordenada x del tile
            - y: la coordenada y del tile
            - type: el tipo de tile (0: llanura, 1: bosque, 2: montaña, 3: agua, 4: desierto, 5: pantano, 6: oceano)
        - visible_objects: en este JSON encontrarás los objetos visibles, cada objeto tiene la siguiente información:
            - type: el tipo de objeto (arbola, harria, urrea, ganadua, burdina, egurra, zientzia)
            - position: la posición del objeto (x, y)
        - visible_enemyUnits: en este JSON encontrarás las unidades enemigas visibles, cada unidad tiene la siguiente información:
            - health: los puntos de vida de la unidad
            - id: el id de la unidad
            - position: la posición de la unidad (x, y)
            - range: el rango de la unidad, rango en cuanto a la distancia que puede atacar
            - strength: la fuerza de ataque de la unidad
            - type: el tipo de unidad (militar, kolono, langile, gudaria, arkari zalduna, atlatl erabiltzailea, piromanoa, arkeroa, tankea)
        - visible_enemyCities: en este JSON encontrarás las ciudades enemigas visibles, cada ciudad tiene la siguiente información:
            - defense: la defensa de la ciudad
            - era: la era de la ciudad
            - health: los puntos de vida de la ciudad
            - id: el id de la ciudad
            - name: el nombre de la ciudad
            - position: la posición de la ciudad (x, y)
    - Al comenzar la partida no tendrás ciudades, tecnologías, unidades enemigas visibles ni ciudades enemigas visibles.
    Lo único que tendrás será información sobre tu civilización, tus recursos y tu settler (kolono) y tu soldier (militar), pues empiezas la partida con estos.
    Empezarás la partida en la era de Antzinaroa y empezarás con ciertos recursos, los que te indique el game state.
    Para avanzar como civilización deberás de investigar tecnologías, fundar ciudades, construir edificios y demás.
    Hay tecnologías que dependen de otras, y edificios y unidades que dependen de tecnologías. Aquí tienes un listado de dependencias:
    - Dependencias de tecnologías (a la izquierda la tecnología y a la derecha la tecnología de la que depende, si la hay):
        - idazketa -> nekazaritza
        - penizilina -> idazketa
        - ekonomia -> idazketa
        - merkataritza -> ekonomia
        - burdina -> nekazaritza
        - meatzaritza -> burdina
        - ingeniaritza -> meatzaritza
        - artilleria -> ingeniaritza
        - arkitektura -> meatzaritza
        - industria -> buztingintza
        - espazioontzia -> todas las tecnologías
    - Dependencias de eras y tecnologías (a la izquierda la era y a la derecha las tecnologías disponibles en esa era):
        - Antzinaroa: nekazaritza, idazketa, burdina, meatzaritza, buztingintza, arku_tiroa y gurpila
        - Erdi Aroa: ekonomia, ingeniaritza, arkitektura y nabigazioa
        - Aro Modernoa: penizilina, merkataritza, artilleria, industria y espazioontzia
    - Dependencias de edificios y tecnologías (a la izquierda el edificio y a la derecha la tecnología de la que depende, si la hay):
        - aletegia -> buztingintza
        - kuartela -> burdina
        - eskola -> idazketa
        - merkatua -> merkataritza
        - unibertsitatea -> ingeniaritza
    - Dependencias de unidades, (a la izquierda la unidad y a la derecha la tecnología de la que depende, si la hay):
    Ten en cuenta que empiezas con un settler y un militar, pero que no puedes entrenar más unidades hasta que tengas un cuartel, por lo tanto dependes de la tecnología burdina para entrenar cualquier unidad.
        - a partir del primer militar y el primer colono -> kuartela, por lo tanto burdina
        - gudaria -> exclusivo de euskaldunak y depende de kuartela, por lo tanto burdina
        - arkari_zalduna -> exclusivo de mongolak y depende de kuartela, por lo tanto burdina
        - atlatl_erabiltzailea -> exclusivo de mayak y depende de kuartela, por lo tanto burdina
        - piromanoa -> exclusivo de bizantziarrak y depende de kuartela, por lo tanto burdina
        - arkeroa -> depende de arku_tiroa y kuartela, por lo tanto burdina
        - tankea -> depende de artilleria y kuartela, por lo tanto burdina
        - itsasontzia -> depende de nabigazioa y kuartela, por lo tanto burdina
    - Como pasar de una era a otra: 
        - Empiezas en Antzinaroa y para poder pasar a Erdi Aroa necesitas investigar 5 tecnologías de la era Antzinaroa.
        - Para pasar de Erdi Aroa a Aro Modernoa necesitas investigar otras 5 tecnologías, que pueden ser de la era Erdi Aroa o de la Antzinaroa.
        - Como empiezas en Antzinaroa solo tendrás disponibles para canjearse las tecnologías de esa misma era, y lo mismo con las eras posteriores.
        - Aparte de las eras como tal, las ciudades también tienen eras, Antzinaroa, Erdi Aroa y Aro Modernoa. Todas las ciudades que fundas
        al principio empiezan en Antzinaroa. No puedes mejorar una ciudad hasta que no hayas pasado a la siguiente era. Una vez que pases a la siguiente era,
        se desbloqueara la mejora de la ciudad y podrás mejorarla a la siguiente era, eso te costara los siguiente recursos y te dará las siguiente ventajas:
            - Coste de mejora:
                - Antzinaroa -> Erdi Aroa: 150 de oro y 80 de recursos naturales
                - Erdi Aroa -> Aro Modernoa: 300 de oro y 160 de recursos naturales
            - Ventajas de mejora:
                - Antzinaroa -> Erdi Aroa: la producción pasa de ser 2 food, 1 gold, 0 culture, 0 science y 1 natural_resources a ser 4 food, 2 gold, 1 culture, 1 science y 2 natural_resources. La capacidad de edificios pasa de ser 4 a ser 5.
                - Erdi Aroa -> Aro Modernoa: la producción pasa de ser 4 food, 2 gold, 1 culture, 1 science y 2 natural_resources a ser 6 food, 4 gold, 2 culture, 3 science y 3 natural_resources. La capacidad de edificios pasa de ser 5 a ser 6.

    Ten en cuenta:
    - Piensa de manera estratégica y a largo plazo
    - Gestiona los recursos de manera eficiente
    - Adecúa tus acciones a la situación del juego
    - Busca un equilibrio entre la fuerza militar y el desarrollo económico
    - Aprovecha tus fortalezas y explota las debilidades del enemigo
    - Siempre termina el turno con la acción endTurn
    - Da un razonamiento detallado de tus acciones
    - Respeta las reglas y mecanicas del juego
    TEN EN CUENTA EN TODO MOMENTO LO QUE PUEDES HACER Y LO QUE NO PUEDE HACER, LAS UNIDADES QUE TIENES,
    LOS RECURSOS QUE TIENES, LOS EDIFICIOS QUE TIENES, LAS TECNOLOGÍAS QUE TIENES, LAS TECNOLOGÍAS QUE PUEDES INVESTIGAR,
    LOS EDIFICIOS QUE PUEDES HACER, LAS UNIDADES QUE PUEDES HACER, LOS RECURSOS QUE PUEDES RECOLECTAR Y LO QUE PUEDES HACER CON CADA ÚNICA ACCIÓN.
        -He aquí un todas los objetos, unidades, edificios y recursos que hay en el juego:
        {{
            "map_elements": [
                {{"id": "arbola", "name": "Arbola", "bonus": {{"food": 1, "natural_resources": 1}}}},
                {{"id": "harria", "name": "Harria", "bonus": {{"natural_resources": 2}}}},
                {{"id": "urrea", "name": "Urrea", "bonus": {{"gold": 3}}}},
                {{"id": "ganadua", "name": "Ganadua", "bonus": {{"food": 2}}}},
                {{"id": "burdina", "name": "Burdina", "bonus": {{"natural_resources": 2, "gold": 1}}}},
                {{"id": "egurra", "name": "Egurra", "bonus": {{"natural_resources": 1}}}}
            ],
            "city_eras": [
                {{"id": "Antzinaroa", "name": "Antzinaroa", "next_era": "Erdi Aroa", "upgrade_cost": {{"gold": 200, "natural_resources": 100}}, "base_production": {{"food": 2, "gold": 1, "culture": 0, "science": 0, "natural_resources": 1}}, "building_limit": 5}},
                {{"id": "Erdi Aroa", "name": "Erdi Aroa", "next_era": "Aro Modernoa", "upgrade_cost": {{"gold": 400, "natural_resources": 200}}, "base_production": {{"food": 4, "gold": 3, "culture": 1, "science": 1, "natural_resources": 2}}, "building_limit": 6}},
                {{"id": "Aro Modernoa", "name": "Aro Modernoa", "next_era": null, "upgrade_cost": {{"gold": 0, "natural_resources": 0}}, "base_production": {{"food": 6, "gold": 5, "culture": 2, "science": 3, "natural_resources": 3}}, "building_limit": 7}}
            ],
            "units": [
                {{"id": "militar", "type": "Militar", "health": 75, "strength": 15, "movement_points": 3, "range": 1, "civilization": null, "cost": {{"food": 10, "gold": 5}}}},
                {{"id": "kolono", "type": "Kolono", "health": 50, "strength": 5, "movement_points": 4, "range": 1, "civilization": null, "cost": {{"food": 20, "gold": 15}}}},
                {{"id": "langile", "type": "Langile", "health": 50, "strength": 5, "movement_points": 3, "range": 1, "civilization": null, "cost": {{"food": 15, "gold": 8}}}},
                {{"id": "gudaria", "type": "Gudaria", "health": 150, "strength": 20, "movement_points": 3, "range": 1, "civilization": "euskaldunak", "cost": {{"food": 25, "gold": 20}}}},
                {{"id": "arkari_zalduna", "type": "Arkari zalduna", "health": 125, "strength": 15, "movement_points": 4, "range": 3, "civilization": "mongolak", "cost": {{"food": 30, "gold": 20}}}},
                {{"id": "atlatl_erabiltzailea", "type": "Atlatl erabiltzailea", "health": 100, "strength": 20, "movement_points": 2, "range": 3, "civilization": "mayak", "cost": {{"food": 18, "gold": 12}}}},
                {{"id": "piromanoa", "type": "Piromanoa", "health": 80, "strength": 40, "movement_points": 2, "range": 1, "civilization": "bizantziarrak", "cost": {{"food": 22, "gold": 25}}}},
                {{"id": "arkeroa", "type": "Arkeroa", "health": 60, "strength": 15, "movement_points": 2, "range": 4, "civilization": null, "cost": {{"food": 12, "gold": 10}}}},
                {{"id": "tankea", "type": "Tankea", "health": 200, "strength": 50, "movement_points": 3, "range": 3, "civilization": null, "cost": {{"natural_resources": 50, "gold": 60}}}},
                {{"id": "itsasontzia", "type": "Itsasontzia", "health": 200, "strength": 50, "movement_points": 3, "range": 3, "civilization": null, "cost": {{"natural_resources": 30, "gold": 50}}}}
            ],
            "resources": [
                {{"id": "food", "name": "Janaria", "description": "Hiriko biztanleria hazten du"}},
                {{"id": "gold", "name": "Urrea", "description": "Eraikinak erosteko"}},
                {{"id": "natural_resources", "name": "Baliabide Naturalak", "description": "Eraikuntzarako"}},
                {{"id": "science", "name": "Zientzia", "description": "Teknologia berriak garatzeko"}},
                {{"id": "culture", "name": "Kultura", "description": "Garaipen baldintzetarako"}}
            ],
            "buildings": [
                {{"id": "aletegia", "name": "Aletegia", "bonus": "+2 food", "requirement": "buztingintza", "cost": {{"gold": 5, "natural_resources": 3, "culture": 0}}}},
                {{"id": "kuartela", "name": "Kuartela", "bonus": "Unitate militarren ekoizpena", "requirement": "burdina", "cost": {{"gold": 10, "natural_resources": 5, "culture": 2}}}},
                {{"id": "eskola", "name": "Eskola", "bonus": "+1 culture (biztanleko)", "requirement": "idazketa", "cost": {{"gold": 8, "natural_resources": 4, "culture": 4}}}},
                {{"id": "merkatua", "name": "Merkatua", "bonus": "+2 gold", "requirement": "merkataritza", "cost": {{"gold": 15, "natural_resources": 6, "culture": 3}}}},
                {{"id": "harresia", "name": "Harresia", "bonus": "Hiriaren defentsa + 50", "requirement": null, "cost": {{"gold": 6, "natural_resources": 10, "culture": 1}}}},
                {{"id": "unibertsitatea", "name": "Unibertsitatea", "bonus": "+2 culture (biztanleko)", "requirement": "ingeniaritza", "cost": {{"gold": 20, "natural_resources": 8, "culture": 8}}}}
            ],
            "technologies": [
                {{"id": "nekazaritza", "name": "Nekazaritza", "bonus": "Janaria +100 eta baliabide naturalak lortu ahal", "cost": 3, "era": "Antzinaroa", "dependencies": []}},
                {{"id": "idazketa", "name": "Idazketa", "bonus": "Eskolak desblokeatu", "cost": 8, "era": "Antzinaroa", "dependencies": ["nekazaritza"]}},
                {{"id": "penizilina", "name": "Penizilina", "bonus": "Unitate guztien bizitza +30", "cost": 15, "era": "Aro Modernoa", "dependencies": ["idazketa"]}},
                {{"id": "ekonomia", "name": "Ekonomia", "bonus": "Txanda bakoitzeko hirietatik lortzen en urre kopurua +5", "cost": 14, "era": "Erdi Aroa", "dependencies": ["idazketa"]}},
                {{"id": "merkataritza", "name": "Merkataritza", "bonus": "Merkatuak desblokeatu", "cost": 12, "era": "Aro Modernoa", "dependencies": ["ekonomia"]}},
                {{"id": "burdina", "name": "Burdina", "bonus": "+5 eraso zibilizazioaren unitate bakoitzeko eta kuartelak desblokeatu", "cost": 8, "era": "Antzinaroa", "dependencies": ["nekazaritza"]}},
                {{"id": "meatzaritza", "name": "Meatzaritza", "bonus": "Natural_resources +100", "cost": 4, "era": "Antzinaroa", "dependencies": ["burdina"]}},
                {{"id": "ingeniaritza", "name": "Ingeniaritza", "bonus": "Unibertsitateak desblokeatzen ditu", "cost": 12, "era": "Erdi Aroa", "dependencies": ["meatzaritza"]}},
                {{"id": "artilleria", "name": "Artilleria", "bonus": "Unitate militar hobeak (+10 eraso zibilizazioaren unitate bakoitzeko) eta tankeak desblokeatu", "cost": 16, "era": "Aro Modernoa", "dependencies": ["ingeniaritza"]}},
                {{"id": "espaziontzia", "name": "Espaziontzia", "bonus": "Espaziontzia eraiki eta partida irabazi", "cost": 1000, "era": "Aro Modernoa", "dependencies": []}},
                {{"id": "arkitektura", "name": "Arkitektura", "bonus": "Produkzio guztien txanda kopurua murriztu", "cost": 14, "era": "Erdi Aroa", "dependencies": ["meatzaritza"]}},
                {{"id": "buztingintza", "name": "Buztingintza", "bonus": "Aletegia desblokeatu", "cost": 5, "era": "Antzinaroa", "dependencies": []}},
                {{"id": "industria", "name": "Industria", "bonus": "Produkzio guztien txanda kopurua murriztu", "cost": 14, "era": "Aro Modernoa", "dependencies": ["buztingintza"]}},
                {{"id": "arku_tiroa", "name": "Arku Tiroa", "bonus": "Distantziako oinarrizko unitatea desblokeatu", "cost": 15, "era": "Antzinaroa", "dependencies": []}},
                {{"id": "gurpila", "name": "Gurpila", "bonus": "Unitate guztien mugimenduak +3", "cost": 10, "era": "Antzinaroa", "dependencies": []}},
                {{"id": "nabigazioa", "name": "Nabigazioa", "bonus": "Ura zeharkatzea ahalbidetzen duen itsasontzia desblokeatzen du", "cost": 6, "era": "Erdi Aroa", "dependencies": []}}
            ]
        }}

        Detalles a tener en cuenta:
        - Solo los kolonos pueden fundar ciudades
        - Solo los langiles pueden recolectar recursos y solo cuando la tecnnoloía neazaritza esta investigada
        - Los barcos solo se pueden mover por tiles de 3 (Ura) y 6 (Itsasoa)
        - Solo se pueden entrenar unidades en ciudades que tengan un kuartela y una unidad por cuartel. Si en una ciudad hay 2 cuarteles, puedes entrenar 2 unidades a la vez.
        - Depspués de atacar una ciudad o unidad enemiga, la unidad atacante no puede ni moverse ni atacar ninguna otra unidad o ciudad
        - Para recolectar recursos a partir de los map_elements el langile tiene que estar a un tile de distancia
        - Para atacar tienes que respetar el rango de ataque de la unidad
        - Para poder investigar la tecnología del cohete espacial tienes que haber investigado antes
        todas las tecnologías anteriores
        - El coste de tecnologías se mide en puntos de ciencia
        - Empizas la partida en la era Antzinaroa, cuando investigas 5 tecnologías pasas a la era Erdi Aroa y
        cuando investigas 5 tecnologías mas pasas a la era Aro Modernoa
        - Cada ciudadano consume 1 de comida por turno, así que tienes que asegurarte de tener comida suficiente porque sino
        si no hay suficiente comida, se perdera un ciudadano por ciudad cada turno hasta que haya comida suficiente
        - Ciertas unidades y edificios requieren haber investigado ciertas tecnologías para poder ser construidos o entrenados, esas dependencias
        se encuentran en el campo dependencies de cada unidad y edificio
        - Ten en cuenta los puntos de movimiento tuyos, de tus unidades y de los tiles
        - Con moveUnit solo puedes mver la unidad a un tile de distancia, si quieres moverlo mas, tienes que usar mas de un moveUnit
        y ese movimiento no puede ser a un tile de agua (3) o oceano (6)
        - Ten en cuenta que a medida que avanzas de era, las ciudades pueden tener un edificio mas

    Ahora, basandote en el estado del juego que te he dado, analiza la situación, formula una estrategia,
    y genera tu ÚNICA acción, 1 ACCIÓN, SOLO 1, razonamiento y análisis. NO USES TILDES.
    TEN EN CUENTA EN TODO MOMENTO LO QUE PUEDES HACER Y LO QUE NO PUEDE HACER, LAS UNIDADES QUE TIENES, LOS RECURSOS QUE TIENES,
    LOS EDIFICIOS QUE TIENES, LAS TECNOLOGÍAS QUE TIENES, LAS TECNOLOGÍAS QUE PUEDES INVESTIGAR, LOS EDIFICIOS QUE PUEDES HACER,
    LAS UNIDADES QUE PUEDES HACER, LOS RECURSOS QUE PUEDES RECOLECTAR Y LO QUE PUEDES HACER CON CADA ÚNICA ACCIÓN.

    AHORA, BASÁNDOTE EN LAS REGLAS DE CIVILIZATU, DEBES PROCEDER DE LA SIGUIENTE MANERA:

    - **Primer objetivo:** Es fundamental que con el "kolono" fundes una ciudad lo antes posible (`foundCity`), ya que sin ciudad no podrás producir recursos ni realizar otras acciones importantes, recuerda, SOLO EL KOLONO PUEDE FUNDAR CIUDADES.
    - **Tras fundar la ciudad:** Desarrolla y mejora tu ciudad. Construye edificios (como granero, cuartel, escuela...) y haz crecer la población para maximizar la producción de recursos.
    - **Investiga tecnologías:** Acumula ciencia e investiga nuevas tecnologías (`researchTech`) para desbloquear unidades, edificios y ventajas estratégicas.
    - **Mueve y explora con tus unidades:** Usa `moveUnit` para explorar el mapa, descubrir recursos y localizar al enemigo.
    - **Recolecta recursos:** Utiliza trabajadores para recolectar recursos (`collectResource`), pero recuerda que necesitas tener la tecnología de agricultura investigada.
    - **Entrena más unidades:** A medida que tu ciudad crece y construyes cuarteles, entrena nuevas unidades (`trainUnit`) para defensa y ataque.
    - **Ataca al enemigo:** Cuando sea oportuno, ataca unidades o ciudades enemigas (`attackUnit`, `attackCity`), pero analiza siempre tu fuerza y defensa antes de atacar.
    - **Avanza de era:** Cuando hayas investigado 5 tecnologías de una era, podrás avanzar a la siguiente era (`upgradeCityEra`), lo que te dará más ventajas y opciones.
    - **Finaliza el turno:** Cuando no puedas o no debas hacer más acciones, termina el turno con `endTurn`.

    Antes de elegir cada acción, analiza bien la situación: qué recursos tienes, qué unidades y edificios posees, qué tecnologías has investigado, la posición del enemigo y tus objetivos estratégicos. No te limites a mover unidades; valora fundar nuevas ciudades, investigar tecnologías, construir edificios o recolectar recursos. Tu objetivo es desarrollar tu civilización de la forma más rápida y sólida posible, eligiendo siempre la acción más estratégica en cada momento.

    Recuerda: al principio, lo más importante es fundar una ciudad cuanto antes, y después, en cada turno, analiza la situación y elige la acción más estratégica posible.
```

---