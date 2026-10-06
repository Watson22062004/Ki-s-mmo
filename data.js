// DỮ LIỆU GAME: muốn thêm cây / con vật / món ăn → sửa file này
const G = window.G = {};
G.CROPS = { // seed: giá hạt, time: giây lớn, color: màu vẽ
  nep:{n:'Nếp',seed:5,time:15,sell:12,color:'#e8d27a'},
  dau_xanh:{n:'Đậu xanh',seed:8,time:20,sell:18,color:'#6fae4e'},
  hanh:{n:'Hành lá',seed:4,time:12,sell:9,color:'#3f9a4a'},
  dua:{n:'Dừa',seed:15,time:35,sell:40,color:'#8b5a2b'}
};
G.ANIMALS = { // cost: giá mua, make: sản phẩm, time: giây ra sản phẩm sau khi cho ăn
  ga:{n:'Gà',cost:50,make:'trung',time:18,color:'#fff'},
  bo:{n:'Bò',cost:200,make:'sua',time:30,color:'#d9a066'}
};
G.ITEMS = { // vật phẩm khác (mua ở chợ / sản phẩm vật nuôi)
  trung:{n:'Trứng',sell:15}, sua:{n:'Sữa',sell:35},
  cam:{n:'Cám',buy:2,sell:1}, duong:{n:'Đường',buy:4,sell:2}, muoi:{n:'Muối',buy:2,sell:1}
};
for(const k in G.CROPS){const c=G.CROPS[k];G.ITEMS[k]={n:c.n,e:c.e,sell:c.sell};G.ITEMS['hat_'+k]={n:'Hạt '+c.n,buy:c.seed,sell:Math.floor(c.seed/2)}}
G.RECIPES = { // need: nguyên liệu, time: giây nấu, price: giá bán
  xoi_dau:{n:'Xôi đậu xanh',need:{nep:1,dau_xanh:1},time:6,price:45},
  xoi_man:{n:'Xôi mặn',need:{nep:1,hanh:1,trung:1,muoi:1},time:8,price:70},
  xoi_dua:{n:'Xôi dừa',need:{nep:1,dua:1,duong:1},time:8,price:95},
  flan:{n:'Bánh flan',need:{trung:2,sua:1,duong:1},time:10,price:130}
};
for(const k in G.RECIPES)G.ITEMS[k]={n:G.RECIPES[k].n,e:G.RECIPES[k].e,sell:Math.floor(G.RECIPES[k].price*.6)};
G.CFG = {plots:12,maxAnimals:6,maxCustomers:4,customerEvery:9,patience:45,startMoney:60};
