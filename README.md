# 🚀 Dev-Event Hub

A modern, full-stack developer event management platform built with **React**, **Vite**, and **Flask**. Discover, book, and manage tech conferences, hackathons, meetups, and workshops all in one place.

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.1-000000?style=for-the-badge&logo=flask&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
  - [Deploy Backend to Render](#deploy-backend-to-render)
  - [Deploy Frontend to Vercel](#deploy-frontend-to-vercel)
  - [Deploy with Docker](#deploy-with-docker)
- [API Endpoints](#-api-endpoints)
- [Authentication](#-authentication)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🎫 For Attendees

- **Browse Events** – Discover upcoming developer events with detailed information
- **Event Details** – View comprehensive event info including overview, agenda, organizer, and tags
- **Book Events** – Secure your spot with an easy-to-use booking system
- **Email Confirmation** – Receive booking confirmations via EmailJS
- **Manage Bookings** – View and cancel bookings from your personal dashboard

### 👨‍💼 For Administrators

- **Event Management Dashboard** – Full CRUD operations for events
- **Add/Edit/Delete Events** – Manage events with a user-friendly interface
- **Track Bookings** – Monitor booked spots for each event

### 🔐 Authentication

- **User Registration & Login** – Secure JWT-based authentication
- **Password Hashing** – Passwords encrypted with PBKDF2-SHA256
- **Protected Routes** – Role-based access control

### 🎨 User Experience

- **Modern UI** – Beautiful glassmorphism design with gradient accents
- **Responsive Design** – Works seamlessly on all devices
- **Interactive Animations** – Custom light ray effects and smooth transitions

---

## 🛠 Tech Stack

### Frontend

| Technology             | Purpose                         |
| ---------------------- | ------------------------------- |
| **React 19**           | UI library                      |
| **Vite 7**             | Build tool and dev server       |
| **React Router DOM 7** | Client-side routing             |
| **TailwindCSS 4**      | Utility-first CSS framework     |
| **Lucide React**       | Icon library                    |
| **EmailJS**            | Email service for confirmations |
| **Three.js / OGL**     | 3D graphics for visual effects  |

### Backend

| Technology           | Purpose                     |
| -------------------- | --------------------------- |
| **Flask 3.1**        | Python web framework        |
| **Flask-SQLAlchemy** | ORM for database operations |
| **PostgreSQL**       | Relational database         |
| **Pydantic**         | Data validation             |
| **PyJWT**            | JWT token handling          |
| **Passlib**          | Password hashing            |
| **Gunicorn**         | Production WSGI server      |

---

## 📁 Project Structure

```
Dev-event/
├── backend/
│   └── app/
│       ├── wsgi.py             # Flask application factory & entry point
│       ├── main.py             # Event & booking route blueprints
│       ├── auth.py             # Authentication routes & logic
│       ├── models.py           # SQLAlchemy models & Pydantic schemas
│       ├── seed.py             # Database seeding script
│       └── requirements.txt    # Python dependencies
├── public/
│   ├── icons/                  # App icons
│   └── images/                 # Event images
├── src/
│   ├── components/             # React components
│   │   ├── ui/                 # Base UI components
│   │   ├── BookEvent.jsx
│   │   ├── BookingCard.jsx
│   │   ├── EventCard.jsx
│   │   └── ...
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAPI.js
│   │   └── useEvents.js
│   ├── lib/                    # Utilities and context
│   │   ├── api.js              # API client functions
│   │   ├── auth-context.jsx    # Authentication context
│   │   ├── constant.js
│   │   └── utils.js
│   ├── pages/                  # Page components
│   │   ├── AdminDashboard.jsx
│   │   ├── EventPage.jsx
│   │   ├── HomePage.jsx
│   │   ├── LandingPage.jsx
│   │   ├── ManageBookings.jsx
│   │   ├── SignIn.jsx
│   │   └── SignUp.jsx
│   ├── App.jsx                 # Main app with routes
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── package.json
├── vite.config.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **Python** 3.10+
- **PostgreSQL** database (local or cloud-hosted)

---

### Backend Setup

1. **Navigate to the backend directory**

   ```bash
   cd backend/app
   ```

2. **Create a virtual environment**

   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment**

   ```bash
   # On Linux/macOS
   source venv/bin/activate

   # On Windows
   venv\Scripts\activate
   ```

4. **Install Python dependencies**

   ```bash
   pip install -r requirements.txt
   ```

5. **Create a `.env` file in `backend/app/`**

   ```env
   user=your_db_username
   password=your_db_password
   host=your_db_host
   port=5432
   dbname=your_db_name
   ```

6. **Start the backend server**

   ```bash
   python wsgi.py
   ```

   The API will be running at `http://localhost:8000`

---

### Frontend Setup

1. **Open a new terminal and navigate to the project root**

   ```bash
   cd Dev-event
   ```

2. **Install frontend dependencies**

   ```bash
   npm install
   ```

3. **Create a `.env` file in the project root** (optional)

   ```env
   VITE_API_URL=http://localhost:8000
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

---

### Running Both Servers

For full functionality, run both servers simultaneously:

| Terminal 1 (Backend)       | Terminal 2 (Frontend) |
| -------------------------- | --------------------- |
| `cd backend/app`           | `cd Dev-event`        |
| `source venv/bin/activate` | `npm run dev`         |
| `python wsgi.py`           |                       |

---

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🔐 Environment Variables

### Backend (`backend/app/.env`)

```env
user=your_postgres_username
password=your_postgres_password
host=your_db_host
port=5432
dbname=your_database_name
SSL_MODE=require
SECRET_KEY=your-super-secret-jwt-key
ALGORITHM=HS256
ALLOWED_ORIGINS=http://localhost:5173,https://your-production-domain.com
```

> 💡 **Generate a secure SECRET_KEY:** `openssl rand -hex 32`

### Frontend (`.env` in project root)

```env
VITE_API_URL=http://localhost:8000
```

---

## 📡 API Endpoints

Base URL: `http://localhost:8000`

### Health Check

| Method | Endpoint | Description      |
| ------ | -------- | ---------------- |
| `GET`  | `/`      | API health check |

### Authentication

| Method | Endpoint      | Description               |
| ------ | ------------- | ------------------------- |
| `POST` | `/auth/`      | Register new user         |
| `POST` | `/auth/login` | Login (returns JWT token) |
| `POST` | `/auth/token` | OAuth2 token endpoint     |

### Events

| Method   | Endpoint         | Description       |
| -------- | ---------------- | ----------------- |
| `GET`    | `/events`        | Get all events    |
| `GET`    | `/events/{slug}` | Get event by slug |
| `POST`   | `/events`        | Create new event  |
| `PUT`    | `/events/{slug}` | Update event      |
| `DELETE` | `/events/{slug}` | Delete event      |

### Bookings

| Method   | Endpoint                           | Description                 |
| -------- | ---------------------------------- | --------------------------- |
| `GET`    | `/bookings/{user_id}`              | Get all bookings for a user |
| `GET`    | `/booking/detail/{booking_id}`     | Get booking by ID           |
| `POST`   | `/bookings`                        | Create new booking          |
| `DELETE` | `/bookings/{booking_id}`           | Cancel booking              |
| `GET`    | `/bookings/check/{user_id}/{slug}` | Check if user booked event  |

---

## 🗺 Pages & Routes

| Route           | Component        | Description             | Access        |
| --------------- | ---------------- | ----------------------- | ------------- |
| `/`             | `LandingPage`    | Marketing landing page  | Public        |
| `/home`         | `HomePage`       | Browse all events       | Public        |
| `/events/:slug` | `EventPage`      | Event details & booking | Public        |
| `/signin`       | `SignIn`         | User login              | Public        |
| `/signup`       | `SignUp`         | User registration       | Public        |
| `/bookings`     | `ManageBookings` | User's bookings         | Authenticated |
| `/admin`        | `AdminDashboard` | Event management        | Admin only    |

---

## 🔑 Authentication

The application uses **JWT-based authentication**:

- Passwords are hashed using **PBKDF2-SHA256**
- Tokens expire after **20 minutes**
- Tokens are stored in `localStorage`

### How It Works

1. User registers or logs in via `/auth/` or `/auth/login`
2. Server returns a JWT token
3. Token is included in `Authorization: Bearer <token>` header for protected requests
4. Authentication state is managed with React Context (`AuthProvider`)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Made with ❤️ for the developer community
</p>
