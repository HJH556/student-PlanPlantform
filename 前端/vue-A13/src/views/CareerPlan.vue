<template>
  <Transition name="page-enter" appear>
    <div class="career-plan">
    <!-- Page Header - Dark Blue Theme -->
    <section class="page-header">
      <div class="page-header-bg">
        <div class="page-header-pattern"></div>
      </div>
      <div class="page-header-particles">
        <div class="page-header-particle"></div>
        <div class="page-header-particle"></div>
        <div class="page-header-particle"></div>
        <div class="page-header-particle"></div>
        <div class="page-header-particle"></div>
        <div class="page-header-particle"></div>
        <div class="page-header-particle"></div>
        <div class="page-header-particle"></div>
        <div class="page-header-particle"></div>
        <div class="page-header-particle"></div>
      </div>
      <div class="page-header-energy"></div>
      <div class="page-header-content">
        <span class="page-badge animate-rotate-in">🎯 职业规划</span>
        <h1 class="page-title animate-scale-in">规划您的职业未来</h1>
        <p class="page-subtitle animate-bounce-in">制定个性化发展路径，实现职业目标</p>
      </div>
    </section>

    <!-- Career Plan Content -->
    <section class="plan-content">
      <div class="content-card animate-wave-in" style="animation-delay: 0.1s;">
        <div class="card-header">
          <div class="card-icon animate-elastic">🎯</div>
          <div class="card-title-wrapper">
            <h3 class="card-title">人岗匹配结果</h3>
            <p class="card-desc">AI智能分析您与目标岗位的匹配程度</p>
          </div>
        </div>
        <MatchResult />
      </div>

      <div class="content-card animate-wave-in" style="animation-delay: 0.3s;">
        <div class="card-header">
          <div class="card-icon animate-elastic">🛤️</div>
          <div class="card-title-wrapper">
            <h3 class="card-title">职业发展路径</h3>
            <p class="card-desc">可视化展示您的职业成长路线</p>
          </div>
        </div>
        <CareerPath />
      </div>

      <div class="content-card animate-wave-in" style="animation-delay: 0.5s;">
        <div class="card-header">
          <div class="card-icon animate-elastic">📋</div>
          <div class="card-title-wrapper">
            <h3 class="card-title">行动计划</h3>
            <p class="card-desc">详细的阶段性目标和执行计划</p>
          </div>
        </div>
        <ActionPlan />
      </div>
    </section>
  </div>
  </Transition>
</template>

<script setup lang="ts">
import MatchResult from '../components/career/MatchResult.vue'
import CareerPath from '../components/career/CareerPath.vue'
import ActionPlan from '../components/career/ActionPlan.vue'
</script>

<style scoped>
/* Page Enter Animation */
.page-enter-enter-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.page-enter-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.career-plan {
  width: 100%;
  min-height: 100vh;
}

/* 新的动画效果 */
@keyframes rotateIn {
  from {
    opacity: 0;
    transform: rotate(-360deg) scale(0.5);
  }
  to {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes bounceIn {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.3);
  }
  50% {
    opacity: 1;
    transform: translateY(10px) scale(1.05);
  }
  70% {
    transform: translateY(-5px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes waveIn {
  0% {
    opacity: 0;
    transform: translateX(-100%) skewX(-20deg);
  }
  50% {
    opacity: 0.7;
    transform: translateX(10%) skewX(5deg);
  }
  100% {
    opacity: 1;
    transform: translateX(0) skewX(0);
  }
}

@keyframes elastic {
  0%, 100% {
    transform: scale(1);
  }
  10% {
    transform: scale(1.1) rotate(5deg);
  }
  20% {
    transform: scale(1.1) rotate(-5deg);
  }
  30% {
    transform: scale(1.1) rotate(5deg);
  }
  40% {
    transform: scale(1.1) rotate(-5deg);
  }
  50% {
    transform: scale(1.1) rotate(5deg);
  }
  60% {
    transform: scale(1) rotate(0deg);
  }
}

.animate-rotate-in {
  animation: rotateIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.animate-scale-in {
  animation: scaleIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.animate-bounce-in {
  animation: bounceIn 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
  opacity: 0;
}

.animate-wave-in {
  animation: waveIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  opacity: 0;
}

.animate-elastic {
  animation: elastic 2s ease-in-out infinite;
}

/* Page Header - Dark Blue Theme */
.page-header {
  position: relative;
  background: linear-gradient(135deg, #1a237e 0%, #283593 30%, #3949ab 60%, #3f51b5 100%);
  color: white;
  padding: 1.33rem 0;
  margin: -2rem -2rem 2rem 0rem;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 100%;
}

.page-header-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.page-header-pattern {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.4) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.4) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(240, 147, 251, 0.2) 0%, transparent 50%);
  animation: patternFloat 10s ease-in-out infinite;
}

@keyframes patternFloat {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translate(-15px, 10px) scale(1.05);
    opacity: 1;
  }
}

.page-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, 
    transparent 30%, 
    rgba(255, 255, 255, 0.05) 50%, 
    transparent 70%);
  animation: shimmer 4s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 添加粒子效果 */
.page-header-particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.page-header-particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: headerParticleFloat 6s ease-in-out infinite;
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
}

