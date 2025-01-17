import Row from '../row';
import info from '../../config/globalinfo.json';
import sheets from '../sheetops';
import axios from 'axios';
import Jimp from 'jimp';

import { v4 as uuidv4 } from 'uuid';
const fs = require('fs');

// const table = require('../table_list_3_updated.json');
const ignored = require('../../data/ignoredtags.json');

// const AWS = require('aws-sdk');

// const s3 = new AWS.S3({
// 	accessKeyId: info.awsId,
// 	secretAccessKey: info.awsSecret,
// });

const getBaseTag = (tag: String) => {
	if (tag.includes(':')) {
		return tag.substring(tag.indexOf(':') + 1);
	}
	return tag;
};

async function runScript() {
	const rows = await sheets.get(info.sheetNames[4]);
	const obj = [];

	for (let i = 0; i < rows.length; i++) {
		const row = new Row(rows[i]);

		// if (!row.uid) {
		// 	row.uid = uuid.v4();
		// 	await sheets.overwrite(info.sheetNames[3], i + 2, row.toArray());
		// 	await new Promise((resolve) => setTimeout(resolve, 1000));
		// }

		if (row.eh && row.nh) {
			if (/e-hentai.org\/s\//.exec(row.eh)) {
				continue;
			}
			obj.push({
				eh: row.eh,
				nh: row.nh,
			});
		}

		// // SCRIPT FOR UPDATING SITE TAGS FROM PYTHON SCRIPT
		// if (row.uid in table) {
		// 	if (!row.siteTags) {
		// 		let data = table[row.uid];
		// 		let siteTags = null;
		// 		if (data.eh_info) {
		// 			siteTags = {
		// 				tags: [...data.eh_info[1].filter((tag) => !tag.includes('group:') && !ignored.includes(getBaseTag(tag)))],
		// 				characters: [...data.eh_info[3].map((tag) => getBaseTag(tag))],
		// 			};
		// 		} else if (data.nh_info) {
		// 			siteTags = {
		// 				tags: [...data.nh_info[1].filter((tag) => !ignored.includes(tag))],
		// 				characters: [...data.nh_info[4]],
		// 			};
		// 		}

		// 		row.siteTags = siteTags ? JSON.stringify(siteTags) : null;

		// 		// REMEMBER TO CHANGE THIS SHEET NUMBER!
		// 		await sheets.overwrite(info.sheetNames[3], i + 2, row.toArray());
		// 		await new Promise((resolve) => setTimeout(resolve, 1000));
		// 	}
		// }

		// let edited = false;
		// if (row.misc) {
		// 	let miscField = JSON.parse(row.misc);
		// 	if (miscField.altLinks) {
		// 		for (let i = miscField.altLinks.length - 1; i >= 0; i--) {
		// 			if (miscField.altLinks[i].name.toLowerCase() === 'imgur' || miscField.altLinks[i].name.toLowerCase() === 'nhentai') {
		// 				row.eh = miscField.altLinks[i].link;
		// 				console.log(miscField.altLinks[i].link);
		// 				miscField.altLinks.splice(i, 1);
		// 				edited = true;
		// 			} //delete operations calls for splicing the array to the requested field
		// 		}
		// 	}
		// 	if (edited) {
		// 		if (miscField.altLinks?.length === 0) {
		// 			delete miscField.altLinks; //get rid of the object structure if theres nothing left after delete
		// 		}

		// 		if (Object.keys(miscField).length === 0) {
		// 			row.misc = null;
		// 		} else {
		// 			row.misc = JSON.stringify(miscField);
		// 		}
		// 	}
		// }
		// if (edited) {
		// 	await sheets.overwrite(info.sheetNames[9], i + 2, row.toArray());
		// 	await new Promise((resolve) => setTimeout(resolve, 1000));
		// }

		/*
		if(row.misc) {
			let miscField = JSON.parse(row.misc);
			if(miscField.altLinks) {
				let edited = false;
				for (let i = miscField.altLinks.length - 1; i >= 0; i--) {
					if (miscField.altLinks[i].name.toLowerCase() === "e-hentai version") {
						row.eh = miscField.altLinks[i].link;
						console.log(miscField.altLinks[i].link);
						miscField.altLinks.splice(i, 1);
						edited = true;
					} //delete operations calls for splicing the array to the requested field
				}

				if(edited) {
					if (miscField.altLinks?.length === 0) {
						delete miscField.altLinks; //get rid of the object structure if theres nothing left after delete
					}

					if(Object.keys(miscField).length === 0) {
						row.misc = null;
					} else {
						row.misc = JSON.stringify(miscField);
					}

					await sheets.overwrite(info.sheetNames[4], i + 2, row.toArray());
					await new Promise(resolve => setTimeout(resolve, 1000));

					console.log('Sheet updated!');
				}
			}
		}
		*/

		/*
		let imageLocation = null;

		console.log('Detecting location of cover image...');

		if (typeof row.img !== 'undefined'){
			imageLocation = row.img
		} else if (row.link.match(/nhentai\.net\/g\/\d{1,6}\/\d+/)) {
			let resp = (await axios.get(row.link)).data.match(/(?<link>https:\/\/i\.nhentai\.net\/galleries\/\d+\/\d+\..{3})/);
			if (typeof resp?.groups?.link === 'undefined') {
				console.log('Unable to fetch cover image. Try linking the cover image with the -img tag.');
				continue;
			}
			imageLocation = resp.groups.link;
		} else if (row.link.match(/nhentai/) !== null) {
			//let numbers = +(row.link.match(/nhentai\.net\/g\/(\d{1,6})/)[1]);
			let resp = (await axios.get(row.link)).data.match(/(?<link>https:\/\/t\.nhentai\.net\/galleries\/\d+\/cover\..{3})/);
			if(typeof resp?.groups?.link === 'undefined'){
				console.log('Unable to fetch cover image. Try linking the cover image with the -img tag.')
				continue;
			}
			imageLocation = resp.groups.link;

		}  else if (row.link.match(/imgur/) !== null) {
			let hashCode = /https:\/\/imgur.com\/a\/([A-z0-9]*)/.exec(row.link)[1];
			//extract identification part from the link
			let resp = await axios.get(`https://api.imgur.com/3/album/${hashCode}/images`, {
					headers: { Authorization: info.imgurClient },
				})
			imageLocation = resp.data.data[0].link
		} else {
			console.log('dont use alternative sources idot');
			continue;
		}

		if(imageLocation === null) {
			continue;
		}

		console.log(imageLocation)
		console.log('Downloading ' + imageLocation + ' and converting to JPG...');
		let image = await Jimp.read(imageLocation);
		if(image.bitmap.width > 350) {
			await image.resize(350, Jimp.AUTO);
		}
		image.quality(70);
		let data = await image.getBufferAsync(Jimp.MIME_JPEG);

		const params = {
			Bucket: info.awsBucket,
			Key: row.uid + '.jpg',
			Body: data,
			ContentType: 'image/jpeg',
			ACL: 'public-read-write',
		};
		await new Promise((resolve, reject) => {
			s3.upload(params, (err, data) => {
				if (err) {
					reject(err);
				}

				row.img = data.Location;
				console.log(`Uploaded! The thumbnail can now be found at \`${data.Location}\``);

				resolve();
			})
		});
		*/

		// await sheets.overwrite(info.sheetNames[4], i + 2, row.toArray());
		// await new Promise(resolve => setTimeout(resolve, 1000));

		// console.log('Sheet updated!');
	}

	//fs.writeFileSync('table_eh_nh.json', JSON.stringify(obj, null, 2));
}

runScript();
