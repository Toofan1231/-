const navTexts = {
  fa: ["صفحه اصلی", "درباره ما", "دوره‌ها", "تماس با ما"],
  ps: ["کور پاڼه", "زموږ په اړه", "کورسونه", "اړیکه"],
  en: ["Home", "About", "Courses", "Contact"]
};

// محتوای قابل تغییر در صفحات مختلف

const contentTexts = {
  fa: {
    heroTitle: "یادگیری را از همین امروز شروع کن!",
    heroDesc: "دوره‌های رایگان و حرفه‌ای برای همهٔ مردم افغانستان و جهان.",
    heroBtn: "مشاهده دوره‌ها",
    aboutTitle: "درباره آکادمی ما",
  aboutDesc: "ما با هدف ارتقاء سطح آموزش در افغانستان و جهان، آکادمی آموزش آنلاین را راه‌اندازی کردیم تا همه افراد بتوانند از هر کجا و هر زمان به آموزش‌های حرفه‌ای و رایگان دسترسی داشته باشند."
  },
  
  ps: {
    heroTitle: "له نن څخه زده کړه پیل کړه!",
    heroDesc: "وړیا او مسلکي کورسونه د ټولو لپاره.",
    heroBtn: "کورسونه وګورئ",
    aboutTitle: "زموږ آکادمي",
    aboutDesc: "موږ د زده کړو کچه لوړولو لپاره دغه آنلاین آکادمي پیل کړه، تر څو هر څوک هر ځای نه زده کړه وکړي."
  },
  en: {
    heroTitle: "Start learning today!",
    heroDesc: "Free and professional courses for everyone.",
    heroBtn: "View Courses",
    aboutTitle: "About Our Academy",
    aboutDesc: "We started this online academy to provide accessible and professional education to everyone, everywhere, anytime."
  }
};
contentTitle: {
	fa: "با ما در تماس باسید",
	ps: "له موږ سره اریکه ونیسی",
	en: "Contact Us"
}
registerTitle: {
	fa: "فرم ثبت نام دوره‌ها",
	ps: "د دکورس لپاره نوم لیکنه",
	en: "Course Registraion Form"
}
teamTitle: {
	fa: "استادان ما",
	ps: "زموږ استادان",
	en: "Our Instructors"
}
settingsTitle: {
	fa: "تنظیمات پروفایل",
	ps: "د کارونکی پروفایل ترتیبات",
	en: "Profile Settings"
}





// تابع تغییر زبان کل سایت
function switchLanguage(lang) {
  // تغییر منوی بالا
 
  const navItems = document.querySelectorAll('#nav-items li a');
  navItems.forEach((item, index) => {
    item.textContent = navTexts[lang][index];
  });
   const contactTitle =
  document.getElementById('contact-title'):
  if (contactTitle) {
	  contactTitle.textContent = contentTexts.contactTitle[lang];
  }
   const registerTitle =
  document.getElementById('register-title'):
  if (regiterTitle) {
	  registerTitle.textContent = contentTexts.regiterTitle[lang];
  }
const teamTitle =
  document.getElementById('team-Title'):
  if (teamTitle) {
	  teamTitle.textContent = contentTexts.teamTitle[lang];
  }
  const settingsTitle =
  document.getElementById('settings-Title'):
  if (settingsTitle) {
	  settingsTitle.textContent = contentTexts.settingsTitle[lang];
  }


  // اگر صفحه اصلی هست => تغییر محتوای بنر
  const heroTitle = document.querySelector('.hero-content h1');
  const heroDesc = document.querySelector('.hero-content p');
  const heroBtn = document.querySelector('.hero-content a');
  if (heroTitle && heroDesc && heroBtn) {
    heroTitle.textContent = contentTexts[lang].heroTitle;
    heroDesc.textContent = contentTexts[lang].heroDesc;
    heroBtn.textContent = contentTexts[lang].heroBtn;
  }

  // اگر صفحه درباره ما هست => تغییر محتوا
  const aboutTitle = document.getElementById('about-title');
  const aboutDesc = document.getElementById('about-desc');
  if (aboutTitle && aboutDesc) {
    aboutTitle.textContent = contentTexts[lang].aboutTitle;
    aboutDesc.textContent = contentTexts[lang].aboutDesc;
  }

  // تغییر جهت و زبان HTML
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'en' ? 'ltr' : 'rtl';
}