# CIVilizaTu: Jokoaren Arauen Dokumentazioa (Euskaraz)

## 1. Sarrera

**CIVilizaTu** txandakako estrategia-jokoa da, Civilization joko klasikoan inspiratuta. Jokalariak eta IA aurkariak zibilizazio bana gidatzen dute, hiriak sortuz, baliabideak kudeatuz, teknologia berriak ikertuz eta garaipen baldintzak lortzen saiatuz. Jokoa web bidezkoa da eta GroQ hizkuntza-ereduarekin integratutako IA du.

Dokumentu honetan jokoaren arau guztiak, mekanikak eta elementu guztiak zehatz-mehatz azaltzen dira.

---

## 2. Oinarrizko Helburua

Jokalari bakoitzaren helburua bere zibilizazioa garatzea da, hirien, baliabideen, teknologien eta armadaren bidez. Garaipena lortzeko hiru bide nagusi daude:

- **Konkista militarra:** Etsaiaren hiri guztiak konkistatzea.
- **Zientzia garaipena:** "Espaziontzia" teknologia ikertzea.
- **Kultura garaipena:** 10.000 kultura puntu lortzea.

---

## 3. Zibilizazioak

Jokoan lau zibilizazio daude, bakoitzak bere hasierako baliabideekin:

| ID             | Izena         | Janaria | Urrea | Baliabide Naturalak | Zientzia | Kultura |
|----------------|---------------|---------|-------|---------------------|----------|---------|
| euskaldunak    | Euskaldunak   | 30      | 25    | 10                  | 0        | 5       |
| mongolak       | Mongolak      | 28      | 22    | 12                  | 0        | 4       |
| mayak          | Mayak         | 32      | 18    | 8                   | 0        | 6       |
| bizantziarrak  | Bizantziarrak | 26      | 28    | 14                  | 0        | 7       |

Zibilizazio bakoitzak unitate berezi bat du (adibidez, "gudaria" euskaldunentzat).

---

## 4. Mapa eta Lurraldeak

- **Mapa**: 50x50 tamainako sareta da.
- **Lurralde motak**: 7 mota daude:
    - 0: Lautada (1 mugimendu, ez du itsasontzirik behar)
    - 1: Basoa (2 mugimendu)
    - 2: Mendia (2 mugimendu)
    - 3: Ura (1 mugimendu, itsasontzia behar du)
    - 4: Desertua (3 mugimendu)
    - 5: Pantano (3 mugimendu)
    - 6: Itsasoa (1 mugimendu, itsasontzia behar du)
- **Fog of War**: Esploratu gabeko eremuak ezkutuan daude. Unitateek inguruko tileak deskubritzen dituzte.

---

## 5. Hiriak

- Hiriak sortzeko "kolono" unitatea behar da.
- Hiri bakoitzak populazioa, eraikinak, produkzioa eta baliabideak ditu.
- Hiriaren hazkundea janariaren arabera gertatzen da.
- Eraikinak eraiki daitezke, bakoitzak bonus edo efektu bereziak ematen ditu.
- Hiri bakoitzak eraikin kopuru maximo bat izan dezake aroaren arabera.

### Hiriaren aroak:

| Aro           | Hurrengoa        | Upgrade kostua (urrea/nat. res.) | Oinarrizko produkzioa (janaria/urrea/kultura/zientzia/nat. res.) | Eraikin muga |
|---------------|------------------|-----------------------------------|------------------------------------------------------------------|--------------|
| Antzinaroa    | Erdi Aroa        | 150 / 80                          | 2 / 1 / 0 / 0 / 1                                                | 4            |
| Erdi Aroa     | Aro Modernoa     | 300 / 160                         | 4 / 2 / 1 / 1 / 2                                                | 5            |
| Aro Modernoa  | -                | 0 / 0                             | 6 / 4 / 2 / 3 / 3                                                | 6            |

---

## 6. Eraikinak

| ID             | Izena           | Bonus                                    | Eskakizuna      | Kostua (urrea/nat. res./kultura) |
|----------------|-----------------|------------------------------------------|-----------------|----------------------------------|
| aletegia       | Aletegia        | +2 janari                                | buztingintza    | 7 / 4 / 0                        |
| kuartela       | Kuartela        | Unitate militarren ekoizpena             | burdina         | 12 / 7 / 2                       |
| eskola         | Eskola          | +1 kultura (biztanleko)                  | idazketa        | 10 / 5 / 4                       |
| merkatua       | Merkatua        | +2 urre                                  | merkataritza    | 18 / 8 / 3                       |
| harresia       | Harresia        | Hiriaren defentsa +50                    | -               | 8 / 12 / 1                       |
| unibertsitatea | Unibertsitatea  | +2 kultura (biztanleko)                  | ingeniaritza    | 24 / 10 / 8                      |

