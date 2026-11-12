"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import bangladeshLocations from "./bangladesh-locations.json";

const offers = [
  { id: "single", title: "প্রিমিয়াম কার্গো প্যান্ট", subtitle: "১ পিস প্রিমিয়াম কার্গো প্যান্ট", price: 880, pieces: 1 },
  { id: "two", title: "২ পিসের প্রিমিয়াম কার্গো প্যান্ট", subtitle: "২ পিস কম্বো প্যাক", price: 1380, old: 1760, badge: "সেরা অফার", pieces: 2 },
  { id: "three", title: "প্রিমিয়াম কার্গো প্যান্ট কম্বো - (৩-প্যাক)", subtitle: "৩ পিস কম্বো প্যাক", price: 1880, badge: "সর্বোচ্চ সাশ্রয়", pieces: 3 },
];

const heroOffers = [
  { oldPrice: "১,৭৬০", price: "১,৩৮০", label: "২ পিস কম্বো অফার" },
  { oldPrice: "২,৬৪০", price: "১,৮৮০", label: "৩ পিস কম্বো অফার" },
];

const sizes = ["L", "XL", "XXL", "XXXL", "4XL"];
const colors = ["Black", "Olive", "Beige", "Navy"];
const sizeSurcharge = 100;

type ItemSelection = { size: string; color: string };

const productImages = [
  { src: "https://res.cloudinary.com/viwdfpoo/image/upload/f_auto,q_auto/2", alt: "Olive cargo pants" },
  { src: "https://res.cloudinary.com/viwdfpoo/image/upload/f_auto,q_auto/3", alt: "Cargo pants combo styles" },
  { src: "https://res.cloudinary.com/viwdfpoo/image/upload/f_auto,q_auto/4", alt: "Style Luk cargo pants" },
  { src: "https://res.cloudinary.com/viwdfpoo/image/upload/f_auto,q_auto/5", alt: "Cargo pants outfit" },
  { src: "https://res.cloudinary.com/viwdfpoo/image/upload/f_auto,q_auto/6", alt: "Cargo pants in multiple colors" },
  { src: "https://res.cloudinary.com/viwdfpoo/image/upload/f_auto,q_auto/7", alt: "Black cargo pants" },
  { src: "https://res.cloudinary.com/viwdfpoo/image/upload/f_auto,q_auto/8", alt: "Cargo pants detail" },
];

export default function Home() {
  const [selected, setSelected] = useState("single");
  const [heroOfferIndex, setHeroOfferIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [itemSelections, setItemSelections] = useState<ItemSelection[]>([{ size: "", color: "" }]);
  const [selectionError, setSelectionError] = useState("");
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [upazila, setUpazila] = useState("");
  const [shipping, setShipping] = useState("inside");
  const [secondsLeft, setSecondsLeft] = useState(14 * 3600 + 22 * 60 + 45);
  const [sent, setSent] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const successCloseButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setSecondsLeft(s => s > 0 ? s - 1 : 14 * 3600 + 22 * 60 + 45), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        setHeroOfferIndex(index => (index + 1) % heroOffers.length);
      }
    }, 3500);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!sent) return;

    const previousOverflow = document.body.style.overflow;
    successCloseButton.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "auto" });
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSent(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [sent]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        setCarouselIndex(index => (index + 1) % productImages.length);
      }
    }, 2500);

    return () => window.clearInterval(timer);
  }, []);

  const chosen = offers.find(p => p.id === selected) ?? offers[0];
  const itemCount = chosen.pieces * quantity;
  const subtotal = chosen.price * quantity;
  const sizeSurcharges = itemSelections.slice(0, itemCount).some(item => item.size === "4XL") ? sizeSurcharge : 0;
  const delivery = shipping === "inside" ? 70 : 120;
  const total = subtotal + sizeSurcharges + delivery;
  const selectedDivision = bangladeshLocations.find(location => location.name === division);
  const districts = selectedDivision?.districts ?? [];
  const selectedDistrict = districts.find(location => location.name === district);
  const upazilas = selectedDistrict?.upazilas ?? [];

  useEffect(() => {
    setItemSelections(current => Array.from({ length: itemCount }, (_, index) => current[index] ?? { size: "", color: "" }));
  }, [itemCount]);

  function updateItemSelection(index: number, field: keyof ItemSelection, value: string) {
    const updatedItems = Array.from({ length: itemCount }, (_, itemIndex) => {
      const item = itemSelections[itemIndex] ?? { size: "", color: "" };
      return itemIndex === index ? { ...item, [field]: value } : item;
    });
    setItemSelections(updatedItems);
    setSelectionError(getItemSelectionError(updatedItems));
  }

  function getItemSelectionError(items: ItemSelection[]) {
    const missingSizeIndex = items.findIndex(item => !item.size);
    if (missingSizeIndex !== -1) return `পিস ${missingSizeIndex + 1}-এর সাইজ নির্বাচন করুন।`;

    const missingColorIndex = items.findIndex(item => !item.color);
    if (missingColorIndex !== -1) return `পিস ${missingColorIndex + 1}-এর কালার নির্বাচন করুন।`;

    return "";
  }

  function handlePointerOnlySelection(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      window.scrollBy({ top: event.key === "ArrowDown" ? 80 : -80, behavior: "smooth" });
    } else if ([" ", "Enter", "ArrowLeft", "ArrowRight"].includes(event.key)) {
      event.preventDefault();
    }
  }

  const time = useMemo(() => ({
    days: Math.floor(secondsLeft / 86400),
    hours: Math.floor((secondsLeft % 86400) / 3600),
    minutes: Math.floor((secondsLeft % 3600) / 60),
    seconds: secondsLeft % 60,
  }), [secondsLeft]);

