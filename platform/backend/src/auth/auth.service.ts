import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<Omit<import('../users/user.entity').User, 'password'> | null> {
    const user = await this.users.findOne(email);
    if (!user) return null;
    const match = await bcrypt.compare(pass, user.password);
    if (!match) return null;
    const { password, ...result } = user;
    return result as Omit<typeof user, 'password'>;
  }

  async login(user: { email: string; id: number; isAdmin: boolean }) {
    const payload = { email: user.email, sub: user.id, isAdmin: user.isAdmin };
    return {
      access_token: this.jwt.sign(payload, {
        secret: this.config.get<string>('app.jwt.secret'),
        expiresIn: (this.config.get<string>('app.jwt.expiresIn') ?? '7d') as `${number}${'s' | 'm' | 'h' | 'd'}`,
      }),
    };
  }

  async signup(data: { email: string; password: string; withdrawPassword?: string; name?: string }) {
    const hashedPassword = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
    return this.users.create({
      email: data.email,
      name: data.name,
      password: hashedPassword,
      withdrawPassword: data.withdrawPassword ?? undefined,
    });
  }

  async changePassword(userId: number, oldPass: string, newPass: string) {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const valid = await bcrypt.compare(oldPass, user.password);
    if (!valid) throw new UnauthorizedException('Invalid current password');

    const hashed = await bcrypt.hash(newPass, BCRYPT_ROUNDS);
    await this.users.update(userId, { password: hashed });
  }
}
