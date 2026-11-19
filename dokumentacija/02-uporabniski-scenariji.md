# BigDeal – Ključni uporabniški scenariji

Za vsak scenarij so določeni akterji, cilj, predpogoji, vhodni podatki, glavni in alternativni poteki ter pričakovani rezultat.

Scenariji so razdeljeni glede na dve glavni uporabniški vlogi: **kupec** in **ponudnik**.

Celoten pregled funkcionalnosti je prikazan v [opisu projekta in diagramu primerov uporabe](01-opis-projekta.md).

---

## 1. Scenariji kupca

### K-01 – Registracija in prijava uporabnika

**Akterji:** Kupec, sistem

**Cilj:** Ustvariti uporabniški račun in pridobiti dostop do osebnih funkcionalnosti aplikacije.

**Predpogoji:** Uporabnik ima nameščeno aplikacijo in internetno povezavo. Za prijavo mora imeti ustvarjen račun.

**Vhodi:** Registracijski podatki oziroma prijavni podatki uporabnika.

**Glavni potek:**

1. Kupec odpre aplikacijo in izbere registracijo.
2. Sistem prikaže obrazec za registracijo.
3. Kupec vnese zahtevane podatke in potrdi registracijo.
4. Sistem preveri podatke in ustvari uporabniški račun.
5. Kupec izbere prijavo in vnese prijavne podatke.
6. Sistem preveri podatke ter omogoči dostop do osebnega profila.

**Alternativni poteki:**

- **A1:** Kupec že ima račun – izbere prijavo brez ponovne registracije.
- **A2:** Podatki so neveljavni ali nepopolni – sistem zahteva popravek.
- **A3:** Račun že obstaja – sistem zavrne ponovno registracijo.
- **A4:** Prijavni podatki so napačni – sistem prikaže obvestilo o neuspešni prijavi.

**Izhodi:** Ustvarjen račun in potrditev uspešne prijave.

**Končni rezultat:** Kupec je prijavljen in lahko uporablja funkcionalnosti, ki zahtevajo uporabniški račun.

### K-02 – Iskanje in filtriranje ponudb

**Akterji:** Kupec, sistem

**Cilj:** Poiskati ustrezne lokalne ponudbe glede na želje in lokacijo kupca.

**Predpogoji:** V sistemu obstajajo objavljene ponudbe. Prijava za osnovno pregledovanje ni obvezna.

**Vhodi:** Iskalni izraz, kategorija izdelkov, vrsta ponudbe, lokacija, cenovni razpon in višina popusta.

**Glavni potek:**

1. Kupec odpre seznam aktualnih ponudb.
2. Sistem prikaže promocijske in rezervacijske ponudbe.
3. Kupec vnese iskalni izraz oziroma izbere filtre.
4. Sistem posodobi seznam glede na izbrane pogoje.
5. Kupec lahko preklopi na zemljevid in pregleda lokacije ponudnikov.
6. Kupec izbere ponudbo za podrobnejši pregled.

**Alternativni poteki:**

- **A1:** Ni ustreznih ponudb – sistem prikaže obvestilo in omogoči spremembo filtrov.
- **A2:** Dostop do lokacije ni dovoljen – kupec lahko ročno izbere območje.
- **A3:** Internetna povezava ni na voljo – sistem prikaže obvestilo o napaki.

**Izhodi:** Seznam oziroma zemljevid ustreznih ponudb.

**Končni rezultat:** Kupec najde ponudbo, ki jo želi podrobneje pregledati.

### K-03 – Pregled podrobnosti ponudbe

**Akterji:** Kupec, sistem

**Cilj:** Pridobiti podrobne informacije o izbrani ponudbi in možnostih nakupa oziroma rezervacije.

**Predpogoji:** Kupec je izbral ponudbo iz seznama ali zemljevida.

**Vhodi:** Identifikator izbrane ponudbe.

**Glavni potek:**

1. Kupec odpre izbrano ponudbo.
2. Sistem prikaže naziv, opis, fotografije, kategorijo, cene in popust.
3. Prikaže tudi podatke o ponudniku, lokaciji in obdobju veljavnosti.
4. Pri rezervacijski ponudbi prikaže razpoložljivo količino in možnost rezervacije.
5. Pri promocijski ponudbi prikaže pogoje akcije brez možnosti rezervacije.

**Alternativni poteki:**

- **A1:** Ponudba je potekla ali neaktivna – sistem prikaže obvestilo o nerazpoložljivosti.
- **A2:** Nekateri podatki manjkajo – sistem prikaže razpoložljive informacije in onemogoči neveljavna dejanja.

**Izhodi:** Podrobnosti ponudbe in razpoložljive možnosti nadaljevanja.

