import { IsInt, IsNumber, IsString, Min } from 'class-validator';

export class StartTradeDto {
  @IsString()
  asset: string;

  @IsNumber()
  @Min(10)
  amount: number;

  @IsInt()
  duration: number;
}

export class TransferDto {
  @IsNumber()
  @Min(0.01)
  amount: number;
}
