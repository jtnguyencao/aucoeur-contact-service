import { Body, Controller, UseInterceptors, UploadedFile, Post } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { AppService } from './app.service'
import { ContactDto } from './dto/CreateVersionDto'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async contact(@UploadedFile() file: Express.Multer.File, @Body() contactDto: ContactDto) {
    await this.appService.sendContact({
      ...contactDto,
      file: file || null,
    })
  }
}
