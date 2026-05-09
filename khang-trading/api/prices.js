// api/prices.js — Vercel Serverless Function
// Fetches real-time prices from Yahoo Finance (server-side, no CORS issues)

const SYMBOL_MAP = {
  'NQ=F':      'NQ',
  'GC=F':      'XAUUSD',
  'YM=F':      'US30',
  '^VIX':      'VIX',
  'DX-Y.NYB':  'DXY',
  'BTC-USD':   'BTC',
}

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=20')

  try {
    const symbols = Object.keys(SYMBOL_MAP).map(s => encodeURIComponent(s)).join(',')
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}&fields=regularMarketPrice,regularMarketChangePercent,regularMarketChange,regularMarketPreviousClose`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Yahoo Finance returned ${response.status}`)
    }

    const data = await response.json()
    const quotes = data?.quoteResponse?.result || []

    const prices = {}
    quotes.forEach(q => {
      const id = SYMBOL_MAP[q.symbol]
      if (id) {
        prices[id] = {
          price:     parseFloat((q.regularMarketPrice || 0).toFixed(4)),
          change:    parseFloat((q.regularMarketChangePercent || 0).toFixed(3)),
          changeAbs: parseFloat((q.regularMarketChange || 0).toFixed(4)),
          prevClose: parseFloat((q.regularMarketPreviousClose || 0).toFixed(4)),
        }
      }
    })

    return res.status(200).json({ prices, timestamp: Date.now() })

  } catch (err) {
    console.error('Price fetch error:', err.message)
    return res.status(500).json({ error: err.message, prices: {} })
  }
}
