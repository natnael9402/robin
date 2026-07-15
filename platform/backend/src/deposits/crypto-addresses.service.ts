import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CryptoAddress } from './crypto-address.entity';

@Injectable()
export class CryptoAddressesService {
  constructor(@InjectRepository(CryptoAddress) private readonly repo: Repository<CryptoAddress>) {}

  async findAll() {
    return this.repo.find({ where: { isActive: true }, order: { currency: 'ASC', network: 'ASC' } });
  }

  async findByCurrencyAndNetwork(currency: string, network: string) {
    return this.repo.findOne({ where: { currency, network, isActive: true } });
  }

  async create(data: Partial<CryptoAddress>) {
    const address = this.repo.create(data);
    return this.repo.save(address);
  }

  async update(id: number, data: Partial<CryptoAddress>) {
    await this.repo.update(id, data);
    return this.repo.findOne({ where: { id } });
  }
}