Eraikin batzuk teknologia zehatzak behar dituzte desblokeatzeko.

---

## 7. Unitateak

| ID                   | Izena                | Bizitza | Indarra | Mugimenduak | Distantzia | Zibilizazioa      | Kostua (janari/urrea/nat. res.) | Eskakizunak         |
|----------------------|----------------------|---------|---------|-------------|------------|-------------------|-------------------------------|---------------------|
| militar              | Militar              | 75      | 15      | 3           | 1          | -                 | 12 / 8                        | -                   |
| kolono               | Kolono               | 50      | 5       | 4           | 1          | -                 | 22 / 15                       | -                   |
| langile              | Langile              | 50      | 5       | 3           | 1          | -                 | 14 / 7                        | -                   |
| gudaria              | Gudaria              | 120     | 22      | 3           | 1          | euskaldunak       | 28 / 20                       | -                   |
| arkari_zalduna       | Arkari zalduna       | 110     | 16      | 4           | 3          | mongolak          | 32 / 22                       | -                   |
| atlatl_erabiltzailea | Atlatl erabiltzailea | 90      | 18      | 2           | 3          | mayak             | 20 / 14                       | -                   |
| piromanoa            | Piromanoa            | 80      | 32      | 2           | 1          | bizantziarrak     | 24 / 28                       | -                   |
| arkeroa              | Arkeroa              | 60      | 13      | 2           | 4          | -                 | 14 / 12                       | arku_tiroa          |
| tankea               | Tankea               | 180     | 40      | 3           | 3          | -                 | 45 nat. res. / 55 urre         | artilleria          |
| itsasontzia          | Itsasontzia          | 160     | 35      | 3           | 3          | -                 | 28 nat. res. / 40 urre         | nabigazioa          |

Unitate bakoitzak mugimendu-puntuak, bizitza, indarra eta distantzia ditu. Unitate bereziak zibilizazio jakin batekoak dira.

---

## 8. Baliabideak

- **Janaria (food):** Hiriaren hazkundea.
- **Urrea (gold):** Eraikinak eta unitateak erosteko.
- **Baliabide naturalak (natural_resources):** Eraikuntzarako.
- **Zientzia (science):** Teknologia berriak ikertzeko.
- **Kultura (culture):** Garaipen baldintzetarako.

---

## 9. Teknologiak

Teknologia bakoitzak bonus edo desblokeo bat ematen du. Teknologiak ikertzeko zientzia behar da eta batzuk beste teknologia batzuen menpe daude. Teknologia batzuk eraikinak edo unitateak desblokeatzeko beharrezkoak dira.

| ID               | Izena           | Bonus                                                         | Kostua | Aro           | Menpekotasunak         |
|------------------|-----------------|---------------------------------------------------------------|--------|---------------|------------------------|
| nekazaritza      | Nekazaritza     | Janaria +100 eta baliabide naturalak lortu ahal               | 4      | Antzinaroa    | -                      |
| idazketa         | Idazketa        | Eskolak desblokeatu                                           | 9      | Antzinaroa    | nekazaritza            |
| penizilina       | Penizilina      | Unitate guztien bizitza +30                                   | 18     | Aro Modernoa  | idazketa               |
| ekonomia         | Ekonomia        | Txanda bakoitzeko hirietatik lortzen den urre kopurua +5      | 15     | Erdi Aroa     | idazketa               |
| merkataritza     | Merkataritza    | Merkatuak desblokeatu                                         | 13     | Aro Modernoa  | ekonomia               |
| burdina          | Burdina         | +5 eraso unitate bakoitzeko eta kuartelak desblokeatu         | 9      | Antzinaroa    | nekazaritza            |
| meatzaritza      | Meatzaritza     | +100 baliabide natural                                        | 5      | Antzinaroa    | burdina                |
| ingeniaritza     | Ingeniaritza    | Unibertsitateak desblokeatzen ditu                            | 13     | Erdi Aroa     | meatzaritza            |
| artilleria       | Artilleria      | Unitate militar hobeak (+10 eraso) eta tankeak desblokeatu    | 18     | Aro Modernoa  | ingeniaritza           |
| espaziontzia     | Espaziontzia    | Espaziontzia eraiki eta partida irabazi                       | 1000   | Aro Modernoa  | - (aurretik guztiak)   |
| arkitektura      | Arkitektura     | Produkzio guztien txanda kopurua murriztu                     | 15     | Erdi Aroa     | meatzaritza            |
| buztingintza     | Buztingintza    | Aletegia desblokeatu                                          | 6      | Antzinaroa    | -                      |
| industria        | Industria       | Produkzio guztien txanda kopurua murriztu                     | 15     | Aro Modernoa  | buztingintza           |
| arku_tiroa       | Arku Tiroa      | Distantziako oinarrizko unitatea desblokeatu                  | 12     | Antzinaroa    | -                      |
| gurpila          | Gurpila         | Unitate guztien mugimenduak +3                                | 11     | Antzinaroa    | -                      |
| nabigazioa       | Nabigazioa      | Ura zeharkatzea ahalbidetzen duen itsasontzia desblokeatzen du| 7      | Erdi Aroa     | -                      |

