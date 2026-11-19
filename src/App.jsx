import React, { useEffect, useMemo, useState } from "react";
import heroImage from "./flenzo-assets/hero/hero-img.jpeg"
import { supabase, supabaseConfigured } from "./lib/supabase.js";
import { resolveImageSrc } from "./lib/productImages.js";
/* =========================================================
   FLENZO CONTENT DATA
   Replace image URLs here with the client's real photos.
   Product cards use only images[0]. The rest appear in the
   product modal gallery when a product has more than one image.
   ========================================================= */
const fallbackProducts = [
  {
    id: 3,
    name: "Flenzo Black Tee",
    category: "T-Shirts",
    price: 1200,
    oldPrice: 1500,
    rating: 4.8,
    colors: ["White", "Black"],
    sizes: ["S", "M", "L", "XL"],
    images: [
      { src: "/flenzo/products/black-tee-front.jpeg", label: "Front" },
      { src: "/flenzo/products/black-tee-back.jpeg", label: "Back" }

      // { src: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85", label: "Front" },
      // { src: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=900&q=85", label: "Back" },
    ],
    tag: "-20%",
  },
  {
    id: 4,
    name: "Flenzo Surf Tee",
    category: "T-Shirts",
    price: 1200,
    oldPrice: 1500,
    rating: 4.7,
    colors: ["Black", "White"],
    sizes: ["S", "M", "L", "XL"],
    images: [
      { src: "/flenzo/products/surf-tee-front.jpeg", label: "Front" },
      { src: "/flenzo/products/surf-tee-back.jpeg", label: "Back" }


      // { src: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=900&q=85", label: "Front" },
    ],
    tag: "-20%",
  },
  {
    id: 5,
    name: "Flenzo White Tee",
    category: "T-Shirts",
    price: 1200,
    oldPrice: 1500,
    rating: 4.8,
    colors: ["Black", "White"],
    sizes: ["28", "30", "32", "34"],
    images: [
      { src: "/flenzo/products/white-tee-front.jpeg", label: "Front" },
      { src: "/flenzo/products/white-tee-back.jpeg", label: "Back" }
      // { src: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=85", label: "Front" },
      // { src: "https://images.unsplash.com/photo-1624378440070-33e6d3f1dbe0?auto=format&fit=crop&w=900&q=85", label: "Detail" },
    ],
    tag: "-20%",
  },

  {
    id: 6,
    name: "Flenzo Car Tee",
    category: "T-Shirts",
    price: 1200,
    oldPrice: 1500,
    rating: 4.8,
    colors: ["Black", "White"],
    sizes: ["28", "30", "32", "34"],
    images: [
      { src: "/flenzo/products/flenzo-girl.jpeg" },
      // { src: "/flenzo/products/white-tee-back.jpeg", label: "Back" }
      // { src: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=85", label: "Front" },
      // { src: "https://images.unsplash.com/photo-1624378440070-33e6d3f1dbe0?auto=format&fit=crop&w=900&q=85", label: "Detail" },
    ],
    tag: "-20%",
  },


  {
    id: 7,
    name: "Flenzo Nairobi Tee",
    category: "T-Shirts",
    price: 1200,
    oldPrice: 1500,
    rating: 4.8,
    colors: ["Black", "White"],
    sizes: ["28", "30", "32", "34"],
    images: [
      { src: "/flenzo/products/flenzo-nairobi.jpeg" },
      // { src: "/flenzo/products/white-tee-back.jpeg", label: "Back" }
      // { src: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=85", label: "Front" },
      // { src: "https://images.unsplash.com/photo-1624378440070-33e6d3f1dbe0?auto=format&fit=crop&w=900&q=85", label: "Detail" },
    ],
    tag: "-20%",
  },

  {
    id: 8,
    name: "Flenzo Brown Tee",
    category: "T-Shirts",
    price: 1200,
    oldPrice: 1500,
    rating: 4.8,
    colors: ["Brown"],
    sizes: ["28", "30", "32", "34"],
    images: [
      { src: "/flenzo/products/flenzo-brown.jpeg" },
      // { src: "/flenzo/products/white-tee-back.jpeg", label: "Back" }
      // { src: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=85", label: "Front" },
      // { src: "https://images.unsplash.com/photo-1624378440070-33e6d3f1dbe0?auto=format&fit=crop&w=900&q=85", label: "Detail" },
    ],
    tag: "-20%",
  },


  {
    id: 9,
    name: "Flenzo Culture Tee",
    category: "T-Shirts",
    price: 1200,
    oldPrice: 1500,
    rating: 4.8,
    colors: ["White", "Black"],
    sizes: ["28", "30", "32", "34"],
    images: [
      { src: "/flenzo/products/flenzo-culture.jpeg" },
      // { src: "/flenzo/products/white-tee-back.jpeg", label: "Back" }
      // { src: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=85", label: "Front" },
      // { src: "https://images.unsplash.com/photo-1624378440070-33e6d3f1dbe0?auto=format&fit=crop&w=900&q=85", label: "Detail" },
    ],
    tag: "-20%",
  },





  // {
  //   id: 6,
  //   name: "Flenzo 6-Panel Cap",
  //   category: "Accessories",
  //   price: 1200,
  //   oldPrice: 1500,
  //   rating: 4.6,
  //   colors: ["Black", "Cream"],
  //   sizes: ["One Size"],
  //   images: [
  //     { src: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=900&q=85", label: "Front" },
  //   ],
  //   tag: "-20%",
  // },
  // {
  //   id: 7,
  //   name: "Flenzo Skate Deck",
  //   category: "Skate",
  //   price: 4200,
  //   oldPrice: 4800,
  //   rating: 4.9,
  //   colors: ["Natural", "Black"],
  //   sizes: ["8.0", "8.25", "8.5"],
  //   images: [
  //     { src: "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=900&q=85", label: "Top" },
  //     { src: "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=900&q=85", label: "Detail" },
  //   ],
  //   tag: "-13%",
  // },
  // {
  //   id: 8,
  //   name: "Flenzo Skate Tee",
  //   category: "Skate",
  //   price: 2000,
  //   oldPrice: 2400,
  //   rating: 4.9,
  //   colors: ["Black", "White"],
  //   sizes: ["S", "M", "L", "XL"],
  //   images: [
  //     { src: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=85", label: "Front" },
  //     { src: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85", label: "Back" },
  //   ],
  //   tag: "-17%",
  // },
];

