import db from '../../../config/database';
import { IQuery } from '../base/interfaces';
import { IForum } from './interface';

class ForumModel {
    async create(forum: IForum) {
        const query: IQuery = {
            name: 'create_forum',
            text: `INSERT INTO forum (author, slug, title) VALUES ($1, $2, $3)`,
            values: [forum.user, forum.slug, forum.title]
        };

        return db.sendQuery(query);
    }

    async getOne(slug: string, full: boolean = true) {
        const query: IQuery = {
            name: `get_one_forum_${full ? '1': '2'}`,
            text: `SELECT ${full ? 'posts, slug, threads, title, author as user': 'slug'} FROM forum 
                   WHERE slug = $1`,
            values: [slug]
        };
        return db.sendQuery(query);
    }
}

export default new ForumModel();
