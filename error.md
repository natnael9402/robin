wPS C:\Users\natna\OneDrive\Desktop\robin\platform\backend> npm run build

> backend@0.0.1 build
> nest build

src/activity/activity.entity.ts:1:85 - error TS2307: Cannot find module 'typeorm' or its corresponding type declarations.

1 import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
                                                                                      ~~~~~~~~~
src/app.controller.ts:1:33 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Controller, Get } from '@nestjs/common';
                                  ~~~~~~~~~~~~~~~~
src/app.module.ts:1:56 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
                                                         ~~~~~~~~~~~~~~~~
src/app.module.ts:2:31 - error TS2307: Cannot find module '@nestjs/typeorm' or its corresponding type declarations.

2 import { TypeOrmModule } from '@nestjs/typeorm';
                                ~~~~~~~~~~~~~~~~~
src/app.module.ts:3:32 - error TS2307: Cannot find module '@nestjs/schedule' or its corresponding type declarations.

3 import { ScheduleModule } from '@nestjs/schedule';
                                 ~~~~~~~~~~~~~~~~~~
src/app.module.ts:4:29 - error TS2307: Cannot find module '@nestjs/cache-manager' or its corresponding type declarations.

4 import { CacheModule } from '@nestjs/cache-manager';
                              ~~~~~~~~~~~~~~~~~~~~~~~
src/app.module.ts:5:31 - error TS2307: Cannot find module '@nestjs/config' or its corresponding type declarations.

5 import { ConfigService } from '@nestjs/config';
                                ~~~~~~~~~~~~~~~~
src/app.service.ts:1:28 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Injectable } from '@nestjs/common';
                             ~~~~~~~~~~~~~~~~
src/arbitrage/arbitrage-hosting.entity.ts:1:85 - error TS2307: Cannot find module 'typeorm' or its corresponding type declarations.

1 import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
                                                                                      ~~~~~~~~~
src/arbitrage/arbitrage.controller.ts:1:79 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Controller, Get, Post, Body, UseGuards, Request, Patch, Param } from '@nestjs/common';
                                                                                ~~~~~~~~~~~~~~~~
src/arbitrage/arbitrage.module.ts:1:24 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Module } from '@nestjs/common';
                         ~~~~~~~~~~~~~~~~
src/arbitrage/arbitrage.module.ts:2:31 - error TS2307: Cannot find module '@nestjs/typeorm' or its corresponding type declarations.

2 import { TypeOrmModule } from '@nestjs/typeorm';
                                ~~~~~~~~~~~~~~~~~
src/arbitrage/arbitrage.service.ts:1:68 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';   
                                                                     ~~~~~~~~~~~~~~~~    
src/arbitrage/arbitrage.service.ts:2:34 - error TS2307: Cannot find module '@nestjs/typeorm' or its corresponding type declarations.

2 import { InjectRepository } from '@nestjs/typeorm';
                                   ~~~~~~~~~~~~~~~~~
src/arbitrage/arbitrage.service.ts:3:28 - error TS2307: Cannot find module 'typeorm' or its corresponding type declarations.

3 import { Repository } from 'typeorm';
                             ~~~~~~~~~
src/assets/assets.controller.ts:1:65 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';      
                                                                  ~~~~~~~~~~~~~~~~       
src/assets/assets.module.ts:1:24 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Module } from '@nestjs/common';
                         ~~~~~~~~~~~~~~~~
src/assets/assets.module.ts:4:31 - error TS2307: Cannot find module '@nestjs/typeorm' or its corresponding type declarations.

4 import { TypeOrmModule } from '@nestjs/typeorm';
                                ~~~~~~~~~~~~~~~~~
src/assets/assets.service.ts:1:49 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Injectable, BadRequestException } from '@nestjs/common';
                                                  ~~~~~~~~~~~~~~~~
src/assets/assets.service.ts:2:34 - error TS2307: Cannot find module '@nestjs/typeorm' or its corresponding type declarations.

2 import { InjectRepository } from '@nestjs/typeorm';
                                   ~~~~~~~~~~~~~~~~~
src/assets/assets.service.ts:3:28 - error TS2307: Cannot find module 'typeorm' or its corresponding type declarations.

3 import { Repository } from 'typeorm';
                             ~~~~~~~~~
src/assets/user-asset.entity.ts:1:67 - error TS2307: Cannot find module 'typeorm' or its corresponding type declarations.

1 import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
                                                                    ~~~~~~~~~
src/auth/auth.controller.ts:1:70 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Controller, Post, UseGuards, Request, Body, Get, Res } from '@nestjs/common'; 
                                                                       ~~~~~~~~~~~~~~~~  
