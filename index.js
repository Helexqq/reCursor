const os = require('os');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

(async () => {
    let content = {};

    const storageFile = (() => {
        switch (os.platform()){
            case 'win32':
                return path.join(process.env.APPDATA, 'Cursor', 'User', 'globalStorage', 'storage.json');
            case 'darwin': // for macOS
                return path.join(os.homedir(), 'Library', 'Application Support', 'Cursor', 'User', 'globalStorage', 'storage.json');
            default:
                console.error('Unsupported platform')
        }
    })()

    if (!fs.existsSync(storageFile)) {
        console.error('Cursor is not installed');
    }

    const backupFile = `${storageFile}.backup_${Date.now()}`;
    fs.copyFileSync(storageFile, backupFile)
    content = JSON.parse(fs.readFileSync(storageFile, 'utf8'))

    const [machineId, macMachineId] = Array.from({ length: 2 }, () =>
        crypto.randomBytes(32).toString('hex')
    )
    const devDeviceId = uuidv4()

    content["telemetry.machineId"] = machineId
    content["telemetry.macMachineId"] = macMachineId
    content["telemetry.devDeviceId"] = devDeviceId

    fs.writeFileSync(storageFile, JSON.stringify(content, null, 2), 'utf8')
    console.log('Resetting the Cursor trial period was successful')
    console.table({ machineId, macMachineId, devDeviceId })
})();
