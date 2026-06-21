# 📋 LOGISTIKA QOIDALARI (taksiga moslash uchun)

Bu hujjat — logistika monitoringi e'lonni qanday **Order** ga aylantirishi va nimani **bloklashi**ni tushuntiradi. Taksi qoidalarini shunga qarab moslaymiz.

Manba fayllar:
- Keyword ro'yxatlari: `backend/src/monitor/data/dispatcher-keywords.ts`
- Filtr (spam/blok) qoidalari: `backend/src/monitor/message-filter.service.ts`
- Pipeline: `backend/src/monitor/monitor.service.ts` → `handleWorkerNewMessage`

---

## 1. E'lon → Order bo'lish BOSQICHLARI (pipeline)

Har bir guruh xabari shu bosqichlardan o'tadi:

| # | Bosqich | Logistika | Taksi (hozir) |
|---|---------|-----------|---------------|
| 0 | Xabar < 15 belgi | tashlab yuboriladi | tashlab yuboriladi |
| 1 | **Exclude keyword** (foydalanuvchi yozgan) bo'lsa | bloklanadi | bloklanadi |
| 2 | **Keyword match**: `CARGO_KEYWORDS` yoki `DRIVER_KEYWORDS` dan biri bo'lishi SHART | ✅ shart | ❌ **shart emas** (barcha xabardan) |
| 3 | **Telefon raqam SHART** | ✅ raqamsiz → order YO'Q | ❌ **raqamsiz ham order bor** |
| 4 | **14 ta spam/blok qoidasi** | qo'llanadi | qo'llanadi (hozircha bir xil) |
| 5 | Hammasi o'tsa → **Order yaratiladi** | ✅ | ✅ |

> Priority guruh bo'lsa — 2-bosqich (keyword) o'tkazib yuboriladi.

---

## 2. KEYWORD aniqlash (qaysi xabar "yuk" yoki "mashina")

### 🟠 CARGO_KEYWORDS (~519 ta) — "yuk bor" e'lonlari
Namunalar:
```
yuk bor, yuk, tonna, →, ➡, bug'doy, g'alla, paxta, ko'mir, sement,
temir, armatura, meva, sabzavot, un, qurilish, shifer, qum, shag'al,
yuklash, ortiladi, so'm, dollar, + shahar nomlari (toshkent, samarqand...)
```

### 🟢 DRIVER_KEYWORDS (~522 ta) — "mashina bo'sh" e'lonlari
Namunalar:
```
mashina bor, mashina bo'sh, fura bor, fura bo'sh, isuzu bor, gazel bor,
labo bor, damas bor, kamaz bor, man bor, volvo bor, tent bor, ref bor,
sprinter bor, howo bor, porter bor, transport bor, yuk olaman...
```

---

## 3. 14 ta SPAM / BLOK qoidasi (bularga tushsa — BLOK, order yaratilmaydi)

| Rule | Nima | Chegara |
|------|------|---------|
| **1** | Spam kontenti | 4+ hashtag YOKI vakansiya/reklama/app-promo so'zlari (`вакансия`, `ish bor`, `reklama`...) |
| **2** | Profilda dispetcher so'zi | username/ismda `DISPATCHER_KEYWORDS` (logist, dispetcher, kargo, ekspeditor, fura, gazel... ~61 ta) |
| **3** | Profilda ayol ismi | `FEMALE_NAMES` (~179 ta) — fake akkaunt detektori |
| **4** | Takrorlanuvchi belgi | bitta belgi 30+ marta ketma-ket |
| ~~5~~ | ~~Xorijiy manzil~~ | **O'CHIRILGAN** (barcha yo'nalish qabul qilinadi) |
| **6** | Ko'p mention | 2+ `@username` |
| **7** | Uzun xabar | 200+ belgi |
| **8** | Ko'p emoji | 3+ emoji |
| **9** | Ko'p bo'sh qator | 3+ bo'sh qator |
| **10** | Ko'p guruhda faol | bitta user 5 daqiqada 12+ guruhda |
| **11** | Spam tezligi | bitta user 5 daqiqada 10+ xabar |
| **12** | Telefon ko'p guruhda | bitta raqam 10 daqiqada 12+ guruhda |
| **13** | Telefon super-spam | bitta raqam 30 daqiqada 20+ guruhda → SUPER BLOK |
| **14** | Soxta ko'p yo'nalish | bir kunda 2+ farqli yo'nalish (A nuqtalar ham farqli) |

---

## 4. TAKSI uchun MOSLASH — savollar (siz hal qilasiz)

Hozir taksi: **keyword shart emas + raqam shart emas** (ya'ni guruhdagi deyarli barcha xabardan order yaratadi). Quyidagilarni moslash kerak:

1. **Taksi keyword'lari** kerakmi? (masalan: `yo'lovchi`, `odam bor`, `pochta`, `olib ketaman`, `joy bor`, `manzil`, shahar nomlari...) — agar bersangiz, faqat shu so'zli xabardan order yaratiladi (spam kamayadi).
2. **14 ta spam qoidasidan qaysilarini** taksiga ham qoldiramiz, qaysilarini yumshatamiz?
   - Masalan: Rule 7 (200+ belgi), Rule 8 (3+ emoji) — taksi yo'lovchilari uzun/emoji yozishi mumkin → yumshatish kerakmi?
   - Rule 2 (dispetcher), Rule 10-13 (spam tezligi) — taksida ham kerakmi?
3. **Exclude (taqiq) so'zlar** — taksida nimani bloklash kerak?

➡️ Shu uchta savolga javob bersangiz, taksi uchun alohida keyword + qoida to'plamini yozaman (logistikaga tegmasdan).
