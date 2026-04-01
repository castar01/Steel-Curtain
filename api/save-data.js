const REDIS_KEY = 'game_data_ctrl';

function json(res, status, payload) {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(payload));
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return json(res, 405, { success: false, error: 'Method Not Allowed' });
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
        const record = {
            participantId: String(body.participantId || '').trim(),
            oxygenValue: body.oxygenValue ?? '',
            ending: String(body.ending || ''),
            timestamp: body.timestamp || new Date().toISOString(),
            group: 'ctrl'
        };

        if (!record.participantId) {
            return json(res, 400, { success: false, error: 'participantId required' });
        }

        const url = process.env.KV_REST_API_URL;
        const token = process.env.KV_REST_API_TOKEN;
        if (!url || !token) {
            return json(res, 500, { success: false, error: 'KV env missing' });
        }

        const response = await fetch(`${url}/pipeline`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([
                ['RPUSH', REDIS_KEY, JSON.stringify(record)]
            ])
        });

        if (!response.ok) {
            const text = await response.text();
            return json(res, 500, { success: false, error: text || 'redis write failed' });
        }

        return json(res, 200, { success: true });
    } catch (error) {
        return json(res, 500, { success: false, error: error.message || 'unknown error' });
    }
};

