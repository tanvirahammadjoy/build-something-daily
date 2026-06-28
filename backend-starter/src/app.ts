import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import routes from './routes';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler';
import { apiLimiter } from './middlewares/rateLimiter';

export function createApp(): Application {
    const app = express();

    app.use(helmet());
    app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    if (env.NODE_ENV !== 'test') {
        app.use(morgan('dev'));
    }

    app.use('/api', apiLimiter);

    app.get('/api/health', (req, res) => {
        res.status(200).json({ success: true, message: 'Server is healthy' });
    });

    app.use('/api', routes);

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}
