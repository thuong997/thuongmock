import Api from './Api';

const login = (username, password) => {
    const parameters = {
        username: username,
        password: password
    }
    return Api.get(`/login`, { params: parameters })
}

const api = { login };
export default api;