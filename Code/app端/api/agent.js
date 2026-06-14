import request from '@/utils/request.js'

export default {
    sendMessage(userId, message) {
        return request.post('/agent/send-message', null, {
            params: {
                user_id: userId,
                message: message
            }
        })
    },
    
    // 分析简历
    analyzeResume(resumeText, userId) {
        return request.post('/langchain/analyze-resume', {
            resume_text: resumeText,
            user_id: userId
        }, {
            header: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
    }
}
