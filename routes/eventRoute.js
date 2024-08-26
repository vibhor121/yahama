const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const eventModel = require('../models/eventModel');
const auth = require('../middleware/auth');
const eventRouter = Router();

// Middleware to authenticate user
eventRouter.use(auth);

// Rate Limiter: Limits registration to once per day per user
const registerLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 1, // Limit each user to 1 request per day
    message: "You can only register for an event once per day",
    keyGenerator: (req) => req.user._id.toString() // Use user ID as the key
});

// Enhanced error handling function
const handleError = (res, message = 'Internal server error', statusCode = 500) => {
    return res.status(statusCode).json({ message });
};

/**
 * @swagger
 * /userEvent:
 *   get:
 *     tags: [Event]
 *     summary: Show all events of the logged-in user
 *     responses:
 *       200:
 *         description: Shows all events successfully
 *       500:
 *         description: Internal server error
 */
eventRouter.get('/', async (req, res) => {
    try {
        const events = await eventModel.find({ user: req.user._id })
            .populate('user', 'email phone activity role');
        return res.status(200).json(events);
    } catch (err) {
        console.error('Error fetching user events:', err);
        return handleError(res);
    }
});

/**
 * @swagger
 * /userEvent:
 *   post:
 *     tags: [Event]
 *     summary: Create an event
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: Event created successfully
 *       500:
 *         description: Internal server error
 */
eventRouter.post('/', async (req, res) => {
    const { eventName, price, capacity } = req.body;
    try {
        const event = new eventModel({
            eventName,
            price,
            capacity,
            user: req.user._id,
            registeredUsers: [] // Initialize registeredUsers array
        });

        await event.save();
        return res.status(201).json(event);
    } catch (err) {
        console.error('Error creating event:', err);
        return handleError(res);
    }
});

/**
 * @swagger
 * /userEvent/{id}:
 *   delete:
 *     tags: [Event]
 *     summary: Delete an event by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
eventRouter.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const event = await eventModel.findById(id);
        if (!event) {
            return handleError(res, 'Event not found', 404);
        }

        if (event.user.toString() !== req.user._id.toString()) {
            return handleError(res, 'Unauthorized to delete this event', 403);
        }

        await eventModel.findByIdAndDelete(id);
        return res.status(200).json({ message: 'Event deleted' });
    } catch (err) {
        console.error('Error deleting event:', err);
        return handleError(res);
    }
});

/**
 * @swagger
 * /userEvent/all:
 *   get:
 *     tags: [Event]
 *     summary: Show all events by other users
 *     responses:
 *       200:
 *         description: Shows all events successfully
 *       500:
 *         description: Internal server error
 */
eventRouter.get('/all', async (req, res) => {
    try {
        const events = await eventModel.find({ user: { $ne: req.user._id } })
            .populate('user', 'email phone activity role');
        return res.status(200).json(events);
    } catch (err) {
        console.error('Error fetching all events:', err);
        return handleError(res);
    }
});

/**
 * @swagger
 * /userEvent/register-event/{id}:
 *   post:
 *     tags: [Event]
 *     summary: Register for an event
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Registered successfully
 *       404:
 *         description: Event not found
 *       400:
 *         description: Already registered or event at full capacity
 *       500:
 *         description: Internal server error
 */
eventRouter.post('/register-event/:id', registerLimiter, async (req, res) => {
    const { id } = req.params;
    try {
        const event = await eventModel.findById(id);
        if (!event) {
            return handleError(res, 'Event not found', 404);
        }

        if (event.registeredUsers.includes(req.user._id)) {
            return handleError(res, 'You are already registered for this event', 400);
        }

        if (event.registeredUsers.length >= event.capacity) {
            return handleError(res, 'Event is already at full capacity', 400);
        }

        event.registeredUsers.push(req.user._id);
        event.price = Math.ceil(event.price * 1.1); // Increase price by 10% upon successful registration
        await event.save();

        const registeredEvents = await eventModel.find({ registeredUsers: req.user._id })
            .populate('user', 'email phone activity role');
        return res.status(200).json(registeredEvents);
    } catch (err) {
        console.error('Error registering for event:', err);
        return handleError(res);
    }
});

module.exports = eventRouter;
