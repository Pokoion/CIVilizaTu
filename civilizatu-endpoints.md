# Endpoint Dokumentazioa - CIVilizaTu

## 1. Erabiltzaileen Autentifikazioa eta Kudeaketa

### 1.1. Erabiltzaile Erregistroa
**Endpoint:** `POST /api/auth/register`  
**Deskribapena:** Erabiltzaile berri bat erregistratzen du sisteman.  
**Eskaeraren gorputza (JSON):**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```
**Erantzuna (JSON):**
```json
{
  "message": "Erabiltzailea arrakastaz erregistratu da",
  "user_id": "string"
}
```

### 1.2. Saioa Hastea
**Endpoint:** `POST /api/auth/login`  
**Deskribapena:** Erabiltzailea autentifikatzen du eta JWT token bat itzultzen du.  
**Eskaeraren gorputza (JSON):**
```json
{
  "email": "string",
  "password": "string"
}
```
**Erantzuna (JSON):**
```json
{
  "token": "string",
  "user_id": "string"
}
```

### 1.3. Erabiltzailearen Profila
**Endpoint:** `GET /api/auth/profile`  
**Deskribapena:** Autentifikatutako erabiltzailearen profilaren informazioa itzultzen du.  
**Header-ak:**
```
Authorization: Bearer <token>
```
**Erantzuna (JSON):**
```json
{
  "user_id": "string",
  "username": "string",
  "email": "string",
  "created_at": "string"
}
```

### 1.4. Profila Eguneratzea
**Endpoint:** `PUT /api/auth/profile`  
**Deskribapena:** Autentifikatutako erabiltzailearen profilaren informazioa eguneratzen du.  
**Header-ak:**
```
Authorization: Bearer <token>
```
**Eskaeraren gorputza (JSON):**
```json
{
  "username": "string",
  "email": "string"
}
```
**Erantzuna (JSON):**
```json
{
  "message": "Profila arrakastaz eguneratu da"
}
```

---

## 2. Partiden Kudeaketa

### 2.1. Partida Berri Bat Sortzea
**Endpoint:** `POST /api/games`  
**Deskribapena:** Erabiltzaile autentifikatuarentzako partida berri bat sortzen du.  
**Header-ak:**
```
Authorization: Bearer <token>
```
**Eskaeraren gorputza (JSON):**
```json
{
  "name": "string",
  "scenario_id": "string"
}
```
**Erantzuna (JSON):**
```json
{
  "game_id": "string",
  "message": "Partida arrakastaz sortu da"
}
```

### 2.2. Gordetako Partidak Zerrendatzea
**Endpoint:** `GET /api/games`  
**Deskribapena:** Erabiltzaile autentifikatuaren gordetako partiden zerrenda itzultzen du.  
**Header-ak:**
```
Authorization: Bearer <token>
```
**Erantzuna (JSON):**
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

### 2.3. Partida Gordetzea
**Endpoint:** `POST /api/games/{gameId}/save`  
**Deskribapena:** Partida baten uneko egoera gordetzen du.  
**Header-ak:**
```
Authorization: Bearer <token>
```
**Eskaeraren gorputza (JSON):**
```json
{
  "game_state": { /* Jokoaren uneko egoera */ }
}
```
**Erantzuna (JSON):**
```json
{
  "message": "Partida arrakastaz gorde da"
}
```

### 2.4. Partida Kargatzea
**Endpoint:** `GET /api/games/{gameId}`  
**Deskribapena:** Gordetako partida baten egoera kargatzen du.  
**Header-ak:**
```
Authorization: Bearer <token>
```
**Erantzuna (JSON):**
```json
{
  "game_id": "string",
  "name": "string",
  "scenario_id": "string",
  "game_state": { /* Jokoaren egoera */ }
}
```

---

## 3. Eszenatokiak

### 3.1. Eszenatoki Erabilgarriak Zerrendatzea
**Endpoint:** `GET /api/scenarios`  
**Deskribapena:** Partida berriak hasteko erabilgarri dauden eszenatokien zerrenda itzultzen du.  
**Erantzuna (JSON):**
```json
[
  {
    "scenario_id": "string",
    "name": "string",
    "description": "string",
    "difficulty": "string",
    "map_size": {
      "width": "number",
      "height": "number"
    }
  }
]
```

---

## 4. Jokatzea

### 4.1. Ekintza Bat Burutzea
**Endpoint:** `POST /api/games/{gameId}/action`  
**Deskribapena:** Jokalariek beren txandan burututako ekintza bat bidaltzen du.  
**Header-ak:**
```
Authorization: Bearer <token>
```
**Eskaeraren gorputza (JSON):**
```json
{
  "action_type": "string",
  "details": { /* Ekintzaren xehetasunak */ }
}
```
**Erantzuna (JSON):**
```json
{
  "message": "Ekintza arrakastaz prozesatu da",
  "game_state": { /* Jokoaren egoera eguneratua */ }
}
```

### 4.2. Txanda Amaitzea
**Endpoint:** `POST /api/games/{gameId}/endTurn`  
**Deskribapena:** Jokalarien txanda amaitzen du eta IA-ren txanda prozesatzen du.  
**Header-ak:**
```
Authorization: Bearer <token>
```
**Erantzuna (JSON):**
```json
{
  "message": "Txanda amaitu da",
  "game_state": { /* Jokoaren egoera eguneratua */ },
  "ai_actions": [ /* IA-k burututako ekintzak */ ]
}
```

---

## 5. Trikimailuak

### 5.1. Trikimailu Bat Exekutatzea
**Endpoint:** `POST /api/games/{gameId}/cheat`  
**Deskribapena:** Uneko partidan trikimailu bat exekutatzen du.  
**Header-ak:**
```
Authorization: Bearer <token>
```
**Eskaeraren gorputza (JSON):**
```json
{
  "cheat_code": "string",
  "target": { /* Trikimailuaren helburua */ }
}
```
**Erantzuna (JSON):**
```json
{
  "message": "Trikimailua arrakastaz exekutatu da",
  "game_state": { /* Jokoaren egoera eguneratua */ }
}
```

---

## 6. LLM Zerbitzuaren Egoera

### 6.1. Zerbitzuaren Egoera Kontsultatzea
**Endpoint:** `GET /api/llm/status`  
**Deskribapena:** LLM zerbitzuaren uneko egoera itzultzen du.  
**Erantzuna (JSON):**
```json
{
  "current_model": "string",
  "available_models": ["string"],
  "model_switch_count": "number",
  "last_error_time": "number"
}
```

### 6.2. LLM-ra Kontsulta Bat Bidaltzea
**Endpoint:** `POST /api/llm/query`  
**Deskribapena:** LLM zerbitzuari kontsulta bat bidaltzen dio.  
**Eskaeraren gorputza (JSON):**
```json
{
  "query": "string",
  "force_error": "boolean"
}
```
**Erantzuna (JSON):**
```json
{
  "response": "string",
  "model": "string",
  "model_switched": "boolean",
  "previous_model": "string",
  "switch_count": "number"
}
```