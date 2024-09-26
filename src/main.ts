import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const allowedOrigins = ['http://localhost:3000', 'https://lecorvier-demo.netlify.app', 'https://chateaulecorvier.netlify.app', 'http://localhost:3001', 'https://diane-demo.netlify.app', 'https://lecorvier.com']
  const port = process.env.PORT || 3000

  app.useGlobalPipes(new ValidationPipe())
  app.enableCors({
    origin: allowedOrigins,
  })

  await app.listen(port)
  console.log(`App started at port ${port}`)
}
bootstrap()
