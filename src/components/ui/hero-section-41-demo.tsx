import HeroSection41 from "@/components/ui/shadcn-studio-hero-section-41"
import type {
  MenuData,
  NavigationSection,
} from "@/components/ui/shadcn-studio-hero-section-41"

export const FIREY_TREAT_HERO_NAV: NavigationSection[] = [
  {
    title: "Menu",
    href: "#menu-section",
  },
  {
    title: "Signature",
    href: "#signature-section",
  },
  {
    title: "Offers",
    href: "#offers-section",
  },
  {
    title: "About Us",
    href: "#about-section",
  },
  {
    title: "Contact",
    href: "#location-section",
  },
]

export const FIREY_TREAT_HERO_MENU_DATA: MenuData[] = [
  {
    id: 1,
    img: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=800&q=80",
    imgAlt: "Crispy Golden Fried Chicken Bucket",
    dishTitle: "Crispy Fried Chicken",
    dishPrice: "₹79+",
    userComment:
      "The crunchiest fried chicken in Pachikapalem — piping hot and juicy every single time!",
    userAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80",
  },
  {
    id: 2,
    img: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80",
    imgAlt: "100% Basmati Chicken Fried Rice",
    dishTitle: "Basmati Fried Rice",
    dishPrice: "₹100",
    userComment:
      "Made with 100% authentic long-grain Basmathi rice. Best wok-tossed flavors in town!",
    userAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80",
  },
  {
    id: 3,
    img: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=800&q=80",
    imgAlt: "Fiery Peri Peri Thunder Wings",
    dishTitle: "Thunder Wings",
    dishPrice: "₹120",
    userComment:
      "The Peri Peri and Chipotle Thunder Wings hit the exact spice note. This place never disappoints!",
    userAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
  },
  {
    id: 4,
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    imgAlt: "Loaded Crispy Chicken Burger",
    dishTitle: "Crispy Chicken Burger",
    dishPrice: "₹99",
    userComment:
      "Super fast delivery within 20 minutes and the loaded burgers stay crisp and fresh!",
    userAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80",
  },
  {
    id: 5,
    img: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80",
    imgAlt: "Golden Chicken Popcorn & Strips",
    dishTitle: "Chicken Popcorn",
    dishPrice: "₹80",
    userComment:
      "Great atmosphere for family dinners and unbeatable prices for crunchy snacks and rolls!",
    userAvatar:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=160&q=80",
  },
]

const HeroSection41Demo = () => {
  return (
    <HeroSection41
      brandName="Firey Treat"
      navigationData={FIREY_TREAT_HERO_NAV}
      menudata={FIREY_TREAT_HERO_MENU_DATA}
    />
  )
}

export default HeroSection41Demo
