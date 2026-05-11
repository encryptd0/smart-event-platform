# EventFlow — Smart Event Management & Ticketing Platform

A secure, role-aware full-stack web application for managing events, bookings, and customer enquiries. Built for **Advanced Events (Pty) Ltd** as part of the **WPR371** module at **Belgium Campus iTversity**.

---

## 📖 Overview

EventFlow replaces fragmented spreadsheets and manual booking processes with a single platform that:

- Lets the public discover and book tickets to upcoming events.
- Gives administrators full CRUD control over events, plus operational analytics.
- Captures and triages enquiries from a public contact form.
- Enforces capacity, role, and validation rules at every layer.

It is built on a strict **MVC** architecture with three middleware layers (auth, validation, error handling) and uses MongoDB for persistence.

---

## ✨ Key features

- 🔐 Session-based auth with bcrypt-hashed passwords and a Mongo-backed session store.
- 🛡️ Role-aware authorisation (`user` / `admin`) enforced via dedicated middleware.
- 🎟️ Atomic ticket booking — concurrent requests cannot overshoot capacity.
- 📊 Admin analytics dashboard (users, revenue, popular events, capacity usage).
- 🔎 Search + filter (category / date range / availability) on the public listing.
- 📥 Public contact form, admin enquiry triage with status workflow.
- ✅ Server-side validation via `express-validator` on every form.
- 🚫 Friendly 403 / 404 / 500 error pages.

---

## 🛠 Tech stack

| Layer        | Choice                                                  |
| ------------ | ------------------------------------------------------- |
| Runtime      | Node.js 18+                                             |
| Server       | Express.js                                              |
| Templating   | EJS + `express-ejs-layouts`                             |
| Database     | MongoDB + Mongoose                                      |
| Auth         | `bcrypt`, `express-session`, `connect-mongo`            |
| Validation   | `express-validator`                                     |
| Flash msgs   | `connect-flash`                                         |
| Styling      | Bootstrap 5 (CDN) + Bootstrap Icons + custom CSS        |
| Method spoof | `method-override` (PUT / DELETE from forms)             |
| Config       | `dotenv`                                                |
| Dev tooling  | `nodemon`                                               |

---

## 👥 Team

| Name              | Student number | Role / contribution |
| ----------------- | -------------- | ------------------- |
| _Student name 1_  | _XXXXXXXX_     | _e.g. Models & DB schema_ |
| _Student name 2_  | _XXXXXXXX_     | _e.g. Auth & sessions_    |
| _Student name 3_  | _XXXXXXXX_     | _e.g. Admin dashboard_    |
| _Student name 4_  | _XXXXXXXX_     | _e.g. UI / styling_       |

> Replace the placeholders above with your team's details before submission.

---

## 📁 Project structure

```
eventflow/
├── app.js                        # Entry point
├── package.json
├── .env.example
├── .gitignore
├── README.md
├── config/database.js            # MongoDB connection
├── models/                       # Mongoose schemas
│   ├── User.js
│   ├── Event.js
│   ├── Booking.js
│   └── Enquiry.js
├── controllers/                  # Request handlers
│   ├── authController.js
│   ├── eventController.js
│   ├── bookingController.js
│   ├── dashboardController.js
│   ├── contactController.js
│   └── adminController.js
├── routes/                       # Express routers
│   ├── authRoutes.js
│   ├── eventRoutes.js
│   ├── bookingRoutes.js
│   ├── dashboardRoutes.js
│   ├── contactRoutes.js
│   └── adminRoutes.js
├── middleware/                   # 3 middleware layers
│   ├── authMiddleware.js
│   ├── validationMiddleware.js
│   └── errorMiddleware.js
├── views/                        # EJS templates
│   ├── layout.ejs
│   ├── partials/
│   ├── auth/
│   ├── events/
│   ├── dashboard/
│   ├── contact/
│   └── errors/
├── public/                       # Static assets
│   ├── css/style.css
│   ├── js/main.js
│   └── images/
└── seeders/seed.js               # DB seed script
```

---

## 🚀 Setup

There are two ways to run EventFlow:

- **Option A — Docker (recommended).** The fastest path. You only need Docker installed; everything else (Node.js, MongoDB) runs inside containers.
- **Option B — Local Node.js + MongoDB.** Use this if you want to develop against the code directly with hot-reload.

---

### Option A — Run with Docker 🐳

#### Prerequisites
- **Docker Desktop** (Windows / macOS) or **Docker Engine + Docker Compose** (Linux). Nothing else — no Node.js, no MongoDB install required.

#### 1. Start the app

From inside the project folder:

```bash
docker compose up --build
```

This builds the app image, starts MongoDB in a container, and launches EventFlow.

Visit **http://localhost:3000**.

