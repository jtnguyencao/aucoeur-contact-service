import { IsEmail, IsNotEmpty } from 'class-validator'
import { Type } from 'class-transformer'
export class ContactDto {
  @IsNotEmpty()
  name: string

  phone: string

  website: string

  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  message: string

  @Type(() => Object)
  file?: Express.Multer.File
}
