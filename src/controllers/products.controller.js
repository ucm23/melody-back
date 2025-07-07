import { pool } from "../connect.js";

/*export const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const store = parseInt(req.query.store);

        // Consulta optimizada para productos con un único inventario
        let queryCount = `
            SELECT COUNT(*) 
            FROM products p
            LEFT JOIN category c ON p.category_id = c.id
            WHERE c.store_id = $1 OR $1 IS NULL
        `;
        
        let queryData = `
            SELECT 
                p.*,
                c.name as category_name,
                c.color as category_color,
                i.id as inventory_id,
                i.name as inventory_name,
                i.ubicacion as inventory_location,
                si.unidades as current_stock,
                si.created_at as last_stock_update
            FROM products p
            LEFT JOIN category c ON p.category_id = c.id
            LEFT JOIN (
                SELECT DISTINCT ON (product_id) *
                FROM     
                ORDER BY product_id, created_at DESC
            ) si ON p.id = si.product_id
            LEFT JOIN inventory i ON si.inventory_id = i.id
            WHERE c.store_id = $1 OR $1 IS NULL
        `;

        const queryParams = [store];
        let paramIndex = 2;

        if (search) {
            queryCount += ` AND p.description ILIKE $${paramIndex}`;
            queryData += ` AND p.description ILIKE $${paramIndex}`;
            queryParams.push(`%${search}%`);
            paramIndex++;
        }

        // Contamos el total
        const totalQuery = await pool.query(queryCount, queryParams);
        const total = parseInt(totalQuery.rows[0].count);

        // Añadimos paginación
        queryData += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        queryParams.push(limit, offset);

        // Ejecutamos la consulta
        const paginatedQuery = await pool.query(queryData, queryParams);
        
        res.json({
            total,
            page,
            total_pages: Math.ceil(total / limit),
            data: paginatedQuery.rows
        });
    } catch (error) {
        console.error("Error en getProducts:", error);
        return res.status(500).json({ message: "Error del servidor: " + error.message });
    }
};*/

/*export const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const store = parseInt(req.query.store);

        // Consulta para contar el total de productos
        let queryCount = `
            SELECT COUNT(*) 
            FROM products p
            LEFT JOIN category c ON p.category_id = c.id
            WHERE (c.store_id = $1 OR $1 IS NULL)
        `;
        
        // Consulta principal optimizada
        let queryData = `
            WITH latest_inventory AS (
                SELECT DISTINCT ON (product_id) *
                FROM save_inventory
                ORDER BY product_id, created_at DESC
            ),
            product_providers AS (
                SELECT 
                    si.product_id,
                    CASE 
                        WHEN COUNT(DISTINCT pr.id) > 1 THEN 'Varios'
                        ELSE MAX(pr.name || ' ' || pr.last_name)
                    END as provider_name,
                    CASE 
                        WHEN COUNT(DISTINCT pr.id) > 1 THEN NULL
                        ELSE MAX(pr.id)
                    END as provider_id
                FROM save_inventory si
                LEFT JOIN providers pr ON si.provider_id = pr.id
                GROUP BY si.product_id
            )
            SELECT 
                p.*,
                json_build_object(
                    'id', c.id,
                    'name', c.name,
                    'color', c.color,
                    'created_at', c.created_at
                ) as category,
                json_build_object(
                    'id', i.id,
                    'name', i.name,
                    'ubicacion', i.ubicacion,
                    'created_at', i.created_at
                ) as inventory,
                pp.provider_name,
                pp.provider_id,
                si.unidades as current_stock,
                si.created_at as last_stock_update
            FROM products p
            LEFT JOIN category c ON p.category_id = c.id
            LEFT JOIN latest_inventory si ON p.id = si.product_id
            LEFT JOIN inventory i ON si.inventory_id = i.id
            LEFT JOIN product_providers pp ON p.id = pp.product_id
            WHERE (c.store_id = $1 OR $1 IS NULL)
        `;

        const queryParams = [store];
        let paramIndex = 2;

        if (search) {
            queryCount += ` AND (p.description ILIKE $${paramIndex} OR p.code ILIKE $${paramIndex})`;
            queryData += ` AND (p.description ILIKE $${paramIndex} OR p.code ILIKE $${paramIndex})`;
            queryParams.push(`%${search}%`);
            paramIndex++;
        }

        // Contamos el total
        const totalQuery = await pool.query(queryCount, queryParams);
        const total = parseInt(totalQuery.rows[0].count);

        // Añadimos paginación y ordenación
        queryData += ` 
            ORDER BY p.created_at DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;
        queryParams.push(limit, offset);

        // Ejecutamos la consulta
        const paginatedQuery = await pool.query(queryData, queryParams);
        
        res.json({
            total,
            page,
            total_pages: Math.ceil(total / limit),
            data: paginatedQuery.rows
        });
    } catch (error) {
        console.error("Error en getProducts:", error);
        return res.status(500).json({ message: "Error del servidor: " + error.message });
    }
};*/

