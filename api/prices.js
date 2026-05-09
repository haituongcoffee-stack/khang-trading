const TD_MAP = {
  NQ:     'NDX',
  XAUUSD: 'XAU/USD',
  US30:   'DJI',
  VIX:    'VIX',
  DXY:    'DXY',
  BTC:    'BTC/USD',
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120')

  const KEY   = process.env.TWELVE_DATA_KEY
  const RURL  = process.env.UPSTASH_REDIS_REST_URL
  const RTOK  = process.env.UPSTASH_REDIS_REST_TOKEN

  try {
    if (RURL && RTOK) {
      const c = await fetch(`${RURL}/get/prices_v1`, {
        headers: { Authorization: `Bearer ${RTOK}` }
      }).then(r => r.json()).catch(() => ({}))
      if (c.result) {
        const obj = JSON.parse(decodeURIComponent(c.result))
        if (Date.now() - obj.ts < 60000)
          return res.status(200).json({ prices: obj.prices, source: 'cache' })
      }
    }

    if (!KEY) return res.status(500).json({ prices: {}, error: 'No API key' })

    const syms = Object.values(TD_MAP).join(',')
    const url  = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(syms)}&apikey=${KEY}`
    const data = await fetch(url).then(r => r.json())

    const prices = {}
    for (const [id, sym] of Object.entries(TD_MAP)) {
      const q = data[sym]
      if (q && q.close && !q.code) {
        prices[id] = {
          price:  parseFloat(q.close),
          change: parseFloat(q.percent_change || 0),
          real:   true,
        }
      }
    }

    if (RURL && RTOK && Object.keys(prices).length > 0) {
      const val = encodeURIComponent(JSON.stringify({ prices, ts: Date.now() }))
      await fetch(`${RURL}/set/prices_v1/${val}?ex=120`, {
        headers: { Authorization: `Bearer ${RTOK}` }
      }).catch(() => {})
    }

    return res.status(200).json({ prices, source: 'twelvedata' })

  } catch (err) {
    return res.status(500).json({ prices: {}, error: err.message })
  }
}