src/auth/auth.controller.ts:5:26 - error TS2307: Cannot find module 'express' or its corresponding type declarations.

5 import { Response } from 'express';
                           ~~~~~~~~~
src/auth/auth.module.ts:1:24 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Module } from '@nestjs/common';
                         ~~~~~~~~~~~~~~~~
src/auth/auth.module.ts:2:31 - error TS2307: Cannot find module '@nestjs/config' or its corresponding type declarations.

2 import { ConfigService } from '@nestjs/config';
                                ~~~~~~~~~~~~~~~~
src/auth/auth.module.ts:3:27 - error TS2307: Cannot find module '@nestjs/jwt' or its corresponding type declarations.

3 import { JwtModule } from '@nestjs/jwt';
                            ~~~~~~~~~~~~~
src/auth/auth.module.ts:4:32 - error TS2307: Cannot find module '@nestjs/passport' or its corresponding type declarations.

4 import { PassportModule } from '@nestjs/passport';
                                 ~~~~~~~~~~~~~~~~~~
src/auth/auth.service.ts:1:51 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Injectable, UnauthorizedException } from '@nestjs/common';
                                                    ~~~~~~~~~~~~~~~~
src/auth/auth.service.ts:2:31 - error TS2307: Cannot find module '@nestjs/config' or its corresponding type declarations.

2 import { ConfigService } from '@nestjs/config';
                                ~~~~~~~~~~~~~~~~
src/auth/auth.service.ts:3:28 - error TS2307: Cannot find module '@nestjs/jwt' or its corresponding type declarations.

3 import { JwtService } from '@nestjs/jwt';
                             ~~~~~~~~~~~~~
src/auth/auth.service.ts:4:25 - error TS2307: Cannot find module 'bcrypt' or its corresponding type declarations.

4 import * as bcrypt from 'bcrypt';
                          ~~~~~~~~
src/auth/guards/admin.guard.ts:1:79 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
                                                                                ~~~~~~~~~~~~~~~~
src/auth/guards/jwt-auth.guard.ts:1:28 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Injectable } from '@nestjs/common';
                             ~~~~~~~~~~~~~~~~
src/auth/guards/jwt-auth.guard.ts:2:27 - error TS2307: Cannot find module '@nestjs/passport' or its corresponding type declarations.

2 import { AuthGuard } from '@nestjs/passport';
                            ~~~~~~~~~~~~~~~~~~
src/auth/guards/local-auth.guard.ts:1:28 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Injectable } from '@nestjs/common';
                             ~~~~~~~~~~~~~~~~
src/auth/guards/local-auth.guard.ts:2:27 - error TS2307: Cannot find module '@nestjs/passport' or its corresponding type declarations.

2 import { AuthGuard } from '@nestjs/passport';
                            ~~~~~~~~~~~~~~~~~~
src/auth/strategies/jwt.strategy.ts:1:38 - error TS2307: Cannot find module 'passport-jwt' or its corresponding type declarations.

1 import { ExtractJwt, Strategy } from 'passport-jwt';
                                       ~~~~~~~~~~~~~~
src/auth/strategies/jwt.strategy.ts:2:34 - error TS2307: Cannot find module '@nestjs/passport' or its corresponding type declarations.

2 import { PassportStrategy } from '@nestjs/passport';
                                   ~~~~~~~~~~~~~~~~~~
src/auth/strategies/jwt.strategy.ts:3:28 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

3 import { Injectable } from '@nestjs/common';
                             ~~~~~~~~~~~~~~~~
src/auth/strategies/jwt.strategy.ts:4:25 - error TS2307: Cannot find module 'express' or its corresponding type declarations.

4 import { Request } from 'express';
                          ~~~~~~~~~
src/auth/strategies/jwt.strategy.ts:20:20 - error TS2580: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.       

20       secretOrKey: process.env.JWT_SECRET || 'supersecretkey',
                      ~~~~~~~
src/auth/strategies/local.strategy.ts:1:26 - error TS2307: Cannot find module 'passport-local' or its corresponding type declarations.

1 import { Strategy } from 'passport-local';
                           ~~~~~~~~~~~~~~~~
src/auth/strategies/local.strategy.ts:2:34 - error TS2307: Cannot find module '@nestjs/passport' or its corresponding type declarations.

2 import { PassportStrategy } from '@nestjs/passport';
                                   ~~~~~~~~~~~~~~~~~~
src/auth/strategies/local.strategy.ts:3:51 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

