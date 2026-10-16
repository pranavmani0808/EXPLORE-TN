import React, { useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronRight,
  ChevronLeft,
  MapPin,
  Sparkles,
  Mountain,
  Landmark,
  Waves,
  Palmtree,
  Trees,
  Footprints,
  Church,
  Sun,
  Compass,
} from "lucide-react";
import { FaCloud } from "react-icons/fa";
import { BsBookmarkStarFill } from "react-icons/bs";
import { VscSparkleFilled } from "react-icons/vsc";
import { SafeImage } from "@/components/ui/safe-image";
import { MinimalCarousel, type CarouselCard } from "@/components/ui/minimal-carousel";
import { AttractionsDrumCarousel } from "./attractions-drum-carousel";
import { HeroWordReelSection } from "./hero-word-reel";

export interface DestinationHub {
  name: string;
  activitiesCount: string;
  image: string;
  route: string;
  tagline: string;
}

export interface IconicAttraction {
  id: string;
  title: string;
  district: string;
  activities: string;
  image: string;
  category: string;
  slug: string;
}

// 1. "Things to do wherever you're going" - Top Row Destinations
export const DESTINATION_HUBS: DestinationHub[] = [
  {
    name: "Ooty",
    activitiesCount: "52 activities",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80",
    route: "/districts/the-nilgiris",
    tagline: "Queen of Hill Stations, misty peaks & tea gardens",
  },
  {
    name: "Kodaikanal",
    activitiesCount: "44 activities",
    image: "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=600&q=80",
    route: "/districts/dindigul",
    tagline: "Princess of Hills, star-shaped lake & pine forests",
  },
  {
    name: "Madurai",
    activitiesCount: "68 activities",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80",
    route: "/districts/madurai",
    tagline: "Thoonga Nagaram, ancient gopurams & food legends",
  },
  {
    name: "Rameswaram",
    activitiesCount: "36 activities",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80",
    route: "/districts/ramanathapuram",
    tagline: "Pamban Bridge, Dhanushkodi ghost town & island shores",
  },
  {
    name: "Mahabalipuram",
    activitiesCount: "29 activities",
    image: "https://images.unsplash.com/photo-1600100397608-f010f444f434?auto=format&fit=crop&w=600&q=80",
    route: "/districts/chengalpattu",
    tagline: "UNESCO rock sculptures & coastal shore temple",
  },
  {
    name: "Thanjavur",
    activitiesCount: "41 activities",
    image: "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=600&q=80",
    route: "/districts/thanjavur",
    tagline: "Chola heartland & the architectural wonder Big Temple",
  },
];

// 2. "Attractions you can't miss" - Bottom Row Iconic Spots with Carousel
export const ICONIC_ATTRACTIONS: IconicAttraction[] = [
  {
    id: "meenakshi",
    title: "Meenakshi Amman Temple",
    district: "Madurai",
    activities: "38 experiences",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=900&q=80",
    category: "temples",
    slug: "meenakshi-amman-temple",
  },
  {
    id: "brihadisvara",
    title: "Brihadisvara Big Temple",
    district: "Thanjavur",
    activities: "42 experiences",
    image: "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=900&q=80",
    category: "heritage",
    slug: "thanjavur-city",
  },
  {
    id: "dhanushkodi",
    title: "Dhanushkodi Ghost Town",
    district: "Rameswaram",
    activities: "24 experiences",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
    category: "beaches",
    slug: "mahabalipuram",
  },
  {
    id: "nilgiri-railway",
    title: "Nilgiri Mountain Railway",
    district: "Ooty",
    activities: "19 experiences",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=80",
    category: "hills",
    slug: "kodaikanal",
  },
  {
    id: "hogenakkal",
    title: "Hogenakkal Niagara Falls",
    district: "Dharmapuri",
    activities: "27 experiences",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80",
    category: "waterfalls",
    slug: "theni",
  },
  {
    id: "shore-temple",
    title: "Shore Temple & Pancha Rathas",
    district: "Mahabalipuram",
    activities: "31 experiences",
    image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=900&q=80",
    category: "heritage",
    slug: "mahabalipuram",
  },
];

