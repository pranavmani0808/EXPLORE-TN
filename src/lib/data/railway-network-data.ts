/**
 * Tamil Nadu Southern Railway Network & Heritage Rail Trails Data
 * Extracted accurately from Southern Railway System Map (Divisions: Chennai, Salem, Tiruchirappalli, Madurai, Palakkad, Thiruvananthapuram)
 */

export interface RailwayStation {
  code: string;
  name: string;
  district: string;
  division: "Chennai" | "Salem" | "Tiruchirappalli" | "Madurai" | "Palakkad" | "Thiruvananthapuram";
  latitude: number;
  longitude: number;
  elevationM?: number;
  isJunction?: boolean;
  isTerminus?: boolean;
  gaugeType: "Broad Gauge" | "Meter Gauge / Heritage Mountain";
  description: string;
  historicalNote?: string;
  connectingLines: string[];
}

export interface RailwayTrail {
  slug: string;
  title: string;
  subtitle: string;
  badge: string;
  division: string;
  distance: string;
  duration: string;
  difficulty: "Easy" | "Moderate" | "Challenging";
  bestSeason: string;
  description: string;
  historicalContext: string;
  highlights: string[];
  stops: {
    name: string;
    code: string;
    district: string;
    slug: string;
    description: string;
    latitude: number;
    longitude: number;
    stationType?: string;
    heritageFact?: string;
  }[];
}

/**
 * Key Southern Railway Stations in Tamil Nadu from the Railway System Map
 */