3 import { Injectable, UnauthorizedException } from '@nestjs/common';
                                                    ~~~~~~~~~~~~~~~~
src/chat/chat.controller.ts:1:60 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
                                                             ~~~~~~~~~~~~~~~~
src/chat/chat.entity.ts:1:85 - error TS2307: Cannot find module 'typeorm' or its corresponding type declarations.

1 import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
                                                                                      ~~~~~~~~~
src/chat/chat.entity.ts:18:29 - error TS7006: Parameter 'user' implicitly has an 'any' type.

18     @ManyToOne(() => User, (user) => user.chatMessages)
                               ~~~~
src/chat/chat.gateway.ts:9:8 - error TS2307: Cannot find module '@nestjs/websockets' or its corresponding type declarations.

9 } from '@nestjs/websockets';
         ~~~~~~~~~~~~~~~~~~~~
src/chat/chat.gateway.ts:10:32 - error TS2307: Cannot find module 'socket.io' or its corresponding type declarations.

10 import { Server, Socket } from 'socket.io';
                                  ~~~~~~~~~~~
src/chat/chat.gateway.ts:12:28 - error TS2307: Cannot find module '@nestjs/jwt' or its corresponding type declarations.

12 import { JwtService } from '@nestjs/jwt';
                              ~~~~~~~~~~~~~
src/chat/chat.module.ts:1:24 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Module } from '@nestjs/common';
                         ~~~~~~~~~~~~~~~~
src/chat/chat.module.ts:2:31 - error TS2307: Cannot find module '@nestjs/typeorm' or its corresponding type declarations.

2 import { TypeOrmModule } from '@nestjs/typeorm';
                                ~~~~~~~~~~~~~~~~~
src/chat/chat.service.ts:1:28 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Injectable } from '@nestjs/common';
                             ~~~~~~~~~~~~~~~~
src/chat/chat.service.ts:2:34 - error TS2307: Cannot find module '@nestjs/typeorm' or its corresponding type declarations.

2 import { InjectRepository } from '@nestjs/typeorm';
                                   ~~~~~~~~~~~~~~~~~
src/chat/chat.service.ts:3:28 - error TS2307: Cannot find module 'typeorm' or its corresponding type declarations.

3 import { Repository } from 'typeorm';
                             ~~~~~~~~~
src/chat/chat.service.ts:54:33 - error TS7006: Parameter 'u' implicitly has an 'any' type.

54         const ids = userIds.map(u => u.userId);
                                   ~
src/config/app-config.module.ts:1:32 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Module, Global } from '@nestjs/common';
                                 ~~~~~~~~~~~~~~~~
src/config/app-config.module.ts:2:30 - error TS2307: Cannot find module '@nestjs/config' or its corresponding type declarations.

2 import { ConfigModule } from '@nestjs/config';
                               ~~~~~~~~~~~~~~~~
src/config/app.config.ts:1:28 - error TS2307: Cannot find module '@nestjs/config' or its corresponding type declarations.

1 import { registerAs } from '@nestjs/config';
                             ~~~~~~~~~~~~~~~~
src/config/app.config.ts:4:16 - error TS2580: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.

4   port: Number(process.env.PORT ?? 3000),
                 ~~~~~~~
src/config/app.config.ts:5:12 - error TS2580: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.

5   nodeEnv: process.env.NODE_ENV ?? 'development',
             ~~~~~~~
src/config/app.config.ts:7:13 - error TS2580: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.

7     secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
              ~~~~~~~
src/config/app.config.ts:8:16 - error TS2580: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.

8     expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
                 ~~~~~~~
src/config/app.config.ts:11:11 - error TS2580: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.

11     host: process.env.DB_HOST ?? 'localhost',
             ~~~~~~~
src/config/app.config.ts:12:18 - error TS2580: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.

12     port: Number(process.env.DB_PORT ?? 5432),
                    ~~~~~~~
src/config/app.config.ts:13:15 - error TS2580: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.

13     username: process.env.DB_USERNAME ?? 'postgres',
                 ~~~~~~~
src/config/app.config.ts:14:15 - error TS2580: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.

14     password: process.env.DB_PASSWORD ?? 'postgres',
                 ~~~~~~~
src/config/app.config.ts:15:15 - error TS2580: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.

15     database: process.env.DB_DATABASE ?? 'zent',
                 ~~~~~~~
src/config/app.config.ts:16:10 - error TS2580: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.

16     ssl: process.env.DB_SSL === 'true',
            ~~~~~~~
src/config/app.config.ts:19:17 - error TS2580: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.

