class Uploader {
  constructor() {
    this.cosConfig = {
      Bucket: 'xizaotang-1325666589',
      Region: 'ap-chengdu',
      SecretId: 'AKIDcQ0SikZAXgl8GAoDNHwMdhXCxUmpcBVZ',
      SecretKey: 'tocKxNY0FEzXqujRxEGBoFvMXTAfuufL'
    };

    if (typeof COS !== 'undefined') {
      this.cos = new COS({
        SecretId: this.cosConfig.SecretId,
        SecretKey: this.cosConfig.SecretKey
      });
      this.cosReady = true;
    } else {
      this.cos = null;
      this.cosReady = false;
      console.warn('腾讯云COS SDK未加载，上传功能暂时不可用');
    }
  }

  uploadAudio(blob, callback) {
    if (!this.cosReady) {
      console.error('腾讯云COS SDK未加载，无法上传');
      callback(false, null);
      return;
    }

    const fileName = `audio/${Date.now()}.mp3`;

    this.cos.putObject({
      Bucket: this.cosConfig.Bucket,
      Region: this.cosConfig.Region,
      Key: fileName,
      Body: blob,
      ContentType: 'audio/mp3'
    }, (err, data) => {
      if (err) {
        console.error('上传失败:', err);
        callback(false, null);
      } else {
        console.log('上传成功:', data);
        callback(true, data.Location);
      }
    });
  }

  updateConfig(config) {
    this.cosConfig = {
      ...this.cosConfig,
      ...config
    };

    if (typeof COS !== 'undefined') {
      this.cos = new COS({
        SecretId: this.cosConfig.SecretId,
        SecretKey: this.cosConfig.SecretKey
      });
      this.cosReady = true;
    }
  }

  isReady() {
    return this.cosReady;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Uploader;
} else {
  window.Uploader = Uploader;
}