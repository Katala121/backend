import { Context } from 'koa';
import { Contact } from '../models/Contact';

export class ContactController {
    constructor() {
        this.contactService = new Contact()
    }
    private contactService: Contact;

    /**
     * Получение списка контактов с количеством вызовов
     */
    async getContactList(ctx: Context) {
        ctx.body = await this.contactService.findAll();
    }

    /**
     * Получение определенного контакта со списком всех его вызовов
     */
    async getContact(ctx: Context) {
        ctx.body = await this.contactService.findOne(ctx.params.id);
    }

    /**
     * Создание нового контакта
      */
    async createContact(ctx: Context) {
        const body = ctx.request.body;
        ctx.body = await this.contactService.create(body);
    }

    /**
     *  Редактирование отдельного контакта
     */
    async updateContact(ctx: Context) {
        const body = {...ctx.request.body, id: ctx.params.id};
        ctx.body = await this.contactService.update(body);
    }
}