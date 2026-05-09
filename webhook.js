export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const URL = process.env.UPSTASH_REDIS_REST_URL
  const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!URL || !TOKEN) return res.status(500).json({ error: 'No storage configured' })

  try {
    const { s, p } = req.body
    if (!s || !p) return res.status(400).json({ error: 'Missing symbol or price' })

    const key = `price:${s}`
    const prev = await fetch(`${URL}/get/${key}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    }).then(r => r.json()).then(d => d.result ? JSON.parse(d.result) : null)

    const prevPrice = prev?.price || p
    const change = ((p - prevPrice) / prevPrice) * 100

    const data = JSON.stringify({ price: p, change: parseFloat(change.toFixed(3)), ts: Date.now() })
    await fetch(`${URL}/set/${key}/${encodeURIComponent(data)}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    })

    return res.status(200).json({ ok: true, symbol: s, price: p })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
