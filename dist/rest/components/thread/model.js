"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../../../config/database"));
class ThreadModel {
    create(thread) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                name: 'create_forum',
                text: `INSERT INTO thread 
                        ("ForumID", "AuthorID", created, message, slug, title) 
                   VALUES ($1, $2, $3, $4, $5, $6) RETURNING "TID"`,
                values: [thread.forum, thread.author, thread.created, thread.message, thread.slug, thread.title]
            };
            return database_1.default.sendQuery(query);
        });
    }
    update(thread) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    read(thread) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    forumThreads(thread) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                name: '',
                text: `SELECT
                    "TID" as id, 
                    u.nickname as author, 
                    created, 
                    f.slug as forum,
                    message,
                    t.slug,
                    t.title,
                    votes
                   FROM thread t
                   INNER JOIN forum f ON f."FID" = "ForumID" AND f.slug = $1  
                   INNER JOIN users u ON u."UID" = "AuthorID"
                   WHERE  created > $2 
                   ORDER BY created
                   ${thread.desc ? 'DESC' : 'ASC'}
                   LIMIT $3`,
                values: [thread.slug, thread.since, thread.limit]
            };
            return database_1.default.sendQuery(query);
        });
    }
    getOne(slug, full = true) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                name: 'get_one_thread',
                text: `SELECT ${full ?
                    `"TID" as id, 
                    u.nickname as author, 
                    created, 
                    f.slug as forum,
                    message,
                    t.slug,
                    t.title,
                    votes FROM thread t 
                    INNER JOIN users u ON u."UID" = t."AuthorID"
                    INNER JOIN forum f ON f."FID" = t."ForumID"` :
                    `t."FID" FROM thread t`} WHERE t.slug = $1`,
                values: [slug]
            };
            return database_1.default.sendQuery(query);
        });
    }
}
exports.default = new ThreadModel();