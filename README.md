# EventFlow — Smart Event Management & Ticketing Platform

A secure full-stack web application for managing events, ticket bookings, and customer enquiries. Built for **Advanced Events (Pty) Ltd** to replace fragmented spreadsheets and manual booking processes with a unified, role-aware platform.

---

## 📖 Overview

EventFlow allows event organisers to create and manage events, monitor bookings through analytics dashboards, and respond to customer enquiries in one place. Standard users can browse events, book tickets with automated capacity validation, and track their booking history.

The system follows the **MVC architectural pattern** with clear separation of concerns, middleware-based authentication and authorisation, and MongoDB for data persistence.

---

## ✨ Key Features

- **User Authentication** — Secure registration and login with hashed passwords (bcrypt) and role-based access control (Admin / Standard User).
- **Event Management (Admin)** — Full CRUD operations for events, with capacity and availability controls.
- **Ticket Booking System** — Automated capacity validation prevents overbooking; users can book and view their booking history.
- **Search & Filtering** — Discover events by date, category, and availability.
- **Admin Dashboard** — Analytics on total bookings, popular events, and capacity usage.
- **Contact / Enquiry Management** — Users submit enquiries; admins view and manage them from the dashboard.

---

## 🛠 Technologies Used

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Templating | EJS |
| Database | MongoDB + Mongoose ODM |
| Auth | bcrypt, express-session *(or JWT — update to match)* |
| Styling | HTML5, CSS3, Bootstrap *(or Tailwind — update to match)* |
| Config | dotenv |
| Dev Tools | nodemon |
| Version Control | Git & GitHub |

---

## 👥 Team Members and Roles

| Name | Student Number | Role |
|---|---|---|
| *Member 1* | *Student #* | Team Lead / Project Coordinator |
| *Member 2* | *Student #* | Backend Developer |
| *Member 3* | *Student #* | Frontend Developer |
| *Member 4* | *Student #* | Database Engineer |
| *Member 5* | *Student #* | Security / DevOps Engineer |

---

## 📁 Project Structure

```
eventflow/
├── controllers/        # Request handlers (auth, events, bookings, contact)
├── models/             # Mongoose schemas (User, Event, Booking, Enquiry)
├── routes/             # Express route definitions
├── middleware/         # Auth, authorisation, and error-handling middleware
├── views/              # EJS templates
│   ├── partials/
│   ├── auth/
│   ├── events/
│   ├── dashboard/
│   └── contact/
├── public/             # Static assets (CSS, images, client JS)
├── config/             # DB connection and environment config
├── .env.example        # Environment variable template
├── app.js              # Application entry point
└── package.json
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/<your-username>/<repo-name>.git
   cd <repo-name>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the project root (use `.env.example` as a template):
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/eventflow
   SESSION_SECRET=your_secret_here
   NODE_ENV=development
   ```

4. **Run the application**

   For development (auto-reload with nodemon):
   ```bash
   npm run dev
   ```

   For production:
   ```bash
   npm start
   ```

5. **Access the app**

   Open your browser at [http://localhost:3000](http://localhost:3000).

---

## 🔐 Default Admin Account

For demonstration purposes, an admin account can be seeded:

```
Email:    admin@eventflow.local
Password: Admin@1234
```

*Update or remove this section based on your seeding setup.*

---

## 🌐 Pages

| Page | Route | Access |
|---|---|---|
| Home / Event Listing | `/` | Public |
| Login / Register | `/auth/login`, `/auth/register` | Public |
| Event Management | `/admin/events` | Admin only |
| Booking & Dashboard | `/dashboard` | Authenticated |
| Contact / Enquiries | `/contact` | Public (submit) / Admin (manage) |

---

## 🖼 Screenshots

*Add screenshots of key pages here once the UI is finalised.*

- Home / Event Listing
- Login & Register
- Admin Event Management
- User Dashboard & Booking History
- Admin Analytics Dashboard
- Contact Form & Enquiry Management

---

## 🧪 Testing

API endpoints can be tested using Postman, Thunder Client, or REST Client. A Postman collection is included in `/docs/postman_collection.json` *(if applicable)*.

---

## 💭 Reflection

*Optional — add a short reflection on what the team learned, challenges faced, and how they were overcome.*

---

## 📜 Academic Integrity

This project is the original work of the listed team members, submitted for **WPR371** at Belgium Campus iTversity. External resources (documentation, tutorials) were consulted for learning purposes and adapted where used. All code and design decisions can be explained and justified by the team.

---

## 📄 License

This project is developed for academic purposes as part of coursework at Belgium Campus iTversity.