export const TN_RAILWAY_STATIONS: Record<string, RailwayStation> = {
  // CHENNAI DIVISION
  "MAS": {
    code: "MAS",
    name: "Chennai Central (Dr. MGR Central)",
    district: "Chennai",
    division: "Chennai",
    latitude: 13.0827,
    longitude: 80.2757,
    isJunction: true,
    isTerminus: true,
    gaugeType: "Broad Gauge",
    description: "The primary historical railway terminus of South India, opened in 1873. Headquarter of Southern Railway.",
    connectingLines: ["Chennai - Arakkonam - Jolarpettai", "Chennai - Gudur", "Chennai Suburban"]
  },
  "MS": {
    code: "MS",
    name: "Chennai Egmore",
    district: "Chennai",
    division: "Chennai",
    latitude: 13.0788,
    longitude: 80.2608,
    isJunction: true,
    isTerminus: true,
    gaugeType: "Broad Gauge",
    description: "Gothic and Indo-Saracenic gateway station for all southbound trains traversing the Cauvery delta and South Tamil Nadu.",
    connectingLines: ["Chennai Egmore - Villupuram - Trichy Mainline", "Chennai Suburban"]
  },
  "TBM": {
    code: "TBM",
    name: "Tambaram",
    district: "Chengalpattu",
    division: "Chennai",
    latitude: 12.9249,
    longitude: 80.1197,
    isJunction: true,
    gaugeType: "Broad Gauge",
    description: "Major suburban and Southern Railway hub with large EMU car shed.",
    connectingLines: ["Chennai Egmore - Chengalpattu"]
  },
  "CGL": {
    code: "CGL",
    name: "Chengalpattu Junction",
    district: "Chengalpattu",
    division: "Chennai",
    latitude: 12.6841,
    longitude: 79.9836,
    isJunction: true,
    gaugeType: "Broad Gauge",
    description: "Crucial rail fork connecting Chennai mainline with Kanchipuram and Arakkonam.",
    connectingLines: ["Chennai - Villupuram", "Chengalpattu - Kanchipuram - Arakkonam"]
  },
  "AJJ": {
    code: "AJJ",
    name: "Arakkonam Junction",
    district: "Ranipet",
    division: "Chennai",
    latitude: 13.0783,
    longitude: 79.6681,
    isJunction: true,
    gaugeType: "Broad Gauge",
    description: "One of the oldest junctions in India with a massive electrical locomotive shed (RPM/AJJ).",
    connectingLines: ["Chennai - Jolarpettai", "Arakkonam - Renigunta", "Arakkonam - Chengalpattu"]
  },
  "KPD": {
    code: "KPD",
    name: "Katpadi Junction (Vellore)",
    district: "Vellore",
    division: "Chennai",
    latitude: 12.9698,
    longitude: 79.1362,
    isJunction: true,
    gaugeType: "Broad Gauge",
    description: "Serving the historic fort city of Vellore, branching toward Tirupati/Renigunta and Villupuram.",
    connectingLines: ["Chennai - Jolarpettai", "Katpadi - Villupuram", "Katpadi - Renigunta"]
  },
  "JTJ": {
    code: "JTJ",
    name: "Jolarpettai Junction",
    district: "Tirupathur",
    division: "Chennai",
    latitude: 12.5583,
    longitude: 78.5833,
    isJunction: true,
    gaugeType: "Broad Gauge",
    description: "Arterial junction where lines branch between Chennai, Bangalore (Karnataka), and Salem/Coimbatore/Kerala.",
    connectingLines: ["Chennai - Jolarpettai", "Jolarpettai - Bangalore", "Jolarpettai - Salem - Erode"]
  },

  // SALEM DIVISION
  "SA": {
    code: "SA",
    name: "Salem Junction",
    district: "Salem",
    division: "Salem",
    latitude: 11.6738,
    longitude: 78.1206,
    isJunction: true,
    gaugeType: "Broad Gauge",
    description: "Headquarters of Salem Division, connecting western textile corridors with Central Tamil Nadu and Bangalore.",
    connectingLines: ["Jolarpettai - Salem - Erode", "Salem - Karur - Dindigul", "Salem - Vriddhachalam"]
  },
  "ED": {
    code: "ED",
    name: "Erode Junction",
    district: "Erode",
    division: "Salem",
    latitude: 11.3364,
    longitude: 77.7274,
    isJunction: true,
    gaugeType: "Broad Gauge",
    description: "Major railway junction with premier Diesel (ED) and Electric Locomotive sheds. Connects Trichy line to Kongu corridor.",
    connectingLines: ["Salem - Erode - Coimbatore", "Erode - Karur - Tiruchirappalli"]
  },
  "TUP": {
    code: "TUP",
    name: "Tiruppur",
    district: "Tiruppur",
    division: "Salem",
    latitude: 11.1085,
    longitude: 77.3411,
    gaugeType: "Broad Gauge",
    description: "India's knitwear capital on the Erode - Coimbatore trunk line.",
    connectingLines: ["Erode - Coimbatore"]
  },
  "CBE": {
    code: "CBE",
    name: "Coimbatore Main Junction",
    district: "Coimbatore",
    division: "Salem",
    latitude: 10.9976,
    longitude: 76.9634,
    isJunction: true,
    gaugeType: "Broad Gauge",
    description: "The primary terminus of Western Tamil Nadu and gateway to the Palakkad Gap and Nilgiri hills.",
    connectingLines: ["Erode - Palakkad", "Coimbatore - Mettupalayam", "Coimbatore - Pollachi"]
  },
  "MTP": {
    code: "MTP",
    name: "Mettupalayam Junction",
    district: "Coimbatore",
    division: "Salem",
    latitude: 11.3005,
    longitude: 76.9534,
    isJunction: true,
    gaugeType: "Broad Gauge",
    description: "The foothill interchange station connecting broad-gauge trains from Chennai/Coimbatore with the Nilgiri Mountain Railway.",
    connectingLines: ["Coimbatore - Mettupalayam", "Mettupalayam - Ooty (NMR)"]
  },
  "UAM": {
    code: "UAM",
    name: "Udagamandalam (Ooty)",
    district: "The Nilgiris",
    division: "Salem",
    latitude: 11.4064,
    longitude: 76.6953,
    isTerminus: true,
    gaugeType: "Meter Gauge / Heritage Mountain",
    description: "UNESCO World Heritage Nilgiri Mountain Railway terminus at 2,203 meters altitude, famous for Swiss-engineered Abt rack and pinion system.",
    connectingLines: ["Mettupalayam - Coonoor - Udagamandalam"]
  },
  "ONR": {
    code: "ONR",
    name: "Coonoor",
    district: "The Nilgiris",
    division: "Salem",
    latitude: 11.3530,
    longitude: 76.7959,
    gaugeType: "Meter Gauge / Heritage Mountain",
    description: "Historic mountain railway workshop and steam loco shed (ONR) along the Nilgiri railway ascent.",
    connectingLines: ["Mettupalayam - Ooty (NMR)"]
  },

  // TIRUCHIRAPPALLI DIVISION
  "VM": {
    code: "VM",
    name: "Villupuram Junction",
    district: "Villupuram",
    division: "Tiruchirappalli",
    latitude: 11.9398,
    longitude: 79.4939,
    isJunction: true,
    gaugeType: "Broad Gauge",
    description: "Massive northern junction for Tiruchirappalli Division connecting Chord Line, Main Line, Tiruvannamalai, and Puducherry.",
    connectingLines: ["Chennai - Villupuram", "Villupuram - Trichy (Chord Line)", "Villupuram - Mayiladuthurai (Mainline)", "Villupuram - Puducherry", "Villupuram - Tiruvannamalai - Katpadi"]
  },
  "PDY": {
    code: "PDY",
    name: "Puducherry (Pondicherry)",
    district: "Puducherry",
    division: "Tiruchirappalli",
    latitude: 11.9284,
    longitude: 79.8276,
    isTerminus: true,
    gaugeType: "Broad Gauge",
    description: "Coastal terminus station connecting the French colonial heritage coastal town with Villupuram.",
    connectingLines: ["Villupuram - Puducherry"]
  },
  "TNM": {
    code: "TNM",
    name: "Tiruvannamalai",
    district: "Tiruvannamalai",
    division: "Tiruchirappalli",
    latitude: 12.2253,
    longitude: 79.0747,
    gaugeType: "Broad Gauge",
    description: "Sacred rail station situated directly at the foot of Mount Arunachala and the sacred Annamalaiyar Temple.",
    connectingLines: ["Villupuram - Katpadi"]
  },
  "CDM": {
    code: "CDM",
    name: "Chidambaram",
    district: "Cuddalore",
    division: "Tiruchirappalli",
    latitude: 11.3991,
    longitude: 79.6936,
    gaugeType: "Broad Gauge",
    description: "Historic temple town on the Main Line serving Thillai Nataraja Temple.",
    connectingLines: ["Villupuram - Mayiladuthurai (Main Line)"]
  },
  "MV": {
    code: "MV",
    name: "Mayiladuthurai Junction",
    district: "Mayiladuthurai",
    division: "Tiruchirappalli",
    latitude: 11.0988,
    longitude: 79.6457,
    isJunction: true,
    gaugeType: "Broad Gauge",
    description: "Central Cauvery delta rail hub branching toward Thanjavur, Tiruvarur, and Karaikal ports.",
    connectingLines: ["Main Line", "Mayiladuthurai - Thanjavur", "Mayiladuthurai - Tiruvarur"]
  },
  "TJ": {
    code: "TJ",
    name: "Thanjavur Junction",
    district: "Thanjavur",
    division: "Tiruchirappalli",
    latitude: 10.7744,
    longitude: 79.1332,
    isJunction: true,
    gaugeType: "Broad Gauge",
    description: "Chola royal capital junction serving the UNESCO Brihadisvara Temple, branching toward Trichy and Karaikal.",
    connectingLines: ["Mayiladuthurai - Thanjavur - Trichy", "Thanjavur - Tiruvarur - Nagapattinam"]
  },
  "TPJ": {
    code: "TPJ",
    name: "Tiruchirappalli Junction (Trichy)",
    district: "Tiruchirappalli",
    division: "Tiruchirappalli",
    latitude: 10.7937,
    longitude: 78.6865,
    isJunction: true,
    gaugeType: "Broad Gauge",
    description: "Headquarters of Tiruchirappalli Division with historic Golden Rock Railway Workshop (GOC). Central crossroads of Tamil Nadu.",
    connectingLines: ["Chord Line to Chennai", "Main Line to Thanjavur", "Trichy - Dindigul - Madurai", "Trichy - Karur - Erode", "Trichy - Karaikkudi - Rameswaram"]
  },
  "KRR": {
    code: "KRR",
    name: "Karur Junction",
    district: "Karur",
    division: "Salem",
    latitude: 10.9574,
    longitude: 78.0839,
    isJunction: true,
    gaugeType: "Broad Gauge",
    description: "Cauvery bank textile junction connecting Salem, Erode, Trichy, and Dindigul.",
    connectingLines: ["Erode - Karur - Trichy", "Salem - Karur - Dindigul"]
  },

  // MADURAI DIVISION
  "DG": {
    code: "DG",
    name: "Dindigul Junction",
    district: "Dindigul",
    division: "Madurai",
    latitude: 10.3624,
    longitude: 77.9695,
    isJunction: true,
    gaugeType: "Broad Gauge",
    description: "Gateway junction for Palani Murugan temple line, Kodai Road (for Kodaikanal hill station), and Madurai mainline.",
    connectingLines: ["Trichy - Madurai", "Dindigul - Palani - Pollachi - Coimbatore", "Karur - Dindigul"]
  },
  "PLNI": {
    code: "PLNI",
    name: "Palani",
    district: "Dindigul",
    division: "Madurai",
    latitude: 10.4501,
    longitude: 77.5197,
    gaugeType: "Broad Gauge",
    description: "Pilgrimage rail town at the base of Palani Dhandayuthapani Swamy hill temple, on the scenic Dindigul - Pollachi section.",
    connectingLines: ["Dindigul - Palani - Pollachi"]
  },
  "MDU": {
    code: "MDU",
    name: "Madurai Junction",
    district: "Madurai",
    division: "Madurai",
    latitude: 9.9179,
    longitude: 78.1118,
    isJunction: true,
    gaugeType: "Broad Gauge",
    description: "Headquarters of Madurai Division. Cultural crossroads of Pandyan empire serving Meenakshi Temple and Southern corridors.",
    connectingLines: ["Dindigul - Madurai - Virudhunagar", "Madurai - Manamadurai - Rameswaram", "Madurai - Bodinayakkanur"]
  },
  "KKDI": {
    code: "KKDI",
    name: "Karaikkudi Junction",
    district: "Sivaganga",
    division: "Madurai",
    latitude: 10.0631,
    longitude: 78.7844,
    isJunction: true,
    gaugeType: "Broad Gauge",
    description: "Heart of Chettinad heritage mansions and distinct cuisine, linking Trichy and Manamadurai.",
    connectingLines: ["Trichy - Pudukkottai - Karaikkudi - Manamadurai"]
  },
  "MNM": {
    code: "MNM",
    name: "Manamadurai Junction",
    district: "Sivaganga",
    division: "Madurai",
    latitude: 9.6974,
    longitude: 78.4552,
    isJunction: true,
    gaugeType: "Broad Gauge",
    description: "Key junction connecting Madurai, Virudhunagar, Karaikkudi, and the Rameswaram ocean line.",
    connectingLines: ["Madurai - Manamadurai", "Manamadurai - Rameswaram", "Manamadurai - Virudhunagar"]
  },
  "RMM": {
    code: "RMM",
    name: "Rameswaram",
    district: "Ramanathapuram",
    division: "Madurai",
    latitude: 9.2881,
    longitude: 79.3129,
    isTerminus: true,
    gaugeType: "Broad Gauge",
    description: "India's legendary sea-island railway terminus reached via the historic Pamban cantilever sea bridge over Palk Strait.",
    connectingLines: ["Manamadurai - Mandapam - Pamban - Rameswaram"]
  },
  "VPT": {
    code: "VPT",
    name: "Virudhunagar Junction",
    district: "Virudhunagar",
    division: "Madurai",
    latitude: 9.5872,
    longitude: 77.9575,
    isJunction: true,
    gaugeType: "Broad Gauge",
    description: "Important commercial rail junction branching toward Tenkasi/Sengottai Western Ghats line and Tuticorin/Tirunelveli.",
    connectingLines: ["Madurai - Tirunelveli", "Virudhunagar - Tenkasi - Kollam", "Virudhunagar - Manamadurai"]
  },
  "TSI": {
    code: "TSI",
    name: "Tenkasi Junction",
    district: "Tenkasi",
    division: "Madurai",
    latitude: 8.9592,
    longitude: 77.3149,
    isJunction: true,
    gaugeType: "Broad Gauge",
    description: "Foothill junction near Courtallam Waterfalls and start of the historic Aryankavu Ghats pass into Kerala.",
    connectingLines: ["Virudhunagar - Tenkasi", "Tenkasi - Tirunelveli", "Tenkasi - Sengottai - Punalur - Kollam"]
  },
  "SCT": {
    code: "SCT",
    name: "Sengottai",
    district: "Tenkasi",
    division: "Madurai",
    latitude: 8.9818,
    longitude: 77.2458,
    gaugeType: "Broad Gauge",
    description: "Historic mountain gateway station known for the British-era 13-arch viaduct crossing the Western Ghats into Kerala.",
    connectingLines: ["Tenkasi - Sengottai - Kollam (Kollam-Sengottai Corduroy Line)"]
  },
  "TEN": {
    code: "TEN",
    name: "Tirunelveli Junction",
    district: "Tirunelveli",
    division: "Madurai",
    latitude: 8.7303,
    longitude: 77.7121,
    isJunction: true,
    gaugeType: "Broad Gauge",
    description: "Premier junction of Deep South Tamil Nadu on the banks of Thamirabarani River, branching to Tiruchendur and Tenkasi.",
    connectingLines: ["Madurai - Tirunelveli - Nagercoil", "Tirunelveli - Tiruchendur", "Tirunelveli - Tenkasi"]
  },
  "TCN": {
    code: "TCN",
    name: "Tiruchendur",
    district: "Thoothukudi",
    division: "Madurai",
    latitude: 8.4975,
    longitude: 78.1189,
    isTerminus: true,
    gaugeType: "Broad Gauge",
    description: "Gulf of Mannar coastal railway terminus serving Subramanya Swamy seashore temple.",
    connectingLines: ["Tirunelveli - Tiruchendur"]
  },
  "TN": {
    code: "TN",
    name: "Tuticorin (Thoothukudi)",
    district: "Thoothukudi",
    division: "Madurai",
    latitude: 8.8053,
    longitude: 78.1460,
    isTerminus: true,
    gaugeType: "Broad Gauge",
    description: "Pearl City deepwater port terminus connected via Vanchi Maniyachchi Junction.",
    connectingLines: ["Vanchi Maniyachchi - Tuticorin"]
  },
  "NCJ": {
    code: "NCJ",
    name: "Nagercoil Junction",
    district: "Kanyakumari",
    division: "Thiruvananthapuram",
    latitude: 8.1834,
    longitude: 77.4418,
    isJunction: true,
    gaugeType: "Broad Gauge",
    description: "Southernmost major interchange hub connecting trains between Kerala, Tamil Nadu, and Kanyakumari terminus.",
    connectingLines: ["Tirunelveli - Nagercoil", "Thiruvananthapuram - Nagercoil", "Nagercoil - Kanyakumari"]
  },
  "CAPE": {
    code: "CAPE",
    name: "Kanniyakumari Terminus",
    district: "Kanyakumari",
    division: "Thiruvananthapuram",
    latitude: 8.0828,
    longitude: 77.5511,
    isTerminus: true,
    gaugeType: "Broad Gauge",
    description: "The southernmost railway station of the Indian subcontinent, where the Indian Ocean, Arabian Sea, and Bay of Bengal converge.",
    connectingLines: ["Nagercoil - Kanniyakumari"]
  }
};

