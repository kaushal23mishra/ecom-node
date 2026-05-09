import os from 'os';
import response from '../../../utils/response';
const responseHandler = require('../../../utils/response/responseHandler');

/**
 * @description : Get system hardware and process information
 */
export const getSystemInfo = async (req: any, res: any) => {
    try {
        const info = {
            os: {
                platform: os.platform(),
                release: os.release(),
                uptime: os.uptime(),
                loadavg: os.loadavg(),
                totalMemory: os.totalmem(),
                freeMemory: os.freemem(),
                cpus: os.cpus().length
            },
            process: {
                pid: process.pid,
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
                nodeVersion: process.version
            },
            timestamp: new Date()
        };
        
        return responseHandler(res, response.success({ data: info }));
    } catch (error: any) {
        return responseHandler(res, response.internalServerError({ message: error.message }));
    }
};

export default {
    getSystemInfo
};