**Končni rezultat:** Kupec razume pogoje ponudbe in se lahko odloči za rezervacijo ali obisk ponudnika.

### K-04 – Rezervacija ponudbe in pridobitev QR-kode

**Akterji:** Kupec, sistem

**Cilj:** Rezervirati izbrani izdelek in pridobiti QR-kodo za osebni prevzem.

**Predpogoji:** Kupec je prijavljen. Ponudba je aktivna, omogoča rezervacije ter ima razpoložljivo količino in termin prevzema.

**Vhodi:** Izbrana ponudba, količina in termin prevzema.

**Glavni potek:**

1. Kupec odpre rezervacijsko ponudbo in izbere »Rezerviraj«.
2. Določi količino izdelkov in termin prevzema.
3. Sistem prikaže povzetek rezervacije.
4. Kupec potrdi rezervacijo.
5. Sistem preveri razpoložljivost in shrani rezervacijo.
6. Sistem ustrezno zmanjša razpoložljivo količino izdelkov.
7. Ustvari QR-kodo in prikaže potrditev rezervacije z lokacijo ter terminom prevzema.

**Alternativni poteki:**

- **A1:** Kupec ni prijavljen – sistem ga preusmeri na prijavo.
- **A2:** Zahtevana količina ni na voljo – sistem prikaže obvestilo oziroma predlaga manjšo količino.
- **A3:** Termin ni več razpoložljiv ali je ponudba potekla – rezervacija ni mogoča.
- **A4:** Shranjevanje rezervacije ne uspe – sistem prikaže napako in rezervacije ne potrdi.

**Izhodi:** Potrditev rezervacije, QR-koda in podatki o prevzemu.

**Končni rezultat:** Rezervacija je uspešno ustvarjena in pripravljena za osebni prevzem.

### K-05 – Pregled rezervacij in zgodovine

**Akterji:** Kupec, sistem

**Cilj:** Pregledati aktivne in pretekle rezervacije ter ocenjene prihranke.

**Predpogoji:** Kupec je prijavljen.

**Vhodi:** Uporabniški račun in po potrebi izbrani status rezervacije.

**Glavni potek:**

1. Kupec odpre razdelek »Moje rezervacije«.
2. Sistem prikaže seznam aktivnih in preteklih rezervacij.
3. Kupec izbere posamezno rezervacijo.
4. Sistem prikaže podrobnosti, status, lokacijo in termin prevzema.
5. Pri aktivni rezervaciji prikaže tudi QR-kodo.
6. Kupec odpre pregled prihrankov.
7. Sistem prikaže informativni izračun prihrankov pri rezerviranih oziroma prevzetih izdelkih.

**Alternativni poteki:**

- **A1:** Kupec nima rezervacij – sistem prikaže prazno stanje.
- **A2:** Podatkov ni mogoče pridobiti – sistem prikaže obvestilo o napaki.
- **A3:** Rezervacija ni več aktivna – sistem prikaže njen status in onemogoči uporabo neveljavne QR-kode.

**Izhodi:** Seznam rezervacij, podrobnosti in ocenjeni prihranki.

**Končni rezultat:** Kupec ima pregled nad svojimi rezervacijami in zgodovino.

---

## 2. Scenariji ponudnika

### P-01 – Registracija ponudnika in upravljanje profila podjetja

**Akterji:** Ponudnik, sistem

**Cilj:** Ustvariti in upravljati profil podjetja.

**Predpogoji:** Ponudnik ima dostop do aplikacije in potrebne podatke o podjetju.

**Vhodi:** Naziv podjetja, vrsta dejavnosti, opis, naslov, lokacija in kontaktni podatki.

**Glavni potek:**

1. Ponudnik izbere možnost registracije ponudnika.
2. Sistem prikaže obrazec za ustvarjanje profila podjetja.
3. Ponudnik vnese podatke in izbere vrsto dejavnosti.
4. Sistem preveri podatke in ustvari profil podjetja.
5. Ponudnik odpre urejanje profila.
6. Po potrebi spremeni opis, lokacijo ali kontaktne podatke.
7. Sistem shrani spremembe in posodobi prikaz podjetja.

**Alternativni poteki:**

- **A1:** Obvezni podatki manjkajo ali niso veljavni – sistem zahteva popravek.
- **A2:** Uporabniški račun že obstaja – ponudnik se prijavi z obstoječim računom.
- **A3:** Shranjevanje sprememb ne uspe – sistem prikaže obvestilo o napaki.

**Izhodi:** Ustvarjen oziroma posodobljen profil podjetja.

**Končni rezultat:** Ponudnik ima urejen profil podjetja in lahko objavlja ponudbe.

### P-02 – Objava promocijske ponudbe

**Akterji:** Ponudnik, sistem