19     ttl: Number(process.env.CACHE_TTL_SECONDS ?? 60),
                   ~~~~~~~
src/config/app.config.ts:22:23 - error TS2580: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.

22     timeoutMs: Number(process.env.EXTERNAL_API_TIMEOUT_MS ?? 10_000),
                         ~~~~~~~
src/config/app.config.ts:23:19 - error TS2580: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.

23     coingeckoUrl: process.env.COINGECKO_API_URL ?? 'https://api.coingecko.com/api/v3',
                     ~~~~~~~
src/loans/loan.entity.ts:1:85 - error TS2307: Cannot find module 'typeorm' or its corresponding type declarations.

1 import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
                                                                                      ~~~~~~~~~
src/loans/loans-admin.controller.ts:1:46 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Controller, Post, Param, Get } from '@nestjs/common';
                                               ~~~~~~~~~~~~~~~~
src/loans/loans.controller.ts:1:79 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
                                                                                ~~~~~~~~~~~~~~~~
src/loans/loans.module.ts:1:24 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Module } from '@nestjs/common';
                         ~~~~~~~~~~~~~~~~
src/loans/loans.module.ts:5:31 - error TS2307: Cannot find module '@nestjs/typeorm' or its corresponding type declarations.

5 import { TypeOrmModule } from '@nestjs/typeorm';
                                ~~~~~~~~~~~~~~~~~
src/loans/loans.service.ts:1:63 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';        
                                                                ~~~~~~~~~~~~~~~~
src/loans/loans.service.ts:2:34 - error TS2307: Cannot find module '@nestjs/typeorm' or its corresponding type declarations.

2 import { InjectRepository } from '@nestjs/typeorm';
                                   ~~~~~~~~~~~~~~~~~
src/loans/loans.service.ts:3:28 - error TS2307: Cannot find module 'typeorm' or its corresponding type declarations.

3 import { Repository } from 'typeorm';
                             ~~~~~~~~~
src/main.ts:1:48 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Logger, Module, ValidationPipe } from '@nestjs/common';
                                                 ~~~~~~~~~~~~~~~~
src/main.ts:2:29 - error TS2307: Cannot find module '@nestjs/core' or its corresponding type declarations.

2 import { NestFactory } from '@nestjs/core';
                              ~~~~~~~~~~~~~~
src/main.ts:3:31 - error TS2307: Cannot find module '@nestjs/config' or its corresponding type declarations.

3 import { ConfigService } from '@nestjs/config';
                                ~~~~~~~~~~~~~~~~
src/main.ts:4:26 - error TS2307: Cannot find module 'cookie-parser' or its corresponding type declarations.

4 import cookieParser from 'cookie-parser';
                           ~~~~~~~~~~~~~~~
src/main.ts:5:20 - error TS2307: Cannot find module 'helmet' or its corresponding type declarations.

5 import helmet from 'helmet';
                     ~~~~~~~~
src/main.ts:6:25 - error TS2307: Cannot find module 'compression' or its corresponding type declarations.

6 import compression from 'compression';
                          ~~~~~~~~~~~~~
src/market/market.controller.ts:1:52 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Controller, Get, Param, Query, Res } from '@nestjs/common';
                                                     ~~~~~~~~~~~~~~~~
src/market/market.controller.ts:2:26 - error TS2307: Cannot find module 'express' or its corresponding type declarations.

2 import { Response } from 'express';
                           ~~~~~~~~~
src/market/market.module.ts:1:24 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Module } from '@nestjs/common';
                         ~~~~~~~~~~~~~~~~
src/market/market.module.ts:2:28 - error TS2307: Cannot find module '@nestjs/axios' or its corresponding type declarations.

2 import { HttpModule } from '@nestjs/axios';
                             ~~~~~~~~~~~~~~~
src/market/market.service.ts:1:44 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Inject, Injectable, Logger } from '@nestjs/common';
                                             ~~~~~~~~~~~~~~~~
src/market/market.service.ts:2:31 - error TS2307: Cannot find module '@nestjs/cache-manager' or its corresponding type declarations.

2 import { CACHE_MANAGER } from '@nestjs/cache-manager';
                                ~~~~~~~~~~~~~~~~~~~~~~~
src/market/market.service.ts:3:23 - error TS2307: Cannot find module 'cache-manager' or its corresponding type declarations.

3 import { Cache } from 'cache-manager';
                        ~~~~~~~~~~~~~~~
src/market/market.service.ts:4:32 - error TS2307: Cannot find module 'rxjs' or its corresponding type declarations.

4 import { firstValueFrom } from 'rxjs';
                                 ~~~~~~
