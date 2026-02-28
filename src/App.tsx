import { useState, useEffect, createContext, useContext, useCallback } from "react";

// ============ TYPES ============
interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  emoji: string;
  description: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  rating: number;
  reviewCount: number;
  badge?: string;
  inStock: boolean;
  featured?: boolean;
  bestSeller?: boolean;
}

interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

interface Review {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
  productId?: number;
}

interface Order {
  id: string;
  customer: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  items: CartItem[];
  total: number;
  shipping: number;
  paymentMethod: string;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  date: string;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  orders: number;
  totalSpent: number;
  joinDate: string;
  status: "active" | "inactive";
}

type PageType = "home" | "products" | "product" | "cart" | "checkout" | "account" | "admin";
type AdminTab = "dashboard" | "products" | "orders" | "customers" | "reviews" | "settings";

// ============ DATA ============
const initialProducts: Product[] = [
  {
    id: 1, name: "Classic White T-Shirt", price: 1499, category: "Clothes",
    images: ["from-gray-100 via-white to-gray-200", "from-stone-100 to-gray-200", "from-gray-50 to-stone-200", "from-neutral-100 to-gray-300"],
    emoji: "👕", description: "Premium cotton crew-neck t-shirt with a relaxed fit. Perfect for everyday wear.", sizes: ["XS", "S", "M", "L", "XL", "XXL"], colors: [{ name: "White", hex: "#FFFFFF" }, { name: "Black", hex: "#1a1a1a" }, { name: "Gray", hex: "#9ca3af" }], rating: 4.5, reviewCount: 128, badge: "New", inStock: true, featured: true
  },
  {
    id: 2, name: "Floral Summer Dress", price: 3499, originalPrice: 4999, category: "Clothes",
    images: ["from-pink-100 to-rose-200", "from-rose-100 to-pink-200", "from-fuchsia-100 to-pink-200", "from-pink-200 to-rose-300"],
    emoji: "👗", description: "Beautiful floral print midi dress with a flattering A-line silhouette.", sizes: ["XS", "S", "M", "L", "XL"], colors: [{ name: "Pink Floral", hex: "#f9a8d4" }, { name: "Blue Floral", hex: "#93c5fd" }], rating: 4.8, reviewCount: 256, badge: "Sale", inStock: true, featured: true, bestSeller: true
  },
  {
    id: 3, name: "Leather Biker Jacket", price: 8999, category: "Clothes",
    images: ["from-gray-700 to-gray-900", "from-gray-600 to-gray-800", "from-zinc-700 to-zinc-900", "from-neutral-700 to-neutral-900"],
    emoji: "🧥", description: "Genuine leather biker jacket with asymmetric zip closure.", sizes: ["S", "M", "L", "XL"], colors: [{ name: "Black", hex: "#1a1a1a" }, { name: "Brown", hex: "#78350f" }], rating: 4.7, reviewCount: 89, inStock: true, bestSeller: true
  },
  {
    id: 4, name: "Silk Blouse", price: 4499, originalPrice: 5499, category: "Clothes",
    images: ["from-sky-100 to-blue-200", "from-blue-100 to-sky-200", "from-cyan-100 to-sky-200", "from-sky-50 to-blue-100"],
    emoji: "👚", description: "Luxurious silk blouse with a relaxed fit and elegant drape.", sizes: ["XS", "S", "M", "L", "XL"], colors: [{ name: "Sky Blue", hex: "#7dd3fc" }, { name: "Ivory", hex: "#fffff0" }, { name: "Blush", hex: "#fda4af" }], rating: 4.6, reviewCount: 67, badge: "Sale", inStock: true, featured: true
  },
  {
    id: 5, name: "Running Sneakers", price: 5999, category: "Shoes",
    images: ["from-emerald-100 to-teal-200", "from-teal-100 to-emerald-200", "from-green-100 to-teal-200", "from-emerald-200 to-teal-300"],
    emoji: "👟", description: "Lightweight running sneakers with responsive cushioning.", sizes: ["36", "37", "38", "39", "40", "41", "42", "43", "44"], colors: [{ name: "White/Green", hex: "#10b981" }, { name: "Black/Red", hex: "#ef4444" }], rating: 4.4, reviewCount: 203, inStock: true, featured: true
  },
  {
    id: 6, name: "Elegant Stiletto Heels", price: 6999, originalPrice: 8999, category: "Shoes",
    images: ["from-red-200 to-rose-300", "from-rose-200 to-red-300", "from-pink-200 to-rose-300", "from-red-100 to-rose-200"],
    emoji: "👠", description: "Stunning stiletto heels with a pointed toe and 10cm heel height.", sizes: ["35", "36", "37", "38", "39", "40", "41"], colors: [{ name: "Red", hex: "#ef4444" }, { name: "Black", hex: "#1a1a1a" }, { name: "Nude", hex: "#d4a574" }], rating: 4.3, reviewCount: 145, badge: "Sale", inStock: true, bestSeller: true
  },
  {
    id: 7, name: "Chelsea Boots", price: 7999, category: "Shoes",
    images: ["from-amber-200 to-orange-300", "from-orange-200 to-amber-300", "from-yellow-200 to-amber-300", "from-amber-100 to-orange-200"],
    emoji: "👢", description: "Classic Chelsea boots in genuine suede with elastic side panels.", sizes: ["36", "37", "38", "39", "40", "41", "42", "43"], colors: [{ name: "Tan", hex: "#d97706" }, { name: "Black", hex: "#1a1a1a" }], rating: 4.6, reviewCount: 98, inStock: true
  },
  {
    id: 8, name: "Canvas Slip-Ons", price: 2499, category: "Shoes",
    images: ["from-stone-100 to-stone-200", "from-neutral-100 to-stone-200", "from-stone-200 to-neutral-300", "from-stone-50 to-stone-200"],
    emoji: "🥿", description: "Comfortable canvas slip-on shoes with vulcanized rubber sole.", sizes: ["36", "37", "38", "39", "40", "41", "42", "43", "44"], colors: [{ name: "Natural", hex: "#d6d3d1" }, { name: "Navy", hex: "#1e3a5f" }], rating: 4.2, reviewCount: 312, badge: "Popular", inStock: true
  },
  {
    id: 9, name: "Skinny Fit Jeans", price: 3999, category: "Jeans",
    images: ["from-indigo-200 to-blue-300", "from-blue-200 to-indigo-300", "from-indigo-300 to-blue-400", "from-blue-300 to-indigo-400"],
    emoji: "👖", description: "Classic skinny fit jeans in premium stretch denim.", sizes: ["28", "30", "32", "34", "36"], colors: [{ name: "Dark Blue", hex: "#1e40af" }, { name: "Black", hex: "#1a1a1a" }], rating: 4.5, reviewCount: 189, inStock: true, featured: true, bestSeller: true
  },
  {
    id: 10, name: "High-Waist Mom Jeans", price: 3699, originalPrice: 4499, category: "Jeans",
    images: ["from-sky-200 to-blue-200", "from-blue-100 to-sky-200", "from-sky-300 to-blue-300", "from-sky-100 to-blue-200"],
    emoji: "👖", description: "Trendy high-waist mom jeans with a relaxed, tapered fit.", sizes: ["28", "30", "32", "34", "36"], colors: [{ name: "Light Blue", hex: "#93c5fd" }, { name: "Medium Blue", hex: "#60a5fa" }], rating: 4.7, reviewCount: 234, badge: "Trending", inStock: true, bestSeller: true
  },
  {
    id: 11, name: "Bootcut Denim", price: 4299, category: "Jeans",
    images: ["from-blue-200 to-indigo-300", "from-indigo-200 to-blue-300", "from-blue-300 to-indigo-300", "from-indigo-100 to-blue-200"],
    emoji: "👖", description: "Vintage-inspired bootcut jeans with a slight flare from the knee.", sizes: ["28", "30", "32", "34", "36"], colors: [{ name: "Medium Wash", hex: "#3b82f6" }, { name: "Dark Wash", hex: "#1e3a8a" }], rating: 4.3, reviewCount: 76, inStock: true
  },
  {
    id: 12, name: "Ripped Boyfriend Jeans", price: 3299, category: "Jeans",
    images: ["from-slate-200 to-gray-300", "from-gray-200 to-slate-300", "from-zinc-200 to-gray-300", "from-slate-300 to-gray-400"],
    emoji: "👖", description: "Relaxed boyfriend jeans with artful distressing.", sizes: ["28", "30", "32", "34", "36"], colors: [{ name: "Vintage Wash", hex: "#94a3b8" }], rating: 4.1, reviewCount: 112, inStock: true
  },
  {
    id: 13, name: "Leather Crossbody Bag", price: 5499, originalPrice: 6999, category: "Accessories",
    images: ["from-amber-200 to-yellow-300", "from-yellow-200 to-amber-300", "from-amber-100 to-yellow-200", "from-orange-200 to-amber-300"],
    emoji: "👜", description: "Elegant crossbody bag crafted from genuine leather.", sizes: ["One Size"], colors: [{ name: "Camel", hex: "#d97706" }, { name: "Black", hex: "#1a1a1a" }, { name: "Burgundy", hex: "#881337" }], rating: 4.8, reviewCount: 178, badge: "Best Seller", inStock: true, featured: true, bestSeller: true
  },
  {
    id: 14, name: "Gold Chain Necklace", price: 2999, category: "Accessories",
    images: ["from-yellow-200 to-amber-300", "from-amber-200 to-yellow-300", "from-yellow-100 to-amber-200", "from-amber-300 to-yellow-400"],
    emoji: "📿", description: "Delicate gold-plated chain necklace with a minimalist pendant.", sizes: ["One Size"], colors: [{ name: "Gold", hex: "#f59e0b" }, { name: "Silver", hex: "#9ca3af" }], rating: 4.4, reviewCount: 93, inStock: true
  },
  {
    id: 15, name: "Classic Analog Watch", price: 12999, category: "Accessories",
    images: ["from-zinc-200 to-slate-300", "from-slate-200 to-zinc-300", "from-gray-200 to-zinc-300", "from-zinc-300 to-slate-400"],
    emoji: "⌚", description: "Sophisticated analog watch with genuine leather strap.", sizes: ["One Size"], colors: [{ name: "Brown/Silver", hex: "#78716c" }, { name: "Black/Gold", hex: "#292524" }], rating: 4.9, reviewCount: 56, badge: "Premium", inStock: true, bestSeller: true
  },
  {
    id: 16, name: "Silk Scarf", price: 1999, originalPrice: 2999, category: "Accessories",
    images: ["from-purple-200 to-violet-300", "from-violet-200 to-purple-300", "from-fuchsia-200 to-violet-300", "from-purple-100 to-violet-200"],
    emoji: "🧣", description: "Luxurious silk scarf with a vibrant print.", sizes: ["One Size"], colors: [{ name: "Purple Print", hex: "#a855f7" }, { name: "Blue Print", hex: "#6366f1" }], rating: 4.5, reviewCount: 141, badge: "Sale", inStock: true
  },
];

