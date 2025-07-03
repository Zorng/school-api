import db from '../models/index.js';

const Course = db.Course;

/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Student management
 */

export const createStudent = async (req, res) => {
    try {
        const student = await db.Student.create(req.body);
        res.status(201).json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /students:
 *   get:
 *     summary: Get all students
 *     tags: [Students]
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
 *         description: select tables to join (Course)
 *     responses:
 *       200:
 *         description: List of students
 */
export const getAllStudents = async (req, res) => {
    // take certain amount at a time
    const limit = parseInt(req.query.limit) || 10;
    // which page to take
    const page = parseInt(req.query.page) || 1;

    const sortBy = req.query.sortBy || 'id';

    const order = req.query.order || 'asc';

    const total = await db.Course.count();

    const populate = req.query.populate?.split(',') || [];

    const includes = [];

    if (populate.find(e => e === 'Course')) includes.push({model: Course});

    try {
        const students = await db.Student.findAll({
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
            data: students,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Get a student by ID
 *     tags: [Students]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: A student
 *       404:
 *         description: Not found
 */
export const getStudentById = async (req, res) => {
    try {
        const student = await db.Student.findByPk(req.params.id, { include: db.Course });
        if (!student) return res.status(404).json({ message: 'Not found' });
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /students/{id}:
 *   put:
 *     summary: Update a student
 *     tags: [Students]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object }
 *     responses:
 *       200:
 *         description: Updated
 */
export const updateStudent = async (req, res) => {
    try {
        const student = await db.Student.findByPk(req.params.id);
        if (!student) return res.status(404).json({ message: 'Not found' });
        await student.update(req.body);
        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * @swagger
 * /students/{id}:
 *   delete:
 *     summary: Delete a student
 *     tags: [Students]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deleted
 */
export const deleteStudent = async (req, res) => {
    try {
        const student = await db.Student.findByPk(req.params.id);
        if (!student) return res.status(404).json({ message: 'Not found' });
        await student.destroy();
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
