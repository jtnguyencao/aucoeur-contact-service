import { Injectable } from '@nestjs/common'
import { ContactDto } from './dto/CreateVersionDto'
import * as fs from 'fs'
import * as pug from 'pug'
import * as mjml2html from 'mjml'
import { MailerService } from '@nestjs-modules/mailer'
import { join } from 'path'

interface EmailCompiledFunctions {
  [template: string]: pug.compileTemplate
}

const DEFAULT_VARIABLES = {}
const DEFAULT_ATTACHMENTS = []

@Injectable()
export class AppService {
  private templateFunctions:EmailCompiledFunctions = {
    "contact": undefined,
  }

  constructor(
    private readonly mailerService: MailerService,
  ) {
    for (const template in this.templateFunctions) {
      
      const htmlPath = join(process.env.TEMPLATE_PATH, `${template}.pug`)

      if (!fs.existsSync(htmlPath)) {
        console.error(`Cannot find email template=${htmlPath}`)
        continue
      }
    
      this.templateFunctions[template] = pug.compileFile(htmlPath)
    }
  }

  async sendContact(contactDto: ContactDto) {
    let variables = {
      name: contactDto.name,
      email: contactDto.email,
      message: contactDto.message,
      phone: contactDto.phone,
      website: contactDto.website,
    }
    let attachments = []
    if (contactDto.file) {
      attachments.push({
        filename: contactDto.file.originalname,
        content: contactDto.file.buffer,
        contentType: contactDto.file.mimetype,
      })
    }
      
    await this.send({
      template: 'contact',
      subject: 'Prise de contact',
      variables,
      attachments,
    })
  }

  private async send({ template, subject, variables, attachments }) {
    const v = { ...DEFAULT_VARIABLES, ...variables }
    const mjmlHTML = mjml2html(this.templateFunctions[template](v))

    for (const e of mjmlHTML.errors) {
      console.error(e.formattedMessage)
    }

    const ccList = process.env.MAILER_CC 
      ? process.env.MAILER_CC.split(',').map(email => email.trim()).filter(email => email.length > 0)
      : []

    const mailOptions: any = {
      to: process.env.MAILER_TO,
      from: process.env.MAILER_FROM,
      subject,
      html: mjmlHTML.html,
      attachments: [
        ...DEFAULT_ATTACHMENTS,
        ...attachments
      ],
    }

    // Only add CC if there are recipients
    if (ccList.length > 0) {
      mailOptions.cc = ccList
    }

    try {
      await this.mailerService.sendMail(mailOptions)
      console.log(`Email sent successfully to ${mailOptions.to}${ccList.length > 0 ? ` and CC'd to ${ccList.join(', ')}` : ''}`)
    } catch (error) {
      console.error('Error sending email:', error)
      throw error
    }
  }
}
