# Adil Child Care Clinic & Pharmacy — Rohillanwali

Website and online medicine shop for **Adil Child Care Clinic & Pharmacy** (also known as Adil Medical Store), a children's clinic and pharmacy in Rohillanwali, District Muzaffargarh, Punjab, Pakistan.

Facebook: https://www.facebook.com/Adilmedicalstore

It's a fast static site: no server, database or monthly fees. It's hosted free on GitHub Pages, and orders arrive on the shop's WhatsApp.

## What's included

**Online shop (WooCommerce-style)**
- **211 products**, organised the way a children's clinic works. The main menu has four sections:
  - **Kids' Medicines:** Fever & Pain; Cough, Cold & Allergy; Tummy, Diarrhoea & Worms; Antibiotics; Vitamins & Nutrition.
  - **Baby & Kids Care:** Diapers & Wipes; Bath & Skin Care; Feeding & Formula.
  - **Adult Medicines:** Fever & Pain, Cough & Cold, Allergy & Asthma, Stomach, Antibiotics, Diabetes, Heart & BP, Skin, Eye/Ear/Nose, Vitamins, Herbal.
  - **Personal Care & Health:** Oral Care, Personal & Skin Care, First Aid, Medical Devices.

  Adult medicine pages list adult and family medicines, and medicines made only for children are on the matching Kids' page (each page links to the other).
- **Manufacturer strip** of 33 companies (GSK, Haleon, Abbott, Getz, Searle, Sami, Hilton, Novartis, Sanofi, Colgate-Palmolive, Unilever, P&G, Reckitt and more). Each one has its own brand page.
- **A page for every medicine:** active ingredient, strength, form, manufacturer, prescription status, related products and structured data for Google.
- **Shop page features:** live search with suggestions in the header, filters (category, manufacturer, kids, no-prescription), sorting, and "Load more".
- **Cart:** add to cart with quantity buttons, a slide-out mini cart, a full cart page, and "Request a medicine" for anything not listed.
- **Request any medicine:** searches also show matches from a list of about 14,700 medicines sold in Pakistan (name, maker and pack size only), each with a **Request** button that adds it to the cart. Controlled medicines are left out of this list.
- **Checkout:** name and mobile, pickup or home delivery with address, payment method and notes. A prescription confirmation is required for Rx items.
- **Placing an order** opens WhatsApp with the full order (order number, items, customer details) ready to send. Nothing is stored on the website.

**Clinic & local SEO**
- Clinic services, timings with a live "Open now" status in Pakistan time, map, Urdu section and FAQ.
- Structured data for Google: `MedicalClinic` + `Pharmacy`, `FAQPage`, `Drug` for each product, breadcrumbs, and the sitemap.

## Fill in your details (before going live)

Everything shop-wide lives in **`site.config.json`**. The phone/WhatsApp number (0302 5037681), email, Facebook and Instagram links come from the shop's Facebook Page. The pharmacy is open 9 AM–10 PM daily and the child specialist is in on Saturday and Sunday. Delivery charges are still to confirm. Example:

```json
"phoneDisplay": "+92 300 1234567",
"phoneTel": "+923001234567",
"whatsapp": "923001234567",
"hours": { "monday": ["09:00", "22:00"], "friday": ["09:00", "22:00"], "sunday": null },
"deliveryFee": 100,
"paymentMethods": ["Cash on delivery", "Pay at the shop", "JazzCash / Easypaisa"]
```

