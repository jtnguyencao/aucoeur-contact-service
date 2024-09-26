import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { MjmlAdapter } from "@nestjs-modules/mailer/dist/adapters/mjml.adapter";

@Module({
  imports: [
    MailerModule.forRoot({
      transport: { 
        host: process.env.MAILER_HOST,
        port: process.env.MAILER_PORT,
        auth: {
          user: process.env.MAILER_AUTH_USER,
          pass: process.env.MAILER_AUTH_PASS,
        }, 
        ignoreTLS: process.env.MAILER_IGNORE_TLS === "true",
        secure: process.env.MAILER_SECURE === "true",
      },
      defaults: {
        from: process.env.MAILER_FROM,
      },
      template: {
        adapter: new MjmlAdapter('pug', { inlineCssEnabled: false }),
      },
    }),
  ], 
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
