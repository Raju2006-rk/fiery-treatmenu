import { MenuItem, CategoryMeta } from '../types';

// High-resolution image assets mapped strictly for user requested items
import imgGobiFriedRice from '../assets/images/regenerated_image_1789390405487.jpg';
import imgGobiNoodles from '../assets/images/regenerated_image_1789390406840.jpg';
import imgChickenNoodles from '../assets/images/regenerated_image_1789390408270.jpg';
import imgChickenLollipop from '../assets/images/chicken_lollipop_1789392434980.jpg';
import imgCrispyWings from '../assets/images/crispy_wings_1789392454893.jpg';
import imgNonVegNuggets from '../assets/images/regenerated_image_1789390418829.jpg';
import imgPopcornChicken from '../assets/images/regenerated_image_1789390419946.jpg';
import imgSplVegBurger from '../assets/images/regenerated_image_1789390425075.jpg';
import imgCrispyChickenBurger from '../assets/images/regenerated_image_1789390431304.jpg';
import imgTandoorBurger from '../assets/images/tandoori_burger_1789392468702.jpg';
import imgChickenMomos from '../assets/images/regenerated_image_1789390818101.jpg';
import imgCrispyFriedChicken from '../assets/images/crispy_fried_chicken_1789393849879.jpg';

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'rice_noodles',
    name: 'Rice & Noodles',
    shortName: 'Rice & Noodles',
    icon: 'Bowl',
    description: 'Prepared with 100% Premium Basmathi Rice & fresh wok-tossed sauces',
    badge: 'Basmathi Rice Special',
  },
  {
    id: 'biryani',
    name: 'Dum Biryani & Combos',
    shortName: 'Biryani Special',
    icon: 'Flame',
    description: 'Signature Chicken Dum Biryani & Function / Birthday party catering combos',
    badge: 'Chef Special',
  },
  {
    id: 'fried_chicken',
    name: 'Crispy Fried Chicken',
    shortName: 'Fried Chicken',
    icon: 'Drumstick',
    description: 'Freshly seasoned, crunchy exterior and juicy tender fried chicken',
    badge: 'House Special',
  },
  {
    id: 'wings',
    name: 'Thunder Wings & Lollipops',
    shortName: 'Thunder Wings',
    icon: 'Sparkles',
    description: 'Crispy, Peri Peri, Chipotle, and tender saucy glazed wings',
  },
  {
    id: 'veg_bites',
    name: 'Veg Mini Bites',
    shortName: 'Veg Bites',
    icon: 'Salad',
    description: 'Fries, crispy nuggets, cheese pops & golden veg fingers',
  },
  {
    id: 'non_veg_bites',
    name: 'Non-Veg Mini Bites',
    shortName: 'Chicken Bites',
    icon: 'Utensils',
    description: 'Chicken strips, popcorn chicken, cheesy balls & fingers',
  },
  {
    id: 'veg_rolls',
    name: 'Veg Kathi Rolls',
    shortName: 'Veg Rolls',
    icon: 'Sandwich',
    description: 'Flaky warm wraps stuffed with spiced veggies, paneer & sauces',
  },
  {
    id: 'non_veg_rolls',
    name: 'Non-Veg Kathi Rolls',
    shortName: 'Non-Veg Rolls',
    icon: 'Egg',
    description: 'Juicy chicken, egg, and tandoori spiced kathi rolls',
  },
  {
    id: 'burgers',
    name: 'Burgers & Sandwiches',
    shortName: 'Burgers & Subs',
    icon: 'Burger',
    description: 'Loaded toasted buns and grilled sandwiches with rich fillings',
  },
  {
    id: 'momos',
    name: 'Steamed & Fried Momos',
    shortName: 'Momos',
    icon: 'ChefHat',
    description: 'Delicate dumplings packed with succulent chicken or seasoned veggies',
  },
];

