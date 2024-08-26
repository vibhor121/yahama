const { Schema, model } = require('mongoose');

// Define roles as constants for better maintainability
const ROLES = Object.freeze({
    ADMIN: 'Admin',
    ORGANIZER: 'Organizer',
    USER: 'User'
});

const userSchema = new Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
    },
    activity: {
        type: Boolean,
        default: true
    },
    role: {
        type: String,
        enum: Object.values(ROLES),
        default: ROLES.USER
    }
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Pre-save hook to enforce email uniqueness (useful if unique indexes are not handled at the DB level)
userSchema.pre('save', async function (next) {
    const user = await this.constructor.findOne({ email: this.email });
    if (user && user._id.toString() !== this._id.toString()) {
        return next(new Error('Email already exists'));
    }
    next();
});

const User = model('User', userSchema);

module.exports = {
    ROLES,
    User
};
