function Button(props) {
	var name = props.name;
	return <button onClick={props.onClick}>{name}</button>
}

class List extends React.Component{
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
		if (url.length > 50){
			name = url.substr(0,33);
			name += "...";
			name +=  url.substr(-14);
		}
		return name;
	}

	// Acquire list of urls from open tabs/windows
	componentDidMount() {
		var self = this;
		let url_list = new Set();
		var show = browser.storage.local.get('urls');
		var next = show.then(function(urls){
			if (Object.keys(urls).length === 0){
				// console.log("No URLS saved");
			}
			else {
				urls.urls.forEach(function(url) {
					url_list.add(url);
				});
			}
			self.setState({links: url_list});
		});
	}

	handleLinkClick(event){
		const target = event.target;
		browser.tabs.create({ 'url': target.name });
		this.setState({ links: this.state.links });
	}

	render() {
		const content = Array.from(this.state.links);
		const list = content.map((url) => <div><input type="checkbox" name={url} onChange={this.handleLinkClick} checked={false}/>{this.urlShorten(url)}</div>);
		return (
			<div>
				{list}
			</div>
		);
	}
}

class Space extends React.Component{
	constructor(props) {
		super(props);
		this.handleSaveClick = this.handleSaveClick.bind(this);
		this.handleRestoreClick = this.handleRestoreClick.bind(this);
		this.handleBackClick = this.handleBackClick.bind(this);
		this.handleAllClick = this.handleAllClick.bind(this);
		this.state = {saves: true};
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
				if(w.incognito){
					continue;
				}
				numTabs.push(w.tabs.length);
				for (let t of w.tabs) {
					var url = t.url;
					// ignore 'about' pages
					if(url.substr(0, 5) === "about"){
						--numTabs[numTabs.size - 1];
						continue;
					}

					toSave.push(url);
				};
			}
			
			browser.storage.local.set({ 'urls': toSave });
			browser.storage.local.set({ 'numTabs': numTabs });
		});
		
		this.setState({saves: true});
	}

	handleRestoreClick() {
		var toRestore = browser.storage.local.get('urls');
		var self = this;
		toRestore.then((urls) => {
			if (Object.keys(urls).length === 0){
				// console.log("No URLS saved");
			}
			else {
				self.setState({saves: false});
			}
		});
	}

	handleBackClick() {
		this.setState({saves: true});
	}

	handleAllClick() {
		var urlObj = browser.storage.local.get('urls');
		var tabNumObj= browser.storage.local.get('numTabs');

		this.setState({ saves: true });

		urlObj.then(urlsObj => {
			var urls = urlsObj.urls;
			if (urls.length === 0) {
				// console.log("No URLS saved");
			} else {
				tabNumObj.then(tabNumObj => {
					var tabNum = tabNumObj.numTabs;
					var tabIndex = 0;
					for(var i = 0; i < tabNum.length; i++) {
						var jump = tabNum[i];
						var tabs = urls.slice(tabIndex, tabIndex + jump);
						if(tabs.length == 0){
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
			s_but = <Button onClick={this.handleSaveClick} name="Save"/>;
			r_but = <Button onClick={this.handleRestoreClick} name="Restore"/>;
			return (
				<div className="wrapper">
					{s_but}
					{r_but}
				</div>
			);
		} else {
			let back = <Button onClick={this.handleBackClick} name="Go Back"/>;
			let all = <Button onClick={this.handleAllClick} name="Restore All"/>;
			return (
				<div className="wrapper">
					{back}
					{all}
					<List />
				</div>
			);
		}
	}
}

function App() {
	return (
		<div>
			<Space />
		</div>
	);
}

ReactDOM.render(
	<App />,
	document.getElementById('root')
);