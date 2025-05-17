# CIVilizaTu - Txandakako Estrategia Jokoaren Web Aplikazioa

**CIVilizaTu** Civilization joko klasikoan inspiratutako txandakako estrategia-joko baten web aplikazioa da. Proiektu hau SGTA irakasgairako T3 taldearen lan praktiko gisa garatu dugu, helburu hezigarriekin eta inolako asmo komertzialik gabe. Jokalariak GroQ hizkuntza-ereduetan oinarritutako adimen artifizialaren aurka lehiatzen dira, euren zibilizazioa garatuz eta mapa esploratuz.

## Taldekideak

- Ibai Oñatibia
- Iker Galarraga
- Jon Olea

## Proiektuaren Ezaugarriak

- **Frontend**: React (TypeScript, Node.js)
- **Backend**: Flask (Python)
- **IA Zerbitzua**: Flask bidezko GroQ API integrazioa
- **Docker**: Osagai guztiak edukiontzietan exekutatzeko
- **MongoDB**: Datuen biltegiratzea (erabiltzaileak, partidak, eszenatokiak)

## Ohar Garrantzitsua

- Proiektu hau **ikas-proiektu originala** da, eta ez du joko komertzialik kopiatu edo erabilitako aktiborik.
- Irudi, ikono eta baliabide bisual guztiak **IA bidez sortuak** dira, eta helburu hezigarrirako soilik erabiltzen dira. Ez dute inolako irabazi asmorik.
- "IA bidez sortua hezkuntza proiekturako" aipamena baliabide guztietan ageri da.
- Ez da Civilization edo beste marka erregistraturik kopiatu; mekanikak soilik inspirazio gisa hartu dira.
- **IAren prompt-ak eta jokabidea ahalik eta gehien optimizatu eta zehaztu dira, jokaldiak eta erabakiak zentzuzkoak eta koherenteak izan daitezen. Hala ere, mugak eta probabilitatezko portaerak daude.**

> ⚠️ **ADIMEN ARTIFIZIALAREN ETA MAPEN MUGAK**  
> Joko honetako IA (GroQ hizkuntza-eredua) eta mapen sorrera ez dira perfektuak. IAren mugimenduak, ekintzak edo mapak ez dira beti optimoak edo errealistak izango. Batzuetan IA-k ez du estrategia onena aukeratuko edo mapa ez da guztiz orekatua izango. Hau proiektuaren izaera esperimental eta hezigarriaren ondorio da.
---

## Instalazio eta Exekuzio Gida

1. Proiektua klonatu:
   ```sh
   git clone <REPOSITORIOAREN_URLA>
   cd T3Praktika
   ```
2. Docker Desktop ireki eta martxan jarri.
3. `.env` fitxategiak sortu eta konfiguratu ondorengo karpetetan: `frontend/`, `backend/` eta `llm_service/`, .env.example-ren egitura berdina jarraituz (Lan praktikoaren txostenean daude .env-ean jarri beharreko gauza guztiak).
4. Proiektuaren erroan exekutatu:
   ```sh
   docker-compose up --build
   ```
