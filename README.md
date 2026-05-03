# 🏍️ Bike Consultancy — Full-Stack Vehicle Management System

Production-ready web application built with **React + Tailwind CSS** (frontend).

### Frontend Setup

```bash
cd bike-consultancy-react-v1

# Install dependencies
npm install

# Start dev server (auto-proxies API to :5000)
npm run dev
# → Runs on http://localhost:5173
```

---
## 🎨 Frontend Pages

| Route | Page | Access |
|-------|------|--------|
| `/login` | Sign In | Guest |
| `/register` | Create Account | Guest |
| `/dashboard` | Stats, charts, recent activity | All |
| `/vehicles` | Inventory grid/list with filters | All |
| `/vehicles/add` | Add new vehicle form | All |
| `/vehicles/:id` | Vehicle detail + expenses + sell | All |
| `/vehicles/:id/edit` | Edit vehicle | All |
| `/expenses` | Office expenses tracker | All |
| `/reports` | Profit & loss reports + charts | Admin |
| `/notifications` | Alert center | All |
| `/settings` | Profile + password | All |

---

## 🔒 Security Features
- JWT authentication with 7-day expiry
- Bcrypt password hashing (12 rounds)
- Helmet.js security headers
- CORS with origin whitelist
- Rate limiting: 200 req/15min (API), 20 req/15min (auth)
- Soft delete (records preserved)
- Admin-only routes (delete, reports, categories)

## 📦 Production Build

```bash
# Frontend
cd frontend && npm run build
# → dist/ folder
```
