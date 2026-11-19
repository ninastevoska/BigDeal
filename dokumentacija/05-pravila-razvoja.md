# BigDeal – Pravila razvoja

## 1. Namen dokumenta

Dokument določa osnovna pravila za razvoj in vzdrževanje mobilne aplikacije BigDeal. Cilj je zagotoviti dosledno poimenovanje, berljivo kodo, ponovno uporabo komponent in enoten način sodelovanja pri razvoju.

Pravila trenutno veljajo za frontend, razvit z **React Native, Expo in TypeScriptom**.

## 2. Jezik in poimenovanje

- **Koda je v angleščini:** imena datotek, komponent, funkcij, spremenljivk, tipov in vmesnikov.
- **Komentarji so v slovenščini** in se uporabljajo samo, kadar pojasnjujejo zahtevnejšo logiko ali pomembno odločitev.
- **Besedila uporabniškega vmesnika so v slovenščini.**
- Za spremenljivke in funkcije uporabljamo `camelCase`, za komponente in tipe `PascalCase`.

Primer:

```typescript
const availableOffers = await offerRepository.getAll({
  activeOnly: true,
});

function calculateDiscount(originalPrice: number, discountedPrice: number) {
  return originalPrice - discountedPrice;
}
```

Imena morajo jasno izražati namen. Izogibamo se nejasnim oznakam, kot so `data1`, `temp` ali `handleStuff`.

## 3. Organizacija kode

Vsak samostojen zaslon ima svojo mapo znotraj ustrezne funkcionalnosti.

Primer:

```text
features/
└── offers/
    ├── screens/
    │   ├── OfferList/
    │   │   ├── OfferListScreen.tsx
    │   │   └── OfferFilters.tsx
    │   └── OfferDetails/
    │       └── OfferDetailsScreen.tsx
    └── components/
        └── OfferCard.tsx
```

Upoštevamo naslednja pravila:

- `src/app/` vsebuje navigacijske datoteke Expo Routerja.
- `src/features/` vsebuje zaslone in funkcionalnosti aplikacije.
- `src/shared/` vsebuje skupne komponente in ponovno uporabne funkcije.
- `src/models/` vsebuje skupne TypeScript podatkovne modele.
- `src/data/` vsebuje dostop do podatkov in repozitorije.
- `src/theme/` vsebuje skupne nastavitve videza aplikacije.

Komponente, ki se uporabljajo na več zaslonih, ne podvajamo, ampak jih premaknemo na ustrezno skupno mesto.

## 4. Komponente in programska logika

Komponente naj imajo jasno določeno odgovornost. Obsežnejše zaslone razdelimo na manjše komponente, ki jih je mogoče samostojno vzdrževati.

Poslovne logike ne vključujemo neposredno v prikazne komponente, kadar jo je mogoče smiselno ločiti.

**Primer:** `OfferCard` skrbi za prikaz ponudbe, preverjanje razpoložljivosti in pridobivanje ponudb pa potekata v podatkovni plasti.

Za podatkovne strukture uporabljamo TypeScript tipe in vmesnike. Izogibamo se uporabi `any`, razen kadar obstaja utemeljen razlog.

## 5. Dostop do podatkov

Zasloni do podatkov dostopajo prek repozitorijev. JSON datotek in `mockStore` ne uporabljajo neposredno.

Primer pravilnega dostopa:

```typescript
const offers = await offerRepository.getAll({
  categoryId: 1,
  activeOnly: true,
});
```

Takšen način dostopa omogoča poznejšo povezavo z REST API-jem brez bistvenih sprememb zaslonov.

## 6. Oblikovanje uporabniškega vmesnika

- Barve, razmike in tipografijo določamo v skupnih datotekah `src/theme/`.
- Ponovno uporabljamo dogovorjene komponente za gumbe, vnosna polja in druge pogoste elemente.
- Zasloni morajo pravilno obravnavati nalaganje podatkov, napake in prazne rezultate.
- Uporabniški vmesnik mora biti prilagojen različnim velikostim zaslonov.

Izogibamo se ponavljanju poljubnih vrednosti barv in razmikov po posameznih komponentah.

## 7. Komentarji in berljivost

Komentiramo predvsem **zakaj** je določena logika potrebna, ne pa očitnega delovanja kode.

Primer:

```typescript
// Ceno ob rezervaciji shranimo, da poznejše spremembe ponudbe
// ne vplivajo na že potrjene rezervacije.
const unitDiscountedPrice = offer.discountedPrice;
```

Koda mora biti ustrezno formatirana, brez neuporabljenih spremenljivk in nepotrebnega podvajanja.

## 8. Git in preverjanje sprememb

- Nove funkcionalnosti razvijamo v ločenih Git vejah.
- Commit sporočila pišemo v slovenščini in jasno opišemo spremembo.
- En commit naj predstavlja eno smiselno zaključeno spremembo.
- Spremembe združujemo v `main` prek Pull Requestov.
- Pred združitvijo preverimo TypeScript in delovanje spremenjenih funkcionalnosti.

Primeri commit sporočil:

```text
Dodano: zaslon za pregled ponudb
Popravljeno: filtriranje po kategorijah
Posodobljeno: prikaz rezervacij
```

Preverjanje TypeScript kode izvedemo iz mape `mobile/`:

```bash
npx tsc --noEmit
```

Sprememb, ki povzročajo napake pri preverjanju ali onemogočajo zagon aplikacije, ne združujemo v glavno vejo.

---

Pravila se po potrebi dopolnjujejo glede na razvoj aplikacije in dogovore razvojne ekipe.