// Animated walkthrough. Each step applies its changes on top of the previous one, so
// jumping to a step replays the earlier ones instantly and then animates the chosen one.
(function () {
  const $ = id => document.getElementById(id);
  const stage = $("stage"), frame = $("demoFrame"), cur = $("sCur");
  const WIDTH = 1040, HEIGHT = 600;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const POSTS = [
    { id: "p1", name: "Asha Rao", title: "Talent Partner, Northwind Labs", color: "#7a5cc7", email: "careers@northwind.example",
      body: "We're hiring a Data Engineer in Pune. 3+ years with Python and SQL. Send your resume to careers@northwind.example" },
    { id: "p2", name: "Dev Malik", title: "Product Designer", color: "#c75c5c", email: "",
      body: "Great team offsite this week. No openings right now, but stay tuned for news from our design team." },
    { id: "p3", name: "Sam Iyer", title: "Data Engineer, open to work", color: "#c79a2b", email: "sam.iyer@gmail.example",
      body: "I'm open to work! Looking for Data Engineer roles in Pune. Reach me at sam.iyer@gmail.example" },
    { id: "p4", name: "Meera Joshi", title: "Technical Recruiter, Brightpath", color: "#2b8fc7", email: "hiring@brightpath.example",
      body: "Brightpath is hiring Data Engineers, remote or Pune. Share your profile with hiring@brightpath.example and mention this post." },
    { id: "p5", name: "Leo Fernandes", title: "Engineering Manager, Quantaworks", color: "#2fa37a", email: "jobs@quantaworks.example",
      body: "Growing our data platform team. If that sounds like you, write to jobs@quantaworks.example" }
  ];
  const stamp = new Intl.DateTimeFormat("en-US", { month: "2-digit", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date());
  const QUERY = '"Hiring" AND "Data Engineer" AND "Pune"';

  let run = 0, paused = false, instant = false, scale = 1;

  // Waits respect Pause and stop as soon as a newer run starts.
  async function wait(ms, id) {
    if (instant) return;
    let left = ms;
    while (left > 0) {
      await new Promise(r => setTimeout(r, 50));
      if (id !== run) throw new Error("stale");
      if (!paused) left -= 50;
    }
  }

  function makeAnimator(id) {
    return {
      wait: ms => wait(ms, id),
      async move(el) {
        const a = el.getBoundingClientRect(), b = stage.getBoundingClientRect();
        const x = (a.left - b.left + a.width / 2) / scale, y = (a.top - b.top + a.height / 2) / scale;
        cur.style.transform = "translate(" + x + "px," + y + "px)";
        await wait(800, id);
      },
      async click(el) {
        await this.move(el);
        cur.classList.add("pressed");
        await wait(160, id);
        cur.classList.remove("pressed");
        await wait(160, id);
      },
      async type(el, text, ms) {
        el.classList.remove("ph");
        if (instant) { el.textContent = text; return; }
        el.textContent = "";
        for (const ch of text) { el.textContent += ch; await wait(ms || 40, id); }
      }
    };
  }

  const postEl = id => $(id);
  const barBtn = (id, i) => postEl(id).querySelectorAll(".s-pb")[i];

  function addRow(p) {
    const empty = $("sList").querySelector(".s-empty");
    if (empty) empty.remove();
    const row = document.createElement("div");
    row.className = "s-item";
    row.dataset.post = p.id;
    row.innerHTML = '<input type="checkbox" tabindex="-1" aria-hidden="true"><div><b></b><span></span></div>';
    row.querySelector("b").textContent = p.name;
    row.querySelector("span").textContent = p.email;
    $("sList").appendChild(row);
    postEl(p.id).classList.add("has-bar");
    $("sCount").textContent = $("sList").children.length;
  }

  function dashRow(t, cols, isNew) {
    const tr = document.createElement("tr");
    if (isNew) tr.className = "new";
    tr.innerHTML = "<td>" + cols[0] + '</td><td><a>Open</a></td><td><a>' + cols[1] + "</a></td><td>" + cols[2] + "</td><td>" + cols[3] + "</td><td>" + cols[4] + "</td>";
    t.appendChild(tr);
  }

  function reset() {
    $("sAddr").textContent = "linkedin.com/feed";
    $("sSearch").textContent = "Search";
    $("vLinked").hidden = false;
    $("vDash").hidden = true;
    $("sQ").textContent = "0 of 14 searched";
    $("sQBar").style.width = "0";
    $("sCount").textContent = "0";
    $("sDomains").textContent = "gmail, yahoo, proton";
    $("sDomains").classList.add("ph");
    $("sList").innerHTML = '<div class="s-empty">No posts with an email yet. Run a search or scroll the feed and they appear here.</div>';
    $("sFeed").style.transform = "none";
    $("sFeed").innerHTML = "";
    for (const p of POSTS) {
      const el = document.createElement("article");
      el.className = "s-post";
      el.id = p.id;
      el.innerHTML = '<div class="s-pbar"><span class="m"></span><span class="s-pb main">Send email</span><span class="s-pb">Draft</span><span class="s-pb">Save &amp; track</span></div><div class="s-msg"></div>' +
        '<div class="s-post-in"><div class="s-actor"><div class="s-av"></div><div><b></b><span></span></div></div><p></p></div>';
      el.querySelector(".m").textContent = p.email;
      el.querySelector(".s-av").textContent = p.name[0];
      el.querySelector(".s-av").style.background = p.color;
      el.querySelector(".s-actor b").textContent = p.name;
      el.querySelector(".s-actor span").textContent = p.title;
      el.querySelector("p").textContent = p.body;
      $("sFeed").appendChild(el);
    }
    $("sGm").classList.remove("on");
    ["gmTo", "gmSub", "gmBody", "gmAtt"].forEach(i => { $(i).textContent = ""; });
    $("sRows").innerHTML = "";
  }

  const STEPS = [
    { title: "Search a suggested keyword", label: "Search",
      text: "Job Finder suggests keywords to search, based on your roles, so you can find relevant posts on LinkedIn. Press Search to open the first one.",
      async do(a) {
        await a.click($("sSearchBtn"));
        $("sAddr").textContent = "linkedin.com/search/results/content";
        $("sSearch").textContent = QUERY;
        $("sQ").textContent = "1 of 14 searched";
        $("sQBar").style.width = "7%";
        await a.wait(500);
      } },
    { title: "Scroll, and emails appear", label: "Scroll",
      text: "Scroll LinkedIn as you normally would. When a post on your screen includes an email, its author and address appear in the panel.",
      async do(a) {
        addRow(POSTS[0]);
        await a.wait(800);
        addRow(POSTS[2]);
        $("sFeed").style.transform = "translateY(-130px)";
        await a.wait(1000);
        addRow(POSTS[3]);
        $("sFeed").style.transform = "translateY(-290px)";
        await a.wait(1000);
        addRow(POSTS[4]);
        await a.wait(600);
      } },
    { title: "Hide what you don't want", label: "Filter",
      text: "Hide free domains like gmail, so posts from people who are open to work don't fill your list. You can hide posts by word too.",
      async do(a) {
        await a.click($("sDomains"));
        await a.type($("sDomains"), "gmail");
        await a.wait(300);
        const row = $("sList").querySelector('[data-post="p3"]');
        if (row) row.remove();
        postEl("p3").classList.remove("has-bar");
        $("sCount").textContent = $("sList").children.length;
        await a.wait(700);
      } },
    { title: "Click a name to read the post", label: "Jump",
      text: "Clicking a name takes you straight to that post. Read it and decide if it's right for you.",
      async do(a) {
        await a.click($("sList").querySelector('[data-post="p4"]'));
        $("sFeed").style.transform = "translateY(-" + Math.max(0, postEl("p4").offsetTop - 6) + "px)";
        postEl("p4").classList.add("glow");
        await a.wait(1100);
      } },
    { title: "Save it to your tracker", label: "Save",
      text: "Save & track adds the author, their profile, the post link and the date to your dashboard.",
      async do(a) {
        await a.click(barBtn("p4", 2));
        const m = postEl("p4").querySelector(".s-msg");
        m.textContent = "Saved to your dashboard.";
        m.classList.add("on");
        await a.wait(900);
      } },
    { title: "Email them from your Gmail", label: "Email",
      text: "Send email opens Gmail with your own template and resume. Nothing goes out unless you choose it.",
      async do(a) {
        await a.click(barBtn("p4", 0));
        $("sAddr").textContent = "mail.google.com";
        $("sGm").classList.add("on");
        await a.wait(500);
        await a.type($("gmTo"), "hiring@brightpath.example", 22);
        await a.type($("gmSub"), "Data Engineer role in your post", 22);
        await a.type($("gmBody"), "Hi Meera,\nI saw your post about the Data Engineer role and my background is a strong match. My resume is attached.\n\nThanks!", 9);
        $("gmAtt").textContent = "resume.pdf";
        await a.wait(500);
        await a.click($("gmSend"));
        $("sGm").classList.remove("on");
        $("sAddr").textContent = "linkedin.com/search/results/content";
        const row = $("sList").querySelector('[data-post="p4"] div');
        const sent = document.createElement("span");
        sent.className = "sent";
        sent.textContent = "Sent " + stamp;
        row.appendChild(sent);
        const box = $("sList").querySelector('[data-post="p4"] input');
        box.disabled = true;
        postEl("p4").querySelector(".s-msg").textContent = "Sent to hiring@brightpath.example";
        await a.wait(1100);
      } },
    { title: "Track every application", label: "Track",
      text: "The dashboard keeps who you contacted, the post link and when you sent your email, so you never lose track or email anyone twice.",
      async do(a) {
        $("sAddr").textContent = "Job Finder dashboard";
        $("vLinked").hidden = true;
        $("vDash").hidden = false;
        const t = $("sRows");
        dashRow(t, ["hiring@brightpath.example", "Meera Joshi", stamp, stamp, "Already sent"], true);
        dashRow(t, ["careers@northwind.example", "Asha Rao", "Earlier", "-", "Saved"], false);
        await a.move(t.querySelector("td:nth-child(5)"));
        await a.wait(1800);
      } }
  ];

  function setCaption(i) {
    $("capT").textContent = (i + 1) + ". " + STEPS[i].title;
    $("capB").textContent = STEPS[i].text;
    document.querySelectorAll("#demoSteps button").forEach((b, n) => {
      if (n === i) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
    });
  }

  async function play(from) {
    const id = ++run;
    const a = makeAnimator(id);
    try {
      for (;;) {
        // Instantly rebuild everything before the step being shown.
        stage.classList.add("instant");
        instant = true;
        reset();
        cur.style.transform = "translate(520px,300px)";
        for (let i = 0; i < from; i++) await STEPS[i].do(a);
        void stage.offsetHeight;
        stage.classList.remove("instant");
        instant = reduced;
        for (let i = from; i < STEPS.length; i++) {
          setCaption(i);
          await STEPS[i].do(a);
          if (reduced) return; // no autoplay: the step buttons move it on
          await a.wait(1400);
        }
        await a.wait(1500);
        from = 0;
      }
    } catch (e) {
      if (e.message !== "stale") throw e;
    }
  }

  function fit() {
    scale = frame.clientWidth / WIDTH;
    stage.style.transform = "scale(" + scale + ")";
    frame.style.height = HEIGHT * scale + "px";
  }

  STEPS.forEach((s, i) => {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = (i + 1) + ". " + s.label;
    b.addEventListener("click", () => play(i));
    li.appendChild(b);
    $("demoSteps").appendChild(li);
  });

  const toggle = $("demoToggle");
  if (reduced) toggle.hidden = true;
  toggle.addEventListener("click", () => {
    paused = !paused;
    toggle.textContent = paused ? "Play" : "Pause";
  });

  fit();
  new ResizeObserver(fit).observe(frame);
  play(0);
})();