#### 2. Seed the database (first run only)

In a **second terminal**, while the app is running:

```bash
docker compose run --rm seed
```

This populates demo events and the default user accounts listed in the [Default credentials](#-default-credentials-after-seeding) section below.

#### 3. Stop the app

In the terminal running compose, press `Ctrl+C`, then optionally:

```bash
docker compose down            # stop & remove containers (keeps DB data)
docker compose down -v         # also wipe the MongoDB volume (fresh start)
```

MongoDB data persists between restarts in the named Docker volume `mongo-data`.

---

### Option B — Run locally with Node.js

#### Prerequisites
- Node.js **v18 or newer**
- A running MongoDB instance (local `mongod` on port 27017 works out of the box)

#### 1. Clone & install

```bash
git clone <your-repo-url> eventflow
cd eventflow
npm install
```

#### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set:

```ini
PORT=3000
MONGODB_URI=mongodb://localhost:27017/eventflow
SESSION_SECRET=replace_with_a_long_random_string
NODE_ENV=development
```

#### 3. Seed the database

```bash
npm run seed             # interactive — prompts before clearing
# or
npm run seed -- --force  # clear and reseed without prompting
```

#### 4. Run the app

```bash
npm run dev    # nodemon (development)
# or
npm start      # plain node
```

Visit **http://localhost:3000**.

---

## 🔑 Default credentials (after seeding)

| Role  | Email                      | Password    |
| ----- | -------------------------- | ----------- |
| Admin | `admin@eventflow.local`    | `Admin@1234`|
| User  | `user1@eventflow.local`    | `User@1234` |
| User  | `user2@eventflow.local`    | `User@1234` |

> Change `SESSION_SECRET` and these passwords before any non-academic use.

---

## 🗺️ Page routes

| Method & path                          | Access  | Purpose                                    |
| -------------------------------------- | ------- | ------------------------------------------ |
| `GET  /`                               | Public  | Event listing + search/filter              |
| `GET  /events/:id`                     | Public  | Event detail page                          |
| `GET  /auth/login`                     | Guest   | Login form                                 |
| `POST /auth/login`                     | Guest   | Process login                              |
| `GET  /auth/register`                  | Guest   | Register form                              |
| `POST /auth/register`                  | Guest   | Create account & auto-login                |
| `POST /auth/logout`                    | Auth    | Destroy session                            |
| `GET  /dashboard`                      | Auth    | User dashboard or admin analytics          |
| `POST /bookings/:eventId`              | Auth    | Atomically book tickets                    |
| `POST /bookings/:id/cancel`            | Auth    | Cancel a confirmed booking                 |
| `GET  /contact`                        | Public  | Contact form                               |
| `POST /contact`                        | Public  | Submit enquiry                             |
| `GET  /admin/events`                   | Admin   | Manage events table                        |
| `GET  /admin/events/new`               | Admin   | New event form                             |
| `POST /admin/events`                   | Admin   | Create event                               |
| `GET  /admin/events/:id/edit`          | Admin   | Edit event form                            |
| `PUT  /admin/events/:id`               | Admin   | Update event                               |
| `DELETE /admin/events/:id`             | Admin   | Delete event (blocked if bookings exist)   |
| `GET  /admin/enquiries`                | Admin   | Enquiry triage                             |
| `PUT  /admin/enquiries/:id/status`     | Admin   | Update enquiry status                      |
| `DELETE /admin/enquiries/:id`          | Admin   | Delete enquiry                             |

---

## 🧪 Testing the acceptance criteria

A few manual checks the marker (or you) might run:

- **Hashed passwords** — connect to Mongo and verify the `password` field in `users` is a `$2b$…` bcrypt hash, not plaintext.
- **403 on admin routes** — log in as `user1@eventflow.local` and visit `/admin/events`. You should see a 403 page, not a crash.
- **Atomic booking** — open the same event in two tabs as two different users when only one ticket remains; only one booking should succeed.
- **500 page** — with `NODE_ENV=development`, visit `/__test-error` to render the global error handler.
- **Idempotent seed** — run `npm run seed -- --force` twice; the second run must succeed without errors.

---

## 🖼️ Screenshots

> _Add screenshots of the home page, dashboards, and admin views here before submission._

```
docs/screenshots/home.png
docs/screenshots/admin-dashboard.png
docs/screenshots/booking.png
```

---

## 📚 Academic integrity

This project was developed as coursework for **WPR371** at **Belgium Campus iTversity**. All members of the team contributed to the design, implementation, and testing as listed in the team table. External code, libraries, and learning resources are credited via `package.json` dependencies and inline comments where applicable. No portion of this submission may be re-used by other students without attribution.

---

## 📄 License

MIT — see `LICENSE` (or `package.json`) for details. Provided for educational use.
