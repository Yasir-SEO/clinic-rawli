# Adil Child Care Clinic & Pharmacy — Rohillanwali

Website for **Adil Child Care Clinic & Pharmacy** (also known as Adil Medical Store), a children's clinic and pharmacy in Rohillanwali, District Muzaffargarh, Punjab, Pakistan.

Facebook: https://www.facebook.com/Adilmedicalstore

It's a fast, mobile-first static site with no build step and no dependencies, so it can be hosted free on GitHub Pages.

## What's included

- **Clinic, pharmacy, ordering, timings, location, FAQ** sections in English, with Urdu headings and a full Urdu "About us" section.
- **WhatsApp ordering form.** The visitor fills in their medicines (or a clinic or general question) and it opens WhatsApp with the message ready to send. Nothing is stored on the site.
- **Live "Open now / Closed now" status** worked out in Pakistan time from the opening-hours table.
- **Local SEO:** title and meta description targeting Rohillanwali and Muzaffargarh, `MedicalClinic` + `Pharmacy` structured data (JSON-LD), FAQ rich-result markup, Open Graph share image, `sitemap.xml` and `robots.txt`.
- Sticky header, mobile menu, and floating Call / WhatsApp buttons on phones.

```
index.html         Main page (content + SEO tags + JSON-LD)
css/style.css      Styles
js/main.js         Menu, open/closed status, WhatsApp form
assets/            Logo, app icons, social share image (og-image.png)
404.html           Not-found page
robots.txt, sitemap.xml, site.webmanifest
```

## Fill in your details (before going live)

The real phone number, exact address and timings aren't online anywhere I could reach, so the site uses placeholders. Use **find and replace across all files** for these:

| Find | Replace with | Example |
| --- | --- | --- |
| `+92 3XX XXXXXXX` | Phone number as shown to visitors | `+92 300 1234567` |
| `+923XXXXXXXXX` | Phone number for call links (no spaces) | `+923001234567` |
| `923XXXXXXXXX` | WhatsApp number (country code, no `+`, no spaces) | `923001234567` |

Then check these in `index.html`:

1. **Opening hours.** The table under `<!-- Edit hours here -->` uses 24-hour times (`data-open="09:00" data-close="22:00"`). Mark a closed day with `data-closed="true"`. Update the matching `openingHoursSpecification` in the JSON-LD and the FAQ answer "What are your timings?" (it appears twice: in the JSON-LD and in the visible FAQ). The placeholder hours are **9:00 AM – 10:00 PM daily**.
2. **Address.** Add the street or landmark (e.g. "Main Bazaar, near …") in the Address card. In the JSON-LD `address`, add `"streetAddress"` and, if you know it, `"postalCode"`.
3. **Map.** Once the shop is on Google Maps, replace the map `<iframe src>` (Google Maps → Share → Embed a map) and the **Get Directions** link with your exact listing. You can also add `"geo": {"@type": "GeoCoordinates", "latitude": …, "longitude": …}` to the JSON-LD.
4. **Services.** Check the clinic and pharmacy lists (e.g. nebulization, vaccination guidance, home delivery) and remove anything you don't offer.
5. **Doctor.** If you'd like to name the doctor and their qualifications, add them to the Clinic section.

## Publish on GitHub Pages

1. Repository **Settings → Pages**.
2. Under *Build and deployment*, choose **Deploy from a branch**, then select the branch and `/ (root)`.
3. The site will be live at `https://yasir-seo.github.io/clinic-rawli/`.

**Using your own domain?** Replace `https://yasir-seo.github.io/clinic-rawli/` everywhere (canonical, Open Graph, JSON-LD, `robots.txt`, `sitemap.xml`), and change the `/clinic-rawli/` paths in `404.html` to `/`.

## Local SEO checklist

- Create or claim a **Google Business Profile** for "Adil Child Care Clinic & Pharmacy", category *Pharmacy* (plus *Pediatrician* / *Medical clinic*), and link it to this website.
- Use **exactly the same name, address and phone number** on the website, Google, Facebook and any directory listings.
- Submit `sitemap.xml` in **Google Search Console**.
- Link to the website from the Facebook page.
- Ask happy customers to leave Google reviews.
- Test the structured data with Google's [Rich Results Test](https://search.google.com/test/rich-results).

## Preview locally

```bash
npx serve .
# or
python3 -m http.server 8000
```