---

### Teknologien arbola (menpekotasunak):

```text
nekazaritza
├── idazketa
│   ├── penizilina
│   └── ekonomia
│       └── merkataritza
├── burdina
│   └── meatzaritza
│       ├── ingeniaritza
│       │   └── artilleria
│       └── arkitektura
buztingintza
└── industria
arku_tiroa
gurpila
nabigazioa

espaziontzia (ikertzeko, aurretik beste teknologia guztiak behar dira)
```

---

### Teknologia bakoitzaren erabilera eta desblokeo nagusiak:

- **nekazaritza**: Oinarrizko baliabideak lortzeko eta beste teknologia askoren abiapuntua.
- **idazketa**: Eskolak eraikitzeko aukera.
- **burdina**: Kuartelak eraikitzeko eta unitate militarrak entrenatzeko aukera.
- **meatzaritza**: Baliabide natural gehiago eta beste teknologia aurreratuagoak.
- **ingeniaritza**: Unibertsitateak eraikitzeko aukera.
- **artilleria**: Tankeak eta unitate militar indartsuak.
- **arkitektura**: Eraikuntza azkarragoa.
- **buztingintza**: Aletegia eraikitzeko aukera.
- **industria**: Produkzio azkarragoa.
- **arku_tiroa**: Arkeroak entrenatzeko aukera.
- **gurpila**: Unitate guztien mugimendua handitzen du.
- **nabigazioa**: Itsasontziak eta uraren gaineko mugimendua.
- **ekonomia**: Urre gehiago txanda bakoitzean.
- **merkataritza**: Merkatua eraikitzeko aukera.
- **penizilina**: Unitate guztien bizitza handitzen du.
- **espaziontzia**: Espaziontzia eraikitzeko eta zientzia garaipena lortzeko aukera.

---

## 10. Ekintzak eta Txanda Mekanika

### Ekintza motak:

- **Unitatea mugitu** (`moveUnit`): Unitatea posizio batera mugitu.
- **Unitatearekin erasotu** (`attackUnit`): Unitate batek beste bati erasotzen dio.
- **Hiriari erasotu** (`attackCity`): Unitate batek hiri bati erasotzen dio.
- **Hiria sortu** (`foundCity`): Kolono batekin hiri berria sortu.
- **Hiriaren populazio/ekoizpena aldatu** (`changeCityPopulationProduction`): Hiriaren populazioaren ekoizpena aldatu.
- **Baliabidea bildu** (`collectResource`): Unitate batek baliabide bat biltzen du.
- **Eraikina eraiki** (`buildBuilding`): Hiri batean eraikin bat eraiki.
- **Unitatea entrenatu** (`trainUnit`): Hiri batean unitate bat entrenatu.
- **Unitatea kokatu** (`deployUnit`): Unitate bat mapan kokatu.
- **Teknologia ikertu** (`researchTech`): Teknologia berri bat ikertu.
- **Hiriaren aroa igo** (`upgradeCityEra`): Hiriaren aroa hurrengo fasera igo.
- **Txanda amaitu** (`endTurn`): Txanda amaitu eta beste jokalariari pasa.

### Txanda fluxua:

1. Jokalariak ekintzak egiten ditu (unitateak mugitu, eraikinak eraiki, teknologia ikertu, etab.).
2. "Txanda amaitu" botoia sakatzean, IA-k bere ekintzak egiten ditu.
3. Baliabideak ekoizten dira, hiriak hazten dira eta egoera eguneratzen da.
4. Garaipen edo porrota baldintzak betetzen badira, partida amaitzen da.

---

## 11. Fog of War eta Esplorazioa

- Hasieran, mapa guztia "fog of war" egoeran dago (ezkutuan).
- Unitateek inguruko tileak deskubritzen dituzte mugimenduan.
- Fog of war boolean balioekin kudeatzen da (true/false).

---

## 12. Garaipen eta Porrota Baldintzak

- **Konkista:** Etsaiaren hiri guztiak konkistatzen badituzu, irabazten duzu.
- **Zientzia:** "Espaziontzia" teknologia ikertzen baduzu, irabazten duzu.
- **Kultura:** 10.000 kultura puntu lortzen badituzu, irabazten duzu.
- **Porrota:** Zure hiri guztiak galtzen badituzu edo ezin baduzu ekintzarik egin, galtzen duzu.

---

## 13. Trikimailu Sistema (Cheat Codes)

F1 sakatuz trikimailu consola ireki daiteke. Kode batzuk:

- **eraiki_guztiak**: Hiri batean eraikin guztiak eraikitzen ditu.
- **berehalako_porrota**: Berehala galtzen duzu.
- **berehalako_garaipena**: Berehala irabazten duzu (argumentuarekin: 1=zientzia, 2=kultura, gabe=konkista).
- **tanke_eskuadroia**: 5 tanke gehitzen ditu hiri batean.
- **teknologia_aurreratua**: Teknologia guztiak desblokeatzen ditu (espaziontzia izan ezik).
- **maila_igo**: Hiriaren aroa igotzen du.
- **baliabide_maximoak**: Baliabide guztiak maximoan jartzen ditu (0=jokalaria, 1=IA).
- **mugimendu_infinitua**: Unitate guztiei mugimendu infinitua ematen die (0=jokalaria, 1=IA).
- **aro_modernoa**: Aro Modernora igarotzen du (0=jokalaria, 1=IA).
- **mapa_agertu**: Mapa osoa agerrarazten du (0=jokalaria, 1=IA).

---

## 14. IA Aurkariaren Portaera

- IA GroQ hizkuntza-ereduarekin integratuta dago.
- IA-k txanda bakoitzean ekintza bakarra edo ekintza sekuentzia bat egiten du (unitate mugimenduak, eraikuntzak, ikerketak, etab.).
- IA-k ez du informazio ezkuturik erabiltzen; soilik ikusgai duen mapa eta egoera erabiltzen ditu.

---

## 15. Beste Araudi eta Ohar Garrantzitsuak

- Ez daude tile mugimenduetan diagonalen murrizketarik, baina mugimendu kostuak lurralde motaren arabera kalkulatzen dira.
- Unitateak ezin dira kokatu ur edo itsasoko tileetan itsasontzirik gabe.
- Baliabideak ezin dira bildu tile egokian ez badago unitaterik edo teknologia egokirik.
- Eraikinak eta unitateak eraikitzeko beharrezko baliabideak eta teknologia menpekotasunak bete behar dira.
- Partidak JSON formatuan gordetzen dira eta edozein momentutan kargatu daitezke.

---

## 16. Eranskina: Mapan Agertzen diren Baliabideak

| ID        | Izena    | Bonusak                        |
|-----------|----------|-------------------------------|
| arbola    | Arbola   | +1 janari, +1 baliabide nat.  |
| harria    | Harria   | +2 baliabide naturalak         |
| urrea     | Urrea    | +3 urre                        |
| ganadua   | Ganadua  | +2 janari                      |
| burdina   | Burdina  | +2 baliabide nat., +1 urre     |
| egurra    | Egurra   | +1 baliabide naturalak         |
| zientzia  | Zientzia | +5 zientzia                    |

---

## 17. Oharrak

- Joko hau hezkuntza-helburuetarako soilik da.
- Baliabide grafiko guztiak IA bidez sortuak dira edo domeinu publikokoak.
- Ez da joko komertzialik kopiatu edo erabilitako aktiborik.

---

**Dokumentu hau eguneratua izan behar da jokoaren bertsio berriekin.**