const fallbackCategories = ["All", "T-Shirts"];

// Replace these placeholder images with the client's actual South Coast photos.
// const cultureStories = [
//   {
//     id: "culture-1",
//     label: "THE CULTURE",
//     title: "ROOTED ON THE SOUTH COAST",
//     text: "A visual story of the people, places and outfits that shape Flenzo. Replace this copy with the client's own explanation of what each look represents.",
//     image: "flenzo/culture/south-coast-roots.jpeg"
//     // image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=85",
//   },
//   {
//     id: "culture-2",
//     label: "DIANI / KENYA",
//     title: "DRESSED IN PLACE",
//     text: "Clothing can carry a sense of place. Add the client's exact story here, including the meaning behind the outfit and the photograph.",
//     image: "flenzo/culture/dressed-in-place.jpeg"
//     // image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
//   },
//   {
//     id: "culture-3",
//     label: "MOVEMENT",
//     title: "MOVE WITH IT",
//     text: "Flenzo lives around movement, creativity and community. Replace this placeholder with the client's own words.",
//     image: "flenzo/culture/movement.jpeg"
//     // image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=85",
//   },
// ];

// // Replace these images with the client's actual activity photographs.
// const communityStories = [
//   {
//     id: "skate-ocean",
//     label: "SKATE 4 THE OCEAN",
//     title: "MOVE TOGETHER.",
//     text: "A community story connecting skateboarding, people and movement with awareness and connection to the ocean. Add the client's exact story, dates and details here later.",
//     image: "/flenzo/community/skateForTheOcean.jpeg"
//     // image: "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=1200&q=85",
//   },
//   {
//     id: "altinha",
//     label: "CUP OF ALTINHA",
//     title: "PLAY. PASS. CONNECT.",
//     text: "Altinha is a social beach activity built around keeping a ball in the air through controlled passes and movement. This space can tell the story of Flenzo's own Cup of Altinha activity without adding unverified event claims.",
//     image: "flenzo/community/cup-of-Altinha.jpeg"
//     // image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=85",
//   },
//   {
//     id: "beach-cleanups",
//     label: "COMMUNITY BEACH CLEANUPS",
//     title: "OUR COAST, OUR RESPONSIBILITY.",
//     text: "Plastic waste can collect along beaches. Community cleanups bring people together to remove plastic waste and care for the coastline. Add the client's own cleanup stories and verified numbers later.",
//     image: "flenzo/community/beach-cleanup.jpeg"
//     // image: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=1200&q=85",
//   },
//   {
//     id: "coastal-heritage",
//     label: "KENYA SOUTH COASTAL HERITAGE",
//     title: "OUR COAST, OUR RESPONSIBILITY.",
//     text: "Plastic waste can collect along beaches. Community cleanups bring people together to remove plastic waste and care for the coastline. Add the client's own cleanup stories and verified numbers later.",
//     image: "flenzo/community/beach-cleanup.jpeg"
//   },

// ];


const cultureStories = [
  {
    id: "culture-1",
    label: "THE CULTURE",
    title: "ROOTED ON THE SOUTH COAST",
    text: "Born around the energy of Kenya's South Coast, Flenzo Culture is about more than what you wear. It is the rhythm of the coast, the streets, the ocean and the people who give this place its character.",
    image: "/flenzo/culture/south-coast-roots.jpeg"
  },
  {
    id: "culture-2",
    label: "DIANI / KENYA",
    title: "DRESSED IN PLACE",
    text: "From beach days to city streets, Flenzo brings South Coast energy into everyday life. Easy pieces, bold character and a sense of place made for people who move their own way.",
    image: "/flenzo/culture/dressed-in-place.jpeg"
  },
  {
    id: "culture-3",
    label: "MOVEMENT",
    title: "MOVE WITH IT",
    text: "Flenzo belongs wherever people gather, move and create. Skate, play, explore, meet someone new and keep moving. The culture is not something you watch from the outside. You become part of it.",
    image: "/flenzo/culture/movement.jpeg"
  },
];

const communityStories = [
  {
    id: "skate-ocean",
    label: "SKATE 4 THE OCEAN",
    title: "MOVE TOGETHER.",
    text: "Skateboarding has always been about movement and expression. Skate 4 the Ocean brings that spirit to the coast, creating a space where people can ride, connect and celebrate the place around them.",
    image: "/flenzo/community/skateForTheOcean.jpeg"
  },
  {
    id: "altinha",
    label: "CUP OF ALTINHA",
    title: "PLAY. PASS. CONNECT.",
    text: "On the beach, a simple game can turn strangers into a circle of friends. Cup of Altinha is about rhythm, movement and connection, with the Indian Ocean as the backdrop.",
    image: "/flenzo/community/cup-of-Altinha.jpeg"
  },
  {
    id: "beach-cleanups",
    label: "COMMUNITY BEACH CLEANUPS",
    title: "OUR COAST. OUR HOME.",
    text: "The coast gives the community a place to meet, play and create. Giving something back starts with showing up, getting involved and taking care of the spaces we share.",
    image: "/flenzo/community/beach-cleanup.jpeg"
  },
  {
    id: "coastal-heritage",
    label: "KENYA SOUTH COASTAL HERITAGE",
    title: "A PLACE WITH A STORY.",
    text: "The South Coast carries generations of stories, movement and culture. Flenzo is part of that living landscape, inspired by the people, energy and character that make this coast what it is.",
    image: "/flenzo/community/coastal-heritage.jpeg"
  },
];


// Ocean image placeholder. Replace with a real Flenzo ocean photograph later.
const oceanImage = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=88";
// const heroImage = "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=88";
// const oceanImage = "/flenzo/impact/impact-img.jpeg";


