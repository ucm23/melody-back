import express from "express";
import morgan from "morgan";
import cors from 'cors';
//import path from "path";

import bodyParser from 'body-parser';
//import employeesRoutes from "./routes/employees_.routes.js";
import indexRoutes from "./routes/index.routes.js";
import categoriesRoutes from "./routes/categories.routes.js";
import productsRoutes from "./routes/products.routes.js";
import inventorysRoutes from "./routes/inventory.routes.js";
import providersRoutes from "./routes/provider.routes.js";
import employeesRoutes from "./routes/employees.routes.js";

const app = express();
const api = '/api'

app.use(morgan("dev"));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(express.urlencoded({ extended: true }));
//app.use(express.static(path.join(__dirname, 'public')))
app.use(cors())
app.use(`${api}/auth`, indexRoutes);
//app.use("/api", employeesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/warehouses`, categoriesRoutes);
app.use(`${api}/departments`, categoriesRoutes);
app.use(`${api}/movement-report`, categoriesRoutes);

app.use(`${api}/inventory`, inventorysRoutes);
app.use(`${api}/provider`, providersRoutes);
app.use(`${api}/directory`, providersRoutes);
app.use(`${api}/employees`, employeesRoutes);
//app.use("/api/billing", providersRoutes);

app.use((req, res, next) => {
    res.status(404).json({ message: "Not found" });
});

export default app;