const initialReviews: Review[] = [
  { id: 1, name: "Sarah M.", avatar: "👩", rating: 5, text: "Absolutely love the quality! The floral dress fits perfectly. Fast delivery to Dhaka!", date: "2 days ago", productId: 2 },
  { id: 2, name: "Aisha R.", avatar: "👩‍🦱", rating: 5, text: "The leather bag is gorgeous! Great customer service via WhatsApp.", date: "1 week ago", productId: 13 },
  { id: 3, name: "Tanvir H.", avatar: "👨", rating: 4, text: "Best online fashion store in Bangladesh! Easy bKash payment.", date: "2 weeks ago", productId: 1 },
  { id: 4, name: "Nusrat J.", avatar: "👩‍🦰", rating: 5, text: "The mom jeans are so comfortable and trendy. Perfect fit!", date: "3 weeks ago", productId: 10 },
  { id: 5, name: "Rifat K.", avatar: "👨‍🦱", rating: 5, text: "Classic watch arrived beautifully packaged. Looks premium!", date: "1 month ago", productId: 15 },
  { id: 6, name: "Mim F.", avatar: "👩‍🦳", rating: 4, text: "Running sneakers are super comfortable! True to size.", date: "1 month ago", productId: 5 },
];

const initialOrders: Order[] = [
  { id: "ORD-001", customer: "Rafiq Ahmed", phone: "01712345678", email: "rafiq@email.com", address: "House 12, Road 5, Dhanmondi", city: "Dhaka", items: [], total: 8498, shipping: 0, paymentMethod: "bkash", status: "delivered", date: "2024-01-15" },
  { id: "ORD-002", customer: "Fatema Begum", phone: "01898765432", email: "fatema@email.com", address: "Flat 3B, Green Tower, Nasirabad", city: "Chittagong", items: [], total: 12998, shipping: 120, paymentMethod: "nagad", status: "shipped", date: "2024-01-18" },
  { id: "ORD-003", customer: "Kamal Hossain", phone: "01612345678", email: "kamal@email.com", address: "45 Station Road, Ambarkhana", city: "Sylhet", items: [], total: 5999, shipping: 120, paymentMethod: "rocket", status: "processing", date: "2024-01-20" },
  { id: "ORD-004", customer: "Nadia Islam", phone: "01512345678", email: "nadia@email.com", address: "House 78, Sector 10, Uttara", city: "Dhaka", items: [], total: 15497, shipping: 0, paymentMethod: "bkash", status: "confirmed", date: "2024-01-22" },
  { id: "ORD-005", customer: "Arif Rahman", phone: "01912345678", email: "arif@email.com", address: "Block C, Bashundhara R/A", city: "Dhaka", items: [], total: 3499, shipping: 120, paymentMethod: "cod", status: "pending", date: "2024-01-23" },
  { id: "ORD-006", customer: "Sumaiya Akter", phone: "01812345678", email: "sumaiya@email.com", address: "House 5, Road 3, Mirpur-10", city: "Dhaka", items: [], total: 9698, shipping: 0, paymentMethod: "bkash", status: "delivered", date: "2024-01-10" },
  { id: "ORD-007", customer: "Habib Mia", phone: "01312345678", email: "habib@email.com", address: "24 College Road, Rajshahi", city: "Rajshahi", items: [], total: 6999, shipping: 120, paymentMethod: "nagad", status: "cancelled", date: "2024-01-08" },
];

const initialCustomers: Customer[] = [
  { id: 1, name: "Rafiq Ahmed", email: "rafiq@email.com", phone: "01712345678", orders: 5, totalSpent: 32450, joinDate: "2023-06-15", status: "active" },
  { id: 2, name: "Fatema Begum", email: "fatema@email.com", phone: "01898765432", orders: 3, totalSpent: 18990, joinDate: "2023-08-20", status: "active" },
  { id: 3, name: "Kamal Hossain", email: "kamal@email.com", phone: "01612345678", orders: 2, totalSpent: 11998, joinDate: "2023-10-05", status: "active" },
  { id: 4, name: "Nadia Islam", email: "nadia@email.com", phone: "01512345678", orders: 8, totalSpent: 65800, joinDate: "2023-03-10", status: "active" },
  { id: 5, name: "Arif Rahman", email: "arif@email.com", phone: "01912345678", orders: 1, totalSpent: 3499, joinDate: "2024-01-23", status: "active" },
  { id: 6, name: "Sumaiya Akter", email: "sumaiya@email.com", phone: "01812345678", orders: 4, totalSpent: 28700, joinDate: "2023-07-12", status: "active" },
  { id: 7, name: "Habib Mia", email: "habib@email.com", phone: "01312345678", orders: 1, totalSpent: 6999, joinDate: "2024-01-08", status: "inactive" },
];

