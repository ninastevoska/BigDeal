# BigDeal

**Mobilna aplikacija za odkrivanje ugodnih lokalnih ponudb**

BigDeal povezuje lokalne ponudnike s kupci, ki želijo na enem mestu odkrivati aktualne akcije, popuste in ugodne izdelke v svoji bližini. Ponudnikom omogoča večjo prepoznavnost in zmanjševanje količine neprodanih izdelkov, kupcem pa enostavno iskanje ponudb ter rezervacijo izdelkov za osebni prevzem.

## Tehnologije

- **Mobilna aplikacija:** React Native, Expo, TypeScript, Expo Router
- **Zaledni sistem:** Java 21, Spring Boot, REST API
- **Podatkovna baza :** PostgreSQL
- **Dodatne integracije:** zemljevidi, QR-kode, obvestila in shranjevanje fotografij

## Struktura projekta

```text
BigDeal/
├── mobile/          
├── backend/         
├── dokumentacija/   
├── scripts/         
└── README.md
```

## Namestitev in zagon

**Predpogoji:** Node.js in npm.

1. Kloniraj repozitorij:

```bash
git clone https://github.com/ninastevoska/BigDeal.git
cd BigDeal
```

2. Namesti odvisnosti mobilne aplikacije:

```bash
cd mobile
npm install
```

3. Zaženi razvojni strežnik:

```bash
npx expo start
```

Aplikacijo lahko zaženeš v podprtem emulatorju ali na fizični napravi. Za zagon spletne različice uporabi:

```bash
npm run web
```

### Preverjanje kode in testnih podatkov

Preverjanje TypeScript kode izvedi v mapi `mobile/`:

```bash
npx tsc --noEmit
```

Preverjanje testnih podatkov izvedi iz korenske mape projekta:

```bash
node scripts/validateMockData.cjs
```

Trenutna različica mobilne aplikacije uporablja lokalne demonstracijske podatke. Povezava z zalednim sistemom je predvidena v nadaljnjem razvoju.

## Dokumentacija

- [Opis projekta in diagram primerov uporabe](dokumentacija/01-opis-projekta.md)
- [Ključni uporabniški scenariji](dokumentacija/02-uporabniski-scenariji.md)
- [Arhitektura sistema](dokumentacija/03-arhitektura.md)
- [Podatkovni model](dokumentacija/04-podatkovni-model.md)
- [Pravila razvoja](dokumentacija/05-pravila-razvoja.md)