async function submitOrder(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  setOrderError("");
  setSelectionError("");

  const form = event.currentTarget;
  if (!form.reportValidity()) return;

  const selectedItems = itemSelections.slice(0, itemCount);
  if (selectedItems.some(item => !item.size || !item.color)) {
    setSelectionError("প্রতিটি প্যান্টের সাইজ ও কালার নির্বাচন করুন।");
    return;
  }

  const formData = new FormData(form);
  const orderData = {
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    division,
    district,
    upazila,
    address: String(formData.get("address") ?? ""),
    note: String(formData.get("note") ?? ""),
    productId: chosen.id,
    quantity,
    items: selectedItems,
    shipping,
  };

  setOrderSubmitting(true);

  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });
    const result = await response.json().catch(() => null);

    if (!response.ok || !result?.success) {
      throw new Error(result?.message || "অর্ডার জমা হয়নি।");
    }

    setSent(true);
    form.reset();
    setDivision("");
    setDistrict("");
    setUpazila("");
    setShipping("inside");
    setQuantity(1);
    setSelected("single");
    setItemSelections([{ size: "", color: "" }]);
    setSelectionError("");
    setOrderError("");
  } catch (error) {
    console.error(error);
    setOrderError(error instanceof Error ? error.message : "সমস্যা হয়েছে। আবার চেষ্টা করুন।");
  } finally {
    setOrderSubmitting(false);
  }
}

  

  return (
    <main>
      <div className="topline">
        <div className="toplineMessage">অগ্রিম টাকা ছাড়াই অর্ডার করুন <span>✦</span> সময় মাত্র অল্প</div>
        <a className="toplineOrder" href="#order">Order Now</a>
      </div>
      <header className="header">
        <a className="brand" href="#"><img src="https://res.cloudinary.com/viwdfpoo/image/upload/f_auto,q_auto/styleluk-logo" alt="STYLE LUK" /><span>STYLE LUK<small>WEAR YOUR STYLE</small></span></a>
      </header>

      <section className="hero">
        <div className="heroBg" />
        <div className="heroContent">
          <p className="eyebrow">STYLE LUK PRESENTS</p>
          <h1>PREMIUM<br /><em>CARGO PANTS</em></h1>
          <p className="heroBangla">স্টাইল, আরাম ও প্রিমিয়াম কোয়ালিটির পারফেক্ট কম্বিনেশন।</p>
          <div className="heroPrice" aria-label="কম্বো অফার" aria-live="polite">
            {heroOffers.map((offer, index) => (
              <div className={index === heroOfferIndex ? "heroPriceOffer active" : "heroPriceOffer"} key={offer.label} aria-hidden={index !== heroOfferIndex}>
                <del>৳ {offer.oldPrice}</del><strong>৳ {offer.price}</strong><small>{offer.label}</small>
              </div>
            ))}
          </div>
          <a className="goldBtn" href="#order">অর্ডার করতে চাই <span>↗</span></a>
          <p className="codNote">✓ অগ্রিম কোনো টাকা লাগবে না · ১০০% ক্যাশ অন ডেলিভারি</p>
        </div>
      </section>

      <section className="countdownBand">
        <div className="countdownMessage"><p className="eyebrow">LIMITED TIME OFFER</p><h2>অফার শেষ হওয়ার আগেই অর্ডার করুন</h2></div>
        <div className="timer">{[["days", "দিন"], ["hours", "ঘন্টা"], ["minutes", "মিনিট"], ["seconds", "সেকেন্ড"]].map(([key, label]) => <div className="timeUnit" key={key}><b>{String(time[key as keyof typeof time]).padStart(2, "0")}</b><span>{label}</span></div>)}</div>
      </section>

      <section className="offerSection section" id="offer">
        <div className="sectionTitle"><p className="eyebrow">EXCLUSIVE COMBO DEALS</p><h2>আমাদের <em>বিশেষ অফার</em></h2><p>আপনার পছন্দের কম্বো বেছে নিন এবং সাশ্রয় করুন।</p></div>
        <div className="dealGrid">
          <article className="dealCard"><span className="dealTag">১ পিস</span><h3>প্রিমিয়াম কার্গো প্যান্ট</h3><p className="dealPrice">৳ ৮৮০</p><button onClick={() => {setSelected("single"); document.getElementById("order")?.scrollIntoView({behavior:"smooth"});}}>এই অফার নিন</button></article>
          <article className="dealCard featured"><span className="dealTag">জনপ্রিয় অফার</span><h3>২ পিস কার্গো প্যান্ট</h3><p className="oldPrice">পূর্বের মূল্য ৳ ১,৭৬০</p><p className="dealPrice dealPricePulse"><span className="offerLabel">অফার মূল্য</span> ৳ ১,৩৮০</p><small>অরিজিনাল চায়না দুব্বি ফেব্রিক্স · ৫% স্ট্রেচ</small><button onClick={() => {setSelected("two"); document.getElementById("order")?.scrollIntoView({behavior:"smooth"});}}>এই অফার নিন</button></article>
          <article className="dealCard"><span className="dealTag">৩ পিস কম্বো</span><h3>প্রিমিয়াম কার্গো প্যান্ট</h3><p className="oldPrice">পূর্বের মূল্য ৳ ২,৬৪০</p><p className="dealPrice dealPricePulse"><span className="offerLabel">অফার মূল্য</span> ৳ ১,৮৮০</p><button onClick={() => {setSelected("three"); document.getElementById("order")?.scrollIntoView({behavior:"smooth"});}}>এই অফার নিন</button></article>
        </div>
      </section>

      <section className="whySection">
        <div className="whyImage">
          <div className="whyCarousel" role="region" aria-label="পণ্যের ছবি" aria-roledescription="carousel">
            <div className="whyCarouselTrack" aria-live="polite">
              {productImages.map((image, index) => (
                <img className={index === carouselIndex ? "carouselImage active" : "carouselImage"} key={image.src} src={image.src} alt={image.alt} aria-hidden={index !== carouselIndex} />
              ))}
            </div>
            <button className="carouselArrow carouselPrevious" type="button" aria-label="আগের ছবি" onClick={() => setCarouselIndex(index => (index - 1 + productImages.length) % productImages.length)}>‹</button>
            <button className="carouselArrow carouselNext" type="button" aria-label="পরের ছবি" onClick={() => setCarouselIndex(index => (index + 1) % productImages.length)}>›</button>
            <div className="carouselDots" aria-label="ছবি নির্বাচন করুন">
              {productImages.map((image, index) => (
                <button key={image.src} type="button" aria-label={`${index + 1} নম্বর ছবি`} aria-current={index === carouselIndex} onClick={() => setCarouselIndex(index)} />
              ))}
            </div>
          </div>
        </div>
        <div className="whyText"><p className="eyebrow">WHY CHOOSE STYLE LUK</p><h2>কেন আমাদের থেকে<br /><em>প্রোডাক্ট কিনবেন?</em></h2>
          <p>আমরা দিচ্ছি নিজস্ব ফ্যাক্টরিতে তৈরি প্রিমিয়াম কোয়ালিটি পণ্য, যা বাজারের অন্য কোথাও পাবেন না।</p>
          <ul>
            <li>ফ্যাশন ও ফিনিশিংয়ে আমরা আপসহীন। প্রতিটি কার্গো প্যান্ট নিখুঁতভাবে তৈরি।</li>
            <li>চায়না দুব্বি ফেব্রিক — ১০% স্ট্রেচ, খুব সফট ও আরামদায়ক।</li>
            <li>বিশেষ কম্বো অফার, যেখানে কম দামে আরও ভালো কিছু পাচ্ছেন।</li>
            <li>কাস্টমার সাপোর্ট ও সহজ রিটার্ন সুবিধা।</li>
          </ul>
          <a className="goldBtn" href="#order">অর্ডার করতে চাই ↗</a>
        </div>
      </section>

      <section className="detailsSection section" id="details">
        <div className="sectionTitle"><p className="eyebrow">PRODUCT DETAILS</p><h2>কার্গো প্যান্ট সম্পর্কে <em>বিস্তারিত</em></h2></div>
        <div className="detailsGrid">
          <div className="detailPhoto"><img src="https://res.cloudinary.com/viwdfpoo/image/upload/f_auto,q_auto/details" alt="Cargo pants in multiple colors" /></div>
          <div className="detailCopy"><h3>আরামদায়ক ও স্টাইলিশ কার্গো প্যান্ট</h3><p>একাধিক পকেট, টেকসই কাপড় ও মডার্ন ডিজাইনে তৈরি। দৈনন্দিন ব্যবহার বা আউটডোর অ্যাক্টিভিটির জন্য আদর্শ।</p>
            <div className="qualityGrid"><div><b>১০০%</b><span>কোয়ালিটিফুল</span></div><div><b>১০০%</b><span>অরিজিনাল চায়না ফেব্রিক্স</span></div><div><b>PREMIUM</b><span>কোয়ালিটির নিশ্চয়তা</span></div></div>
            <ul className="specs"><li><b>Fabric:</b> Chinese Dughi Fabrics (10% Stretch)</li><li><b>Fly:</b> Zipper</li><li><b>Style:</b> 5 Box Pocket Cargo Style with Snap Button</li></ul>
            <a className="goldBtn" href="#order">অর্ডার করতে চাই ↗</a>
          </div>
        </div>
      </section>

      <section className="urgency"><p className="eyebrow">DON'T MISS OUT</p><h2>অফার শেষ হবার আগেই<br /><em>অর্ডার করতে চাই</em></h2><p>২ পিস কার্গো প্যান্ট মাত্র ৳ ১,৩৮০ · ৩ পিস কম্বো মাত্র ৳ ১,৮৮০</p><a href="#order" className="goldBtn">এখনই অর্ডার করুন ↗</a><p className="assurance">অবশ্যই ১০০% কনফার্ম হয়ে অর্ডারটি কনফার্ম করবেন। আমরা আপনার থেকে অগ্রিম কোনো টাকা নিচ্ছি না। কোনো কারণে প্রোডাক্ট রাখতে না চাইলে ডেলিভারি চার্জ দিয়ে ফেরত দিতে পারবেন।</p></section>

      <section className="orderSection section" id="order">
        <div className="sectionTitle"><p className="eyebrow">CASH ON DELIVERY</p><h2>অর্ডার করতে <em>ফর্মটি পূরণ করুন</em></h2><p>অবশ্যই প্রোডাক্টের কালার সিলেক্ট করবেন। আপনার পছন্দের প্যাকেজ নির্বাচন করুন।</p></div>
        <form className="checkout" noValidate onSubmit={submitOrder}>
          <div className="formMain">
            <h3>আপনার Product সিলেক্ট করুন</h3>
            <div className="productChoices">{offers.map(p => <label className={selected === p.id ? "choice selected" : "choice"} key={p.id}><input type="radio" name="product" checked={selected === p.id} onChange={() => setSelected(p.id)} /><span className="choiceTitle">{p.title}</span>{p.old && <del>৳ {p.old}</del>}<b>৳ {p.price.toLocaleString("en-BD")}</b></label>)}</div>
            <div className="quantityRow"><span>পরিমাণ</span><div><button type="button" aria-label="পরিমাণ কমান" disabled={quantity <= 1} onClick={() => setQuantity(current => Math.max(1, current - 1))}>−</button><b>{quantity}</b><button type="button" aria-label="পরিমাণ বাড়ান" disabled={quantity >= 10} onClick={() => setQuantity(current => Math.min(10, current + 1))}>＋</button></div></div>
            <h3>প্রতিটি পিসের সাইজ ও কালার নির্বাচন করুন <span className="required">*</span></h3>
            <p className="sizeNote">যেকোনো পিস 4XL হলে অর্ডারে একবারই অতিরিক্ত ৳ {sizeSurcharge} যোগ হবে।</p>
            <div className="pieceSelections">
              {Array.from({ length: itemCount }, (_, index) => {
                const item = itemSelections[index] ?? { size: "", color: "" };
                return (
                  <fieldset className="pieceSelection" key={index}>
                    <legend>পিস {index + 1}</legend>
                    <span className="pieceOptionLabel">সাইজ নির্বাচন করুন</span>
                    <div className="sizes">
                      {sizes.map(sizeOption => (
                        <label key={sizeOption} className={item.size === sizeOption ? "size active" : "size"}>
                          <input type="radio" name={`size-${index}`} value={sizeOption} checked={item.size === sizeOption} required onKeyDown={handlePointerOnlySelection} onChange={() => updateItemSelection(index, "size", sizeOption)} />
                          {sizeOption}
                        </label>
                      ))}
                    </div>
                    <span className="pieceOptionLabel">কালার নির্বাচন করুন</span>
                    <div className="colorChoices">
                      {colors.map(colorOption => (
                        <label key={colorOption} className={item.color === colorOption ? "color active" : "color"}>
                          <input type="radio" name={`color-${index}`} value={colorOption} checked={item.color === colorOption} required onKeyDown={handlePointerOnlySelection} onChange={() => updateItemSelection(index, "color", colorOption)} />
                          <i className={colorOption.toLowerCase()} />{colorOption}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                );
              })}
            </div>
            {selectionError && <p className="selectionError" role="alert">{selectionError}</p>}
            <h3>আপনার তথ্য</h3>
            <label className="field">আপনার নাম *<input name="name" required placeholder="আপনার সম্পূর্ণ নাম" /></label>
            <label className="field">মোবাইল নম্বর *<input name="phone" type="tel" required placeholder="01XXXXXXXXX" /></label>
            <label className="field">বিভাগ *<select name="division" value={division} required onChange={event => { setDivision(event.target.value); setDistrict(""); setUpazila(""); }}><option value="" disabled>বিভাগ নির্বাচন করুন</option>{bangladeshLocations.map(location => <option value={location.name} key={location.name}>{location.nameBn}</option>)}</select></label>
            <label className="field">জেলা *<select name="district" value={district} required disabled={!division} onChange={event => { setDistrict(event.target.value); setUpazila(""); }}><option value="" disabled>জেলা নির্বাচন করুন</option>{districts.map(location => <option value={location.name} key={location.name}>{location.nameBn}</option>)}</select></label>
            <label className="field">উপজেলা *<select name="upazila" value={upazila} required disabled={!district} onChange={event => setUpazila(event.target.value)}><option value="" disabled>উপজেলা নির্বাচন করুন</option>{upazilas.map(location => <option value={location} key={location}>{location}</option>)}</select></label>
            <label className="field">বিস্তারিত ঠিকানা *<textarea name="address" required rows={3} placeholder="গ্রাম/মহল্লা, বাসা/রোড, পরিচিত স্থান লিখুন" /></label>
            <label className="field">অতিরিক্ত তথ্য (ঐচ্ছিক)<textarea name="note" rows={2} placeholder="বিশেষ কোনো নির্দেশনা থাকলে লিখুন" /></label>
          </div>
          <aside className="summary">
            <h3>Shipping</h3>
            <label className={shipping === "inside" ? "shipChoice chosen" : "shipChoice"}><input type="radio" checked={shipping === "inside"} onChange={() => setShipping("inside")} />ঢাকার ভিতরে ডেলিভারি চার্জ: <b>৳ ৭০</b></label>
            <label className={shipping === "outside" ? "shipChoice chosen" : "shipChoice"}><input type="radio" checked={shipping === "outside"} onChange={() => setShipping("outside")} />ঢাকার বাহিরে ডেলিভারি চার্জ: <b>৳ ১২০</b></label>
            <h3 className="summaryTitle">আপনার অর্ডার</h3>
            <div className="summaryLine"><span>{chosen.title} × {quantity}</span><b>৳ {subtotal.toLocaleString("en-BD")}</b></div>
            <div className="summaryItemDetails">
              {itemSelections.slice(0, itemCount).map((item, index) => (
                <div className="summaryLine" key={index}>
                  <span>পিস {index + 1} · সাইজ: {item.size || "নির্বাচন করুন"} · কালার: {item.color || "নির্বাচন করুন"}</span>
                </div>
              ))}
            </div>
            {sizeSurcharges > 0 && <div className="summaryLine"><span>4XL সাইজের অতিরিক্ত চার্জ (একবার)</span><b>৳ {sizeSurcharges.toLocaleString("en-BD")}</b></div>}
            <div className="summaryLine"><span>সাবটোটাল</span><b>৳ {(subtotal + sizeSurcharges).toLocaleString("en-BD")}</b></div>
            <div className="summaryLine"><span>ডেলিভারি চার্জ</span><b>৳ {delivery}</b></div>
            <div className="summaryTotal"><span>Total</span><b>৳ {total.toLocaleString("en-BD")}</b></div>
            <div className="codBox"><b>সম্পূর্ণ ক্যাশ অন ডেলিভারি</b><span>✅ পণ্য হাতে পেয়ে টাকা পরিশোধ করুন</span></div>
            <button className="goldBtn placeOrder" type="submit" disabled={orderSubmitting}>{orderSubmitting ? "অর্ডার পাঠানো হচ্ছে..." : `অর্ডার করুন · ৳ ${total.toLocaleString("en-BD")}`}</button>
            {orderError && <p className="orderError" role="alert">{orderError}</p>}
          </aside>
        </form>
        <p className="returnText orderReturnNotice">প্রোডাক্ট পছন্দ না হলে অথবা রিটার্ন করতে চাইলে ডেলিভারি চার্জ দিয়ে রিটার্ন করতে পারবেন।</p>
      </section>

      {sent && (
        <div
          className="successModalBackdrop"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setSent(false);
          }}
        >
          <section
            className="successModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="successModalTitle"
            aria-describedby="successModalMessage"
          >
            <button
              ref={successCloseButton}
              className="successModalClose"
              type="button"
              aria-label="বার্তা বন্ধ করুন"
              onClick={() => setSent(false)}
            >
              ×
            </button>
            <div className="successModalMark" aria-hidden="true">✓</div>
            <p className="eyebrow">ORDER CONFIRMED</p>
            <h2 id="successModalTitle">আপনার অর্ডার সফল হয়েছে</h2>
            <p id="successModalMessage">আপনার অর্ডারটি আমরা পেয়েছি। পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন। ধন্যবাদ!</p>
            <button className="goldBtn successModalAction" type="button" onClick={() => setSent(false)}>ঠিক আছে</button>
          </section>
        </div>
      )}

      <footer>
        <div className="footerBrand"><img src="https://res.cloudinary.com/viwdfpoo/image/upload/f_auto,q_auto/styleluk-logo" alt="Style Luk" /><span>STYLE LUK<small>WEAR YOUR STYLE</small></span></div>
        <p>যেকোনো প্রয়োজনে কল করুন</p>
        <div className="socialLinks">
          <a href="https://wa.me/8801886650053" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp এ কল করুন: 01886650053">
            <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path fill="currentColor" d="M16 3.2A12.6 12.6 0 0 0 5.2 22.3L3.5 28.5l6.4-1.7A12.6 12.6 0 1 0 16 3.2Zm0 22.9c-2 0-3.9-.5-5.5-1.6l-.4-.2-3.8 1 1-3.7-.3-.4A10.2 10.2 0 1 1 16 26.1Zm5.6-7.6c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.6-.9-.8-1.6-1.8-1.8-2.1-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.3.3-.6.1-.2 0-.4 0-.6-.1-.2-.7-1.7-1-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.7s1.2 3.1 1.4 3.3c.2.2 2.3 3.5 5.5 4.9.8.4 1.4.6 1.9.7.8.3 1.5.2 2.1.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.6-.4Z" /></svg>
            WhatsApp · 01886650053
          </a>
          <a href="https://www.facebook.com/share/19cdRAodXL/" target="_blank" rel="noopener noreferrer" aria-label="Facebook Messenger এ যোগাযোগ করুন">
            <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path fill="currentColor" d="M16 3C8.7 3 3 8.4 3 15.1c0 3.8 1.9 7.2 4.9 9.4v4.5l4.5-2.5c1.1.3 2.3.5 3.6.5 7.2 0 13-5.4 13-12S23.2 3 16 3Zm1.3 16.3-3.3-3.5-6.4 3.5 7-7.4 3.4 3.5 6.3-3.5-7 7.4Z" /></svg>
            Messenger
          </a>
        </div>
        <small>© 2026 STYLE LUK. ALL RIGHTS RESERVED.</small>
      </footer>
    </main>
  );
}
