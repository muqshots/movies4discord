import express from "express";
import QuickLRU from "quick-lru";

const app = express();

const introLru = new QuickLRU<string, string>({
  maxSize: 99999,
  maxAge: 1000 * 60 * 30, // 30 minutes
});

app.get("/", async (req, res) => {
});

app.listen(4200, () => console.log("Intros app listening at http://localhost:4200"));
