const express = require('express');
const router = new express.Router();
const db = require('../db');
const ExpressError = require('../expressError');
const { route } = require('../app');

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`
            SELECT * from invoices
        `)
        return res.json({ "invoices": results.rows });
    } catch (e) {
        return next(e);
    };
});

router.post('/', async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body;
        const results = await db.query(`
            INSERT INTO invoices (comp_code, amt)
                VALUES ($1, $2)
                RETURNING *
        `, [comp_code, amt]);

        return res.json({ "invoices": results.rows[0] });
    } catch (e) {
        return next(e);
    };
});

router.get('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const result = await db.query(`
            SELECT * from invoices
                WHERE id=$1
        `, [id]);
        return res.json({ "invoices": result.rows[0] });
    } catch (e) {
        return next(e);
    };
});

router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amt } = req.body;
        const result = await db.query(`
            UPDATE invoices
                SET amt=$1
            WHERE id=$2
            RETURNING *
        `, [amt, id]);

        return res.json({ "invoice": result.rows[0] });
    } catch (e) {
        return next(e);
    };
});

router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        await db.query(`
            DELETE FROM invoices
                WHERE id=$1
        `, [id]);
        return res.json({ "status": "deleted" });
    } catch (e) {
        return next(e);
    };
});

module.exports = router;