const WHATSAPP_NUMBER = "254743405833";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

function Icon({ name, size = 22 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  const paths = {
    menu: <><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></>,
    bag: <><path d="M6 8h12l1 12H5L6 8Z" /><path d="M9 8a3 3 0 0 1 6 0" /></>,
    heart: <path d="M20.8 8.8c0 5-8.8 10-8.8 10S3.2 13.8 3.2 8.8A4.8 4.8 0 0 1 12 6.2a4.8 4.8 0 0 1 8.8 2.6Z" />,
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 5 5" /></>,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 21c.8-3.8 3.1-5.8 7-5.8s6.2 2 7 5.8" /></>,
    x: <><line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" /></>,
    arrow: <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
    minus: <line x1="5" y1="12" x2="19" y2="12" />,
  };

  return <svg {...common}>{paths[name]}</svg>;
}

const IMAGE_PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><rect width="400" height="500" fill="#f4f4f2"/><text x="200" y="255" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" letter-spacing="3" fill="#9a9a94">IMAGE UNAVAILABLE</text></svg>'
)}`;

// Shows a neutral placeholder instead of a broken-image icon when a photo is
// missing or fails to load. Keeps the same size, so the layout never shifts.
function SafeImage({ src, alt, ...rest }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const failed = !src || failedSrc === src;
  return <img {...rest} src={failed ? IMAGE_PLACEHOLDER : src} alt={alt} onError={() => setFailedSrc(src)} />;
}

function readStoredList(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredList(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage blocked or full: the cart and wishlist keep working for this visit.
  }
}

function sanitizeWishlist(items) {
  return items.filter((id) => typeof id === "string" || typeof id === "number");
}

function sanitizeCart(items) {
  return items.filter((item) =>
    item && typeof item === "object" &&
    (typeof item.id === "string" || typeof item.id === "number") &&
    typeof item.name === "string" &&
    Number.isFinite(item.price) && item.price >= 0 &&
    Number.isInteger(item.qty) && item.qty >= 1 &&
    typeof item.size === "string" &&
    typeof item.color === "string" &&
    typeof item.image === "string"
  );
}

/* Editable site content (stories and homepage text).
   The admin saves these to Supabase. Every value falls back to the built-in
   copy below when the database value is missing, empty or invalid, so the
   site looks exactly as designed until content is actually edited. */
function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function pickText(value, fallback) {
  return cleanText(value) || fallback;
}

function pickList(value, fallback) {
  const items = Array.isArray(value) ? value.map(cleanText).filter(Boolean) : [];
  return items.length ? items : fallback;
}

function pickItems(value, fields, fallback) {
  const items = Array.isArray(value)
    ? value
        .filter((item) => item && typeof item === "object")
        .map((item) => Object.fromEntries(fields.map((field) => [field, cleanText(item[field])])))
        .filter((item) => fields.some((field) => item[field]))
    : [];
  return items.length ? items : fallback;
}

function resolveHomeContent(rows) {
  const section = (key) => {
    const content = rows?.[key];
    return content && typeof content === "object" && !Array.isArray(content) ? content : {};
  };
  const hero = section("hero");
  const culture = section("culture");
  const community = section("community");
  const impact = section("impact");
  const cta = culture.cta && typeof culture.cta === "object" ? culture.cta : {};

  return {
    hero: {
      location: pickText(hero.location, "DIANI • SOUTH COAST"),
      titleLines: pickList(hero.titleLines, ["WEAR THE"]),
      titleHighlight: pickText(hero.titleHighlight, "CULTURE."),
      buttonLabel: pickText(hero.buttonLabel, "SHOP THE DROP"),
    },
    culture: {
      sectionHeading: pickText(culture.sectionHeading, "THE CULTURE"),
      eyebrow: pickText(culture.eyebrow, "FLENZO / SOUTH COAST / KENYA"),
      titleLines: pickList(culture.titleLines, ["WHAT YOU WEAR", "CAN CONNECT YOU"]),
      titleHighlight: pickText(culture.titleHighlight, "TO WHERE YOU LIVE."),
      paragraphs: pickList(culture.paragraphs, [
        "Flenzo was born on Kenya's South Coast, surrounded by movement, creativity, community and the Indian Ocean.",
        "We make clothing inspired by that energy, bringing a piece of the coast into everyday life. From the streets of Diani to the beach and beyond, every piece is part of a culture shaped by people, place and movement.",
      ]),
      values: pickItems(culture.values, ["label", "text"], [
        { label: "01 / PEOPLE", text: "The community that gives the coast its energy." },
        { label: "02 / MOVEMENT", text: "Skate. Play. Explore. Keep moving." },
        { label: "03 / COAST", text: "The ocean and places that inspire us." },
      ]),
      cta: {
        title: pickText(cta.title, "WEAR THE PLACE. LIVE THE CULTURE."),
        text: pickText(cta.text, "Every Flenzo purchase helps support community activities, creative spaces and coastal initiatives that keep the culture moving."),
        buttonLabel: pickText(cta.buttonLabel, "EXPLORE THE COMMUNITY"),
      },
    },
    community: {
      sectionHeading: pickText(community.sectionHeading, "COMMUNITY"),
      eyebrow: pickText(community.eyebrow, "PEOPLE • PLAY • COAST"),
      titleLines: pickList(community.titleLines, ["THE CULTURE"]),
      titleHighlight: pickText(community.titleHighlight, "IS SHARED."),
      text: pickText(community.text, "Flenzo is built around more than clothing. It is about the people, movement and spaces that make the South Coast feel alive. From the beach to the streets, these are the moments and communities that inspire the culture."),
      cardButtonLabel: pickText(community.cardButtonLabel, "SEE THE CONNECTION"),
    },
    impact: {
      eyebrow: pickText(impact.eyebrow, "FLENZO IMPACT / SOUTH COAST"),
      titleLines: pickList(impact.titleLines, ["WEAR SOMETHING"]),
      titleHighlight: pickText(impact.titleHighlight, "THAT MEANS MORE."),
      paragraphs: pickList(impact.paragraphs, [
        "A Flenzo piece is more than something you put on. It carries the energy of the coast, the people around it, and the moments that bring us together.",
        "When you choose Flenzo, you become part of that story. Your support helps us keep creating moments for people to move, play, connect and give back to the places we call home.",
      ]),
      lines: pickItems(impact.lines, ["number", "word", "text"], [
        { number: "01", word: "MOVE.", text: "Skate. Play. Explore." },
        { number: "02", word: "CONNECT.", text: "People. Community. Culture." },
        { number: "03", word: "GIVE BACK.", text: "Our coast. Our home." },
      ]),
      note: pickText(impact.note, "The culture is alive because people show up for it."),
      noteBold: pickText(impact.noteBold, "Thank you for being part of it."),
    },
  };
}

// Published stories of one type from the database, in the shape the cards use.
function mapStoryRows(rows, type) {
  if (!Array.isArray(rows)) return [];
  return rows
    .filter((row) => row && String(row.type).toLowerCase() === type && cleanText(row.title))
    .map((row) => ({
      id: String(row.id),
      label: cleanText(row.label),
      title: cleanText(row.title),
      text: typeof row.text === "string" ? row.text : "",
      image: resolveImageSrc(row.image_url),
    }));
}

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [loadState, setLoadState] = useState(supabaseConfigured ? "loading" : "unavailable");
  const [category, setCategory] = useState("All");
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [wishlist, setWishlist] = useState(() => sanitizeWishlist(readStoredList("flenzo-wishlist")));
  const [cart, setCart] = useState(() => sanitizeCart(readStoredList("flenzo-cart")));
  const [cartNotice, setCartNotice] = useState("");
  // Stories: "loading" shows nothing yet, "ready" shows exactly what Supabase returned
  // (even if that is nothing), "fallback" (request failed or Supabase unavailable) shows built-in stories.
  const [storyRows, setStoryRows] = useState([]);
  const [storyState, setStoryState] = useState(supabaseConfigured ? "loading" : "fallback");
  const [homeRows, setHomeRows] = useState({});
  const [selected, setSelected] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Newsletter subscription state.
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [newsletterStatus, setNewsletterStatus] = useState("");
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);

  useEffect(() => {
    if (!supabaseConfigured) return undefined;

    let cancelled = false;

    async function loadPublicProducts() {
      const [productResult, categoryResult] = await Promise.all([
        supabase.from("products").select("*").eq("active", true).order("created_at", { ascending: false }),
        supabase.from("categories").select("id, name, active").eq("active", true).order("sort_order"),
      ]);

      if (cancelled) return;

      if (productResult.error || categoryResult.error) {
        console.error("Could not load shop data:", productResult.error || categoryResult.error);
        setLoadState("error");
        return;
      }

      const categoryNames = new Map(
        (categoryResult.data || []).map(item => [item.id, item.name])
      );

      const publishedProducts = (productResult.data || []).map(item => {
        const gallery = Array.isArray(item.images) ? item.images : [];
        const images = gallery.map(entry => {
          const src = resolveImageSrc(typeof entry === "string" ? entry : entry?.src);
          return src ? {
            src,
            label: typeof entry === "object" && entry?.label
              ? String(entry.label) : "Product photo"
          } : null;
        }).filter(Boolean);

        if (!images.length) {
          const fallbackSrc = resolveImageSrc(item.image_url);
          if (fallbackSrc) images.push({ src: fallbackSrc, label: "Product photo" });
        }

        if (!images.length) {
          images.push({ src: IMAGE_PLACEHOLDER, label: "Product photo" });
        }

        const price = Number(item.price) || 0;
        const oldPrice = item.old_price == null ? null : Number(item.old_price);

        return {
          id: item.id,
          name: item.name || "Unnamed product",
          category: categoryNames.get(item.category_id) || "Uncategorised",
          price,
          oldPrice,
          rating: null,
          legacyId: item.legacy_id ?? null,
          colors: Array.isArray(item.colors) && item.colors.length ? item.colors : ["Default"],
          sizes: Array.isArray(item.sizes) && item.sizes.length ? item.sizes : ["One Size"],
          images,
          tag: oldPrice && oldPrice > price
            ? `-${Math.round((oldPrice - price) / oldPrice * 100)}%`
            : ""
        };
      });

      setProducts(publishedProducts);

      const names = [...new Set([
        ...(categoryResult.data || []).map(item => item.name),
        ...publishedProducts.map(item => item.category)
      ].filter(Boolean))];

      setCategories(["All", ...names]);
      setLoadState("ready");
    }

    loadPublicProducts().catch(error => {
      console.error("Could not load public products:", error);
      if (!cancelled) setLoadState("error");
    });

    return () => { cancelled = true; };
  }, []);

  // Stories and homepage text. Independent of the shop: if this fails, the
  // built-in copy stays in place and the shop is unaffected.
  useEffect(() => {
    if (!supabaseConfigured) return undefined;

    let cancelled = false;

    async function loadSiteContent() {
      const [storyResult, homepageResult] = await Promise.all([
        supabase
          .from("stories")
          .select("id, type, title, label, text, image_url, sort_order")
          .eq("published", true)
          .order("sort_order", { ascending: true }),
        supabase.from("homepage_sections").select("section_key, content"),
      ]);

      if (cancelled) return;

      if (storyResult.error) {
        console.error("Could not load stories:", storyResult.error);
        setStoryState("fallback");
      } else {
        setStoryRows(storyResult.data || []);
        setStoryState("ready");
      }

      if (homepageResult.error) {
        console.error("Could not load homepage content:", homepageResult.error);
      } else {
        setHomeRows(Object.fromEntries((homepageResult.data || []).map((row) => [row.section_key, row.content])));
      }
    }

    loadSiteContent().catch((error) => {
      console.error("Could not load site content:", error);
      if (!cancelled) setStoryState("fallback");
    });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => { writeStoredList("flenzo-wishlist", wishlist); }, [wishlist]);
  useEffect(() => { writeStoredList("flenzo-cart", cart); }, [cart]);

  // Once the live catalogue has loaded, bring saved carts and wishlists in line with it:
  // old hardcoded ids are mapped through legacy_id, prices and names are refreshed, and
  // items that are no longer available are removed. Nothing is changed if loading failed.
  useEffect(() => {
    if (loadState !== "ready") return;

    const byId = new Map(products.map((product) => [String(product.id), product]));
    const byLegacyId = new Map(
      products.filter((product) => product.legacyId != null).map((product) => [String(product.legacyId), product])
    );
    const findProduct = (id) => byId.get(String(id)) || byLegacyId.get(String(id)) || null;

    const nextCart = [];
    let removed = 0;

    for (const item of cart) {
      const product = findProduct(item.id);
      if (!product || !product.sizes.includes(item.size) || !product.colors.includes(item.color)) {
        removed += 1;
        continue;
      }
      nextCart.push({ ...item, id: product.id, name: product.name, price: product.price, image: product.images[0].src });
    }

    if (JSON.stringify(nextCart) !== JSON.stringify(cart)) setCart(nextCart);
    if (removed > 0) setCartNotice("Some items in your cart are no longer available and were removed.");

    const nextWishlist = [...new Set(wishlist.map(findProduct).filter(Boolean).map((product) => product.id))];
    if (JSON.stringify(nextWishlist) !== JSON.stringify(wishlist)) setWishlist(nextWishlist);
  }, [loadState, products]);

  const filtered = useMemo(() => {
    return products.filter((product) =>
      (category === "All" || product.category === category) &&
      product.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [products, category, query]);

  const home = resolveHomeContent(homeRows);
  const shownCultureStories =
    storyState === "fallback" ? cultureStories : storyState === "ready" ? mapStoryRows(storyRows, "culture") : [];
  const shownCommunityStories =
    storyState === "fallback" ? communityStories : storyState === "ready" ? mapStoryRows(storyRows, "community") : [];
  const storiesEmpty = storyState === "ready";

  const shopNotice =
    loadState === "unavailable" ? { title: "Store temporarily unavailable.", text: "Please try again shortly." } :
    loadState === "error" ? { title: "We couldn't load the shop right now.", text: "Please check your connection and try again shortly." } :
    loadState === "loading" ? { title: "Loading products...", text: "" } :
    products.length === 0 ? { title: "No products available right now.", text: "New pieces are on the way. Please check back soon." } :
    null;

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  function toggleWishlist(id) {
    setWishlist((items) => items.includes(id) ? items.filter((x) => x !== id) : [...items, id]);
  }

  function addToCart(product, size = product.sizes[0], color = product.colors[0], quantity = 1) {
    setCart((items) => {
      const existing = items.find((item) => item.id === product.id && item.size === size && item.color === color);
      if (existing) {
        return items.map((item) => item === existing ? { ...item, qty: item.qty + quantity } : item);
      }

      return [
        ...items,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images[0].src,
          size,
          color,
          qty: quantity,
        },
      ];
    });

    setSelected(null);
    setCartOpen(true);
  }

  function updateQty(index, delta) {
    setCart((items) => items.map((item, i) =>
      i !== index ? item : { ...item, qty: Math.max(1, item.qty + delta) }
    ));
  }

  function removeCartItem(index) {
    setCart((items) => items.filter((_, i) => i !== index));
  }

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  }

  function scrollToShop() {
    scrollTo("shop");
  }

  function selectCategory(value) {
    setCategory(value);
    scrollToShop();
  }

  function buildWhatsAppMessage(customerName = "", customerPhone = "") {
    const lines = [
      "Hi Flenzo Culture 👋",
      "",
      "I'd like to place an order:",
      ...cart.map((item) =>
        `• ${item.name} x${item.qty} | Size: ${item.size} | Color: ${item.color} | KSH ${(item.price * item.qty).toLocaleString()}`
      ),
      "",
      `Subtotal: KSH ${cartTotal.toLocaleString()}`,
      customerName ? `Name: ${customerName}` : "",
      customerPhone ? `Phone: ${customerPhone}` : "",
      "",
      "Please confirm availability and delivery details. Thank you!",
    ].filter(Boolean);

    return lines.join("\n");
  }

  function openWhatsAppOrder(customerName = "", customerPhone = "") {
    const message = encodeURIComponent(buildWhatsAppMessage(customerName, customerPhone));
    window.open(`${WHATSAPP_URL}?text=${message}`, "_blank", "noopener,noreferrer");
  }

  async function handleNewsletterSubscribe(event) {
    event.preventDefault();

    const email = newsletterEmail.trim().toLowerCase();

    if (!email) {
      setNewsletterStatus("Please enter your email address.");
      return;
    }

    if (!newsletterConsent) {
      setNewsletterStatus("Please agree to receive Flenzo updates.");
      return;
    }

    if (!supabaseConfigured) {
      setNewsletterStatus("Subscriptions are temporarily unavailable. Please try again later.");
      return;
    }

    setNewsletterSubmitting(true);
    setNewsletterStatus("");

    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert([{ email, consent: true }]);

      if (error) {
        if (error.code === "23505") {
          setNewsletterStatus("You're already on the Flenzo list.");
        } else {
          console.error("Newsletter subscription failed:", error);
          setNewsletterStatus("We couldn't subscribe you right now. Please try again.");
        }
      } else {
        setNewsletterStatus("You're in! Watch your inbox for Flenzo updates.");
        setNewsletterEmail("");
        setNewsletterConsent(false);
      }
    } catch (error) {
      console.error("Newsletter subscription failed:", error);
      setNewsletterStatus("We couldn't subscribe you right now. Please try again.");
    } finally {
      setNewsletterSubmitting(false);
    }
  }

  return (
    <div className="app">
      <div className="announcement">FREE DELIVERY ON ORDERS OVER KSH 5,000 • DIANI / KENYA</div>

      <header className="header">
        <button className="icon-btn menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Icon name="menu" /></button>
        <button className="brand" onClick={() => { setCategory("All"); scrollTo("home"); }} aria-label="Flenzo Culture home">
          flen<span>z</span>o <b>culture</b>
        </button>
        <div className="header-actions">
          <button className="icon-btn desktop-only" onClick={() => setSearchOpen((value) => !value)} aria-label="Search"><Icon name="search" /></button>
          <button className="icon-btn" onClick={() => setCartOpen(true)} aria-label="Open cart">
            <Icon name="bag" /><span className="count">{cartCount}</span>
          </button>
        </div>
      </header>

      {searchOpen && (
        <div className="search-bar">
          <Icon name="search" size={19} />
          <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Flenzo Culture..." />
          <button onClick={() => { setQuery(""); setSearchOpen(false); }} aria-label="Close search"><Icon name="x" size={18} /></button>
        </div>
      )}

      {menuOpen && (
        <div className="overlay" onClick={() => setMenuOpen(false)}>
          <aside className="side-menu" onClick={(event) => event.stopPropagation()}>
            <div className="side-top">
              <strong>FLENZO CULTURE</strong>
              <button className="icon-btn" onClick={() => setMenuOpen(false)} aria-label="Close menu"><Icon name="x" /></button>
            </div>
            <nav>
              <button onClick={scrollToShop}>SHOP</button>
              <button onClick={() => scrollTo("culture")}>THE CULTURE</button>
              <button onClick={() => scrollTo("community")}>COMMUNITY</button>
              <button onClick={() => scrollTo("impact")}>IMPACT</button>
              <button onClick={() => { setMenuOpen(false); setAccountOpen(true); }}>MY ACCOUNT</button>
            </nav>
            <div className="menu-skate">
              <small>DIANI • SOUTH COAST</small>
              <h3>MOVE WITH THE CULTURE.</h3>
              <p>Streetwear, skateboarding, community and a connection to the coast.</p>
            </div>
          </aside>
        </div>
      )}

      <main>
        <section className="hero" id="home">
          <div className="hero-image" style={{ backgroundImage: `linear-gradient(90deg,rgba(0,0,0,.28),rgba(0,0,0,0) 70%),url('${heroImage}')` }}></div>
          <div className="hero-copy">
            <p>{home.hero.location}</p>
            <h1>{home.hero.titleLines.map((line, index) => <React.Fragment key={index}>{line}<br /></React.Fragment>)}<em>{home.hero.titleHighlight}</em></h1>
            <button className="dark-btn" onClick={scrollToShop}>{home.hero.buttonLabel} <Icon name="arrow" size={17} /></button>
          </div>
        </section>

        {loadState === "ready" && products.length > 0 && (
          <section className="category-strip">
            {categories.map((value) => (
              <button key={value} className={category === value ? "active" : ""} onClick={() => selectCategory(value)}>{value}</button>
            ))}
          </section>
        )}

        <section className="section" id="shop">
          <div className="section-heading">
            <span></span><h2>{category === "All" ? "Flenzo Culture" : category}</h2><span></span>
          </div>

          {shopNotice && (
            <div className="empty store-unavailable" role="status">
              <h3>{shopNotice.title}</h3>
              {shopNotice.text && <p>{shopNotice.text}</p>}
            </div>
          )}

          <div className="product-grid">
            {filtered.map((product) => (
              <article className="product-card" key={product.id}>
                <div
                  className={`product-image-wrap product-${product.id}`}
                  onClick={() => setSelected(product)}
                >
                  <SafeImage src={product.images[0].src} alt={`${product.name} ${product.images[0].label}`} />
                  {product.tag && <span className="sale">{product.tag}</span>}
                  <button
                    className={`wish ${wishlist.includes(product.id) ? "liked" : ""}`}
                    onClick={(event) => { event.stopPropagation(); toggleWishlist(product.id); }}
                    aria-label="Toggle wishlist"
                  >
                    <Icon name="heart" size={21} />
                  </button>
                </div>
                <div className="product-info">
                  <div className="brand-line"><span>Flenzo Culture</span>{product.rating != null && <span className="rating">{product.rating} <b>★</b></span>}</div>
                  <h3 onClick={() => setSelected(product)}>{product.name}</h3>
                  <div className="price">{product.oldPrice != null && <del>KSH {product.oldPrice.toLocaleString()}</del>}<strong>KSH {product.price.toLocaleString()}</strong></div>
                  <button className="select-btn" onClick={() => setSelected(product)}>SELECT OPTIONS <Icon name="arrow" size={15} /></button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="culture-section section" id="culture">
          <div className="section-heading">
            <span></span><h2>{home.culture.sectionHeading}</h2><span></span>
          </div>
          <div className="culture-intro">
            <p className="eyebrow">{home.culture.eyebrow}</p>

            <h2>
              {home.culture.titleLines.map((line, index) => <React.Fragment key={index}>{line}<br /></React.Fragment>)}
              <em>{home.culture.titleHighlight}</em>
            </h2>

            {home.culture.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}

            <div className="culture-values">
              {home.culture.values.map((item, index) => (
                <div key={index}>
                  <span className="eyebrow">{item.label}</span>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>

            <div className="culture-cta">
              <div>
                <strong>{home.culture.cta.title}</strong>

                <p className="culture-support">{home.culture.cta.text}</p>
              </div>

              <button className="text-btn" onClick={() => scrollTo("community")}>
                {home.culture.cta.buttonLabel} <Icon name="arrow" size={15} />
              </button>
            </div>
            {storiesEmpty && shownCultureStories.length === 0 && (
              <div className="empty story-empty" role="status">
                <h3>Stories coming soon.</h3>
                <p>Check back shortly.</p>
              </div>
            )}

            {shownCultureStories.length > 0 && (
            <div className="culture-grid">
              {shownCultureStories.map((story, index) => (
                <article className={`culture-card culture-card-${index + 1}`} key={story.id}>
                  <div className={`culture-image ${story.id}`}><SafeImage src={story.image} alt={story.title} /></div>
                  <div className="culture-card-copy">
                    <p className="eyebrow">{story.label}</p>
                    <h3>{story.title}</h3>
                    <p>{story.text}</p>
                  </div>
                </article>
              ))}
            </div>
            )}
          </div>
        </section>

        <section className="community-section section" id="community">
          <div className="section-heading">
            <span></span><h2>{home.community.sectionHeading}</h2><span></span>
          </div>
          <div className="community-intro">
            <p className="eyebrow">{home.community.eyebrow}</p>
            <h2>{home.community.titleLines.map((line, index) => <React.Fragment key={index}>{line}<br /></React.Fragment>)}<em>{home.community.titleHighlight}</em></h2>
            <p>{home.community.text}</p>
          </div>
          {storiesEmpty && shownCommunityStories.length === 0 && (
            <div className="empty story-empty" role="status">
              <h3>Stories coming soon.</h3>
              <p>Check back shortly.</p>
            </div>
          )}

          {shownCommunityStories.length > 0 && (
          <div className="community-grid">
            {shownCommunityStories.map((story, index) => (
              <article className={`community-card community-card-${index + 1}`} key={story.id}>
                <div className={`community-image ${story.id}`}><SafeImage src={story.image} alt={story.title} /></div>
                <div className="community-copy">
                  <p className="eyebrow">{story.label}</p>
                  <h3>{story.title}</h3>
                  <p>{story.text}</p>
                  <button className="text-btn" onClick={() => scrollTo("impact")}>{home.community.cardButtonLabel} <Icon name="arrow" size={15} /></button>
                </div>
              </article>
            ))}
          </div>
          )}
        </section>

        <section className="impact-section" id="impact">
          <div className="impact-image" style={{ backgroundImage: `url('${oceanImage}')` }}></div>
          <div className="impact-overlay"></div>
          <div className="impact-copy">
            <p className="eyebrow">{home.impact.eyebrow}</p>

            <h2>
              {home.impact.titleLines.map((line, index) => <React.Fragment key={index}>{line}<br /></React.Fragment>)}
              <em>{home.impact.titleHighlight}</em>
            </h2>

            {home.impact.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}

            {home.impact.lines.map((item, index) => (
              <div className="impact-line" key={index}>
                <span>{item.number}</span>
                <strong>{item.word}</strong>
                <span>{item.text}</span>
              </div>
            ))}

            <p className="impact-note">
              {home.impact.note}
              <br />
              <strong>{home.impact.noteBold}</strong>
            </p>
          </div>

        </section>

        <section className="newsletter">
          <p className="eyebrow">JOIN THE CULTURE</p>
          <h2>First access to new drops.</h2>

          <form className="newsletter-form" onSubmit={handleNewsletterSubscribe}>
            <input
              type="email"
              placeholder="Your email address"
              aria-label="Email address"
              autoComplete="email"
              maxLength={254}
              required
              value={newsletterEmail}
              onChange={(event) => {
                setNewsletterEmail(event.target.value);
                if (newsletterStatus) setNewsletterStatus("");
              }}
            />
            <button type="submit" disabled={newsletterSubmitting}>
              {newsletterSubmitting ? "JOINING..." : "JOIN"}
            </button>
          </form>

          <label className="newsletter-consent">
            <input
              type="checkbox"
              checked={newsletterConsent}
              onChange={(event) => {
                setNewsletterConsent(event.target.checked);
                if (newsletterStatus) setNewsletterStatus("");
              }}
              required
            />
            <span>I agree to receive Flenzo news, new drops and event updates by email.</span>
          </label>

          <p className="newsletter-status" role="status" aria-live="polite">
            {newsletterStatus}
          </p>

          <small>No spam. Just drops, events and Flenzo news.</small>
        </section>
      </main>

      <footer>
        <div className="footer-brand">flen<span>z</span>o <b>culture</b></div>
        <div className="footer-location">DIANI • KENYA'S SOUTH COAST</div>
        <div className="footer-links">
          <a href="#shop">Shop</a>
          <a href="#culture">The Culture</a>
          <a href="#community">Community</a>
          <a href="#impact">Impact</a>
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">WhatsApp</a>
          <a href="/admin">Admin Login</a>
        </div>
        <p>© 2026 Flenzo Culture. Built for the culture.</p>
      </footer>

      <a className="whatsapp" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
        <span className="wa-icon">◉</span> CLICK TO WHATSAPP
      </a>

      <nav className="mobile-nav">
        <button onClick={scrollToShop}><Icon name="bag" /><span>Shop</span></button>
        <button onClick={() => { setCategory("All"); scrollTo("shop"); }}><Icon name="heart" /><span>Wishlist</span></button>
        <button onClick={() => setCartOpen(true)}><Icon name="bag" /><span>Cart</span>{cartCount > 0 && <b>{cartCount}</b>}</button>
        <button onClick={() => setAccountOpen(true)}><Icon name="user" /><span>My account</span></button>
      </nav>

      {selected && <ProductModal product={selected} onClose={() => setSelected(null)} onAdd={addToCart} />}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          total={cartTotal}
          notice={cartNotice}
          onClose={() => { setCartOpen(false); setCartNotice(""); }}
          onQty={updateQty}
          onRemove={removeCartItem}
          onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
        />
      )}
      {checkoutOpen && (
        <CheckoutModal
          cart={cart}
          total={cartTotal}
          onClose={() => setCheckoutOpen(false)}
          onWhatsApp={openWhatsAppOrder}
        />
      )}
      {accountOpen && (
        <div className="overlay" onClick={() => setAccountOpen(false)}>
          <div className="account-modal" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setAccountOpen(false)} aria-label="Close account"><Icon name="x" /></button>
            <Icon name="user" size={34} />
            <h2>My Account</h2>
            <p>Account login can be connected later. For this front-end version, your cart and wishlist are saved on this device.</p>
            <button className="dark-btn full" onClick={() => setAccountOpen(false)}>CONTINUE SHOPPING</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductModal({ product, onClose, onAdd }) {
  const [size, setSize] = useState(product.sizes[0]);
  const [color, setColor] = useState(product.colors[0]);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setSize(product.sizes[0]);
    setColor(product.colors[0]);
    setQty(1);
    setActiveImage(0);
  }, [product]);

  const currentImage = product.images[activeImage] || product.images[0];

  return (
    <div className="overlay" onClick={onClose}>
      <div className="product-modal" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close product"><Icon name="x" /></button>

        <div className="modal-gallery">
          <div className="modal-image">
            <SafeImage src={currentImage.src} alt={`${product.name} ${currentImage.label}`} />
          </div>
          {product.images.length > 1 && (
            <div className="image-thumbnails" aria-label="Product photos">
              {product.images.map((image, index) => (
                <button
                  key={`${image.src}-${index}`}
                  className={activeImage === index ? "active" : ""}
                  onClick={() => setActiveImage(index)}
                  aria-label={`View ${image.label} photo`}
                >
                  <SafeImage src={image.src} alt="" />
                  <span>{image.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="modal-details">
          <p className="eyebrow">FLENZO CULTURE</p>
          <h2>{product.name}</h2>
          {product.rating != null && <div className="modal-rating">{product.rating} ★</div>}
          <div className="modal-price">{product.oldPrice != null && <del>KSH {product.oldPrice.toLocaleString()}</del>} KSH {product.price.toLocaleString()}</div>

          <label>Color</label>
          <div className="choices">{product.colors.map((value) => <button className={color === value ? "chosen" : ""} key={value} onClick={() => setColor(value)}>{value}</button>)}</div>

          <label>Size</label>
          <div className="choices">{product.sizes.map((value) => <button className={size === value ? "chosen" : ""} key={value} onClick={() => setSize(value)}>{value}</button>)}</div>

          <div className="qty-row">
            <span>Quantity</span>
            <div>
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity"><Icon name="minus" size={16} /></button>
              <b>{qty}</b>
              <button onClick={() => setQty(qty + 1)} aria-label="Increase quantity"><Icon name="plus" size={16} /></button>
            </div>
          </div>

          <button className="dark-btn full" onClick={() => onAdd(product, size, color, qty)}>
            ADD TO CART • KSH {(product.price * qty).toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ cart, total, notice, onClose, onQty, onRemove, onCheckout }) {
  return (
    <div className="overlay" onClick={onClose}>
      <aside className="cart-drawer" onClick={(event) => event.stopPropagation()}>
        <div className="drawer-head"><h2>Your Cart</h2><button className="icon-btn" onClick={onClose} aria-label="Close cart"><Icon name="x" /></button></div>
        {notice && <div className="demo-notice" role="status">{notice}</div>}
        {cart.length === 0 ? (
          <div className="empty"><Icon name="bag" size={42} /><h3>Your cart is empty.</h3><p>Add something from the latest Flenzo drop.</p></div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item, index) => (
                <div className="cart-item" key={`${item.id}-${item.size}-${item.color}-${index}`}>
                  <SafeImage src={item.image} alt={item.name} />
                  <div className="cart-meta">
                    <h4>{item.name}</h4>
                    <small>{item.color} / {item.size}</small>
                    <strong>KSH {item.price.toLocaleString()}</strong>
                    <div className="qty-row">
                      <div>
                        <button onClick={() => onQty(index, -1)} aria-label="Decrease quantity"><Icon name="minus" size={14} /></button>
                        <b>{item.qty}</b>
                        <button onClick={() => onQty(index, 1)} aria-label="Increase quantity"><Icon name="plus" size={14} /></button>
                      </div>
                      <button className="remove" onClick={() => onRemove(index)}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="checkout">
              <div><span>Subtotal</span><strong>KSH {total.toLocaleString()}</strong></div>
              <small>Checkout collects your details and lets you continue to WhatsApp. Real M-Pesa payment must be connected through a secure backend.</small>
              <button className="dark-btn full" onClick={onCheckout}>CHECKOUT</button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function CheckoutModal({ cart, total, onClose, onWhatsApp }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState("whatsapp");
  const [demoMessage, setDemoMessage] = useState("");

  function submit(event) {
    event.preventDefault();

    if (method === "whatsapp") {
      onWhatsApp(name, phone);
      return;
    }

    setDemoMessage("M-Pesa is prepared as a checkout option, but no real payment was made. A secure backend/Daraja integration must be connected before accepting live payments.");
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="checkout-modal" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close checkout"><Icon name="x" /></button>
        <div className="checkout-head">
          <p className="eyebrow">FLENZO CHECKOUT</p>
          <h2>READY TO ORDER?</h2>
          <p>Enter your details, then continue through WhatsApp. M-Pesa below is a frontend DEMO until a secure payment backend is connected.</p>
        </div>

        <div className="checkout-summary">
          {cart.map((item, index) => (
            <div key={`${item.id}-${index}`}><span>{item.name} × {item.qty}</span><strong>KSH {(item.price * item.qty).toLocaleString()}</strong></div>
          ))}
          <div className="summary-total"><span>Subtotal</span><strong>KSH {total.toLocaleString()}</strong></div>
        </div>

        <form onSubmit={submit}>
          <label>Name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" required /></label>
          <label>Phone number<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="07xx xxx xxx" inputMode="tel" required /></label>

          <label>Order method</label>
          <div className="payment-choices">
            <button type="button" className={method === "whatsapp" ? "chosen" : ""} onClick={() => setMethod("whatsapp")}>WhatsApp Order</button>
            <button type="button" className={method === "mpesa" ? "chosen" : ""} onClick={() => { setMethod("mpesa"); setDemoMessage(""); }}>M-Pesa <span>DEMO</span></button>
          </div>

          {method === "mpesa" && <div className="demo-notice">DEMO ONLY • No payment is processed here. Live M-Pesa requires a secure backend and payment callback.</div>}
          {demoMessage && <div className="demo-notice">{demoMessage}</div>}

          <button className="dark-btn full" type="submit">
            {method === "whatsapp" ? "CONTINUE TO WHATSAPP" : "M-PESA PAYMENT • DEMO"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
