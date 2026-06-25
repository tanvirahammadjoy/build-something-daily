// Quick standalone check that EMAIL_* environment variables are configured
// correctly, without waiting for the notification scheduler's 15-minute
// cron interval (and without needing a real due/overdue task to trigger it).
//
// Usage:
//   node scripts/testEmail.js you@example.com

require('dotenv').config();
const sendEmail = require('../utils/sendEmail');

const to = process.argv[2];

if (!to) {
    console.error('Usage: node scripts/testEmail.js you@example.com');
    process.exit(1);
}

(async () => {
    console.log(
        `Sending a test email to ${to} via ${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT}...`,
    );

    const success = await sendEmail({
        to,
        subject: 'TaskFlow test email',
        text: 'If you got this, your EMAIL_* environment variables are configured correctly.',
    });

    if (success) {
        console.log(
            'Sent successfully — check your inbox (and spam folder, just in case).',
        );
    } else {
        console.log(
            'Failed to send — check the error logged above and double-check your .env values.',
        );
    }

    process.exit(success ? 0 : 1);
})();
