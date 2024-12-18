import fs from 'fs';
import path from 'path';

class Logger {
    private logFilePath: string;

    constructor(logFileName: string = 'logs.txt') {
        this.logFilePath = path.join(__dirname, '../../logs', logFileName);

        // Log dosyasını oluşturalım, eğer yoksa
        if (!fs.existsSync(this.logFilePath)) {
            fs.mkdirSync(path.dirname(this.logFilePath), { recursive: true });
            fs.writeFileSync(this.logFilePath, '');
        }
    }

    private getCurrentTimestamp(): string {
        return new Date().toISOString();
    }

    log(message: string): void {
        const timestamp = this.getCurrentTimestamp();
        const formattedMessage = `[${timestamp}] ${message}`;

        // Terminale yaz
        console.log(formattedMessage);

        // Dosyaya yaz
        fs.appendFileSync(this.logFilePath, formattedMessage + '\n');
    }
}

export default Logger;
