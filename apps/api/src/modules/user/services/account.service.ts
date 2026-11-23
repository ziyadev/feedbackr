import { Injectable } from '@nestjs/common';
import { AccountEntity } from '../entities/account.entity';
import { AccountBuilder } from '../builders/account.builder';
import { CreateAccountDto } from '../dto/create-account.dto';
import { AccountRepository } from '@/modules/database/repositories/account.repository';

@Injectable()
export class AccountService {
  constructor(private readonly accountRepository: AccountRepository) {}

  async create(accountDto: CreateAccountDto): Promise<AccountEntity> {
    const account = new AccountBuilder()
      .setUser(accountDto.userId)
      .setProvider(accountDto.provider, accountDto.providerAccountId)
      .build();
    return await this.accountRepository.create({
      data: account,
    });
  }

  async findByPrviderId({
    provider,
    providerAccountId,
  }: {
    provider: string;
    providerAccountId: string;
  }): Promise<AccountEntity> {
    return await this.accountRepository.findUnique({
      where: {
        provider_providerAccountId: { provider, providerAccountId },
      },
    });
  }
}
