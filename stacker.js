const AWS = require('aws-sdk')
const fs = require('fs')
const path = require('path')

const cloudformation = new AWS.CloudFormation({ region: 'us-west-2' })

class Stacker {
  constructor (stackName, keyName) {
    this.stackName = stackName
    this.keyNme = keyName
  }

  async checkStatus (stackName, delay) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        cloudformation.describeStacks({StackName: stackName}, function (err, data) {
          if (err) {
            if (err.message.includes('does not exist')) {
              return resolve()
            }
            console.log(err, err.stack) // an error occurred
            reject(err)
          } else {
            return resolve(data)
          }
        })
      }, delay)
    })
  }

  async upsertStack () {
    const exists = await this.checkStatus(this.stackName, 100)
    const templatePath = path.join(__dirname, './cf-template.yml')
    const template = fs.readFileSync(templatePath, {
      encoding: 'utf8'
    })
    const params = {
      StackName: this.stackName,
      Parameters: [
        {
          ParameterKey: 'KeyName',
          ParameterValue: this.keyNme
        }
      ],
      Tags: [
        {
          Key: 'Name',
          Value: 'localtunneller'
        }
      ],
      TemplateBody: template
    }

    if (!exists) {
      await this.createStack(params)
    } else {
      await this.updateStack(params)
    }
    const recurse = () => {
      return this.checkStatus(this.stackName, 8000)
        .then((data) => {
          if (!data) return Promise.resolve()
          console.log(data.Stacks[0].StackStatus, '...')
          if (!data.Stacks[0].StackStatus.includes('COMPLETE')) {
            return recurse()
          } else {
            if (data.Stacks[0].Outputs && data.Stacks[0].Outputs.length) {
              data.Stacks[0].Outputs.forEach((o) => console.log(o.Description, ':', o.OutputValue))
            }
          }
        })
    }
    recurse()
  }

  createStack (params) {
    return new Promise((resolve, reject) => {
      cloudformation.createStack(params, function (err, data) {
        if (err) reject(err)
        resolve(data)
      })
    })
  }

  updateStack (params) {
    return new Promise((resolve, reject) => {
      cloudformation.updateStack(params, function (err, data) {
        if (err) reject(err)
        resolve(data)
      })
    })
  }

  deleteStack () {
    return new Promise((resolve, reject) => {
      cloudformation.deleteStack({ StackName: this.stackName }, function (err, data) {
        if (err) reject(err) // an error occurred
        resolve(data) // successful response
      })
    })
  }

  async removeStack () {
    await this.deleteStack(this.stackName)
    const recurse = (delay) => {
      return this.checkStatus(this.stackName, delay)
        .then((data) => {
          if (!data) return Promise.resolve()
          console.log(data.Stacks[0].StackStatus, '...')
          if (!data.Stacks[0].StackStatus.includes('COMPLETE')) {
            return recurse(8000)
          }
        })
    }
    recurse(100)
  }
}

module.exports = Stacker
