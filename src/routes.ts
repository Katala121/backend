import Router from 'koa-router'
import { requestLogger } from './middlewares/requestLogger'
import { responseBuilder } from './middlewares/responseBuilder'
import { ContactController } from './controllers/ContactController';

const apiRouter = new Router({ prefix: '/api' })

apiRouter.use(responseBuilder)
apiRouter.use(requestLogger)

/**
 * GET /api/contacts - получение списка контактов
 * GET /api/contacts/1 - получение определенного контакта по его идентификатору
 * POST /api/contacts - создание нового контакта (name, surname, post)
 * PUT /api/contacts/:cid - редактирование существующего контакта
 */

const contactController = new ContactController();

apiRouter.get('/contacts', (ctx) => contactController.getContactList(ctx));
apiRouter.get('/contacts/:id', (ctx) => contactController.getContact(ctx));
apiRouter.post('/contacts', (ctx) => contactController.createContact(ctx));
apiRouter.put('/contacts/:id', (ctx) => contactController.updateContact(ctx));

export default [apiRouter]