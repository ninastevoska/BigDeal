# BigDeal – UX prototip

Interaktivni prototip mobilne aplikacije BigDeal, izdelan s HTML, CSS in JavaScript. Prikazuje predvideno uporabniško izkušnjo, navigacijo in glavne funkcionalnosti aplikacije s skupnimi demonstracijskimi podatki.

## Zagon prototipa

1. Odprite terminal v korenski mapi projekta `BigDeal/`.
2. Zaženite lokalni spletni strežnik:

   ```powershell
   py -m http.server 5500
   ```

   Če ukaz `py` ni na voljo, uporabite:

   ```powershell
   python -m http.server 5500
   ```

3. V brskalniku odprite:

   **http://localhost:5500/prototip/**

4. Prototip se samodejno odpre na kupčevem domačem zaslonu. Med zasloni se premikate s spodnjo navigacijo.

Strežnik ustavite s kombinacijo `Ctrl + C` v terminalu.

### Zemljevid ponudb

Zemljevid je dostopen prek zavihka **Zemljevid** ali neposredno na:

http://localhost:5500/prototip/pages/buyer/map/index.html

Za delovanje zemljevida je potrebna internetna povezava, saj se knjižnica Leaflet in zemljevidne ploščice OpenStreetMap nalagajo s spleta. Zaradi pravil strežnikov zemljevidnih ploščic je priporočljiv zagon prek lokalnega HTTP strežnika namesto neposrednega odpiranja HTML datotek z `file://`.

Zemljevid prikazuje demonstracijske ponudbe v Mariboru. Zelene oznake predstavljajo rezervacijske ponudbe, oranžne pa promocije. S filtri je mogoče izbirati vrsto ponudb, klik na oznako pa prikaže podrobnosti in poudari ustrezno kartico.

**Lokacije ponudb so demonstracijske** in ne predstavljajo dejanskih naslovov trgovin.

## Struktura prototipa

```text
prototip/
├── index.html             # Vstopna stran
├── css/                   
├── components/            
├── js/                    # Navigacija, logotip in testni podatki
├── assets/images/         # Fotografije ponudb
└── pages/
    ├── buyer/             
    ├── provider/          
    └── auth/              
```

Vsak zaslon ima svoje datoteke `index.html`, `style.css` in `script.js`. Skupne barve, komponente in navigacija se uporabljajo na vseh zaslonih.

## Testni podatki

Skupni demonstracijski podatki so v `js/mock-data.js` in vključujejo:

- 4 ponudnike,
- 8 kategorij,
- 6 rezervacijskih ponudb,
- 4 promocijske akcije.

Podatki so simulirani. Prototip ni povezan z zalednim sistemom ali podatkovno bazo.
