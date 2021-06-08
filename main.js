const options = {
  keepalive: 30,
  clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
  protocolId: 'MQTT',
  protocolVersion: 4,
  clean: true,
  reconnectPeriod: 1000,
  connectTimeout: 30 * 1000,
  rejectUnauthorized: false,
}

const client = mqtt.connect(`ws://${location.hostname}:9001`, options)
const logMessageRegex = /\[(\d+:\d{2}:\d{2}\.\d+)] (.*)/
let $ = {}

window.addEventListener('DOMContentLoaded', event => {
  $ = {
    status: document.getElementById('status'),
    log: document.getElementById('log'),
    templates: {
      logEntry: document.getElementById('tpl-log-entry'),
    },
  }
})

const status_labels = {
  'code_crashed': '💣 Crashed',
  'code_finished': '🏁 Finished',
  'code_killed': '💀 Killed',
  'code_running': '▶️ Running',
  'code_starting': '⏩ Starting',
}

client.on('connect', function () {
  console.log('Connected!')
  client.subscribe('astoria/#')
})

client.on('error', function (err) {
  console.error(err)
  client.end()
})

const handlers = {
  'astoria/broadcast/usercode_log': contents => {
    const template = $.templates.logEntry
    const entryFragment = template.content.cloneNode(true)
    const [_, ts, message] = contents.content.match(logMessageRegex)

    entryFragment.querySelector('.log-entry').dataset.source = contents.source
    entryFragment.querySelector('.log-entry__ts').textContent = ts
    const contentEl = entryFragment.querySelector('.log-entry__content')
    contentEl.textContent = message

    if (message.indexOf('WARNING:') === 0) {
      contentEl.classList.add('text-d-orange')
    }

    $.log.appendChild(entryFragment)
  },
  'astoria/broadcast/start_button': contents => {
    createPlainLogEntry('▶️ Start button pressed', 'text-d-blue', 'text-bold')
  },
  'astoria/astdiskd': contents => {
    document.querySelectorAll('.controls button')
      .forEach(el => el.disabled = Object.values(contents.disks).filter(d => d.disk_type === 'USERCODE').length === 0)
  },
  'astoria/astprocd': contents => {
    $.status.textContent = status_labels[contents.code_status]
  }
}

const ack = {
  kill: payload => {
    createPlainLogEntry('💀 Killed', 'text-d-red', 'text-bold')
  },
  restart: payload => {
    createPlainLogEntry('🔄 Restart', 'text-d-blue', 'text-bold')
  }
}

client.on('message', function (topic, payload) {
  const contents = JSON.parse(payload.toString())
  console.log(isOwnPayload(contents) ? '🦝' : '🤖', topic, contents)
  if (topic in handlers) {
    handlers[topic](contents)
  }
})

const isOwnPayload = contents => contents.hasOwnProperty('sender_name') && contents.sender_name === options.clientId

function uuid4 () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function createPlainLogEntry (text, ...classes) {
  const entry = document.createElement('div')
  entry.classList.add('log-entry')
  for (const className of classes) {
    entry.classList.add(className)
  }
  entry.textContent = text
  $.log.appendChild(entry)
}

function sendProcessRequest (type) {
  const requestUuid = uuid4()
  handlers[`astoria/astprocd/request/${type}/${requestUuid}`] = payload => {
    if (payload.success) {
      ack[type](payload)
    } else {
      const requestTypeName = type.charAt(0).toUpperCase() + type.slice(1)
      const entryText = `💣 ${requestTypeName} failed - ${payload.reason}`
      createPlainLogEntry(entryText, 'text-d-red', 'text-bold')
    }
    delete handlers[payload.uuid]
  }
  client.publish(`astoria/astprocd/request/${type}`, JSON.stringify({
    sender_name: options.clientId,
    uuid: requestUuid,
  }))
}

function broadcast(eventName) {
  client.publish(`astoria/broadcast/${eventName}`, JSON.stringify({
    sender_name: options.clientId,
    event_name: eventName,
    priority: 0,
  }))
}

function clearLog() {
  $.log.innerHTML = ''
}