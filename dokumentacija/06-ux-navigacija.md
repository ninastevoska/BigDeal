# BigDeal – UX potek in navigacija

## 1. Namen

Dokument določa predviden uporabniški potek in navigacijo mobilne aplikacije BigDeal. Cilj je omogočiti preprosto odkrivanje lokalnih ponudb ter ločiti kupčeve funkcionalnosti od upravljanja ponudb in rezervacij na strani ponudnika.

**Osnovno načelo:** en uporabniški račun omogoča uporabo aplikacije kot kupec in, ob ustvarjenem profilu podjetja, kot ponudnik. Preklop načina ne pomeni odjave ali ustvarjanja novega računa.

> Dokument opisuje **dogovorjeno ciljno UX zasnovo**. Posamezni zasloni in poti bodo implementirani postopoma.

## 2. Prvi zagon in prijava

1. Aplikacija se odpre v **kupčevem načinu**; zaslon za izbiro vloge ob prvem zagonu ni predviden.
2. Gost lahko pregleduje, išče in filtrira ponudbe ter odpira njihove podrobnosti.
3. Za rezervacijo in dostop do osebnih funkcionalnosti je potrebna prijava oziroma registracija.
4. Če gost začne rezervacijo, ga aplikacija usmeri na prijavo in ga po uspešni prijavi vrne k izbrani ponudbi.
5. Po odjavi je znova na voljo kupčev način za goste.

## 3. Kupčev način

Spodnja navigacija vsebuje štiri zavihke:

- **Domov:** aktualne ponudbe, iskalnik, kategorije in filtri (lokacija, vrsta ponudbe, cena, popust).
- **Zemljevid:** prikaz ponudnikov oziroma ponudb glede na lokacijo; če dostop do lokacije ni dovoljen, je na voljo ročna izbira območja.
- **Rezervacije:** aktivne in pretekle rezervacije, statusi, QR-kode in ocenjeni prihranki. Za dostop je potrebna prijava.
- **Profil:** uporabniški podatki, priljubljeni ponudniki, obvestila, nastavitve in vstop v ponudnikov način.

### 3.1 Pregled ponudbe

**Domov / Zemljevid → Podrobnosti ponudbe**

Podrobnosti vključujejo opis, fotografijo, ponudnika, lokacijo, veljavnost ter podatke o ceni oziroma popustu. Nadaljnje dejanje je odvisno od vrste ponudbe:

- **Promocijska ponudba (`PROMOTION`):** prikaz pogojev akcije in lokacije ponudnika; rezervacija v aplikaciji ni mogoča.
- **Rezervacijska ponudba (`RESERVABLE`):** prikaz razpoložljivosti in možnost rezervacije.

### 3.2 Rezervacija izdelka

**Podrobnosti → Izbira količine in termina → Povzetek → Potrditev → QR-koda → Moje rezervacije**

Ob potrditvi sistem preveri veljavnost ponudbe, termin in razpoložljivo količino. Ob uspehu shrani rezervacijo, zmanjša zalogo in kupcu prikaže QR-kodo, termin ter lokacijo prevzema. V primeru napake prikaže razumljivo sporočilo in ne potrdi neuspešne rezervacije.

Plačilo poteka neposredno pri ponudniku. Aplikacija ne omogoča spletnega plačila ali dostave.

## 4. Prehod v ponudnikov način

Možnost je dostopna v **Profilu** kupčevega načina, ne v glavnem seznamu ponudb.

- **Uporabnik še nima podjetja:** vidi možnost **»Postani ponudnik«**. Sledi kratka predstavitev, obrazec za ustvarjanje profila podjetja in ob uspešnem zaključku prehod na ponudnikov pregled.
- **Uporabnik že upravlja podjetje:** vidi možnost **»Preklopi na ponudnika«**, ki odpre ponudnikov način brez ponovne prijave.
- **Uporabnik upravlja več podjetij:** v ponudnikovem načinu izbere aktivno podjetje. Prikazane ponudbe in rezervacije se nanašajo samo nanj.

V ponudnikovem načinu je vedno dostopna možnost **»Preklopi na kupca«**. Ob vrnitvi se prikaže kupčev domači zaslon.

