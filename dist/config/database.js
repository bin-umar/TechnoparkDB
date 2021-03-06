"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
class Database {
    constructor() {
        this.pool = new pg_1.Pool({
            host: 'localhost',
            port: 5432,
            database: 'postgres',
            user: 'jahongir',
            password: 'Password1234',
            max: 20
        });
    }
    sendQuery(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = {};
            const client = yield this.pool.connect();
            try {
                response.data = yield client.query(query);
            }
            catch (e) {
                // console.error(`Database error: ${query.text}`);
                // console.error(`Values: (${query.values})`);
                // console.error(`Error: ${e.message}`);
                response.isError = true;
                response.code = e.code;
                response.message = e.message;
            }
            finally {
                client.release();
            }
            return response;
        });
    }
}
exports.default = new Database();
