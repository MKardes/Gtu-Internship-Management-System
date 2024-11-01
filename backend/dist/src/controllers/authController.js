"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = require("../entities/User");
const data_source_1 = require("./data-source"); // TypeORM veri kaynağını içeren dosyanız
const ACCESS_TOKEN_SECRET = 'your_access_token_secret';
const REFRESH_TOKEN_SECRET = 'your_refresh_token_secret';
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        // Kullanıcıyı veritabanından bulma
        const user = yield data_source_1.AppDataSource.getRepository(User_1.User).findOneBy({ username });
        if (!user) {
            return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
        }
        // Şifre doğrulama
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
        }
        // Access ve Refresh Token oluşturma
        const accessToken = jsonwebtoken_1.default.sign({ username: user.username, role: user.role }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign({ username: user.username, role: user.role }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
        res.json({ accessToken, refreshToken });
    }
    catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error });
    }
});
exports.loginUser = loginUser;
//# sourceMappingURL=authController.js.map