## 5. Ponudnikov način

Ponudnik ima svojo spodnjo navigacijo s štirimi zavihki:

- **Pregled:** izbrano podjetje, ključni podatki o ponudbah, rezervacijah in prevzemih ter hitri dostop do objave ponudbe.
- **Ponudbe:** seznam lastnih ponudb, njihove podrobnosti, urejanje in ustvarjanje novih ponudb.
- **Prevzemi:** prejete rezervacije, statusi in skeniranje QR-kode za potrditev prevzema.
- **Podjetje:** podatki podjetja, urejanje profila, izbira podjetja in preklop v kupčev način.

### 5.1 Objava ponudbe

**Ponudbe → Nova ponudba → Izbira vrste → Obrazec → Predogled → Objava**

- Pri **promocijski ponudbi** ponudnik vnese opis, kategorijo, fotografijo, ceno oziroma popust ter obdobje veljavnosti. Količine in termini prevzema se ne prikazujejo.
- Pri **rezervacijski ponudbi** dodatno vnese razpoložljivo količino in termine prevzema.

Pred objavo aplikacija preveri obvezne podatke in prikaže morebitne napake.

### 5.2 Potrditev prevzema

**Prevzemi → Skeniranje QR-kode → Preverjanje rezervacije → Potrditev izročitve → Prevzeto**

Sistem preveri obstoj rezervacije, njen status, veljavnost termina in pripadnost aktivnemu podjetju. Ponudnik prevzem potrdi po izročitvi izdelka in plačilu pri ponudniku. Že prevzete, potekle ali tuje rezervacije ni mogoče ponovno potrditi.

## 6. Pravila uporabniškega vmesnika

1. **Kupčev način je privzet** tudi za uporabnika, ki upravlja podjetje.
2. **Navigacija je ločena:** kupec ne vidi ponudnikovih zavihkov, ponudnik pa v svojem načinu ne vidi kupčevih zavihkov.
3. **Prijavo zahtevamo ob dejanju**, ki potrebuje uporabniški račun, ne ob prvem ogledu ponudb.
4. **Dostop je nadzorovan:** prikrivanje gumba ni nadomestilo za preverjanje pravic. Ponudnikove poti in dejanja mora sistem preverjati tudi na zalednem sistemu.
5. **Ohranjamo uporabnikov kontekst:** po prijavi se vrne k začetemu postopku, kjer je to mogoče.
6. **Prazna stanja in napake so jasne:** če ni ponudb, rezervacij ali povezave, prikažemo ustrezno razlago in naslednji korak.
7. **Zasloni uporabljajo slovenska besedila**, dosledno poimenovanje dejanj in enotne oblikovne komponente.

## 7. Predvidena organizacija navigacije (Expo Router)

Naslednja struktura predstavlja **predlog poti**, ne nujno trenutnega stanja repozitorija. Datoteke v `src/app/` povezujejo poti z zasloni, implementiranimi v `src/features/`.

```text
mobile/src/app/
├── _layout.tsx
├── index.tsx
├── (buyer)/
│   ├── _layout.tsx
│   ├── home.tsx
│   ├── map.tsx
│   ├── reservations.tsx
│   └── profile.tsx
├── (provider)/
│   ├── _layout.tsx
│   ├── dashboard.tsx
│   ├── offers.tsx
│   ├── pickups.tsx
│   └── business.tsx
├── offer/
│   └── [id].tsx
├── reservation/
│   ├── create.tsx
│   └── [id].tsx
└── auth/
    ├── login.tsx
    └── register.tsx
```

Ob implementaciji je treba določiti tudi poti za ustvarjanje profila podjetja, objavo ponudbe in izbiro aktivnega podjetja. Dostop do zaščitenih zaslonov je odvisen od prijave in pravic uporabnika.

## 8. Povezana dokumentacija

- [Opis projekta in diagram primerov uporabe](01-opis-projekta.md)
- [Ključni uporabniški scenariji](02-uporabniski-scenariji.md)
- [Arhitektura sistema](03-arhitektura.md)
- [Podatkovni model](04-podatkovni-model.md)
- [Pravila razvoja](05-pravila-razvoja.md)