src/market/market.service.ts:5:29 - error TS2307: Cannot find module '@nestjs/axios' or its corresponding type declarations.

5 import { HttpService } from '@nestjs/axios';
                              ~~~~~~~~~~~~~~~
src/market/market.service.ts:6:31 - error TS2307: Cannot find module '@nestjs/config' or its corresponding type declarations.

6 import { ConfigService } from '@nestjs/config';
                                ~~~~~~~~~~~~~~~~
src/market/market.service.ts:93:52 - error TS2580: Cannot find name 'Buffer'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.

93   async getLogo(symbol: string): Promise<{ buffer: Buffer; mime: string }> {
                                                      ~~~~~~
src/market/market.service.ts:95:51 - error TS2580: Cannot find name 'Buffer'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.

95     const cached = await this.cache.get<{ buffer: Buffer | { data: number[] }; mime: string }>(cacheKey);
                                                     ~~~~~~
src/market/market.service.ts:96:34 - error TS2580: Cannot find name 'Buffer'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.

96     if (cached) return { buffer: Buffer.from(cached.buffer as never), mime: cached.mime };
                                    ~~~~~~
src/market/market.service.ts:106:32 - error TS2580: Cannot find name 'Buffer'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.

106       const result = { buffer: Buffer.from(data), mime: headers['content-type'] ?? 'image/png' };
                                   ~~~~~~
src/market/market.service.ts:111:24 - error TS2580: Cannot find name 'Buffer'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.

111       return { buffer: Buffer.from(svg), mime: 'image/svg+xml' };
                           ~~~~~~
src/mining/admin-mining.controller.ts:1:57 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
                                                          ~~~~~~~~~~~~~~~~
src/mining/mining-plan.entity.ts:1:56 - error TS2307: Cannot find module 'typeorm' or its corresponding type declarations.

1 import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
                                                         ~~~~~~~~~
src/mining/mining.controller.ts:1:65 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';      
                                                                  ~~~~~~~~~~~~~~~~       
src/mining/mining.module.ts:1:24 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Module } from '@nestjs/common';
                         ~~~~~~~~~~~~~~~~
src/mining/mining.module.ts:4:31 - error TS2307: Cannot find module '@nestjs/typeorm' or its corresponding type declarations.

4 import { TypeOrmModule } from '@nestjs/typeorm';
                                ~~~~~~~~~~~~~~~~~
src/mining/mining.service.ts:1:82 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Injectable, OnModuleInit, BadRequestException, NotFoundException } from '@nestjs/common';
                                                                                   ~~~~~~~~~~~~~~~~
src/mining/mining.service.ts:2:34 - error TS2307: Cannot find module '@nestjs/typeorm' or its corresponding type declarations.

2 import { InjectRepository } from '@nestjs/typeorm';
                                   ~~~~~~~~~~~~~~~~~
src/mining/mining.service.ts:3:28 - error TS2307: Cannot find module 'typeorm' or its corresponding type declarations.

3 import { Repository } from 'typeorm';
                             ~~~~~~~~~
src/mining/user-mining.entity.ts:1:85 - error TS2307: Cannot find module 'typeorm' or its corresponding type declarations.

1 import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
                                                                                      ~~~~~~~~~
src/shared/filters/global-exception.filter.ts:8:8 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

8 } from '@nestjs/common';
         ~~~~~~~~~~~~~~~~
src/shared/filters/global-exception.filter.ts:9:35 - error TS2307: Cannot find module 'express' or its corresponding type declarations.

9 import { Request, Response } from 'express';
                                    ~~~~~~~~~
src/shared/filters/global-exception.filter.ts:20:57 - error TS18046: 'exception' is of type 'unknown'.

20     const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
                                                           ~~~~~~~~~
src/shared/filters/global-exception.filter.ts:21:58 - error TS18046: 'exception' is of type 'unknown'.

21     const payload = exception instanceof HttpException ? exception.getResponse() : { message: 'Internal server error' };
                                                            ~~~~~~~~~
src/shared/middleware/request-context.middleware.ts:1:44 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Injectable, NestMiddleware } from '@nestjs/common';
                                             ~~~~~~~~~~~~~~~~
src/shared/middleware/request-context.middleware.ts:2:49 - error TS2307: Cannot find module 'express' or its corresponding type declarations.

2 import { Request, Response, NextFunction } from 'express';
                                                  ~~~~~~~~~
src/shared/middleware/request-context.middleware.ts:3:28 - error TS2307: Cannot find module 'crypto' or its corresponding type declarations.

