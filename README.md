# bangumi-feed-bot

Feed bot for <https://bangumi.moe>

`Telegram Bot` + `Bangumi` + `Cloudreve`

## Config

1. Create `.env` under root path

2. Download `Cloudreve` and config `aria2`

3. Config

```
BOT_TOKEN=token from @BotFather
OWNER_ID=robot's owner id
COOKIE=cookie when request downloading files
SAVE_PATH=where to save
REQUEST_URL=API for requesting downloading files
```

Example:

```
BOT_TOKEN=123456:SDV569sd5f
OWNER_ID=891154
COOKIE=XXX
SAVE_PATH=/Path/To/Save
REQUEST_URL=http://127.0.0.1:2333/api/v3/aria2/url
```

## Commands

It will update feed every `10` minutes

### /start

Judge if you are the owner of the robot

### /download

Download files from urls

E.g. /download http://example.com/xxx.png http://abracadabra.com/aa.jpg

### /feeds

Active update subscription

### /latest

Get the latest time
