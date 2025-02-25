import { pool } from "../connect.js";

export const getCategories = async (req, res) => {
    try {
        const rows = await pool.query("SELECT * FROM departaments");
        res.json(rows?.rows);
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" + error });
    }
};

export const getCategorie = async (req, res) => {
    try {
        const { id } = req.params;
        const rows = await pool.query(`SELECT * FROM departaments WHERE id = $1`, [id]);
        if (rows?.rows.length <= 0) return res.status(404).json({ message: "departaments not found" });
        res.json(rows?.rows[0]);
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" + error });
    }
};

export const deleteCategorie = async (req, res) => {
    try {
        const { id } = req.params;
        const rows = await pool.query("DELETE FROM departaments WHERE id = $1", [id]);
        console.log("🚀 ~ deleteCategorie ~ rows:", rows)

        if (rows.affectedRows <= 0) {
            return res.status(404).json({ message: "departaments not found" });
        }

        res.sendStatus(204);
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" + error });
    }
};

export const createCategorie = async (req, res) => {
    try {
        const { name, color } = req.body;
        //const sql = `INSERT INTO departaments (name, color) VALUES ("${name}", "${color}")`
        //console.log("🚀 ~ createCategorie ~ sql:", sql)
        const rows = await pool.query("INSERT INTO departaments (name, color) VALUES ($1, $2) RETURNING id;", [name, color]);
        //console.log("🚀 ~ createCategorie ~ rows:", rows?.rows[0].id)
        res.status(201).json({ id: rows?.rows[0].id, name, color });
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" + error });
    }
};

export const updateCategorie = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, color } = req.body;

        const result = await pool.query(
            "UPDATE departaments SET name = COALESCE($1, name), color = COALESCE($2, color) WHERE id = $3 RETURNING *",
            [name, color, id]
        );
        //console.log("🚀 ~ updateCategorie ~ result:", result)
        //let data = result?.rows[0]
        console.log("🚀 ~ updateCategorie ~ result?.rows[0]:", result?.rows[0])

        if (result?.rowCount === 0) return res.status(404).json({ message: "Categorie not found" });

        res.json(result?.rows[0]);
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" + error });
    }
};
