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
const constants_1 = require("../../utils/constants");
const model_1 = __importDefault(require("./model"));
class UserController {
    constructor() {
        this.create = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const r = this.getNickname(req);
            if (r.error) {
                res.status(400).json({ message: 'Nickname is not given' });
                return;
            }
            const profile = req.body;
            const user = {
                about: profile.about,
                email: profile.email,
                nickname: r.data,
                fullName: profile.fullname
            };
            const rq = yield model_1.default.create(user);
            if (rq.isError) {
                if (+rq.code === constants_1.DBConflictCode) {
                    const confRes = yield model_1.default.getConflicted(user);
                    if (confRes.isError) {
                        res.status(400).json({ message: confRes.message });
                        return;
                    }
                    res.status(409).json(confRes.data.rows);
                    return;
                }
                res.status(400).json({ message: rq.message });
                return;
            }
            res.status(201).json(user);
        });
        this.getProfile = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const r = this.getNickname(req);
            if (r.error) {
                res.status(400).json({ message: 'Nickname is not given' });
                return;
            }
            const rq = yield model_1.default.getOne(r.data);
            if (rq.isError) {
                res.status(400).json({ message: rq.message });
                return;
            }
            if (rq.data.rows.length === 0) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            res.json(rq.data.rows[0]);
        });
        this.updateProfile = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const r = this.getNickname(req);
            if (r.error) {
                res.status(400).json({ message: 'Nickname is not given' });
                return;
            }
            const profile = req.body;
            const user = {
                about: profile.about,
                email: profile.email,
                nickname: r.data,
                fullName: profile.fullname
            };
            const rq = yield model_1.default.update(user);
            if (rq.isError) {
                if (+rq.code === constants_1.DBConflictCode) {
                    const confRes = yield model_1.default.getConflicted(user);
                    if (confRes.isError) {
                        res.status(400).json({ message: confRes.message });
                        return;
                    }
                    res.status(409).json(confRes.data.rows);
                    return;
                }
                res.status(400).json({ message: rq.message });
                return;
            }
            res.status(200).json(user);
        });
        this.forumUsers = (req, res, data) => __awaiter(this, void 0, void 0, function* () {
            const rq = yield model_1.default.forumUsers(data);
            if (rq.isError) {
                res.status(400).json({ message: rq.message });
                return;
            }
            res.status(200).json(rq.data.rows);
        });
    }
    getNickname(req) {
        const nickname = req.params.nickname;
        const result = {};
        if (nickname) {
            result.data = nickname;
        }
        else {
            result.error = true;
        }
        return result;
    }
}
exports.default = new UserController();