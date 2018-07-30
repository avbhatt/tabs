function Button(props) {
	var name = props.name;
	return React.createElement(
		'button',
		{ onClick: props.onClick },
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
		chrome.storage.local.get('urls', 
			urls => {
				if (Object.keys(urls).length === 0) {
					// console.log("No URLS saved");
				} else {
					urls.urls.forEach(function (url) {
						url_list.add(url);
					});
				}
				self.setState({ links: url_list });
			}
		);
	}

	handleLinkClick(event) {
		const target = event.target;
		chrome.tabs.create({ 'url': target.name });
		this.setState({ links: this.state.links });
	}

	render() {
		const content = Array.from(this.state.links);
		const list = content.map(url => React.createElement(
			'div',
			null,
			React.createElement('input', { type: 'checkbox', name: url, onChange: this.handleLinkClick, checked: false }),
			this.urlShorten(url)
		));
		return React.createElement(
			'div',
			null,
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
		this.state = { saves: true };
	}

	handleSaveClick() {
		var toSave = [];
		var numTabs = [];
		// clear existing first
		chrome.storage.local.remove('urls');
		chrome.storage.local.remove('numTabs');

		chrome.windows.getAll(
			{
				populate: true,
				windowTypes: ["normal"]
			}, 
			windows => {
				for (let w of windows) {
					// ignore private windows
					if (w.incognito) {
						continue;
					}
					numTabs.push(w.tabs.length);
					for (let t of w.tabs) {
						var url = t.url;
						// ignore 'about' pages
						if (url.substr(0, 6) === "chrome") {
							--numTabs[numTabs.size - 1];
							continue;
						}

						toSave.push(url);
					};
				}

				chrome.storage.local.set({ 'urls': toSave });
				chrome.storage.local.set({ 'numTabs': numTabs });
			}
		);

		this.setState({ saves: true });
	}

	handleRestoreClick() {
		var self = this;
		chrome.storage.local.get('urls',
			urls => {
				if (Object.keys(urls).length === 0) {
					// console.log("No URLS saved");
				} else {
					self.setState({ saves: false });
				}
			}
		);
	}

	handleBackClick() {
		this.setState({ saves: true });
	}

	handleAllClick() {
		this.setState({ saves: true });
		var urlObj = chrome.storage.local.get('urls', 
			urlsObj => {
				var urls = urlsObj.urls;
				if (urls.length === 0) {
					// console.log("No URLS saved");
				} else {
					chrome.storage.local.get('numTabs',
						tabNumObj => {
							var tabNum = tabNumObj.numTabs;
							var tabIndex = 0;
							for (var i = 0; i < tabNum.length; i++) {
								var jump = tabNum[i];
								var tabs = urls.slice(tabIndex, tabIndex + jump);
								if (tabs.length == 0) {
									continue;
								}
								chrome.windows.create({ 'url': tabs });
								tabIndex += jump;
							}
						}
					);
				}
			}
		);
	}

	render() {
		let s_but = null;
		let r_but = null;
		let content = null;
		if (this.state.saves) {
			s_but = React.createElement(Button, { onClick: this.handleSaveClick, name: 'Save' });
			r_but = React.createElement(Button, { onClick: this.handleRestoreClick, name: 'Restore' });
			return React.createElement(
				'div',
				{ className: 'wrapper' },
				s_but,
				r_but
			);
		} else {
			let back = React.createElement(Button, { onClick: this.handleBackClick, name: 'Go Back' });
			let all = React.createElement(Button, { onClick: this.handleAllClick, name: 'Restore All' });
			return React.createElement(
				'div',
				{ className: 'wrapper' },
				back,
				all,
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
