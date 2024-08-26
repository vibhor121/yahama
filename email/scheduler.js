const schedule = require('node-schedule');
const sendEmail = require('./email');

// Schedule a reminder email 24 hours before the event starts
function scheduleReminder(event, userEmail) {
  try {
    const eventStartTime = new Date(event.startTime);
    const reminderTime = new Date(eventStartTime.getTime() - 24 * 60 * 60 * 1000);

    if (reminderTime > new Date()) {
      schedule.scheduleJob(reminderTime, async () => {
        const result = await sendEmail({
          email: userEmail,
          subject: `Reminder: ${event.name} is starting soon!`,
          message: `Dear User, just a reminder that the event "${event.name}" will start on ${event.startTime}.`,
        });

        if (result.success) {
          console.log(`Reminder email for event "${event.name}" sent to ${userEmail}.`);
        } else {
          console.error(`Failed to send reminder email for event "${event.name}" to ${userEmail}:`, result.message);
        }
      });
    } else {
      console.warn(`Reminder time for event "${event.name}" has already passed.`);
    }
  } catch (error) {
    console.error('Error scheduling reminder:', error.message);
  }
}

// Schedule a feedback request email 24 hours after the event ends
function scheduleFeedbackRequest(event, userEmail) {
  try {
    const eventEndTime = new Date(event.endTime);
    const feedbackTime = new Date(eventEndTime.getTime() + 24 * 60 * 60 * 1000);

    if (feedbackTime > new Date()) {
      schedule.scheduleJob(feedbackTime, async () => {
        const result = await sendEmail({
          email: userEmail,
          subject: `We’d love your feedback on ${event.name}`,
          message: `Dear User, thank you for attending "${event.name}". We would appreciate your feedback to help us improve.`,
        });

        if (result.success) {
          console.log(`Feedback request email for event "${event.name}" sent to ${userEmail}.`);
        } else {
          console.error(`Failed to send feedback request email for event "${event.name}" to ${userEmail}:`, result.message);
        }
      });
    } else {
      console.warn(`Feedback request time for event "${event.name}" has already passed.`);
    }
  } catch (error) {
    console.error('Error scheduling feedback request:', error.message);
  }
}

module.exports = { scheduleReminder, scheduleFeedbackRequest };
