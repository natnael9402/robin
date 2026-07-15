import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class DepositDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  network: string;
}

export class WithdrawDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  network: string;

  @IsString()
  walletAddress: string;

  @IsOptional()
  @IsString()
  withdrawPassword?: string;
}
