import { Module, OnModuleInit } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { MailerModule } from '@nestjs-modules/mailer'
import { MjmlAdapter } from "@nestjs-modules/mailer/dist/adapters/mjml.adapter"

// Validate required environment variables
const requiredEnvVars = ['MAILER_HOST', 'MAILER_AUTH_USER', 'MAILER_AUTH_PASS', 'MAILER_FROM', 'MAILER_TO', 'TEMPLATE_PATH']
const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

if (missingVars.length > 0) {
  console.warn(`Warning: Missing environment variables: ${missingVars.join(', ')}`)
}

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => {
        const transportConfig: any = { 
          host: process.env.MAILER_HOST,
          port: process.env.MAILER_PORT ? parseInt(process.env.MAILER_PORT, 10) : 587,
          auth: {
            user: process.env.MAILER_AUTH_USER,
            pass: process.env.MAILER_AUTH_PASS,
          }, 
          ignoreTLS: process.env.MAILER_IGNORE_TLS === "true",
          secure: process.env.MAILER_SECURE === "true",
          connectionTimeout: 30000,
          greetingTimeout: 30000,
          socketTimeout: 30000,
          tls: {
            rejectUnauthorized: process.env.MAILER_REJECT_UNAUTHORIZED !== "false",
          },
        }

        return {
          transport: transportConfig,
          defaults: {
            from: process.env.MAILER_FROM,
          },
          template: {
            adapter: new MjmlAdapter('pug', { inlineCssEnabled: false }),
          },
        }
      },
    }),
  ], 
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  onModuleInit() {
    // Log configuration without blocking startup
    console.log(`Mailer configured - Host: ${process.env.MAILER_HOST || 'NOT SET'}, Port: ${process.env.MAILER_PORT || '587'}`)
  }
}
