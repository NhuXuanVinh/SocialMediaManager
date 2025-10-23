import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) {}

  async register(email: string, username: string, password: string): Promise<void> {
    const existingUsername = await this.userRepo.findOne({ where: { username } });
    if (existingUsername) {
      throw new Error('User already exists');
    }
    const existingEmail = await this.userRepo.findOne({ where: { email } });
    if (existingEmail) {
      throw new Error('Email already used');
    }
    const user = this.userRepo.create({ email, username, password });
    await this.userRepo.save(user);
  }

  async login(username: string, password: string): Promise<{ token: string }> {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user) {
      throw new Error('User does not exist');
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      throw new Error('Wrong password');
    }
    const payload = { userId: user.id, username: user.username };
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '5h' });
    return { token };
  }
}
