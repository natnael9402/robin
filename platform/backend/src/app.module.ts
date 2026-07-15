import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './config/app-config.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TransactionsModule } from './transactions/transactions.module';
import { StatsModule } from './stats/stats.module';
import { ArbitrageModule } from './arbitrage/arbitrage.module';
import { MarketModule } from './market/market.module';
import { MiningModule } from './mining/mining.module';
import { LoansModule } from './loans/loans.module';
import { AssetsModule } from './assets/assets.module';
import { VerificationModule } from './verification/verification.module';
import { ChatModule } from './chat/chat.module';
import { TradesModule } from './trades/trades.module';
import { DepositsModule } from './deposits/deposits.module';
import { WithdrawalsModule } from './withdrawals/withdrawals.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SupportModule } from './support/support.module';
import { User } from './users/user.entity';
import { Profile } from './users/profile.entity';
import { Transaction } from './transactions/transaction.entity';
import { ArbitrageHosting } from './arbitrage/arbitrage-hosting.entity';
import { ArbitrageProduct } from './arbitrage/arbitrage-product.entity';
import { MiningPlan } from './mining/mining-plan.entity';
import { UserMining } from './mining/user-mining.entity';
import { Loan } from './loans/loan.entity';
import { LoanRepayment } from './loans/loan-repayment.entity';
import { UserAsset } from './assets/user-asset.entity';
import { UserVerification } from './verification/user-verification.entity';
import { ChatMessage } from './chat/chat.entity';
import { Trade } from './trades/trade.entity';
import { TradeContract } from './trades/trade-contract.entity';
import { TradeOption } from './trades/trade-option.entity';
import { TradeSpot } from './trades/trade-spot.entity';
import { CryptoAddress } from './deposits/crypto-address.entity';
import { Deposit } from './deposits/deposit.entity';
import { Withdrawal } from './withdrawals/withdrawal.entity';
import { Notification } from './notifications/notification.entity';
import { SupportTicket } from './support/support-ticket.entity';
import { SupportTicketMessage } from './support/support-ticket-message.entity';
import { PersonalAccessToken } from './auth/personal-access-token.entity';
import { PasswordResetToken } from './auth/password-reset-token.entity';
import { Session } from './auth/session.entity';
import { ProvidersModule } from './shared/providers/providers.module';
import { RequestContextMiddleware } from './shared/middleware/request-context.middleware';

const ENTITIES = [
  User,
  Profile,
  Transaction,
  ArbitrageHosting,
  ArbitrageProduct,
  MiningPlan,
  UserMining,
  Loan,
  LoanRepayment,
  UserAsset,
  UserVerification,
  ChatMessage,
  Trade,
  TradeContract,
  TradeOption,
  TradeSpot,
  CryptoAddress,
  Deposit,
  Withdrawal,
  Notification,
  SupportTicket,
  SupportTicketMessage,
  PersonalAccessToken,
  PasswordResetToken,
  Session,
];

@Module({
  imports: [
    AppConfigModule,
    ScheduleModule.forRoot(),
    ProvidersModule,
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const redisUrl = config.get<string>('app.redis.url');
        if (redisUrl) {
          return {
            store: await redisStore({ url: redisUrl }),
            ttl: config.get<number>('app.cache.ttl') ?? 60_000,
          };
        }
        // fallback to in-memory when Redis not configured
        return { ttl: config.get<number>('app.cache.ttl') ?? 60_000 };
      },
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'postgres',
        database: 'basetrade',
        entities: ENTITIES,
        synchronize: true,
        ssl: false,
      }),
    }),
    AuthModule,
    UsersModule,
    TransactionsModule,
    StatsModule,
    ArbitrageModule,
    MarketModule,
    MiningModule,
    LoansModule,
    AssetsModule,
    VerificationModule,
    ChatModule,
    TradesModule,
    DepositsModule,
    WithdrawalsModule,
    NotificationsModule,
    SupportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}