.page-header-particle:nth-child(1) { left: 5%; top: 30%; animation-delay: 0s; }
.page-header-particle:nth-child(2) { left: 15%; top: 70%; animation-delay: 0.8s; }
.page-header-particle:nth-child(3) { left: 25%; top: 50%; animation-delay: 1.5s; }
.page-header-particle:nth-child(4) { left: 35%; top: 80%; animation-delay: 0.3s; }
.page-header-particle:nth-child(5) { left: 45%; top: 40%; animation-delay: 2s; }
.page-header-particle:nth-child(6) { left: 55%; top: 60%; animation-delay: 1s; }
.page-header-particle:nth-child(7) { left: 65%; top: 30%; animation-delay: 2.5s; }
.page-header-particle:nth-child(8) { left: 75%; top: 70%; animation-delay: 0.5s; }
.page-header-particle:nth-child(9) { left: 85%; top: 50%; animation-delay: 1.8s; }
.page-header-particle:nth-child(10) { left: 95%; top: 80%; animation-delay: 1.2s; }

@keyframes headerParticleFloat {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-15px) scale(1.3);
    opacity: 0.9;
  }
}

/* 添加能量环 */
.page-header-energy {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: energyRing 4s ease-out infinite;
}

.page-header-energy::before,
.page-header-energy::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
}

.page-header-energy::before {
  width: 300px;
  height: 300px;
  animation: energyRing 4s ease-out infinite 0.5s;
}

.page-header-energy::after {
  width: 400px;
  height: 400px;
  animation: energyRing 4s ease-out infinite 1s;
}

@keyframes energyRing {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.5;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

.page-header-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  padding: 0 2rem;
}

.page-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 0.3rem 0.8rem;
  border-radius: 50px;
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.page-badge:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-subtitle {
  font-size: 1rem;
  opacity: 0.9;
  margin: 0;
  line-height: 1.5;
}

/* Plan Content */
.plan-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 2rem 4rem;
}

.content-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}



.content-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border-color: #1a237e;
  transform: translateY(-4px);
}



.card-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #f1f5f9;
  transition: all 0.3s ease;
}

.content-card:hover .card-header {
  border-bottom-color: #1a237e;
}

.card-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #1a237e 0%, #3949ab 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(26, 35, 126, 0.3);
  transition: all 0.3s ease;
}

.content-card:hover .card-icon {
  box-shadow: 0 6px 16px rgba(26, 35, 126, 0.4);
}

.card-title-wrapper {
  flex: 1;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.375rem 0;
  transition: all 0.3s ease;
}

.content-card:hover .card-title {
  color: #1a237e;
}

.card-desc {
  color: #64748b;
  font-size: 0.95rem;
  margin: 0;
  line-height: 1.5;
  transition: all 0.3s ease;
}

.content-card:hover .card-desc {
  color: #475569;
}

/* Responsive */
@media (min-width: 1200px) {
  .content-card {
    padding: 2.5rem;
  }

  .page-title {
    font-size: 3rem;
  }

  .plan-content {
    gap: 2.5rem;
  }
}

@media (max-width: 992px) {
  .page-header {
    padding: 3rem 1.5rem;
    margin: -1.5rem -1.5rem 2rem -1.5rem;
  }

  .page-title {
    font-size: 2.25rem;
  }

  .plan-content {
    padding: 0 1.5rem 3rem;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.75rem;
  }

  .content-card {
    padding: 1.5rem;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-icon {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
  }

  .card-title {
    font-size: 1.25rem;
  }

  .plan-content {
    padding: 0 1rem 3rem;
    gap: 1.5rem;
  }
}
</style>
