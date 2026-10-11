/*
  Product catalogue for Adil Child Care Clinic & Pharmacy.

  HOW TO EDIT
  - Add a product: copy any line in `products` and change the values.
      id        unique, lowercase, dashes only (used in the page address)
      name      full name shown to customers
      brand     short name printed on the product picture
      strength  e.g. "500mg" or "120mg/5ml" (can be "")
      generic   active ingredient(s)
      form      tablet | capsule | syrup | suspension | drops | spray | cream | ointment | gel |
                inhaler | nebule | sachet | lozenge | effervescent | vial | tin | pack | jar |
                bottle | device | supply | toothpaste | toothbrush | mouthwash | soap |
                shampoo | lotion | handwash | sanitizer | powder | diaper | wipes | pads | razor
      unit      what one cart item means: Strip, Bottle, Tube, Pack, Box, Tin, Piece, Jar, Sachet
      cat       category id (see `categories`)
      mfr       manufacturer id (see `manufacturers`)
      rx        true = prescription required
      kids      true = suitable for / made for children
      price     retail price (MRP) in rupees for one unit, or null to show "Price on request"
      pack      what is inside one unit, e.g. "10 tablets", "90ml", "20g" (can be left out)
      use       one short sentence about what it is used for
      featured  true = show in "Popular medicines" on the home page
      image     optional link to a product photo on another website (https://...).
                Photos saved in assets/products/<id>.jpg are better: they never break.
  - After editing, run:  node scripts/build.mjs
*/
(function (root, factory) {
  var data = factory();
  if (typeof module === "object" && module.exports) module.exports = data;
  else root.STORE_DATA = data;
})(this, function () {
  "use strict";

  var categories = [
    { id: "fever-pain", name: "Fever & Pain", urdu: "بخار اور درد", icon: "thermo" },
    { id: "cough-cold", name: "Cough, Cold & Flu", urdu: "کھانسی اور نزلہ زکام", icon: "wind" },
    { id: "allergy-asthma", name: "Allergy & Asthma", urdu: "الرجی اور دمہ", icon: "lungs" },
    { id: "stomach", name: "Stomach & Digestion", urdu: "معدہ اور ہاضمہ", icon: "utensils" },
    { id: "antibiotics", name: "Antibiotics", urdu: "اینٹی بائیوٹکس", icon: "pill" },
    { id: "kids", name: "Kids' Medicines", urdu: "بچوں کی ادویات", icon: "baby", virtual: true },
    { id: "vitamins", name: "Vitamins & Nutrition", urdu: "وٹامنز اور غذائیت", icon: "sparkle" },
    { id: "diabetes", name: "Diabetes Care", urdu: "شوگر", icon: "droplet" },
    { id: "heart-bp", name: "Heart & Blood Pressure", urdu: "دل اور بلڈ پریشر", icon: "heart" },
    { id: "skin", name: "Skin Care", urdu: "جلد کی نگہداشت", icon: "bandage" },
    { id: "eye-ear-nose", name: "Eye, Ear & Nose", urdu: "آنکھ، کان اور ناک", icon: "eye" },
    { id: "baby", name: "Baby Care", urdu: "نومولود کی دیکھ بھال", icon: "bottle" },
    { id: "diapers", name: "Diapers & Wipes", urdu: "ڈائپرز اور وائپس", icon: "baby" },
    { id: "oral-care", name: "Oral Care", urdu: "دانتوں کی صفائی", icon: "smile" },
    { id: "personal-care", name: "Personal Care & Hygiene", urdu: "ذاتی صفائی", icon: "droplet" },
    { id: "herbal", name: "Herbal & Desi Remedies", urdu: "دیسی اور ہربل", icon: "leaf" },
    { id: "first-aid", name: "First Aid & Supplies", urdu: "فرسٹ ایڈ", icon: "kit" },
    { id: "devices", name: "Medical Devices", urdu: "طبی آلات", icon: "pulse" }
  ];

  var manufacturers = [
    { id: "gsk", name: "GSK", full: "GlaxoSmithKline Pakistan" },
    { id: "haleon", name: "Haleon", full: "Haleon Pakistan" },
    { id: "abbott", name: "Abbott", full: "Abbott Laboratories (Pakistan)" },
    { id: "getz", name: "Getz Pharma", full: "Getz Pharma" },
    { id: "searle", name: "Searle", full: "The Searle Company" },
    { id: "martindow", name: "Martin Dow", full: "Martin Dow Limited" },
    { id: "sami", name: "Sami", full: "Sami Pharmaceuticals" },
    { id: "hilton", name: "Hilton Pharma", full: "Hilton Pharma" },
    { id: "novartis", name: "Novartis", full: "Novartis Pharma Pakistan" },
    { id: "sanofi", name: "Sanofi", full: "Sanofi" },
    { id: "pfizer", name: "Pfizer", full: "Pfizer" },
    { id: "bayer", name: "Bayer", full: "Bayer Pakistan" },
    { id: "msd", name: "MSD", full: "MSD (Merck Sharp & Dohme), marketed by OBS Pakistan" },
    { id: "highnoon", name: "Highnoon", full: "Highnoon Laboratories" },
    { id: "reckitt", name: "Reckitt", full: "Reckitt" },
    { id: "pg", name: "P&G", full: "Procter & Gamble" },
    { id: "nestle", name: "Nestlé", full: "Nestlé Pakistan" },
    { id: "kenvue", name: "Johnson's", full: "Kenvue (Johnson's)" },
    { id: "hamdard", name: "Hamdard", full: "Hamdard Laboratories (Waqf) Pakistan" },
    { id: "qarshi", name: "Qarshi", full: "Qarshi Industries" },
    { id: "engelhard", name: "Engelhard", full: "Engelhard Arzneimittel, marketed by Highnoon Laboratories" },
    { id: "leo", name: "LEO Pharma", full: "LEO Pharma, marketed by Zam Zam Pharma" },
    { id: "alcon", name: "Alcon", full: "Alcon, distributed by Novartis Pakistan" },
    { id: "allergan", name: "Allergan", full: "Allergan (AbbVie)" },
    { id: "brookes", name: "Brookes Pharma", full: "Brookes Pharma" },
    { id: "roche", name: "Roche", full: "Roche Diabetes Care (Accu-Chek)" },
    { id: "omron", name: "Omron", full: "Omron Healthcare" },
    { id: "beiersdorf", name: "Beiersdorf", full: "Beiersdorf (Nivea, Hansaplast)" },
    { id: "unilever", name: "Unilever", full: "Unilever Pakistan" },
    { id: "colgate", name: "Colgate-Palmolive", full: "Colgate-Palmolive Pakistan" },
    { id: "hayat", name: "Hayat Kimya", full: "Hayat Kimya (Molfix)" },
    { id: "pigeon", name: "Pigeon", full: "Pigeon Corporation" },
    { id: "various", name: "Various", full: "Various manufacturers", hidden: true }
  ];

  var P = function (o) {
    return {
      id: o.id, name: o.name, brand: o.brand, strength: o.strength || "", generic: o.generic,
      form: o.form, unit: o.unit, cat: o.cat, mfr: o.mfr, rx: !!o.rx, kids: !!o.kids,
      price: o.price == null ? null : o.price, use: o.use, featured: !!o.featured,
      pack: o.pack || "", image: o.image || null
    };
  };

  var products = [
    /* ---------- Fever & Pain ---------- */
    P({ id: "panadol-500mg-tablets", name: "Panadol 500mg Tablets", brand: "Panadol", strength: "500mg", generic: "Paracetamol", form: "tablet", unit: "Strip", cat: "fever-pain", mfr: "haleon", pack: "10 tablets", use: "Relief from fever, headache, toothache and body aches.", featured: true }),
    P({ id: "panadol-extra-tablets", name: "Panadol Extra Tablets", brand: "Panadol Extra", strength: "500mg/65mg", generic: "Paracetamol + Caffeine", form: "tablet", unit: "Strip", cat: "fever-pain", mfr: "haleon", pack: "10 tablets", use: "Extra-strength relief from headache and other pain." }),
    P({ id: "calpol-syrup-120mg", name: "Calpol Syrup 120mg/5ml", brand: "Calpol", strength: "120mg/5ml", generic: "Paracetamol", form: "syrup", unit: "Bottle", cat: "fever-pain", mfr: "haleon", kids: true, pack: "90ml", use: "Fever and pain relief for babies and young children.", featured: true }),
    P({ id: "calpol-6-plus-syrup", name: "Calpol 6 Plus Syrup 250mg/5ml", brand: "Calpol 6+", strength: "250mg/5ml", generic: "Paracetamol", form: "syrup", unit: "Bottle", cat: "fever-pain", mfr: "haleon", kids: true, pack: "90ml", use: "Fever and pain relief for children aged 6 years and over." }),
    P({ id: "brufen-400mg-tablets", name: "Brufen 400mg Tablets", brand: "Brufen", strength: "400mg", generic: "Ibuprofen", form: "tablet", unit: "Strip", cat: "fever-pain", mfr: "abbott", use: "Pain, fever and inflammation such as muscle and joint pain.", featured: true }),
    P({ id: "brufen-syrup", name: "Brufen Syrup 100mg/5ml", brand: "Brufen", strength: "100mg/5ml", generic: "Ibuprofen", form: "syrup", unit: "Bottle", cat: "fever-pain", mfr: "abbott", kids: true, use: "Fever and pain relief for children." }),
    P({ id: "disprin-300mg", name: "Disprin 300mg Dispersible Tablets", brand: "Disprin", strength: "300mg", generic: "Aspirin", form: "tablet", unit: "Strip", cat: "fever-pain", mfr: "reckitt", pack: "10 tablets", use: "Headache, toothache and fever relief for adults. Not for children under 16." }),
    P({ id: "ponstan-250mg-capsules", name: "Ponstan 250mg Capsules", brand: "Ponstan", strength: "250mg", generic: "Mefenamic acid", form: "capsule", unit: "Strip", cat: "fever-pain", mfr: "pfizer", pack: "10 capsules", use: "Relief from mild to moderate pain, including period pain." }),
    P({ id: "ponstan-forte-500mg", name: "Ponstan Forte 500mg Tablets", brand: "Ponstan Forte", strength: "500mg", generic: "Mefenamic acid", form: "tablet", unit: "Strip", cat: "fever-pain", mfr: "pfizer", pack: "10 tablets", use: "Relief from moderate pain, including period pain and toothache." }),
    P({ id: "synflex-550mg", name: "Synflex 550mg Tablets", brand: "Synflex", strength: "550mg", generic: "Naproxen sodium", form: "tablet", unit: "Strip", cat: "fever-pain", mfr: "martindow", rx: true, use: "Pain and inflammation, including joint, muscle and period pain." }),
    P({ id: "nuberol-tablets", name: "Nuberol Tablets", brand: "Nuberol", strength: "450mg/35mg", generic: "Paracetamol + Orphenadrine", form: "tablet", unit: "Strip", cat: "fever-pain", mfr: "searle", pack: "10 tablets", use: "Muscle pain, back pain and sprains." }),
    P({ id: "nuberol-forte-tablets", name: "Nuberol Forte Tablets", brand: "Nuberol Forte", strength: "650mg/50mg", generic: "Paracetamol + Orphenadrine", form: "tablet", unit: "Strip", cat: "fever-pain", mfr: "searle", use: "Stronger relief from muscle and back pain." }),
    P({ id: "voltral-50mg", name: "Voltral 50mg Tablets", brand: "Voltral", strength: "50mg", generic: "Diclofenac sodium", form: "tablet", unit: "Strip", cat: "fever-pain", mfr: "novartis", rx: true, use: "Joint pain, arthritis and inflammation." }),
    P({ id: "caflam-50mg", name: "Caflam 50mg Tablets", brand: "Caflam", strength: "50mg", generic: "Diclofenac potassium", form: "tablet", unit: "Strip", cat: "fever-pain", mfr: "novartis", rx: true, use: "Acute pain such as sprains, dental pain and period pain." }),
    P({ id: "dicloran-50mg", name: "Dicloran 50mg Tablets", brand: "Dicloran", strength: "50mg", generic: "Diclofenac sodium", form: "tablet", unit: "Strip", cat: "fever-pain", mfr: "sami", rx: true, use: "Pain and swelling in joints and muscles." }),

    /* ---------- Cough, Cold & Flu ---------- */
    P({ id: "panadol-cf-tablets", name: "Panadol CF Tablets", brand: "Panadol CF", generic: "Paracetamol cold & flu combination", form: "tablet", unit: "Strip", cat: "cough-cold", mfr: "haleon", pack: "10 tablets", use: "Relief from cold and flu symptoms: fever, blocked nose and body aches.", featured: true }),
    P({ id: "arinac-tablets", name: "Arinac Tablets", brand: "Arinac", strength: "200mg/30mg", generic: "Ibuprofen + Pseudoephedrine", form: "tablet", unit: "Strip", cat: "cough-cold", mfr: "abbott", pack: "10 tablets", use: "Relief from flu symptoms such as blocked nose, fever and headache." }),
    P({ id: "arinac-forte-tablets", name: "Arinac Forte Tablets", brand: "Arinac Forte", strength: "400mg/60mg", generic: "Ibuprofen + Pseudoephedrine", form: "tablet", unit: "Strip", cat: "cough-cold", mfr: "abbott", pack: "10 tablets", use: "Stronger relief from flu, sinus congestion and body aches." }),
    P({ id: "hydryllin-syrup", name: "Hydryllin Syrup", brand: "Hydryllin", generic: "Aminophylline + Diphenhydramine + Ammonium chloride", form: "syrup", unit: "Bottle", cat: "cough-cold", mfr: "searle", pack: "120ml", use: "Cough with chest congestion.", featured: true }),
    P({ id: "prospan-syrup", name: "Prospan Cough Syrup", brand: "Prospan", generic: "Ivy leaf dry extract", form: "syrup", unit: "Bottle", cat: "cough-cold", mfr: "engelhard", kids: true, pack: "120ml", use: "Herbal relief for chesty cough in children and adults.", featured: true }),
    P({ id: "strepsils-lozenges", name: "Strepsils Lozenges", brand: "Strepsils", generic: "Amylmetacresol + Dichlorobenzyl alcohol", form: "lozenge", unit: "Pack", cat: "cough-cold", mfr: "reckitt", use: "Soothing relief for sore throat." }),
    P({ id: "vicks-vaporub", name: "Vicks VapoRub", brand: "Vicks", strength: "VapoRub", generic: "Menthol + Camphor + Eucalyptus oil", form: "jar", unit: "Jar", cat: "cough-cold", mfr: "pg", use: "Rub on chest and back to ease blocked nose and cough. Not for children under 2." }),

    /* ---------- Allergy & Asthma ---------- */
    P({ id: "avil-25mg", name: "Avil 25mg Tablets", brand: "Avil", strength: "25mg", generic: "Pheniramine maleate", form: "tablet", unit: "Strip", cat: "allergy-asthma", mfr: "sanofi", pack: "10 tablets", use: "Allergies, itching, hives and runny nose. May cause drowsiness." }),
    P({ id: "telfast-120mg", name: "Telfast 120mg Tablets", brand: "Telfast", strength: "120mg", generic: "Fexofenadine", form: "tablet", unit: "Strip", cat: "allergy-asthma", mfr: "sanofi", use: "Non-drowsy relief from hay fever and allergic rhinitis." }),
    P({ id: "telfast-180mg", name: "Telfast 180mg Tablets", brand: "Telfast", strength: "180mg", generic: "Fexofenadine", form: "tablet", unit: "Strip", cat: "allergy-asthma", mfr: "sanofi", use: "Non-drowsy relief from hives and allergy symptoms." }),
    P({ id: "myteka-10mg", name: "Myteka 10mg Tablets", brand: "Myteka", strength: "10mg", generic: "Montelukast", form: "tablet", unit: "Strip", cat: "allergy-asthma", mfr: "hilton", rx: true, use: "Prevention of asthma and relief of allergic rhinitis." }),
    P({ id: "myteka-5mg-chewable", name: "Myteka 5mg Chewable Tablets", brand: "Myteka", strength: "5mg", generic: "Montelukast", form: "tablet", unit: "Strip", cat: "allergy-asthma", mfr: "hilton", rx: true, kids: true, use: "Asthma prevention for children, as prescribed." }),
    P({ id: "montiget-10mg", name: "Montiget 10mg Tablets", brand: "Montiget", strength: "10mg", generic: "Montelukast", form: "tablet", unit: "Strip", cat: "allergy-asthma", mfr: "getz", rx: true, use: "Prevention of asthma and relief of allergic rhinitis." }),
    P({ id: "ventolin-inhaler", name: "Ventolin Inhaler 100mcg", brand: "Ventolin", strength: "100mcg", generic: "Salbutamol", form: "inhaler", unit: "Piece", cat: "allergy-asthma", mfr: "gsk", rx: true, pack: "200 doses", use: "Quick relief of wheezing and breathlessness in asthma." }),
    P({ id: "ventolin-syrup", name: "Ventolin Syrup 2mg/5ml", brand: "Ventolin", strength: "2mg/5ml", generic: "Salbutamol", form: "syrup", unit: "Bottle", cat: "allergy-asthma", mfr: "gsk", rx: true, kids: true, pack: "120ml", use: "Relief of wheezing and chest tightness, as prescribed." }),
    P({ id: "ventolin-nebules", name: "Ventolin Nebules 2.5mg", brand: "Ventolin", strength: "Nebules 2.5mg", generic: "Salbutamol", form: "nebule", unit: "Box", cat: "allergy-asthma", mfr: "gsk", rx: true, kids: true, use: "For use with a nebulizer to relieve wheezing." }),
    P({ id: "seretide-inhaler", name: "Seretide Inhaler", brand: "Seretide", generic: "Salmeterol + Fluticasone", form: "inhaler", unit: "Piece", cat: "allergy-asthma", mfr: "gsk", rx: true, use: "Regular control of asthma and COPD, as prescribed." }),

    /* ---------- Stomach & Digestion ---------- */
    P({ id: "risek-20mg", name: "Risek 20mg Capsules", brand: "Risek", strength: "20mg", generic: "Omeprazole", form: "capsule", unit: "Strip", cat: "stomach", mfr: "getz", use: "Acidity, heartburn and stomach ulcers.", featured: true }),
    P({ id: "risek-40mg", name: "Risek 40mg Capsules", brand: "Risek", strength: "40mg", generic: "Omeprazole", form: "capsule", unit: "Strip", cat: "stomach", mfr: "getz", rx: true, use: "Stomach ulcers and severe acid reflux, as prescribed." }),
    P({ id: "nexum-20mg", name: "Nexum 20mg Tablets", brand: "Nexum", strength: "20mg", generic: "Esomeprazole", form: "tablet", unit: "Strip", cat: "stomach", mfr: "getz", rx: true, use: "Acid reflux and heartburn." }),
    P({ id: "nexum-40mg", name: "Nexum 40mg Tablets", brand: "Nexum", strength: "40mg", generic: "Esomeprazole", form: "tablet", unit: "Strip", cat: "stomach", mfr: "getz", rx: true, use: "Stomach ulcers and severe acid reflux, as prescribed." }),
    P({ id: "gaviscon-liquid", name: "Gaviscon Liquid", brand: "Gaviscon", generic: "Sodium alginate + Sodium bicarbonate + Calcium carbonate", form: "syrup", unit: "Bottle", cat: "stomach", mfr: "reckitt", pack: "120ml", use: "Fast relief from heartburn and indigestion." }),
    P({ id: "eno-fruit-salt", name: "ENO Fruit Salt Sachet", brand: "ENO", generic: "Sodium bicarbonate + Citric acid", form: "sachet", unit: "Sachet", cat: "stomach", mfr: "haleon", use: "Quick relief from acidity and indigestion." }),
    P({ id: "digene-tablets", name: "Digene Tablets", brand: "Digene", generic: "Antacid with simethicone", form: "tablet", unit: "Strip", cat: "stomach", mfr: "abbott", use: "Relief from acidity, heartburn and gas." }),
    P({ id: "entamizole-tablets", name: "Entamizole Tablets", brand: "Entamizole", generic: "Metronidazole + Diloxanide furoate", form: "tablet", unit: "Strip", cat: "stomach", mfr: "abbott", rx: true, use: "Amoebic and bacterial stomach infections causing diarrhoea or dysentery." }),
    P({ id: "gravinate-50mg", name: "Gravinate 50mg Tablets", brand: "Gravinate", strength: "50mg", generic: "Dimenhydrinate", form: "tablet", unit: "Strip", cat: "stomach", mfr: "searle", pack: "10 tablets", use: "Nausea, vomiting and motion sickness." }),
    P({ id: "no-spa-40mg", name: "No-Spa 40mg Tablets", brand: "No-Spa", strength: "40mg", generic: "Drotaverine", form: "tablet", unit: "Strip", cat: "stomach", mfr: "sanofi", use: "Stomach cramps and abdominal spasms." }),
    P({ id: "colofac-135mg", name: "Colofac 135mg Tablets", brand: "Colofac", strength: "135mg", generic: "Mebeverine", form: "tablet", unit: "Strip", cat: "stomach", mfr: "abbott", use: "Cramps and bloating of irritable bowel syndrome (IBS)." }),
    P({ id: "duphalac-syrup", name: "Duphalac Syrup", brand: "Duphalac", generic: "Lactulose", form: "syrup", unit: "Bottle", cat: "stomach", mfr: "abbott", pack: "120ml", use: "Gentle relief from constipation." }),
    P({ id: "enterogermina-suspension", name: "Enterogermina Oral Suspension", brand: "Enterogermina", generic: "Bacillus clausii (probiotic)", form: "vial", unit: "Box", cat: "stomach", mfr: "sanofi", kids: true, pack: "10 × 5ml vials", use: "Probiotic that helps restore healthy gut bacteria during diarrhoea.", featured: true }),
    P({ id: "ors-sachets", name: "ORS Sachets (Low Osmolarity)", brand: "ORS", generic: "Oral rehydration salts", form: "sachet", unit: "Sachet", cat: "stomach", mfr: "various", kids: true, use: "Prevents and treats dehydration from diarrhoea and vomiting.", featured: true }),
    P({ id: "zentel-400mg", name: "Zentel 400mg Tablet", brand: "Zentel", strength: "400mg", generic: "Albendazole", form: "tablet", unit: "Strip", cat: "stomach", mfr: "gsk", use: "Treatment of worm infections." }),
    P({ id: "zentel-suspension", name: "Zentel Suspension", brand: "Zentel", strength: "Suspension", generic: "Albendazole", form: "suspension", unit: "Bottle", cat: "stomach", mfr: "gsk", kids: true, pack: "10ml", use: "Treatment of worm infections in children." }),

    /* ---------- Antibiotics (prescription only) ---------- */
    P({ id: "augmentin-625mg", name: "Augmentin 625mg Tablets", brand: "Augmentin", strength: "625mg", generic: "Amoxicillin + Clavulanic acid", form: "tablet", unit: "Strip", cat: "antibiotics", mfr: "gsk", rx: true, use: "Bacterial infections of the chest, ear, throat, sinus, skin and urinary tract.", featured: true }),
    P({ id: "augmentin-1g", name: "Augmentin 1g Tablets", brand: "Augmentin", strength: "1g", generic: "Amoxicillin + Clavulanic acid", form: "tablet", unit: "Strip", cat: "antibiotics", mfr: "gsk", rx: true, use: "Bacterial infections, as prescribed by your doctor." }),
    P({ id: "augmentin-156mg-suspension", name: "Augmentin Suspension 156.25mg/5ml", brand: "Augmentin", strength: "156.25mg/5ml", generic: "Amoxicillin + Clavulanic acid", form: "suspension", unit: "Bottle", cat: "antibiotics", mfr: "gsk", rx: true, kids: true, use: "Bacterial infections in children, as prescribed." }),
    P({ id: "augmentin-ds-suspension", name: "Augmentin DS Suspension 312.5mg/5ml", brand: "Augmentin DS", strength: "312.5mg/5ml", generic: "Amoxicillin + Clavulanic acid", form: "suspension", unit: "Bottle", cat: "antibiotics", mfr: "gsk", rx: true, kids: true, use: "Bacterial infections in children, as prescribed." }),
    P({ id: "amoxil-500mg", name: "Amoxil 500mg Capsules", brand: "Amoxil", strength: "500mg", generic: "Amoxicillin", form: "capsule", unit: "Strip", cat: "antibiotics", mfr: "gsk", rx: true, use: "Bacterial infections of the chest, ear, throat and urinary tract." }),
    P({ id: "amoxil-125mg-suspension", name: "Amoxil Suspension 125mg/5ml", brand: "Amoxil", strength: "125mg/5ml", generic: "Amoxicillin", form: "suspension", unit: "Bottle", cat: "antibiotics", mfr: "gsk", rx: true, kids: true, use: "Bacterial infections in children, as prescribed." }),
    P({ id: "amoxil-250mg-suspension", name: "Amoxil Suspension 250mg/5ml", brand: "Amoxil", strength: "250mg/5ml", generic: "Amoxicillin", form: "suspension", unit: "Bottle", cat: "antibiotics", mfr: "gsk", rx: true, kids: true, use: "Bacterial infections in children, as prescribed." }),
    P({ id: "velosef-500mg", name: "Velosef 500mg Capsules", brand: "Velosef", strength: "500mg", generic: "Cephradine", form: "capsule", unit: "Pack", cat: "antibiotics", mfr: "gsk", rx: true, pack: "12 capsules", use: "Bacterial infections of the skin, chest and urinary tract." }),
    P({ id: "velosef-125mg-suspension", name: "Velosef Suspension 125mg/5ml", brand: "Velosef", strength: "125mg/5ml", generic: "Cephradine", form: "suspension", unit: "Bottle", cat: "antibiotics", mfr: "gsk", rx: true, kids: true, pack: "90ml", use: "Bacterial infections in children, as prescribed." }),
    P({ id: "septran-ds-tablets", name: "Septran DS Tablets", brand: "Septran DS", strength: "160/800mg", generic: "Co-trimoxazole (Trimethoprim + Sulfamethoxazole)", form: "tablet", unit: "Strip", cat: "antibiotics", mfr: "gsk", rx: true, pack: "10 tablets", use: "Urinary tract and other bacterial infections." }),
    P({ id: "septran-suspension", name: "Septran Suspension", brand: "Septran", strength: "40/200mg per 5ml", generic: "Co-trimoxazole (Trimethoprim + Sulfamethoxazole)", form: "suspension", unit: "Bottle", cat: "antibiotics", mfr: "gsk", rx: true, kids: true, pack: "50ml", use: "Bacterial infections in children, as prescribed." }),
    P({ id: "klaricid-500mg", name: "Klaricid 500mg Tablets", brand: "Klaricid", strength: "500mg", generic: "Clarithromycin", form: "tablet", unit: "Strip", cat: "antibiotics", mfr: "abbott", rx: true, use: "Chest, throat, sinus and skin infections." }),
    P({ id: "klaricid-suspension", name: "Klaricid Suspension 125mg/5ml", brand: "Klaricid", strength: "125mg/5ml", generic: "Clarithromycin", form: "suspension", unit: "Bottle", cat: "antibiotics", mfr: "abbott", rx: true, kids: true, pack: "60ml", use: "Bacterial infections in children, as prescribed." }),
    P({ id: "zithromax-250mg", name: "Zithromax 250mg Capsules", brand: "Zithromax", strength: "250mg", generic: "Azithromycin", form: "capsule", unit: "Strip", cat: "antibiotics", mfr: "pfizer", rx: true, use: "Chest, throat, ear and skin infections." }),
    P({ id: "zithromax-suspension", name: "Zithromax Suspension 200mg/5ml", brand: "Zithromax", strength: "200mg/5ml", generic: "Azithromycin", form: "suspension", unit: "Bottle", cat: "antibiotics", mfr: "pfizer", rx: true, kids: true, use: "Bacterial infections in children, as prescribed." }),
    P({ id: "azomax-500mg", name: "Azomax 500mg Tablets", brand: "Azomax", strength: "500mg", generic: "Azithromycin", form: "tablet", unit: "Strip", cat: "antibiotics", mfr: "novartis", rx: true, use: "Chest, throat, ear and skin infections." }),
    P({ id: "azomax-suspension", name: "Azomax Suspension 200mg/5ml", brand: "Azomax", strength: "200mg/5ml", generic: "Azithromycin", form: "suspension", unit: "Bottle", cat: "antibiotics", mfr: "novartis", rx: true, kids: true, use: "Bacterial infections in children, as prescribed." }),
    P({ id: "flagyl-400mg", name: "Flagyl 400mg Tablets", brand: "Flagyl", strength: "400mg", generic: "Metronidazole", form: "tablet", unit: "Strip", cat: "antibiotics", mfr: "sanofi", rx: true, pack: "10 tablets", use: "Stomach infections, dysentery, and dental and other infections.", featured: true }),
    P({ id: "flagyl-suspension", name: "Flagyl Suspension 200mg/5ml", brand: "Flagyl", strength: "200mg/5ml", generic: "Metronidazole benzoate", form: "suspension", unit: "Bottle", cat: "antibiotics", mfr: "sanofi", rx: true, kids: true, use: "Diarrhoea and dysentery caused by infection in children, as prescribed." }),
    P({ id: "novidat-500mg", name: "Novidat 500mg Tablets", brand: "Novidat", strength: "500mg", generic: "Ciprofloxacin", form: "tablet", unit: "Strip", cat: "antibiotics", mfr: "sami", rx: true, use: "Urinary tract, typhoid and other bacterial infections." }),
    P({ id: "ciproxin-500mg", name: "Ciproxin 500mg Tablets", brand: "Ciproxin", strength: "500mg", generic: "Ciprofloxacin", form: "tablet", unit: "Strip", cat: "antibiotics", mfr: "bayer", rx: true, use: "Urinary tract, typhoid and other bacterial infections." }),
    P({ id: "leflox-500mg", name: "Leflox 500mg Tablets", brand: "Leflox", strength: "500mg", generic: "Levofloxacin", form: "tablet", unit: "Strip", cat: "antibiotics", mfr: "getz", rx: true, use: "Chest, sinus and urinary tract infections." }),
    P({ id: "cefiget-400mg", name: "Cefiget 400mg Capsules", brand: "Cefiget", strength: "400mg", generic: "Cefixime", form: "capsule", unit: "Strip", cat: "antibiotics", mfr: "getz", rx: true, use: "Typhoid, throat, chest and urinary infections." }),
    P({ id: "cefiget-suspension", name: "Cefiget Suspension 100mg/5ml", brand: "Cefiget", strength: "100mg/5ml", generic: "Cefixime", form: "suspension", unit: "Bottle", cat: "antibiotics", mfr: "getz", rx: true, kids: true, use: "Bacterial infections in children, as prescribed." }),

    /* ---------- Vitamins & Nutrition ---------- */
    P({ id: "surbex-z", name: "Surbex-Z Tablets", brand: "Surbex-Z", generic: "Vitamin B-complex + Vitamin C + Zinc", form: "tablet", unit: "Pack", cat: "vitamins", mfr: "abbott", pack: "60 tablets", use: "Daily vitamin and zinc supplement for energy and recovery.", featured: true }),
    P({ id: "supradyn-tablets", name: "Supradyn Multivitamin Tablets", brand: "Supradyn", generic: "Multivitamins + Minerals", form: "tablet", unit: "Pack", cat: "vitamins", mfr: "bayer", use: "Daily multivitamin and mineral supplement." }),
    P({ id: "berocca-effervescent", name: "Berocca Effervescent Tablets", brand: "Berocca", generic: "Vitamin B & C with Zinc, Calcium, Magnesium", form: "effervescent", unit: "Tube", cat: "vitamins", mfr: "bayer", use: "Vitamin drink for energy and focus." }),
    P({ id: "ensure-vanilla-400g", name: "Ensure Vanilla Powder 400g", brand: "Ensure", strength: "400g", generic: "Complete balanced nutrition", form: "tin", unit: "Tin", cat: "vitamins", mfr: "abbott", use: "Nutritional supplement for adults and the elderly." }),
    P({ id: "pediasure-vanilla-400g", name: "PediaSure Vanilla 400g", brand: "PediaSure", strength: "400g", generic: "Complete nutrition for children", form: "tin", unit: "Tin", cat: "vitamins", mfr: "abbott", kids: true, use: "Nutrition for children who are picky eaters or underweight." }),
    P({ id: "folic-acid-5mg", name: "Folic Acid 5mg Tablets", brand: "Folic Acid", strength: "5mg", generic: "Folic acid", form: "tablet", unit: "Strip", cat: "vitamins", mfr: "various", use: "Folic acid supplement, especially before and during pregnancy." }),
    P({ id: "calcium-vitamin-d3-tablets", name: "Calcium + Vitamin D3 Tablets", brand: "Calcium+D3", generic: "Calcium carbonate + Vitamin D3", form: "tablet", unit: "Pack", cat: "vitamins", mfr: "various", use: "Supports strong bones and teeth." }),
    P({ id: "zinc-syrup-20mg", name: "Zinc Syrup 20mg/5ml", brand: "Zinc", strength: "20mg/5ml", generic: "Zinc sulphate", form: "syrup", unit: "Bottle", cat: "vitamins", mfr: "various", kids: true, use: "Zinc supplement, often given with ORS during diarrhoea in children." }),
    P({ id: "vitamin-d3-drops", name: "Vitamin D3 Drops", brand: "Vitamin D3", strength: "Drops", generic: "Cholecalciferol", form: "drops", unit: "Bottle", cat: "vitamins", mfr: "various", kids: true, use: "Vitamin D supplement for babies and children." }),

    /* ---------- Diabetes Care ---------- */
    P({ id: "amaryl-1mg", name: "Amaryl 1mg Tablets", brand: "Amaryl", strength: "1mg", generic: "Glimepiride", form: "tablet", unit: "Strip", cat: "diabetes", mfr: "sanofi", rx: true, use: "Blood sugar control in type 2 diabetes." }),
    P({ id: "amaryl-2mg", name: "Amaryl 2mg Tablets", brand: "Amaryl", strength: "2mg", generic: "Glimepiride", form: "tablet", unit: "Strip", cat: "diabetes", mfr: "sanofi", rx: true, use: "Blood sugar control in type 2 diabetes." }),
    P({ id: "amaryl-4mg", name: "Amaryl 4mg Tablets", brand: "Amaryl", strength: "4mg", generic: "Glimepiride", form: "tablet", unit: "Strip", cat: "diabetes", mfr: "sanofi", rx: true, use: "Blood sugar control in type 2 diabetes." }),
    P({ id: "daonil-5mg", name: "Daonil 5mg Tablets", brand: "Daonil", strength: "5mg", generic: "Glibenclamide", form: "tablet", unit: "Box", cat: "diabetes", mfr: "sanofi", rx: true, pack: "60 tablets", use: "Blood sugar control in type 2 diabetes." }),
    P({ id: "galvus-50mg", name: "Galvus 50mg Tablets", brand: "Galvus", strength: "50mg", generic: "Vildagliptin", form: "tablet", unit: "Strip", cat: "diabetes", mfr: "novartis", rx: true, use: "Blood sugar control in type 2 diabetes." }),
    P({ id: "galvus-met-50-500", name: "Galvus Met 50/500mg Tablets", brand: "Galvus Met", strength: "50/500mg", generic: "Vildagliptin + Metformin", form: "tablet", unit: "Strip", cat: "diabetes", mfr: "novartis", rx: true, use: "Blood sugar control in type 2 diabetes." }),
    P({ id: "galvus-met-50-1000", name: "Galvus Met 50/1000mg Tablets", brand: "Galvus Met", strength: "50/1000mg", generic: "Vildagliptin + Metformin", form: "tablet", unit: "Strip", cat: "diabetes", mfr: "novartis", rx: true, use: "Blood sugar control in type 2 diabetes." }),
    P({ id: "januvia-50mg", name: "Januvia 50mg Tablets", brand: "Januvia", strength: "50mg", generic: "Sitagliptin", form: "tablet", unit: "Strip", cat: "diabetes", mfr: "msd", rx: true, use: "Blood sugar control in type 2 diabetes." }),
    P({ id: "januvia-100mg", name: "Januvia 100mg Tablets", brand: "Januvia", strength: "100mg", generic: "Sitagliptin", form: "tablet", unit: "Strip", cat: "diabetes", mfr: "msd", rx: true, use: "Blood sugar control in type 2 diabetes." }),
    P({ id: "janumet-50-500", name: "Janumet 50/500mg Tablets", brand: "Janumet", strength: "50/500mg", generic: "Sitagliptin + Metformin", form: "tablet", unit: "Strip", cat: "diabetes", mfr: "msd", rx: true, use: "Blood sugar control in type 2 diabetes." }),
    P({ id: "janumet-50-1000", name: "Janumet 50/1000mg Tablets", brand: "Janumet", strength: "50/1000mg", generic: "Sitagliptin + Metformin", form: "tablet", unit: "Strip", cat: "diabetes", mfr: "msd", rx: true, use: "Blood sugar control in type 2 diabetes." }),
    P({ id: "glucerna-vanilla-400g", name: "Glucerna Vanilla 400g", brand: "Glucerna", strength: "400g", generic: "Diabetes-specific nutrition", form: "tin", unit: "Tin", cat: "diabetes", mfr: "abbott", use: "Nutrition designed for people with diabetes." }),
    P({ id: "accu-chek-instant-meter", name: "Accu-Chek Instant Glucometer", brand: "Accu-Chek", strength: "Instant", generic: "Blood glucose meter", form: "device", unit: "Piece", cat: "diabetes", mfr: "roche", use: "Check your blood sugar at home quickly and easily." }),
    P({ id: "accu-chek-instant-strips-50", name: "Accu-Chek Instant Test Strips (50)", brand: "Accu-Chek", strength: "50 strips", generic: "Blood glucose test strips", form: "pack", unit: "Box", cat: "diabetes", mfr: "roche", use: "Test strips for the Accu-Chek Instant glucometer." }),

    /* ---------- Heart & Blood Pressure ---------- */
    P({ id: "diovan-80mg", name: "Diovan 80mg Tablets", brand: "Diovan", strength: "80mg", generic: "Valsartan", form: "tablet", unit: "Strip", cat: "heart-bp", mfr: "novartis", rx: true, use: "High blood pressure and heart failure." }),
    P({ id: "diovan-160mg", name: "Diovan 160mg Tablets", brand: "Diovan", strength: "160mg", generic: "Valsartan", form: "tablet", unit: "Strip", cat: "heart-bp", mfr: "novartis", rx: true, use: "High blood pressure and heart failure." }),
    P({ id: "co-diovan-80-12-5", name: "Co-Diovan 80/12.5mg Tablets", brand: "Co-Diovan", strength: "80/12.5mg", generic: "Valsartan + Hydrochlorothiazide", form: "tablet", unit: "Strip", cat: "heart-bp", mfr: "novartis", rx: true, use: "High blood pressure." }),
    P({ id: "exforge-5-80", name: "Exforge 5/80mg Tablets", brand: "Exforge", strength: "5/80mg", generic: "Amlodipine + Valsartan", form: "tablet", unit: "Strip", cat: "heart-bp", mfr: "novartis", rx: true, use: "High blood pressure." }),
    P({ id: "exforge-5-160", name: "Exforge 5/160mg Tablets", brand: "Exforge", strength: "5/160mg", generic: "Amlodipine + Valsartan", form: "tablet", unit: "Strip", cat: "heart-bp", mfr: "novartis", rx: true, use: "High blood pressure." }),
    P({ id: "exforge-10-160", name: "Exforge 10/160mg Tablets", brand: "Exforge", strength: "10/160mg", generic: "Amlodipine + Valsartan", form: "tablet", unit: "Strip", cat: "heart-bp", mfr: "novartis", rx: true, use: "High blood pressure." }),
    P({ id: "plavix-75mg", name: "Plavix 75mg Tablets", brand: "Plavix", strength: "75mg", generic: "Clopidogrel", form: "tablet", unit: "Box", cat: "heart-bp", mfr: "sanofi", rx: true, pack: "28 tablets", use: "Prevents blood clots after heart attack, stroke or stenting." }),
    P({ id: "loprin-75mg", name: "Loprin 75mg Tablets", brand: "Loprin", strength: "75mg", generic: "Aspirin (low dose)", form: "tablet", unit: "Strip", cat: "heart-bp", mfr: "highnoon", use: "Low-dose aspirin for heart protection, taken on your doctor's advice." }),
    P({ id: "lasix-40mg", name: "Lasix 40mg Tablets", brand: "Lasix", strength: "40mg", generic: "Furosemide", form: "tablet", unit: "Strip", cat: "heart-bp", mfr: "sanofi", rx: true, use: "Removes extra fluid (swelling) in heart, liver and kidney conditions." }),

    /* ---------- Skin & Personal Care ---------- */
    P({ id: "polyfax-ointment", name: "Polyfax Ointment", brand: "Polyfax", generic: "Polymyxin B + Bacitracin", form: "ointment", unit: "Tube", cat: "skin", mfr: "gsk", pack: "20g", use: "Minor cuts, scrapes and skin infections." }),
    P({ id: "fucidin-cream", name: "Fucidin Cream 2%", brand: "Fucidin", strength: "2%", generic: "Fusidic acid", form: "cream", unit: "Tube", cat: "skin", mfr: "leo", rx: true, pack: "15g", use: "Bacterial skin infections such as impetigo." }),
    P({ id: "betnovate-cream", name: "Betnovate Cream 0.1%", brand: "Betnovate", strength: "0.1%", generic: "Betamethasone valerate", form: "cream", unit: "Tube", cat: "skin", mfr: "gsk", rx: true, pack: "20g", use: "Eczema, dermatitis and other inflamed skin conditions." }),
    P({ id: "dermovate-cream", name: "Dermovate Cream 0.05%", brand: "Dermovate", strength: "0.05%", generic: "Clobetasol propionate", form: "cream", unit: "Tube", cat: "skin", mfr: "gsk", rx: true, pack: "20g", use: "Severe eczema and psoriasis, as prescribed." }),
    P({ id: "canesten-cream", name: "Canesten Cream 1%", brand: "Canesten", strength: "1%", generic: "Clotrimazole", form: "cream", unit: "Tube", cat: "skin", mfr: "bayer", pack: "20g", use: "Fungal skin infections such as ringworm and athlete's foot." }),
    P({ id: "vaseline-petroleum-jelly", name: "Vaseline Pure Petroleum Jelly", brand: "Vaseline", generic: "Petroleum jelly", form: "jar", unit: "Jar", cat: "skin", mfr: "unilever", use: "Protects and soothes dry, cracked skin." }),
    P({ id: "nivea-creme", name: "Nivea Creme", brand: "Nivea", strength: "Creme", generic: "Moisturising cream", form: "jar", unit: "Tin", cat: "skin", mfr: "beiersdorf", use: "Moisturising cream for face, hands and body." }),
    P({ id: "sensodyne-toothpaste", name: "Sensodyne Toothpaste", brand: "Sensodyne", generic: "Toothpaste for sensitive teeth", form: "toothpaste", unit: "Tube", cat: "oral-care", mfr: "haleon", use: "Daily toothpaste for sensitive teeth." }),

    /* ---------- Eye, Ear & Nose ---------- */
    P({ id: "otrivin-0-1-nasal-drops", name: "Otrivin 0.1% Nasal Drops", brand: "Otrivin", strength: "0.1%", generic: "Xylometazoline", form: "drops", unit: "Bottle", cat: "eye-ear-nose", mfr: "haleon", use: "Fast relief from blocked nose in adults." }),
    P({ id: "otrivin-paediatric-nasal-drops", name: "Otrivin 0.05% Paediatric Nasal Drops", brand: "Otrivin", strength: "0.05% Kids", generic: "Xylometazoline", form: "drops", unit: "Bottle", cat: "eye-ear-nose", mfr: "haleon", kids: true, use: "Relief from blocked nose in children." }),
    P({ id: "tobradex-eye-drops", name: "Tobradex Eye Drops", brand: "Tobradex", generic: "Tobramycin + Dexamethasone", form: "drops", unit: "Bottle", cat: "eye-ear-nose", mfr: "alcon", rx: true, pack: "5ml", use: "Eye infections with inflammation, as prescribed." }),
    P({ id: "refresh-tears", name: "Refresh Tears Eye Drops", brand: "Refresh Tears", generic: "Carboxymethylcellulose 0.5%", form: "drops", unit: "Bottle", cat: "eye-ear-nose", mfr: "allergan", use: "Lubricating drops for dry, tired eyes." }),

    /* ---------- Baby Care ---------- */
    P({ id: "nan-optipro-1", name: "Nestlé NAN Optipro 1 Infant Formula", brand: "NAN Optipro", strength: "Stage 1", generic: "Infant formula (0–6 months)", form: "tin", unit: "Tin", cat: "baby", mfr: "nestle", kids: true, use: "Infant formula from birth when breastfeeding is not possible.", featured: true }),
    P({ id: "nan-optipro-2", name: "Nestlé NAN Optipro 2 Follow-up Formula", brand: "NAN Optipro", strength: "Stage 2", generic: "Follow-up formula (6–12 months)", form: "tin", unit: "Tin", cat: "baby", mfr: "nestle", kids: true, use: "Follow-up formula for babies from 6 months." }),
    P({ id: "nan-optipro-3", name: "Nestlé NAN Optipro 3 Growing-up Milk", brand: "NAN Optipro", strength: "Stage 3", generic: "Growing-up milk (1–3 years)", form: "tin", unit: "Tin", cat: "baby", mfr: "nestle", kids: true, use: "Growing-up milk for toddlers from 1 year." }),
    P({ id: "lactogen-1", name: "Nestlé Lactogen 1 Infant Formula", brand: "Lactogen", strength: "Stage 1", generic: "Infant formula (0–6 months)", form: "tin", unit: "Tin", cat: "baby", mfr: "nestle", kids: true, use: "Infant formula from birth when breastfeeding is not possible." }),
    P({ id: "lactogen-2", name: "Nestlé Lactogen 2 Follow-up Formula", brand: "Lactogen", strength: "Stage 2", generic: "Follow-up formula (6–12 months)", form: "tin", unit: "Tin", cat: "baby", mfr: "nestle", kids: true, use: "Follow-up formula for babies from 6 months." }),
    P({ id: "cerelac-wheat", name: "Nestlé Cerelac Wheat", brand: "Cerelac", strength: "Wheat", generic: "Infant cereal (from 6 months)", form: "pack", unit: "Pack", cat: "baby", mfr: "nestle", kids: true, use: "Iron-fortified cereal for babies starting solid food." }),
    P({ id: "cerelac-rice", name: "Nestlé Cerelac Rice", brand: "Cerelac", strength: "Rice", generic: "Infant cereal (from 6 months)", form: "pack", unit: "Pack", cat: "baby", mfr: "nestle", kids: true, use: "Gentle first cereal for babies from 6 months." }),
    P({ id: "pampers-baby-dry-size-3", name: "Pampers Baby-Dry Diapers Size 3 (Midi)", brand: "Pampers", strength: "Size 3 · Midi", generic: "Baby diapers", form: "diaper", unit: "Pack", cat: "diapers", mfr: "pg", kids: true, use: "Soft, absorbent diapers for overnight dryness." }),
    P({ id: "pampers-baby-dry-size-4", name: "Pampers Baby-Dry Diapers Size 4 (Maxi)", brand: "Pampers", strength: "Size 4 · Maxi", generic: "Baby diapers", form: "diaper", unit: "Pack", cat: "diapers", mfr: "pg", kids: true, use: "Soft, absorbent diapers for overnight dryness." }),
    P({ id: "pampers-baby-dry-size-5", name: "Pampers Baby-Dry Diapers Size 5 (Junior)", brand: "Pampers", strength: "Size 5 · Junior", generic: "Baby diapers", form: "diaper", unit: "Pack", cat: "diapers", mfr: "pg", kids: true, use: "Soft, absorbent diapers for overnight dryness." }),
    P({ id: "molfix-size-3", name: "Molfix Diapers Size 3 (Midi)", brand: "Molfix", strength: "Size 3 · Midi", generic: "Baby diapers", form: "diaper", unit: "Pack", cat: "diapers", mfr: "hayat", kids: true, use: "Comfortable, leak-protection diapers." }),
    P({ id: "molfix-size-4", name: "Molfix Diapers Size 4 (Maxi)", brand: "Molfix", strength: "Size 4 · Maxi", generic: "Baby diapers", form: "diaper", unit: "Pack", cat: "diapers", mfr: "hayat", kids: true, use: "Comfortable, leak-protection diapers." }),
    P({ id: "molfix-size-5", name: "Molfix Diapers Size 5 (Junior)", brand: "Molfix", strength: "Size 5 · Junior", generic: "Baby diapers", form: "diaper", unit: "Pack", cat: "diapers", mfr: "hayat", kids: true, use: "Comfortable, leak-protection diapers." }),
    P({ id: "pampers-baby-wipes", name: "Pampers Baby Wipes", brand: "Pampers", strength: "Wipes", generic: "Baby wipes", form: "wipes", unit: "Pack", cat: "diapers", mfr: "pg", kids: true, use: "Gentle wipes for nappy changes." }),
    P({ id: "johnsons-baby-shampoo", name: "Johnson's Baby Shampoo", brand: "Johnson's", strength: "Shampoo", generic: "No-more-tears baby shampoo", form: "bottle", unit: "Bottle", cat: "baby", mfr: "kenvue", kids: true, use: "Mild, tear-free shampoo for babies." }),
    P({ id: "johnsons-baby-lotion", name: "Johnson's Baby Lotion", brand: "Johnson's", strength: "Lotion", generic: "Baby moisturising lotion", form: "bottle", unit: "Bottle", cat: "baby", mfr: "kenvue", kids: true, use: "Keeps baby's skin soft and moisturised." }),
    P({ id: "johnsons-baby-oil", name: "Johnson's Baby Oil", brand: "Johnson's", strength: "Oil", generic: "Baby massage oil", form: "bottle", unit: "Bottle", cat: "baby", mfr: "kenvue", kids: true, use: "Gentle oil for baby massage." }),
    P({ id: "johnsons-baby-powder", name: "Johnson's Baby Powder", brand: "Johnson's", strength: "Powder", generic: "Baby powder", form: "powder", unit: "Bottle", cat: "baby", mfr: "kenvue", kids: true, use: "Keeps baby's skin dry and fresh." }),
    P({ id: "pigeon-feeding-bottle", name: "Pigeon Feeding Bottle", brand: "Pigeon", strength: "Feeder", generic: "Baby feeding bottle", form: "bottle", unit: "Piece", cat: "baby", mfr: "pigeon", kids: true, use: "Easy-to-clean feeding bottle for babies." }),
    P({ id: "pigeon-silicone-nipple", name: "Pigeon Silicone Nipple", brand: "Pigeon", strength: "Nipple", generic: "Feeding bottle nipple", form: "pack", unit: "Pack", cat: "baby", mfr: "pigeon", kids: true, use: "Soft replacement nipple for feeding bottles." }),

    /* ---------- Herbal & Desi ---------- */
    P({ id: "sualin-tablets", name: "Sualin Tablets", brand: "Sualin", generic: "Herbal cough tablets", form: "tablet", unit: "Pack", cat: "herbal", mfr: "hamdard", use: "Herbal relief for cough and sore throat." }),
    P({ id: "joshina-syrup", name: "Joshina Syrup", brand: "Joshina", generic: "Herbal cold & flu remedy", form: "syrup", unit: "Bottle", cat: "herbal", mfr: "hamdard", use: "Herbal remedy for cold, flu and sore throat." }),
    P({ id: "safi-syrup", name: "Safi Syrup", brand: "Safi", generic: "Herbal blood purifier", form: "syrup", unit: "Bottle", cat: "herbal", mfr: "hamdard", use: "Traditional herbal tonic for clear skin." }),
    P({ id: "johar-joshanda", name: "Johar Joshanda", brand: "Joshanda", strength: "Johar", generic: "Herbal cold & flu sachets", form: "sachet", unit: "Pack", cat: "herbal", mfr: "qarshi", use: "Traditional herbal drink for cold, cough and flu." }),

    /* ---------- First Aid & Supplies ---------- */
    P({ id: "dettol-antiseptic-liquid", name: "Dettol Antiseptic Liquid", brand: "Dettol", generic: "Chloroxylenol", form: "bottle", unit: "Bottle", cat: "first-aid", mfr: "reckitt", use: "Antiseptic for cleaning cuts and grazes and for personal hygiene." }),
    P({ id: "pyodine-solution", name: "Pyodine Solution 10%", brand: "Pyodine", strength: "10%", generic: "Povidone-iodine", form: "bottle", unit: "Bottle", cat: "first-aid", mfr: "brookes", pack: "60ml", use: "Antiseptic for wounds, cuts and skin disinfection." }),
    P({ id: "hansaplast-strips", name: "Hansaplast Plaster Strips", brand: "Hansaplast", generic: "Adhesive bandages", form: "pack", unit: "Pack", cat: "first-aid", mfr: "beiersdorf", use: "Covers and protects small cuts and wounds." }),
    P({ id: "cotton-roll", name: "Absorbent Cotton Roll", brand: "Cotton", generic: "Absorbent cotton wool", form: "supply", unit: "Pack", cat: "first-aid", mfr: "various", use: "For cleaning wounds and applying antiseptic." }),
    P({ id: "crepe-bandage", name: "Crepe Bandage", brand: "Crepe", strength: "Bandage", generic: "Elastic support bandage", form: "supply", unit: "Piece", cat: "first-aid", mfr: "various", use: "Support for sprains and strains." }),
    P({ id: "gauze-swabs", name: "Sterile Gauze Swabs", brand: "Gauze", generic: "Sterile gauze", form: "supply", unit: "Pack", cat: "first-aid", mfr: "various", use: "For dressing and covering wounds." }),
    P({ id: "surgical-face-masks", name: "Surgical Face Masks (Box)", brand: "Masks", generic: "3-ply disposable face masks", form: "supply", unit: "Box", cat: "first-aid", mfr: "various", use: "Disposable face masks for everyday protection." }),
    P({ id: "disposable-gloves", name: "Disposable Examination Gloves", brand: "Gloves", generic: "Latex / nitrile gloves", form: "supply", unit: "Box", cat: "first-aid", mfr: "various", use: "Disposable gloves for hygiene and first aid." }),

    /* ---------- Medical Devices ---------- */
    P({ id: "omron-m2-basic-bp-monitor", name: "Omron M2 Basic BP Monitor", brand: "Omron", strength: "M2 Basic", generic: "Automatic blood pressure monitor", form: "device", unit: "Piece", cat: "devices", mfr: "omron", use: "Check your blood pressure accurately at home.", featured: true }),
    P({ id: "omron-digital-thermometer", name: "Omron Digital Thermometer", brand: "Omron", strength: "Thermometer", generic: "Digital thermometer", form: "device", unit: "Piece", cat: "devices", mfr: "omron", use: "Quick and accurate temperature readings for the whole family." }),
    P({ id: "omron-ne-c101-nebulizer", name: "Omron NE-C101 Compressor Nebulizer", brand: "Omron", strength: "Nebulizer", generic: "Compressor nebulizer", form: "device", unit: "Piece", cat: "devices", mfr: "omron", use: "Home nebulizer for asthma and breathing problems." }),
    P({ id: "pulse-oximeter", name: "Fingertip Pulse Oximeter", brand: "Oximeter", generic: "Pulse oximeter (SpO2)", form: "device", unit: "Piece", cat: "devices", mfr: "various", use: "Measures oxygen level and pulse rate in seconds." }),

    /* ---------- Diapers & Wipes ---------- */
    P({ id: "pampers-baby-dry-size-1", name: "Pampers Baby-Dry Diapers Size 1 (Newborn)", brand: "Pampers", strength: "Size 1 · Newborn", generic: "Baby diapers", form: "diaper", unit: "Pack", cat: "diapers", mfr: "pg", kids: true, use: "Soft, absorbent diapers for newborn babies." }),
    P({ id: "pampers-baby-dry-size-2", name: "Pampers Baby-Dry Diapers Size 2 (Mini)", brand: "Pampers", strength: "Size 2 · Mini", generic: "Baby diapers", form: "diaper", unit: "Pack", cat: "diapers", mfr: "pg", kids: true, use: "Soft, absorbent diapers for overnight dryness." }),
    P({ id: "pampers-baby-dry-size-6", name: "Pampers Baby-Dry Diapers Size 6 (Extra Large)", brand: "Pampers", strength: "Size 6 · XL", generic: "Baby diapers", form: "diaper", unit: "Pack", cat: "diapers", mfr: "pg", kids: true, use: "Soft, absorbent diapers for bigger toddlers." }),
    P({ id: "pampers-swaddlers-imported", name: "Pampers Swaddlers Diapers (Imported)", brand: "Pampers", strength: "Swaddlers", generic: "Premium baby diapers (imported)", form: "diaper", unit: "Pack", cat: "diapers", mfr: "pg", kids: true, use: "Extra-soft premium diapers for newborns and young babies. Ask us which sizes are in stock.", image: "https://images.ctfassets.net/2ql69mthp94m/6bMTUBfu5eULpb5Lq4lxWR/a002a1d1d5d1a3c3aad78f3dcbc0f10e/Swaddlers_New_Clean.png?fm=webp&w=800&q=80" }),
    P({ id: "molfix-size-1", name: "Molfix Diapers Size 1 (Newborn)", brand: "Molfix", strength: "Size 1 · Newborn", generic: "Baby diapers", form: "diaper", unit: "Pack", cat: "diapers", mfr: "hayat", kids: true, use: "Gentle diapers for newborn babies." }),
    P({ id: "molfix-size-2", name: "Molfix Diapers Size 2 (Mini)", brand: "Molfix", strength: "Size 2 · Mini", generic: "Baby diapers", form: "diaper", unit: "Pack", cat: "diapers", mfr: "hayat", kids: true, use: "Comfortable, leak-protection diapers." }),
    P({ id: "molfix-size-6", name: "Molfix Diapers Size 6 (Extra Large)", brand: "Molfix", strength: "Size 6 · XL", generic: "Baby diapers", form: "diaper", unit: "Pack", cat: "diapers", mfr: "hayat", kids: true, use: "Comfortable, leak-protection diapers for bigger toddlers." }),
    P({ id: "molfix-baby-wipes", name: "Molfix Baby Wipes", brand: "Molfix", strength: "Wipes", generic: "Baby wet wipes", form: "wipes", unit: "Pack", cat: "diapers", mfr: "hayat", kids: true, use: "Soft wet wipes for nappy changes and clean hands." }),
    P({ id: "pigeon-baby-wipes", name: "Pigeon Baby Wipes", brand: "Pigeon", strength: "Wipes", generic: "Baby wet wipes", form: "wipes", unit: "Pack", cat: "diapers", mfr: "pigeon", kids: true, use: "Gentle wipes for baby's delicate skin." }),

    /* ---------- Oral Care ---------- */
    P({ id: "colgate-maximum-cavity-protection", name: "Colgate Maximum Cavity Protection Toothpaste", brand: "Colgate", strength: "Cavity Protection", generic: "Fluoride toothpaste", form: "toothpaste", unit: "Tube", cat: "oral-care", mfr: "colgate", use: "Everyday fluoride toothpaste that helps prevent cavities.", featured: true, image: "https://colgate.com.pk/wp-content/uploads/2020/01/colgate-maximum-cavity-protection-img2-1-500x500.jpg" }),
    P({ id: "colgate-maxfresh-toothpaste", name: "Colgate MaxFresh Peppermint Ice Toothpaste", brand: "Colgate", strength: "Peppermint Ice", generic: "Fluoride gel toothpaste", form: "toothpaste", unit: "Tube", cat: "oral-care", mfr: "colgate", use: "Fresh breath and cavity protection.", image: "https://colgate.com.pk/wp-content/uploads/2020/01/colgate-maxfresh-peppermint-ice1-500x500.jpg" }),
    P({ id: "colgate-herbal-toothpaste", name: "Colgate Herbal Toothpaste", brand: "Colgate", strength: "Herbal", generic: "Herbal fluoride toothpaste", form: "toothpaste", unit: "Tube", cat: "oral-care", mfr: "colgate", use: "Toothpaste with herbal ingredients for healthy teeth and gums.", image: "https://colgate.com.pk/wp-content/uploads/2020/01/Colgate-Herbal-1-1-1-500x500.jpg" }),
    P({ id: "closeup-toothpaste", name: "Closeup Toothpaste", brand: "Closeup", generic: "Fluoride gel toothpaste", form: "toothpaste", unit: "Tube", cat: "oral-care", mfr: "unilever", use: "Gel toothpaste for fresh breath and cavity protection." }),
    P({ id: "sensodyne-rapid-relief", name: "Sensodyne Rapid Relief Toothpaste", brand: "Sensodyne", strength: "Rapid Relief", generic: "Toothpaste for sensitive teeth", form: "toothpaste", unit: "Tube", cat: "oral-care", mfr: "haleon", use: "Fast relief for sensitive teeth." }),
    P({ id: "sensodyne-repair-protect", name: "Sensodyne Repair & Protect Toothpaste", brand: "Sensodyne", strength: "Repair & Protect", generic: "Toothpaste for sensitive teeth", form: "toothpaste", unit: "Tube", cat: "oral-care", mfr: "haleon", use: "Daily protection for sensitive teeth." }),
    P({ id: "colgate-toothbrush", name: "Colgate Extra Clean Toothbrush", brand: "Colgate", strength: "Extra Clean", generic: "Manual toothbrush", form: "toothbrush", unit: "Piece", cat: "oral-care", mfr: "colgate", use: "Everyday toothbrush for a clean mouth.", image: "https://colgate.com.pk/wp-content/uploads/2020/01/COLGATE-EXTRA-CLEAN-500x500.png" }),
    P({ id: "oral-b-toothbrush", name: "Oral-B Toothbrush", brand: "Oral-B", strength: "Toothbrush", generic: "Manual toothbrush", form: "toothbrush", unit: "Piece", cat: "oral-care", mfr: "pg", use: "Toothbrush that reaches back teeth and gum lines." }),
    P({ id: "sensodyne-soft-toothbrush", name: "Sensodyne Soft Toothbrush", brand: "Sensodyne", strength: "Soft brush", generic: "Soft toothbrush for sensitive teeth", form: "toothbrush", unit: "Piece", cat: "oral-care", mfr: "haleon", use: "Extra-soft bristles, gentle on sensitive teeth and gums." }),
    P({ id: "kids-soft-toothbrush", name: "Colgate Kids Toothbrush", brand: "Colgate", strength: "Kids", generic: "Soft children's toothbrush", form: "toothbrush", unit: "Piece", cat: "oral-care", mfr: "colgate", kids: true, use: "Small, soft toothbrush for children.", image: "https://colgate.com.pk/wp-content/uploads/2020/01/COLGATE-KIDS-500x500.png" }),
    P({ id: "listerine-cool-mint", name: "Listerine Cool Mint Mouthwash", brand: "Listerine", strength: "Cool Mint", generic: "Antiseptic mouthwash", form: "mouthwash", unit: "Bottle", cat: "oral-care", mfr: "kenvue", pack: "250ml", use: "Kills germs that cause bad breath and plaque." }),
    P({ id: "colgate-plax-mouthwash", name: "Colgate Plax Peppermint Fresh Mouthwash", brand: "Colgate Plax", strength: "Peppermint Fresh", generic: "Mouthwash", form: "mouthwash", unit: "Bottle", cat: "oral-care", mfr: "colgate", use: "Mouthwash for fresh breath and cleaner teeth.", image: "https://colgate.com.pk/wp-content/uploads/2020/02/Colgate-Plax-Peppermint-Fresh-1-500x500.jpg" }),
    P({ id: "colgate-misvak-toothpaste", name: "Colgate Misvak Toothpaste", brand: "Colgate", strength: "Misvak", generic: "Toothpaste with miswak extract", form: "toothpaste", unit: "Tube", cat: "oral-care", mfr: "colgate", use: "Toothpaste with natural miswak extract for strong teeth and healthy gums.", image: "https://colgate.com.pk/wp-content/uploads/2020/01/misvak-image1-500x500.jpg" }),
    P({ id: "colgate-sensitive-pro-relief", name: "Colgate Sensitive Pro-Relief Toothpaste", brand: "Colgate", strength: "Sensitive Pro-Relief", generic: "Toothpaste for sensitive teeth", form: "toothpaste", unit: "Tube", cat: "oral-care", mfr: "colgate", use: "Relief for sensitive teeth with regular use.", image: "https://colgate.com.pk/wp-content/uploads/2020/01/100g-CSPR-Original-1-1-500x500.jpg" }),
    P({ id: "colgate-total-advanced-health", name: "Colgate Total Advanced Health Toothpaste", brand: "Colgate", strength: "Total", generic: "Fluoride toothpaste", form: "toothpaste", unit: "Tube", cat: "oral-care", mfr: "colgate", use: "All-round protection for teeth and gums.", image: "https://colgate.com.pk/wp-content/uploads/2020/01/Advance-Health40g-1-500x500.jpg" }),
    P({ id: "colgate-optic-white", name: "Colgate Optic White Toothpaste", brand: "Colgate", strength: "Optic White", generic: "Whitening toothpaste", form: "toothpaste", unit: "Tube", cat: "oral-care", mfr: "colgate", use: "Whitening toothpaste that removes surface stains.", image: "https://colgate.com.pk/wp-content/uploads/2020/02/COLGATE-OPTIC-WHITE-DAZZLING-WHITE.jpg" }),
    P({ id: "colgate-360-whole-mouth-clean", name: "Colgate 360° Whole Mouth Clean Toothbrush", brand: "Colgate", strength: "360°", generic: "Manual toothbrush with tongue cleaner", form: "toothbrush", unit: "Piece", cat: "oral-care", mfr: "colgate", use: "Cleans teeth, tongue and cheeks for a fresher mouth.", image: "https://colgate.com.pk/wp-content/uploads/2020/01/COLGATE-360%C2%BA-WHOLE-MOUTH-CLEAN-500x500.png" }),
    P({ id: "colgate-slimsoft-toothbrush", name: "Colgate Slimsoft Toothbrush", brand: "Colgate", strength: "Slimsoft", generic: "Soft toothbrush", form: "toothbrush", unit: "Piece", cat: "oral-care", mfr: "colgate", use: "Ultra-thin soft bristles, gentle on gums.", image: "https://colgate.com.pk/wp-content/uploads/2020/01/COLGATE-SLIMSOFT-500x500.png" }),
    P({ id: "colgate-plax-freshmint", name: "Colgate Plax Freshmint Mouthwash", brand: "Colgate Plax", strength: "Freshmint", generic: "Mouthwash", form: "mouthwash", unit: "Bottle", cat: "oral-care", mfr: "colgate", use: "Mouthwash for fresh breath and cleaner teeth.", image: "https://colgate.com.pk/wp-content/uploads/2020/01/Colgate-Plax-Freshmint-1-500x500.jpg" }),

    /* ---------- Personal Care & Hygiene ---------- */
    P({ id: "dettol-original-soap", name: "Dettol Original Soap", brand: "Dettol", strength: "Soap", generic: "Antibacterial soap", form: "soap", unit: "Piece", cat: "personal-care", mfr: "reckitt", use: "Antibacterial bathing soap for everyday hygiene.", featured: true }),
    P({ id: "safeguard-soap", name: "Safeguard Soap", brand: "Safeguard", strength: "Soap", generic: "Germ-protection soap", form: "soap", unit: "Piece", cat: "personal-care", mfr: "pg", use: "Germ-protection soap for the whole family." }),
    P({ id: "lifebuoy-soap", name: "Lifebuoy Soap", brand: "Lifebuoy", strength: "Soap", generic: "Germ-protection soap", form: "soap", unit: "Piece", cat: "personal-care", mfr: "unilever", use: "Germ-protection soap for everyday hygiene." }),
    P({ id: "lux-soap", name: "Lux Soap", brand: "Lux", strength: "Soap", generic: "Beauty soap", form: "soap", unit: "Piece", cat: "personal-care", mfr: "unilever", use: "Fragrant beauty soap." }),
    P({ id: "dove-beauty-bar", name: "Dove Beauty Bar", brand: "Dove", strength: "Beauty Bar", generic: "Moisturising beauty bar", form: "soap", unit: "Piece", cat: "personal-care", mfr: "unilever", use: "Gentle cleansing bar with moisturising cream." }),
    P({ id: "dettol-liquid-handwash", name: "Dettol Liquid Handwash", brand: "Dettol", strength: "Handwash", generic: "Antibacterial handwash", form: "handwash", unit: "Bottle", cat: "personal-care", mfr: "reckitt", use: "Antibacterial liquid handwash." }),
    P({ id: "lifebuoy-handwash", name: "Lifebuoy Handwash", brand: "Lifebuoy", strength: "Handwash", generic: "Germ-protection handwash", form: "handwash", unit: "Bottle", cat: "personal-care", mfr: "unilever", use: "Germ-protection liquid handwash." }),
    P({ id: "dettol-hand-sanitizer", name: "Dettol Hand Sanitizer", brand: "Dettol", strength: "Sanitizer", generic: "Alcohol hand sanitizer", form: "sanitizer", unit: "Bottle", cat: "personal-care", mfr: "reckitt", use: "Kills germs on hands without water." }),
    P({ id: "head-and-shoulders-shampoo", name: "Head & Shoulders Anti-Dandruff Shampoo", brand: "Head & Shoulders", strength: "Shampoo", generic: "Anti-dandruff shampoo", form: "shampoo", unit: "Bottle", cat: "personal-care", mfr: "pg", use: "Anti-dandruff shampoo for a clean, flake-free scalp." }),
    P({ id: "pantene-shampoo", name: "Pantene Shampoo", brand: "Pantene", strength: "Shampoo", generic: "Hair care shampoo", form: "shampoo", unit: "Bottle", cat: "personal-care", mfr: "pg", use: "Shampoo for strong, smooth hair." }),
    P({ id: "sunsilk-shampoo", name: "Sunsilk Shampoo", brand: "Sunsilk", strength: "Shampoo", generic: "Hair care shampoo", form: "shampoo", unit: "Bottle", cat: "personal-care", mfr: "unilever", use: "Everyday shampoo for soft, shiny hair." }),
    P({ id: "clear-anti-dandruff-shampoo", name: "Clear Anti-Dandruff Shampoo", brand: "Clear", strength: "Shampoo", generic: "Anti-dandruff shampoo", form: "shampoo", unit: "Bottle", cat: "personal-care", mfr: "unilever", use: "Anti-dandruff shampoo." }),
    P({ id: "always-sanitary-pads", name: "Always Sanitary Pads", brand: "Always", strength: "Pads", generic: "Sanitary napkins", form: "pads", unit: "Pack", cat: "personal-care", mfr: "pg", use: "Comfortable, absorbent sanitary pads." }),
    P({ id: "gillette-disposable-razors", name: "Gillette Disposable Razors", brand: "Gillette", strength: "Razors", generic: "Disposable shaving razors", form: "razor", unit: "Pack", cat: "personal-care", mfr: "pg", use: "Disposable razors for a smooth shave." }),

    /* ---------- More skin & baby care ---------- */
    P({ id: "vaseline-body-lotion", name: "Vaseline Intensive Care Body Lotion", brand: "Vaseline", strength: "Body Lotion", generic: "Moisturising body lotion", form: "lotion", unit: "Bottle", cat: "skin", mfr: "unilever", use: "Moisturising lotion for dry skin." }),
    P({ id: "ponds-cold-cream", name: "Pond's Cold Cream", brand: "Pond's", strength: "Cold Cream", generic: "Moisturising cold cream", form: "jar", unit: "Jar", cat: "skin", mfr: "unilever", use: "Rich cream for dry skin in winter." }),
    P({ id: "johnsons-baby-soap", name: "Johnson's Baby Soap", brand: "Johnson's", strength: "Baby Soap", generic: "Mild baby soap", form: "soap", unit: "Piece", cat: "baby", mfr: "kenvue", kids: true, use: "Mild soap for baby's bath time." }),
    P({ id: "pigeon-baby-powder", name: "Pigeon Baby Powder", brand: "Pigeon", strength: "Baby Powder", generic: "Baby powder", form: "powder", unit: "Bottle", cat: "baby", mfr: "pigeon", kids: true, use: "Keeps baby's skin dry and comfortable." }),
    P({ id: "pigeon-baby-shampoo", name: "Pigeon Baby Shampoo", brand: "Pigeon", strength: "Baby Shampoo", generic: "Gentle baby shampoo", form: "shampoo", unit: "Bottle", cat: "baby", mfr: "pigeon", kids: true, use: "Gentle shampoo for baby's hair." })
  ];

  return { categories: categories, manufacturers: manufacturers, products: products };
});
