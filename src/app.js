const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
 

const rateLimitMiddleware = require("./middleware/rateLimitMiddleware");
const { notFoundMiddleware, errorMiddleware,} = require("./middleware/errorMiddleware");
const healthRoutes = require("./routes/healthRoutes");
//const authRoutes = require("./routes/authRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes= require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const connectionRoutes = require("./routes/connectionRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const adminRoutes = require("./routes/adminRoutes")
const reportRoutes = require("./routes/reportRoutes");

const app = express();

app.use(express.json({ limit: "10kb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb",
  })
);

app.use(rateLimitMiddleware);
 
app.use(
  helmet({
    strictTransportSecurity: false,
  })
);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users",userRoutes);
app.use("/api/posts",postRoutes);
app.use("/api/",commentRoutes)
app.use("/api/connections",connectionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/teachers",teacherRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reports",reportRoutes);

//global Error handling
app.use(notFoundMiddleware);
app.use(errorMiddleware);


app.get("/", (req, res) => {
  res.json({
    message: "AU Foundation Backend is running 🚀",
  });
});

module.exports = app;