import UserAPIController from "./controllers/UserAPIController";

export default class ApiClient {
    constructor(request) {
        this.request = request;
        this.userAPIController = new UserAPIController(request);
    }
}