import { pool } from "../connect.js";

/*export const getProviders = async (req, res) => {
    try {
        const rows = await pool.query("SELECT * FROM providers");
        res.json(rows?.rows);
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" + error });
    }
};*/

const handlers = {
    '1': 'providers',
    '2': 'employees',
    '3': 'employees',
    '4': 'clients',
};

/*export const getProviders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const store = parseInt(req.query.store);
        const isChecked = req.query.isChecked === 'true';
        const type = req.query.type;
        const isManager = req.query.isManager === 'true'; 

        if (!handlers[type] || isNaN(store)) {
            return res.status(400).json({ message: "Invalid parameters" });
        }

        const table = handlers[type];
        const queryParams = [];
        let paramCounter = 1;

        let whereClauses = [
            `store_id = $${paramCounter++}`,
            `archive = $${paramCounter++}`
        ];
        queryParams.push(store, isChecked);

        let baseQuery = `FROM ${table}`;
        
        if (table === 'employees') {
            baseQuery += ` JOIN roles ON roles.id = ${table}.role_id`;
            whereClauses = [
                `${table}.store_id = $${paramCounter++}`,
                `${table}.archive = $${paramCounter++}`
            ];
        } else {
            whereClauses = [
                `store_id = $${paramCounter++}`,
                `archive = $${paramCounter++}`
            ];
        }
        queryParams.push(store, isChecked);

        if (isManager) {
            whereClauses.push(`manager = $${paramCounter++}`);
            queryParams.push(true);
        }

        if (search) {
            const searchParam = `%${search}%`;
            whereClauses.push(
                `(name ILIKE $${paramCounter} OR last_name ILIKE $${paramCounter} OR company ILIKE $${paramCounter})`
            );
            queryParams.push(searchParam, searchParam, searchParam);
            paramCounter += 3;
        }

        const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        const countQuery = `SELECT COUNT(*) ${baseQuery} ${whereClause}`;
        const totalQuery = await pool.query(countQuery, queryParams);
        const total = parseInt(totalQuery.rows[0].count);

        const selectFields = table === 'employees' 
            ? `${table}.*, roles.name as role_name` 
            : '*';
            
        const dataQuery = `
            SELECT ${selectFields} 
            ${baseQuery} 
            ${whereClause}
            LIMIT $${paramCounter++} OFFSET $${paramCounter++}
        `;
        
        queryParams.push(limit, offset);
        
        const paginatedQuery = await pool.query(dataQuery, queryParams);
        const data = paginatedQuery.rows;

        res.json({
            total,
            page,
            totalPages: Math.ceil(total / limit),
            data
        });
    } catch (error) {
        console.error("Error in getProviders:", error);
        return res.status(500).json({ 
            message: "Something went wrong",
            error: error.message
        });
    }
};*/

export const getProviders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const store = parseInt(req.query.store)
        const isChecked = req.query.isChecked;
        const type = req.query.type;
        const isManager = req.query.isManager;

        const table = handlers[type];

        let queryCount = `SELECT COUNT(*) FROM ${table} WHERE store_id = ${store} AND archive = ${isChecked}`;
        let queryData = `SELECT * FROM ${table} WHERE store_id = ${store} AND archive = ${isChecked}`;
        if (table == 'employees') {
            queryCount = `SELECT COUNT(*) FROM ${table} LEFT JOIN roles ON roles.id = ${table}.role_id WHERE ${table}.store_id = ${store} AND archive = ${isChecked}`;
            queryData = `SELECT * FROM ${table} LEFT JOIN roles ON roles.id = ${table}.role_id WHERE ${table}.store_id = ${store} AND archive = ${isChecked}`;
        }
        if (isManager) {
            queryCount += " AND manager = true";
            queryData += " AND manager = true";
        }
        const queryParams = [];

        if (search) {
            if (table == 'providers') {
                queryCount += " AND name ILIKE $1 OR last_name ILIKE $1 OR company ILIKE $1";
                queryData += " AND name ILIKE $1 OR last_name ILIKE $1 OR company ILIKE $1";
            } else {
                queryCount += " AND name ILIKE $1 OR last_name ILIKE $1";
                queryData += " AND name ILIKE $1 OR last_name ILIKE $1";
            }
            queryParams.push(`%${search}%`);

        }

        console.log("🚀 ~ getProviders ~ queryData:", queryData)
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
        console.log("🚀 ~ getProviders ~ error:", error)
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
        const { store_id } = req.params;
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
                comment || null,
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
        const { store_id } = req.params;
        //const { name,phone, email } = req.body;
        const {
            provider,
            billing
        } = req.body;

        const {
            name,
            last_name,
            phone,
            email,
            comment,
            company,
            id_asiggned_me,
            rfc,
            curp
        } = provider;

        const result = await pool.query(
            `UPDATE providers SET 
            name = COALESCE($1, name),
            last_name = COALESCE($2, last_name),
            phone = COALESCE($3, phone),
            email = COALESCE($4, email),
            comment = COALESCE($5, comment),
            company = COALESCE($6, company),
            id_asiggned_me = COALESCE($7, id_asiggned_me),
            rfc = COALESCE($8, rfc),
            curp = COALESCE($9,curp)
            WHERE id = $10 RETURNING *`,
            [
                name,
                last_name,
                phone,
                email,
                comment,
                company,
                id_asiggned_me,
                rfc,
                curp,
                id
            ]
        );
        console.log("🚀 ~ updateProviders ~ result?.rows[0]:", result?.rows[0])
        if (result?.rowCount === 0) return res.status(404).json({ message: "Providers not found" });
        res.status(201).json(result?.rows[0]);
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" + error });
    }
};

export const archiverProvider = async (req, res) => {
    try {
        const { id } = req.params;
        const { archive } = req.body;
        const result = await pool.query(
            `UPDATE providers SET 
            archive = COALESCE($1, archive)
            WHERE id = $2 RETURNING *`,
            [
                archive,
                id
            ]
        );
        console.log("🚀 ~ updateProviders ~ result?.rows[0]:", result?.rows[0])
        if (result?.rowCount === 0) return res.status(404).json({ message: "Providers not found" });
        res.status(201).json(result?.rows[0]);
    } catch (error) {
        return res.status(500).json({ message: "Something goes wrong" + error });
    }
}