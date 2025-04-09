import { createApp } from 'json-server/lib/app'
import { Observer } from 'json-server/lib/observer';
import { JSONFile } from 'lowdb/node';
import { Low } from 'lowdb';
import path = require('path');

import { watch } from 'chokidar';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const args = yargs(hideBin(process.argv)).option('port', {

    alias: 'p',
    type: 'number',
    default: 3000,
    description: 'Port to run the server on'

}).option('db', {
    alias: 'd',
    type: 'string',
    default: path.join(__dirname, 'db.json'),
    description: 'Path to store the rules'
}).parseSync();

const { port, db } = args;

const runJsonServer = async (json: string, port: number = 3000) => {
    const adapter = new JSONFile(json);
    const observer = new Observer(adapter);
    const db = new Low<any>(observer, {});
    await db.read();
    const app = createApp(db, {})
    app.listen(port, () => {
        console.log(`JSON Server is running on http://localhost:${port}`);
    });
    watch(json).on('change', async (filePath) => {
        console.log(`File ${filePath} has been changed`);
        await db.read();
        console.log('db.json has been updated');
    })
}


runJsonServer(db, port);