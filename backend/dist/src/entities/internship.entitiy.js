"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Internship = void 0;
const typeorm_1 = require("typeorm");
const student_entitiy_1 = require("./student.entitiy");
const company_entitiy_1 = require("./company.entitiy");
const mentor_entitiy_1 = require("./mentor.entitiy");
const file_entitiy_1 = require("./file.entitiy");
let Internship = class Internship {
};
exports.Internship = Internship;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Internship.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Internship.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => company_entitiy_1.Company),
    (0, typeorm_1.JoinColumn)({ name: "company_id" }),
    __metadata("design:type", company_entitiy_1.Company)
], Internship.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => mentor_entitiy_1.Mentor),
    (0, typeorm_1.JoinColumn)({ name: "mentor_id" }),
    __metadata("design:type", mentor_entitiy_1.Mentor)
], Internship.prototype, "mentor", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => file_entitiy_1.File),
    (0, typeorm_1.JoinColumn)({ name: "file_id" }),
    __metadata("design:type", file_entitiy_1.File)
], Internship.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => student_entitiy_1.Student, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: "student_id" }),
    __metadata("design:type", student_entitiy_1.Student)
], Internship.prototype, "student", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Internship.prototype, "begin_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Internship.prototype, "end_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Date)
], Internship.prototype, "created_at", void 0);
exports.Internship = Internship = __decorate([
    (0, typeorm_1.Entity)("internship"),
    (0, typeorm_1.Unique)(['id'])
], Internship);
//# sourceMappingURL=internship.entitiy.js.map