/**
 * 4 Signature Tamil Nadu Train & Rail Trails Derived from the Southern Railway System Map
 */
export const TN_TRAIN_TRAILS: Record<string, RailwayTrail> = {
  // 1. UNESCO Heritage Nilgiri Mountain Railway
  "nilgiri-mountain-railway": {
    slug: "nilgiri-mountain-railway",
    title: "UNESCO Nilgiri Mountain Toy Train Heritage Trail",
    subtitle: "Mettupalayam (foothills) to Coonoor & Ooty (2,203m MSL) via rack and pinion steam grade",
    badge: "UNESCO Heritage Rail",
    division: "Salem Division (Southern Railway)",
    distance: "46 km",
    duration: "4h 45m Scenic Journey",
    difficulty: "Easy",
    bestSeason: "September to May",
    description:
      "Journey aboard Asia's steepest railway grade, an engineering marvel completed in 1908. Built with the Swiss Abt rack-and-pinion system, Swiss-vintage X-class steam locomotives push wooden vintage coaches across 250 bridges, 16 tunnels, and dense Nilgiri Shola mist.",
    historicalContext:
      "Designated a UNESCO World Heritage site in 2005. The railway climbs from 326 meters at Mettupalayam up to 2,203 meters at Ooty through eucalyptus groves, coffee terraces, and deep mountain gorges.",
    highlights: [
      "Authentic Swiss Abt rack-and-pinion gear system in active operation",
      "Ascent through 16 tunnels and 250 stone arched viaducts",
      "Historical Steam Loco Shed at Coonoor (ONR)",
      "Breathtaking 360-degree tea valley views through blue mountain mist",
      "Lovedale Victorian hill station crossing"
    ],
    stops: [
      {
        name: "Mettupalayam Junction",
        code: "MTP",
        district: "Coimbatore",
        slug: "mettupalayam",
        description: "Foothill interchange station (326m elevation). Broad gauge meets mountain meter-gauge tracks.",
        latitude: 11.3005,
        longitude: 76.9534,
        stationType: "Broad Gauge / Meter Gauge Interchange",
        heritageFact: "Broad gauge trains like the Nilgiri Express transfer passengers directly across the platform into the Toy Train."
      },
      {
        name: "Kallar Railway Station",
        code: "KLR",
        district: "Coimbatore",
        slug: "kallar",
        description: "Entrance to the rack-and-pinion section at the base of the Nilgiri slopes.",
        latitude: 11.3341,
        longitude: 76.9208,
        stationType: "Intermediate Station",
        heritageFact: "Here the central cog-rail (Abt rack) begins; the engine engages its pinions to climb the 1:12 steep grade."
      },
      {
        name: "Hillgrove Station",
        code: "HLG",
        district: "The Nilgiris",
        slug: "hillgrove",
        description: "Midway watering stop nestled amidst tropical rainforest and wild hornbills.",
        latitude: 11.3392,
        longitude: 76.8481,
        stationType: "Locomotive Water Refill Stop",
        heritageFact: "Locomotive takes in fresh mountain stream water while passengers enjoy freshly brewed Nilgiri tea on the platform."
      },
      {
        name: "Coonoor Railway Junction",
        code: "ONR",
        district: "The Nilgiris",
        slug: "coonoor",
        description: "Mountain division headquarters (1,712m MSL) with vintage steam loco repair sheds.",
        latitude: 11.3530,
        longitude: 76.7959,
        stationType: "Loco Changeover & Heritage Shed",
        heritageFact: "Steam engines detach here and diesel YAM locomotives take over for the gentle gradient up to Ooty."
      },
      {
        name: "Wellington Station",
        code: "WEL",
        district: "The Nilgiris",
        slug: "wellington",
        description: "Picturesque cantonment station serving the Defence Services Staff College (DSSC).",
        latitude: 11.3654,
        longitude: 76.7865,
        stationType: "Cantonment Station",
        heritageFact: "Known for pristine manicured lawns, stone stone-masonry buildings, and military discipline."
      },
      {
        name: "Aravankadu Station",
        code: "AVK",
        district: "The Nilgiris",
        slug: "aravankadu",
        description: "Industrial heritage hamlet home to the historic Cordite Factory nestled in a pine valley.",
        latitude: 11.3789,
        longitude: 76.7725,
        stationType: "Valley Station",
        heritageFact: "Site of India's oldest defense propellants manufacturing unit, nestled in quiet eucalyptus hills."
      },
      {
        name: "Ketti Station",
        code: "KXT",
        district: "The Nilgiris",
        slug: "ketti",
        description: "Station overlooking the vast Ketti Valley — the second deepest valley in the world after Switzerland.",
        latitude: 11.3855,
        longitude: 76.7381,
        stationType: "Valley Viewpoint Station",
        heritageFact: "Frequently featured in vintage Indian cinema for its storybook rolling hills and terraced cabbage farms."
      },
      {
        name: "Lovedale Station",
        code: "LOV",
        district: "The Nilgiris",
        slug: "lovedale-railway-station",
        description: "Highest intermediate Victorian hill station surrounded by blue gum eucalyptus woods.",
        latitude: 11.3822,
        longitude: 76.7089,
        stationType: "Heritage Hill Stop",
        heritageFact: "Preserves original 1908 brass levers, wooden ticket windows, and antique oil lanterns."
      },
      {
        name: "Udagamandalam (Ooty)",
        code: "UAM",
        district: "The Nilgiris",
        slug: "ooty",
        description: "Final terminus of the Nilgiri Mountain Railway sitting at 2,203m MSL beside Ooty Lake.",
        latitude: 11.4064,
        longitude: 76.6953,
        stationType: "High Altitude Terminus",
        heritageFact: "Houses an outdoor rail museum celebrating 120+ years of steam traction in South India."
      }
    ]
  },

  // 2. Historic Pamban Sea Bridge & Ocean Rail Corridor
  "pamban-ocean-rail-corridor": {
    slug: "pamban-ocean-rail-corridor",
    title: "Pamban Sea Bridge & Ocean Rail Corridor",
    subtitle: "Madurai Junction to Mandapam, Pamban Cantilever Sea Span & Rameswaram Island",
    badge: "Ocean Rail Trail",
    division: "Madurai Division (Southern Railway)",
    distance: "161 km",
    duration: "3h 30m Coastal Rail Transit",
    difficulty: "Easy",
    bestSeason: "October to March",
    description:
      "Traverse the iconic maritime rail route connecting mainland Tamil Nadu to the sacred island of Rameswaram. The journey crosses the 2.06 km historic Pamban Sea Bridge built in 1914 over the open Palk Strait, where trains literally glide over the turquoise ocean surf.",
    historicalContext:
      "Opened in 1914 as India's first sea bridge, featuring the Scherzer rolling lift span designed by German-American engineer William Scherzer that opens to allow maritime vessels to pass through.",
    highlights: [
      "Crossing India's legendary 2.06 km Pamban Sea Rail Bridge over turquoise waves",
      "Panoramic views of fishing catamarans and Palk Bay coral reefs",
      "Heritage Madurai Junction departing from the Pandyan capital",
      "Mandapam coastal gateway to the Gulf of Mannar Marine National Park",
      "Arrival at the sacred Ramanathaswamy Temple island terminus"
    ],
    stops: [
      {
        name: "Madurai Junction",
        code: "MDU",
        district: "Madurai",
        slug: "madurai",
        description: "Historic cultural headquarters of Madurai Division and ancient Pandyan capital.",
        latitude: 9.9179,
        longitude: 78.1118,
        stationType: "Divisional Junction Hub",
        heritageFact: "One of the busiest pilgrimage stations in South India with direct links to every corner of the country."
      },
      {
        name: "Manamadurai Junction",
        code: "MNM",
        district: "Sivaganga",
        slug: "manamadurai",
        description: "Arterial rail junction branching toward Karaikkudi, Virudhunagar, and the coastal line.",
        latitude: 9.6974,
        longitude: 78.4552,
        stationType: "Junction Interchange",
        heritageFact: "Famous throughout Tamil Nadu for traditional clay musical pot (Ghatam) artisans."
      },
      {
        name: "Ramanathapuram",
        code: "RMD",
        district: "Ramanathapuram",
        slug: "ramanathapuram",
        description: "Seat of the historic Sethupathi Rajas who once governed the sacred pilgrim causeways to Rameswaram.",
        latitude: 9.3712,
        longitude: 78.8358,
        stationType: "District Headquarters Station",
        heritageFact: "Features the 17th-century Ramalinga Vilasam Palace adorned with authentic Nayak-period murals."
      },
      {
        name: "Mandapam",
        code: "MMM",
        district: "Ramanathapuram",
        slug: "mandapam",
        description: "The mainland marine terminal overlooking the Palk Strait where the sea-crossing begins.",
        latitude: 9.2789,
        longitude: 79.1245,
        stationType: "Peninsular Coastal Station",
        heritageFact: "Base of the Central Marine Fisheries Research Institute (CMFRI) and coral reef conservation research."
      },
      {
        name: "Pamban",
        code: "PBM",
        district: "Ramanathapuram",
        slug: "pamban",
        description: "The island gateway station immediately after crossing the 2.06 km sea span over the Palk Strait.",
        latitude: 9.2778,
        longitude: 79.2089,
        stationType: "Sea Bridge Island Station",
        heritageFact: "The railway was constructed with 143 concrete piers driven directly into the rocky reef bed of the ocean."
      },
      {
        name: "Rameswaram Terminus",
        code: "RMM",
        district: "Ramanathapuram",
        slug: "rameswaram",
        description: "Southern sea terminus station steps away from the iconic 1,000-pillar corridor of Ramanathaswamy Temple.",
        latitude: 9.2881,
        longitude: 79.3129,
        stationType: "Island Rail Terminus",
        heritageFact: "The end of the line on Rameswaram Island, from where roads lead to the ghost town and sand spit of Dhanushkodi."
      }
    ]
  },

  // 3. Cauvery Delta Chola Heritage Rail Circuit
  "cauvery-delta-heritage-rail": {
    slug: "cauvery-delta-heritage-rail",
    title: "Cauvery Delta Chola Heritage Rail Trail",
    subtitle: "Chennai Egmore to Villupuram, Chidambaram, Kumbakonam, Thanjavur & Tiruchirappalli",
    badge: "Chola Mainline Trail",
    division: "Tiruchirappalli Division (Southern Railway)",
    distance: "338 km",
    duration: "6h Heritage Train Journey",
    difficulty: "Easy",
    bestSeason: "October to March",
    description:
      "Travel along the storied Southern Railway Main Line through the fertile rice bowl of the Cauvery Delta. This rail journey connects four UNESCO World Heritage Great Living Chola Temples and ancient spiritual centers spanning Chidambaram, Kumbakonam, and Thanjavur.",
    historicalContext:
      "The South Indian Railway (SIR) laid the meter-gauge mainline in the 1870s to connect Chennai port with the agrarian prosperity of the Cauvery basin and the Golden Rock workshops at Trichy.",
    highlights: [
      "Transit through the verdant paddy fields and river distributaries of the Cauvery",
      "Direct rail access to UNESCO Brihadisvara Temple in Thanjavur",
      "Kumbakonam Mahamaham temple town with dozens of ancient shrines",
      "Chidambaram Nataraja temple with sky-piercing gopurams",
      "Tiruchirappalli Rockfort & historic Golden Rock Railway Workshop (GOC)"
    ],
    stops: [
      {
        name: "Chennai Egmore",
        code: "MS",
        district: "Chennai",
        slug: "chennai-egmore",
        description: "The magnificent 1908 Indo-Saracenic departure hub for all southbound delta trains.",
        latitude: 13.0788,
        longitude: 80.2608,
        stationType: "Main Terminus",
        heritageFact: "Designed by Henry Irwin, Egmore Station is celebrated for its ornate red-brick facade and stained-glass canopies."
      },
      {
        name: "Villupuram Junction",
        code: "VM",
        district: "Villupuram",
        slug: "villupuram",
        description: "Major junction where the Main Line branches toward the coastal delta and Pondicherry.",
        latitude: 11.9398,
        longitude: 79.4939,
        stationType: "Divisional Junction",
        heritageFact: "Historic locomotive crew change station dating back to the South Indian Railway company era."
      },
      {
        name: "Chidambaram",
        code: "CDM",
        district: "Cuddalore",
        slug: "chidambaram",
        description: "Ancient temple city home to the cosmic dancer Lord Nataraja in the Akasha (Space) element.",
        latitude: 11.3991,
        longitude: 79.6936,
        stationType: "Heritage Temple Station",
        heritageFact: "The station platform offers a distant view of the four monumental 140-foot gopurams."
      },
      {
        name: "Mayiladuthurai Junction",
        code: "MV",
        district: "Mayiladuthurai",
        slug: "mayiladuthurai",
        description: "Cauvery bank junction where lines diverge toward Thiruvarur and Karaikal port.",
        latitude: 11.0988,
        longitude: 79.6457,
        stationType: "Delta Junction",
        heritageFact: "Famed junction for tasting traditional South Indian filter coffee and 'Degree' milk at station stalls."
      },
      {
        name: "Kumbakonam",
        code: "KMU",
        district: "Thanjavur",
        slug: "kumbakonam",
        description: "The 'Temple City' situated between the Cauvery and Arasalar rivers, famed for the 12-year Mahamaham festival.",
        latitude: 10.9575,
        longitude: 79.3845,
        stationType: "Pilgrimage Station",
        heritageFact: "Surrounded by world-renowned Chola bronzes casting centers like Swamimalai."
      },
      {
        name: "Thanjavur Junction",
        code: "TJ",
        district: "Thanjavur",
        slug: "thanjavur",
        description: "The grand imperial capital of the Cholas, home to the monolithic 1010 CE Big Temple.",
        latitude: 10.7744,
        longitude: 79.1332,
        stationType: "UNESCO Heritage Junction",
        heritageFact: "Station decor and waiting halls feature murals and bronze replicas celebrating Raja Raja Chola I."
      },
      {
        name: "Tiruchirappalli Junction",
        code: "TPJ",
        district: "Tiruchirappalli",
        slug: "tiruchirappalli",
        description: "Heart of Southern Railway's industrial heritage with the historic Golden Rock Workshop (GOC).",
        latitude: 10.7937,
        longitude: 78.6865,
        stationType: "Central Divisional Headquarters",
        heritageFact: "Home to the Golden Rock Railway Workshop, renowned worldwide for rebuilding and overhauling diesel locos."
      }
    ]
  },

  // 4. Western Ghats Mountain Viaduct Rail Trail (Sengottai - Tenkasi Corridor)
  "western-ghats-sengottai-rail": {
    slug: "western-ghats-sengottai-rail",
    title: "Western Ghats 13-Arch Viaduct Rail Trail",
    subtitle: "Madurai & Virudhunagar to Tenkasi, Sengottai, Aryankavu Pass & Punalur",
    badge: "Ghat Mountain Rail",
    division: "Madurai Division (Southern Railway)",
    distance: "198 km",
    duration: "4h 15m Scenic Mountain Ride",
    difficulty: "Moderate",
    bestSeason: "June to January (Monsoon & Winter)",
    description:
      "Travel the historic Kollam-Sengottai corduroy rail corridor opened by the British in 1904. The railway crosses deep tropical mountain gaps through the Aryankavu Pass over the famous 13-arch stone masonry bridge (Pathimoonnu Kannara Palam), hugging waterfalls and rainforest cliffs.",
    historicalContext:
      "Constructed jointly by the Travancore Royal State and the South Indian Railway to haul spices, rubber, and tea from the mountain estates down to ports.",
    highlights: [
      "The historic 13-Arch British stone masonry viaduct at Aryankavu/Kazhuthuruthi",
      "Dramatic transit through the lush Shencottah gap in the Western Ghats",
      "Courtallam spa waterfalls within minutes of Tenkasi Junction",
      "Cool mountain air, wild cardamom forests, and misty tunnels",
      "Connects heritage Pandyan shrines with Travancore rain shadow valleys"
    ],
    stops: [
      {
        name: "Virudhunagar Junction",
        code: "VPT",
        district: "Virudhunagar",
        slug: "virudhunagar",
        description: "Commercial transit hub where the Ghats mountain line branches westward from the Madurai trunk route.",
        latitude: 9.5872,
        longitude: 77.9575,
        stationType: "Junction Interchange",
        heritageFact: "Historically connected trading caravans from the interior plains toward the mountain passes."
      },
      {
        name: "Rajapalayam",
        code: "RJPM",
        district: "Virudhunagar",
        slug: "rajapalayam",
        description: "Textile town at the foot of the Western Ghats, famous for its indigenous hound dog breed and mango orchards.",
        latitude: 9.4532,
        longitude: 77.5539,
        stationType: "Foothill Town Station",
        heritageFact: "Gateway to the Ayyanar Falls and the dense Grizzled Squirrel Wildlife Sanctuary."
      },
      {
        name: "Sankarankovil",
        code: "SNKL",
        district: "Tenkasi",
        slug: "sankarankovil",
        description: "Temple town celebrated for the Sankaranarayanaswamy Temple uniting Shiva and Vishnu.",
        latitude: 9.1724,
        longitude: 77.5321,
        stationType: "Pilgrim Station",
        heritageFact: "Pilgrims travel by rail for the Adi Thapasu festival celebrated every monsoon."
      },
      {
        name: "Tenkasi Junction",
        code: "TSI",
        district: "Tenkasi",
        slug: "tenkasi",
        description: "Kasi Viswanathar temple hub and transit station for Courtallam medicinal waterfalls.",
        latitude: 8.9592,
        longitude: 77.3149,
        stationType: "Scenic Foothill Junction",
        heritageFact: "Surrounded by coconut groves and seasonal waterfalls cascading during the southwest monsoon."
      },
      {
        name: "Sengottai (Shencottah)",
        code: "SCT",
        district: "Tenkasi",
        slug: "sengottai",
        description: "The mountain threshold terminus before trains ascend into the Western Ghats rainforest tunnels.",
        latitude: 8.9818,
        longitude: 77.2458,
        stationType: "Mountain Gateway Station",
        heritageFact: "Historically served as the crucial customs and transit post between Madras Presidency and Travancore Kingdom."
      },
      {
        name: "Aryankavu 13-Arch Viaduct",
        code: "AYV",
        district: "Kollam Border",
        slug: "aryankavu",
        description: "Iconic 1904 architectural stone masonry viaduct spanning over tropical gorges.",
        latitude: 8.9744,
        longitude: 77.1425,
        stationType: "Heritage Mountain Pass",
        heritageFact: "Built completely from lime mortar and mountain granite without steel reinforcements, standing strong for 120+ years."
      }
    ]
  }
};
