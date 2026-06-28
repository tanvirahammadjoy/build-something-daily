import { createApp } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { logger } from './utils/logger';

async function bootstrap(): Promise<void> {
    await connectDB();

    const app = createApp();

    app.listen(env.PORT, () => {
        logger.info(
            `Server running in ${env.NODE_ENV} mode on port http://localhost:${env.PORT}`,
        );
    });
}

bootstrap().catch((err) => {
    logger.error('Failed to start server', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason);
    process.exit(1);
});
