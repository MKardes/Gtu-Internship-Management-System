"use strict";
/**
 *
 * // src/services/userService.ts
import { getRepository } from 'typeorm';
import { User } from '../entities/User';

export const getAllUsers = async () => {
  const userRepository = getRepository(User);
  return await userRepository.find();
};

export const createUser = async (userData: any) => {
  const userRepository = getRepository(User);
  const newUser = userRepository.create(userData);
  return await userRepository.save(newUser);
};

 */ 
//# sourceMappingURL=blabla.service.js.map