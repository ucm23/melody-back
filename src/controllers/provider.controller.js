import { pool } from "../connect.js";

export const getProviders = async (req, res) => {
    try {
        const rows = await pool.query("SELECT * FROM providers");
        res.json(rows?.rows);
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" + error });
    }
};

export const getProvider = async (req, res) => {
    try {
        const { id } = req.params;
        const rows = await pool.query(`SELECT * FROM providers WHERE id = $1`, [id]);
        if (rows?.rows.length <= 0) return res.status(404).json({ message: "providers not found" });
        res.json(rows?.rows[0]);
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" + error });
    }
};

export const deleteProvider = async (req, res) => {
    try {
        const { id } = req.params;
        const rows = await pool.query("DELETE FROM providers WHERE id = $1", [id]);
        console.log("🚀 ~ deleteProviders ~ rows:", rows)
        if (rows.affectedRows <= 0) return res.status(404).json({ message: "providers not found" });
        res.sendStatus(204);
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" + error });
    }
};

export const createProvider = async (req, res) => {
    try {
        const {
            name,
            phone,
            email,
            store_id,
            company,
            id_asiggned_me
        } = req.body;
        const rows = await pool.query(
            `INSERT INTO providers (
                name, phone, email, store_id, company, id_asiggned_me
            ) VALUES (
             $1, $2, $3, $4, $5, $6
            ) RETURNING id;`,
            [name, phone, email, store_id, company, id_asiggned_me]
        );
        res.status(201).json({
            id: rows?.rows[0].id,
            ...req.body
        });
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" + error });
    }
};

export const updateProvider = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            phone,
            email
        } = req.body;
        const result = await pool.query(
            `UPDATE providers SET 
            name = COALESCE($1, name),
            phone = COALESCE($2, phone),
            email = COALESCE($3, email)
            WHERE id = $4 RETURNING *`,
            [name, phone, email, id]
        );
        console.log("🚀 ~ updateProviders ~ result?.rows[0]:", result?.rows[0])
        if (result?.rowCount === 0) return res.status(404).json({ message: "Providers not found" });
        res.json(result?.rows[0]);
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" + error });
    }
};
