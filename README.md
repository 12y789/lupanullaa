# 🌿 Lupanullaa

**Jukwaa #1 la Elimu Tanzania** — Notes, Past Papers & Daily Quizzes kwa wanafunzi na walimu wa NECTA.

---

## 📋 Muhtasari

Lupanullaa ni platform ya elimu iliyoundwa kwa ajili ya wanafunzi na walimu wa Tanzania. Inajumuisha:

- 📚 **Notes** — Muhtasari wa masomo yote kwa TIE syllabus mpya
- 📄 **Past Papers** — Maswali ya NECTA ya miaka iliyopita
- 🎯 **Daily Quizzes** — Maswali 10 kila siku kwa masomo mbalimbali
- 🤖 **AI Msaidizi** — Chatbot inayosaidia maswali ya elimu (Gemini AI)
- 🌙 **Dark Mode** — Muonekano wa usiku
- 🌐 **Kiswahili / English** — Lugha mbili zinazobadilishana

---

## 🗂️ Muundo wa Faili

```
lupanullaa/
├── index.html                  # Ukurasa mkuu (frontend yote)
├── admin.html                  # Dashboard ya msimamizi
├── netlify.toml                # Mipangilio ya Netlify
└── netlify/
    └── functions/
        └── chat.js             # Netlify Function — AI Chat (Gemini API)
```

---

## ⚙️ Teknolojia Inayotumiwa

| Sehemu | Teknolojia |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Fonts | Google Fonts (Syne, Plus Jakarta Sans) |
| Icons | Font Awesome |
| UI Extras | Tailwind CSS (modal ya jiunge) |
| AI Backend | Netlify Functions + Google Gemini 1.5 Flash |
| Hosting | Netlify |

---
## 🤖 Jinsi AI Chat Inavyofanya Kazi

```
Mtumiaji (Browser)
       │
       │  POST /.netlify/functions/chat
       │  { system, messages }
       ▼
Netlify Function (chat.js)
       │
       │  POST https://generativelanguage.googleapis.com
       │  API Key iko server-side (salama, haionekani browser)
       ▼
Google Gemini 1.5 Flash
       │
       ▼
Jibu → Mtumiaji
```

> **Muhimu:** API key haiko frontend. Ipo kwenye Netlify Environment Variables peke yake.

---

## 🔐 Usalama

- ✅ API key ya Gemini imefichwa — ipo server-side tu
- ✅ CORS imewekwa vizuri kwenye Netlify Function
- ✅ Input validation kabla ya kutuma kwa Gemini
- ✅ Error handling kwa kila kosa la API au mtandao

---

## 🌍 Lugha

Platform inasaidia lugha mbili:

- 🇹🇿 **Kiswahili** (default)
- 🇬🇧 **English** (kubonyeza kitufe cha lugha)

AI Msaidizi anajibu kwa lugha ile ile mtumiaji anaandika.

---

## 📞 Mawasiliano

- WhatsApp: Kupitia widget ndani ya site
- Admin Panel: `admin.html`

---

## 📝 Leseni

© 2025 Lupanullaa Tanzania. Haki zote zimehifadhiwa.

