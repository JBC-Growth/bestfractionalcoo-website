(function () {
  var $ = function (id) { return document.getElementById(id); };

  // Mobile menu
  var nav = $("nav");
  var menuBtn = $("menuBtn");
  if (nav && menuBtn) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Readiness checklist (home page)
  var boxes = document.querySelectorAll("#checkList input");
  if (boxes.length) {
    var tiers = [
      { max: 2, svc: "assessment", btn: "Request an Assessment",
        title: "A few friction points worth a closer look",
        text: "These are often symptoms of something larger. An Operational Health Assessment pinpoints what is behind them and gives you a prioritized 90-day roadmap." },
      { max: 5, svc: "reset", btn: "Book a Fit Call",
        title: "Your firm is outgrowing its operation",
        text: "A focused 90-Day Operating Reset is often the right fit at this stage. A short Fit Call will tell us which three to five priorities matter most." },
      { max: 9, svc: "partnership", btn: "Book a Fit Call",
        title: "The operation is holding the firm back",
        text: "This is the work a Fractional COO does: owning the operating priorities alongside you until they stick. Start with a Fit Call." }
    ];
    var current = null;
    var checkedItems = function () {
      var out = [];
      boxes.forEach(function (b) { if (b.checked) out.push(b.parentNode.textContent.trim()); });
      return out;
    };
    var score = function () {
      var n = checkedItems().length;
      $("meterBar").style.width = (n / boxes.length * 100) + "%";
      $("scoreText").textContent = n + " of " + boxes.length + " checked";
      $("readyMsg").hidden = n > 0;
      $("readyResult").hidden = n === 0;
      if (n === 0) { current = null; return; }
      current = tiers.filter(function (t) { return n <= t.max; })[0];
      $("resTitle").textContent = current.title;
      $("resText").textContent = current.text;
      $("resBtn").textContent = current.btn;
      $("resBtn").setAttribute("href", "contact?service=" + current.svc + "&from=check");
    };
    boxes.forEach(function (b) { b.addEventListener("change", score); });
    score();

    // Hand the answers to the contact page
    $("resBtn").addEventListener("click", function () {
      try {
        sessionStorage.setItem("readiness", JSON.stringify({ items: checkedItems(), total: boxes.length }));
      } catch (e) { /* storage blocked: the service is still passed in the URL */ }
    });
  }

  // Contact page
  var form = $("fitForm");
  if (!form) return;

  var params = new URLSearchParams(location.search);
  var svc = params.get("service");
  if (svc) {
    var radio = document.querySelector('input[name="svc"][value="' + svc + '"]');
    if (radio) radio.checked = true;
  }
  if (params.get("from") === "check") {
    var saved = null;
    try { saved = JSON.parse(sessionStorage.getItem("readiness") || "null"); } catch (e) { saved = null; }
    if (saved && saved.items && saved.items.length) {
      var ta = $("f-msg");
      if (!ta.value.trim()) {
        ta.value = "From the readiness check, these describe our firm today:\n- " + saved.items.join("\n- ") + "\n\n";
      }
      var note = $("fromCheck");
      note.textContent = "You checked " + saved.items.length + " of " + saved.total + " signs on the readiness check. They're included in your message below, so the Fit Call can start where it matters.";
      note.hidden = false;
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var msg = $("formMsg");
    var val = function (id) { return $(id).value.trim(); };
    var missing = [];
    if (!val("f-name")) missing.push("your name");
    if (!val("f-firm")) missing.push("firm name");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val("f-email"))) missing.push("a valid email");
    msg.hidden = false;
    if (missing.length) {
      msg.className = "form-msg err";
      msg.textContent = "Please add " + missing.join(", ") + " so I can follow up.";
      return;
    }

    var picked = document.querySelector('input[name="svc"]:checked');
    var payload = {
      name: val("f-name"), firm: val("f-firm"), email: val("f-email"), phone: val("f-phone"),
      role: $("f-role").value, size: $("f-size").value, revenue: $("f-rev").value,
      practice: val("f-practice"), service: picked ? picked.parentNode.textContent.trim() : "",
      message: val("f-msg"), website: $("f-website").value
    };

    var btn = $("f-submit");
    btn.disabled = true;
    msg.className = "form-msg";
    msg.textContent = "Sending...";

    fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (data) {
        if (!r.ok) throw new Error(data.error || "Request failed");
      });
    }).then(function () {
      form.reset();
      $("fromCheck").hidden = true;
      msg.className = "form-msg ok";
      msg.textContent = "Thanks. Your request was sent. Victoria will be in touch to set up a time.";
      try { sessionStorage.removeItem("readiness"); } catch (e) { /* ignore */ }
    }).catch(function () {
      msg.className = "form-msg err";
      msg.textContent = "Your request didn't go through. Please try again, or email victoria@bestfractionalcoo.com directly.";
    }).then(function () { btn.disabled = false; });
  });
})();
