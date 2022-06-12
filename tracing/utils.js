function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = parseInt(Math.floor(Math.log(Math.abs(bytes)) / Math.log(1024)), 10);

    if (i === 0) return `${bytes} ${sizes[i]}`;

    return `${(bytes / (1024 ** i)).toFixed(dm)} ${sizes[i]}`;
}
module.exports.formatBytes = formatBytes;
