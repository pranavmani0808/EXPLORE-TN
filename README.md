# Tamil Nadu Explorer

ExplorerTN – Premium Travel Discovery Platform UI/UX Prompt

Design a world-class, premium travel discovery platform focused exclusively on Tamil Nadu. The experience should feel like a blend of Apple Maps, Airbnb, Strava, Notion, Instagram Explore, and Google Earth, while maintaining its own unique identity.

The product is not a booking website.

It is an Explorer Platform where users discover hidden places, scenic roads, trekking trails, waterfalls, temples, local food, beaches, mountain viewpoints, off-road adventures, and cultural experiences.

Design Philosophy

The interface should evoke the feeling of adventure, exploration, curiosity, and premium craftsmanship.

When users open the website, they should immediately want to explore Tamil Nadu.

Avoid generic travel website layouts.

The interface should be immersive, map-first, and visually rich.

Use generous whitespace, elegant typography, smooth animations, glassmorphism where appropriate, subtle gradients, rounded corners, and premium card designs.

Focus heavily on user experience and information hierarchy.

Every interaction should feel polished.

Color Palette

Inspired by Tamil Nadu's landscapes.

Primary:

Forest Green

Deep Ocean Blue

Secondary:

Sand Beige

Mountain Gray

Sunset Orange

Accent:

Emerald

Golden Yellow

Dark mode should be the default experience.

Provide a complete light mode with excellent accessibility.

Typography

Modern premium typography.

Large hero headings.

Clean sans-serif fonts.

Excellent spacing.

Readable body text.

Clear visual hierarchy.

Landing Page

Create a stunning landing page containing:

• Full-screen hero section

• Interactive animated Tamil Nadu map

• Large intelligent search bar

Search examples:

"Weekend bike ride"

"Hidden waterfalls"

"Best food in Madurai"

"Temples near Thanjavur"

"Sunrise trekking"

"Photography spots"

Below the hero:

Trending Destinations

Hidden Gems

Scenic Routes

Weekend Trips

Food Trails

Temple Trails

Mountain Adventures

Coastal Explorer

Photography Spots

Travel Stories

Community Picks

The homepage should feel alive with motion and discovery.

Navigation

Minimal floating navigation.

Logo

Explore

Routes

Categories

AI Planner

Community

Profile

Notifications

Search always visible.

Sticky navigation while scrolling.

Interactive Map

The map is the heart of the platform.

Fullscreen experience.

Smooth zoom.

Beautiful custom map styling.

Custom animated markers.

Layer controls.

Categories:

Waterfalls

Temples

Food

Hills

Photography

Camping

Off-road

Beaches

Sunrise

Sunset

Hidden Places

Treks

Users can toggle layers.

Hovering a marker displays a beautiful preview card.

Clicking opens a premium place page.

Place Detail Page

Design one of the most beautiful place pages possible.

Large hero image.

Image gallery.

Overview.

Story behind the location.

Google navigation button.

Difficulty.

Best season.

Road condition.

Parking.

Entry fee.

Timings.

Safety.

Weather.

Nearby attractions.

Nearby food.

Nearby fuel stations.

Suggested scenic routes.

Reviews.

User photos.

Travel tips.

Related destinations.

Everything should be presented as elegant cards with smooth animations.

Explorer Categories

Design category pages for:

Hidden Places

Waterfalls

Temples

Hill Stations

Camping

Food

Bike Routes

Car Routes

Off-road Adventures

Photography

Beaches

Sunrise

Sunset

Village Experiences

Each category should have unique hero artwork and layouts.

AI Trip Planner

Design a futuristic AI planner.

Chat interface.

Interactive itinerary timeline.

Budget estimation.

Fuel estimation.

Weather.

Packing checklist.

Travel timeline.

Interactive route map.

Download itinerary.

Share itinerary.

Route Explorer

One of the flagship experiences.

Timeline layout.

Map synchronization.

Each stop has:

Photo

Description

Distance

Fuel estimate

Time

Food recommendation

Scenic viewpoint

Rest stop

Weather

Photography tip

The timeline animates while scrolling.

Community

Instagram-quality travel feed.

Large photo cards.

Travel journals.

Collections.

Saved places.

Explorer profiles.

Achievements.

Badges.

Followers.

Travel stories.

Photo grids.

User Profile

Explorer level.

Travel statistics.

Visited places.

Wishlist.

Saved routes.

Photos.

Reviews.

Achievements.

Followers.

Following.

Travel map showing explored locations.

Search Experience

Universal search.

Instant suggestions.

Categories.

Cities.

Districts.

Temples.

Waterfalls.

Food.

Trails.

Recent searches.

Popular searches.

Beautiful floating search panel.

Microinteractions

Everything should feel alive.

Hover effects.

Animated cards.

Map transitions.

Page transitions.

Skeleton loading.

Smooth scrolling.

Glass blur.

Floating buttons.

Parallax hero sections.

Framer Motion quality animations.

Responsive Design

Desktop-first.

Tablet optimized.

Premium mobile experience.

Bottom navigation on mobile.

Gesture-friendly interactions.

Accessibility

WCAG compliant.

Keyboard navigation.

High contrast.

Large touch targets.

Readable typography.

Technical Design System

Generate:

Complete design system

Color tokens

Typography scale

8px spacing system

Component library

Iconography

Button variants

Card variants

Form styles

Modal styles

Empty states

Loading states

Error states

Success states

Responsive breakpoints

Use modern Next.js App Router architecture, Tailwind CSS, shadcn/ui components, Framer Motion animations, Lucide icons, and a scalable component structure.

The final result should feel polished enough to compete visually with Apple's products, Airbnb, Strava, and other premium consumer applications while establishing a unique visual identity centered around exploration, adventure, and the culture of Tamil Nadu.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bd0f319c-8e2f-4df8-b799-f46385ac4382).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Frontend is Vite + TanStack Start. Backend is FastAPI. The Vite dev server proxies `/api`, `/healthz` and `/readyz` to `http://127.0.0.1:8000`.

```sh
# Frontend
npm i
npm run dev

# Backend (separate terminal)
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
```

Copy `.env.example` to `.env` for local secrets. Never commit live API keys.

Honest remaining work lives in [`docs/PUNCHLIST.md`](docs/PUNCHLIST.md).
