import fs from "fs";

/**
 * Dedicated curated authentic photos for Tamil Nadu places matching categories:
 * - Temples (Gopuram, Sanctum, Dravidian Architecture)
 * - Hill stations (Misty Peaks, Tea Plantations, Shola Valleys)
 * - Waterfalls (Cascading Streams, Forest Plunges)
 * - Beaches (Shorelines, Coastal Promenades)
 * - Forts & Palaces (Granite Ramparts, Carved Pillars)
 * - Food & Markets (Banana Leaf Feasts, Street Bazaars)
 * - Dams & Lakes (Reservoirs, Boat Houses)
 */

export const REAL_PLACE_IMAGES: Record<string, string> = {
  // Temples
  "Alagar Kovil": "https://upload.wikimedia.org/wikipedia/commons/b/b5/AzhagarKovil_Madurai.JPG",
  "Palani Murugan Temple": "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1200&q=80",
  "Tiruvannamalai": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Tiruvannamalai_Montage.jpg/1280px-Tiruvannamalai_Montage.jpg",
  "Ekambareswarar Temple": "https://upload.wikimedia.org/wikipedia/commons/0/06/Ekambareswarar5.jpg",
  "Arunachaleswarar Temple": "https://upload.wikimedia.org/wikipedia/commons/2/26/Arunachalam_temple_from_a_nearby_hill.jpg",
  "Thillai Nataraja Temple": "https://upload.wikimedia.org/wikipedia/commons/4/44/Le_temple_de_Shiva_Nataraja_%28Chidambaram%2C_Inde%29_%2814037020332%29.jpg",
  "Chidambaram Thillai Nataraja Temple": "https://upload.wikimedia.org/wikipedia/commons/4/44/Le_temple_de_Shiva_Nataraja_%28Chidambaram%2C_Inde%29_%2814037020332%29.jpg",
  "Velliangiri Hills": "https://upload.wikimedia.org/wikipedia/commons/8/83/Velliangiri_Mountains.jpg",
  "Palamalai": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
  "Kapaleeshwarar Temple": "https://upload.wikimedia.org/wikipedia/commons/9/99/Kapaleeswarar1.jpg",
  "Kapaleeshwarar Temple (Mylapore)": "https://upload.wikimedia.org/wikipedia/commons/9/99/Kapaleeswarar1.jpg",
  "Airavatesvara Temple": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
  "Kanchi Kamakshi Amman Temple": "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1200&q=80",
  "Kamakshi Amman Temple": "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1200&q=80",
  "Kailasanathar Temple": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
  "Varadharaja Perumal Temple": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
  "Sikkal Singaravelar Temple": "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1200&q=80",
  "Samayapuram Mariamman Temple": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
  "Suchindram Thanumalayan Temple": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
  "Thirukadaiyur Temple": "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1200&q=80",
  "Mayuranathaswamy Temple": "https://upload.wikimedia.org/wikipedia/commons/f/fd/Thiruvenkadu_%285%29.jpg",
  "Mayuranathaswamy Temple & Poompuhar Beach": "https://upload.wikimedia.org/wikipedia/commons/f/fd/Thiruvenkadu_%285%29.jpg",
  "Vaitheeswaran Koil": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
  "Thiruvarur Thyagaraja Temple": "https://upload.wikimedia.org/wikipedia/commons/0/07/Thiruvarur001.jpg",
  "Thyagaraja Swamy Temple & Kamalalayam Tank": "https://upload.wikimedia.org/wikipedia/commons/0/07/Thiruvarur001.jpg",
  "Gangaikonda Cholapuram Temple": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/GangaiKonda_Cholapuram%28Front_View%29.JPG/1280px-GangaiKonda_Cholapuram%28Front_View%29.JPG",
  "Mahabalipuram Shore Temple": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
  "Bhavani Sangameswarar Temple (Kooduthurai)": "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1200&q=80",
  "Ramanathaswamy Temple & 22 Theerthams": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
  "Srirangam Ranganathaswamy Temple": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
  "Rockfort Ucchi Pillayar Temple": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80",
  "Nellaiappar & Kanthimathi Temple": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
  "Annamalaiyar Temple & 217ft Rajagopuram": "https://upload.wikimedia.org/wikipedia/commons/2/26/Arunachalam_temple_from_a_nearby_hill.jpg",
  "Arulmigu Meenakshi Sundareswarar Temple": "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1200&q=80",
  "Kurinji Andavar Temple": "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=1200&q=80",
  "Kuzhanthai Velappar Temple (Poombarai)": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  "Elk Hill Murugan Temple": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
  "Brihadeeswarar Temple (Thanjavur Big Temple)": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Thanjavur_2.jpg/1280px-Thanjavur_2.jpg",
  "Pasupatheeswarar Temple": "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
  "Namakkal Monolithic Anjaneyar Temple & Rock Fort": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80",
  "Mahendravadi Pallava Cave Temple & Arcot Gate": "https://upload.wikimedia.org/wikipedia/commons/8/8c/Rock_Cut_Temple.jpeg",
  "Avinashi Lingeshwarar Temple & Nanjarayan Sanctuary": "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1200&q=80",
  "Srivilliputhur Andal Temple & Vatapatrasayee Temple": "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1200&q=80",
  "Kulasekarapattinam": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
  "Vallimalai Hills": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",

  // Hill stations, gardens & nature
  "Government Botanical Garden Ooty": "https://upload.wikimedia.org/wikipedia/commons/c/c1/Botanical_Gardens_-_Ootacamund_%28Ooty%29_-_India_03.JPG",
  "Government Botanical Garden": "https://upload.wikimedia.org/wikipedia/commons/c/c1/Botanical_Gardens_-_Ootacamund_%28Ooty%29_-_India_03.JPG",
  "Ooty Tea Factory": "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=1200&q=80",
  "Tea & Chocolate Factory": "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=1200&q=80",
  "Bryant Park Botanical Garden": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  "Chettiar Park": "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
  "Sim's Park Coonoor": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  "Government Orange Farm (Burliar)": "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?auto=format&fit=crop&w=1200&q=80",
  "Tirumala Alipiri Footpath": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",

  // Dams & Reservoirs
  "Aliyar Dam": "https://upload.wikimedia.org/wikipedia/commons/f/f5/Aliyar-Dam-TopView.jpg",
  "Bhavanisagar Dam": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/BhavaniSagarDam.JPG/1280px-BhavaniSagarDam.JPG",
  "Chembarambakkam Lake Walkway": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",

  // Beaches
  "Mahabalipuram Beach": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  "Mahabalipuram Beach (Mamallapuram)": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",

  // Forts & Heritage Sites
  "Thanjavur": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Thanjavur_2.jpg/1280px-Thanjavur_2.jpg",
  "Ramanathapuram": "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80",
  "Dindigul Fort": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80",
  "Thanjavur Maratha Palace": "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80",
  "Tirumayam Fort": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80",
  "Attur Fort": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80",
  "Ranjankudi Fort": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Ranjankudi_Fort-Perambalur_district-Tamil_Nadu.jpg/1280px-Ranjankudi_Fort-Perambalur_district-Tamil_Nadu.jpg",
  "Gingee Fort (Rajagiri & Krishnagiri Citadel)": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80",
  "Vellore Fort & Jalakanteswarar Temple": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80",
  "Karaikudi Chettinad Palace & Heritage Mansions": "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80",
  "Sittannavasal Cave Frescoes & Thirumayam Fort": "https://upload.wikimedia.org/wikipedia/commons/8/8c/Rock_Cut_Temple.jpeg",
  "Adiyogi Shiva Statue (Isha Yoga Center)": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
  "Pamban Sea Bridge & Cantilever Rail Span": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
  "DakshinaChitra": "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80",
  "Kamarajar Memorial House & Museum": "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80",
  "Sriperumbudur": "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1200&q=80",
  "Adyar": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  "Mylapore": "https://upload.wikimedia.org/wikipedia/commons/f/f1/Mylapore_Theppam_Festival.jpg",

  // Food & Markets
  "South Indian Breakfast Experience": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80",
  "South Indian Lunch Experience": "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=1200&q=80",
  "Sowcarpet": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
  "Mylapore Traditional Market": "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&w=1200&q=80",
  "Vilakkuthoon & Chithirai Street Brass Market": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
  "VGP Universal Kingdom": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
};

export function getCuratedPlaceImage(placeName: string, category?: string): string {
  // 1. Direct match
  if (REAL_PLACE_IMAGES[placeName]) {
    return REAL_PLACE_IMAGES[placeName];
  }

  // 2. Substring matching
  const lower = placeName.toLowerCase();
  for (const [key, url] of Object.entries(REAL_PLACE_IMAGES)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return url;
    }
  }

  // 3. Category based themed photo
  const cat = (category || "").toLowerCase();
  if (cat.includes("temple") || cat.includes("spiritual")) {
    return "https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1200&q=80";
  }
  if (cat.includes("hill") || cat.includes("mountain") || cat.includes("nature")) {
    return "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80";
  }
  if (cat.includes("fall") || cat.includes("waterfall")) {
    return "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80";
  }
  if (cat.includes("beach") || cat.includes("coastal")) {
    return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80";
  }
  if (cat.includes("food")) {
    return "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=1200&q=80";
  }
  if (cat.includes("fort") || cat.includes("heritage") || cat.includes("palace")) {
    return "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80";
  }
  if (cat.includes("shopping") || cat.includes("thrift")) {
    return "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80";
  }

  return "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80";
}
