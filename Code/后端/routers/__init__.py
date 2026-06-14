# 从子模块中导入 router，并以 auth 和 student_profiles 的名字导出
from .auth import router as auth
from .student_profiles import router as student_profiles
from .student import router as student
from .job import router as job
from .career import router as career
from .agent import router as agent