export const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const store = parseInt(req.query.store);
        console.log("🚀 ~ getProducts ~ store:", store)
        
        let queryCount = `
            SELECT COUNT(*) 
            FROM products p
            LEFT JOIN category c ON p.category_id = c.id
            WHERE (c.store_id = $1 OR $1 IS NULL)
        `;

        // Consulta principal optimizada
        let queryData = `
            WITH latest_inventory AS (
                SELECT DISTINCT ON (product_id) *
                FROM save_inventory
                ORDER BY product_id, created_at DESC
            ),
            product_providers AS (
                SELECT 
                    si.product_id,
                    CASE 
                        WHEN COUNT(DISTINCT pr.id) > 1 THEN 'Varios'
                        ELSE MAX(pr.name || ' ' || pr.last_name)
                    END as provider_name,
                    CASE 
                        WHEN COUNT(DISTINCT pr.id) > 1 THEN NULL
                        ELSE MAX(pr.id)
                    END as provider_id
                FROM save_inventory si
                LEFT JOIN providers pr ON si.provider_id = pr.id
                GROUP BY si.product_id
            ),
            first_variant AS (
                SELECT DISTINCT ON (product_id) 
                    id, 
                    path, 
                    product_id,
                    created_at
                FROM variantes
                ORDER BY product_id, created_at ASC
            )
            SELECT 
                p.*,
                json_build_object(
                    'id', c.id,
                    'name', c.name,
                    'color', c.color,
                    'created_at', c.created_at
                ) as category,
                json_build_object(
                    'id', i.id,
                    'name', i.name,
                    'ubicacion', i.ubicacion,
                    'created_at', i.created_at
                ) as inventory,
                pp.provider_name,
                pp.provider_id,
                si.unidades as current_stock,
                si.created_at as last_stock_update,
                json_build_object(
                    'id', fv.id,
                    'path', fv.path,
                    'created_at', fv.created_at
                ) as first_variant
            FROM products p
            LEFT JOIN category c ON p.category_id = c.id
            LEFT JOIN latest_inventory si ON p.id = si.product_id
            LEFT JOIN inventory i ON si.inventory_id = i.id
            LEFT JOIN product_providers pp ON p.id = pp.product_id
            LEFT JOIN first_variant fv ON p.id = fv.product_id
            WHERE (c.store_id = $1 OR $1 IS NULL)
        `;

        const queryParams = [store];
        let paramIndex = 2;

        if (search) {
            queryCount += ` AND (p.description ILIKE $${paramIndex} OR p.code ILIKE $${paramIndex})`;
            queryData += ` AND (p.description ILIKE $${paramIndex} OR p.code ILIKE $${paramIndex})`;
            queryParams.push(`%${search}%`);
            paramIndex++;
        }

        // Contamos el total
        const totalQuery = await pool.query(queryCount, queryParams);
        const total = parseInt(totalQuery.rows[0].count);

        // Añadimos paginación y ordenación
        queryData += ` 
            ORDER BY p.created_at DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;
        queryParams.push(limit, offset);

        // Ejecutamos la consulta
        const paginatedQuery = await pool.query(queryData, queryParams);

        res.json({
            total,
            page,
            total_pages: Math.ceil(total / limit),
            data: paginatedQuery.rows
        });
    } catch (error) {
        console.error("Error en getProducts:", error);
        return res.status(500).json({ message: "Error del servidor: " + error.message });
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
            product, variants, store_id, id: user_id
        } = req.body;
        console.log("🚀 ~ createProduct ~ req.body:", req.body)

        const { description, category, mode } = product;
        if (!description || !category) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const rows = await pool.query(
            `INSERT INTO products ( 
                description, category_id, mode_sale
            ) VALUES ($1, $2, $3) RETURNING id;`, [description, category, mode]);
        console.log("🚀 ~ createProduct ~ rows:", rows)
        let compras = 0;
        let gasto = 0;
        let unidades = 0;
        let price = 0;
        if (rows?.rows[0].id) {
            for (const item of variants || []) {
                const sql = `INSERT INTO variantes (
                    product_id,
                    price,
                    margin,
                    balance,
                    price_whole,
                    margin_whole,
                    balance_whole,
                    mode,
                    code,
                    name
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id;`
                console.log("🚀 ~ createProduct ~ sql:", sql)
                const variantes = await pool.query(sql,
                    [
                        rows?.rows[0].id,
                        item.cost,
                        item.marginValue,
                        item.salePrice,
                        item.wholesaleCost,
                        item.wholesaleMargin,
                        item.wholesalePrice,
                        item.mode,
                        item.code,
                        item.name
                    ]);
                console.log("🚀 ~ createProduct ~ variantes:", variantes)
                /*
                    id: 1,
                    name: '',
                    code: '1234',
                    image: null,
                    cost: 12,
                    marginValue: 12,
                    salePrice: '13.44',
                    hasWholesale: false,
                    wholesaleQuantity: 0,
                    wholesaleCost: 12,
                    wholesaleMargin: 0,
                    wholesalePrice: 0,
                    currentStock: 10,
                    minStock: 10,
                    maxStock: 10
                */

                unidades += item.currentStock;

                const sql_ = `INSERT INTO save_inventory (
                    product_id,
                    inventory_id,
                    tipo,
                    compras,
                    gasto,
                    unidades,
                    price,
                    provider_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id;`
                console.log("🚀 ~ createProduct ~ sql:", sql_)
                const save_inventory = await pool.query(sql_,
                    [
                        rows?.rows[0].id,
                        warehouses,
                        1,
                        item.salePrice,
                        item.wholesaleCost,
                        item.wholesaleMargin,
                        item.wholesalePrice,
                        unidades,
                        12,
                        user_id
                    ]);
                console.log("🚀 ~ createProduct ~ save_inventory:", save_inventory)

                /*let compras = 0;
    let gasto = 0;
    let unidades = 0;
    let price = 0;
    compras += */
            }


        }

        const { warehouses } = product





        /*create table public.save_inventory(
            id bigint generated by default as identity not null,
            created_at timestamp with time zone not null default now(),
                product_id bigint null,
                    inventory_id bigint null,
                        tipo smallint null,
                            compras real null,
                                gasto real null,
                                    unidades real null,
                                        price real null,
                                            provider_id integer null,
        ) TABLESPACE pg_default;*/



        /*let responseData = {
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
        }*/
        res.status(201).json('ok');
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
