/**
 * ============================================================
 *  站点逻辑：读取 js/data.js 中的 SITE_DATA，
 *  自动渲染顶部胶片画廊 + 下方图文列表 + 关于/联系信息，
 *  并处理导航栏、移动端菜单、弹窗（Lightbox）交互。
 *  以后新增/替换图片，只需要改 js/data.js，这个文件不用动。
 * ============================================================
 */
(function () {
  "use strict";

  const IMG_DIR = "img/";

  /* ----------------------------------------------------------------
     关于"品牌名 / 网页标题"：
     浏览器标签页标题（<title>）和 favicon 由 index.html 的 <head> 直接
     控制，属于"一次性"设置，这里不会再用 js 覆盖它 —— 这样你在 HTML 里
     改了标题，就会一直生效，不会被脚本改回去。
     页面里可见的"品牌名"（导航栏 Logo、页脚品牌名）则统一从下面的
     SITE_DATA 读取，方便以后只改一个地方就能同步更新。
     ---------------------------------------------------------------- */
  function renderBrandAndNav() {
    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    setText("headerBrandEn", SITE_DATA.brandNameEn);
    setText("headerBrandCn", SITE_DATA.brandName + SITE_DATA.brandTagline);
    setText("footerBrandEn", SITE_DATA.brandNameEn);
    setText("footerCopyrightBrand", `${SITE_DATA.brandNameEn} Studio`);

    const footerDesc = document.getElementById("footerBrandDesc");
    if (footerDesc) {
      footerDesc.innerHTML = `${SITE_DATA.brandName}${SITE_DATA.brandTagline}<br>用光影，留住一生一次的心动。`;
    }
  }

  /* ---------------- 渲染：顶部胶片画廊 ---------------- */
  function buildFrame(item) {
    const frame = document.createElement("div");
    frame.className = "film-frame";
    frame.dataset.id = item.id;
    frame.setAttribute("role", "button");
    frame.setAttribute("tabindex", "0");
    frame.setAttribute("aria-label", `查看大图：${item.title}`);

    frame.innerHTML = `
      <div class="sprockets top">${"<span></span>".repeat(8)}</div>
      <div class="frame-img-wrap">
        <img src="${IMG_DIR}${item.file}" alt="${item.title}" loading="lazy">
        <span class="frame-no">No. ${item.id}</span>
        <span class="frame-hint">查看大图 · ${item.title}</span>
      </div>
      <div class="sprockets bottom">${"<span></span>".repeat(8)}</div>
    `;

    frame.addEventListener("click", () => openLightbox(item.id));
    frame.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(item.id);
      }
    });
    return frame;
  }

  function renderFilmstrip() {
    const track = document.getElementById("filmstripTrack");
    track.innerHTML = "";
    // 复制一份数据首尾相接，实现无缝向左自动滚动
    const loopData = SITE_DATA.items.concat(SITE_DATA.items);
    loopData.forEach((item) => track.appendChild(buildFrame(item)));
  }

  /* ---------------- 渲染：下方图文列表 ---------------- */
  function buildItemRow(item) {
    const row = document.createElement("article");
    row.className = "item-row";

    row.innerHTML = `
      <figure class="item-figure" data-id="${item.id}" role="button" tabindex="0"
              aria-label="放大查看：${item.title}">
        <img src="${IMG_DIR}${item.file}" alt="${item.title}" loading="lazy">
        <span class="item-no">No. ${item.id}</span>
        <span class="item-zoom" aria-hidden="true">&#x2295;</span>
      </figure>
      <div class="item-text">
        <p class="item-tag">${item.tag}</p>
        <h3>${item.title}</h3>
        <p>${item.desc}</p>
      </div>
    `;

    const fig = row.querySelector(".item-figure");
    fig.addEventListener("click", () => openLightbox(item.id));
    fig.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(item.id);
      }
    });
    return row;
  }

  function renderItemList() {
    const list = document.getElementById("itemList");
    list.innerHTML = "";
    SITE_DATA.items.forEach((item) => list.appendChild(buildItemRow(item)));
  }

  /* ---------------- 渲染：关于我们 / 联系方式 ---------------- */
  function renderAboutAndContact() {
    document.getElementById("aboutTitle").textContent = SITE_DATA.about.title;
    document.getElementById("aboutBody").textContent = SITE_DATA.about.body;

    document.getElementById("contactPhone").textContent = `电话：${SITE_DATA.contact.phone}`;
    document.getElementById("contactEmail").textContent = `邮箱：${SITE_DATA.contact.email}`;
    document.getElementById("contactAddress").textContent = `地址：${SITE_DATA.contact.address}`;
    document.getElementById("contactHours").textContent = `营业时间：${SITE_DATA.contact.hours}`;

    document.getElementById("year").textContent = new Date().getFullYear();
  }

  /* ---------------- Lightbox 弹窗 ---------------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxFrameNo = document.getElementById("lightboxFrameNo");
  const lightboxTag = document.getElementById("lightboxTag");
  const lightboxTitle = document.getElementById("lightboxTitle");
  const lightboxDesc = document.getElementById("lightboxDesc");
  let lastFocused = null;

  function openLightbox(id) {
    const item = SITE_DATA.items.find((i) => i.id === id);
    if (!item) return;

    lightboxImg.src = IMG_DIR + item.file;
    lightboxImg.alt = item.title;
    lightboxFrameNo.textContent = `No. ${item.id}`;
    lightboxTag.textContent = item.tag;
    lightboxTitle.textContent = item.title;
    lightboxDesc.textContent = item.desc;

    lastFocused = document.activeElement;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-locked");
    document.getElementById("lightboxClose").focus();
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-locked");
    if (lastFocused) lastFocused.focus();
  }

  function initLightbox() {
    document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
    document.getElementById("lightboxBackdrop").addEventListener("click", closeLightbox);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
    });
  }

  /* ---------------- 顶部导航：滚动变色 + 移动端菜单 ---------------- */
  function initHeader() {
    const header = document.getElementById("siteHeader");
    const toggle = document.getElementById("navToggle");
    const nav = document.getElementById("mainNav");

    function onScroll() {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ---------------- 背景音乐：右下角固定按钮，点击切换播放/暂停 ---------------- */
  function initMusic() {
    const btn = document.getElementById("musicToggle");
    const audio = document.getElementById("bgMusic");
    if (!btn || !audio || !SITE_DATA.music || !SITE_DATA.music.src) return;

    audio.src = SITE_DATA.music.src;
    audio.loop = true;

    function setPlayingState(isPlaying) {
      btn.classList.toggle("is-playing", isPlaying);
      btn.setAttribute("aria-pressed", String(isPlaying));
      btn.setAttribute("aria-label", isPlaying ? "暂停背景音乐" : "播放背景音乐");
    }

    function tryPlay() {
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(() => setPlayingState(true))
          .catch(() => {
            // 浏览器拦截了自动播放（这是浏览器策略，不是故障），
            // 保持"暂停"图标，等待用户第一次点击后再开始播放。
            setPlayingState(false);
          });
      }
    }

    btn.addEventListener("click", () => {
      if (audio.paused) {
        tryPlay();
      } else {
        audio.pause();
        setPlayingState(false);
      }
    });

    if (SITE_DATA.music.autoplay) {
      tryPlay();
    } else {
      setPlayingState(false);
    }
  }

  /* ---------------- 初始化 ---------------- */
  document.addEventListener("DOMContentLoaded", () => {
    renderBrandAndNav();
    renderFilmstrip();
    renderItemList();
    renderAboutAndContact();
    initLightbox();
    initHeader();
    initMusic();
  });
})();
