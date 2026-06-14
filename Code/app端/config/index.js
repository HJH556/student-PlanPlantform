// 根据运行环境自动选择API地址
// 手机端无法访问localhost，需要使用局域网IP
const getBaseUrl = () => {
    // 如果是微信小程序，使用localhost
    if (typeof uni !== 'undefined' && uni.getSystemInfoSync) {
        const systemInfo = uni.getSystemInfoSync()
        if (systemInfo.platform === 'devtools') {
            // 开发工具中使用localhost
            return 'http://localhost:8000'
        } else {
            // 手机端使用局域网IP或公网地址
            return 'http://10.216.96.113:8000'  // 你的实际IP地址
        }
    }

    // 默认使用localhost
    return 'http://localhost:8000'
}

const config = {
    dev: {
        baseUrl: 'http://localhost:8000'
    },
    prod: {
        baseUrl: 'https://your-production-domain.com'
    },
    lan: {
        baseUrl: 'http://10.216.96.113:8000'  // 你的实际IP地址
    }
}

export default {
    baseUrl: getBaseUrl(),

    setBaseUrl(url) {
        this.baseUrl = url
    }
}
