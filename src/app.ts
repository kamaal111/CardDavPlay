import * as express from 'express';
import * as logger from 'morgan';

import type {AppRouter} from './types';
import ErrorsController from './controllers/errors';
import Database from './database';
import config from './config';

class App {
  private database: Database;
  private app: express.Express;
  private errors: ErrorsController;

  constructor({routers}: {routers: AppRouter[]}) {
    this.database = new Database({url: config.MONGODB_URL});
    this.app = express();
    this.errors = new ErrorsController();

    this.initializeMiddleware();
    this.initializeRoutes(routers);
  }

  listen({serverPort}: {serverPort: string}) {
    this.app.listen(serverPort, () => {
      console.log(`server listening on port ${serverPort}`);
    });
  }

  private initializeMiddleware() {
    this.app.use(logger('dev'));
    this.app.use(express.json());
  }

  private initializeRoutes(routers: AppRouter[]) {
    for (const router of routers) {
      this.app.use(router.path, router.router);
    }

    this.errors.handle(this.app);
  }
}

export default App;