3 import { randomUUID } from 'crypto';
                             ~~~~~~~~
src/shared/providers/coingecko.provider.ts:1:36 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Injectable, Logger } from '@nestjs/common';
                                     ~~~~~~~~~~~~~~~~
src/shared/providers/coingecko.provider.ts:2:31 - error TS2307: Cannot find module '@nestjs/config' or its corresponding type declarations.

2 import { ConfigService } from '@nestjs/config';
                                ~~~~~~~~~~~~~~~~
src/shared/providers/coingecko.provider.ts:3:29 - error TS2307: Cannot find module '@nestjs/axios' or its corresponding type declarations.

3 import { HttpService } from '@nestjs/axios';
                              ~~~~~~~~~~~~~~~
src/shared/providers/coingecko.provider.ts:4:32 - error TS2307: Cannot find module 'rxjs' or its corresponding type declarations.

4 import { firstValueFrom } from 'rxjs';
                                 ~~~~~~
src/shared/providers/market-data.service.ts:1:36 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Inject, Injectable } from '@nestjs/common';
                                     ~~~~~~~~~~~~~~~~
src/shared/providers/providers.module.ts:1:32 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Global, Module } from '@nestjs/common';
                                 ~~~~~~~~~~~~~~~~
src/shared/providers/providers.module.ts:2:28 - error TS2307: Cannot find module '@nestjs/axios' or its corresponding type declarations.

2 import { HttpModule } from '@nestjs/axios';
                             ~~~~~~~~~~~~~~~
src/shared/providers/yahoo-finance.provider.ts:1:36 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Injectable, Logger } from '@nestjs/common';
                                     ~~~~~~~~~~~~~~~~
src/shared/providers/yahoo-finance.provider.ts:2:31 - error TS2307: Cannot find module '@nestjs/config' or its corresponding type declarations.

2 import { ConfigService } from '@nestjs/config';
                                ~~~~~~~~~~~~~~~~
src/shared/providers/yahoo-finance.provider.ts:3:26 - error TS2307: Cannot find module 'yahoo-finance2' or its corresponding type declarations.

3 import yahooFinance from 'yahoo-finance2';
                           ~~~~~~~~~~~~~~~~
src/stats/stats.controller.ts:1:44 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Controller, Get, UseGuards } from '@nestjs/common';
                                             ~~~~~~~~~~~~~~~~
src/stats/stats.module.ts:1:24 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Module } from '@nestjs/common';
                         ~~~~~~~~~~~~~~~~
src/stats/stats.module.ts:2:31 - error TS2307: Cannot find module '@nestjs/typeorm' or its corresponding type declarations.

2 import { TypeOrmModule } from '@nestjs/typeorm';
                                ~~~~~~~~~~~~~~~~~
src/stats/stats.service.ts:1:28 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Injectable } from '@nestjs/common';
                             ~~~~~~~~~~~~~~~~
src/stats/stats.service.ts:2:34 - error TS2307: Cannot find module '@nestjs/typeorm' or its corresponding type declarations.

2 import { InjectRepository } from '@nestjs/typeorm';
                                   ~~~~~~~~~~~~~~~~~
src/stats/stats.service.ts:3:28 - error TS2307: Cannot find module 'typeorm' or its corresponding type declarations.

3 import { Repository } from 'typeorm';
                             ~~~~~~~~~
src/trades/dto/trade.dto.ts:1:48 - error TS2307: Cannot find module 'class-validator' or its corresponding type declarations.

1 import { IsInt, IsNumber, IsString, Min } from 'class-validator';
                                                 ~~~~~~~~~~~~~~~~~
src/trades/trade.entity.ts:1:85 - error TS2307: Cannot find module 'typeorm' or its corresponding type declarations.

1 import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
                                                                                      ~~~~~~~~~
src/trades/trade.entity.ts:9:29 - error TS7006: Parameter 'user' implicitly has an 'any' type.

9     @ManyToOne(() => User, (user) => user.trades)
                              ~~~~
src/trades/trades-admin.controller.ts:1:72 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Body, Controller, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
                                                                         ~~~~~~~~~~~~~~~~
src/trades/trades.controller.ts:1:86 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Body, Controller, Get, Param, ParseIntPipe, Post, Request, UseGuards } from '@nestjs/common';
                                                                                       ~~~~~~~~~~~~~~~~
src/trades/trades.cron.service.ts:1:36 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Injectable, Logger } from '@nestjs/common';
                                     ~~~~~~~~~~~~~~~~
src/trades/trades.cron.service.ts:2:22 - error TS2307: Cannot find module '@nestjs/schedule' or its corresponding type declarations.

