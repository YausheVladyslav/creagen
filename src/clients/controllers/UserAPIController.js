import BaseController from './BaseController.js';

export default class UserAPIController extends BaseController {
    _LOGIN_URL = '/auth/login';
    _LOGOUT_URL = '/auth/logout';

    constructor(request) {
        super(request);
    }

    async login(email, password) {
        return await this.request.post(this._LOGIN_URL, { data: { email, password } });
    }

    async logout(token) {
        return await this.request.delete(this._LOGOUT_URL, { headers: { Authorization: `Bearer ${token}` } });
    }

}