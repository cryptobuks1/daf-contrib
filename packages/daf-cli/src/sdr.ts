import * as Daf from 'daf-core'
import * as DIDComm from 'daf-did-comm'
import * as SD from 'daf-selective-disclosure'
import { agent } from './setup'
import program from 'commander'
import inquirer from 'inquirer'
import qrcode from 'qrcode-terminal'

program
  .command('sdr')
  .description('Create Selective Disclosure Request')
  .option('-s, --send', 'Send')
  .option('-q, --qrcode', 'Show qrcode')
  .action(async cmd => {
    const identities = await agent.identityManager.getIdentities()
    if (identities.length === 0) {
      console.error('No dids')
      process.exit()
    }
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'iss',
        choices: identities.map(item => item.did),
        message: 'Issuer DID',
      },
      {
        type: 'input',
        name: 'sub',
        message: 'Subject DID (can be empty)',
      },
      {
        type: 'input',
        name: 'tag',
        message: 'Tag',
      },
    ])

    let addMoreRequests = true
    const claims = []

    while (addMoreRequests) {
      const answers2 = await inquirer.prompt([
        {
          type: 'input',
          name: 'claimType',
          message: 'Claim type',
          default: 'name',
        },
        {
          type: 'input',
          name: 'reason',
          message: 'Reason',
          default: 'We need this to comply with local law',
        },
        {
          type: 'list',
          name: 'essential',
          message: 'Is essential',
          choices: [
            { name: 'Yes', value: true },
            { name: 'No', value: false },
          ],
        },
        {
          type: 'list',
          name: 'addIssuer',
          message: 'Add accepted issuer?',
          choices: [
            { name: 'Yes', value: true },
            { name: 'No', value: false },
          ],
        },
      ])

      let addIssuer = answers2.addIssuer
      const issuers = []
      while (addIssuer) {
        const issuerAnswers = await inquirer.prompt([
          {
            type: 'input',
            name: 'did',
            message: 'Issuer DID',
            default: 'did:web:uport.me',
          },
          {
            type: 'input',
            name: 'url',
            message: 'URL',
            default: 'https://uport.me',
          },
          {
            type: 'list',
            name: 'addIssuer',
            message: 'Add another accepted issuer?',
            choices: [
              { name: 'Yes', value: true },
              { name: 'No', value: false },
            ],
          },
        ])
        issuers.push({
          did: issuerAnswers.did,
          url: issuerAnswers.url,
        })
        addIssuer = issuerAnswers.addIssuer
      }

      const answers4 = await inquirer.prompt([
        {
          type: 'list',
          name: 'addMore',
          message: 'Add another claim?',
          choices: [
            { name: 'Yes', value: true },
            { name: 'No', value: false },
          ],
        },
      ])

      claims.push({
        issuers: issuers,
        essential: answers2.essential,
        claimType: answers2.claimType,
        reason: answers2.reason,
      } as SD.CredentialRequestInput)
      addMoreRequests = answers4.addMore
    }

    const signAction: SD.ActionSignSdr = {
      type: SD.ActionTypes.signSdr,
      data: {
        issuer: answers.iss,
        subject: answers.sub === '' ? undefined : answers.sub,
        tag: answers.tag === '' ? undefined : answers.tag,
        claims,
      },
    }

    const jwt = await agent.handleAction(signAction)

    if (!cmd.send) {
      await agent.handleMessage({ raw: jwt, metaData: [{ type: 'cli' }] })
    } else if (answers.sub !== '') {
      const sendAction: DIDComm.ActionSendDIDComm = {
        type: DIDComm.ActionTypes.sendMessageDIDCommAlpha1,
        data: {
          from: answers.iss,
          to: answers.sub,
          type: 'jwt',
          body: jwt,
        },
      }
      try {
        const result = await agent.handleAction(sendAction)
        console.log('Sent:', result)
      } catch (e) {
        console.error(e)
      }
    } else {
      console.log('Subject not specified')
    }

    if (cmd.qrcode) {
      qrcode.generate(jwt)
    } else {
      console.log(`jwt: ${jwt}`)
    }
  })
