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
        const url = process.env.KV_REST_API_URL;
        const token = process.env.KV_REST_API_TOKEN;
        if (!url || !token) {
            console.error('KV env missing', {
                hasUrl: Boolean(url),
                hasToken: Boolean(token)
            });
            return json(res, 500, { success: false, error: 'KV env missing' });
        }

        let body = req.body || {};
        if (typeof body === 'string') {
            try {
                body = JSON.parse(body);
            } catch (parseError) {
                console.error('Body JSON parse failed:', parseError, 'rawBody:', body);
                return json(res, 400, { success: false, error: 'invalid JSON body' });
            }
        }

        const record = {
            participantId: String(body.participantId || '').trim(),
            oxygenValue: body.oxygenValue ?? '',
            ending: String(body.ending || ''),
            timestamp: body.timestamp || new Date().toISOString(),
            group: 'ctrl'
        };
        console.log('save-data incoming record:', record);

        if (!record.participantId) {
            return json(res, 400, { success: false, error: 'participantId required' });
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
            const detail = await response.text();
            console.error('Upstash write failed:', {
                status: response.status,
                detail
            });
            return json(res, 500, {
                success: false,
                error: `redis write failed: status=${response.status}`,
                detail
            });
        }

        const result = await response.json().catch(() => ({}));
        if (result && result.error) {
            console.error('Upstash business error:', result.error, result);
            return json(res, 500, {
                success: false,
                error: 'redis write failed',
                detail: result.error
            });
        }

        console.log('save-data success:', {
            participantId: record.participantId,
            group: record.group
        });
        return json(res, 200, { success: true });
    } catch (error) {
        console.error('save-data exception:', error);
        return json(res, 500, { success: false, error: error.message || 'unknown error' });
    }
};

