/* Núcleo das 3 landings do legalVector: origem da lead, eventos, formulário, barra fixa, abertura do logótipo,
   entradas dos títulos e o interruptor «Reduzir movimento». Cada página traz a sua cena por cima disto. */
(function () {
  var D = document, H = D.documentElement, CFG = window.LV || {};
  var q = new URLSearchParams(location.search), limpa = function (v, n) { return (v || "").replace(/[^\w\-.@ ]/g, "").slice(0, n || 60); };
  var origem = { variante: CFG.variante, o: limpa(q.get("o")), utm_source: limpa(q.get("utm_source")), utm_medium: limpa(q.get("utm_medium")), utm_campaign: limpa(q.get("utm_campaign")), utm_content: limpa(q.get("utm_content")), lead_id: limpa(q.get("lid")) };
  try { if (origem.utm_source || origem.o) localStorage.setItem("lv-origem", JSON.stringify({ o: origem, t: Date.now() })); else { var g = JSON.parse(localStorage.getItem("lv-origem") || "null"); if (g && Date.now() - g.t < 2592e6) origem = Object.assign(g.o, { variante: CFG.variante, regresso: "1" }); } } catch (e) {}
  window.dataLayer = window.dataLayer || []; var ultimoCta = "direto";
  function ev(n, x) { window.dataLayer.push(Object.assign({ event: n }, origem, x || {})); }
  window.lvEv = ev; ev("pagina_vista");
  D.addEventListener("click", function (e) { var a = e.target.closest("[data-cta],[data-evento]"); if (!a) return; var c = a.getAttribute("data-cta"); if (c && c !== "enviar") { ultimoCta = c; ev("cta", { cta: c }); } else if (!c) ev(a.getAttribute("data-evento")); });
  D.querySelectorAll('a[href^="https://legal.texter.ai"]').forEach(function (a) { var u = new URL(a.href); ["utm_source", "utm_medium", "utm_campaign"].forEach(function (k) { if (origem[k]) u.searchParams.set(k, origem[k]); }); u.searchParams.set("utm_content", "lp-" + CFG.variante); a.href = u.toString(); });

  var calma = H.classList.contains("sem-movimento");
  /* abertura: o ponto âmbar dispara o vetor (CSS desde a primeira pintura); depois o símbolo voa para o cabeçalho */
  var ab = D.querySelector(".abertura"), alvo = D.querySelector(".cab .marca svg");
  function fim() { H.classList.add("aberto"); if (ab) ab.remove(); }
  if (ab && alvo && !calma) {
    setTimeout(function () {
      var s = ab.querySelector("svg").getBoundingClientRect(), t = alvo.getBoundingClientRect();
      var dx = t.left + t.width / 2 - (s.left + s.width / 2), dy = t.top + t.height / 2 - (s.top + s.height / 2), k = t.width / s.width;
      ab.classList.add("voa");
      var an = ab.querySelector("svg").animate([{ transform: "none" }, { transform: "translate(" + dx + "px," + dy + "px) scale(" + k + ")" }], { duration: 1000, easing: "cubic-bezier(.7,0,.2,1)", fill: "forwards" });
      setTimeout(function () { H.classList.add("aberto"); }, 380);
      an.onfinish = fim;
    }, 1150);
  } else fim();

  /* entradas e saídas: entra ao chegar por baixo, sai por cima ao passar, volta a entrar ao subir */
  if ("IntersectionObserver" in window && !calma) {
    var io = new IntersectionObserver(function (xs) { xs.forEach(function (x) {
      if (x.isIntersecting) { x.target.classList.add("dentro"); x.target.classList.remove("saiu"); }
      else if (x.boundingClientRect.top < 0) { x.target.classList.remove("dentro"); x.target.classList.add("saiu"); }
      else x.target.classList.remove("dentro", "saiu"); }); }, { rootMargin: "0px 0px -12% 0px" });
    D.querySelectorAll("[data-entra]").forEach(function (el) { io.observe(el); });
  } else D.querySelectorAll("[data-entra]").forEach(function (el) { el.classList.add("dentro"); });

  /* efeitos ao scroll: o hero sai devagar, as capturas revelam-se, a paralaxe anda */
  var hero = D.querySelector(".hero"), rev = [].slice.call(D.querySelectorAll("[data-revela]")), par = [].slice.call(D.querySelectorAll("[data-paralaxe]"));
  function rolar() {
    var h = innerHeight;
    if (hero) hero.style.setProperty("--hs", Math.min(1, Math.max(0, scrollY / (hero.offsetHeight || h))).toFixed(3));
    rev.forEach(function (el) { var b = el.getBoundingClientRect(); el.style.setProperty("--r", Math.min(1, Math.max(0, (b.top - h * 0.35) / (h * 0.6))).toFixed(3)); });
    par.forEach(function (el) { var b = el.getBoundingClientRect(), k = +el.getAttribute("data-paralaxe") || 0.12; el.style.setProperty("--py", ((b.top + b.height / 2 - h / 2) * -k).toFixed(1) + "px"); });
  }
  if (!calma) { addEventListener("scroll", function () { requestAnimationFrame(rolar); }, { passive: true }); addEventListener("resize", rolar); rolar(); }

  /* botões magnéticos: puxam-se ligeiramente para o rato */
  if (!calma && matchMedia("(pointer:fine)").matches) D.querySelectorAll(".botao").forEach(function (b) {
    b.addEventListener("pointermove", function (e) { var r = b.getBoundingClientRect(); b.style.setProperty("--mx", ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px"); b.style.setProperty("--my", ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px"); });
    b.addEventListener("pointerleave", function () { b.style.setProperty("--mx", "0px"); b.style.setProperty("--my", "0px"); });
  });

  /* fundo interativo: uma grelha de pontos que acende e cresce perto do rato (ou do dedo) e ondula devagar */
  var cv = D.getElementById("fundo");
  if (cv && !calma) addEventListener("load", function () { setTimeout(function () {
    var cx = cv.getContext("2d"), dpr = Math.min(2, devicePixelRatio || 1), W, H2, pts = [], G = innerWidth < 760 ? 30 : 36;
    var cs = getComputedStyle(H), cor = (cs.getPropertyValue("--pontos") || "#1E3A35").trim(), ac = (cs.getPropertyValue("--luz") || cs.getPropertyValue("--ambar") || "#F59E0B").trim();
    var px = -999, py = -999, tx = -999, ty = -999, vivo = true;
    function rgb(h) { h = h.replace("#", ""); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
    var c0 = rgb(cor), c1 = rgb(ac);
    function medir() { W = innerWidth; H2 = innerHeight; cv.width = W * dpr; cv.height = H2 * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); pts = []; for (var y = G / 2; y < H2; y += G) for (var x = G / 2; x < W; x += G) pts.push(x, y); }
    medir(); addEventListener("resize", medir);
    addEventListener("pointermove", function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
    addEventListener("touchmove", function (e) { var t = e.touches[0]; tx = t.clientX; ty = t.clientY; }, { passive: true });
    D.addEventListener("visibilitychange", function () { vivo = !D.hidden; if (vivo) requestAnimationFrame(desenha); });
    var ult = 0;
    function desenha(t) {
      if (!vivo) return; requestAnimationFrame(desenha); if (t - ult < 33) return; ult = t;
      px += (tx - px) * 0.12; py += (ty - py) * 0.12; cx.clearRect(0, 0, W, H2); var s = t / 1000;
      for (var i = 0; i < pts.length; i += 2) {
        var x = pts[i], y = pts[i + 1], dx = x - px, dy = y - py, d = Math.sqrt(dx * dx + dy * dy), k = Math.max(0, 1 - d / 190);
        var o = 0.5 + 0.5 * Math.sin(s * 0.8 + x * 0.012 + y * 0.009), r = 1 + k * 2.4 + o * 0.35;
        var m = k * k, R = c0[0] + (c1[0] - c0[0]) * m, Gc = c0[1] + (c1[1] - c0[1]) * m, B = c0[2] + (c1[2] - c0[2]) * m;
        cx.fillStyle = "rgb(" + (R | 0) + "," + (Gc | 0) + "," + (B | 0) + ")"; cx.beginPath(); cx.arc(x + dx * -k * 0.18, y + dy * -k * 0.18, r, 0, 6.283); cx.fill();
      }
    }
    requestAnimationFrame(desenha);
  }, 300); });

  /* barra fixa: sai quando o formulário está à vista */
  var barra = D.querySelector(".fixo"), form = D.getElementById("form");
  var heroCta = D.querySelector('[data-cta="hero"]'), vf = false, vh = true;
  function poe() { barra.classList.toggle("fora", vf || vh); }
  if (barra && form && "IntersectionObserver" in window) {
    new IntersectionObserver(function (x) { vf = x[0].isIntersecting; poe(); }, { rootMargin: "0px 0px -10% 0px" }).observe(form);
    if (heroCta) new IntersectionObserver(function (x) { vh = x[0].isIntersecting; poe(); }).observe(heroCta);
  }

  var bt = D.getElementById("calma");
  if (bt) { if (calma) { bt.textContent = "Repor movimento"; bt.setAttribute("aria-pressed", "true"); }
    bt.addEventListener("click", function () { var on = H.classList.toggle("sem-movimento"); bt.textContent = on ? "Repor movimento" : "Reduzir movimento"; bt.setAttribute("aria-pressed", String(on)); try { localStorage.setItem("lv-calma", on ? "1" : "0"); } catch (e) {} }); }

  /* carrossel dos telemóveis (lugar dos 3 reels do Tomás) */
  var fita = D.querySelector("[data-fita]"), setas = D.querySelectorAll("[data-seta]");
  if (fita && setas.length) {
    var pontas = function () { var m = fita.scrollWidth - fita.clientWidth - 2; setas[0].disabled = fita.scrollLeft <= 2; setas[1].disabled = fita.scrollLeft >= m; setas[0].parentElement.hidden = m <= 0; };
    setas.forEach(function (b) { b.addEventListener("click", function () { fita.scrollBy({ left: +b.getAttribute("data-seta") * fita.clientWidth * 0.8, behavior: "smooth" }); }); });
    fita.addEventListener("scroll", pontas, { passive: true }); addEventListener("resize", pontas); pontas();
  }

  /* formulário */
  var erro = D.getElementById("erro"), ok = D.getElementById("ok");
  if (form) form.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { erro.hidden = false; var p = form.querySelector(":invalid"); p && p.focus(); return; }
    erro.hidden = true; var d = Object.fromEntries(new FormData(form)); delete d.consente;
    var corpo = Object.assign(d, origem, { cta: ultimoCta, pagina: location.pathname, quando: new Date().toISOString() });
    ev("lead", { cta: ultimoCta });
    try {
      if (CFG.lead) { var r = await fetch(CFG.lead, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(corpo) }); if (!r.ok) throw 0; }
      else if (CFG.previa) ok.querySelector("p").textContent = "Prévia para o grupo: aqui o pedido ainda não é enviado. Liga-se ao Twenty quando houver o endereço.";
      else { location.href = "https://legal.texter.ai/pt/demo?utm_source=" + encodeURIComponent(origem.utm_source || "lp") + "&utm_content=lp-" + CFG.variante; return; }
      form.hidden = true; ok.hidden = false; ok.focus();
    } catch (x) { erro.textContent = "Não foi possível enviar. Tente outra vez ou marque em legal.texter.ai."; erro.hidden = false; }
  });
})();
