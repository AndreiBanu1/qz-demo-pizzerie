export type MenuItem = {
  id: string;
  category: "Pizza" | "Paste" | "Desert" | "Băuturi";
  name: string;
  ingredients: string;
  priceLei: number;
  photo?: { file: string; alt: string; credit: string };
};

export const heroPhoto = {
  file: "hero-cuptor.jpg",
  alt: "Foc de lemne într-un cuptor de piatră, cu trei pizza așezate pe vatră la copt",
  credit: "Joshua Plattner",
};

export const menu: MenuItem[] = [
  {
    id: "margherita",
    category: "Pizza",
    name: "Margherita",
    ingredients: "sos de roșii, mozzarella, busuioc proaspăt",
    priceLei: 32,
    photo: {
      file: "pizza-margherita.jpg",
      alt: "Pizza Margherita cu blat pufos și ars pe margini, mozzarella topită, sos de roșii și frunze de busuioc",
      credit: "Damla Selen Demir",
    },
  },
  {
    id: "quattro-stagioni",
    category: "Pizza",
    name: "Quattro Stagioni",
    ingredients: "sos de roșii, mozzarella, ciuperci, salam, ardei iute murat, măsline",
    priceLei: 46,
    photo: {
      file: "pizza-quattro-stagioni.jpg",
      alt: "Pizza împărțită în patru sferturi, cu ciuperci, salam, ardei iute murat și roșii, pe un platou rotund de lemn",
      credit: "Beqa Tefnadze",
    },
  },
  {
    id: "diavola",
    category: "Pizza",
    name: "Diavola",
    ingredients: "sos de roșii, mozzarella, salam picant, măsline negre, rucola",
    priceLei: 42,
    photo: {
      file: "pizza-diavola.jpg",
      alt: "Pizza tăiată în felii, cu salam picant, măsline negre și rucola, pe o lopată de lemn așezată pe un blat întunecat presărat cu făină",
      credit: "Mahdi Ahmadi",
    },
  },
  {
    id: "taraneasca",
    category: "Pizza",
    name: "Țărănească",
    ingredients: "sos de roșii, mozzarella, ciuperci, ardei gras, ceapă, roșii proaspete",
    priceLei: 38,
    photo: {
      file: "pizza-taraneasca.jpg",
      alt: "Pizza întreagă pe o tavă de lemn, cu felii de roșii, ciuperci, ardei verde și ceapă peste brânză",
      credit: "Engin Akyurt",
    },
  },
  {
    id: "salami",
    category: "Pizza",
    name: "Salami",
    ingredients: "sos de roșii, mozzarella, salam, oregano",
    priceLei: 36,
    photo: {
      file: "pizza-salami.jpg",
      alt: "Pizza cu felii groase de salam și brânză topită, presărată cu oregano, pe o farfurie albă",
      credit: "Bruno Cantuária",
    },
  },
  {
    id: "pepperoni",
    category: "Pizza",
    name: "Pepperoni",
    ingredients: "sos de roșii, mozzarella, pepperoni",
    priceLei: 34,
    photo: {
      file: "pizza-pepperoni.jpg",
      alt: "O felie de pizza cu patru rondele de pepperoni, pe o farfurie albă presărată cu fulgi de ardei iute",
      credit: "Sydney Troxell",
    },
  },
  {
    id: "spaghete-bolognese",
    category: "Paste",
    name: "Spaghete Bolognese",
    ingredients: "spaghete, sos de carne de vită cu roșii, parmezan",
    priceLei: 39,
    photo: {
      file: "paste-spaghete-bolognese.jpg",
      alt: "Spaghete cu sos de carne și parmezan ras, într-un bol de lut ars, văzute de sus",
      credit: "Daniela Elena Tentis",
    },
  },
  {
    id: "spaghete-pomodoro",
    category: "Paste",
    name: "Spaghete Pomodoro",
    ingredients: "spaghete, sos de roșii cu busuioc, parmezan",
    priceLei: 33,
    photo: {
      file: "paste-spaghete-pomodoro.jpg",
      alt: "Spaghete cu sos de roșii ridicate cu o lingură de lemn din tigaie într-o farfurie albă, pe o masă de bucătărie",
      credit: "cottonbro studio",
    },
  },
  {
    id: "papanasi",
    category: "Desert",
    name: "Papanași cu smântână",
    ingredients: "papanași prăjiți, smântână, dulceață de afine",
    priceLei: 29,
  },
  {
    id: "tiramisu",
    category: "Desert",
    name: "Tiramisu",
    ingredients: "mascarpone, cafea, pișcoturi, cacao",
    priceLei: 27,
  },
  {
    id: "limonada",
    category: "Băuturi",
    name: "Limonadă de casă",
    ingredients: "lămâie, mentă, zahăr, 0,4 l",
    priceLei: 25,
  },
  {
    id: "suc-portocale",
    category: "Băuturi",
    name: "Suc de portocale",
    ingredients: "portocale presate la comandă, 0,3 l",
    priceLei: 26,
  },
  {
    id: "bere",
    category: "Băuturi",
    name: "Bere la draft",
    ingredients: "bere blondă, 0,5 l",
    priceLei: 25,
  },
];
