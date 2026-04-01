module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    var response = await fetch(process.env.KV_REST_API_URL, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + process.env.KV_REST_API_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(['LRANGE', 'game_data_ctrl', 0, -1])
    });

    var result = await response.json();
    if (result.error) throw new Error(result.error);

    var records = (result.result || []).map(function(item) {
      try { return JSON.parse(item); } catch (e) { return null; }
    }).filter(Boolean);

    if (req.query.format === 'csv') {
      var csv = '\uFEFF实验编号,氧气数值,游戏结局,时间\n';
      records.forEach(function(d) {
        csv += '"' + (d.participantId || '') + '",' +
               (d.oxygenValue != null ? d.oxygenValue : '') + ',' +
               '"' + (d.ending || '') + '",' +
               '"' + (d.timestamp || '') + '"\n';
      });
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="ctrl_export.csv"');
      return res.status(200).send(csv);
    }

    return res.status(200).json({ count: records.length, records: records });
  } catch (err) {
    console.error('export-data error:', err);
    return res.status(500).json({ error: 'Failed to export data' });
  }
};
