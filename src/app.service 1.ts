import { Injectable, OnModuleInit } from '@nestjs/common'
import { ContactDto } from './dto/CreateVersionDto'
import * as fs from 'fs'
import * as pug from 'pug'
import * as mjml2html from 'mjml'
import { join } from 'path'
import * as FormData from 'form-data' // Changez l'import par défaut en import *
import Mailgun from "mailgun.js"

interface EmailCompiledFunctions {
  [template: string]: pug.compileTemplate
}

@Injectable()
export class AppService implements OnModuleInit {
  private mg
  private templateFunctions: EmailCompiledFunctions = {
    "contact": undefined,
  }

    constructor() {
    const mailgun = new Mailgun(FormData as any) // Utilisation du cast si nécessaire
    this.mg = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY,
      url: process.env.MAILGUN_HOST || 'https://api.mailgun.net',
    })
  }


  onModuleInit() {
    // Compilation des templates au démarrage
    const templateDir = process.env.TEMPLATE_PATH || join(__dirname, '..', 'templates')
    
    for (const template in this.templateFunctions) {
      const htmlPath = join(templateDir, `${template}.pug`)

      if (!fs.existsSync(htmlPath)) {
        console.error(`[Templates] Introuvable: ${htmlPath}`)
        continue
      }
      this.templateFunctions[template] = pug.compileFile(htmlPath)
      console.log(`[Templates] Chargé: ${template}`)
    }
  }

  async sendContact(contactDto: ContactDto) {
    const variables = {
      name: contactDto.name,
      email: contactDto.email,
      message: contactDto.message,
      phone: contactDto.phone,
      website: contactDto.website,
    }

    const attachments = []
    if (contactDto.file) {
      attachments.push({
        filename: contactDto.file.originalname,
        data: contactDto.file.buffer, // Le SDK Mailgun utilise 'data' au lieu de 'content'
      })
    }

    return await this.send({
      template: 'contact',
      subject: 'Prise de contact',
      variables,
      attachments,
    })
  }

  private async send({ template, subject, variables, attachments }) {
    if (!this.templateFunctions[template]) {
      throw new Error(`Template ${template} non compilé.`)
    }

    const renderedPug = this.templateFunctions[template](variables)
    const mjmlResult = mjml2html(renderedPug)

    if (mjmlResult.errors.length > 0) {
      mjmlResult.errors.forEach(e => console.error(e.formattedMessage))
    }

    // 2. Préparation des listes CC et BCC (CCI)
    const ccList = process.env.MAILER_CC 
      ? process.env.MAILER_CC.split(',').map(e => e.trim()).filter(e => e.length > 0) 
      : []

    const bccList = process.env.MAILER_BCC 
      ? process.env.MAILER_BCC.split(',').map(e => e.trim()).filter(e => e.length > 0) 
      : []

    // 3. Envoi via Mailgun SDK
    try {
      const response = await this.mg.messages.create(process.env.MAILGUN_DOMAIN, {
        from: process.env.MAILER_FROM,
        to: [process.env.MAILER_TO],
        cc: ccList.length > 0 ? ccList : undefined,
        bcc: bccList.length > 0 ? bccList : undefined, // Ajout du BCC (CCI)
        subject: subject,
        html: mjmlResult.html,
        attachment: attachments,
      })

      console.log('Email envoyé avec succès (ID):', response.id)
      return response
    } catch (error) {
      console.error('Erreur Mailgun API:', error.details || error.message)
      throw error
    }
  }
}