export function ThingsToDoSection() {
  const navigate = useNavigate();

  const hubCarouselCards: CarouselCard[] = [
    {
      id: "ooty",
      title: "Ooty",
      value: "52 Activities · Nilgiris",
      color: "bg-[#0284c7]",
      icon: Mountain,
    },
    {
      id: "kodaikanal",
      title: "Kodaikanal",
      value: "44 Activities · Dindigul",
      color: "bg-[#0ea5e9]",
      icon: FaCloud,
    },
    {
      id: "madurai",
      title: "Madurai",
      value: "68 Activities · Heritage",
      color: "bg-[#3b82f6]",
      icon: Landmark,
    },
    {
      id: "rameswaram",
      title: "Rameswaram",
      value: "36 Activities · Coastal",
      color: "bg-[#0284c7]",
      icon: Waves,
    },
    {
      id: "kanniyakumari",
      title: "Kanniyakumari",
      value: "38 Activities · 3 Oceans",
      color: "bg-[#0284c7]",
      icon: Sun,
    },
    {
      id: "mahabalipuram",
      title: "Mahabalipuram",
      value: "29 Activities · UNESCO",
      color: "bg-[#0369a1]",
      icon: VscSparkleFilled,
    },
    {
      id: "thanjavur",
      title: "Thanjavur",
      value: "41 Activities · Chola",
      color: "bg-[#1d4ed8]",
      icon: BsBookmarkStarFill,
    },
    {
      id: "yelagiri",
      title: "Yelagiri",
      value: "25 Activities · Treks",
      color: "bg-[#0284c7]",
      icon: Trees,
    },
    {
      id: "courtallam",
      title: "Courtallam",
      value: "31 Activities · Spa Falls",
      color: "bg-[#0ea5e9]",
      icon: Waves,
    },
    {
      id: "hogenakkal",
      title: "Hogenakkal",
      value: "27 Activities · River Falls",
      color: "bg-[#0284c7]",
      icon: Footprints,
    },
    {
      id: "valparai",
      title: "Valparai",
      value: "34 Activities · Rainforest",
      color: "bg-[#0369a1]",
      icon: Palmtree,
    },
    {
      id: "velankanni",
      title: "Velankanni",
      value: "22 Activities · Coastal Coast",
      color: "bg-[#1d4ed8]",
      icon: Church,
    },
  ];

  const [selectedHubId, setSelectedHubId] = React.useState<string>("ooty");

  // Places mapping for each hub when clicked
  const hubPlacesData: Record<
    string,
    {
      hubName: string;
      tagline: string;
      route: string;
      districtLabel: string;
      places: Array<{
        name: string;
        category: string;
        timeNeeded: string;
        image: string;
        slug: string;
        rating: number;
        description: string;
      }>;
    }
  > = {
    ooty: {
      hubName: "Ooty & The Nilgiris",
      tagline: "Queen of Hill Stations, misty pine valleys & emerald tea gardens",
      route: "/districts/the-nilgiris",
      districtLabel: "The Nilgiris District",
      places: [
        {
          name: "Nilgiri Mountain Railway (UNESCO)",
          category: "Heritage Mountain Train",
          timeNeeded: "3 - 4 hours",
          image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=700&q=80",
          slug: "kodaikanal",
          rating: 4.9,
          description: "Centuries-old Swiss rack-and-pinion steam locomotive chugging through 16 tunnels and 250 bridges.",
        },
        {
          name: "Doddabetta Peak & Telescope House",
          category: "Highest Peak in Nilgiris",
          timeNeeded: "2 hours",
          image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=700&q=80",
          slug: "kodaikanal",
          rating: 4.8,
          description: "Highest vantage point (2,637m) in Tamil Nadu offering panoramic vistas of Bandipur and Nilgiri ridges.",
        },
        {
          name: "Pykara Lake & Waterfalls",
          category: "Scenic Lake & Boating",
          timeNeeded: "2.5 hours",
          image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=700&q=80",
          slug: "kodaikanal",
          rating: 4.7,
          description: "Sacred Toda tribal river cascading down stepped cliffs with tranquil speed boat rides.",
        },
        {
          name: "Government Botanical Gardens",
          category: "Exotic Flora Sanctuary",
          timeNeeded: "1.5 hours",
          image: "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=700&q=80",
          slug: "kodaikanal",
          rating: 4.6,
          description: "Terraced English gardens established in 1848, featuring a 20-million-year-old fossilized tree trunk.",
        },
      ],
    },
    kodaikanal: {
      hubName: "Kodaikanal & Palani Hills",
      tagline: "Princess of Hill Stations, star-shaped lake, mist & cliff trails",
      route: "/districts/dindigul",
      districtLabel: "Dindigul District",
      places: [
        {
          name: "Kodaikanal Star Lake Promenade",
          category: "Iconic Lakeside Cycling",
          timeNeeded: "2 hours",
          image: "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=700&q=80",
          slug: "kodaikanal",
          rating: 4.9,
          description: "Cruising, paddle boating, and cycling along the 5km star-shaped lake hemmed by weeping willows.",
        },
        {
          name: "Coaker's Walk & Cloud Edge Trail",
          category: "Cliff Edge Panoramic Walk",
          timeNeeded: "1.5 hours",
          image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=700&q=80",
          slug: "kodaikanal",
          rating: 4.8,
          description: "Pedestrian cliff walk built along mountain contours overlooking dolphin nose ridge and Pambar valley.",
        },
        {
          name: "Pillar Rocks & Guna Caves",
          category: "Granite Monoliths & Chasm",
          timeNeeded: "2 hours",
          image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=700&q=80",
          slug: "kodaikanal",
          rating: 4.7,
          description: "Three majestic vertical granite boulders standing 400ft tall shrouded in dramatic afternoon mist.",
        },
        {
          name: "Silver Cascade Waterfalls",
          category: "Roadside Mountain Cascade",
          timeNeeded: "45 mins",
          image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=700&q=80",
          slug: "kodaikanal",
          rating: 4.6,
          description: "Spectacular 180ft cascade formed by overflow from Kodai Lake, welcome point on the ghat road.",
        },
      ],
    },
    madurai: {
      hubName: "Madurai Temple City",
      tagline: "Thoonga Nagaram, 2,500 years of living Tamil heritage and culinary legends",
      route: "/districts/madurai",
      districtLabel: "Madurai District",
      places: [
        {
          name: "Meenakshi Sundareswarar Temple",
          category: "Dravidian Architectural Marvel",
          timeNeeded: "3 hours",
          image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=700&q=80",
          slug: "meenakshi-amman-temple",
          rating: 5.0,
          description: "Historic epicenter with 14 gopurams, Hall of Thousand Pillars, and golden lotus sacred pond.",
        },
        {
          name: "Thirumalai Nayakkar Mahal",
          category: "Indo-Saracenic Palace",
          timeNeeded: "1.5 hours",
          image: "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=700&q=80",
          slug: "meenakshi-amman-temple",
          rating: 4.8,
          description: "Palatial 17th-century courtyard featuring giant 82ft-high stucco pillars and evening light-and-sound shows.",
        },
        {
          name: "Famous Jigarthanda & Food Safari",
          category: "Culinary Heritage Legend",
          timeNeeded: "1 hour",
          image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=700&q=80",
          slug: "meenakshi-amman-temple",
          rating: 4.9,
          description: "Taste authentic Kari Dosa, bun parotta, and the chilled Badam Pisin royal cooling elixir.",
        },
        {
          name: "Puthu Mandapam Textile Arcade",
          category: "Living 16th-Century Bazaar",
          timeNeeded: "1.5 hours",
          image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=700&q=80",
          slug: "meenakshi-amman-temple",
          rating: 4.7,
          description: "Centuries-old stone hall opposite Meenakshi Temple bustling with Sungudi artisans and bronze casters.",
        },
      ],
    },
    rameswaram: {
      hubName: "Rameswaram Island & Coast",
      tagline: "Sacred island shores, Pamban sea bridge & the mystical ghost town of Dhanushkodi",
      route: "/districts/ramanathapuram",
      districtLabel: "Ramanathapuram District",
      places: [
        {
          name: "Ramanathaswamy Temple Corridors",
          category: "Longest Hallway in the World",
          timeNeeded: "2.5 hours",
          image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=700&q=80",
          slug: "mahabalipuram",
          rating: 4.9,
          description: "World-famous 1,212 carved pillars and 22 sacred teertham wells right on the oceanic coastline.",
        },
        {
          name: "Dhanushkodi Land's End & Ghost Town",
          category: "Two-Oceans Confluence",
          timeNeeded: "3 hours",
          image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80",
          slug: "mahabalipuram",
          rating: 4.9,
          description: "Ruins of the 1964 submerged township where Bay of Bengal meets the Indian Ocean.",
        },
        {
          name: "Pamban Sea Bridge & Rail Cantilever",
          category: "Engineering Wonder Over Ocean",
          timeNeeded: "1 hour",
          image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=700&q=80",
          slug: "mahabalipuram",
          rating: 4.8,
          description: "India's first sea bridge opened in 1914 with iconic Scherzer lifting bridge mechanism.",
        },
        {
          name: "APJ Abdul Kalam National Memorial",
          category: "Presidential Memorial & Museum",
          timeNeeded: "1 hour",
          image: "https://images.unsplash.com/photo-1600100397608-f010f444f434?auto=format&fit=crop&w=700&q=80",
          slug: "mahabalipuram",
          rating: 4.7,
          description: "Tribute to India's People's President featuring missile replicas, personal memorabilia and heritage garden.",
        },
      ],
    },
    mahabalipuram: {
      hubName: "Mahabalipuram Shore Heritage",
      tagline: "UNESCO world heritage rock sanctuaries, coastal monoliths & seaside cafes",
      route: "/districts/chengalpattu",
      districtLabel: "Chengalpattu District",
      places: [
        {
          name: "Shore Temple on the Bay of Bengal",
          category: "7th-Century Structural Temple",
          timeNeeded: "1.5 hours",
          image: "https://images.unsplash.com/photo-1600100397608-f010f444f434?auto=format&fit=crop&w=700&q=80",
          slug: "mahabalipuram",
          rating: 4.9,
          description: "Magnificent granite shrine built by Narasimhavarman II weathering coastal spray for 1,300 years.",
        },
        {
          name: "Pancha Rathas (Five Chariots)",
          category: "Monolithic Rock Architecture",
          timeNeeded: "1.5 hours",
          image: "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=700&q=80",
          slug: "mahabalipuram",
          rating: 4.8,
          description: "Monolithic temples carved out of individual pink granite boulders, each with distinct Dravidian style.",
        },
        {
          name: "Arjuna's Penance & Krishna's Butter Ball",
          category: "World's Largest Bas-Relief",
          timeNeeded: "1 hour",
          image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=700&q=80",
          slug: "mahabalipuram",
          rating: 4.7,
          description: "Gigantic 250-ton precariously balanced boulder and a massive cliff carving of the Descent of the Ganges.",
        },
        {
          name: "Surfing Shore & Coastal Seafood Cafes",
          category: "Coastal Beach Lifestyle",
          timeNeeded: "2 hours",
          image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80",
          slug: "mahabalipuram",
          rating: 4.7,
          description: "Learn to catch gentle waves with local surf schools followed by fresh catch at beachside shacks.",
        },
      ],
    },
    thanjavur: {
      hubName: "Thanjavur & Chola Heartland",
      tagline: "Rice Bowl of Tamil Nadu, imperial Chola architecture & classical arts",
      route: "/districts/thanjavur",
      districtLabel: "Thanjavur District",
      places: [
        {
          name: "Brihadisvara Big Temple (UNESCO)",
          category: "Chola Imperial Grandeur",
          timeNeeded: "2.5 hours",
          image: "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=700&q=80",
          slug: "thanjavur-city",
          rating: 5.0,
          description: "Thousand-year-old architectural titan built in 1010 AD with an 80-tonne single granite capstone vimana.",
        },
        {
          name: "Thanjavur Maratha Royal Palace",
          category: "Palace Art Gallery & Bell Tower",
          timeNeeded: "2 hours",
          image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=700&q=80",
          slug: "thanjavur-city",
          rating: 4.7,
          description: "Royal residence of Nayak and Maratha rulers housing priceless ancient bronze statues and rare manuscripts.",
        },
        {
          name: "Saraswathi Mahal Library",
          category: "Oldest Library in Asia",
          timeNeeded: "1.5 hours",
          image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=700&q=80",
          slug: "thanjavur-city",
          rating: 4.8,
          description: "Historical repository containing 60,000+ rare palm-leaf manuscripts and ancient cartographic atlases.",
        },
        {
          name: "Thanjavur Dancing Doll & Art Studios",
          category: "GI-Tagged Handicraft Trail",
          timeNeeded: "1.5 hours",
          image: "https://images.unsplash.com/photo-1600100397608-f010f444f434?auto=format&fit=crop&w=700&q=80",
          slug: "thanjavur-city",
          rating: 4.6,
          description: "Watch master artisans craft gold-foil Thanjavur paintings and oscillating Thalayatti Bommai dolls.",
        },
      ],
    },
    kanniyakumari: {
      hubName: "Kanniyakumari Coast",
      tagline: "India's southern apex where the Arabian Sea, Bay of Bengal, and Indian Ocean meet",
      route: "/districts/kanniyakumari",
      districtLabel: "Kanniyakumari District",
      places: [
        {
          name: "Vivekananda Rock Memorial & Ferry",
          category: "Offshore Spiritual Monument",
          timeNeeded: "2 hours",
          image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=700&q=80",
          slug: "mahabalipuram",
          rating: 4.9,
          description: "Iconic granite island memorial built in 1970 where Swami Vivekananda attained enlightenment.",
        },
        {
          name: "Thiruvalluvar 133-ft Stone Statue",
          category: "Monumental Tamil Landmark",
          timeNeeded: "1.5 hours",
          image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=700&q=80",
          slug: "mahabalipuram",
          rating: 4.8,
          description: "Soaring 133-foot stone colossus honoring the author of the Tirukkural on an ocean islet.",
        },
        {
          name: "Sunset & Sunrise Confluence Point",
          category: "Triveni Sangam Natural Spectacle",
          timeNeeded: "1.5 hours",
          image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80",
          slug: "mahabalipuram",
          rating: 4.8,
          description: "One of the few spots on earth where both sunrise and sunset can be viewed from the exact same beach.",
        },
        {
          name: "Padmanabhapuram Wooden Palace",
          category: "Kerala-Tamil Wooden Heritage",
          timeNeeded: "2 hours",
          image: "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=700&q=80",
          slug: "mahabalipuram",
          rating: 4.7,
          description: "16th-century Travancore wooden fortress with rosewood ceilings, antique murals, and Belgian mirrors.",
        },
      ],
    },
    yelagiri: {
      hubName: "Yelagiri Hills",
      tagline: "Pocket-sized hill retreat, tranquil orchards, paragliding and green trekking trails",
      route: "/districts/tirupathur",
      districtLabel: "Tirupathur District",
      places: [
        {
          name: "Swamimalai Peak Trek (4,338 ft)",
          category: "Highest Viewpoint Trek",
          timeNeeded: "3 hours",
          image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=700&q=80",
          slug: "kodaikanal",
          rating: 4.7,
          description: "Rewarding cake-shaped summit trail offering breathtaking views across the entire green valley.",
        },
        {
          name: "Punganur Artificial Lake & Boating",
          category: "Lakeside Boating & Deer Park",
          timeNeeded: "1.5 hours",
          image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=700&q=80",
          slug: "kodaikanal",
          rating: 4.5,
          description: "Calm water body in the center of the hill station with row-boating, pedal-boating and garden walks.",
        },
        {
          name: "Jalagamparai Mountain Falls",
          category: "Forest Waterfall Trail",
          timeNeeded: "2 hours",
          image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=700&q=80",
          slug: "theni",
          rating: 4.6,
          description: "Attaru river waterfall dropping in two cascades amidst fragrant herbal forest vegetation.",
        },
        {
          name: "Yelagiri Adventure & Paragliding Club",
          category: "Aero & Rope Sports",
          timeNeeded: "2 hours",
          image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=700&q=80",
          slug: "kodaikanal",
          rating: 4.6,
          description: "Zip-lining, rock climbing, and paragliding workshops over the scenic hills of northern Tamil Nadu.",
        },
      ],
    },
    courtallam: {
      hubName: "Courtallam Spa Waterfalls",
      tagline: "The natural herbal water theme park of South India nestled in the Western Ghats",
      route: "/districts/tenkasi",
      districtLabel: "Tenkasi District",
      places: [
        {
          name: "Main Falls (Peraruvi)",
          category: "Medicinal Herbal Waterfall",
          timeNeeded: "2 hours",
          image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=700&q=80",
          slug: "theni",
          rating: 4.9,
          description: "Rivers flowing through dense herbal forests create this natural therapeutic outdoor bath.",
        },
        {
          name: "Five Falls (Aintharuvi)",
          category: "5-Pronged Cascade",
          timeNeeded: "1.5 hours",
          image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=700&q=80",
          slug: "theni",
          rating: 4.8,
          description: "Split into five streams resembling the five heads of Adishesha serpent over smooth rocky tiers.",
        },
        {
          name: "Old Courtallam Falls (Pazhaya Aruvi)",
          category: "Secluded Valley Cascades",
          timeNeeded: "2 hours",
          image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=700&q=80",
          slug: "theni",
          rating: 4.7,
          description: "Tucked amidst rocks and valleys, offering peaceful bathing away from the crowded town center.",
        },
        {
          name: "Shenbaga Devi Temple & Falls",
          category: "Pilgrim Trek & Sacred Grove",
          timeNeeded: "2.5 hours",
          image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=700&q=80",
          slug: "theni",
          rating: 4.7,
          description: "Ancient forest temple dedicated to Goddess Shenbaga Devi, accessible via a picturesque trail.",
        },
      ],
    },
    hogenakkal: {
      hubName: "Hogenakkal Falls",
      tagline: "The Niagara of India, deep river gorges, carbonatite rocks & coracle boat adventures",
      route: "/districts/dharmapuri",
      districtLabel: "Dharmapuri District",
      places: [
        {
          name: "Kaveri Coracle Boating Safari",
          category: "Round Bamboo Boat Adventure",
          timeNeeded: "2 hours",
          image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=700&q=80",
          slug: "theni",
          rating: 4.9,
          description: "Spinning coracle boats drifting through vertical black canyon walls right into roaring spray.",
        },
        {
          name: "Hogenakkal Main Gorge & Hanging Bridge",
          category: "Panoramic Suspension Walk",
          timeNeeded: "1.5 hours",
          image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=700&q=80",
          slug: "theni",
          rating: 4.8,
          description: "Overlook the smoke-like mist formed by high water force plunging into ancient rocky chasms.",
        },
        {
          name: "Fresh River Fish Fry Stalls",
          category: "Rustic Culinary Specialty",
          timeNeeded: "1 hour",
          image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=700&q=80",
          slug: "theni",
          rating: 4.8,
          description: "Freshly caught Kaveri river fish seasoned with native spices and roasted crisply on open tava.",
        },
        {
          name: "Melagiri Hills Medicinal Oil Massages",
          category: "Traditional Herbal Therapy",
          timeNeeded: "1 hour",
          image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=700&q=80",
          slug: "theni",
          rating: 4.6,
          description: "Renowned riverside Ayurvedic masseurs providing invigorating herbal body massages.",
        },
      ],
    },
    valparai: {
      hubName: "Valparai Anamalai Hills",
      tagline: "Pristine evergreen rainforests, 40 hairpin bends, Lion-tailed macaques & tea estates",
      route: "/districts/coimbatore",
      districtLabel: "Coimbatore District",
      places: [
        {
          name: "40 Hairpin Bends Scenic Ghat Route",
          category: "Iconic Mountain Drive",
          timeNeeded: "3 hours",
          image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=700&q=80",
          slug: "kodaikanal",
          rating: 5.0,
          description: "Thrilling drive from Pollachi through dense Anamalai Tiger Reserve with sweeping reservoir views.",
        },
        {
          name: "Sholayar Dam & Reservoir",
          category: "Second Deepest Dam in Asia",
          timeNeeded: "1.5 hours",
          image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=700&q=80",
          slug: "kodaikanal",
          rating: 4.8,
          description: "Massive hydroelectric reservoir flanked by misty rolling tea gardens and wild evergreen woods.",
        },
        {
          name: "Aliyar Dam & Monkey Falls",
          category: "Foothill Gardens & Waterfalls",
          timeNeeded: "1.5 hours",
          image: "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=700&q=80",
          slug: "kodaikanal",
          rating: 4.7,
          description: "Pleasant stopover at the base of Valparai with natural water rapids and manicured theme parks.",
        },
        {
          name: "Nallamudi Viewpoint & Tea Estates",
          category: "Tribal Valley Viewpoint",
          timeNeeded: "2 hours",
          image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=700&q=80",
          slug: "kodaikanal",
          rating: 4.8,
          description: "Walk through private tea plantations to view deep valleys, silver streams and Anamudi peak.",
        },
      ],
    },
    velankanni: {
      hubName: "Velankanni Coastal Promenade",
      tagline: "Lourdes of the East on the Bay of Bengal coast with sandy shores and sacred basilica",
      route: "/districts/nagapattinam",
      districtLabel: "Nagapattinam District",
      places: [
        {
          name: "Basilica of Our Lady of Good Health",
          category: "Gothic Coastal Cathedral",
          timeNeeded: "2 hours",
          image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=700&q=80",
          slug: "mahabalipuram",
          rating: 4.9,
          description: "Gleaming white cathedral with distinctive neo-Gothic spires receiving millions of pilgrims.",
        },
        {
          name: "Velankanni Beach Promenade",
          category: "Coastal Beach & Sunset Walk",
          timeNeeded: "1.5 hours",
          image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80",
          slug: "mahabalipuram",
          rating: 4.6,
          description: "Sandy coastal stretch with souvenir bazaars, handmade seashell crafts, and sunrise ocean views.",
        },
        {
          name: "Nagapattinam Lighthouse & Harbor",
          category: "Maritime Navigation Tower",
          timeNeeded: "1 hour",
          image: "https://images.unsplash.com/photo-1600100397608-f010f444f434?auto=format&fit=crop&w=700&q=80",
          slug: "mahabalipuram",
          rating: 4.6,
          description: "Historic maritime port beacon offering bird's-eye views of active fishing boat fleets.",
        },
        {
          name: "Sikkal Singaravelan Temple",
          category: "Ancient Coastal Murugan Shrine",
          timeNeeded: "1.5 hours",
          image: "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=700&q=80",
          slug: "thanjavur-city",
          rating: 4.7,
          description: "Celebrated Chola shrine where Lord Murugan received his divine Vel (spear) to vanquish evil.",
        },
      ],
    },
  };

  const currentHubData = hubPlacesData[selectedHubId] || hubPlacesData.ooty;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 font-sans">
      {/* ─────────────────────────────────────────────────────────── */}
      {/* ROW 1: Things to do wherever you're going                   */}
      {/* Interactive Hubs (Right) & Places (Left)                     */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-display">
              Things to do wherever you're going
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Select any regional hub on the right to discover handpicked places and top attractions on the left
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
              Active: {currentHubData.hubName}
            </span>
          </div>
        </div>

        {/* 2-Column Layout: Left (Places for selected hub) | Right (Hubs Minimal Carousel) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT SIDE: PLACES FOR SELECTED HUB */}
          <div className="lg:col-span-7 rounded-3xl border border-sky-100 bg-white/80 backdrop-blur-md p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="grid size-6 place-items-center rounded-lg bg-sky-100 text-sky-600">
                    <MapPin className="size-3.5" />
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    Places & Attractions in {currentHubData.hubName}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{currentHubData.tagline}</p>
              </div>

              <Link
                to={currentHubData.route}
                className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-full border border-sky-200 transition shrink-0"
              >
                <span>Explore all {currentHubData.districtLabel}</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </div>

            {/* Places Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {currentHubData.places.map((place, idx) => (
                <Link
                  key={idx}
                  to="/place/$slug"
                  params={{ slug: place.slug }}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-3 hover:border-sky-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-100 mb-2.5">
                    <SafeImage
                      src={place.image}
                      alt={place.name}
                      category="heritage"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                    <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-white/90 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-800 border border-slate-200/80">
                      ★ {place.rating}
                    </span>
                    <span className="absolute top-2 right-2 rounded-full bg-slate-900/70 backdrop-blur-md px-2 py-0.5 text-[9px] font-mono font-semibold text-white">
                      {place.timeNeeded}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-600">
                      {place.category}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1 mt-0.5">
                      {place.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {place.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between sm:hidden">
              <Link
                to={currentHubData.route}
                className="w-full text-center text-xs font-bold text-sky-600 bg-sky-50 py-2 rounded-xl border border-sky-200"
              >
                View all in {currentHubData.districtLabel} →
              </Link>
            </div>
          </div>

          {/* RIGHT SIDE: HUBS CAROUSEL */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="mb-2 px-1 flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                TRAVEL HUBS (TAP TO SWITCH)
              </span>
              <span className="text-[11px] text-sky-600 font-semibold">
                {hubCarouselCards.length} Regional Hubs
              </span>
            </div>

            <MinimalCarousel
              cards={hubCarouselCards}
              activeId={selectedHubId}
              hideExpandedCard={true}
              gridClassName="grid-cols-2 gap-2.5 sm:gap-3"
              cardClassName="h-[96px] sm:h-[104px]"
              onCardSelect={(cardId) => {
                if (cardId) setSelectedHubId(cardId);
              }}
              onCopyClick={(card) => {
                const districtRoutes: Record<string, string> = {
                  ooty: "/districts/the-nilgiris",
                  kodaikanal: "/districts/dindigul",
                  madurai: "/districts/madurai",
                  rameswaram: "/districts/ramanathapuram",
                  kanniyakumari: "/districts/kanniyakumari",
                  mahabalipuram: "/districts/chengalpattu",
                  thanjavur: "/districts/thanjavur",
                  yelagiri: "/districts/tirupathur",
                  courtallam: "/districts/tenkasi",
                  hogenakkal: "/districts/dharmapuri",
                  valparai: "/districts/coimbatore",
                  velankanni: "/districts/nagapattinam",
                };
                const targetRoute = districtRoutes[card.id] || "/explore";
                navigate({ to: targetRoute });
              }}
              onCustomizeClick={(card) => {
                const districtRoutes: Record<string, string> = {
                  ooty: "/districts/the-nilgiris",
                  kodaikanal: "/districts/dindigul",
                  madurai: "/districts/madurai",
                  rameswaram: "/districts/ramanathapuram",
                  kanniyakumari: "/districts/kanniyakumari",
                  mahabalipuram: "/districts/chengalpattu",
                  thanjavur: "/districts/thanjavur",
                  yelagiri: "/districts/tirupathur",
                  courtallam: "/districts/tenkasi",
                  hogenakkal: "/districts/dharmapuri",
                  valparai: "/districts/coimbatore",
                  velankanni: "/districts/nagapattinam",
                };
                navigate({ to: districtRoutes[card.id] || "/explore" });
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function AttractionsYouCantMissSection() {
  return (
    <section className="relative w-full overflow-visible">
      {/* Cinematic Big Typography Hero Word Reel with Floating Thumbnail Dock */}
      <HeroWordReelSection attractions={ICONIC_ATTRACTIONS} />
    </section>
  );
}
