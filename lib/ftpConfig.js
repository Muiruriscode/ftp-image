const ftp = require('ftp');

const ftpConfig = {
  host: process.env.FTP_HOST,
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
  port: process.env.FTP_PORT || 21
};

async function uploadToFTP(fileBuffer, filename, remotePath = '/uploads/') {
  return new Promise((resolve, reject) => {
    const client = new ftp();
    
    client.on('ready', () => {
      client.put(fileBuffer, remotePath + filename, (err) => {
        if (err) {
          client.end();
          reject(err);
        } else {
          client.end();
          resolve({
            success: true,
            filename: filename,
            path: remotePath + filename,
            url: `${process.env.FTP_BASE_URL}${remotePath}${filename}`
          });
        }
      });
    });

    client.on('error', (err) => {
      reject(err);
    });

    client.connect(ftpConfig);
  });
}

module.exports = { uploadToFTP };