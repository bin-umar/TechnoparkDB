import e from 'express';
import { DBConflictCode } from '../../utils/constants';
import { IError, IReturn, IReturnQuery } from '../base/interfaces';
import { IGetForumData } from '../forum/interface';
import { IUser } from './interface';
import userModel from './model';

class UserController {
    create = async (req: e.Request, res: e.Response) => {
        const r = this.getNickname(req);
        if (r.error) {
            res.status(400).json(<IError>{ message: 'Nickname is not given' });
            return;
        }

        const profile = req.body;
        const user: IUser = {
            about: profile.about,
            email: profile.email,
            nickname: r.data,
            fullName: profile.fullname
        };

        const rq: IReturnQuery = await userModel.create(user);

        if (rq.isError) {
            if (+rq.code === DBConflictCode) {
                const confRes: IReturnQuery = await userModel.getConflicted(user);
                if (confRes.isError) {
                    res.status(400).json(<IError>{ message: confRes.message });
                    return;
                }

                res.status(409).json(confRes.data.rows);
                return;
            }
            res.status(400).json(<IError>{ message: rq.message });
            return;
        }

        res.status(201).json(user);
    };

    getProfile = async (req: e.Request, res: e.Response) => {
        const r = this.getNickname(req);
        if (r.error) {
            res.status(400).json({ message: 'Nickname is not given' });
            return;
        }

        const rq: IReturnQuery = await userModel.getOne(r.data);
        if (rq.isError) {
            res.status(400).json(<IError>{ message: rq.message});
            return;
        }

        if (rq.data.rows.length === 0) {
            res.status(404).json(<IError>{ message: 'User not found'});
            return;
        }

        res.json(rq.data.rows[0]);
    };

    updateProfile = async (req: e.Request, res: e.Response) => {
        const r = this.getNickname(req);
        if (r.error) {
            res.status(400).json(<IError>{ message: 'Nickname is not given' });
            return;
        }

        const profile = req.body;
        const user: IUser = {
            about: profile.about,
            email: profile.email,
            nickname: r.data,
            fullName: profile.fullname
        };

        const rq: IReturnQuery = await userModel.update(user);
        if (rq.isError) {
            if (+rq.code === DBConflictCode) {
                const confRes: IReturnQuery = await userModel.getConflicted(user);
                if (confRes.isError) {
                    res.status(400).json(<IError>{ message: confRes.message });
                    return;
                }

                res.status(409).json(confRes.data.rows);
                return;
            }
            res.status(400).json(<IError>{ message: rq.message });
            return;
        }

        res.status(200).json(user);
    };

    forumUsers = async (req: e.Request, res: e.Response, data: IGetForumData) => {
        const rq = await userModel.forumUsers(data);
        if (rq.isError) {
            res.status(400).json(<IError>{ message: rq.message });
            return;
        }

        res.status(200).json(rq.data.rows);
    };

    private getNickname(req: e.Request) {
        const nickname = req.params.nickname;
        const result = <IReturn<string>>{};

        if (nickname) {
            result.data = nickname;
        } else {
            result.error = true;
        }
        return result;
    }
}

export default new UserController();