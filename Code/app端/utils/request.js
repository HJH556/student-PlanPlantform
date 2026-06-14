import appConfig from '@/config/index.js'

const BASE_URL = appConfig.baseUrl

// 请求拦截器
function requestInterceptor(options) {
    const token = uni.getStorageSync('token')

    // 对登录和注册请求不添加token
    const url = options.url || ''
    const isAuthRequest = url.includes('/auth/login') || url.includes('/auth/register')

    options.header = options.header || {}

    if (token && !isAuthRequest) {
        options.header.Authorization = `Bearer ${token}`
    }

    options.header['Content-Type'] = 'application/json'

    return options
}

// 响应拦截器
function responseInterceptor(response, options) {
    const { statusCode, data } = response
    const url = options.url || ''
    const isLoginRequest = url.includes('/auth/login')

    if (statusCode >= 200 && statusCode < 300) {
        return { data, status: statusCode, statusCode }
    }

    // 对于400等业务错误，不显示统一提示，让调用方自己处理
    // 只对非登录请求的401、403等做统一处理
    if (statusCode === 401 && !isLoginRequest) {
        uni.showToast({
            title: '登录已过期，请重新登录',
            icon: 'none'
        })
        uni.removeStorageSync('token')
        uni.removeStorageSync('user')
        setTimeout(() => {
            uni.reLaunch({
                url: '/pages/login/login'
            })
        }, 1500)
    } else if (statusCode === 403 && !isLoginRequest) {
        uni.showToast({
            title: '没有权限执行此操作',
            icon: 'none'
        })
    } else if (statusCode === 404 && !isLoginRequest) {
        uni.showToast({
            title: '请求的资源不存在',
            icon: 'none'
        })
    } else if (statusCode === 500 && !isLoginRequest) {
        uni.showToast({
            title: '服务器内部错误',
            icon: 'none'
        })
    }

    // 对于400等业务错误，直接返回错误信息，让调用方处理
    return Promise.reject({
        response,
        data,
        status: statusCode,
        statusCode,
        message: data?.detail || data?.msg || '请求失败'
    })
}

// 构建URL查询参数
function buildQueryParams(params) {
    if (!params || Object.keys(params).length === 0) {
        return ''
    }
    return '?' + Object.keys(params)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
        .join('&')
}

// 封装uni.request
function request(options) {
    return new Promise((resolve, reject) => {
        const finalOptions = requestInterceptor({
            ...options,
            url: BASE_URL + options.url
        })

        console.log('发送请求:', {
            url: finalOptions.url,
            method: finalOptions.method,
            data: finalOptions.data,
            headers: finalOptions.header
        })

        uni.request({
            ...finalOptions,
            success: (res) => {
                console.log('请求成功响应:', res)
                try {
                    const result = responseInterceptor(res, finalOptions)
                    resolve(result)
                } catch (err) {
                    console.log('响应拦截器错误:', err)
                    reject(err)
                }
            },
            fail: (err) => {
                console.log('请求失败:', err)
                uni.showToast({
                    title: '网络错误，请检查后端服务是否启动',
                    icon: 'none'
                })
                reject(err)
            }
        })
    })
}

export default {
    get(url, data = {}, options = {}) {
        const queryString = buildQueryParams(data)
        return request({
            url: url + queryString,
            method: 'GET',
            ...options
        })
    },

    post(url, data = {}, options = {}) {
        let finalUrl = url
        if (options.params) {
            const queryString = buildQueryParams(options.params)
            finalUrl = url + queryString
        }
        return request({
            url: finalUrl,
            method: 'POST',
            data: data,
            ...options
        })
    },

    put(url, data = {}, options = {}) {
        return request({
            url,
            method: 'PUT',
            data,
            ...options
        })
    },

    delete(url, data = {}, options = {}) {
        const queryString = buildQueryParams(data)
        return request({
            url: url + queryString,
            method: 'DELETE',
            ...options
        })
    },

    upload(url, filePath, formData = {}, options = {}) {
        return new Promise((resolve, reject) => {
            const token = uni.getStorageSync('token')

            uni.uploadFile({
                url: BASE_URL + url,
                filePath,
                name: 'file',
                formData,
                header: {
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                success: (res) => {
                    try {
                        const data = JSON.parse(res.data)
                        resolve(data)
                    } catch (err) {
                        resolve(res.data)
                    }
                },
                fail: reject
            })
        })
    }
}
