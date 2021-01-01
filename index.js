import express from "express";
import jwt from "jsonwebtoken";
import cors from "cors";

const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || "secret";
const users = {};

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  users[email] = password;
  console.log("registered", { email, password });

  const accessToken = jwt.sign({ email }, SECRET, { expiresIn: "1d" });
  return res.status(200).json({ accessToken });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log("login", { email, password, users });
  if (users[email] === password) {
    const accessToken = jwt.sign({ email }, SECRET, { expiresIn: "1d" });
    return res.status(200).json({ accessToken });
  }
  return res.status(401).json({
    error: "Wrong username or password"
  });
});

function authorize(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ");
  req.user = token && jwt.verify(token, SECRET);
  next();
}

app.post("/authorize", authorize, (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Unauthorized"
    });
  }
  res.status(200).json(req.user);
});

app.listen(PORT, () =>
  console.log("listening to port *:%d, press ctrl + c to cancel", PORT)
);
