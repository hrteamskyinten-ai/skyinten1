import axios from "axios";

const encodeBase64 = (s = "") => Buffer.from(String(s)).toString("base64");
const decodeBase64 = (s = "") => Buffer.from(String(s), "base64").toString("utf8");

const JUDGE0_URL = process.env.JUDGE0_URL || 'http://13.202.120.253:2358';

export const createCodeSubmission = async (req, res) => {
    const { lang_id, code, input = "" } = req.body;

    const payload = {
        language_id: String(lang_id),
        source_code: encodeBase64(code || ""),
        stdin: encodeBase64(input || ""),
    };

    const axiosConfig = {
        params: {
            base64_encoded: 'true',
            wait: 'false', // async submission; we'll poll
            fields: '*',
        },
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000, // 15s timeout for submission request
    };

    try {
        const response = await axios.post(`${JUDGE0_URL}/submissions`, payload, axiosConfig);
        const token = response.data?.token;
        if (!token) return res.status(502).json({ message: 'No token returned from compiler service' });
        return getCodeStatus(token, res);
    } catch (err) {
        console.error('createCodeSubmission error:', err.message || err);
        const msg = err.code === 'ECONNRESET' || err.code === 'ECONNREFUSED'
            ? 'Compiler service unreachable'
            : (err.response?.data || err.message || 'Compiler submission failed');
        return res.status(502).json({ message: msg });
    }
};

export const getCodeStatus = async (token, res, attempt = 0) => {
    const maxAttempts = 25;
    const axiosConfig = { params: { base64_encoded: 'true', fields: '*' }, timeout: 20000 };

    try {
        const response = await axios.get(`${JUDGE0_URL}/submissions/${token}`, axiosConfig);
        const statusId = response.data?.status?.id;

        if (statusId === 1 || statusId === 2) {
            if (attempt >= maxAttempts) {
                console.error('Max polling attempts reached for token', token);
                return res.status(504).json({ message: 'Compiler timed out processing submission' });
            }
            // Still processing - wait and poll again
            await new Promise((r) => setTimeout(r, 2000));
            return getCodeStatus(token, res, attempt + 1);
        }

        // Completed - normalize and return useful fields
        const out = {
            status: response.data.status,
            stdout: response.data.stdout ? response.data.stdout : null,
            stderr: response.data.stderr ? response.data.stderr : null,
            compile_output: response.data.compile_output ? response.data.compile_output : null,
            raw: response.data,
        };

        return res.status(200).json(out);
    } catch (err) {
        console.error('getCodeStatus error:', err.message || err);
        const msg = err.code === 'ECONNRESET' || err.code === 'ECONNREFUSED'
            ? 'Compiler service unreachable'
            : (err.response?.data || err.message || 'Failed to retrieve results');
        return res.status(502).json({ message: msg });
    }
};

export const judge0Health = async (req, res) => {
    try {
        const axiosConfig = { timeout: 5000 };
        const response = await axios.get(`${JUDGE0_URL}/`, axiosConfig);
        return res.json({ success: true, status: 'ok', raw: response.data });
    } catch (err) {
        console.error('judge0Health error:', err.message || err);
        return res.status(502).json({ success: false, message: 'Judge0 unreachable' });
    }
};

