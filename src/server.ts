import { VercelRequest, VercelResponse } from "@vercel/node";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    try {
      const result = await pool.query(
        "SELECT * FROM messages ORDER BY created_at ASC"
      );
      return res.status(200).json(result.rows);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "POST") {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Mensagem vazia" });

    try {
      const result = await pool.query(
        "INSERT INTO messages (text) VALUES ($1) RETURNING *",
        [text]
      );
      return res.status(200).json(result.rows[0]);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Método não permitido" });
}