**Cilj:** Objaviti promocijsko akcijo ali popust brez možnosti rezervacije v aplikaciji.

**Predpogoji:** Ponudnik je prijavljen in ima ustvarjen profil podjetja.

**Vhodi:** Naziv, opis, kategorija, fotografija, podatki o ceni oziroma popustu in obdobje veljavnosti.

**Glavni potek:**

1. Ponudnik odpre upravljanje ponudb.
2. Izbere možnost »Nova ponudba«.
3. Izbere vrsto »Promocijska ponudba«.
4. Vnese zahtevane podatke in določi obdobje veljavnosti.
5. Sistem preveri pravilnost podatkov.
6. Ponudnik potrdi objavo.
7. Sistem shrani ponudbo in jo prikaže kupcem brez možnosti rezervacije.

**Alternativni poteki:**

- **A1:** Cena, popust ali obdobje veljavnosti niso pravilni – sistem zahteva popravek.
- **A2:** Manjkajo obvezni podatki – objava ni mogoča.
- **A3:** Shranjevanje ali nalaganje fotografije ne uspe – sistem prikaže obvestilo o napaki.

**Izhodi:** Objavljena promocijska ponudba.

**Končni rezultat:** Kupci lahko pregledujejo akcijo in opravijo nakup neposredno pri ponudniku.

### P-03 – Objava rezervacijske ponudbe

**Akterji:** Ponudnik, sistem

**Cilj:** Objaviti izdelek, ki ga lahko kupci rezervirajo za osebni prevzem.

**Predpogoji:** Ponudnik je prijavljen in ima urejen profil podjetja.

**Vhodi:** Naziv, opis, kategorija, fotografija, redna in znižana cena, količina, obdobje veljavnosti in termini prevzema.

**Glavni potek:**

1. Ponudnik odpre obrazec za novo ponudbo.
2. Izbere vrsto »Rezervacijska ponudba«.
3. Vnese podatke o izdelku, ceni in popustu.
4. Določi razpoložljivo količino ter termine in lokacijo prevzema.
5. Sistem preveri pravilnost podatkov.
6. Ponudnik potrdi objavo.
7. Sistem shrani ponudbo in jo omogoči kupcem za pregled ter rezervacijo.

**Alternativni poteki:**

- **A1:** Količina ali termin prevzema nista veljavna – sistem zahteva popravek.
- **A2:** Manjkajo obvezni podatki – ponudbe ni mogoče objaviti.
- **A3:** Objava ne uspe – sistem prikaže obvestilo o napaki.

**Izhodi:** Objavljena rezervacijska ponudba z določeno količino in termini prevzema.

**Končni rezultat:** Kupci lahko rezervirajo izdelke skladno z razpoložljivostjo.

### P-04 – Pregled rezervacij in potrditev prevzema s QR-kodo

**Akterji:** Ponudnik, kupec, sistem

**Cilj:** Pregledati prejete rezervacije in potrditi izročitev rezerviranih izdelkov.

**Predpogoji:** Ponudnik je prijavljen in obstaja rezervacija njegove ponudbe. Kupec ob prevzemu predloži QR-kodo.

**Vhodi:** Izbrana rezervacija oziroma QR-koda ter potrditev prevzema.

**Glavni potek:**

1. Ponudnik odpre seznam prejetih rezervacij.
2. Sistem prikaže rezervacije in njihove statuse.
3. Kupec pride na lokacijo ponudnika in predloži QR-kodo.
4. Ponudnik s kamero naprave skenira QR-kodo.
5. Sistem preveri veljavnost rezervacije in njeno pripadnost ponudniku.
6. Ponudnik preveri izročitev izdelka in potrdi prevzem.
7. Sistem spremeni status rezervacije v »Prevzeto« in jo zabeleži v zgodovino.

**Alternativni poteki:**

- **A1:** QR-koda je neveljavna ali je ni mogoče prebrati – sistem prikaže napako.
- **A2:** Rezervacija je že prevzeta, potekla ali ne pripada ponudniku – sistem zavrne potrditev.
- **A3:** Kupec še ni opravil plačila ali prevzema – ponudnik rezervacije ne potrdi.
- **A4:** Posodobitev statusa ne uspe – sistem prikaže obvestilo in ohrani prejšnji status.

**Izhodi:** Preverjena rezervacija in potrditev prevzema.

**Končni rezultat:** Rezervacija ima status »Prevzeto« in je vključena v zgodovino kupca ter ponudnika.

---

## 3. Povezana dokumentacija

- [Opis projekta in diagram primerov uporabe](01-opis-projekta.md)
- [Arhitektura sistema](03-arhitektura.md)
- [Podatkovni model](04-podatkovni-model.md)
- [Pravila razvoja](05-pravila-razvoja.md)