2 import { Cron } from '@nestjs/schedule';
                       ~~~~~~~~~~~~~~~~~~
src/trades/trades.module.ts:1:24 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Module } from '@nestjs/common';
                         ~~~~~~~~~~~~~~~~
src/trades/trades.module.ts:2:31 - error TS2307: Cannot find module '@nestjs/typeorm' or its corresponding type declarations.

2 import { TypeOrmModule } from '@nestjs/typeorm';
                                ~~~~~~~~~~~~~~~~~
src/trades/trades.repository.ts:1:28 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Injectable } from '@nestjs/common';
                             ~~~~~~~~~~~~~~~~
src/trades/trades.repository.ts:2:34 - error TS2307: Cannot find module '@nestjs/typeorm' or its corresponding type declarations.

2 import { InjectRepository } from '@nestjs/typeorm';
                                   ~~~~~~~~~~~~~~~~~
src/trades/trades.repository.ts:3:28 - error TS2307: Cannot find module 'typeorm' or its corresponding type declarations.

3 import { Repository } from 'typeorm';
                             ~~~~~~~~~
src/trades/trades.service.ts:1:57 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { BadRequestException, Injectable, Logger } from '@nestjs/common';
                                                          ~~~~~~~~~~~~~~~~
src/transactions/dto/transaction.dto.ts:1:53 - error TS2307: Cannot find module 'class-validator' or its corresponding type declarations.

1 import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
                                                      ~~~~~~~~~~~~~~~~~
src/transactions/transaction.entity.ts:7:8 - error TS2307: Cannot find module 'typeorm' or its corresponding type declarations.

7 } from 'typeorm';
         ~~~~~~~~~
src/transactions/transaction.entity.ts:36:27 - error TS7006: Parameter 'user' implicitly has an 'any' type.

36   @ManyToOne(() => User, (user) => user.transactions)
                             ~~~~
src/transactions/transactions.controller.ts:1:101 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Request, UseGuards } from '@nestjs/common';
                                                                                         
             ~~~~~~~~~~~~~~~~
src/transactions/transactions.module.ts:1:24 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Module } from '@nestjs/common';
                         ~~~~~~~~~~~~~~~~
src/transactions/transactions.module.ts:2:31 - error TS2307: Cannot find module '@nestjs/typeorm' or its corresponding type declarations.

2 import { TypeOrmModule } from '@nestjs/typeorm';
                                ~~~~~~~~~~~~~~~~~
src/transactions/transactions.service.ts:1:68 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';   
                                                                     ~~~~~~~~~~~~~~~~    
src/transactions/transactions.service.ts:2:34 - error TS2307: Cannot find module '@nestjs/typeorm' or its corresponding type declarations.

2 import { InjectRepository } from '@nestjs/typeorm';
                                   ~~~~~~~~~~~~~~~~~
src/transactions/transactions.service.ts:3:28 - error TS2307: Cannot find module 'typeorm' or its corresponding type declarations.

3 import { Repository } from 'typeorm';
                             ~~~~~~~~~
src/users/dto/add-balance.dto.ts:1:31 - error TS2307: Cannot find module 'class-validator' or its corresponding type declarations.

1 import { IsNumber, Min } from 'class-validator';
                                ~~~~~~~~~~~~~~~~~
src/users/dto/create-user.dto.ts:1:96 - error TS2307: Cannot find module 'class-validator' or its corresponding type declarations.

1 import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsBoolean, Min, IsString, MinLength } from 'class-validator';
                                                                                         
        ~~~~~~~~~~~~~~~~~
src/users/user.entity.ts:8:8 - error TS2307: Cannot find module 'typeorm' or its corresponding type declarations.

8 } from 'typeorm';
         ~~~~~~~~~
src/users/user.entity.ts:45:34 - error TS7006: Parameter 'transaction' implicitly has an 'any' type.

45   @OneToMany(() => Transaction, (transaction) => transaction.user)
                                    ~~~~~~~~~~~
src/users/user.entity.ts:48:34 - error TS7006: Parameter 'chatMessage' implicitly has an 'any' type.

48   @OneToMany(() => ChatMessage, (chatMessage) => chatMessage.user)
                                    ~~~~~~~~~~~
src/users/user.entity.ts:51:27 - error TS7006: Parameter 'loan' implicitly has an 'any' type.

51   @OneToMany(() => Loan, (loan) => loan.user)
                             ~~~~
src/users/user.entity.ts:54:32 - error TS7006: Parameter 'asset' implicitly has an 'any' type.

