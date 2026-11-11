
(function () {
  var D = document, H = D.documentElement, CFG = window.LV || {};
  var q = new URLSearchParams(location.search), clean = function (v, n) { return (v || "").replace(/[^\w\-.@ ]/g, "").slice(0, n || 60); };
  var origin = { variant: CFG.variant, o: clean(q.get("o")), utm_source: clean(q.get("utm_source")), utm_medium: clean(q.get("utm_medium")), utm_campaign: clean(q.get("utm_campaign")), utm_content: clean(q.get("utm_content")), lead_id: clean(q.get("lid")) };
  try { if (origin.utm_source || origin.o) localStorage.setItem("lv-origin", JSON.stringify({ o: origin, t: Date.now() })); else { var g = JSON.parse(localStorage.getItem("lv-origin") || "null"); if (g && Date.now() - g.t < 2592e6) origin = Object.assign(g.o, { variant: CFG.variant, returning: "1" }); } } catch (e) {}
  window.dataLayer = window.dataLayer || []; var lastCta = "direto";
  function ev(n, x) { window.dataLayer.push(Object.assign({ event: n }, origin, x || {})); }
  window.lvEv = ev; ev("page_view");
  D.addEventListener("click", function (e) { var a = e.target.closest("[data-cta],[data-event]"); if (!a) return; var c = a.getAttribute("data-cta"); if (c && c !== "submit") { lastCta = c; ev("cta", { cta: c }); } else if (!c) ev(a.getAttribute("data-event")); });
  D.querySelectorAll('a[href^="https://legal.texter.ai"]').forEach(function (a) { var u = new URL(a.href); ["utm_source", "utm_medium", "utm_campaign"].forEach(function (k) { if (origin[k]) u.searchParams.set(k, origin[k]); }); u.searchParams.set("utm_content", "lp-" + CFG.variant); a.href = u.toString(); });

  var calm = H.classList.contains("no-motion");
  
  var ab = D.querySelector(".opening"), alvo = D.querySelector(".topbar .brand svg");
  function finish() { H.classList.add("opened"); if (ab) ab.remove(); }
  if (ab && alvo && !calm) {
    setTimeout(function () {
      var s = ab.querySelector("svg").getBoundingClientRect(), t = alvo.getBoundingClientRect();
      var dx = t.left + t.width / 2 - (s.left + s.width / 2), dy = t.top + t.height / 2 - (s.top + s.height / 2), k = t.width / s.width;
      ab.classList.add("fly");
      var an = ab.querySelector("svg").animate([{ transform: "none" }, { transform: "translate(" + dx + "px," + dy + "px) scale(" + k + ")" }], { duration: 1000, easing: "cubic-bezier(.7,0,.2,1)", fill: "forwards" });
      setTimeout(function () { H.classList.add("opened"); }, 380);
      an.onfinish = finish;
    }, 1150);
  } else finish();

  
  if ("IntersectionObserver" in window && !calm) {
    var io = new IntersectionObserver(function (xs) { xs.forEach(function (x) {
      if (x.isIntersecting) { x.target.classList.add("inside"); x.target.classList.remove("exited"); }
      else if (x.boundingClientRect.top < 0) { x.target.classList.remove("inside"); x.target.classList.add("exited"); }
      else x.target.classList.remove("inside", "exited"); }); }, { rootMargin: "0px 0px -12% 0px" });
    D.querySelectorAll("[data-enter]").forEach(function (el) { io.observe(el); });
  } else D.querySelectorAll("[data-enter]").forEach(function (el) { el.classList.add("inside"); });

  
  var hero = D.querySelector(".hero"), rev = [].slice.call(D.querySelectorAll("[data-reveal]")), par = [].slice.call(D.querySelectorAll("[data-parallax]"));
  function onScroll() {
    var h = innerHeight;
    if (hero) hero.style.setProperty("--hs", Math.min(1, Math.max(0, scrollY / (hero.offsetHeight || h))).toFixed(3));
    rev.forEach(function (el) { var b = el.getBoundingClientRect(); el.style.setProperty("--r", Math.min(1, Math.max(0, (b.top - h * 0.35) / (h * 0.6))).toFixed(3)); });
    par.forEach(function (el) { var b = el.getBoundingClientRect(), k = +el.getAttribute("data-parallax") || 0.12; el.style.setProperty("--py", ((b.top + b.height / 2 - h / 2) * -k).toFixed(1) + "px"); });
  }
  if (!calm) { addEventListener("scroll", function () { requestAnimationFrame(onScroll); }, { passive: true }); addEventListener("resize", onScroll); onScroll(); }

  
  if (!calm && matchMedia("(pointer:fine)").matches) D.querySelectorAll(".cta-button").forEach(function (b) {
    b.addEventListener("pointermove", function (e) { var r = b.getBoundingClientRect(); b.style.setProperty("--mx", ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px"); b.style.setProperty("--my", ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px"); });
    b.addEventListener("pointerleave", function () { b.style.setProperty("--mx", "0px"); b.style.setProperty("--my", "0px"); });
  });

  
  var cv = D.getElementById("backdrop");
  if (cv && !calm) addEventListener("load", function () { setTimeout(function () {
    var cx = cv.getContext("2d"), dpr = Math.min(2, devicePixelRatio || 1), W, H2, pts = [], G = innerWidth < 760 ? 30 : 36;
    var cs = getComputedStyle(H), cor = (cs.getPropertyValue("--dots") || "#1E3A35").trim(), ac = (cs.getPropertyValue("--light") || cs.getPropertyValue("--amber") || "#F59E0B").trim();
    var px = -999, py = -999, tx = -999, ty = -999, vivo = true;
    function rgb(h) { h = h.replace("#", ""); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
    var c0 = rgb(cor), c1 = rgb(ac);
    function measure() { W = innerWidth; H2 = innerHeight; cv.width = W * dpr; cv.height = H2 * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); pts = []; for (var y = G / 2; y < H2; y += G) for (var x = G / 2; x < W; x += G) pts.push(x, y); }
    measure(); addEventListener("resize", measure);
    addEventListener("pointermove", function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
    addEventListener("touchmove", function (e) { var t = e.touches[0]; tx = t.clientX; ty = t.clientY; }, { passive: true });
    D.addEventListener("visibilitychange", function () { vivo = !D.hidden; if (vivo) requestAnimationFrame(draw); });
    var last = 0;
    function draw(t) {
      if (!vivo) return; requestAnimationFrame(draw); if (t - last < 33) return; last = t;
      px += (tx - px) * 0.12; py += (ty - py) * 0.12; cx.clearRect(0, 0, W, H2); var s = t / 1000;
      for (var i = 0; i < pts.length; i += 2) {
        var x = pts[i], y = pts[i + 1], dx = x - px, dy = y - py, d = Math.sqrt(dx * dx + dy * dy), k = Math.max(0, 1 - d / 190);
        var o = 0.5 + 0.5 * Math.sin(s * 0.8 + x * 0.012 + y * 0.009), r = 1 + k * 2.4 + o * 0.35;
        var m = k * k, R = c0[0] + (c1[0] - c0[0]) * m, Gc = c0[1] + (c1[1] - c0[1]) * m, B = c0[2] + (c1[2] - c0[2]) * m;
        cx.fillStyle = "rgb(" + (R | 0) + "," + (Gc | 0) + "," + (B | 0) + ")"; cx.beginPath(); cx.arc(x + dx * -k * 0.18, y + dy * -k * 0.18, r, 0, 6.283); cx.fill();
      }
    }
    requestAnimationFrame(draw);
  }, 300); });

  
  var bar = D.querySelector(".sticky"), form = D.getElementById("form");
  var heroCta = D.querySelector('[data-cta="hero"]'), vf = false, vh = true;
  function place() { bar.classList.toggle("out", vf || vh); }
  if (bar && form && "IntersectionObserver" in window) {
    new IntersectionObserver(function (x) { vf = x[0].isIntersecting; place(); }, { rootMargin: "0px 0px -10% 0px" }).observe(form);
    if (heroCta) new IntersectionObserver(function (x) { vh = x[0].isIntersecting; place(); }).observe(heroCta);
  }

  var bt = D.getElementById("calm");
  if (bt) { if (calm) { bt.textContent = "Restore motion"; bt.setAttribute("aria-pressed", "true"); }
    bt.addEventListener("click", function () { var on = H.classList.toggle("no-motion"); bt.textContent = on ? "Restore motion" : "Reduce motion"; bt.setAttribute("aria-pressed", String(on)); try { localStorage.setItem("lv-calm", on ? "1" : "0"); } catch (e) {} }); }

  
  var cover = D.getElementById("cover");
  if (cover) {
    var cards = [].slice.call(cover.querySelectorAll(".card")), front = 0, withSound = false, inView = false;
    var vid = function (i) { return cards[i].querySelector("video"); };
    var layout = function () { var n = cards.length, w = cards[0].offsetWidth, step = innerWidth < 760 ? w * .46 : w * .68;
      cards.forEach(function (c, i) { var rel = ((i - front) % n + n) % n; if (rel > n / 2) rel -= n; var a = Math.abs(rel);
        c.style.setProperty("--x", (rel * step) + "px"); c.style.setProperty("--s", a ? .8 : 1); c.style.setProperty("--b", a ? "5px" : "0px"); c.style.setProperty("--o", a ? .55 : 1); c.style.setProperty("--z", String(10 - a));
        c.classList.toggle("front", !a); c.setAttribute("aria-hidden", a ? "true" : "false"); c.querySelector(".sound").tabIndex = a ? -1 : 0; }); };
    var mark = function () { cards.forEach(function (c) { var b = c.querySelector(".sound"); b.setAttribute("aria-pressed", String(withSound)); b.setAttribute("aria-label", withSound ? "Turn sound off" : "Turn sound on"); }); };
    var playFront = function () { cards.forEach(function (c, i) { var v = vid(i); if (i !== front) { v.pause(); v.muted = true; return; }
      if (!v.getAttribute("src")) v.src = v.dataset.src; v.muted = !withSound;
      if (inView && D.visibilityState === "visible" && !H.classList.contains("no-motion")) { var pr = v.play(); if (pr) pr.catch(function () { v.muted = true; withSound = false; mark(); v.play().catch(function () {}); }); } else v.pause(); }); };
    var go = function (i) { front = (i + cards.length) % cards.length; try { vid(front).currentTime = 0; } catch (e) {} layout(); playFront();
      D.getElementById("cover-now").textContent = "Film " + (front + 1) + " of " + cards.length + ": " + vid(front).getAttribute("aria-label").replace(/^Reel: /, "");
      ev("reel_view", { reel: cards[front].dataset.reel }); };
    cards.forEach(function (c, i) {
      c.addEventListener("click", function (e) { if (e.target.closest(".sound")) return; if (i !== front) go(i); });
      vid(i).addEventListener("ended", function () { if (i === front) go(front + 1); });
      c.querySelector(".sound").addEventListener("click", function () { withSound = !withSound; mark(); var v = vid(front); v.muted = !withSound; if (v.paused) v.play().catch(function () {}); ev(withSound ? "reel_sound_on" : "reel_sound_off", { reel: c.dataset.reel }); });
    });
    cover.querySelectorAll("[data-go]").forEach(function (b) { b.addEventListener("click", function () { go(front + +b.getAttribute("data-go")); }); });
    var x0 = null; cover.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    cover.addEventListener("touchend", function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(front + (dx < 0 ? 1 : -1)); x0 = null; }, { passive: true });
    if ("IntersectionObserver" in window) new IntersectionObserver(function (x) { inView = x[0].isIntersecting; playFront(); }, { threshold: .4 }).observe(cover); else inView = true;
    D.addEventListener("visibilitychange", playFront); addEventListener("resize", layout); layout(); mark();
    if (bt) bt.addEventListener("click", playFront);
  }

  
  var error = D.getElementById("error"), ok = D.getElementById("ok");
  if (form) form.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { error.hidden = false; var p = form.querySelector(":invalid"); p && p.focus(); return; }
    error.hidden = true; var d = Object.fromEntries(new FormData(form)); delete d.consent;
    var payload = Object.assign(d, origin, { cta: lastCta, page: location.pathname, sent_at: new Date().toISOString() });
    ev("lead", { cta: lastCta });
    try {
      if (CFG.lead) { var r = await fetch(CFG.lead, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }); if (!r.ok) throw 0; }
      else if (CFG.preview) ok.querySelector("p").textContent = "Team preview: this request is not sent anywhere yet. It goes live once the CRM endpoint is connected.";
      else { location.href = "https://legal.texter.ai/en/demo?utm_source=" + encodeURIComponent(origin.utm_source || "lp") + "&utm_content=lp-" + CFG.variant; return; }
      form.hidden = true; ok.hidden = false; ok.focus();
    } catch (x) { error.textContent = "We couldn’t send this. Please try again, call +351 916 868 318 or book at legal.texter.ai."; error.hidden = false; }
  });
})();
