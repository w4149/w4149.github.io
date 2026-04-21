const recorder = new Recorder();
const uploader = new Uploader();

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const status = document.getElementById('status');
const timer = document.getElementById('timer');
const confirmModal = document.getElementById('confirmModal');
const retryBtn = document.getElementById('retryBtn');
const uploadBtn = document.getElementById('uploadBtn');
const successModal = document.getElementById('successModal');
const okBtn = document.getElementById('okBtn');
const qrcode = document.getElementById('qrcode');

let timerInterval = null;

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateTimer() {
  const duration = recorder.getDuration();
  timer.textContent = formatTime(duration);
}

async function handleStartRecording() {
  // 移除SDK检查限制，让录音功能始终可用
  console.log('开始录音，检查SDK状态:', uploader.isReady());

  const success = await recorder.startRecording();
  if (success) {
    startBtn.classList.add('hidden');
    stopBtn.classList.remove('hidden');
    status.textContent = '录音中...';
    status.classList.add('text-red-500', 'font-medium');

    timerInterval = setInterval(updateTimer, 1000);
  } else {
    alert('无法获取麦克风权限，请检查浏览器设置');
  }
}

function handleStopRecording() {
  recorder.stopRecording();

  startBtn.classList.remove('hidden');
  stopBtn.classList.add('hidden');
  status.textContent = '录音完成';
  status.classList.remove('text-red-500', 'font-medium');

  clearInterval(timerInterval);

  confirmModal.classList.remove('hidden');
}

function handleRetry() {
  recorder.reset();
  confirmModal.classList.add('hidden');
  status.textContent = '准备就绪';
  timer.textContent = '00:00';
}

function handleUpload() {
  const audioBlob = recorder.getAudioBlob();
  if (audioBlob) {
    // 检查SDK是否就绪
    if (!uploader.isReady()) {
      alert('腾讯云COS SDK未加载，请检查网络连接后刷新页面重试');
      return;
    }

    uploadBtn.disabled = true;
    uploadBtn.textContent = '上传中...';

    uploader.uploadAudio(audioBlob, (success, location) => {
      confirmModal.classList.add('hidden');
      uploadBtn.disabled = false;
      uploadBtn.textContent = '上传';

      if (success) {
        successModal.classList.remove('hidden');
      } else {
        alert('上传失败，请检查网络连接和COS配置');
      }
    });
  }
}

function handleOk() {
  successModal.classList.add('hidden');
  recorder.reset();
  status.textContent = '准备就绪';
  timer.textContent = '00:00';
}

function generateQRCode() {
  const url = window.location.href;
  if (typeof QRCode !== 'undefined') {
    qrcode.innerHTML = '';
    const canvas = document.createElement('canvas');
    qrcode.appendChild(canvas);

    QRCode.toCanvas(canvas, url, {
      width: 150,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }, (err) => {
      if (err) {
        console.error('生成二维码失败:', err);
        qrcode.innerHTML = '<p class="text-gray-500 text-sm">二维码生成失败</p>';
      }
    });
  } else {
    qrcode.innerHTML = '<p class="text-gray-500 text-sm">二维码生成失败</p>';
  }
}

startBtn.addEventListener('click', handleStartRecording);
stopBtn.addEventListener('click', handleStopRecording);
retryBtn.addEventListener('click', handleRetry);
uploadBtn.addEventListener('click', handleUpload);
okBtn.addEventListener('click', handleOk);

window.addEventListener('DOMContentLoaded', () => {
  generateQRCode();
});