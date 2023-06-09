import App from './app';
import config from './config';
import ContactsRouter from './routers/contacts';
import HealthRouter from './routers/health';

import type {AppRouter} from './types';

const routers: AppRouter[] = [new HealthRouter(), new ContactsRouter()];

const app = new App({routers});

app.listen({serverPort: config.SERVER_PORT});
