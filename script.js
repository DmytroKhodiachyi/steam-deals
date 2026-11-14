const baseUrl = "https://www.cheapshark.com/api/1.0/deals?storeID=1&pageSize=60&pageNumber=";

const translations = {
  en: {
    title: "Steam Deals",
    was: "was",
    reviews: "reviews",
    noReviews: "No reviews",
    openLink: "Open in Steam",
    loadError: "Failed to load deals. Please try again later.",
  },
  ru: {
    title: "Скидки в Steam",
    was: "было",
    reviews: "отзывов",
    noReviews: "Нет отзывов",
    openLink: "Открыть в Steam",
    loadError: "Не удалось загрузить скидки. Попробуйте позже.",
  },
  uk: {
    title: "Знижки в Steam",
    was: "було",
    reviews: "відгуків",
    noReviews: "Немає відгуків",
    openLink: "Відкрити в Steam",
    loadError: "Не вдалося завантажити знижки. Спробуйте пізніше.",
  },
  de: {
    title: "Steam-Angebote",
    was: "statt",
    reviews: "Bewertungen",
    noReviews: "Keine Bewertungen",
    openLink: "In Steam öffnen",
    loadError: "Angebote konnten nicht geladen werden. Bitte später erneut versuchen.",
  },
  fr: {
    title: "Offres Steam",
    was: "avant",
    reviews: "avis",
    noReviews: "Aucun avis",
    openLink: "Ouvrir dans Steam",
    loadError: "Impossible de charger les offres. Veuillez réessayer plus tard.",
  },
  es: {
    title: "Ofertas de Steam",
    was: "antes",
    reviews: "reseñas",
    noReviews: "Sin reseñas",
    openLink: "Abrir en Steam",
    loadError: "No se pudieron cargar las ofertas. Inténtalo de nuevo más tarde.",
  },
  pt: {
    title: "Ofertas da Steam",
    was: "antes",
    reviews: "avaliações",
    noReviews: "Sem avaliações",
    openLink: "Abrir na Steam",
    loadError: "Não foi possível carregar as ofertas. Tente novamente mais tarde.",
  },
  zh: {
    title: "Steam 优惠",
    was: "原价",
    reviews: "条评价",
    noReviews: "暂无评价",
    openLink: "在 Steam 中打开",
    loadError: "无法加载优惠，请稍后重试。",
  },
  ja: {
    title: "Steam セール",
    was: "通常価格",
    reviews: "件のレビュー",
    noReviews: "レビューなし",
    openLink: "Steamで開く",
    loadError: "セール情報を読み込めませんでした。後でもう一度お試しください。",
  },
  ko: {
    title: "Steam 할인",
    was: "정가",
    reviews: "개의 평가",
    noReviews: "평가 없음",
    openLink: "Steam에서 열기",
    loadError: "할인 정보를 불러오지 못했습니다. 나중에 다시 시도해 주세요.",
  },
  pl: {
    title: "Promocje na Steam",
    was: "było",
    reviews: "recenzji",
    noReviews: "Brak recenzji",
    openLink: "Otwórz w Steam",
    loadError: "Nie udało się załadować promocji. Spróbuj ponownie później.",
  },
  tr: {
    title: "Steam İndirimleri",
    was: "eski fiyat",
    reviews: "inceleme",
    noReviews: "İnceleme yok",
    openLink: "Steam'de aç",
    loadError: "İndirimler yüklenemedi. Lütfen daha sonra tekrar deneyin.",
  },
  it: {
    title: "Offerte Steam",
    was: "prima",
    reviews: "recensioni",
    noReviews: "Nessuna recensione",
    openLink: "Apri su Steam",
    loadError: "Impossibile caricare le offerte. Riprova più tardi.",
  },
};

let currentLang = localStorage.getItem("lang");
if (!translations[currentLang]) currentLang = "en";

let rankedDeals = [];

function createCard(deal) {
  const t = translations[currentLang];

  const card = document.createElement("article");
  card.className = "card";

  const img = document.createElement("img");
  img.src = `https://cdn.cloudflare.steamstatic.com/steam/apps/${deal.steamAppID}/header.jpg`;
  img.alt = deal.title;
  img.onerror = () => { img.src = deal.thumb; };

  const discount = document.createElement("span");
  discount.className = "discount";
  discount.textContent = `-${Math.round(deal.savings)}%`;

  const title = document.createElement("h2");
  title.textContent = deal.title;

  const price = document.createElement("p");
  price.textContent = `$${deal.salePrice} (${t.was} $${deal.normalPrice})`;

  const rating = document.createElement("p");
  rating.textContent = Number(deal.steamRatingCount) > 0
    ? `👍 ${deal.steamRatingPercent}% (${deal.steamRatingCount} ${t.reviews})`
    : t.noReviews;

  const link = document.createElement("a");
  link.href = `https://store.steampowered.com/app/${deal.steamAppID}`;
  link.textContent = t.openLink;
  link.target = "_blank";
  link.rel = "noopener";

  card.append(img, discount, title, price, rating, link);
  return card;
}

function calcScore(deal) {
  const discount = Number(deal.savings) / 100;
  const rating = Number(deal.steamRatingPercent) / 100;
  const reviews = Number(deal.steamRatingCount);

  if (reviews < 100) return 0;

  return discount * rating * Math.log10(reviews);
}

function render() {
  const t = translations[currentLang];

  document.documentElement.lang = currentLang;
  document.title = t.title;
  document.getElementById("page-title").textContent = t.title;

  const container = document.getElementById("deals");
  container.replaceChildren();
  for (const deal of rankedDeals) {
    container.appendChild(createCard(deal));
  }
}

const CACHE_KEY = "deals-cache";
const CACHE_TTL = 10 * 60 * 1000; // 10 минут в миллисекундах

async function fetchPage(n) {
  const response = await fetch(baseUrl + n);
  if (!response.ok) {
    throw new Error(`Страница ${n}: код ответа ${response.status}`);
  }
  return response.json();
}

function readCache() {
  try {
    const saved = JSON.parse(localStorage.getItem(CACHE_KEY));
    return saved && Array.isArray(saved.deals) ? saved : null;
  } catch {
    return null;
  }
}

async function getDeals() {
  const cached = readCache();
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return cached.deals;
  }

  try {
    const pages = await Promise.all([0, 1, 2, 3, 4].map(fetchPage));
    const deals = pages.flat();
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), deals }));
    } catch (e) {
      console.warn("Не удалось сохранить кеш", e);
    }
    return deals;
  } catch (error) {
    if (cached) {
      console.warn("API недоступен, показываю старые данные:", error);
      return cached.deals;
    }
    throw error;
  }
}

async function loadDeals() {
  try {
    const deals = await getDeals();

    rankedDeals = deals
      .filter(deal => calcScore(deal) > 0)
      .sort((a, b) => calcScore(b) - calcScore(a));

    render();
  } catch (error) {
    console.error("Ошибка загрузки:", error);
    document.getElementById("deals").textContent = translations[currentLang].loadError;
  }
}

const select = document.getElementById("lang-select");
select.value = currentLang;
select.addEventListener("change", () => {
  currentLang = select.value;
  localStorage.setItem("lang", currentLang);
  render();
});

render();
loadDeals();