54   @OneToMany(() => UserAsset, (asset) => asset.user)
                                  ~~~~~
src/users/user.entity.ts:57:33 - error TS7006: Parameter 'mining' implicitly has an 'any' type.

57   @OneToMany(() => UserMining, (mining) => mining.user)
                                   ~~~~~~
src/users/user.entity.ts:60:39 - error TS7006: Parameter 'verification' implicitly has an 'any' type.

60   @OneToMany(() => UserVerification, (verification) => verification.user)
                                         ~~~~~~~~~~~~
src/users/users.controller.ts:1:84 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Controller, Get, Post, Body, UseGuards, Patch, Param, ParseIntPipe } from '@nestjs/common';
                                                                                     ~~~~~~~~~~~~~~~~
src/users/users.controller.ts:8:25 - error TS2307: Cannot find module 'bcrypt' or its corresponding type declarations.

8 import * as bcrypt from 'bcrypt';
                          ~~~~~~~~
src/users/users.module.ts:1:24 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Module } from '@nestjs/common';
                         ~~~~~~~~~~~~~~~~
src/users/users.module.ts:2:31 - error TS2307: Cannot find module '@nestjs/typeorm' or its corresponding type declarations.

2 import { TypeOrmModule } from '@nestjs/typeorm';
                                ~~~~~~~~~~~~~~~~~
src/users/users.service.ts:1:66 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';     
                                                                   ~~~~~~~~~~~~~~~~      
src/users/users.service.ts:2:34 - error TS2307: Cannot find module '@nestjs/typeorm' or its corresponding type declarations.

2 import { InjectRepository } from '@nestjs/typeorm';
                                   ~~~~~~~~~~~~~~~~~
src/users/users.service.ts:3:28 - error TS2307: Cannot find module 'typeorm' or its corresponding type declarations.

3 import { Repository } from 'typeorm';
                             ~~~~~~~~~
src/verification/user-verification.entity.ts:1:96 - error TS2307: Cannot find module 'typeorm' or its corresponding type declarations.

1 import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn } from 'typeorm';
                                                                                         
        ~~~~~~~~~
src/verification/verification.controller.ts:1:93 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Controller, Post, Get, Body, Param, UseGuards, Request, Patch, ParseIntPipe } from '@nestjs/common';
                                                                                         
     ~~~~~~~~~~~~~~~~
src/verification/verification.module.ts:1:24 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Module } from '@nestjs/common';
                         ~~~~~~~~~~~~~~~~
src/verification/verification.module.ts:2:31 - error TS2307: Cannot find module '@nestjs/typeorm' or its corresponding type declarations.

2 import { TypeOrmModule } from '@nestjs/typeorm';
                                ~~~~~~~~~~~~~~~~~
src/verification/verification.service.ts:1:49 - error TS2307: Cannot find module '@nestjs/common' or its corresponding type declarations.

1 import { Injectable, BadRequestException } from '@nestjs/common';
                                                  ~~~~~~~~~~~~~~~~
src/verification/verification.service.ts:2:34 - error TS2307: Cannot find module '@nestjs/typeorm' or its corresponding type declarations.

2 import { InjectRepository } from '@nestjs/typeorm';
                                   ~~~~~~~~~~~~~~~~~
src/verification/verification.service.ts:3:28 - error TS2307: Cannot find module 'typeorm' or its corresponding type declarations.

3 import { Repository } from 'typeorm';
                             ~~~~~~~~~
src/market/market.controller.ts:10:11 - error TS4053: Return type of public method from exported class has or is using name 'StockRow' from external module "C:/Users/natna/OneDrive/Desktop/robin/platform/backend/src/market/market.service" but cannot be named.        

10     async getStocks() {
             ~~~~~~~~~
src/market/market.controller.ts:20:11 - error TS4053: Return type of public method from exported class has or is using name 'StockRow' from external module "C:/Users/natna/OneDrive/Desktop/robin/platform/backend/src/market/market.service" but cannot be named.        

20     async getStockDetail(@Param('symbol') symbol: string) {
             ~~~~~~~~~~~~~~

Found 181 error(s).

npm error Lifecycle script `build` failed with error:
npm error code 1
npm error path C:\Users\natna\OneDrive\Desktop\robin\platform\backend
npm error workspace backend@0.0.1
npm error location C:\Users\natna\OneDrive\Desktop\robin\platform\backend
npm error command failed
npm error command C:\WINDOWS\system32\cmd.exe /d /s /c nest build
PS C:\Users\natna\OneDrive\Desktop\robin\platform\backend> 