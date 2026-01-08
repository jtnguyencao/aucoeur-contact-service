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
    try {
      await this.appService.sendContact({
        ...contactDto,
        file: file || null,
      })
      return { success: true, message: 'Email sent successfully' }
    } catch (error) {
      console.error('Error in contact controller:', error)
      throw error
    }
  }
}
