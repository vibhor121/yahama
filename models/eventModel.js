const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const eventSchema = new Schema({
    eventName: {
        type: String,
        required: [true, 'Event name is required'],
        trim: true,
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative'],
    },
    capacity: {
        type: Number,
        required: [true, 'Capacity is required'],
        min: [1, 'Capacity must be at least 1'],
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'auths',
        required: [true, 'User reference is required'],
    },
    registeredUsers: [{
        type: Schema.Types.ObjectId,
        ref: 'auths',
        required: true,
    }],
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    toJSON: { virtuals: true }, // Enable virtuals in JSON output
    toObject: { virtuals: true }, // Enable virtuals in Object output
});

// Virtual field to calculate remaining capacity
eventSchema.virtual('remainingCapacity').get(function () {
    return this.capacity - this.registeredUsers.length;
});

// Middleware to ensure registered users do not exceed capacity
eventSchema.pre('save', function (next) {
    if (this.registeredUsers.length > this.capacity) {
        return next(new Error('Registered users cannot exceed event capacity'));
    }
    next();
});

const Event = model('Event', eventSchema);

module.exports = Event;
