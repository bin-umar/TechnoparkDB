"use strict";
let __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../utils/constants");
const model_1 = __importDefault(require("./model"));
const model_2 = __importDefault(require("../user/model"));
const controller_1 = __importDefault(require("../user/controller"));
const controller_2 = __importDefault(require("../thread/controller"));
class ForumController {
    constructor() {
        this.create = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const nickname = req.body.user;
            const user = yield model_2.default.getOne(nickname, false);
            if (user.isError) {
                res.status(400).json({ message: user.message });
                return;
            }
            if (!user.data.rowCount) {
                res.status(404).json({ message: `User ${nickname} not found` });
                return;
            }
            const userId = user.data.rows[0]['UID'];
            const forum = {
                slug: req.body.slug,
                title: req.body.title,
                user: userId,
                posts: 0,
                threads: 0
            };
            const rq = yield model_1.default.create(forum);
            if (rq.isError) {
                if (+rq.code === constants_1.DBConflictCode) {
                    const confRes = yield model_1.default.getOne(forum.slug);
                    if (confRes.isError) {
                        res.status(400).json({ message: confRes.message });
                        return;
                    }
                    res.status(409).json(confRes.data.rows[0]);
                    return;
                }
                res.status(400).json({ message: rq.message });
                return;
            }
            res.status(201).json(forum);
        });
        this.details = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const r = this.getSlug(req);
            if (r.error) {
                res.status(400).json({ message: 'Slug is not given' });
                return;
            }
            const rq = yield model_1.default.getOne(r.data);
            if (rq.isError) {
                res.status(400).json({ message: rq.message });
                return;
            }
            if (!rq.data.rowCount) {
                res.status(404).json({ message: `Forum by slug ${r.data} not found` });
                return;
            }
            res.json(rq.data.rows[0]);
        });
        this.threads = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const r = this.getSlug(req);
            if (r.error) {
                res.status(400).json({ message: 'Slug is not given' });
                return;
            }
            const forum = yield model_1.default.getOne(r.data, false);
            if (forum.isError) {
                res.status(400).json({ message: forum.message });
                return;
            }
            if (!forum.data.rowCount) {
                res.status(404).json({ message: `Forum by ${r.data} not found` });
                return;
            }
            const data = {
                slug: r.data,
                limit: req.query.limit,
                since: req.query.since,
                desc: JSON.parse(req.query.desc)
            };
            const obj = req.baseUrl.split('/')[3];
            if (obj === 'threads') {
                yield controller_2.default.forumThreads(req, res, data);
            }
            else {
                yield controller_1.default.forumUsers(req, res, data);
            }
        });
    }
    getSlug(req) {
        const slug = req.params.slug;
        const result = {};
        if (slug) {
            result.data = slug;
        }
        else {
            result.error = true;
        }
        return result;
    }
}
exports.default = new ForumController();