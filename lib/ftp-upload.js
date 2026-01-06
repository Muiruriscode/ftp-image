import ftp from 'ftp';
import { Readable } from 'stream';

class FTPClient {
  constructor() {
    this.config = {
      host: process.env.FTP_HOST || 'localhost',
      user: process.env.FTP_USER || 'anonymous',
      password: process.env.FTP_PASSWORD || '',
      port: process.env.FTP_PORT || 21
    };
    this.client = new ftp();
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.client.on('ready', () => {
        console.log('FTP Connected successfully');
        resolve();
      });
      
      this.client.on('error', (err) => {
        console.error('FTP Connection error:', err);
        reject(err);
      });

      this.client.connect(this.config);
    });
  }

  disconnect() {
    this.client.end();
  }

  async ensureDirectory(path) {
    return new Promise((resolve, reject) => {
      this.client.mkdir(path, true, (err) => {
        if (err && err.code !== 550) { // 550 means directory already exists
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async uploadFile(buffer, remotePath, filename) {
    return new Promise((resolve, reject) => {
      const stream = Readable.from(buffer);
      
      const fullPath = remotePath + filename;
      
      this.client.put(stream, fullPath, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log(`File uploaded to FTP: ${fullPath}`);
          resolve({
            success: true,
            filename,
            path: fullPath
          });
        }
      });
    });
  }

  async listDirectory(path) {
    return new Promise((resolve, reject) => {
      this.client.list(path, (err, list) => {
        if (err) {
          reject(err);
        } else {
          resolve(list);
        }
      });
    });
  }
}

export default FTPClient;