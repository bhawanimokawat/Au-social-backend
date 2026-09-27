# AU Social — Backend

Backend API for **AU Social**, a social networking platform designed for AU students, teachers, mentors, alumni, and administrators.

The platform focuses on professional networking, posts, connections, notifications, teacher/mentor discovery, and admin content management.

---

## 🚀 Features

* User registration and login
* Email verification with OTP
* Forgot password and password reset
* JWT authentication
* User profiles
* Create, update, and delete posts
* Like and unlike posts
* Comments
* Connection requests
* Accept, reject, cancel, and remove connections
* Notifications
* Teacher/Mentor profiles
* Teacher/Mentor search
* Follow and unfollow teachers/mentors
* User search and discovery
* Post reporting
* Admin user management
* Admin post management
* Admin report management
* Role-based authorization
* Rate limiting
* Request body size protection
* Security headers with Helmet
* CORS configuration
* Global error handling

---

## 🛠️ Tech Stack

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* Nodemailer / Email service
* bcrypt
* Helmet
* CORS
* express-rate-limit

---

## 📁 Project Structure

```text
Backend/
│
├── src/
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── connectionController.js
│   │   ├── notificationController.js
│   │   ├── postController.js
│   │   ├── reportController.js
│   │   ├── teacherController.js
│   │   └── userController.js
│   │
│   ├── middleware/
│   │   ├── adminMiddleware.js
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── rateLimitMiddleware.js
│   │
│   ├── models/
│   │   ├── Connection.js
│   │   ├── Comment.js
│   │   ├── Follow.js
│   │   ├── Notification.js
│   │   ├── Post.js
│   │   ├── Report.js
│   │   ├── TeacherProfile.js
│   │   └── user.js
│   │
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── connectionRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── postRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── teacherRoutes.js
│   │   └── userRoutes.js
│   │
│   └── app.js
│
├── server.js
├── package.json
├── package-lock.json
├── .env
├── .gitignore
└── README.md
```

---

