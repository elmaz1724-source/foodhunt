window.FOODHUNT_CATEGORIES = [
  {id:'burger',name:'Burger',emoji:'🍔'},
  {id:'doener',name:'Döner & Kebab',emoji:'🥙'},
  {id:'shawarma',name:'Shawarma',emoji:'🌯'},
  {id:'steak',name:'Steak',emoji:'🥩'},
  {id:'pizza',name:'Italienisch & Pizza',emoji:'🍕'},
  {id:'chicken',name:'Chicken & Koreanisch',emoji:'🍗'},
  {id:'street',name:'Street Food & Specials',emoji:'🌮'},
  {id:'asian',name:'Sushi & Asiatisch',emoji:'🍣'},
  {id:'ramen',name:'Ramen',emoji:'🍜'},
  {id:'albanian',name:'Albanische Küche',emoji:'🇦🇱'},
  {id:'balkan',name:'Balkan Street Food',emoji:'🥩'},
  {id:'desserts',name:'Cafés & Desserts',emoji:'☕'},
  {id:'brunch',name:'Brunch & Pancakes',emoji:'🥞'},
];
const rows = {
 burger: ["Burger Vision", "Traumkuh", "HOB’S", "Burger Loft", "Burger Heroes", "Superbad", "Jodie’s", "SMACO Smash Burger & Birria Tacos", "Dulf’s Burger", "Smashkönig"],
 doener: ["Antep Kebab House", "Siggys", "Özlem Köfte", "Batman", "Et Öz", "Pamukkale", "Mazador", "Lokmam", "Köfte 23", "Tadim Urfa", "Mis Tantuni", "Hakan Abi", "Honest Kebab", "Hardal", "Hazar Grill", "Kurtulan", "Ustam", "Döner Lab", "Urfa Street Food", "Traum Döner", "TimeOut Istanbul Streetfood"],
 shawarma: ["L’Amira", "Marina", "Levant Oriental Kitchen"],
 steak: ["Arizona", "MASH", "Theo’s"],
 pizza: ["L’Osteria", "60 Seconds to Napoli", "Giovannis", "Jill Neapolitanische Pizza", "Tazzi Pizza", "DaCaio", "Spaccaforno", "Farina meets Mehl", "Pizza Social Club"],
 chicken: ["Smiddys", "Der Holländer", "Josefs", "Schnitzery", "Kimchi Guys", "Your Fried Chicken", "Korea Chicken", "Seoul Station 1988"],
 street: ["Crazy Dogs", "Wrap Sache", "Bun’s", "Underdocks", "Caglar", "NYC Gyro", "Burrico", "Idikut Uyghur Restaurant"],
 asian: ["Aki Running Sushi", "Jam Jam Running Sushi", "Mr. Dumpling"],
 ramen: ["Kokomo Noodle Club"],
 albanian: ["Sofra", "Tradita", "Armends", "Konak", "Sharri"],
 balkan: ["Balkan Street Food – Burek & Ćevapčići"],
 desserts: ["Oakberry", "Lookma", "Cinnamood", "Cookie Couture", "Madame Croissant", "Giattelli", "Frida Frisch", "L’Artisan", "Cheesecake Heaven", "The Fontenay", "Backlava", "Alex", "Brühwerk", "Civat Café", "Island", "The No. 28", "Goose Café", "Palm", "The Crumble Lab", "HEFERL Patisserie & Backstube"],
 brunch: ["Pancake Panda"]
};
const marks = { 'Superbad':8.7, 'Burger Loft':8.4, 'HOB’S':8.0, 'Burger Heroes':7.8};
const suggested = new Set([
 'SMACO Smash Burger & Birria Tacos','Dulf’s Burger','Smashkönig','Traum Döner','TimeOut Istanbul Streetfood',
 'Levant Oriental Kitchen','Spaccaforno','Farina meets Mehl','Pizza Social Club','Korea Chicken','Seoul Station 1988',
 'Kokomo Noodle Club','Balkan Street Food – Burek & Ćevapčići','The Crumble Lab','HEFERL Patisserie & Backstube','Pancake Panda'
]);
window.FOODHUNT_SPOTS = Object.entries(rows).flatMap(([category,names])=>names.map((name,i)=>({
 id:category+'-'+i,name,category,score:marks[name]??null,visited:marks[name]!=null,suggested:suggested.has(name),
 favorite:false,dish:'',note:'',addedAt:'2026-10-23'
})));
