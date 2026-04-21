class Recorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
    this.isRecording = false;
    this.startTime = 0;
    this.timerInterval = null;
    this.maxDuration = 2 * 60; // 2分钟，单位秒
    this.currentDuration = 0;
  }

  async startRecording() {
    try {
      console.log('开始录音...');
      console.log('navigator.mediaDevices:', navigator.mediaDevices);
      
      // 获取麦克风权限 - 更健壮的方式
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('浏览器不支持getUserMedia');
        return false;
      }

      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('获取麦克风权限成功');
      
      // 创建MediaRecorder实例
      this.mediaRecorder = new MediaRecorder(this.stream);
      console.log('创建 MediaRecorder 成功');
      
      // 监听数据可用事件
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      // 监听录音结束事件
      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        this.stopTimer();
      };
      
      // 开始录音
      this.mediaRecorder.start();
      this.isRecording = true;
      this.startTime = Date.now();
      this.startTimer();
      console.log('录音开始');
      
      return true;
    } catch (error) {
      console.error('录音开始失败:', error);
      console.error('错误名称:', error.name);
      console.error('错误消息:', error.message);
      return false;
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    
    this.isRecording = false;
    this.stopTimer();
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      this.currentDuration = Math.floor((Date.now() - this.startTime) / 1000);
      
      // 检查是否达到最大时长
      if (this.currentDuration >= this.maxDuration) {
        this.stopRecording();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  getDuration() {
    return this.currentDuration;
  }

  getAudioBlob() {
    if (this.audioChunks.length === 0) {
      return null;
    }
    
    return new Blob(this.audioChunks, { type: 'audio/mp3' });
  }

  reset() {
    this.stopRecording();
    this.audioChunks = [];
    this.currentDuration = 0;
    this.startTime = 0;
  }
}

// 导出Recorder类
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Recorder;
} else {
  window.Recorder = Recorder;
}