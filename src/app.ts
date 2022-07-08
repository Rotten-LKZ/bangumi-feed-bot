import 'dotenv/config'
import { $fetch } from 'ohmyfetch'
import { parseDocument, parseFeed } from 'htmlparser2'
import TelegramBot from 'node-telegram-bot-api'

const bot = new TelegramBot(process.env.BOT_TOKEN!, { polling: true })
let latestTs = 1657274799000

bot.onText(/\/start/, (msg) => {
  if (msg.chat.id === parseInt(process.env.OWNER_ID!))
    bot.sendMessage(msg.chat.id, 'Hello, I am the bot for you!')
  else
    bot.sendMessage(msg.chat.id, 'Sorry, I am only for the owner!')
})

bot.onText(/\/download (.+)/, (msg, match) => {
  if (msg.chat.id !== parseInt(process.env.OWNER_ID!))
    return
  if (match) {
    const urls = match[1].split(' ')
    sendDownloadRequest(urls)
    bot.sendMessage(msg.chat.id, `Start downloading ${urls.length} files ...`)
  }
  else {
    bot.sendMessage(msg.chat.id, 'No url provided')
  }
})

bot.onText(/\/feeds/, (msg) => {
  if (msg.chat.id !== parseInt(process.env.OWNER_ID!))
    return
  getFeed()
})

bot.onText(/\/latest/, (msg) => {
  if (msg.chat.id !== parseInt(process.env.OWNER_ID!))
    return
  bot.sendMessage(process.env.OWNER_ID!, `Now latest time is: ${latestTs}`)
})

bot.on('callback_query', (callbackQuery) => {
  const action = callbackQuery.data!
  sendDownloadRequest([action])
  const msg = callbackQuery.message!
  const opts = {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
  }

  bot.editMessageText(`Start downloading ${msg.text!}`, opts)
})

setInterval(getFeed, 600000)

getFeed()

function sendDownloadRequest(urls: string[]) {
  $fetch(process.env.REQUEST_URL!, {
    headers: {
      Accept: 'application/json',
      Cookie: process.env.COOKIE!,
    },
    body: { url: urls, dst: process.env.SAVE_PATH || '/' },
    method: 'POST',
  })
}

async function getFeed() {
  const res: string = await $fetch('https://bangumi.moe/rss/latest')
  const parsed = parseFeed(res)!.items
  for (const item of parsed) {
    if (item.pubDate!.getTime() > latestTs) {
      const imgTag = item.description!.match(/\<img(.+)"( *)(\/?)>/)
      if (imgTag) {
        const img = parseDocument(imgTag[0])
        // @ts-expect-error - no type info for this
        await bot.sendPhoto(process.env.OWNER_ID!, img.children[0].attribs.src)
      }
      const linkParts = item.link!.split('/')
      await bot.sendMessage(process.env.OWNER_ID!, item.title!, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Download',
                callback_data: await getMagnet(linkParts[linkParts.length - 1]),
              },
            ],
          ],
        },
      })
    }
  }
  latestTs = parsed[0].pubDate!.getTime()
}

async function getMagnet(id: string): Promise<string> {
  return (await $fetch('https://bangumi.moe/api/torrent/fetch', { method: 'POST', body: { _id: id }, parseResponse: txt => JSON.parse(txt) })).magnet
}