5. Nabigatzailean sartu: [http://localhost:3000/](http://localhost:3000/)

---

## Jokoaren Mekanikak

- **Txandakako sistema**: Jokalariak eta IA-k txandaka jokatzen dute. Txanda bakoitzean, mugimenduak, eraikuntzak, ikerketak eta borrokak egin daitezke.
- **Mapa eta Fog of War**: Mapa 50x50 tamainakoa da eta "fog of war" sistema dauka; esploratu gabeko eremuak ezkutuan daude.
- **Hiriak eta Eraikinak**: Hiriak sortu eta eraikinak eraiki daitezke, baliabideak eta abantailak lortzeko.
- **Unitateak**: Unitate militarrak eta zibilak entrenatu eta mugitu daitezke, borroka eta esploraziorako.
- **Teknologia Zuhaitza**: Teknologiak ikertu ahala, abantaila berriak eta unitate/eraikin berriak lortzen dira.
- **Borroka Sistema**: Unitateen arteko borrokak, defentsa eta erasoko balioekin.
- **Baliabideak**: Elikagaiak, urrea, kultura, zientzia eta baliabide naturalak kudeatu behar dira.
- **Garaipen Baldintzak**: Zientzia, kultura edo konkista bidez irabazi daiteke.

### Jokoaren Fluxua

1. **Partida hasiera**: Jokalariak eta IA-k zibilizazioa eta liderra aukeratzen dute.
2. **Txandak**: Jokalariak bere txanda egiten du (unitateak mugitu, hiriak kudeatu, teknologia ikertu, etab.), ondoren IA-k bere txanda egiten du.
3. **Ekintzak**: Mugimenduak, eraikuntzak, ikerketak, borrokak eta baliabideen kudeaketa.
4. **Txanda amaiera**: Baliabideak ekoizten dira eta egoera eguneratzen da.
5. **Garaipena edo porrota**: Baldintzak betetzen direnean, partida amaitzen da.

---

## Cheat Code-ak (Trikimailuak)

Jokoan trikimailu sistema bat dago, probak eta garapena errazteko. Ctrl+Tab sakatuz ireki daiteke cheat consola.

| Kodea                | Efektua                                                                                                   | Argumentua (aukerakoa)         | Norentzat                |
|----------------------|-----------------------------------------------------------------------------------------------------------|-------------------------------|--------------------------|
| eraiki_guztiak       | Aukeratutako hirian eraikin guztiak eraikitzen ditu                                                      | -                             | Jokalaria                |
| berehalako_porrota   | Berehalako porrota                                                                                        | -                             | Jokalaria                |
| berehalako_garaipena | Berehalako garaipena ematen du. Argumentua: 1=zientzia, 2=kultura, beste edo gabe=konkista                | 1, 2 edo gabe                 | Jokalaria                |
| tanke_eskuadroia     | 5 tanke gehitzen ditu aukeratutako hiriko produkzioan                                                    | -                             | Jokalaria                |
| teknologia_aurreratua| Teknologia guztiak desblokeatzen ditu (espaziontzia izan ezik)                                           | -                             | Jokalaria                |
| maila_igo            | Aukeratutako hiriko aroa igotzen du                                                                     | -                             | Jokalaria                |
| baliabide_maximoak   | Baliabide guztiak maximoan jartzen ditu. Argumentua: 0=jokalaria, 1=IA                                   | 0 edo 1                       | Jokalaria edo IA         |
| mugimendu_infinitua  | Unitate guztiei mugimendu infinitua ematen die. Argumentua: 0=jokalaria, 1=IA                            | 0 edo 1                       | Jokalaria edo IA         |
| aro_modernoa         | Aro Modernora igarotzen du. Argumentua: 0=jokalaria, 1=IA                                                | 0 edo 1                       | Jokalaria edo IA         |
| mapa_agertu          | Mapa osoa agerrarazten du. Argumentua: 0=jokalaria, 1=IA                                                 | 0 edo 1                       | Jokalaria edo IA         |

- **0** balioa erabiltzen bada, jokalariarentzat aplikatzen da; **1** balioa erabiltzen bada, IA-rentzat.

---

## Aplikazioaren Arkitektura

CIVilizaTu lau osagai nagusik osatzen dute, bakoitza bere Docker edukiontzi propioan exekutatzen dena:

1. **Frontend**: React (TypeScript, Node.js) erabiliz garatutako web aplikazioa. Erabiltzaile-interfazea eskaintzen du eta jokalariaren ekintzak kudeatzen ditu.
2. **Backend**: Flask (Python) erabiliz garatutako REST APIa. Jokoaren logika, erabiltzaileen kudeaketa, partiden biltegiratzea eta IA zerbitzuarekin komunikazioa kudeatzen ditu.
3. **MongoDB**: Datu-base ez-errelazionala, erabiltzaileen, partiden eta eszenatokien informazioa gordetzeko.
4. **IA Zerbitzua**: Flask bidezko zerbitzua, GroQ hizkuntza-ereduekin komunikatzeko eta IA aurkariaren erabakiak lortzeko.

### Osagaien arteko komunikazioa

- **Frontend ↔ Backend**: HTTP REST API bidez, JSON formatuan. Jokoko ekintza guztiak, erabiltzaile kudeaketa eta partida egoeraren eguneraketak kanalizatzen dira.
- **Backend ↔ MongoDB**: MongoDB driver bidez, erabiltzaileen eta partiden datuak gordetzeko eta eskuratzeko.
- **Backend ↔ IA Zerbitzua**: HTTP bidez, GroQ APIra deiak egiteko eta IA-ren erabakiak jasotzeko.
- **IA Zerbitzua ↔ GroQ**: Kanpoko API deien bidez, IA aurkariaren ekintzak lortzeko.

### Fluxu orokorra

1. Erabiltzaileak frontend-etik ekintzak egiten ditu (adib. mugimenduak, eraikuntzak).
2. Ekintzak backend-era bidaltzen dira, non jokoaren logika eta balidazioa egiten diren.
3. Backend-ak datuak MongoDB-n gordetzen ditu eta, beharrezkoa bada, IA zerbitzura deiak egiten ditu IA-ren txandarako.
4. IA zerbitzuak GroQ APIra jotzen du eta jasotako erabakiak backend-era itzultzen ditu.
5. Backend-ak jokoaren egoera eguneratzen du eta emaitzak frontend-era bidaltzen ditu, jokalariari bistaratuz.

### Hedapena eta exekuzioa

Aplikazio osoa Docker edukiontzietan exekutatzen da, Docker Compose bidez orkestratua. Horrela, osagai guztiak modu isolatuan eta erraz heda daitezke, ingurune berdinetan.

---

Arkitektura honek garapen modularra, eskalagarritasuna eta mantenagarritasuna bermatzen ditu, eta proiektuaren hezkuntza-helburuak betetzeko egokia da.

---

## Dokumentazio Gehigarria

- [civilizatu-euskaraz.md](civilizatu-euskaraz.md): Proiektua egiteko hasieran emandako dokumentazioa.
- [civilizatu-endpoints.md](civilizatu-endpoints.md): Backend eta IA zerbitzuaren API endpoint-en azalpena.
- [civilizatu-rules.md](civilizatu-eusruleskaraz.md): Jokoaren logika etaerregela guztiak biltzen ditu.

---

Proiektu hau hezkuntza-helburuetarako soilik da eta ez du inolako erabilera komertzialik.