import { Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@ValidatorConstraint({ name: "TermValidator", async: false })
class TermValidator implements ValidatorConstraintInterface {
  validate(term: string, args: ValidationArguments): boolean {
    const termRegex = /^\d{4}-(\d{4})$/;
    if (!termRegex.test(term)) return false;
    
    const [start, end] = term.split("-").map(Number);
    return end === start + 1;
  }

  defaultMessage(args: ValidationArguments): string {
    return "Term must be in the format 'YYYY-YYYY' where the second year is one more than the first.";
  }
}

@Entity("term")
@Unique(['id', 'name'])
export class Term {

   @PrimaryGeneratedColumn()
   id: number;

   @Column({ nullable: false })
   @Validate(TermValidator) // validate format: 2023-2024
   name: string;

   @Column({ nullable: false })
   midterm_fall_begin: Date;

   @Column({ nullable: false })
   midterm_fall_end: Date;

   @Column({ nullable: false })
   midterm_break_begin: Date;

   @Column({ nullable: false })
   midterm_break_end: Date;

   @Column({ nullable: false })
   midterm_spring_begin: Date;

   @Column({ nullable: false })
   midterm_spring_end: Date;

   @Column({ nullable: false })
   summer_begin: Date;

   @Column({ nullable: false })
   summer_end: Date;
}