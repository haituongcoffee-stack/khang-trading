const SYMBOLS = ['NQ','XAUUSD','US30','VIX','DXY','BTC']

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=5')

  const URL = process.env.UPSTASH_REDIS_REST_URL
  const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

  try {
    const prices = {}
    await Promise.all(SYMBOLS.map(async s => {
      const r = await fetch(`${URL}/get/price:${s}`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      })
      const d = await r.json()
      if (d.result) prices[s] = JSON.parse(decodeURIComponent(d.result))
    }))
    return res.status(200).json({ prices, source: 'tradingview' })
  } catch (err) {
    return res.status(500).json({ prices: {}, error: err.message })
  }
}
