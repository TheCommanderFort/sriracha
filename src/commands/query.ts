import Row from '../row';
import {Message} from 'discord.js';
import info from '../../config/globalinfo.json';
const tierlist = ['S', 'S-', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-'];
import sheets from '../sheetops';
import { Flags } from '../index';

/**
 * Checks if 'arr' contains any elements in any form of 'val.'
 * @param {Array} arr
 * @param {Array} queries
 */
function includes(arr: string[], queries: string[]) {
	let accumulator = true;
	for (const obj in queries) {
		let result = false;
		if (tierlist.includes(queries[obj])) {
			result = result || arr[5] === queries[obj]; //match the tiers
			accumulator = accumulator && result;
			result = false;
			continue;
		}
		for (let i = 0; i < arr.length; i++) {
			result = result || arr[i].trim().toLowerCase().indexOf(queries[obj].toLowerCase()) > -1;
		}
		accumulator = accumulator && result;
		result = false;
	}
	return accumulator;
}

/**
 * Queries a specific sheet.
 * @param {Discord.Message} message
 * @param {Number} list
 * @param {*} flags
 */
export async function query(message: Message, list: number, flags: Flags) {
	let query = flags.q!
	if (query.charAt(query.length - 1) == '/') {
		query = query.slice(0, -1);
	}

	const name = info.sheetNames[list];

	const rows = await sheets.get(name);

	async function taxFraud(str: string) {
		return str.replace('``````', '');
	}

	//multi query parser
	const scanner = /{(?<found>.*?)}+/;
	const accounts: string[] = []; //array of search queries
	let forged = query;
	if (scanner.test(query)) {
		//oh shit! might have found something!
		let m;
		while ((m = scanner.exec(forged)) !== null) {
			accounts.push(m.groups!.found);
			forged = forged.substring(m.index + 1);
		}
	} else {
		accounts.push(query);
	}

	let count = 0;
	const beginningStr = flags.str ?? '**Received `list` request for ' + info.sheetNames[list] + '.**\nPlease wait for all results to deliver.\n';
	const endStr = flags.estr ?? '\nEnd of Results!';
	const listMessages = [beginningStr];
	let currentMessage = '';

	for (let i = 0; i < rows.length; i++) {
		let price = rows[i];
		const check = new Row(price);
		check.uid = null;
		check.img = null;
		check.siteTags = check.siteTags?.replaceAll(/"(characters|tags)":/gi, "");
		price = check.toArray().map((s) => s.toString());
		if (includes(price, accounts)) {
			currentMessage += `${list}#${i+1} ${check.hm ?? check.nh ?? check.eh ?? check.im} ${check.title} by ${check.author}` + '\n';
			count++;
		}
		if (currentMessage.length > 1900) { //messages are limited to 2000 characters, use 1900 to avoid issues
			listMessages.push(`\`\`\`${currentMessage}\`\`\``);
			currentMessage = ''; //reset our string
		} else if (i == rows.length - 1) { //last iteration
			listMessages.push(`\`\`\`${currentMessage}\`\`\`${endStr}`);
		}
	}

	if (count == 0) return `${beginningStr}\`\`\`No results in this list!\`\`\``;
	else return listMessages;
}

/**
 * Queries all used sheets.
 * @param {Message} message
 * @param {*} flags
 */
export async function queryAll(message: Message, flags: Flags) {
	const validLists: number[] = [1, 2, 3, 4, 6, 9];
	const listMessages = [];

	for (let i = 0; i < validLists.length; i++) {
		listMessages.push(await query(message, validLists[i], {
			q: flags.qa,
			str: '**Results from `' + info.sheetNames[validLists[i] as keyof typeof info.sheetNames] + '`**',
			estr: '',
		}));
	}
	if (listMessages.flat(1).join('\n').length < 1900) {
		message.channel.send(listMessages.flat(1).join('\n'));
	} else {
		for (let i = 0; i < listMessages.length; i++) {
			if (typeof listMessages[i] == 'object') {
				for (let p = 0; p < listMessages[i].length; p++) {
					await message.channel.send(listMessages[i][p]);
				}
			} else {
				await message.channel.send(<string>listMessages[i]);
			}
		}
	}
}