const categories = ["All", "Clothes", "Shoes", "Jeans", "Accessories"];
const emojiOptions = ["👕", "👗", "🧥", "👚", "👔", "🥼", "👖", "👟", "👠", "👢", "🥿", "👞", "👜", "👝", "🎒", "📿", "⌚", "🧣", "🧤", "👒", "🕶️", "💍"];

// ============ CONTEXT ============
interface AppContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  wishlist: number[];
  toggleWishlist: (id: number) => void;
  currentPage: PageType;
  navigateTo: (page: PageType, data?: any) => void;
  pageData: any;
  toast: string;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType>({} as AppContextType);
const useApp = () => useContext(AppContext);

// ============ SHARED COMPONENTS ============
const StarRating = ({ rating, size = 16 }: { rating: number; size?: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <svg key={star} width={size} height={size} viewBox="0 0 24 24" fill={star <= Math.round(rating) ? "#f59e0b" : "#e5e7eb"} stroke="none">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
);

const Badge = ({ text }: { text: string }) => {
  const colors: Record<string, string> = { Sale: "bg-rose-500 text-white", New: "bg-emerald-500 text-white", Trending: "bg-violet-500 text-white", Popular: "bg-blue-500 text-white", "Best Seller": "bg-amber-500 text-white", Premium: "bg-gray-900 text-white" };
  return <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold z-10 ${colors[text] || "bg-gray-500 text-white"}`}>{text}</span>;
};

const ProductCard = ({ product }: { product: Product }) => {
  const { navigateTo, wishlist, toggleWishlist } = useApp();
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100" onClick={() => navigateTo("product", { productId: product.id })}>
      <div className="relative overflow-hidden aspect-[3/4]">
        {product.badge && <Badge text={product.badge} />}
        {discount > 0 && <span className="absolute top-3 right-3 bg-rose-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">-{discount}%</span>}
        <div className={`w-full h-full bg-gradient-to-br ${product.images[0]} flex items-center justify-center group-hover:scale-105 transition-transform duration-500`}>
          <span className="text-7xl drop-shadow-sm">{product.emoji}</span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }} className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-10">
          <svg width="20" height="20" viewBox="0 0 24 24" fill={wishlist.includes(product.id) ? "#f43f5e" : "none"} stroke={wishlist.includes(product.id) ? "#f43f5e" : "#6b7280"} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
        </button>
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{product.category}</p>
        <h3 className="font-semibold text-gray-800 mb-1 truncate">{product.name}</h3>
        <div className="flex items-center gap-1.5 mb-2"><StarRating rating={product.rating} size={14} /><span className="text-xs text-gray-400">({product.reviewCount})</span></div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">৳{product.price.toLocaleString()}</span>
          {product.originalPrice && <span className="text-sm text-gray-400 line-through">৳{product.originalPrice.toLocaleString()}</span>}
        </div>
      </div>
    </div>
  );
};

// ============ HEADER ============
const Header = () => {
  const { navigateTo, cartCount, currentPage } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const { products } = useApp();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  if (currentPage === "admin") return null;

  const searchResults = searchQuery.length > 1 ? products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())) : [];

  return (
    <>
      <div className="bg-gray-900 text-white text-center py-2 px-4 text-xs sm:text-sm font-medium tracking-wide">
        ✨ FREE SHIPPING OVER ৳5,000 | CODE: <span className="text-amber-400 font-bold">FASHION20</span> FOR 20% OFF ✨
      </div>
      <header className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? "shadow-md" : "shadow-sm"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <button className="lg:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg> : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>}
            </button>
            <button onClick={() => navigateTo("home")} className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">STYLE<span className="text-rose-500">HUB</span></span>
            </button>
            <nav className="hidden lg:flex items-center gap-8">
              {categories.map((cat) => (
                <button key={cat} onClick={() => navigateTo("products", { category: cat === "All" ? "all" : cat })} className="text-sm font-medium text-gray-600 hover:text-rose-500 transition-colors tracking-wide uppercase">{cat}</button>
              ))}
            </nav>
            <div className="flex items-center gap-2 sm:gap-4">
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              </button>
              <button onClick={() => navigateTo("account")} className="p-2 hover:bg-gray-100 rounded-full transition-colors hidden sm:block">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              </button>
              <button onClick={() => navigateTo("cart")} className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{cartCount}</span>}
              </button>
            </div>
          </div>
        </div>
        {menuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 pb-4">
            {categories.map((cat) => (
              <button key={cat} onClick={() => { navigateTo("products", { category: cat === "All" ? "all" : cat }); setMenuOpen(false); }} className="block w-full text-left px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-rose-500">{cat}</button>
            ))}
            <button onClick={() => { navigateTo("admin"); setMenuOpen(false); }} className="block w-full text-left px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-rose-500">🔐 Admin Panel</button>
          </div>
        )}
        {searchOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100 p-4 sm:p-6 z-50">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300" autoFocus />
                <svg className="absolute left-4 top-3.5 text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              </div>
              {searchResults.length > 0 && (
                <div className="mt-3 divide-y divide-gray-100">
                  {searchResults.slice(0, 5).map((p) => (
                    <button key={p.id} onClick={() => { navigateTo("product", { productId: p.id }); setSearchOpen(false); setSearchQuery(""); }} className="flex items-center gap-3 w-full p-3 hover:bg-gray-50 rounded-lg">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${p.images[0]} flex items-center justify-center`}><span className="text-xl">{p.emoji}</span></div>
                      <div className="text-left"><p className="text-sm font-medium text-gray-800">{p.name}</p><p className="text-sm text-rose-500 font-semibold">৳{p.price.toLocaleString()}</p></div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};

