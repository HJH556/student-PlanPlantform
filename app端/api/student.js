import request from '@/utils/request.js'

export default {
    // 获取学生信息
    getStudentInfo() {
        return request.get('/student/profile')
    },

    // 更新学生信息
    updateStudentInfo(data) {
        return request.put('/student/profile', data)
    },

    // 上传简历
    uploadResume(filePath, formData) {
        return request.upload('/student/upload-resume', filePath, formData)
    },

    // 解析简历
    parseResume(fileId) {
        return request.post('/student/parse-resume', { fileId })
    },

    // 获取学生能力评估
    getAbilityEvaluation() {
        return request.get('/student/ability-evaluation')
    }
}
