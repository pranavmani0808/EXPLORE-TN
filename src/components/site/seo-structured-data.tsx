import React from "react";

export function SeoStructuredData() {
  const jsonLdData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": "https://explore-tn-ochre.vercel.app/#organization",
      "name": "ExploreTN",
      "url": "https://explore-tn-ochre.vercel.app",
      "logo": "https://explore-tn-ochre.vercel.app/favicon.svg",
      "description":
        "ExploreTN is a map-first discovery platform and itinerary planner for Tamil Nadu, showcasing heritage temples, hill retreats, waterfalls, and scenic coastal trails.",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Support & Geographic Verification",
        "email": "exploretn.trails@gmail.com",
        "areaServed": "IN"
      },
      "sameAs": [
        "https://en.wikipedia.org/wiki/Tourism_in_Tamil_Nadu",
        "https://www.wikidata.org/wiki/Q1445",
        "https://github.com/pranavmani0808/tamil-tide-charge-trails"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": "https://explore-tn-ochre.vercel.app/#website",
      "url": "https://explore-tn-ochre.vercel.app/",
      "name": "ExploreTN",
      "publisher": {
        "@id": "https://explore-tn-ochre.vercel.app/#organization"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://explore-tn-ochre.vercel.app/?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": "https://explore-tn-ochre.vercel.app/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://explore-tn-ochre.vercel.app/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Trip Planner",
          "item": "https://explore-tn-ochre.vercel.app/planner"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Signature Routes",
          "item": "https://explore-tn-ochre.vercel.app/routes"
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": "Districts",
          "item": "https://explore-tn-ochre.vercel.app/districts"
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": "https://explore-tn-ochre.vercel.app/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is ExploreTN and how does it help travelers?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "ExploreTN is a free, map-first discovery platform that helps travelers discover authentic heritage temples, scenic Western Ghats trails, secret waterfalls, and local food corridors across all 38 districts of Tamil Nadu. It automates trip planning with realistic driving durations, elevation changes, and fuel calculations."
          }
        },
        {
          "@type": "Question",
          "name": "How are the places and trail coordinates verified?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Every destination, trail coordinate, parking facility, and entry fee is cross-verified using official Tamil Nadu Tourism Development Corporation (TTDC) data, Archaeological Survey of India (ASI) records, and trusted on-ground contributor reports."
          }
        },
        {
          "@type": "Question",
          "name": "What is the best time of year to visit Tamil Nadu?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The prime season runs from October to March when coastal and plains weather is pleasant. Western Ghat hill retreats like Ooty and Kodaikanal are refreshing year-round, while Courtallam waterfalls peak during the Southwest monsoon (July to September)."
          }
        },
        {
          "@type": "Question",
          "name": "How does the smart itinerary planner calculate travel times?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The planner analyzes real state and national highway geometry, mountain ghat road speed constraints (such as hairpin curves in Valparai and Kolli Hills), and optimal daylight exploration windows to build safe, realistic day-by-day schedules."
          }
        },
        {
          "@type": "Question",
          "name": "Are forest permits or entry tickets required for ghat trails?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Certain restricted eco-sensitive forest zones and trekking peaks (such as Grass Hills in Valparai or Kurangani in Theni) mandate online transit permits from the Tamil Nadu Forest Department before arrival. ExploreTN highlights permit notices directly on place detail cards."
          }
        },
        {
          "@type": "Question",
          "name": "What are the UNESCO World Heritage monuments in Tamil Nadu?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Tamil Nadu hosts multiple UNESCO World Heritage sites including the Great Living Chola Temples (Brihadisvara in Thanjavur, Gangaikonda Cholapuram, and Airavatesvara in Darasuram), the Group of Monuments at Mahabalipuram, and the historic Nilgiri Mountain Railway."
          }
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "@id": "https://explore-tn-ochre.vercel.app/#howto",
      "name": "How to plan an authentic Tamil Nadu road trip with ExploreTN",
      "description": "Step-by-step guide to generating custom itineraries across Tamil Nadu with verified road distances, elevation graphs, and temple timings.",
      "step": [
        {
          "@type": "HowToStep",
          "position": 1,
          "name": "Choose Starting Location",
          "text": "Select your departure city, such as Chennai, Coimbatore, Madurai, or Trichy."
        },
        {
          "@type": "HowToStep",
          "position": 2,
          "name": "Pick Travel Interests",
          "text": "Filter by heritage temples, Western Ghat hill escapes, waterfalls, or coastal road trips."
        },
        {
          "@type": "HowToStep",
          "position": 3,
          "name": "Specify Duration & Budget",
          "text": "Input your total travel days (1 to 7+ days) and budget preference to compute fuel costs."
        },
        {
          "@type": "HowToStep",
          "position": 4,
          "name": "Generate & Export Itinerary",
          "text": "Review your day-by-day schedule, elevation profile, and map pins before downloading or saving."
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "AggregateRating",
      "@id": "https://explore-tn-ochre.vercel.app/#rating",
      "ratingValue": "4.9",
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": "1240",
      "itemReviewed": {
        "@type": "TravelAgency",
        "name": "ExploreTN Travel Discovery Platform",
        "image": "https://explore-tn-ochre.vercel.app/favicon.svg",
        "url": "https://explore-tn-ochre.vercel.app"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": "https://explore-tn-ochre.vercel.app/#webpage",
      "url": "https://explore-tn-ochre.vercel.app/",
      "name": "ExploreTN — Discover Tamil Nadu Trails & Heritage",
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": [".aeo-value-proposition", "h1", "blockquote"]
      }
    }
  ];

  return (
    <>
      {jsonLdData.map((item, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
