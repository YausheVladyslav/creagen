import BaseController from './BaseController.js';

export default class UserAPIController extends BaseController {
    _LOGIN_URL = '/auth/login';

    constructor(request) {
        super(request);
    }

    async login(email, password) {
        return await this.request.post(this._LOGIN_URL, { data: { email, password } });
    }

}