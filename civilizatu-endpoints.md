# Endpoint Dokumentazioa - CIVilizaTu

## 1. Erabiltzaile Autentifikazioa eta Profila

### 1.1. Erabiltzaile Erregistroa  
**POST /api/auth/register**  
Erabiltzaile berri bat sortzen du.

**Body:**
```json
{
  "username": "string",
  "email": "string",
  "id_token": "string"
}
```
**Erantzuna:**
```json
{
  "message": "Erabiltzailea arrakastaz erregistratu da",
  "user_id": "string"
}
```

### 1.2. Saioa Hastea (Login)  
**POST /api/auth/login**  
Erabiltzailea autentifikatu eta JWT token bat itzultzen du.

**Body:**
```json
{
  "id_token": "string"
}
```
**Erantzuna:**
```json
{
  "token": "string",
  "user_id": "string"
}
```

---

## 2. Partiden Kudeaketa

### 2.1. Partida Berria Sortu  
**POST /api/games**  
Partida berri bat sortzen du eta mapa GroQ LLM bidez sortzen du.

**Header:**  
`Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "string",
  "scenario_id": "string",
  "game_state": { /* Hasierako egoera */ },
  "map_width": 50,
  "map_height": 50,
  "map_type": 0
}
```
**Erantzuna:**
```json
{
  "game": { /* Partidaren datuak */ },
  "player_positions": [ ... ],
  "ai_positions": [ ... ],
  "message": "Partida arrakastaz sortu da"
}
```

### 2.2. Partidak Zerrendatu  
**GET /api/games**  
Erabiltzailearen partiden zerrenda itzultzen du.

**Header:**  
`Authorization: Bearer <token>`

**Erantzuna:**
```json
[
  {
    "game_id": "string",
    "name": "string",
    "scenario_id": "string",
    "created_at": "string",
    "last_saved": "string"
  }
]
```

### 2.3. Partida Kargatu  
**GET /api/games/{gameId}**  
Partida baten egoera osoa itzultzen du.

**Header:**  
`Authorization: Bearer <token>`

**Erantzuna:**
```json
{
  "game_id": "string",
  "name": "string",
  "scenario_id": "string",
  "game_state": { /* Jokoaren egoera osoa */ }
}
```

### 2.4. Partida Gordetzea  
**POST /api/games/{gameId}/save**  
Partida baten uneko egoera gordetzen du.

**Header:**  
`Authorization: Bearer <token>`

**Body:**
```json
{
  "game_state": { /* Jokoaren uneko egoera */ }
}
```
**Erantzuna:**
```json
{
  "message": "Partida arrakastaz gorde da"
}
```

### 2.5. Partida Ezabatzea  
**DELETE /api/games/{gameId}**  
Partida bat ezabatzen du.

**Header:**  
`Authorization: Bearer <token>`

**Erantzuna:**
```json
{
  "message": "Partida ezabatu da"
}
```

---

## 3. IA Ekintzak (Backend ↔ LLM Zerbitzua)

### 3.1. IA-ren Ekintza Bat Eskuratu  
**POST /api/games/getIAAction**  
Jokoaren egoera bidali eta IA-k egin behar duen ekintza bat itzultzen du.

**Header:**  
`Authorization: Bearer <token>`

**Body:**
```json
{
  "game_state": { /* Jokoaren egoera osoa */ }
}
```
**Erantzuna:**
```json
{
  "action": {
    "type": "string",
    "payload": { ... }
  },
  "reasoning": "string",
  "analysis": "string"
}
```

---

## 4. LLM Zerbitzua (IA)

### 4.1. Mapa bat eskuratu  
**POST /eskuratuMapa**  
GroQ LLMari mapa bat sortzeko eskaera egiten dio edo mapa lehenetsia itzultzen du.

**Body:**
```json
{
  "width": 50,
  "height": 50,
  "map_type": 0
}
```
**Erantzuna:**
```json
{
  "terrain": [[...]],               // 50x50 matrizea, balioak: 0-6
  "visible-objects": [{...}],       // Mapako objektu ikusgaiak (arbola, harria, urrea, etab.)
  "player_start": [{...}],          // Jokalariaren hasierako posizioak
  "ai_start": [{...}]               // IA-ren hasierako posizioak
}
```

### 4.2. IA-ren ekintza bat eskuratu  
**POST /eskuratuEkintza**  
GroQ LLMari jokoaren egoera ikusgarria bidaltzen zaio eta IA-k egin behar duen ekintza bat itzultzen du.

**Body:**
```json
{
  "game_state_visible": { /* Jokoaren egoera ikusgarria */ }
}
```
**Erantzuna:**
```json
{
  "action": {
    "type": "string",      // Ekintza mota (adib. moveUnit, attackUnit, foundCity, etab.)
    "payload": { ... }     // Ekintzaren xehetasunak
  },
  "reasoning": "string",   // Estrategiaren azalpena
  "analysis": "string"     // Egoeraren analisia
}
```

---