- `whatsapp`: country code + number, digits only. All orders are sent here.
- `geo`: the shop's map position (latitude, longitude), set to the Meezan Bank Rohillanwali branch from the bank's branch locator (the shop is near it, opposite Canal Rest House). `landmark` / `landmarkUrdu` describe this on the contact card. To move the pin, right-click the exact spot in Google Maps (or press and hold on a phone), copy the two numbers and put them here.
- The home page map (Timings & location) is an OpenStreetMap map drawn with Leaflet (`vendor/leaflet/`, `js/map.js`). It shows a pin labelled with the shop and clinic names and the `landmark` text. **Open in Google Maps** and **Get Directions** go to Google Maps. If the map script can't load, a Google Maps frame shows instead.
- `hours`: 24-hour times, Pakistan time. Use `null` for a closed day.
- `gynae`: the lady gynaecologist's name, days and hours (Dr. Saima Zubair Rao, Sunday 10:00–17:00). `clinicPhones`: the clinic's appointment numbers from the Facebook posts. The doctor cards, the "Advice from our doctors" tips and posters (`assets/clinic/`) are in `src/pages/index.html`.
- `doctorDays`: the days the child specialist sees patients, e.g. `["saturday", "sunday"]`. They show on the home page, the timings table and in the FAQ (the Urdu text on the home page is in `src/pages/index.html`).
- `deliveryFee`: a number in rupees, `0` for free delivery, or `null` to confirm it on WhatsApp.
- `freeDeliveryOver` / `deliveryRadiusKm`: the free delivery offer (now Rs 3,000 within 5 km). It shows in the top bar, the home page, product pages, the cart, checkout and the WhatsApp order. Checkout shows delivery as Free automatically once an order has prices adding up to the amount. Set `freeDeliveryOver` to `null` to remove the offer.

Then **rebuild** (see below). The phone, hours and WhatsApp links update on every page.

Also check:
1. **Prices.** All products show **"Price on request"**, and the price is confirmed on WhatsApp. To show a price, add `price` (in rupees) to a product in `data/products.js`; the cart, totals and Google data use it automatically. 38 common medicines already list their pack size (`pack`).
2. **Products.** The catalogue lists common medicines sold in Pakistan with their manufacturers. Remove what you don't stock and add what you do; each product is one line in `data/products.js`. Controlled medicines (sleeping pills, tramadol, codeine syrups, etc.) are deliberately **not** listed for online ordering.
3. **Address & map.** Add the street or landmark in `src/pages/index.html` (Address card), and the Google Maps link or embed for your exact location.
4. **Services.** Check the clinic services list in `src/pages/index.html`.

## Editing products

Open `data/products.js`. Each product is one line:

```js
P({ id: "panadol-500mg-tablets", name: "Panadol 500mg Tablets", brand: "Panadol", strength: "500mg",
    generic: "Paracetamol", form: "tablet", unit: "Strip", cat: "fever-pain", mfr: "haleon",
    pack: "10 tablets", use: "Relief from fever, headache, toothache and body aches.", featured: true }),
```

- `price` is the retail price (MRP) of one `unit`, and `pack` says what is inside it, e.g. `"10 tablets"`, `"90ml"` or `"20g"`. Leave `price` out to show "Price on request".

- `rx: true` marks a prescription medicine.
- `kids: true` puts a product on the Kids' pages (medicines) or Baby & Kids Care (other products). A children's medicine is then *not* listed on the adult page; add `all: true` as well for products meant for children and adults alike (e.g. ORS, Prospan), so they show on both.
- Categories, and which menu each sits in, are at the top of `data/products.js`. The Kids' sections are "virtual" categories worked out from the products (see the notes there), so there is nothing extra to tag.
- `featured: true` shows it in "Popular medicines" on the home page.
- New manufacturers go in the `manufacturers` list at the top of the same file, and they appear in the brand strip automatically.
- The product picture is drawn automatically from the brand name, strength and form. No photos are needed.

## Product photos

About 90 products show a real photo. Most come from the brands' and manufacturers' own websites. Thirteen are free-licensed photos from Wikimedia Commons; each of those shows its photographer and licence under the photo, and all are listed on the Photo credits page (`credits.html`, from `assets/products/credits.json`). Some photos are a brand's international pack, which can look a little different from the Pakistani one; replace any with your own photo if you prefer. The rest show a drawn pack until you add a real photo. To add one:

1. Take a clear photo of the pack (from the front, on a plain white background, in good light), or use an official image the company or distributor has supplied to you.
2. Name it after the product's `id`, for example `panadol-500mg-tablets.jpg` (`.jpg`, `.png` or `.webp`). Keep it around 800 × 800 px and under 200 KB.
3. Put it in `assets/products/` and rebuild.

The photo then appears on the product card, product page, search suggestions, cart and checkout, and is used as the product's share image. Don't copy photos from other pharmacy websites or Google Images; those belong to someone else.

**Getting photos from brand websites:** list the brand's product pages in `tools/fetch-list.txt` as `photo_<product-id> | https://...` and push. The GitHub "Fetch web pages" job saves each page's main product photo as `tools/fetched/img_<product-id>.*`. Check them, then run `python3 tools/process_images.py` to turn them into `assets/products/<product-id>.jpg`.

**Manufacturer logos** (the round badges in the "Trusted manufacturers" slider) are in `assets/brands/<manufacturer-id>.png`. They come from Wikimedia Commons and the companies' own websites. To add or replace one, list it in `tools/fetch-list.txt` as `img_logo_<manufacturer-id> | https://...logo.svg` (or `logo_<manufacturer-id> | https://company-website/` to pick up the site's logo) and push. Then run `node tools/process_logos.mjs`, which trims each logo and sizes it to fit its circle. A company without a logo file shows its initials. LEO Pharma and Woodward's show initials for now.

**Linking to a photo instead:** add `image: "https://..."` to a product in `data/products.js` to show a photo hosted on another site (for example the brand's own website). It is shown on top of the drawn pack; if the link ever breaks, the drawn pack shows instead. Saved photos are still more reliable.

## Build

After changing `site.config.json`, `data/products.js` or anything in `src/`, run:

```bash
node scripts/build.mjs        # or: npm run build
```

This regenerates `index.html`, `shop.html`, `cart.html`, `checkout.html`, `categories/`, `brands/`, `medicines/`, `js/config.js`, `sitemap.xml` and `robots.txt`. Commit the result. Don't edit the generated HTML files directly; your changes would be overwritten on the next build.

```
site.config.json     Phone, WhatsApp, hours, delivery, payment
data/products.js     Categories, manufacturers, products
src/layout.html      Page shell (head, scripts)
src/partials/        Header, footer, icons
src/pages/           Home, cart, checkout
src/templates/       Shop/category/brand listing, product page
scripts/build.mjs    Generator
css/style.css        Styles
js/catalog.js        Product pictures, cards, search (shared with the build)
js/store.js          Cart, mini cart, header search
js/shop.js           Filters, sorting, load more
js/checkout.js       Cart page and WhatsApp checkout
js/main.js           Open/closed status, WhatsApp quick form
data/all-medicines.json  "Request any medicine" list (made by tools/build_medicine_index.py)
```

## Preview locally

```bash
python3 -m http.server 8000     # then open http://localhost:8000
```

## Publish on GitHub Pages

1. Make the repository public (**Settings → General → Change visibility**), or use GitHub Pro.
2. Go to **Settings → Pages**, choose **Deploy from a branch**, then the branch and `/ (root)`, and save.
3. The site will be live at `https://yasir-seo.github.io/clinic-rawli/`.

**Using your own domain?** Change `siteUrl` in `site.config.json`, rebuild, and update the `/clinic-rawli/` paths in `404.html`.

## Local SEO checklist

- Create or claim a **Google Business Profile** for "Adil Child Care Clinic & Pharmacy" (category *Pharmacy*, plus *Pediatrician* / *Medical clinic*) and link it to the website.
- Use **exactly the same name, address and phone number** on the website, Google, Facebook and directories.
- Submit `sitemap.xml` in **Google Search Console**. It lists every category, brand and medicine page.
- Link the website from the Facebook page and ask happy customers for Google reviews.
- Test pages with Google's [Rich Results Test](https://search.google.com/test/rich-results).

Brand names and trademarks belong to their respective owners.
