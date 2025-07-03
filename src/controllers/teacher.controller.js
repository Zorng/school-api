import db from '../models/index.js';

const Course = db.Course;

/**
 * @swagger
 * tags:
 *   - name: Teachers
 *     description: Teacher management
 */

/**
 * @swagger
 * /teachers:
 *   post:
 *     summary: Create a new teacher
 *     tags: [Teachers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, department]
 *             properties:
 *               name:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       201:
 *         description: Teacher created
 */
export const createTeacher = async (req, res) => {
    try {
        const teacher = await db.Teacher.create(req.body);
        res.status(201).json(teacher);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

/**
 * @swagger
 * /teachers:
 *   get:
 *     summary: Get all teachers
 *     tags: [Teachers]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema: {type: string, enum: [id, name, createdAt, updatedAt], default: id}
 *         description: column to sort
 *       - in: query
 *         name: order
 *         schema: {type: string, enum: [ASC, DESC] ,default: ASC}
 *         description: order of sort (ascending or descending)
 *       - in: query
 *         name: populate
 *         required: false
 *         explode: false
 *         schema:
 *             type: array
 *             items:
 *                  type: string
 *         description: select tables to join (Course, blah blah)
 *     responses:
 *       200:
 *         description: List of teachers
 */
export const getAllTeachers = async (req, res) => {
    // take certain amount at a time
    const limit = parseInt(req.query.limit) || 10;
    // which page to take
    const page = parseInt(req.query.page) || 1;

    const sortBy = req.query.sortBy || 'id';

    const order = req.query.order || 'asc';

    const populate = req.query.populate?.split(',') || [];

    const includes = [];

    if (populate.find(e => e === 'Course')) includes.push({model: Course});
    // if (populate.find(e => e === 'Extra')) includes.push({model: Extra});
    // console.log(populate);
    // console.log("============")
    // console.log(includes);

    const total = await db.Course.count();
    try {
        const teachers = await db.Teacher.findAll({
            include: includes,
            limit: limit, offset: (page - 1) * limit,
            order: [[sortBy, order]],
        });
        res.json({
            meta: {
                totalItems: total,
                page: page,
                totalPages: Math.ceil(total / limit),
            },
            data: teachers,
        });
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

/**
 * @swagger
 * /teachers/{id}:
 *   get:
 *     summary: Get a teacher by ID
 *     tags: [Teachers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Teacher found
 *       404:
 *         description: Not found
 */
export const getTeacherById = async (req, res) => {
    try {
        const teacher = await db.Teacher.findByPk(req.params.id, {include: db.Course});
        if (!teacher) return res.status(404).json({message: 'Not found'});
        res.json(teacher);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

/**
 * @swagger
 * /teachers/{id}:
 *   put:
 *     summary: Update a teacher
 *     tags: [Teachers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 */
export const updateTeacher = async (req, res) => {
    try {
        const teacher = await db.Teacher.findByPk(req.params.id);
        if (!teacher) return res.status(404).json({message: 'Not found'});
        await teacher.update(req.body);
        res.json(teacher);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

/**
 * @swagger
 * /teachers/{id}:
 *   delete:
 *     summary: Delete a teacher
 *     tags: [Teachers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deleted
 */
export const deleteTeacher = async (req, res) => {
    try {
        const teacher = await db.Teacher.findByPk(req.params.id);
        if (!teacher) return res.status(404).json({message: 'Not found'});
        await teacher.destroy();
        res.json({message: 'Deleted'});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};
