import fs from 'fs';
import path from 'path';
import { format, toZonedTime } from 'date-fns-tz';

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
        const date = new Date();
        const timeZone = 'Europe/Istanbul';

        const zonedDate = toZonedTime(date, timeZone);

        const formattedDate = format(zonedDate, 'yyyy-MM-dd HH:mm:ssXXX', { timeZone });

        return formattedDate;
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
