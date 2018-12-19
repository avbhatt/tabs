function Button(props) {
	var name = props.name;
	return React.createElement(
		'button',
		{ className: props.className, onClick: props.onClick },
		name
	);
}

class List extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			links: new Set()
		};
		this.handleLinkClick = this.handleLinkClick.bind(this);
	}

	// Display shortened forms of url
	urlShorten(url) {
		let name = url;
		if (url.length > 50) {
			name = url.substr(0, 33);
			name += "...";
			name += url.substr(-14);
		}
		return name;
	}

	// Acquire list of urls from open tabs/windows
	componentDidMount() {
		var self = this;
		let url_list = new Set();
		var show = browser.storage.local.get('urls');
		var next = show.then(function (urls) {
			if (Object.keys(urls).length === 0) {
				// console.log("No URLS saved");
			} else {
				urls.urls.forEach(function (url) {
					url_list.add(url);
				});
			}
			self.setState({ links: url_list });
		});
	}

	handleLinkClick(event) {
		event.preventDefault();
		const target = event.target;
		browser.tabs.create({ 'url': target.name });
		this.setState({ links: this.state.links });
	}

	render() {
		const content = Array.from(this.state.links);
		const list = content.map(url => React.createElement(
			'a',
			{ className: 'restore-menu-link', href: '', title: url, name: url, onClick: this.handleLinkClick },
			this.urlShorten(url)
		));
		return React.createElement(
			'div',
			{ className: 'restore-menu-link-list' },
			list
		);
	}
}

class Space extends React.Component {
	constructor(props) {
		super(props);
		this.handleSaveClick = this.handleSaveClick.bind(this);
		this.handleRestoreClick = this.handleRestoreClick.bind(this);
		this.handleBackClick = this.handleBackClick.bind(this);
		this.handleAllClick = this.handleAllClick.bind(this);
		this.state = {
			saves: true,
			saveBtnText: "Save Tabs"
		};
	}

	handleSaveClick() {
		var toSave = [];
		var numTabs = [];
		var openWindows = browser.windows.getAll({
			populate: true,
			windowTypes: ["normal"]
		});

		// clear existing first
		browser.storage.local.remove('urls');
		browser.storage.local.remove('numTabs');

		openWindows.then(windows => {
			for (let w of windows) {
				// ignore private windows
				if (w.incognito) {
					continue;
				}
				numTabs.push(w.tabs.length);
				for (let t of w.tabs) {
					var url = t.url;
					// ignore 'about' pages
					if (url.substr(0, 5) === "about") {
						--numTabs[numTabs.size - 1];
						continue;
					}

					toSave.push(url);
				};
			}

			browser.storage.local.set({ 'urls': toSave });
			browser.storage.local.set({ 'numTabs': numTabs });
		});

		this.setState({
			saves: true,
			saveBtnText: "Saved!"
		});

		clearTimeout(this.saveBtnMessageTimeout);

		this.saveBtnMessageTimeout = setTimeout(() => {
			this.setState({ saveBtnText: "Save Tabs" });
		}, 1000);
	}

	handleRestoreClick() {
		var toRestore = browser.storage.local.get('urls');
		var self = this;
		toRestore.then(urls => {
			if (Object.keys(urls).length === 0) {
				// console.log("No URLS saved");
			} else {
				self.setState({ saves: false });
			}
		});
	}

	handleBackClick() {
		this.setState({ saves: true });
	}

	handleAllClick() {
		var urlObj = browser.storage.local.get('urls');
		var tabNumObj = browser.storage.local.get('numTabs');

		this.setState({ saves: true });

		urlObj.then(urlsObj => {
			var urls = urlsObj.urls;
			if (urls.length === 0) {
				// console.log("No URLS saved");
			} else {
				tabNumObj.then(tabNumObj => {
					var tabNum = tabNumObj.numTabs;
					var tabIndex = 0;
					for (var i = 0; i < tabNum.length; i++) {
						var jump = tabNum[i];
						var tabs = urls.slice(tabIndex, tabIndex + jump);
						if (tabs.length == 0) {
							continue;
						}
						browser.windows.create({ 'url': tabs });
						tabIndex += jump;
					}
				});
			}
		});
	}

	render() {
		let s_but = null;
		let r_but = null;
		let content = null;
		if (this.state.saves) {
			s_but = React.createElement(Button, { className: 'save-restore-btn', onClick: this.handleSaveClick, name: this.state.saveBtnText });
			r_but = React.createElement(Button, { className: 'save-restore-btn', onClick: this.handleRestoreClick, name: 'Restore' });
			return React.createElement(
				'div',
				{ className: 'save-restore-container' },
				s_but,
				r_but
			);
		} else {
			let back = React.createElement(Button, { className: 'back-btn', onClick: this.handleBackClick, name: 'Back' });
			let all = React.createElement(Button, { className: 'restore-all-btn', onClick: this.handleAllClick, name: 'Restore All' });
			return React.createElement(
				'div',
				{ className: 'restore-menu-container' },
				React.createElement(
					'div',
					{ className: 'restore-menu-action-bar' },
					back,
					all
				),
				React.createElement(
					'div',
					{ className: 'restore-menu-header' },
					'Saved Tabs:'
				),
				React.createElement('div', { className: 'restore-menu-divider' }),
				React.createElement(List, null)
			);
		}
	}
}

function App() {
	return React.createElement(
		'div',
		null,
		React.createElement(Space, null)
	);
}

ReactDOM.render(React.createElement(App, null), document.getElementById('root'));