// Known mappings for recipe and product article URLs to direct image files
const RECIPE_URL_TO_IMAGE_MAP: Record<string, string> = {
  'https://cookingfromheart.com/gobi-fried-rice-gobi-manchurian-fried-rice/':
    'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80',
  'https://cookingfromheart.com/gobi-fried-rice-gobi-manchurian-fried-rice':
    'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80',
  'https://www.indianhealthyrecipes.com/mushroom-manchurian/':
    'https://www.indianhealthyrecipes.com/wp-content/uploads/2022/11/mushroom-manchurian-recipe.jpg',
  'https://www.indianhealthyrecipes.com/mushroom-manchurian':
    'https://www.indianhealthyrecipes.com/wp-content/uploads/2022/11/mushroom-manchurian-recipe.jpg',
  'https://www.indianveggiedelight.com/paneer-fried-rice/':
    'https://www.indianveggiedelight.com/wp-content/uploads/2023/09/paneer-fried-rice-featured.jpg',
  'https://www.indianveggiedelight.com/paneer-fried-rice':
    'https://www.indianveggiedelight.com/wp-content/uploads/2023/09/paneer-fried-rice-featured.jpg',
  'https://bitesofindiaevan.com/product/schezwan-red-chill-chicken-fried-rice/':
    'https://bitesofindiaevan.com/wp-content/uploads/2024/11/Schezwan-red-chilli-chicken-fried-rice.png',
  'https://bitesofindiaevan.com/product/schezwan-red-chill-chicken-fried-rice':
    'https://bitesofindiaevan.com/wp-content/uploads/2024/11/Schezwan-red-chilli-chicken-fried-rice.png',
  'https://palatesdesire.com/mushroom-garlic-fried-rice/':
    'https://palatesdesire.com/wp-content/uploads/2021/11/mushroom-fried-rice@palates-desire-1.jpg',
  'https://palatesdesire.com/mushroom-garlic-fried-rice':
    'https://palatesdesire.com/wp-content/uploads/2021/11/mushroom-fried-rice@palates-desire-1.jpg',
  'https://atmykitchen.net/2022/06/19/drums-of-heaven-indo-chinese-chicken-lollipop/':
    'https://www.yummytummyaarthi.com/wp-content/uploads/2015/03/1-13.jpg',
  'https://atmykitchen.net/2022/06/19/drums-of-heaven-indo-chinese-chicken-lollipop':
    'https://www.yummytummyaarthi.com/wp-content/uploads/2015/03/1-13.jpg',
  'https://www.yummytummyaarthi.com/dragon-chicken-recipe-restaurant-style/':
    'https://www.yummytummyaarthi.com/wp-content/uploads/2021/11/dragon-chicken-1.jpeg',
  'https://www.yummytummyaarthi.com/dragon-chicken-recipe-restaurant-style':
    'https://www.yummytummyaarthi.com/wp-content/uploads/2021/11/dragon-chicken-1.jpeg',
  'https://recipes.timesofindia.com/recipes/fried-chicken/rs61589069.cms':
    imgCrispyFriedChicken,
  'https://www.foodnetwork.com/recipes/patrick-and-gina-neely/pats-spicy-fried-wings-recipe0-1937798':
    'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=800&q=80',
  'https://www.foodnetwork.com/recipes/patrick-and-gina-neely/the-neelys-crispy-fried-chicken-wings-recipe-1949168':
    'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=800&q=80',
  'https://detoxinista.com/baked-french-fries/':
    'https://detoxinista.com/wp-content/uploads/2021/03/best-homemade-fries.jpg',
  'https://detoxinista.com/baked-french-fries':
    'https://detoxinista.com/wp-content/uploads/2021/03/best-homemade-fries.jpg',
  'https://www.indianveggiedelight.com/masala-french-fries/':
    'https://www.indianveggiedelight.com/wp-content/uploads/2017/03/masalafrenchfries.jpg',
  'https://www.indianveggiedelight.com/masala-french-fries':
    'https://www.indianveggiedelight.com/wp-content/uploads/2017/03/masalafrenchfries.jpg',
  'https://www.vegrecipesofindia.com/veg-nuggets-recipe-veggie-nuggets/':
    'https://i2.wp.com/www.vegrecipesofindia.com/wp-content/uploads/2016/07/veg-nuggets-recipe.jpg',
  'https://www.vegrecipesofindia.com/veg-nuggets-recipe-veggie-nuggets':
    'https://i2.wp.com/www.vegrecipesofindia.com/wp-content/uploads/2016/07/veg-nuggets-recipe.jpg',
  'https://aartimadan.com/veg-fingers/':
    'https://aartimadan.com/wp-content/uploads/2022/02/Veg-Fingers.jpg',
  'https://aartimadan.com/veg-fingers':
    'https://aartimadan.com/wp-content/uploads/2022/02/Veg-Fingers.jpg',
  'https://nomadictadka.com/2024/11/09/chicken-fingers/':
    'https://nomadictadka.com/wp-content/uploads/2024/11/DSC_0051-scaled.jpg',
  'https://nomadictadka.com/2024/11/09/chicken-fingers':
    'https://nomadictadka.com/wp-content/uploads/2024/11/DSC_0051-scaled.jpg',
  'https://www.indianhealthyrecipes.com/cheese-balls-recipe/':
    'https://www.indianhealthyrecipes.com/wp-content/uploads/2022/03/cheese-balls-recipe.jpg',
  'https://www.indianhealthyrecipes.com/cheese-balls-recipe':
    'https://www.indianhealthyrecipes.com/wp-content/uploads/2022/03/cheese-balls-recipe.jpg',
  'https://lakshmirecipes.com/snacks/vegetable-rolls-recipe-learn-how-to-make-vegetable-rolls-108/':
    'https://wbcdn.in/assets/img/uploads/mywb/uploads/covers/fb_img_7da6ad49d67349e5fe81ba0df42255eaf7cdb929.jpg',
  'https://lakshmirecipes.com/snacks/vegetable-rolls-recipe-learn-how-to-make-vegetable-rolls-108':
    'https://wbcdn.in/assets/img/uploads/mywb/uploads/covers/fb_img_7da6ad49d67349e5fe81ba0df42255eaf7cdb929.jpg',
  'https://nishkitchen.com/kolkata-egg-roll/':
    'https://nishkitchen.com/wp-content/uploads/2025/11/Kolkata-egg-roll-1.jpg',
  'https://nishkitchen.com/kolkata-egg-roll':
    'https://nishkitchen.com/wp-content/uploads/2025/11/Kolkata-egg-roll-1.jpg',
  'https://mydukaan.io/fivestarcafe/products/chicken-crispy-roll':
    'https://dukaan.b-cdn.net/1000x1000/webp/156833/ca27e0ad-a124-433a-8076-ea07690acdbe.png',
  'https://www.indiamart.com/proddetail/non-veg-tandoori-chicken-nuggets-14470880055.html':
    'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80',
  'https://easyindiancookbook.com/popcorn-chicken/':
    'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80',
  'https://easyindiancookbook.com/popcorn-chicken':
    'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80',
  'https://food.ndtv.com/food-drinks/instant-masala-paneer-roll-a-delicious-recipe-that-needs-just-10-minutes-4156755':
    'https://hebbarskitchen.com/wp-content/uploads/2025/06/Paneer-Frankie-Recipe-Paneer-Kathi-Roll-Street-Style-2-scaled.jpeg',
  'https://food.ndtv.com/food-drinks/instant-masala-paneer-roll-recipe-how-to-make-paneer-roll-in-just-15-mins-3107087':
    'https://hebbarskitchen.com/wp-content/uploads/2025/06/Paneer-Frankie-Recipe-Paneer-Kathi-Roll-Street-Style-2-scaled.jpeg',
  'https://www.justdial.com/Kozhikode/Five-Star-Chicken/nct-11979519':
    'https://foodiesterminal.com/wp-content/uploads/2018/10/Egg-Chicken-roll-recipe-Kolkata-style.jpg',
  'https://www.justdial.com/Kozhikode/Five-Star-Chicken-Kallai/0495PX495-X495-170707204554-A6Z1_BZDET':
    'https://foodiesterminal.com/wp-content/uploads/2018/10/Egg-Chicken-roll-recipe-Kolkata-style.jpg',
  'https://www.ohmyveg.co.uk/aloo-tikki-burgers/':
    'https://www.ohmyveg.co.uk/wp-content/uploads/2025/01/Aloo-Tikki-BUrgers.jpg',
  'https://www.ohmyveg.co.uk/aloo-tikki-burgers':
    'https://www.ohmyveg.co.uk/wp-content/uploads/2025/01/Aloo-Tikki-BUrgers.jpg',
  'https://www.zomato.com/bangalore/five-star-19-electronic-city-bangalore/order':
    'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=800&q=80',
  'https://www.zomato.com/bangalore/five-star-19-electronic-city':
    'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=800&q=80',
  'https://cookingwithparita.com/recipe/crispy-peri-peri-chikn-burger/':
    'https://cookingwithparita.com/wp-content/uploads/2026/04/Image-of-Vegan-Peri-Peri-Chicken-Burger-Recipe.jpg',
  'https://cookingwithparita.com/recipe/crispy-peri-peri-chikn-burger':
    'https://cookingwithparita.com/wp-content/uploads/2026/04/Image-of-Vegan-Peri-Peri-Chicken-Burger-Recipe.jpg',
  'https://www.swiggy.com/restaurants/five-star-chicken-koramangala-2-175584/dineout/menu':
    'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
  'https://www.swiggy.com/restaurants/five-star-chicken-near-reliance-fresh-whitefield-bangalore-56906':
    'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
  'https://www.instagram.com/p/DU2otVYAV3F/':
    'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=800&q=80',
  'https://www.instagram.com/p/DU2otVYAV3F':
    'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=800&q=80',
  'https://www.zomato.com/chennai/five-star-chicken-3-padur/order':
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  'https://www.zomato.com/chennai/five-star-chicken-3-kolathur':
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  'https://www.zomato.com/chennai/frysto-the-frying-stories-anna-nagar-west/order':
    'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
  'https://www.zomato.com/chennai/frysto-the-frying-station-korattur':
    'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
  'https://vegecravings.com/veg-fried-momos-recipe/':
    'https://vegecravings.com/wp-content/uploads/2021/02/Fried-Momos-Recipe-Step-By-Step-Instructions-scaled.jpg',
  'https://vegecravings.com/veg-fried-momos-recipe':
    'https://vegecravings.com/wp-content/uploads/2021/02/Fried-Momos-Recipe-Step-By-Step-Instructions-scaled.jpg',
  'https://www.meatandeat.in/product/corn-n-cheese-momos-fried':
    'https://cdn.prod.website-files.com/686b30f5c61aff0be71c5315/68c926b63432c6dd41580b0f_Meat%20and%20Eat%20Images.png',
  'https://www.pinterest.com/pin/chicken-momos-recipe--112941903144325050/':
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80',
  'https://www.pinterest.com/pin/chicken-momos-recipe-in-2024--47850814781467401/':
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80',
};

