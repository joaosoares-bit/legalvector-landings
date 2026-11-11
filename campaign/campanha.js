/* Landings de campanha legalVector: medição primeira-parte, formulário honesto, filme, entradas e componentes de cada página.
   Privacidade: só sessionStorage (acaba quando a pessoa fecha o separador), sem cookies, sem terceiros; o token sai do
   endereço logo que é lido, para não seguir em partilhas nem no referer. Uma visita só conta com sinal humano. */
(function () {
  var D = document, H = D.documentElement, C = window.LVC || {}, calma = H.classList.contains("sem-movimento");
  var q = new URLSearchParams(location.search), ss = {};
  try { ss = window.sessionStorage; } catch (e) { ss = { getItem: function () { return null; }, setItem: function () {} }; }
  var limpa = function (v, n) { return (v || "").replace(/[^\w\-.]/g, "").slice(0, n || 80); };
  var tid = /^[A-Za-z0-9_-]{16,64}$/.test(q.get("lv_tid") || "") ? q.get("lv_tid") : (ss.getItem("lv-tid") || "");
  var utm = {}; ["utm_source", "utm_medium", "utm_campaign", "utm_content"].forEach(function (k) { utm[k] = limpa(q.get(k)) || ss.getItem("lv-" + k) || ""; });
  try { if (tid) ss.setItem("lv-tid", tid); Object.keys(utm).forEach(function (k) { if (utm[k]) ss.setItem("lv-" + k, utm[k]); }); } catch (e) {}
  var visitante = ss.getItem("lv-v") || (Math.random().toString(36).slice(2) + Date.now().toString(36)); try { ss.setItem("lv-v", visitante); } catch (e) {}
  if (q.has("lv_tid")) { q.delete("lv_tid"); history.replaceState(null, "", location.pathname + (q.toString() ? "?" + q : "") + location.hash); }
  var ultimoCta = "direct";
  function envia(evento, extra) {
    var corpo = Object.assign({ event: evento, page: C.page, angle: C.page, lv_tid: tid, visitor: visitante }, utm, extra || {});
    window.dataLayer = window.dataLayer || []; window.dataLayer.push(Object.assign({}, corpo, { lv_tid: undefined }));
    if (C.previa || !C.api) return;
    var b = JSON.stringify(corpo);
    if (navigator.sendBeacon) navigator.sendBeacon(C.api + "/event", new Blob([b], { type: "application/json" }));
    else fetch(C.api + "/event", { method: "POST", headers: { "content-type": "application/json" }, body: b, keepalive: true }).catch(function () {});
  }
  window.lvEnvia = envia;
  /* visita: só depois de 1,5 s com a página à vista, ou do primeiro gesto (os verificadores de links não fazem nenhum dos dois) */
  var contou = false, relogio = null;
  function visita() { if (contou) return; contou = true; envia("landing_page_visit"); }
  function vigia() { clearTimeout(relogio); if (D.visibilityState === "visible") relogio = setTimeout(visita, 1500); }
  ["pointerdown", "keydown", "wheel", "touchstart", "scroll"].forEach(function (n) { addEventListener(n, function () { if (D.visibilityState === "visible") visita(); }, { once: true, passive: true }); });
  D.addEventListener("visibilitychange", vigia); vigia();
  D.addEventListener("click", function (e) { var a = e.target.closest("[data-cta]"); if (!a) return; var c = a.getAttribute("data-cta"); if (c === "form-submit") return; ultimoCta = c; envia("cta_click", { cta: c }); });

  H.classList.add("pronto");
  /* entradas */
  if ("IntersectionObserver" in window && !calma) {
    var io = new IntersectionObserver(function (xs) { xs.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("dentro"); io.unobserve(x.target); } }); }, { rootMargin: "0px 0px -10% 0px" });
    D.querySelectorAll("[data-entra]").forEach(function (el) { io.observe(el); });
  } else D.querySelectorAll("[data-entra]").forEach(function (el) { el.classList.add("dentro"); });

  /* o filme: pedido só depois do load (nunca antes da maior pintura), toca à vista, pára fora dela, com o separador escondido e com «Reduce motion» */
  var caixa = D.getElementById("filme"), vid = caixa && caixa.querySelector("video"), pronto = false;
  function carrega() {
    if (!vid || pronto || calma) return; pronto = true;
    var src = innerWidth < 900 || (navigator.connection && navigator.connection.saveData) ? vid.getAttribute("data-src-720") : vid.getAttribute("data-src-1080");
    vid.src = src; vid.addEventListener("loadedmetadata", function () { try { vid.currentTime = +caixa.dataset.t0 || 0; } catch (e) {} }, { once: true });
    vid.addEventListener("playing", function () { caixa.classList.add("a-dar"); }, { once: true });
  }
  var avista = false;
  function decide() { if (!vid || !pronto) return; if (avista && D.visibilityState === "visible" && !H.classList.contains("sem-movimento")) { var p = vid.play(); if (p) p.catch(function () {}); } else vid.pause(); }
  if (vid) {
    addEventListener("load", function () { setTimeout(function () { carrega(); decide(); }, 400); });
    new IntersectionObserver(function (x) { avista = x[0].isIntersecting; decide(); }, { threshold: .25 }).observe(caixa);
    D.addEventListener("visibilitychange", decide);
  }

  /* barra fixa */
  var fixo = D.getElementById("fixo"), form = D.getElementById("form"), heroCta = D.querySelector('[data-cta="hero"]'), vf = false, vh = true;
  function poe() { if (fixo) fixo.classList.toggle("fora", vf || vh); }
  if (fixo && "IntersectionObserver" in window) {
    if (form) new IntersectionObserver(function (x) { vf = x[0].isIntersecting; poe(); }, { rootMargin: "0px 0px -10% 0px" }).observe(form);
    if (heroCta) new IntersectionObserver(function (x) { vh = x[0].isIntersecting; poe(); }).observe(heroCta);
  }

  /* interruptor de movimento */
  var bt = D.getElementById("calma");
  if (bt) { if (calma) { bt.textContent = "Restore motion"; bt.setAttribute("aria-pressed", "true"); }
    bt.addEventListener("click", function () { var on = H.classList.toggle("sem-movimento"); bt.textContent = on ? "Restore motion" : "Reduce motion"; bt.setAttribute("aria-pressed", String(on)); try { localStorage.setItem("lv-calma", on ? "1" : "0"); } catch (e) {} decide(); }); }

  /* formulário: começa, valida, envia, e diz a verdade sobre o resultado */
  if (form) {
    var comecou = false, estado = D.getElementById("estado");
    form.addEventListener("input", function () { if (!comecou) { comecou = true; envia("form_start"); } });
    var GRATIS = /@(gmail|googlemail|yahoo|ymail|hotmail|outlook|live|msn|icloud|me|mac|aol|gmx|proton|protonmail|mail|yandex|zoho)\.[a-z.]+$/i;
    function erro(nome, txt) { var c = form.elements[nome], m = D.getElementById("e-" + nome); if (c) c.setAttribute("aria-invalid", txt ? "true" : "false"); if (m) m.textContent = txt || ""; }
    function valida() {
      var e = {}, v = function (n) { return (form.elements[n].value || "").trim(); };
      if (v("name").length < 2) e.name = "Please enter your full name.";
      if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v("email")) || GRATIS.test(v("email"))) e.email = "Please use your business email.";
      if (v("company").length < 2) e.company = "Please enter your company.";
      if (v("role").length < 2) e.role = "Please enter your job role.";
      if (!v("repository")) e.repository = "Please choose your repository.";
      if (!form.elements.consent.checked) e.consent = "Please confirm we may contact you.";
      ["name", "email", "company", "role", "repository", "consent", "country"].forEach(function (n) { erro(n, e[n]); });
      return e;
    }
    function mostra(tit, txt, mau) { estado.hidden = false; estado.classList.toggle("erro", !!mau); estado.querySelector("strong").textContent = tit; estado.querySelector("p").textContent = txt; estado.focus(); }
    form.addEventListener("submit", function (ev) {
      ev.preventDefault(); var e = valida(), k = Object.keys(e);
      if (k.length) { var c = form.elements[k[0]]; if (c && c.focus) c.focus(); return; }
      if (C.previa || !C.api) { mostra("Preview only.", "This preview is not connected to the CRM yet, so nothing was sent. On the live page your request reaches the team.", true); return; }
      var dados = Object.fromEntries(new FormData(form)); delete dados.consent;
      var corpo = Object.assign(dados, utm, { page: C.page, cta: ultimoCta, lv_tid: tid, visitor: visitante });
      var botao = form.querySelector('button[type="submit"]'); botao.disabled = true; botao.setAttribute("aria-busy", "true");
      fetch(C.api + "/lead", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(corpo) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { s: r.status, j: j }; }); })
        .then(function (r) {
          if (r.s === 201) { form.hidden = true; mostra("Request received.", "Thank you. The legalVector team will email you within one business day to arrange your 30-minute walkthrough."); window.dataLayer.push({ event: "form_submit", page: C.page }); }
          else if (r.s === 200 && r.j.status === "duplicate") { form.hidden = true; mostra("We already have your request.", "It arrived earlier today. The team will email you within one business day to arrange the walkthrough."); }
          else if (r.s === 422 && r.j.erros) { Object.keys(r.j.erros).forEach(function (n) { erro(n, r.j.erros[n]); }); }
          else throw new Error(r.s);
        })
        .catch(function () { mostra("We couldn’t send your request.", "Nothing was submitted. Please try again in a moment, or request a demo at legal.texter.ai/en/demo.", true); })
        .finally(function () { botao.disabled = false; botao.removeAttribute("aria-busy"); });
    });
  }

  /* reels: um a tocar de cada vez */
  var rs = [].slice.call(D.querySelectorAll("video[data-reel]"));
  rs.forEach(function (v) { v.addEventListener("play", function () { rs.forEach(function (o) { if (o !== v) o.pause(); }); window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: "reel_play", reel: v.dataset.reel, page: C.page }); }); });

  /* intake: antes e depois, com o separador arrastável (é um input range: rato, dedo e teclado) */
  var ad = D.getElementById("antes-depois");
  if (ad) { var r = ad.querySelector("input"); var f = function () { ad.style.setProperty("--x", r.value + "%"); }; r.addEventListener("input", f); f(); }

  /* deadlines: a linha do contrato com o «hoje» arrastável */
  var lc = D.getElementById("linha-contrato");
  if (lc) {
    var hoje = lc.querySelector("input"), out = D.getElementById("linha-estado"), dias = D.getElementById("linha-dias");
    var INI = Date.UTC(2026, 2, 1), AVISO = Date.UTC(2026, 10, 30), FIM = Date.UTC(2027, 1, 28), dia = 864e5;
    var fmt = function (t) { return new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }); };
    var g = function () {
      var t = INI + (FIM - INI) * (+hoje.value / 100); lc.style.setProperty("--h", hoje.value + "%"); hoje.setAttribute("aria-valuetext", fmt(t));
      var falta = Math.round((AVISO - t) / dia);
      lc.dataset.fase = falta > 60 ? "calma" : falta > 0 ? "janela" : "passou";
      dias.textContent = falta > 0 ? falta + " days" : "0 days";
      out.textContent = falta > 60 ? "Today: " + fmt(t) + ". Notice deadline on 30 Nov 2026." : falta > 0 ? "Today: " + fmt(t) + ". " + falta + " days left to give notice." : "Today: " + fmt(t) + ". Notice deadline passed: the contract renews for another 12 months.";
    };
    hoje.addEventListener("input", g); g();
  }

  /* review: a cena muda com o passo que está a meio do ecrã */
  var cena = D.getElementById("cena-revisao");
  if (cena) {
    var ps = [].slice.call(D.querySelectorAll("[data-passo]"));
    var marca = function (n) { cena.dataset.passo = n; ps.forEach(function (p) { p.classList.toggle("ativo", p.dataset.passo === n); }); };
    if ("IntersectionObserver" in window && !calma) { var o = new IntersectionObserver(function (xs) { xs.forEach(function (x) { if (x.isIntersecting) marca(x.target.dataset.passo); }); }, { rootMargin: "-45% 0px -45% 0px" }); ps.forEach(function (p) { o.observe(p); }); }
    else marca("4");
    ps.forEach(function (p) { p.addEventListener("click", function () { marca(p.dataset.passo); }); });
  }
})();