## ⚙️ Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/AU-backend.git
```

Move into the project directory:

```bash
cd AU-backend
```

Install dependencies:

```bash
npm install
```

---

## 🔐 Environment Variables

Create a `.env` file in the project root.

Example:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

Add any other environment variables required by your email provider or application configuration.

### ⚠️ Security

Never commit `.env` to GitHub.

Your `.gitignore` should contain:

```gitignore
node_modules/
.env
.env.*
*.log
```

---

## ▶️ Running the Project

Start the development server:

```bash
npm run dev
```

Or, depending on your `package.json` scripts:

```bash
npm start
```

The backend will run on:

```text
http://localhost:5000
```

---

# 🔑 Authentication

Protected APIs require a JWT token.

Use the following header:

```text
Authorization: Bearer YOUR_JWT_TOKEN
```

---

# 👤 User Roles

The system supports the following roles:

```text
student
teacher
mentor
alumni
admin
```

By default, newly registered users are assigned:

```text
student
```

Administrative role changes are handled through protected admin functionality.

---

# 📡 API Documentation

Base URL:

```text
http://localhost:5000
```

## Authentication

| Method | Endpoint                          | Description      |
| ------ | --------------------------------- | ---------------- |
| POST   | `/api/auth/register`              | Register user    |
| POST   | `/api/auth/verify-email`          | Verify email OTP |
| POST   | `/api/auth/login`                 | Login            |
| POST   | `/api/auth/forgot-password`       | Forgot password  |
| PUT    | `/api/auth/reset-password/:token` | Reset password   |

---

## User Profile

| Method | Endpoint             | Description        |
| ------ | -------------------- | ------------------ |
| GET    | `/api/users/profile` | Get own profile    |
| PUT    | `/api/users/profile` | Update own profile |
| GET    | `/api/users/:id`     | Get user profile   |

---

## Posts

| Method | Endpoint              | Description        |
| ------ | --------------------- | ------------------ |
| POST   | `/api/posts`          | Create post        |
| GET    | `/api/posts`          | Get feed           |
| GET    | `/api/posts/:id`      | Get single post    |
| PUT    | `/api/posts/:id`      | Update post        |
| DELETE | `/api/posts/:id`      | Delete post        |
| POST   | `/api/posts/:id/like` | Like / unlike post |

Pagination example:

```text
GET /api/posts?page=1&limit=10
```

---

## Comments

| Method | Endpoint                                 | Description    |
| ------ | ---------------------------------------- | -------------- |
| POST   | `/api/posts/:postId/comments`            | Add comment    |
| GET    | `/api/posts/:postId/comments`            | Get comments   |
| DELETE | `/api/posts/:postId/comments/:commentId` | Delete comment |

---

## Connections

| Method | Endpoint                                | Description             |
| ------ | --------------------------------------- | ----------------------- |
| POST   | `/api/connections/:userId`              | Send connection request |
| PUT    | `/api/connections/:connectionId/accept` | Accept request          |
| PUT    | `/api/connections/:connectionId/reject` | Reject request          |
| DELETE | `/api/connections/:connectionId/cancel` | Cancel request          |
| DELETE | `/api/connections/:connectionId`        | Remove connection       |
| GET    | `/api/connections`                      | Get my connections      |
| GET    | `/api/connections/requests`             | Get pending requests    |

Connection statuses:

```text
pending
accepted
rejected
```

---

## Notifications

| Method | Endpoint                                  | Description               |
| ------ | ----------------------------------------- | ------------------------- |
| GET    | `/api/notifications`                      | Get notifications         |
| PUT    | `/api/notifications/:notificationId/read` | Mark notification as read |
| PUT    | `/api/notifications/read-all`             | Mark all as read          |
| DELETE | `/api/notifications/:notificationId`      | Delete notification       |

Connection request notifications are automatically created when a connection request is sent.

---

## Teacher / Mentor

| Method | Endpoint                   | Description                   |
| ------ | -------------------------- | ----------------------------- |
| POST   | `/api/teachers`            | Create teacher/mentor profile |
| GET    | `/api/teachers/:id`        | Get teacher/mentor profile    |
| PUT    | `/api/teachers/profile`    | Update own profile            |
| GET    | `/api/teachers`            | Get all teachers/mentors      |
| GET    | `/api/teachers/search`     | Search teachers/mentors       |
| GET    | `/api/teachers/:id/posts`  | Get teacher/mentor posts      |
| POST   | `/api/teachers/:id/follow` | Follow teacher/mentor         |
| DELETE | `/api/teachers/:id/follow` | Unfollow teacher/mentor       |

Teacher/Mentor profile creation is restricted to users with:

```text
teacher
mentor
```

roles.

---

## Search & Discovery

| Method | Endpoint                   | Description                 |
| ------ | -------------------------- | --------------------------- |
| GET    | `/api/users/search`        | Search users by name/email  |
| GET    | `/api/users/search/skills` | Search users by skill       |
| GET    | `/api/users/search/batch`  | Search users by batch       |
| GET    | `/api/users/filter/role`   | Filter users by role        |
| GET    | `/api/users/discover`      | Combined search and filters |

Example:

```text
GET /api/users/discover?skill=React&role=student
```

Supported discovery parameters:

```text
query
skill
batchNumber
role
```

---

## Reports

| Method | Endpoint                     | Description   |
| ------ | ---------------------------- | ------------- |
| POST   | `/api/reports/posts/:postId` | Report a post |

Supported report reasons:

```text
spam
harassment
inappropriate
misinformation
other
```

Report statuses:

```text
pending
resolved
dismissed
```

---

## Admin

Admin APIs require both authentication and admin authorization.

| Method | Endpoint                              | Description            |
| ------ | ------------------------------------- | ---------------------- |
| GET    | `/api/admin/users`                    | Get all users          |
| PUT    | `/api/admin/users/:userId/role`       | Change user role       |
| DELETE | `/api/admin/users/:userId`            | Delete user            |
| GET    | `/api/admin/posts`                    | Get all posts          |
| DELETE | `/api/admin/posts/:postId`            | Delete post            |
| GET    | `/api/admin/reports`                  | Get all reports        |
| PUT    | `/api/admin/reports/:reportId/status` | Resolve/dismiss report |

---

# 🛡️ Security

The backend includes multiple security layers:

### Authentication

JWT-based authentication protects private APIs.

### Authorization

Role-based authorization is used for admin and teacher/mentor functionality.

### Ownership Checks

Users can only modify or delete resources they own where applicable.

### Rate Limiting

Requests are limited to reduce excessive API usage.

Example configuration:

```text
100 requests / 15 minutes
```

### Request Body Protection

JSON and URL-encoded request bodies have a size limit.

```text
10 KB
```

### Security Headers

Helmet is used to add security-related HTTP headers.

### CORS

CORS is configured for the frontend application.

### Input Validation

Controllers validate fields, roles, statuses, IDs, and content lengths.

### Global Error Handling

Centralized error middleware provides consistent API error responses.

---

# 🗃️ Main Database Models

The application currently uses the following primary MongoDB collections/models:

```text
User
Post
Comment
Connection
Notification
TeacherProfile
Follow
Report
```

---

# 🔄 Example Connection + Notification Flow

```text
User A
   │
   │ Send connection request
   ▼
POST /api/connections/:userId
   │
   ├── Connection created
   │
   └── Notification created
              │
              ▼
       User B notifications
              │
              ▼
       GET /api/notifications
```

---

# 🧪 API Testing

Recommended tools:

* Postman
* Thunder Client
* Browser DevTools

For protected APIs:

```text
Authorization: Bearer YOUR_JWT_TOKEN
```

Test both successful and unauthorized cases for important endpoints.

---

# 📊 Current Development Status

```text
Authentication          ✅
User Profiles           ✅
Posts                   ✅
Comments                ✅
Connections             ✅
Notifications           ✅
Teacher/Mentor          ✅
Search & Discovery      ✅
Reports                 ✅
Admin                   ✅
Security                ✅
```

---

# 🚧 Future Improvements

Possible future additions include:

* Real-time notifications using Socket.IO
* Image/file upload with cloud storage
* Advanced feed recommendations
* Pagination improvements
* Redis-based rate limiting for multiple server instances
* Automated tests
* API documentation with Swagger/OpenAPI
* Production deployment
* Logging and monitoring

---

# 👨‍💻 Project Status

**AU Social Backend — Development Version**

The backend API structure and major modules are implemented and ready for frontend integration, further testing, and production hardening.

---

## 📄 License

Add your preferred license here, for example:

```text
MIT License
```

or replace this section with your project's actual license information.
