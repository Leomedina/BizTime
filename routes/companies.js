const express = require('express');
const router = new express.Router();
const db = require('../db');
const ExpressError = require('../expressError');

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM companies`);
        return res.json(results.rows);
    } catch (e) {
        return next(new ExpressError("Bad Request", 500));
    };
});

router.post('/', async (req, res, next) => {
    try {
        const { code, name, description } = req.body;
        const results = await db.query(`
            INSERT INTO companies 
            VALUES ($1, $2, $3)
            RETURNING *
            `, [code, name, description]);

        return res.json(results.rows);
    } catch (e) {
        return next(e);
    };
});

router.get('/:code', async (req, res, next) => {
    try {
        const param_code = req.params.code;
        const company = await db.query(`
            SELECT * FROM companies 
                WHERE code = $1
        `, [param_code]);

        const invoices = await db.query(`
            SELECT id, amt, paid, add_date, paid_date 
                FROM companies 
                INNER JOIN invoices 
                ON invoices.comp_code = companies.code 
            WHERE companies.code = $1
        `, [param_code]);
        const { code, name, description } = company.rows[0];

        // if (!company.rowCount) throw new ExpressError("Not Found", 404);

        return res.json({
            "company": {
                "code": code,
                "name": name,
                "description": description,
                "invoices": invoices.rows,
            }
        });
    } catch (e) {
        return next(e);
    };
});

router.patch('/:code', async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const code = req.params.code;
        const results = await db.query(`
            UPDATE companies
            SET name=$1,
                description =$2
            WHERE code=$3
            RETURNING *`,
            [name, description, code]);

        return res.json(results.rows);
    } catch (e) {
        return next(e);
    };
});

router.delete('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        await db.query(`
            DELETE FROM companies
                WHERE code=$1
            `, [code]);

        return res.json({
            "status": "deleted"
        });
    } catch (e) {
        return next(e);
    };
});

module.exports = router;