export const resolveImageUrl = (url?: string): string => {
  if (!url) return '';
  const trimmed = url.trim();

  // If already a local asset path, data URI or blob, return directly
  if (trimmed.startsWith('/') || trimmed.startsWith('data:') || trimmed.startsWith('blob:') || trimmed.startsWith('./') || trimmed.startsWith('../')) {
    return trimmed;
  }

  // If user pasted a Google Search / Google Images URL, extract the direct image (imgurl parameter)
  if (trimmed.includes('google.') && (trimmed.includes('imgurl=') || trimmed.includes('/imgres'))) {
    try {
      const parsed = new URL(trimmed);
      const direct = parsed.searchParams.get('imgurl');
      if (direct) {
        return decodeURIComponent(direct);
      }
    } catch {
      const match = trimmed.match(/[?&]imgurl=([^&]+)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    }
  }

  if (RECIPE_URL_TO_IMAGE_MAP[trimmed]) {
    return RECIPE_URL_TO_IMAGE_MAP[trimmed];
  }
  for (const [webpageUrl, directImage] of Object.entries(RECIPE_URL_TO_IMAGE_MAP)) {
    if (trimmed.startsWith(webpageUrl) || webpageUrl.startsWith(trimmed)) {
      return directImage;
    }
  }
  return trimmed;
};

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // --- 1. RICE & NOODLES (Basmathi Rice Guarantee - From Photographed Board 2) ---
  {
    id: 'rn-1',
    name: 'Gobi Fried Rice',
    category: 'rice_noodles',
    price: 80,
    isVeg: true,
    spiceLevel: 2,
    description: 'Fragrant Basmathi rice wok-tossed with crisp golden cauliflower florets, spring onions, and savory wok spices.',
    isSpecial: true,
    isBestseller: true,
    inStock: true,
    image: imgGobiFriedRice,
    tags: ['Basmathi Rice', 'Indo-Chinese', 'Crispy Gobi'],
    basmatiRiceNote: true,
  },
  {
    id: 'rn-2',
    name: 'Gobi Manchurian',
    category: 'rice_noodles',
    price: 80,
    isVeg: true,
    spiceLevel: 2,
    description: 'Crunchy battered cauliflower tossed in spicy garlic ginger soya sauce with green chillies & bell peppers.',
    isSpecial: false,
    isBestseller: true,
    inStock: true,
    image: 'https://www.indianveggiedelight.com/wp-content/uploads/2017/06/gobi-manchurian-featured-500x500.jpg',
    tags: ['Crisp & Tangy', 'Best with Fried Rice', 'Spicy'],
  },
  {
    id: 'rn-3',
    name: 'Egg Fried Rice',
    category: 'rice_noodles',
    price: 80,
    isVeg: false,
    isEgg: true,
    spiceLevel: 1,
    description: 'Fluffy scrambled farm eggs tossed with aromatic Basmathi rice, crunchy diced carrots, beans, and light soy sauce.',
    isSpecial: false,
    isBestseller: false,
    inStock: true,
    image: 'https://www.indianhealthyrecipes.com/wp-content/uploads/2021/07/egg-fried-rice-recipe.jpg',
    tags: ['Basmathi Rice', 'Egg Special', 'Mild Spice'],
    basmatiRiceNote: true,
  },
  {
    id: 'rn-4',
    name: 'Mushroom Rice',
    category: 'rice_noodles',
    price: 100,
    isVeg: true,
    spiceLevel: 2,
    description: 'Tender button mushrooms sautéed with fresh ground black pepper, herbs, and long-grain Basmathi rice.',
    isSpecial: false,
    isBestseller: false,
    inStock: true,
    image: 'https://palatesdesire.com/wp-content/uploads/2021/11/mushroom-fried-rice@palates-desire-1.jpg',
    tags: ['Basmathi Rice', 'Mushroom Lovers', 'Aromatic'],
    basmatiRiceNote: true,
  },
  {
    id: 'rn-5',
    name: 'Mushroom Manchurian',
    category: 'rice_noodles',
    price: 120,
    isVeg: true,
    spiceLevel: 2,
    description: 'Juicy golden fried button mushrooms coated in a rich, tangy Manchurian sauce with spring onion garnishing.',
    isSpecial: false,
    isBestseller: false,
    inStock: true,
    image: 'https://www.indianhealthyrecipes.com/wp-content/uploads/2022/11/mushroom-manchurian-recipe.jpg',
    tags: ['Tangy', 'Savory Gravy/Dry', 'Mushroom'],
  },
  {
    id: 'rn-6',
    name: 'Paneer Rice',
    category: 'rice_noodles',
    price: 100,
    isVeg: true,
    spiceLevel: 2,
    description: 'Fresh succulent cottage cheese cubes tossed with premium Basmathi rice, bell peppers, and zesty secret spices.',
    isSpecial: true,
    isBestseller: true,
    inStock: true,
    image: 'https://www.indianveggiedelight.com/wp-content/uploads/2023/09/paneer-fried-rice-featured.jpg',
    tags: ['Basmathi Rice', 'Rich Paneer', 'Popular Veg'],
    basmatiRiceNote: true,
  },
  {
    id: 'rn-7',
    name: 'Chicken Fried Rice',
    category: 'rice_noodles',
    price: 100,
    isVeg: false,
    spiceLevel: 2,
    description: 'Shredded juicy chicken & egg pieces tossed in fiery wok heat with long-grain Basmathi rice and garlic seasoning.',
    isSpecial: true,
    isBestseller: true,
    inStock: true,
    image: 'https://bitesofindiaevan.com/wp-content/uploads/2024/11/Schezwan-red-chilli-chicken-fried-rice.png',
    tags: ['Basmathi Rice', 'Customer Favorite', 'Non-Veg Special'],
    basmatiRiceNote: true,
  },
  {
    id: 'rn-8',
    name: 'Chilli Baby Corn',
    category: 'rice_noodles',
    price: 130,
    isVeg: true,
    spiceLevel: 3,
    description: 'Crisp baby corn fingers stir-fried in a fiery Indo-Chinese glaze with sliced green chillies and capsicum.',
    isSpecial: false,
    isBestseller: true,
    inStock: true,
    image: 'https://myfoodstory.com/wp-content/uploads/2022/04/Crispy-Babycorn-Chilli-4-768x1152.jpg',
    tags: ['Spicy Crunch', 'Starters', 'Pure Veg'],
  },
  {
    id: 'rn-9',
    name: 'Veg Noodles',
    category: 'rice_noodles',
    price: 80,
    isVeg: true,
    spiceLevel: 2,
    description: 'Classic street-style noodles tossed with julienned cabbage, capsicum, carrots, and spicy dark soy sauce.',
    isSpecial: false,
    isBestseller: false,
    inStock: true,
    image: 'https://shwetainthekitchen.com/wp-content/uploads/2023/03/vegetable-noodles.jpg',
    tags: ['Wok Stir Fry', 'Street Style', 'Noodles'],
  },
  {
    id: 'rn-10',
    name: 'Gobi Noodles',
    category: 'rice_noodles',
    price: 80,
    isVeg: true,
    spiceLevel: 2,
    description: 'Wok tossed noodles combined with crispy seasoned gobi florets, bell peppers, and spring onions.',
    isSpecial: false,
    isBestseller: false,
    inStock: true,
    image: imgGobiNoodles,
    tags: ['Wok Stir Fry', 'Crispy Gobi', 'Noodles'],
  },
  {
    id: 'rn-11',
    name: 'Chicken Noodles',
    category: 'rice_noodles',
    price: 100,
    isVeg: false,
    spiceLevel: 2,
    description: 'Classic street-style noodles tossed with julienned cabbage, capsicum, carrots, roasted chicken, and spicy dark soy sauce.',
    isSpecial: false,
    isBestseller: false,
    inStock: true,
    image: imgChickenNoodles,
    tags: ['Wok Stir Fry', 'Street Style', 'Noodles'],
  },
  {
    id: 'rn-12',
    name: 'Chicken Lollipop',
    category: 'rice_noodles',
    price: 150,
    isVeg: false,
    spiceLevel: 3,
    description: 'Frenched chicken winglets marinated in fiery red spices, deep-fried till crispy, served with spicy schezwan dip.',
    isSpecial: true,
    isBestseller: true,
    inStock: true,
    image: imgChickenLollipop,
    tags: ['Fiery Red', 'Crispy Bone-in', 'Chef Special'],
  },
  {
    id: 'rn-13',
    name: 'Dragon Chicken',
    category: 'rice_noodles',
    price: 150,
    isVeg: false,
    spiceLevel: 3,
    description: 'Strips of tender chicken tossed in sweet-and-spicy dragon sauce with roasted cashews, dried red chillies, and bell peppers.',
    isSpecial: true,
    isBestseller: true,
    inStock: true,
    image: 'https://www.yummytummyaarthi.com/dragon-chicken-recipe-restaurant-style/',
    tags: ['Signature Red', 'Hot & Crunchy', 'Non-Veg Bestseller'],
  },

  // --- 2. BIRYANI (From Photographed Board 3) ---
  {
    id: 'bir-1',
    name: 'Chicken Dum Biryani',
    category: 'biryani',
    price: 120,
    isVeg: false,
    spiceLevel: 2,
    description: 'Authentic slow-cooked Dum Biryani with spiced tender chicken piece, fragrant long-grain rice, and aromatic saffron essence.',
    isSpecial: true,
    isBestseller: true,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    tags: ['Dum Cooked', 'Daily Special', 'Value Meal'],
  },

  // --- 3. CRISPY FRIED CHICKEN (From Photographed Board 1) ---
  {
    id: 'fc-1',
    name: 'Fried Chicken (1 Piece)',
    category: 'fried_chicken',
    price: 79,
    isVeg: false,
    spiceLevel: 2,
    pieceCount: '1 Pc',
    description: 'Golden crunchy signature fried chicken piece with hot secret spicy seasoning. Crispy outside, succulent inside.',
    isSpecial: false,
    isBestseller: true,
    inStock: true,
    image: imgCrispyFriedChicken,
    tags: ['1 Piece', 'Crunchy', 'Original Recipe'],
  },
  {
    id: 'fc-2',
    name: 'Fried Chicken (2 Pieces)',
    category: 'fried_chicken',
    price: 159,
    isVeg: false,
    spiceLevel: 2,
    pieceCount: '2 Pcs',
    description: 'Two pieces of freshly pressure-fried crispy chicken with rich herbs and savory crunch coating.',
    isSpecial: false,
    isBestseller: true,
    inStock: true,
    image: imgCrispyFriedChicken,
    tags: ['2 Pieces', 'Popular Duo', 'Fresh Fry'],
  },
  {
    id: 'fc-4',
    name: 'Fried Chicken (4 Pieces)',
    category: 'fried_chicken',
    price: 309,
    isVeg: false,
    spiceLevel: 2,
    pieceCount: '4 Pcs',
    description: 'Four hearty pieces of crunchy fried chicken, perfect for sharing with friends and family.',
    isSpecial: true,
    isBestseller: true,
    inStock: true,
    image: imgCrispyFriedChicken,
    tags: ['4 Pieces', 'Share Bucket', 'Value Pack'],
  },
  {
    id: 'fc-8',
    name: 'Fried Chicken (8 Pieces)',
    category: 'fried_chicken',
    price: 619,
    isVeg: false,
    spiceLevel: 2,
    pieceCount: '8 Pcs',
    description: 'Eight juicy golden fried chicken pieces. Ideal for gatherings and party appetites.',
    isSpecial: true,
    isBestseller: false,
    inStock: true,
    image: imgCrispyFriedChicken,
    tags: ['8 Pieces', 'Big Bucket', 'Family Feast'],
  },
  {
    id: 'fc-10',
    name: 'Fried Chicken (10 Pieces)',
    category: 'fried_chicken',
    price: 759,
    isVeg: false,
    spiceLevel: 2,
    pieceCount: '10 Pcs',
    description: 'Mega party bucket with 10 jumbo pieces of crispy golden spiced fried chicken.',
    isSpecial: true,
    isBestseller: false,
    inStock: true,
    image: imgCrispyFriedChicken,
    tags: ['10 Pieces', 'Mega Bucket', 'Ultimate Feast'],
  },

  // --- 4. THUNDER WINGS & LOLLIPOPS (From Photographed Board 1) ---
  {
    id: 'tw-1',
    name: 'Crispy Wings',
    category: 'wings',
    price: 109,
    isVeg: false,
    spiceLevel: 1,
    description: 'Golden, extra-crunchy seasoned chicken wings fried to perfection with light pepper and garlic salt.',
    isSpecial: false,
    isBestseller: true,
    inStock: true,
    image: imgCrispyWings,
    tags: ['Extra Crunchy', 'Thunder Wings', 'Mild'],
  },
  {
    id: 'tw-2',
    name: 'Peri Peri Wings',
    category: 'wings',
    price: 119,
    isVeg: false,
    spiceLevel: 3,
    description: 'Crispy chicken wings generously tossed in our signature zesty and fiery African Peri Peri seasoning.',
    isSpecial: true,
    isBestseller: true,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=800&q=80',
    tags: ['Peri Peri', 'Spicy Dust', 'Hot Hit'],
  },
  {
    id: 'tw-3',
    name: 'Lolly Pops',
    category: 'wings',
    price: 129,
    isVeg: false,
    spiceLevel: 2,
    description: 'Tender chicken wing lollipops fried in crisp seasoned batter with juicy tender chicken bites.',
    isSpecial: false,
    isBestseller: true,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=800&q=80',
    tags: ['Classic Lollipop', 'Juicy', 'Snack'],
  },

  // --- 5. VEG MINI BITES (From Photographed Board 1) ---
  {
    id: 'vb-1',
    name: 'French Fries',
    category: 'veg_bites',
    price: 60,
    isVeg: true,
    spiceLevel: 1,
    description: 'Crisp golden salted potato fries, hot from the fryer, served with classic tomato dip.',
    isSpecial: false,
    isBestseller: true,
    inStock: true,
    image: 'https://detoxinista.com/baked-french-fries/',
    tags: ['Classic Salted', 'Crispy Potato', 'Snack'],
  },
  {
    id: 'vb-2',
    name: 'Masala Fries',
    category: 'veg_bites',
    price: 70,
    isVeg: true,
    spiceLevel: 3,
    description: 'Crispy golden fries tossed in our signature fiery Peri Peri spice powder shaker mix.',
    isSpecial: true,
    isBestseller: true,
    inStock: true,
    image: 'https://www.indianveggiedelight.com/masala-french-fries/',
    tags: ['Spicy Peri Peri', 'Favorite', 'Hot Fries'],
  },
  {
    id: 'vb-3',
    name: 'Veg Nuggets',
    category: 'veg_bites',
    price: 70,
    isVeg: true,
    spiceLevel: 1,
    description: 'Bite-sized nuggets made from seasoned minced vegetables and potatoes with a crunchy breadcrumb crust.',
    isSpecial: false,
    isBestseller: false,
    inStock: true,
    image: 'https://www.vegrecipesofindia.com/veg-nuggets-recipe-veggie-nuggets/',
    tags: ['Pure Veg', 'Crunchy', 'Kids Favorite'],
  },
  {
    id: 'vb-5',
    name: 'Veg Finggers',
    category: 'veg_bites',
    price: 70,
    isVeg: true,
    spiceLevel: 2,
    description: 'Crumb-coated spiced vegetable fingers packed with peas, carrots, corn, and herb seasoning.',
    isSpecial: false,
    isBestseller: false,
    inStock: true,
    image: 'https://aartimadan.com/veg-fingers/',
    tags: ['Spiced Veg', 'Golden Crust', 'Crisp'],
  },

  // --- 6. NON-VEG MINI BITES (From Photographed Board 1) ---
  {
    id: 'nvb-1',
    name: 'Non-Veg Nuggets',
    category: 'non_veg_bites',
    price: 80,
    isVeg: false,
    spiceLevel: 1,
    description: 'Tender minced chicken nuggets coated in seasoned golden breading, crisp outside and juicy inside.',
    isSpecial: false,
    isBestseller: false,
    inStock: true,
    image: imgNonVegNuggets,
    tags: ['Chicken Nuggets', 'Bite Size', 'Crispy'],
  },
  {
    id: 'nvb-2',
    name: 'Non-Veg Fingers',
    category: 'non_veg_bites',
    price: 80,
    isVeg: false,
    spiceLevel: 2,
    description: 'Crunchy chicken finger strips marinated with zesty pepper and fried till golden amber.',
    isSpecial: false,
    isBestseller: false,
    inStock: true,
    image: 'https://nomadictadka.com/wp-content/uploads/2024/11/DSC_0051-scaled.jpg',
    tags: ['Chicken Fingers', 'Crispy', 'Snack'],
  },
  {
    id: 'nvb-3',
    name: 'Non-Veg Cheesy Balls',
    category: 'non_veg_bites',
    price: 80,
    isVeg: false,
    spiceLevel: 1,
    description: 'Delectable chicken mince stuffed around molten cheese that oozes delightfully on the first bite.',
    isSpecial: true,
    isBestseller: true,
    inStock: true,
    image: 'https://www.indianhealthyrecipes.com/wp-content/uploads/2022/03/cheese-balls-recipe.jpg',
    tags: ['Chicken & Cheese', 'Molten Core', 'Popular'],
  },
  {
    id: 'nvb-5',
    name: 'Chicken PopCorn',
    category: 'non_veg_bites',
    price: 80,
    isVeg: false,
    spiceLevel: 2,
    description: 'Crunchy mini bite-sized popcorn chicken pops sprinkled with savory chili seasoning.',
    isSpecial: true,
    isBestseller: true,
    inStock: true,
    image: imgPopcornChicken,
    tags: ['Popcorn Bites', 'Addictive Snack', 'Top Rated'],
  },

  // --- 7. VEG ROLLS (From Photographed Board 1) ---
  {
    id: 'vr-2',
    name: 'Crunchy Veg Roll',
    category: 'veg_rolls',
    price: 69,
    isVeg: true,
    spiceLevel: 2,
    description: 'A crispy breaded vegetable cutlet wrapped with fresh cabbage slaw, mayo, and tangy house seasonings.',
    isSpecial: false,
    isBestseller: false,
    inStock: true,
    image: 'https://wbcdn.in/assets/img/uploads/mywb/uploads/covers/fb_img_7da6ad49d67349e5fe81ba0df42255eaf7cdb929.jpg',
    tags: ['Crunchy Cutlet', 'Fresh Slaw', 'Roll'],
  },
  {
    id: 'vr-3',
    name: 'Paneer Roll',
    category: 'veg_rolls',
    price: 79,
    isVeg: true,
    spiceLevel: 1,
    description: 'Spiced paneer cubes, crunchy veggies, and tangy chutneys wrapped in a warm, flaky roll.',
    isSpecial: true,
    isBestseller: true,
    inStock: true,
    image: 'https://hebbarskitchen.com/wp-content/uploads/2025/06/Paneer-Frankie-Recipe-Paneer-Kathi-Roll-Street-Style-2-scaled.jpeg',
    tags: ['Fresh Paneer', 'Mild & Creamy', 'Vegetarian'],
  },

  // --- 8. NON-VEG ROLLS (From Photographed Board 1) ---
  {
    id: 'nvr-1',
    name: 'Egg Roll',
    category: 'non_veg_rolls',
    price: 59,
    isVeg: false,
    isEgg: true,
    spiceLevel: 2,
    description: 'Double-egg coated paratha rolled with crunchy onions, sliced green chillies, chaat masala, and spicy chutney.',
    isSpecial: false,
    isBestseller: true,
    inStock: true,
    image: 'https://nishkitchen.com/wp-content/uploads/2025/11/Kolkata-egg-roll-1.jpg',
    tags: ['Farm Egg', 'Street Classic', '₹59 Value'],
  },
  {
    id: 'nvr-2',
    name: 'Crunchy Non-Veg Roll',
    category: 'non_veg_rolls',
    price: 79,
    isVeg: false,
    spiceLevel: 2,
    description: 'Crisp fried chicken strip rolled inside a flaky paratha with garlic mayo and shredded lettuce.',
    isSpecial: false,
    isBestseller: true,
    inStock: true,
    image: 'https://dukaan.b-cdn.net/1000x1000/webp/156833/ca27e0ad-a124-433a-8076-ea07690acdbe.png',
    tags: ['Crispy Chicken', 'Crunch Roll', 'Saucy'],
  },
  {
    id: 'nvr-3',
    name: 'Tandoori Non-Veg Roll',
    category: 'non_veg_rolls',
    price: 89,
    isVeg: false,
    spiceLevel: 2,
    description: 'Smoky roasted tandoori spiced chicken chunks rolled with pickled onion rings and mint mayo sauce.',
    isSpecial: true,
    isBestseller: true,
    inStock: true,
    image: 'https://foodiesterminal.com/wp-content/uploads/2018/10/Egg-Chicken-roll-recipe-Kolkata-style.jpg',
    tags: ['Smoky Tandoori', 'Tender Chicken', 'Chef Pick'],
  },

  // --- 9. BURGERS & SANDWICHES (From Photographed Board 3) ---
  {
    id: 'b-1',
    name: 'Aloo Tikka Veg Burger',
    category: 'burgers',
    price: 59,
    isVeg: true,
    spiceLevel: 2,
    description: 'Crisp potato tikka patty on a toasted sesame bun with creamy eggless mayo, crunchy onions, and tomato slice.',
    isSpecial: false,
    isBestseller: true,
    inStock: true,
    image: 'https://www.ohmyveg.co.uk/wp-content/uploads/2025/01/Aloo-Tikki-BUrgers.jpg',
    tags: ['Aloo Tikka', 'Sesame Bun', 'Value Burger'],
  },
  {
    id: 'b-2',
    name: 'Popular Veg Burger',
    category: 'burgers',
    price: 69,
    isVeg: true,
    spiceLevel: 1,
    description: 'Hearty mixed vegetable patty fried golden, layered with cheese sauce, crisp iceberg lettuce, and relish.',
    isSpecial: false,
    isBestseller: false,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=800&q=80',
    tags: ['Veggie Patty', 'Classic Burger', 'Everyday Favorite'],
  },
  {
    id: 'b-3',
    name: 'Peri Peri Veg Burger',
    category: 'burgers',
    price: 79,
    isVeg: true,
    spiceLevel: 3,
    description: 'Spiced vegetable patty seasoned with fiery Peri Peri dust and topped with tangy jalapeno mayo sauce.',
    isSpecial: false,
    isBestseller: false,
    inStock: true,
    image: 'https://cookingwithparita.com/wp-content/uploads/2026/04/Image-of-Vegan-Peri-Peri-Chicken-Burger-Recipe.jpg',
    tags: ['Peri Peri Zing', 'Spicy Mayo', 'Veggie'],
  },
  {
    id: 'b-5',
    name: 'SPL Veg Burger',
    category: 'burgers',
    price: 109,
    isVeg: true,
    spiceLevel: 2,
    description: 'Special double-decker vegetable patty loaded with melted cheese slice, sauteed onions, and secret herb sauce.',
    isSpecial: true,
    isBestseller: false,
    inStock: true,
    image: imgSplVegBurger,
    tags: ['Special Veg', 'Loaded Cheese', 'Premium'],
  },
  {
    id: 'b-6',
    name: 'Crispy Chicken Burger',
    category: 'burgers',
    price: 79,
    isVeg: false,
    spiceLevel: 2,
    description: 'Deep-fried golden chicken patty with a satisfying crunch, topped with creamy mayo and lettuce on a toasted bun.',
    isSpecial: false,
    isBestseller: true,
    inStock: true,
    image: imgCrispyChickenBurger,
    tags: ['Crispy Chicken', 'Customer Favorite', '₹79 Deal'],
  },
  {
    id: 'b-7',
    name: 'Tandoor Burger',
    category: 'burgers',
    price: 89,
    isVeg: false,
    spiceLevel: 2,
    description: 'Extra crispy battered chicken fillet seasoned with garlic herbs, paired with crisp greens and spiced sauce.',
    isSpecial: false,
    isBestseller: true,
    inStock: true,
    image: imgTandoorBurger,
    tags: ['Extra Crunchy', 'Juicy Fillet', 'Top Choice'],
  },
  {
    id: 'b-10',
    name: 'SPL Chicken Burger',
    category: 'burgers',
    price: 119,
    isVeg: false,
    spiceLevel: 3,
    description: 'Our house signature chef burger with double chicken fillets, layered cheese, jalapeños, and fiery sauce.',
    isSpecial: true,
    isBestseller: true,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
    tags: ['Chef Signature', 'Double Stack', 'Must Try'],
  },

  // --- Sandwiches (From Photographed Board 3) ---
  {
    id: 's-1',
    name: 'Cheese & Corn Sandwich',
    category: 'burgers',
    price: 79,
    isVeg: true,
    spiceLevel: 1,
    description: 'Golden toasted white or brown bread stuffed with sweet juicy corn and melted mozzarella cheese.',
    isSpecial: false,
    isBestseller: false,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
    tags: ['Grilled Sandwich', 'Cheesy Corn', 'Vegetarian'],
  },
  {
    id: 's-2',
    name: 'Chicken Sandwich',
    category: 'burgers',
    price: 79,
    isVeg: false,
    spiceLevel: 2,
    description: 'Shredded chicken dressed in herb mayonnaise and crushed black pepper, toasted till golden and crunchy.',
    isSpecial: false,
    isBestseller: true,
    inStock: true,
    image: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=800&q=80',
    tags: ['Chicken Mayo', 'Crispy Toast', 'Snack Deal'],
  },

  // --- 10. MOMOS (From Photographed Board 3) ---
  {
    id: 'm-1',
    name: 'Veg Momos',
    category: 'momos',
    price: 69,
    isVeg: true,
    spiceLevel: 2,
    description: 'Delicate steamed dumplings stuffed with finely minced cabbage, carrots, spring onion, served with spicy red chutney.',
    isSpecial: false,
    isBestseller: true,
    inStock: true,
    image: 'https://vegecravings.com/veg-fried-momos-recipe/',
    tags: ['Steamed / Fried', 'Spicy Garlic Dip', 'Veg Dumplings'],
  },
  {
    id: 'm-2',
    name: 'Corn Momos',
    category: 'momos',
    price: 79,
    isVeg: true,
    spiceLevel: 1,
    description: 'Dumplings filled with sweet corn kernels, melted cheese, and aromatic spices. Available steamed or crispy fried.',
    isSpecial: false,
    isBestseller: false,
    inStock: true,
    image: 'https://www.meatandeat.in/product/corn-n-cheese-momos-fried',
    tags: ['Sweet Corn', 'Steamed/Fried', 'Cheesy'],
  },
  {
    id: 'm-3',
    name: 'Chicken Momos',
    category: 'momos',
    price: 79,
    isVeg: false,
    spiceLevel: 2,
    description: 'Juicy chicken mince seasoned with fresh coriander, ginger, and garlic, stuffed into thin translucent momo wrappers.',
    isSpecial: true,
    isBestseller: true,
    inStock: true,
    image: imgChickenMomos,
    tags: ['Juicy Chicken', 'Street Momo', 'Bestseller'],
  },
];

export const RESTAURANT_INFO = {
  name: 'FIREY TREAT Restaurant',
  tagline: 'Authentic Crispy Fried Chicken, Thunder Wings & Basmathi Rice Delights',
  phone1: '8885884141',
  phone2: '7095973869',
  formattedPhone1: '+91 8885884141',
  formattedPhone2: '+91 7095973869',
  whatsappNumber: '918885884141',
  address: 'Pachikapalem , DCCB  Bank opposite, Tirupati Road.',
  city: 'Andhra Pradesh',
  hours: 'Open Daily: 10:00 AM – 10:30 PM',
  mapUrl: 'https://maps.app.goo.gl/kEn1WX39a3pAzx5X8',
  deliveryNotice: "If you're interested in home delivery, please contact us at 8885884141 or 7095973869",
  partyNotice: "Birthday Party's & Functions Special Biryani Combos Available for Bulk Order",
  basmatiPromise: 'All Rice Items Prepared with 100% Authentic Long-Grain BASMATHI RICE',
};
