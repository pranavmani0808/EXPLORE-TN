-- ========================================================
-- ExploreTN — Seed Data for Tamil Nadu Places & Routes
-- ========================================================

-- Seed Tamil Nadu Places
INSERT INTO public.places (name, tamil_name, district, category, description, latitude, longitude, address, opening_hours, entry_fee, rating, status) VALUES
('Meenakshi Amman Temple', 'மீனாட்சி அம்மன் கோவில்', 'Madurai', 'Temple', 'Historic Dravidian temple complex featuring 14 magnificent gopurams and thousands of intricate sculptures dedicated to Goddess Meenakshi and Lord Sundareswarar.', 9.9195, 78.1193, 'Madurai Main, Tamil Nadu 625001', '5:00 AM - 12:30 PM, 4:00 PM - 9:30 PM', 'Free Entry', 4.95, 'published'),
('Puthu Mandapam Ancient Thrift Bazaar', 'புது மண்டபம் ஆடை தைப்பகம்', 'Madurai', 'Thrift Street', 'Historic 400-year-old pillared hall directly facing East Gopuram, filled with heritage tailoring shops, silk artisans, and traditional brassware craftsmen.', 9.9198, 78.1210, 'Opp. East Tower, Madurai 625001', '9:30 AM - 9:00 PM', 'Free Entry', 4.85, 'published'),
('Famous Jigarthanda Town Hall Road', 'ஃபேமஸ் ஜிகர்தண்டா', 'Madurai', 'Food Spot', 'Legendary street beverage made with almond gum (badam pisin), nannari syrup, sweetened milk, and homemade basundi ice cream.', 9.9160, 78.1140, 'Town Hall Road, Madurai 625001', '10:00 AM - 11:00 PM', '₹70 - ₹120', 4.90, 'published'),
('Konar Mess — Famous Kari Dosa', 'கோனார் மெஸ் - கரி தோசை', 'Madurai', 'Food Spot', 'World-famous 3-layered Kari Dosa featuring thick omelette, minced mutton fry, and crispy dosa base.', 9.9210, 78.1180, 'North Veli Street, Madurai 625001', '12:00 PM - 11:00 PM', '₹220', 4.88, 'published'),
('Srivilliputhur Andal Temple', 'ஸ்ரீவில்லிபுத்தூர் ஆண்டாள் கோவில்', 'Madurai', 'Temple', 'Towering 192 ft gopuram featured in the official Emblem of Tamil Nadu, birthplace of Poet-Saint Andal.', 9.5097, 77.9514, 'Srivilliputhur, Virudhunagar/Madurai Region', '6:00 AM - 1:00 PM, 4:00 PM - 8:30 PM', 'Free Entry', 4.92, 'published'),
('Kolli Hills 70 Hairpin Pass', 'கொல்லி மலை 70 வளைவுப் பாதை', 'Namakkal', 'Hill Station', 'Thrilling 70 continuous hairpin bends climbing to 1,300 meters through dense evergreen shola forests and waterfall view points.', 11.2333, 78.3333, 'Kolli Hills Pass, Namakkal 637411', 'Open 24/7 (Daytime recommended)', 'Free Access', 4.90, 'published'),
('Ekambareswarar Temple', 'ஏகாம்பரேஸ்வரர் திருக்கோவில்', 'Kancheepuram', 'Temple', 'Pancha Bhoota Earth (Prithvi) Stalam with 3,500-year sacred mango tree and sand lingam sculpted by Goddess Parvati.', 12.8475, 79.6997, 'Sannathi St, Periya Kanchipuram 631502', '6:00 AM - 12:30 PM, 4:00 PM - 8:30 PM', 'Free Entry', 4.90, 'published'),
('Jambukeswarar Temple', 'ஜம்புகேஸ்வரர் திருக்கோவில்', 'Tiruchirappalli', 'Temple', 'Pancha Bhoota Water (Appu) Stalam on Srirangam island with perennial natural spring continuously submerging the sanctum lingam.', 10.8534, 78.7054, 'Thiruvanaikaval, Trichy 620005', '5:30 AM - 1:00 PM, 3:00 PM - 9:00 PM', 'Free Entry', 4.85, 'published'),
('Arunachaleswarar Temple', 'அருணாசலேஸ்வரர் திருக்கோவில்', 'Tiruvannamalai', 'Temple', 'Pancha Bhoota Fire (Agni) Stalam at the base of Arunachala Hill featuring a 217-foot Rajagopuram and 14km Giri Pradakshina circuit.', 12.2319, 79.0677, 'Pavazhakundur, Tiruvannamalai 606601', '5:30 AM - 12:30 PM, 3:30 PM - 9:30 PM', 'Free Entry', 4.95, 'published'),
('Srikalahasteeswara Temple', 'ஸ்ரீகாளஹஸ்தீஸ்வரர் திருக்கோவில்', 'Tirupati', 'Temple', 'Pancha Bhoota Air (Vayu) Stalam with perpetually flickering sanctum flame without wind and world-renowned Rahu-Ketu Kshetram.', 13.7498, 79.6984, 'Srikalahasti, Andhra Pradesh 517644', '6:00 AM - 9:00 PM', 'Free Entry', 4.85, 'published'),
('Thillai Nataraja Temple', 'தில்லை நடராஜர் திருக்கோவில்', 'Cuddalore', 'Temple', 'Pancha Bhoota Space (Akasha) Stalam in Chidambaram with gold-tiled Chit Sabha, cosmic dancing Nataraja, and Chidambara Rahasyam.', 11.3992, 79.6934, 'East Car St, Chidambaram 608001', '6:00 AM - 12:00 PM, 5:00 PM - 10:00 PM', 'Free Entry', 4.92, 'published')
ON CONFLICT DO NOTHING;

-- Seed Routes
INSERT INTO public.routes (title, tamil_title, origin, destination, distance_km, duration, difficulty, district, hairpin_bends, status) VALUES
('The 70 Hairpin Pass — Kolli Hills', 'கொல்லி மலை 70 வளைவுப் பாதை', 'Semmedu', 'Solakkadu', 46.5, '1h 45m', 'challenging', 'Namakkal', 70, 'active'),
('Madurai Heritage & Night Food Trail', 'மதுரை பாரம்பரிய & இரவு உணவுப் பாதை', 'Meenakshi Temple', 'Town Hall Road', 5.2, '45m', 'easy', 'Madurai', 0, 'active'),
('Nilgiri Mountain Pass — Ooty Circuit', 'நீலகிரி மலைப் பாதை', 'Mettupalayam', 'Ooty Lake', 53.8, '2h 15m', 'moderate', 'Nilgiris', 36, 'active')
ON CONFLICT DO NOTHING;
