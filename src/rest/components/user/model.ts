import db from '../../../config/database';
import { IQuery } from '../base/interfaces';
import { IGetForumData } from '../forum/interface';
import { IUser }  from './interface';

class UserModel {
    async create(user: IUser) {
        const query: IQuery = {
            name: 'create_user',
            text: 'INSERT INTO "user"(about, email, fullname, nickname) VALUES ($1, $2, $3, $4)',
            values: Object.values(user)
        };

        return db.sendQuery(query);
    }

    async update(user: IUser) {
        const query: IQuery = {
            name: 'update_user',
            text: `
                UPDATE "user" SET 
                    about= COALESCE($1, about), 
                    email= COALESCE($2, email), 
                    fullname= COALESCE($3, fullname) 
                WHERE nickname = $4 
                RETURNING *  
            `,
            values: Object.values(user)
        };

        return db.sendQuery(query);
    }

    async forumUsers(data: IGetForumData) {
        let sinceExpr = '';
        if (data.since) {
            sinceExpr = `AND nickname ${data.desc ? '<': '>'} '${data.since}' COLLATE "C"`;
        }

        const query: IQuery = {
            name: '',
            text: `
                SELECT  about, email, fullname, nickname
                FROM "user" u, forum 
                WHERE forum.slug = $1
                ${sinceExpr}
                AND (
                    u."UID" in (
                        SELECT "AuthorID" FROM post WHERE "ForumID" = forum."FID"
                    )
                    OR
                    u."UID" in (
                        SELECT "AuthorID" FROM thread WHERE "ForumID" = forum."FID"
                    )
                )
                ORDER BY nickname COLLATE "C" ${data.desc ? 'DESC' : 'ASC'}
                ${data.limit ? `LIMIT ${data.limit}`: ''}
            `,
            values: [data.slug]
        };
        return db.sendQuery(query);
    }

    async getOne(nickname: string, full: boolean = true) {
        const query: IQuery = {
            name: `get_one_user_${full ? '1': '2'}`,
            text: `SELECT ${full ? 'about, email, fullname, nickname': '"UID", nickname'} 
                    FROM "user" WHERE nickname = $1`,
            values: [nickname]
        };
        return db.sendQuery(query);
    }

    async getConflicted(data: IUser) {
        const query: IQuery = {
            name: 'get_conflicted_user',
            text: 'SELECT about, email, fullname, nickname FROM "user" WHERE nickname = $1 OR email = $2',
            values: [data.nickname, data.email]
        };
        return db.sendQuery(query);
    }
}

export default new UserModel();

