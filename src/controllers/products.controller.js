import { pool } from "../connect.js";

export const getProducts = async (req, res) => {
    try {
        /*const rows = await pool.query("SELECT * FROM products");
        res.json(rows?.rows);*/

        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const store = parseInt(req.query.store)

        let queryCount = `SELECT COUNT(*) FROM products WHERE store_id = ${store}`;
        let queryData = `SELECT * FROM products WHERE store_id = ${store}`;
        const queryParams = [];

        if (search) {
            queryCount += " AND description ILIKE $1";
            queryData += " AND description ILIKE $1";
            queryParams.push(`%${search}%`);
        }

        const totalQuery = await pool.query(queryCount, queryParams);
        const total = parseInt(totalQuery.rows[0].count);

        queryData += " LIMIT $" + (queryParams.length + 1) + " OFFSET $" + (queryParams.length + 2);
        const paginatedQuery = await pool.query(queryData, [...queryParams, limit, offset]);
        console.log("🚀 ~ getProducts ~ queryData:", queryData)
        const data = paginatedQuery.rows;

        res.json({
            total,
            page,
            data
        });
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" + error });
    }
};

export const getProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const rows = await pool.query(`SELECT * FROM products WHERE id = $1`, [id]);
        if (rows?.rows.length <= 0) return res.status(404).json({ message: "products not found" });
        res.json(rows?.rows[0]);
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" + error });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const rows = await pool.query("DELETE FROM products WHERE id = $1", [id]);
        console.log("🚀 ~ deleteProduct ~ rows:", rows)
        if (rows.affectedRows <= 0) return res.status(404).json({ message: "products not found" });
        res.sendStatus(204);
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" + error });
    }
};

export const createProduct = async (req, res) => {
    try {
        const { 
            code, description, mode_sale, price_cost, price_sale, utility, price_whole, departament, quanty_act, quanty_min, inventory_id
        } = req.body;

        const rows = await pool.query(
            `INSERT INTO products ( 
                code, description, mode_sale, price_cost, price_sale, utility, price_whole, departament, quanty_act, quanty_min
            ) VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id;`, [ 
                code, description, mode_sale, price_cost, price_sale, utility, price_whole, departament, quanty_act, quanty_min
        ]);
        let responseData = {
            id: rows?.rows[0].id,
            code,
            description,
            mode_sale,
            price_cost,
            price_sale,
            utility,
            price_whole,
            departament,
            quanty_act,
            quanty_min
        }
        if (inventory_id) {
            const sql = `INSERT INTO save_inventory (product, inventory) VALUES ($1, $2) RETURNING id;`
            const save_inventory = await pool.query(sql, [rows?.rows[0].id, inventory_id])
            responseData.inventory = {
                id: save_inventory?.rows[0].id,
                inventory_id
            }
        }
        res.status(201).json(responseData);
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" + error });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            code,
            description,
            mode_sale,
            price_cost,
            price_sale,
            utility,
            price_whole,
            departament,
            quanty_act,
            quanty_min
        } = req.body;
        const result = await pool.query(
            `UPDATE products SET 
            code = COALESCE($1, code),
            description = COALESCE($2, description),
            mode_sale = COALESCE($3, mode_sale),
            price_cost = COALESCE($4, price_cost),
            price_sale = COALESCE($5, price_sale),
            utility = COALESCE($6, utility),
            price_whole = COALESCE($7, price_whole),
            departament = COALESCE($8, departament),
            quanty_act = COALESCE($9, quanty_act),
            quanty_min = COALESCE($10, quanty_min)
            WHERE id = $11 RETURNING *`,
            [
                code,
                description,
                mode_sale,
                price_cost,
                price_sale,
                utility,
                price_whole,
                departament,
                quanty_act,
                quanty_min,
                id
            ]
        );
        console.log("🚀 ~ updateProduct ~ result?.rows[0]:", result?.rows[0])
        if (result?.rowCount === 0) return res.status(404).json({ message: "Product not found" });
        res.json(result?.rows[0]);
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" + error });
    }
};
