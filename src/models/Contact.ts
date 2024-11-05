import { Pool } from "pg";

type TContact = {
  name: string;
  surname: string;
  post: string;
}

export class Contact {
  static pool: Pool
  constructor() {}

  /**
   * Метод возвращает все контакты
   */
  async findAll(): Promise<Contact[]> {
    const res = await Contact.pool.query(`
      SELECT contacts.*, 
        count(CASE WHEN contacts.cid = calls.src THEN 1 END) AS outgoing_calls_count, 
        count(CASE WHEN contacts.cid = calls.trg THEN 1 END) AS incoming_calls_count 
      FROM contacts 
      LEFT JOIN calls ON contacts.cid = calls.src OR contacts.cid = calls.trg 
      GROUP BY cid 
      ORDER BY cid;`);
    return res.rows;
  }

  /**
   * Метод возвращает один контакт с его звонками
   */
  async findOne(id: number): Promise<Contact[]> {
    const res = await Contact.pool.query(`
      SELECT contacts.*, (
        SELECT json_agg(json_build_object(
          'type', CASE WHEN calls.src = contacts.cid THEN 'outgoing' ELSE 'incoming' END, 
          'status', status, 
          'duration', duration, 
          'partyName', CASE WHEN calls.src = contacts.cid THEN (SELECT c.name || ' ' || c.surname FROM contacts c WHERE calls.trg = c.cid) ELSE (SELECT c.name || ' ' || c.surname FROM contacts c WHERE calls.src = c.cid) END))
        FROM calls
        WHERE contacts.cid = calls.src OR contacts.cid = calls.trg
      ) AS calls
      FROM contacts
      WHERE contacts.cid = ${id};`);
    return res.rows[0];
  }

  /**
   * Метод создает контакт и возвращает его
   */
  async create(data: TContact): Promise<TContact & { cid: string }> {
    const res = await Contact.pool.query(`
      INSERT INTO contacts (name, surname, post)
      VALUES
      ('${data.name}', '${data.surname}', '${data.post}') RETURNING *;`);
    return res.rows[0];
  }

  /**
   * Метод обновляет контакт и возвращает его
   */
  async update(data: TContact & { id: number }): Promise<TContact & { cid: number }> {
    const setClauses: string[] = [];
    const values: (number | string)[] = [];
    Object.keys(data).forEach((key, index) => {
      if (key === 'id') return;
      setClauses.push(`${key} = $${index + 1}`);
      values.push(data[key as keyof TContact]);
    });
    const setString = setClauses.join(', ');

    const res = await Contact.pool.query(`
      UPDATE contacts
      SET ${setString}
      WHERE contacts.cid = ${data.id} RETURNING *;`, values);
    return res.rows[0];
  }
}