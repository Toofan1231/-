document.addEventListener("DOMContentLoaded", function () {
  const isRoot = location.pathname.endsWith("index.html") || location.pathname === "/" || location.pathname.endsWith("/");
  const path = isRoot ? "pages/" : "";

  const menuHTML = `
    <nav class="main-nav">
      <div class="logo">📘 آکادمی شما</div>
      <ul class="menu" id="nav-items">
        <li><a href="${isRoot ? 'index.html' : '../index.html'}">صفحه اصلی</a></li>
        <li><a href="${path}about.html">درباره ما</a></li>
        <li><a href="${path}courses.html">دوره‌ها</a></li>
        <li><a href="${path}contact.html">تماس با ما</a></li>
        <li><a href="${path}register.html">ثبت‌نام</a></li>
      </ul>
    </nav>
  `;

  const container = document.getElementById("dynamic-menu");
  if (container) {
    container.innerHTML = menuHTML;

    // اجرای مجدد تابع زبان برای لینک‌های منو پس از درج HTML
    if (typeof switchLanguage === "function") {
      const currentLang = document.documentElement.lang || "fa";
      switchLanguage(currentLang);
    }
  }
});