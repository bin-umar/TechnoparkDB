import db from '../../../config/database';
import {IThreadData} from '../thread/interface';
import { IPost, IPostFilter, IPostUpdate } from './interface';
import { IQuery } from '../base/interfaces';

class PostModel {
    async insertSeveral(posts: IPost[], data: IThreadData) {
        let values = []
        for (let i=0; i < posts.length; i++) {
            const p = posts[i];
            values.push(`('${data.forum}', 
                        '${p.author}', 
                        ${data.threadId},
                        ${
                            p.parent === undefined ?  `NULL, '{}'`:
                                `${p.parent}, (SELECT path FROM post WHERE pid = ${p.parent}) || ${p.parent}`
                        },
                        '${p.message}'
                    )`);
        }

        const query: IQuery = {
            name: '',
            text: `
                INSERT INTO 
                    post(forum, author, thread, parent_id, path, message)
                VALUES ${values.join(',')}
                RETURNING 
                    pid as id,
                    created
            `,
            values: []
        };

        return db.sendQuery(query);
    }

    async getThreadPosts(filter: IPostFilter) {
        let sinceExpr = '';
        const compSym = filter.desc ? '<': '>';
        const desc = filter.desc ? 'DESC' : 'ASC';

        if (filter.since) {
            switch (filter.sort) {
                case 'tree': {
                    sinceExpr = `
                        AND path ${compSym} (
                            SELECT path FROM post
                            WHERE pid = ${filter.since}
                        )
                    `;
                } break;
                case 'parent_tree': {
                    sinceExpr = `
                        AND path ${compSym} (
                            SELECT path ${filter.desc ?'[1:1]': ''}  FROM post
                            WHERE pid = ${filter.since}
                        )
                    `;
                } break;
                default: {
                    sinceExpr = `AND pid ${compSym} '${filter.since}'`;
                }
            }
        }

        const limit = `LIMIT $2`;
        const where = `WHERE thread = $1`;
        let select = `
                SELECT 
                    author,
                    created,  
                    forum,
                    pid as id,  
                    is_edited as "isEdited", 
                    message, 
                    COALESCE(parent_id, 0) as parent,
                    thread
                FROM post 
            `;

        switch (filter.sort) {
            case 'tree': {
                select += `
                    ${where}
                    ${sinceExpr}   
                    ORDER BY path ${desc}
                    ${limit}
                `;
            } break;
            case 'parent_tree': {
                select =  `
                    WITH parents AS (
                        SELECT pid as id FROM post 
                        ${where}
                        AND parent_id IS NULL
                        ${sinceExpr}
                        ORDER BY id ${desc}
                        ${limit}
                    )
                ` + select + `
                    WHERE root IN (SELECT id FROM parents)
                    ORDER BY root ${desc}, path
                `;
            } break;
            default: {
                select += `
                    ${where}
                    ${sinceExpr}   
                    ORDER BY created ${desc}, pid ${desc} 
                    ${limit}
                `;
            }
        }

        const query: IQuery = {
            name: '',
            text: select,
            values: [filter.threadId, filter.limit]
        };

        return db.sendQuery(query);
    }

    async update(post: IPostUpdate) {
        const query: IQuery = {
            name: 'update_post',
            text: `
                    SELECT author, created, forum, id, is_edited as "isEdited", message, parent, thread
                    FROM update_post($1, $2)
                  `,
            values: [post.message, post.id]
        };
        return db.sendQuery(query);
    }

    async fullData(id: number) {
        const query: IQuery = {
            name: 'get_post_full',
            text: `SELECT get_post_full($1) as post`,
            values: [id]
        };
        return db.sendQuery(query);
    }
}

export default new PostModel();
