import { pool } from "../connect.js";

/*export const getProviders = async (req, res) => {
    try {
        const rows = await pool.query("SELECT * FROM providers");
        res.json(rows?.rows);
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" + error });
    }
};*/

export const getProviders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Página solicitada (por defecto 1)
        const limit = 10; // Número de elementos por página
        const offset = (page - 1) * limit; // Cálculo del offset
        const search = req.query.search || ''; // Parámetro de búsqueda (opcional)
        const store = parseInt(req.query.store)

        // Consulta base para contar y buscar
        let queryCount = `SELECT COUNT(*) FROM providers WHERE store_id = ${store}`;
        let queryData = `SELECT * FROM providers WHERE store_id = ${store}`;
        const queryParams = [];

        // Si hay un parámetro de búsqueda, añadimos condiciones a las consultas
        if (search) {
            queryCount += " AND name ILIKE $1 OR company ILIKE $1";
            queryData += " AND name ILIKE $1 OR company ILIKE $1";
            queryParams.push(`%${search}%`);
        }

        // Consulta para obtener el total de proveedores (con o sin búsqueda)
        const totalQuery = await pool.query(queryCount, queryParams);
        const total = parseInt(totalQuery.rows[0].count);

        // Consulta para obtener los proveedores paginados (con o sin búsqueda)
        queryData += " LIMIT $" + (queryParams.length + 1) + " OFFSET $" + (queryParams.length + 2);
        const paginatedQuery = await pool.query(queryData, [...queryParams, limit, offset]);
        const data = paginatedQuery.rows;

        // Devolver el objeto con la estructura deseada
        res.json({
            total,
            page,
            data
        });
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong: " + error.message });
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

export const getBilling = async (req, res) => {
    try {
        const { id } = req.params;
        const rows = await pool.query(`SELECT * FROM billing WHERE provider_id = $1`, [id]);
        if (rows?.rows.length <= 0) return res.status(404).json({ message: "billing not found" });
        res.json(rows?.rows[0]);
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" + error });
    }
};

export const deleteProvider = async (req, res) => {
    try {
        const { id } = req.params;
        const row_billing = await pool.query("DELETE FROM billing WHERE provider_id = $1", [id]);
        console.log("🚀 ~ deleteProvider ~ row_billing:", row_billing)

        const rows = await pool.query("DELETE FROM providers WHERE id = $1", [id]);
        console.log("🚀 ~ deleteProviders ~ rows:", rows)
        if (rows.rowCount <= 0) return res.status(404).json({ message: "providers not found" });
        res.sendStatus(204);
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" + error });
    }
};

export const createProvider = async (req, res) => {
    try {
        const {
            provider,
            billing
        } = req.body;
        console.log("🚀 ~ createProvider ~ req.body:", req.body)
        /*const {
            name
        } = req.body;
        console.log("🚀 ~ createProvider ~ name:", name)*/
        //console.log("🚀 ~ createProvider ~ req.body:", req)
        const {
            name,
            last_name,
            //alias,
            phone,
            email,
            comment,
            company,
            id_asiggned_me,
            rfc,
            curp,
            credit_limit,
            credit_days,
            store_id,
        } = provider;
        console.log("🚀 ~ createProvider ~ provider:", provider)
        /**/
        const sql = `
            INSERT INTO providers (
                name, last_name, alias, phone, email, comment, company, id_asiggned_me, rfc, curp, store_id
            ) VALUES ( 
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
            ) RETURNING id;`
        console.log("🚀 ~ createProvider ~ sql:", sql)
        const rows = await pool.query(
            sql,
            [
                name,
                last_name,
                name,
                phone,
                email,
                comment,
                company,
                id_asiggned_me,
                rfc,
                curp,
                store_id
            ]
        );
        console.log("🚀 ~ createProvider ~ rows:", rows)
        if (rows?.rows[0].id) {
            if (billing == null) {
                res.status(201).json({
                    provider: {
                        id: rows?.rows[0].id,
                        ...provider,
                        billing: null
                    }
                });
            } else {
                const {
                    company: social,
                    rfc: rfc_social,
                    curp: curp_social,
                    address,
                    no_e,
                    no_i,
                    cp,
                    col,
                    municipio,
                    local,
                    state,
                    pais,
                } = billing
    
                const sql_billing = `
                INSERT INTO billing (
                    company, rfc, curp, address, no_e, no_i, cp, col, municipio, local, state, pais, provider_id
                ) VALUES ( 
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
                ) RETURNING id;`
                console.log("🚀 ~ createProvider ~ sql:", sql_billing)
                const rows_billing = await pool.query(
                    sql_billing,
                    [
                        social,
                        rfc_social,
                        curp_social,
                        address,
                        no_e,
                        no_i,
                        cp,
                        col,
                        municipio,
                        local,
                        state,
                        pais,
                        rows?.rows[0].id
                    ]
                );
    
                res.status(201).json({
                    provider: {
                        id: rows?.rows[0].id,
                        ...provider,
                        billing: {
                            id: rows_billing?.rows[0].id,
                            ...billing
                        }
                    }
                });
            }
        } else res.status(404).json({ message: "Error insert Provider" });

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
