import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CustomersService } from '../customers/customers.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private customers: CustomersService, private jwt: JwtService) {}

  async login(email: string) {
    const cust = await this.customers.findByEmail(email);
    if (!cust) throw new UnauthorizedException('Invalid credentials');
    const payload = { sub: cust._id.toString(), email: cust.email, name: cust.nome };
    return { access_token: this.jwt.sign(payload) };
  }
}
