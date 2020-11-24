module.exports = class Row {
	/**
	 * @param {*} values
	 * @param {Number} id
	 * @param {Number} sheet
	 */
	constructor(values, id = -1, sheet = -1) {
		if (typeof values === 'undefined') {
			values = ['', '', '', '', '', '', '',''];
		}
		if (values?.length) {
			
			values = values.map((v)=>{
				return (v === '' ? undefined : v)
			});
			this.uid = values[0];
			this.link = values[1];
			this.title = values[2];
			this.author = values[3];
			this.warning = values[4];
			this.parody = values[5];
			this.tier = values[6];
			this.page = (typeof values[7] === 'undefined') ? -1 : +values[7];
			this.id = id;
			this.img = values[9];
			this.misc = (typeof values[8] !== 'undefined')? JSON.parse(values[8]): '';
			this.sheet = sheet;
			this.tags = values.slice(10);


		//take command flags as constructor
		} else if(typeof values === 'object'){ 
			this.link = values.l;
			this.title = values.t;
			this.author = values.a;
			this.warning = values.w;
			this.parody = values.p;
			this.tier = values.tr;
			this.page = +values.pg ?? -1;
			
		}
	}

	/**
	 * @returns {Array}
	 */
	toArray() {
		return [this.uid, this.link, this.title, this.author, this.warning, this.parody, this.tier, this.page == 0 ? undefined : this.page, this.misc, this.img]
			.concat(this.tags)
			.map((v) => (v === undefined || v === null ? '' : v)); //replace all undefined values with empty string
	}
	/**
	 * Takes in any object to change it. A change-all setter method.
	 * Push "null" to a value to clear it.
	 * @param {Object} target
	 */
	update(target) {
		this.link = typeof target.link === 'undefined' || target.link == '' ? this.link : target.link;
		this.title = typeof target.title === 'undefined' || target.title == '' ? this.title : target.title;
		this.author = typeof target.author === 'undefined' || target.author == '' ? this.author : target.author;
		this.warning = typeof target.warning === 'undefined' || target.warning == '' ? this.warning : target.warning;
		this.parody = typeof target.parody === 'undefined' || target.parody == '' ? this.parody : target.parody;
		this.tier = typeof target.tier === 'undefined' || target.tier == '' ? this.tier : target.tier;
		this.page = target.page == 0 ? this.page : target.page;
		this.tags = typeof target.tags === 'undefined' || target.tags == '' ? this.tags : target.tags;
		this.img = typeof target.img === 'undefined' || target.img == '' ? this.img : target.img;
		this.misc = typeof target.misc === 'undefined' || target.misc == '' ? this.misc : target.misc;
	}
	/**
	 *
	 * @param {String} e
	 * @returns {Boolean} returns true if valid, false if not.
	 */
	atag(e) {
		if (!/^([A-Z][a-zA-Z]*\s*)+$/.test(e)) return false;
		this.tags.push(e);

		return true;
	}
	/**
	 *
	 * @param {String} e
	 * @returns {Boolean} returns true if valid, false if not.
	 */
	rtag(e) {
		if (this.tags.includes(e)) {
			let a = this.tags.indexOf(e);
			this.tags[a] = '';
			//now move a to the end of the
			this.tags.splice(a, 1);
			this.tags.push('');

			//leave empty space, so it gets pushed to the sheets
			return true;
		}
		return false;
	}
	/**
	 * @returns {Boolean}
	 */
	hasTag() {
		let a = false;
		this.tags.forEach((e) => {
			if (e != '') a = true;
		});
		return a;
	}
};
