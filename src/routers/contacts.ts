import {Router} from 'express';

import type {AppRouter} from '../types';
import ContactsController from '../controllers/contacts';

class ContactsRouter implements AppRouter {
  path = '/contacts';
  router = Router();

  private controller = new ContactsController();

  constructor() {
    this.initializeMiddleware();
    this.initializeRoutes();
  }

  private initializeMiddleware() {}

  private initializeRoutes() {
    this.router.post('/', this.controller.createVCard);
    this.router.get('/:id', this.controller.findVCard);
  }
}

export default ContactsRouter;
