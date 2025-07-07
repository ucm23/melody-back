import { pool } from "../connect.js";

export const getInventorys = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const store = parseInt(req.query.store)

        let queryCount = `SELECT COUNT(*) FROM inventory WHERE store_id = ${store} `;
        let queryData = `SELECT * FROM inventory WHERE store_id = ${store}`;
        const queryParams = [];

        if (search) {
            queryCount += " AND name ILIKE $1 OR ubicacion ILIKE $1";
            queryData += " AND name ILIKE $1 OR ubicacion ILIKE $1";
            queryParams.push(`%${search}%`);
        }
        console.log("🚀 ~ getProducts ~ queryData:", queryData)
        const totalQuery = await pool.query(queryCount, queryParams);
        const total = parseInt(totalQuery.rows[0].count);

        queryData += " LIMIT $" + (queryParams.length + 1) + " OFFSET $" + (queryParams.length + 2);
        const paginatedQuery = await pool.query(queryData, [...queryParams, limit, offset]);

        const data = paginatedQuery.rows;

        res.json({
            total,
            page,
            data
        });
    } catch (error) {
        console.log("🚀 ~ getProducts ~ error:", error)
        return res.status(500).json({ message: "Something goes wrong" + error });
    }
};

export const getSaveInventorys = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const id = parseInt(req.query.id);

        const fechaDesde = req.query.fecha_desde;
        const fechaHasta = req.query.fecha_hasta;
        const fechaExacta = req.query.fecha_exacta;

        let queryData = `
            SELECT 
                si.*,
                p.description AS product_name,
                p.metric AS product_metric,
                p.quanty_act AS quanty_act,
                p.quanty_min AS quanty_min,
                u.name AS provider_name,
                u.last_name AS provider_last_name
            FROM save_inventory si
            LEFT JOIN products p ON si.product_id = p.id
            LEFT JOIN providers u ON si.provider_id = u.id
            WHERE si.inventory_id = $1
        `;

        const queryParams = [id];
        let paramIndex = 2;

        if (search) {
            queryData += ` AND p.description ILIKE $${paramIndex}`;
            queryParams.push(`%${search}%`);
            paramIndex++;
        }

        if (fechaExacta) {
            queryData += ` AND DATE(si.created_at) = $${paramIndex}`;
            queryParams.push(fechaExacta);
            paramIndex++;
        } else {
            if (fechaDesde && !fechaHasta) {
                queryData += ` AND si.created_at >= $${paramIndex}`;
                queryParams.push(fechaDesde);
                paramIndex++;
            } else if (fechaDesde && fechaHasta) {
                queryData += ` AND si.created_at BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
                queryParams.push(fechaDesde, fechaHasta);
                paramIndex += 2;
            }
        }

        queryData += ` ORDER BY si.product_id, si.created_at DESC`;

        const result = await pool.query(queryData, queryParams);

        const groupedData = {};
        result.rows.forEach(row => {
            console.log("🚀 ~ getSaveInventorys ~ row:", row)
            if (!groupedData[row.product_id]) {
                groupedData[row.product_id] = {
                    id: row.product_id,
                    product_name: row.product_name,
                    product_metric: row.product_metric,
                    quanty_act: row.quanty_act,
                    quanty_min: row.quanty_min,
                    movements: []
                };
            }
            const provider = (row?.provider_name && row?.provider_last_name)? `${row.provider_name} ${row.provider_last_name}`: '';
            groupedData[row.product_id].movements.push({
                created_at: row.created_at,
                unidades: row.unidades,
                gasto: row.gasto,
                compras: row.compras,
                monto: row.monto,
                tipo: row.tipo,
                price: row.price,
                provider,
                product_metric: row.product_metric,
            });
        });

        const groupedArray = Object.values(groupedData);
        const paginatedData = groupedArray.slice(offset, offset + limit);
        const total = groupedArray.length;

        res.json({
            total,
            page,
            total_pages: Math.ceil(total / limit),
            data: paginatedData
        });
    } catch (error) {
        console.error("Error en getSaveInventorys:", error);
        return res.status(500).json({ message: "Error del servidor: " + error.message });
    }
};

export const getInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const rows = await pool.query(`SELECT * FROM inventory WHERE id = $1`, [id]);
        if (rows?.rows.length <= 0) return res.status(404).json({ message: "inventory not found" });
        res.json(rows?.rows[0]);
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" + error });
    }
};

export const deleteInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const rows = await pool.query("DELETE FROM inventory WHERE id = $1", [id]);
        console.log("🚀 ~ deleteInventory ~ rows:", rows)
        if (rows.affectedRows <= 0) return res.status(404).json({ message: "inventory not found" });
        res.sendStatus(204);
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" + error });
    }
};

export const createInventory = async (req, res) => {
    try {
        const {
            name
        } = req.body;
        const rows = await pool.query(
            `INSERT INTO inventory (
                name
            ) VALUES (
             $1
             ) RETURNING id;`, [
            name
        ]);
        res.status(201).json({
            id: rows?.rows[0].id,
            name
        });
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" + error });
    }
};

export const updateInventory = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name
        } = req.body;
        const result = await pool.query(
            `UPDATE inventory SET 
            name = COALESCE($1, name)
            WHERE id = $2 RETURNING *`,
            [
                name,
                id
            ]
        );
        console.log("🚀 ~ updateInventory ~ result?.rows[0]:", result?.rows[0])
        if (result?.rowCount === 0) return res.status(404).json({ message: "Inventory not found" });
        res.json(result?.rows[0]);
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" + error });
    }
};
