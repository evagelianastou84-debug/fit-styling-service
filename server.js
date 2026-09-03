import express from "express";
import cors from "cors";
import stylingRoutes from "./routes/styling.js";

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok", service: "styling-service" }));

app.use(stylingRoutes);

app.listen(PORT, () => {
  console.log(`Fit Styling Service running on http://localhost:${PORT}`);
});