// ============ FOOTER ============
const Footer = () => {
  const { navigateTo, currentPage } = useApp();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  if (currentPage === "admin") return null;

  return (
    <footer className="bg-gray-900 text-white">
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl sm:text-3xl font-bold mb-2">Stay in Style</h3>
          <p className="text-rose-100 mb-6">Subscribe for exclusive deals & fashion tips</p>
          {subscribed ? <p className="font-semibold">✅ Thanks for subscribing!</p> : (
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 px-4 py-3 rounded-full bg-white/20 text-white placeholder:text-rose-200 focus:outline-none" />
              <button onClick={() => { if (email) setSubscribed(true); }} className="px-8 py-3 bg-white text-rose-500 rounded-full font-semibold hover:bg-gray-100">Subscribe</button>
            </div>
          )}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h4 className="text-2xl font-bold mb-4">STYLE<span className="text-rose-500">HUB</span></h4>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">Your premier fashion destination in Bangladesh.</p>
          </div>
          <div>
            <h5 className="font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h5>
            <ul className="space-y-2.5">
              {["Home", "Shop All", "About Us"].map((link) => (
                <li key={link}><button onClick={() => navigateTo(link === "Shop All" ? "products" : "home")} className="text-sm text-gray-400 hover:text-rose-400">{link}</button></li>
              ))}
              <li><button onClick={() => navigateTo("admin")} className="text-sm text-gray-400 hover:text-rose-400">🔐 Admin</button></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-4 text-sm uppercase tracking-wider">Categories</h5>
            <ul className="space-y-2.5">
              {["Clothes", "Shoes", "Jeans", "Accessories"].map((cat) => (
                <li key={cat}><button onClick={() => navigateTo("products", { category: cat })} className="text-sm text-gray-400 hover:text-rose-400">{cat}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h5>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>📍 Gulshan-2, Dhaka</li>
              <li>📞 +880 1XXX-XXXXXX</li>
              <li>✉️ hello@stylehub.com.bd</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© 2024 StyleHub. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-pink-600 text-white text-xs rounded font-bold">bKash</span>
            <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded font-bold">Nagad</span>
            <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded font-bold">Rocket</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

// ============ CHAT BUTTONS ============
const ChatButtons = () => {
  const { currentPage } = useApp();
  const [expanded, setExpanded] = useState(false);
  if (currentPage === "admin") return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {expanded && (
        <>
          <a href="https://wa.me/8801XXXXXXXXX" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white pl-4 pr-5 py-3 rounded-full shadow-lg"><span>💬</span><span className="text-sm font-medium">WhatsApp</span></a>
          <a href="https://m.me/stylehub" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white pl-4 pr-5 py-3 rounded-full shadow-lg"><span>💬</span><span className="text-sm font-medium">Messenger</span></a>
        </>
      )}
      <button onClick={() => setExpanded(!expanded)} className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white text-2xl transition-all hover:scale-110 ${expanded ? "bg-gray-700" : "bg-rose-500"}`}>{expanded ? "✕" : "💬"}</button>
    </div>
  );
};

const Toast = ({ message }: { message: string }) => {
  if (!message) return null;
  return (
    <div className="fixed top-24 right-4 sm:right-8 z-[100] bg-gray-900 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-2">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

// ====================================================
// ================ ADMIN PANEL =======================
// ====================================================

const AdminPanel = () => {
  const { products, setProducts, orders, setOrders, customers, reviews, setReviews, navigateTo, showToast } = useApp();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Product form
  const emptyProduct: Partial<Product> = { name: "", price: 0, originalPrice: undefined, category: "Clothes", emoji: "👕", description: "", sizes: [], colors: [], badge: "", inStock: true, featured: false, bestSeller: false, images: ["from-gray-100 to-gray-200", "from-gray-200 to-gray-300", "from-gray-100 to-gray-300", "from-gray-200 to-gray-400"] };
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [sizeInput, setSizeInput] = useState("");
  const [colorNameInput, setColorNameInput] = useState("");
  const [colorHexInput, setColorHexInput] = useState("#000000");
  const [productSearch, setProductSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");

  // Admin login
  const handleLogin = () => {
    if (adminUser === "admin" && adminPass === "admin123") {
      setIsLoggedIn(true);
      showToast("Welcome to Admin Panel!");
    } else {
      showToast("Wrong credentials! Use admin / admin123");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><span className="text-3xl">🔐</span></div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
            <p className="text-gray-500 text-sm mt-1">StyleHub Management Panel</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input type="text" value={adminUser} onChange={(e) => setAdminUser(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300" placeholder="Enter username" onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300" placeholder="Enter password" onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
            </div>
            <button onClick={handleLogin} className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors">Sign In</button>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
              <p className="text-xs text-amber-700">📌 Demo: <strong>admin</strong> / <strong>admin123</strong></p>
            </div>
            <button onClick={() => navigateTo("home")} className="w-full text-center text-sm text-gray-500 hover:text-rose-500">← Back to Store</button>
          </div>
        </div>
      </div>
    );
  }

  // Stats
  const totalRevenue = orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const totalProducts = products.length;
  const totalCustomers = customers.length;

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    processing: "bg-indigo-100 text-indigo-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    showToast(`Order ${orderId} updated to ${newStatus}`);
  };

  const deleteProduct = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast("Product deleted!");
    }
  };

  const saveProduct = () => {
    if (!editingProduct?.name || !editingProduct?.price) {
      showToast("Name and Price are required!"); return;
    }
    if (editingProduct.id) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...editingProduct } as Product : p));
      showToast("Product updated!");
    } else {
      const newId = Math.max(...products.map(p => p.id), 0) + 1;
      setProducts(prev => [...prev, { ...editingProduct, id: newId, rating: 0, reviewCount: 0, images: editingProduct.images || emptyProduct.images } as Product]);
      showToast("Product added!");
    }
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const deleteReview = (id: number) => {
    setReviews(prev => prev.filter(r => r.id !== id));
    showToast("Review deleted!");
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));
  const filteredOrders = orders.filter(o => {
    const matchSearch = o.id.toLowerCase().includes(orderSearch.toLowerCase()) || o.customer.toLowerCase().includes(orderSearch.toLowerCase());
    const matchFilter = orderFilter === "all" || o.status === orderFilter;
    return matchSearch && matchFilter;
  });

  const menuItems: { id: AdminTab; label: string; icon: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "products", label: "Products", icon: "📦" },
    { id: "orders", label: "Orders", icon: "🛒" },
    { id: "customers", label: "Customers", icon: "👥" },
    { id: "reviews", label: "Reviews", icon: "⭐" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:relative z-50 w-64 bg-gray-900 text-white min-h-screen transition-transform duration-300`}>
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold">STYLE<span className="text-rose-500">HUB</span></h2>
          <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
        </div>
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === item.id ? "bg-rose-500 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}>
              <span>{item.icon}</span><span>{item.label}</span>
              {item.id === "orders" && pendingOrders > 0 && <span className="ml-auto bg-amber-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{pendingOrders}</span>}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 space-y-2">
          <button onClick={() => navigateTo("home")} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-gray-800 hover:text-white">🏪 View Store</button>
          <button onClick={() => setIsLoggedIn(false)} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-900/20">🚪 Logout</button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(true)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 capitalize">{activeTab}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center text-white text-sm font-bold">A</div>
            <span className="hidden sm:block text-sm font-medium text-gray-700">Admin</span>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {/* ======= DASHBOARD ======= */}
          {activeTab === "dashboard" && (
            <div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Revenue", value: `৳${totalRevenue.toLocaleString()}`, icon: "💰", color: "from-emerald-500 to-green-600" },
                  { label: "Total Orders", value: totalOrders, icon: "📦", color: "from-blue-500 to-indigo-600" },
                  { label: "Products", value: totalProducts, icon: "🏷️", color: "from-purple-500 to-violet-600" },
                  { label: "Customers", value: totalCustomers, icon: "👥", color: "from-amber-500 to-orange-600" },
                ].map((stat, i) => (
                  <div key={i} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-4 sm:p-6 text-white`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{stat.icon}</span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
                    <p className="text-sm opacity-80 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h3>
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{order.id}</p>
                          <p className="text-xs text-gray-500">{order.customer}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">৳{order.total.toLocaleString()}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status]}`}>{order.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Stats */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Order Status Overview</h3>
                  <div className="space-y-3">
                    {(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] as const).map((status) => {
                      const count = orders.filter(o => o.status === status).length;
                      const percent = totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0;
                      return (
                        <div key={status} className="flex items-center gap-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium w-24 text-center capitalize ${statusColors[status]}`}>{status}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                            <div className={`h-2.5 rounded-full ${status === "delivered" ? "bg-emerald-500" : status === "cancelled" ? "bg-red-500" : "bg-blue-500"}`} style={{ width: `${percent}%` }} />
                          </div>
                          <span className="text-sm font-semibold text-gray-700 w-8 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-gray-700 mb-3">Top Categories</h4>
                    {["Clothes", "Shoes", "Jeans", "Accessories"].map((cat) => (
                      <div key={cat} className="flex items-center justify-between py-1.5">
                        <span className="text-sm text-gray-600">{cat}</span>
                        <span className="text-sm font-semibold">{products.filter(p => p.category === cat).length} items</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======= PRODUCTS ======= */}
          {activeTab === "products" && (
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <input type="text" placeholder="Search products..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="w-full sm:w-72 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
                <button onClick={() => { setEditingProduct({ ...emptyProduct }); setShowProductForm(true); }} className="px-6 py-2.5 bg-rose-500 text-white rounded-xl font-semibold text-sm hover:bg-rose-600 flex items-center gap-2 whitespace-nowrap">
                  + Add Product
                </button>
              </div>

              {/* Product Form Modal */}
              {showProductForm && editingProduct && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
                  <div className="bg-white rounded-2xl w-full max-w-2xl my-8 p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold">{editingProduct.id ? "Edit Product" : "Add New Product"}</h3>
                      <button onClick={() => { setShowProductForm(false); setEditingProduct(null); }} className="p-2 hover:bg-gray-100 rounded-lg">✕</button>
                    </div>
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                          <input type="text" value={editingProduct.name || ""} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                          <select value={editingProduct.category || "Clothes"} onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300">
                            {["Clothes", "Shoes", "Jeans", "Accessories"].map(c => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price (৳) *</label>
                          <input type="number" value={editingProduct.price || ""} onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Original Price</label>
                          <input type="number" value={editingProduct.originalPrice || ""} onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: Number(e.target.value) || undefined })} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" placeholder="For sale items" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Badge</label>
                          <select value={editingProduct.badge || ""} onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300">
                            <option value="">None</option>
                            {["New", "Sale", "Trending", "Popular", "Best Seller", "Premium"].map(b => <option key={b}>{b}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Emoji Icon</label>
                        <div className="flex flex-wrap gap-2">
                          {emojiOptions.map(e => (
                            <button key={e} onClick={() => setEditingProduct({ ...editingProduct, emoji: e })} className={`w-10 h-10 rounded-lg border-2 text-xl flex items-center justify-center ${editingProduct.emoji === e ? "border-rose-500 bg-rose-50" : "border-gray-200 hover:border-gray-300"}`}>{e}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea value={editingProduct.description || ""} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" rows={3} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sizes</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {(editingProduct.sizes || []).map((s, i) => (
                            <span key={i} className="px-3 py-1 bg-gray-100 rounded-lg text-sm flex items-center gap-1">{s}<button onClick={() => setEditingProduct({ ...editingProduct, sizes: editingProduct.sizes?.filter((_, idx) => idx !== i) })} className="text-red-400 hover:text-red-600 ml-1">×</button></span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input type="text" value={sizeInput} onChange={(e) => setSizeInput(e.target.value)} placeholder="e.g. M or 42" className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" onKeyDown={(e) => { if (e.key === "Enter" && sizeInput) { setEditingProduct({ ...editingProduct, sizes: [...(editingProduct.sizes || []), sizeInput] }); setSizeInput(""); } }} />
                          <button onClick={() => { if (sizeInput) { setEditingProduct({ ...editingProduct, sizes: [...(editingProduct.sizes || []), sizeInput] }); setSizeInput(""); } }} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">Add</button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Colors</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {(editingProduct.colors || []).map((c, i) => (
                            <span key={i} className="px-3 py-1 bg-gray-100 rounded-lg text-sm flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full border" style={{ backgroundColor: c.hex }} />{c.name}
                              <button onClick={() => setEditingProduct({ ...editingProduct, colors: editingProduct.colors?.filter((_, idx) => idx !== i) })} className="text-red-400 hover:text-red-600">×</button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input type="text" value={colorNameInput} onChange={(e) => setColorNameInput(e.target.value)} placeholder="Color name" className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
                          <input type="color" value={colorHexInput} onChange={(e) => setColorHexInput(e.target.value)} className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                          <button onClick={() => { if (colorNameInput) { setEditingProduct({ ...editingProduct, colors: [...(editingProduct.colors || []), { name: colorNameInput, hex: colorHexInput }] }); setColorNameInput(""); } }} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">Add</button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editingProduct.inStock ?? true} onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.checked })} className="rounded" /> In Stock</label>
                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editingProduct.featured ?? false} onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })} className="rounded" /> Featured</label>
                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editingProduct.bestSeller ?? false} onChange={(e) => setEditingProduct({ ...editingProduct, bestSeller: e.target.checked })} className="rounded" /> Best Seller</label>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6 pt-4 border-t">
                      <button onClick={() => { setShowProductForm(false); setEditingProduct(null); }} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm">Cancel</button>
                      <button onClick={saveProduct} className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-semibold text-sm hover:bg-rose-600">Save Product</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Products Table */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Product</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Category</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Stock</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Rating</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${product.images[0]} flex items-center justify-center flex-shrink-0`}><span className="text-lg">{product.emoji}</span></div>
                              <div>
                                <p className="text-sm font-medium text-gray-800 truncate max-w-[150px] sm:max-w-[200px]">{product.name}</p>
                                {product.badge && <span className="text-xs text-rose-500">{product.badge}</span>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{product.category}</td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-semibold">৳{product.price.toLocaleString()}</p>
                            {product.originalPrice && <p className="text-xs text-gray-400 line-through">৳{product.originalPrice.toLocaleString()}</p>}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${product.inStock ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{product.inStock ? "In Stock" : "Out"}</span>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell"><div className="flex items-center gap-1"><StarRating rating={product.rating} size={12} /><span className="text-xs text-gray-500 ml-1">{product.rating}</span></div></td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => { setEditingProduct({ ...product }); setShowProductForm(true); }} className="p-2 hover:bg-blue-50 rounded-lg text-blue-500" title="Edit">✏️</button>
                              <button onClick={() => deleteProduct(product.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500" title="Delete">🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredProducts.length === 0 && <div className="text-center py-12 text-gray-400"><p>No products found</p></div>}
              </div>
            </div>
          )}

          {/* ======= ORDERS ======= */}
          {activeTab === "orders" && (
            <div>
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <input type="text" placeholder="Search orders..." value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} className="flex-1 sm:max-w-xs px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
                <select value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300">
                  <option value="all">All Status</option>
                  {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </div>

              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-bold text-gray-900">{order.id}</h3>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColors[order.status]}`}>{order.status}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{order.date}</p>
                      </div>
                      <p className="text-xl font-bold text-gray-900">৳{order.total.toLocaleString()}</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 text-sm">
                      <div><p className="text-gray-400 text-xs">Customer</p><p className="font-medium">{order.customer}</p></div>
                      <div><p className="text-gray-400 text-xs">Phone</p><p className="font-medium">{order.phone}</p></div>
                      <div><p className="text-gray-400 text-xs">City</p><p className="font-medium">{order.city}</p></div>
                      <div><p className="text-gray-400 text-xs">Payment</p><p className="font-medium capitalize">{order.paymentMethod}</p></div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 mb-3">
                      <p className="text-xs text-gray-400 mb-1">Address</p>
                      <p className="text-sm">{order.address}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs text-gray-500 py-1.5">Update Status:</span>
                      {(["confirmed", "processing", "shipped", "delivered", "cancelled"] as const).map((s) => (
                        <button key={s} onClick={() => updateOrderStatus(order.id, s)} disabled={order.status === s} className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition-all ${order.status === s ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{s}</button>
                      ))}
                    </div>
                  </div>
                ))}
                {filteredOrders.length === 0 && <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border"><p>No orders found</p></div>}
              </div>
            </div>
          )}

          {/* ======= CUSTOMERS ======= */}
          {activeTab === "customers" && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Phone</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Orders</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Total Spent</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Joined</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 font-bold text-sm">{customer.name.charAt(0)}</div>
                            <div><p className="text-sm font-medium text-gray-800">{customer.name}</p><p className="text-xs text-gray-400">{customer.email}</p></div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{customer.phone}</td>
                        <td className="px-4 py-3 text-sm font-semibold hidden md:table-cell">{customer.orders}</td>
                        <td className="px-4 py-3 text-sm font-semibold">৳{customer.totalSpent.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">{customer.joinDate}</td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${customer.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{customer.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======= REVIEWS ======= */}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              {reviews.map((review) => {
                const product = products.find(p => p.id === review.productId);
                return (
                  <div key={review.id} className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{review.avatar}</span>
                        <div>
                          <p className="font-semibold text-gray-800">{review.name}</p>
                          <div className="flex items-center gap-2"><StarRating rating={review.rating} size={14} /><span className="text-xs text-gray-400">{review.date}</span></div>
                        </div>
                      </div>
                      <button onClick={() => deleteReview(review.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600 text-sm" title="Delete">🗑️</button>
                    </div>
                    <p className="text-sm text-gray-600 mt-3">{review.text}</p>
                    {product && <p className="text-xs text-gray-400 mt-2">Product: <span className="text-gray-600">{product.emoji} {product.name}</span></p>}
                  </div>
                );
              })}
              {reviews.length === 0 && <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border"><p>No reviews yet</p></div>}
            </div>
          )}

          {/* ======= SETTINGS ======= */}
          {activeTab === "settings" && (
            <div className="max-w-2xl space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🏪 Store Settings</h3>
                <div className="space-y-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label><input type="text" defaultValue="StyleHub" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Store Email</label><input type="email" defaultValue="hello@stylehub.com.bd" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label><input type="tel" defaultValue="+880 1XXX-XXXXXX" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Address</label><textarea defaultValue="Gulshan-2, Dhaka, Bangladesh" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" rows={2} /></div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🚚 Shipping Settings</h3>
                <div className="space-y-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Free Shipping Minimum (৳)</label><input type="number" defaultValue="5000" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Shipping Fee (৳)</label><input type="number" defaultValue="120" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" /></div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">💳 Payment Methods</h3>
                <div className="space-y-3">
                  {[{ name: "bKash", color: "bg-pink-600" }, { name: "Nagad", color: "bg-orange-500" }, { name: "Rocket", color: "bg-purple-600" }, { name: "Cash on Delivery", color: "bg-gray-700" }].map((pm) => (
                    <label key={pm.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 ${pm.color} rounded-lg flex items-center justify-center text-white text-xs font-bold`}>{pm.name[0]}</span>
                        <span className="text-sm font-medium">{pm.name}</span>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </label>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🔐 Change Admin Password</h3>
                <div className="space-y-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label><input type="password" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">New Password</label><input type="password" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label><input type="password" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" /></div>
                </div>
              </div>
              <button onClick={() => showToast("Settings saved!")} className="w-full py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600">Save All Settings</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// ============ STORE PAGES ============
const HomePage = () => {
  const { navigateTo, products } = useApp();
  const featuredProducts = products.filter((p) => p.featured);
  const bestSellers = products.filter((p) => p.bestSeller);
  const { reviews } = useApp();

  return (
    <div>
      <section className="relative bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="text-center lg:text-left">
              <span className="inline-block px-4 py-1.5 bg-rose-100 text-rose-600 rounded-full text-sm font-semibold mb-6">New Collection 2024</span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">Discover Your <br /><span className="text-rose-500">Perfect Style</span></h1>
              <p className="text-gray-600 text-lg mb-8 max-w-lg mx-auto lg:mx-0">Explore our curated collection of trendy fashion pieces.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button onClick={() => navigateTo("products", { category: "all" })} className="px-8 py-4 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 shadow-lg">Shop Now →</button>
                <button onClick={() => navigateTo("products", { category: "all" })} className="px-8 py-4 bg-white text-gray-900 rounded-full font-semibold border border-gray-200">View Collections</button>
              </div>
              <div className="flex items-center gap-8 mt-10 justify-center lg:justify-start">
                <div><p className="text-2xl font-bold">500+</p><p className="text-sm text-gray-500">Products</p></div>
                <div className="w-px h-10 bg-gray-200" />
                <div><p className="text-2xl font-bold">10K+</p><p className="text-sm text-gray-500">Customers</p></div>
                <div className="w-px h-10 bg-gray-200" />
                <div><p className="text-2xl font-bold">4.8★</p><p className="text-sm text-gray-500">Rating</p></div>
              </div>
            </div>
            <div className="hidden lg:grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-pink-200 to-rose-300 rounded-3xl h-48 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer" onClick={() => navigateTo("products", { category: "Clothes" })}><span className="text-7xl">👗</span></div>
                <div className="bg-gradient-to-br from-indigo-200 to-blue-300 rounded-3xl h-64 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer" onClick={() => navigateTo("products", { category: "Jeans" })}><span className="text-7xl">👖</span></div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="bg-gradient-to-br from-amber-200 to-orange-300 rounded-3xl h-64 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer" onClick={() => navigateTo("products", { category: "Shoes" })}><span className="text-7xl">👟</span></div>
                <div className="bg-gradient-to-br from-purple-200 to-violet-300 rounded-3xl h-48 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer" onClick={() => navigateTo("products", { category: "Accessories" })}><span className="text-7xl">👜</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-10">Shop by Category</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[{ name: "Clothes", emoji: "👕👗", gradient: "from-pink-100 to-rose-200" }, { name: "Shoes", emoji: "👟👠", gradient: "from-emerald-100 to-teal-200" }, { name: "Jeans", emoji: "👖✨", gradient: "from-indigo-100 to-blue-200" }, { name: "Accessories", emoji: "👜⌚", gradient: "from-amber-100 to-yellow-200" }].map((cat) => (
            <button key={cat.name} onClick={() => navigateTo("products", { category: cat.name })} className={`bg-gradient-to-br ${cat.gradient} rounded-2xl p-6 sm:p-8 text-center hover:shadow-lg transition-all hover:-translate-y-1`}>
              <span className="text-4xl sm:text-5xl block mb-3">{cat.emoji}</span>
              <h3 className="font-bold text-gray-800 text-lg">{cat.name}</h3>
              <p className="text-sm text-gray-600">{products.filter(p => p.category === cat.name).length} items</p>
            </button>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-10">Featured Products</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 sm:p-12 lg:p-16 text-white relative overflow-hidden">
          <span className="text-amber-400 font-semibold text-sm uppercase tracking-wider">Limited Time</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4">Up to 40% Off New Arrivals</h2>
          <p className="text-gray-300 mb-6">Premium fashion at unbeatable prices.</p>
          <button onClick={() => navigateTo("products", { category: "all" })} className="px-8 py-4 bg-rose-500 text-white rounded-full font-semibold hover:bg-rose-600">Shop the Sale →</button>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-10">Best Sellers 🔥</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {bestSellers.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[{ icon: "🚚", title: "Free Shipping", desc: "Over ৳5,000" }, { icon: "🔄", title: "Easy Returns", desc: "7-day policy" }, { icon: "🛡️", title: "Secure Payment", desc: "bKash, Nagad, Rocket" }, { icon: "💬", title: "24/7 Support", desc: "WhatsApp & Messenger" }].map((f, i) => (
            <div key={i} className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg transition-all">
              <span className="text-3xl block mb-3">{f.icon}</span><h3 className="font-bold text-gray-800 mb-1">{f.title}</h3><p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-10">Customer Love ❤️</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3"><span className="text-3xl">{r.avatar}</span><div><p className="font-semibold text-gray-800">{r.name}</p><p className="text-xs text-gray-400">{r.date}</p></div></div>
                <StarRating rating={r.rating} /><p className="text-gray-600 text-sm mt-3">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const ProductsPage = () => {
  const { pageData, products } = useApp();
  const [selectedCategory, setSelectedCategory] = useState(pageData?.category || "all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 15000]);
  const [sortBy, setSortBy] = useState("default");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { if (pageData?.category) setSelectedCategory(pageData.category); }, [pageData]);

  let filtered = products.filter((p) => (selectedCategory === "all" || p.category === selectedCategory) && p.price >= priceRange[0] && p.price <= priceRange[1]);
  if (sortBy === "price-low") filtered.sort((a, b) => a.price - b.price);
  if (sortBy === "price-high") filtered.sort((a, b) => b.price - a.price);
  if (sortBy === "rating") filtered.sort((a, b) => b.rating - a.rating);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 capitalize">{selectedCategory === "all" ? "All Products" : selectedCategory}</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium">⚙️ Filters</button>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium focus:outline-none">
            <option value="default">Default</option><option value="price-low">Price: Low→High</option><option value="price-high">Price: High→Low</option><option value="rating">Rating</option>
          </select>
        </div>
      </div>
      <div className="flex gap-8">
        <aside className={`${showFilters ? "fixed inset-0 z-50 bg-white p-6 overflow-y-auto" : "hidden"} lg:block lg:relative lg:w-64 flex-shrink-0`}>
          {showFilters && <div className="flex justify-between mb-6 lg:hidden"><h3 className="font-bold">Filters</h3><button onClick={() => setShowFilters(false)}>✕</button></div>}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 uppercase mb-4">Category</h3>
            {categories.map((cat) => { const val = cat === "All" ? "all" : cat; return (
              <button key={cat} onClick={() => { setSelectedCategory(val); setShowFilters(false); }} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm mb-1 ${selectedCategory === val ? "bg-rose-50 text-rose-600 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}><span>{cat}</span><span className="text-xs text-gray-400">{cat === "All" ? products.length : products.filter(p => p.category === cat).length}</span></button>
            ); })}
          </div>
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-900 uppercase mb-4">Price</h3>
            {([["All Prices", 0, 15000], ["Under ৳2,000", 0, 2000], ["৳2,000-৳5,000", 2000, 5000], ["৳5,000-৳10,000", 5000, 10000], ["Over ৳10,000", 10000, 15000]] as [string, number, number][]).map(([label, min, max]) => (
              <button key={label} onClick={() => { setPriceRange([min, max]); setShowFilters(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 ${priceRange[0] === min && priceRange[1] === max ? "bg-rose-50 text-rose-600 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>{label}</button>
            ))}
          </div>
        </aside>
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-4">{filtered.length} products</p>
          {filtered.length > 0 ? <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">{filtered.map((p) => <ProductCard key={p.id} product={p} />)}</div> : <div className="text-center py-20"><span className="text-5xl block mb-4">🔍</span><p className="text-gray-500">No products found</p></div>}
        </div>
      </div>
    </div>
  );
};

const ProductDetailPage = () => {
  // ✅ এখন (reviews সরিয়ে দিন):
const { pageData, addToCart, showToast, navigateTo, products } = useApp();
  const product = products.find((p) => p.id === pageData?.productId);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  if (!product) return <div className="text-center py-20"><p>Product not found</p></div>;

  const handleAddToCart = () => {
    if (!selectedSize) { showToast("Please select a size"); return; }
    if (!selectedColor) { showToast("Please select a color"); return; }
    addToCart({ product, quantity, size: selectedSize, color: selectedColor });
    showToast(`${product.name} added to cart!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 flex-wrap">
        <button onClick={() => navigateTo("home")} className="hover:text-rose-500">Home</button><span>/</span>
        <button onClick={() => navigateTo("products", { category: product.category })} className="hover:text-rose-500">{product.category}</button><span>/</span>
        <span className="text-gray-800 font-medium">{product.name}</span>
      </div>
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden mb-4">
            <div className={`w-full h-full bg-gradient-to-br ${product.images[selectedImage]} flex items-center justify-center`}><span className="text-[120px] drop-shadow-sm">{product.emoji}</span></div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {product.images.map((img, i) => (
              <button key={i} onClick={() => setSelectedImage(i)} className={`aspect-square rounded-xl overflow-hidden border-2 ${i === selectedImage ? "border-rose-500" : "border-gray-200"}`}>
                <div className={`w-full h-full bg-gradient-to-br ${img} flex items-center justify-center`}><span className="text-2xl">{product.emoji}</span></div>
              </button>
            ))}
          </div>
        </div>
        <div>
          {product.badge && <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${product.badge === "Sale" ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"}`}>{product.badge}</span>}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <div className="flex items-center gap-3 mb-4"><StarRating rating={product.rating} /><span className="text-sm text-gray-500">({product.reviewCount} reviews)</span></div>
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold">৳{product.price.toLocaleString()}</span>
            {product.originalPrice && <span className="text-xl text-gray-400 line-through">৳{product.originalPrice.toLocaleString()}</span>}
          </div>
          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>
          <div className="mb-6">
            <h3 className="text-sm font-bold uppercase mb-3">Color: <span className="text-gray-500 font-normal normal-case">{selectedColor}</span></h3>
            <div className="flex gap-3">{product.colors.map((c) => (
              <button key={c.name} onClick={() => setSelectedColor(c.name)} className={`w-10 h-10 rounded-full border-2 ${selectedColor === c.name ? "border-rose-500 ring-2 ring-rose-200" : "border-gray-300"}`} style={{ backgroundColor: c.hex }} title={c.name} />
            ))}</div>
          </div>
          <div className="mb-6">
            <h3 className="text-sm font-bold uppercase mb-3">Size</h3>
            <div className="flex flex-wrap gap-2">{product.sizes.map((s) => (
              <button key={s} onClick={() => setSelectedSize(s)} className={`min-w-[48px] px-4 py-2.5 rounded-xl text-sm font-medium ${selectedSize === s ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{s}</button>
            ))}</div>
          </div>
          <div className="mb-8">
            <h3 className="text-sm font-bold uppercase mb-3">Quantity</h3>
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl w-fit">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 rounded-l-xl">−</button>
              <span className="w-12 text-center font-semibold">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 rounded-r-xl">+</button>
            </div>
          </div>
          <div className="flex gap-3 mb-8">
            <button onClick={handleAddToCart} className="flex-1 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 shadow-lg">Add to Cart</button>
            <button onClick={() => { handleAddToCart(); navigateTo("checkout"); }} className="flex-1 py-4 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600">Buy Now</button>
          </div>
          <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
            {["🚚 Free shipping over ৳5,000", "🔄 7-day easy return", "🛡️ 100% secure payment"].map((t, i) => <div key={i} className="flex items-center gap-3 text-sm text-gray-600">{t}</div>)}
          </div>
        </div>
      </div>
      {/* Related */}
      {products.filter(p => p.category === product.category && p.id !== product.id).length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
};

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, navigateTo } = useApp();
  if (cart.length === 0) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <span className="text-6xl block mb-4">🛒</span><h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
      <button onClick={() => navigateTo("products", { category: "all" })} className="mt-4 px-8 py-3 bg-gray-900 text-white rounded-full font-semibold">Start Shopping</button>
    </div>
  );
  const shipping = cartTotal >= 5000 ? 0 : 120;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8">Shopping Cart ({cart.length})</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 flex gap-4">
              <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-gradient-to-br ${item.product.images[0]} flex items-center justify-center flex-shrink-0`}><span className="text-3xl sm:text-4xl">{item.product.emoji}</span></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between"><div><h3 className="font-semibold text-gray-800 truncate">{item.product.name}</h3><p className="text-sm text-gray-400">Size: {item.size} · {item.color}</p></div>
                  <button onClick={() => removeFromCart(i)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500">🗑️</button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg"><button onClick={() => updateQuantity(i, Math.max(1, item.quantity - 1))} className="w-8 h-8 flex items-center justify-center rounded-l-lg">−</button><span className="w-8 text-center text-sm font-semibold">{item.quantity}</span><button onClick={() => updateQuantity(i, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center rounded-r-lg">+</button></div>
                  <p className="font-bold">৳{(item.product.price * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="lg:sticky lg:top-28 h-fit">
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>৳{cartTotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span className={shipping === 0 ? "text-emerald-500 font-semibold" : ""}>{shipping === 0 ? "FREE" : `৳${shipping}`}</span></div>
              <div className="border-t pt-3 flex justify-between text-base font-bold"><span>Total</span><span>৳{(cartTotal + shipping).toLocaleString()}</span></div>
            </div>
            <button onClick={() => navigateTo("checkout")} className="w-full mt-6 py-4 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600">Proceed to Checkout</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckoutPage = () => {
  const { cart, cartTotal, clearCart, navigateTo, showToast, setOrders, orders } = useApp();
  const [paymentMethod, setPaymentMethod] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", city: "", paymentNumber: "" });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const shipping = cartTotal >= 5000 ? 0 : 120;

  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.address || !paymentMethod) { showToast("Please fill all required fields"); return; }
    const newOrder: Order = { id: `ORD-${String(orders.length + 1).padStart(3, "0")}`, customer: form.name, phone: form.phone, email: form.email, address: form.address, city: form.city, items: [...cart], total: cartTotal + shipping, shipping, paymentMethod, status: "pending", date: new Date().toISOString().split("T")[0] };
    setOrders(prev => [newOrder, ...prev]);
    setOrderPlaced(true);
    clearCart();
  };

  if (orderPlaced) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg></div>
      <h2 className="text-2xl font-bold mb-2">Order Placed! 🎉</h2><p className="text-gray-500 mb-8">Thank you for your purchase</p>
      <button onClick={() => navigateTo("home")} className="px-8 py-3 bg-gray-900 text-white rounded-full font-semibold">Continue Shopping</button>
    </div>
  );

  if (cart.length === 0) return <div className="text-center py-20"><h2 className="text-2xl font-bold mb-4">Cart is empty</h2><button onClick={() => navigateTo("products", { category: "all" })} className="px-8 py-3 bg-gray-900 text-white rounded-full font-semibold">Shop Now</button></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8">Checkout</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border p-6">
            <h3 className="font-bold mb-4">📦 Shipping Information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300" /></div>
              <div><label className="block text-sm font-medium mb-1">Phone *</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300" /></div>
              <div><label className="block text-sm font-medium mb-1">Email</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300" /></div>
              <div><label className="block text-sm font-medium mb-1">City</label><select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300"><option value="">Select</option><option>Dhaka</option><option>Chittagong</option><option>Sylhet</option><option>Rajshahi</option><option>Khulna</option></select></div>
              <div className="sm:col-span-2"><label className="block text-sm font-medium mb-1">Address *</label><textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300" rows={2} /></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border p-6">
            <h3 className="font-bold mb-4">💳 Payment</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ id: "bkash", name: "bKash", color: "bg-pink-600" }, { id: "nagad", name: "Nagad", color: "bg-orange-500" }, { id: "rocket", name: "Rocket", color: "bg-purple-600" }, { id: "cod", name: "Cash on Delivery", color: "bg-gray-700" }].map((m) => (
                <button key={m.id} onClick={() => setPaymentMethod(m.id)} className={`p-4 rounded-xl border-2 text-left ${paymentMethod === m.id ? "border-rose-500 bg-rose-50" : "border-gray-200"}`}>
                  <div className="flex items-center gap-3"><span className={`w-10 h-10 ${m.color} text-white rounded-lg flex items-center justify-center font-bold`}>{m.name[0]}</span><span className="font-semibold text-sm">{m.name}</span></div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:sticky lg:top-28 h-fit">
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="font-bold mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4">{cart.map((item, i) => <div key={i} className="flex items-center justify-between text-sm"><span className="truncate mr-2">{item.product.emoji} {item.product.name} ×{item.quantity}</span><span className="font-semibold">৳{(item.product.price * item.quantity).toLocaleString()}</span></div>)}</div>
            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>৳{cartTotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "FREE" : `৳${shipping}`}</span></div>
              <div className="border-t pt-2 flex justify-between font-bold text-base"><span>Total</span><span>৳{(cartTotal + shipping).toLocaleString()}</span></div>
            </div>
            <button onClick={handleSubmit} className="w-full mt-6 py-4 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600">Place Order</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AccountPage = () => {
  const [tab, setTab] = useState<"login" | "register">("login");
  const { showToast, navigateTo } = useApp();
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-center mb-8">My Account</h1>
      <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
        {(["login", "register"] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize ${tab === t ? "bg-white shadow-sm" : "text-gray-500"}`}>{t === "login" ? "Sign In" : "Register"}</button>)}
      </div>
      {tab === "login" ? (
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Email</label><input className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300" placeholder="email@example.com" /></div>
          <div><label className="block text-sm font-medium mb-1">Password</label><input type="password" className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300" placeholder="••••••••" /></div>
          <button onClick={() => showToast("Logged in!")} className="w-full py-4 bg-gray-900 text-white rounded-xl font-semibold">Sign In</button>
          <button onClick={() => navigateTo("admin")} className="w-full py-3 bg-rose-50 text-rose-600 rounded-xl font-semibold text-sm hover:bg-rose-100">🔐 Go to Admin Panel</button>
        </div>
      ) : (
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Name</label><input className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300" /></div>
          <div><label className="block text-sm font-medium mb-1">Email</label><input className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300" /></div>
          <div><label className="block text-sm font-medium mb-1">Phone</label><input className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300" /></div>
          <div><label className="block text-sm font-medium mb-1">Password</label><input type="password" className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300" /></div>
          <button onClick={() => { showToast("Account created!"); setTab("login"); }} className="w-full py-4 bg-rose-500 text-white rounded-xl font-semibold">Create Account</button>
        </div>
      )}
    </div>
  );
};

// ============ APP ============
export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>("home");
  const [pageData, setPageData] = useState<any>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [toast, setToast] = useState("");
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    document.body.style.fontFamily = "'Poppins', sans-serif";
    const style = document.createElement("style");
    style.textContent = `*{font-family:'Poppins',sans-serif}`;
    document.head.appendChild(style);
  }, []);

  const navigateTo = useCallback((page: PageType, data?: any) => { setCurrentPage(page); setPageData(data || {}); window.scrollTo({ top: 0, behavior: "smooth" }); }, []);
  const addToCart = useCallback((item: CartItem) => { setCart(prev => { const idx = prev.findIndex(i => i.product.id === item.product.id && i.size === item.size && i.color === item.color); if (idx >= 0) { const u = [...prev]; u[idx].quantity += item.quantity; return u; } return [...prev, item]; }); }, []);
  const removeFromCart = useCallback((i: number) => setCart(prev => prev.filter((_, idx) => idx !== i)), []);
  const updateQuantity = useCallback((i: number, q: number) => setCart(prev => { const u = [...prev]; u[i].quantity = q; return u; }), []);
  const clearCart = useCallback(() => setCart([]), []);
  const toggleWishlist = useCallback((id: number) => setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]), []);
  const showToast = useCallback((msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); }, []);

  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const ctx: AppContextType = { products, setProducts, orders, setOrders, customers, setCustomers, reviews, setReviews, cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, wishlist, toggleWishlist, currentPage, navigateTo, pageData, toast, showToast };

  const renderPage = () => {
    switch (currentPage) {
      case "home": return <HomePage />;
      case "products": return <ProductsPage />;
      case "product": return <ProductDetailPage />;
      case "cart": return <CartPage />;
      case "checkout": return <CheckoutPage />;
      case "account": return <AccountPage />;
      case "admin": return <AdminPanel />;
      default: return <HomePage />;
    }
  };

  return (
    <AppContext.Provider value={ctx}>
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="flex-1">{renderPage()}</main>
        <Footer />
        <ChatButtons />
        <Toast message={toast} />
      </div>
    </AppContext.Provider>
  );
}
