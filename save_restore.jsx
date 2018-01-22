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

	urlShorten(url) {
		let name = url;
		if (url.length > 50){
			name = url.substr(0,33);
			name += "...";
			name +=  url.substr(-14);
		}
		return name;
	}
	componentDidMount() {
		var self = this;
		let url_list = new Set();
		var show = browser.storage.local.get('urls');
		var next = show.then(function(urls){
			if (Object.keys(urls).length === 0){
				console.log("No URLS saved");
			}
			else {
				urls.urls.forEach(function(url) {
					url_list.add(url);
				});
			}
			self.setState({links: url_list});
			//console.log(self.state.links);
		});
	}

	handleLinkClick(event){
		const target = event.target;
		browser.tabs.create({ 'url': target.name });
		var url_list = this.state.links;
		url_list.delete(target.name);
		browser.storage.local.set({'urls': Array.from(url_list)});
		this.setState({ links: url_list});
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
		var openTabs = browser.tabs.query({currentWindow: true});
		openTabs.then((tabs) => {
			var toSave = [];
			for (let t of tabs){
				toSave.push(t.url);
			};
			browser.storage.local.set({'urls': toSave});
		});
		this.setState({saves: true});
	}

	handleRestoreClick() {
		var toRestore = browser.storage.local.get('urls');
		var self = this;
		toRestore.then((urls) => {
			if (Object.keys(urls).length === 0){
				console.log("No URLS saved");
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
		var toRestore = browser.storage.local.get('urls');
		browser.storage.local.remove('urls');
		this.setState({saves: true});
		toRestore.then((urls) => {
			if (Object.keys(urls).length === 0) {
				console.log("No URLS saved");
			} else {
				urls.urls.forEach(function (url) {
					browser.tabs.create({ 'url': url });
				});
			}
		});
	}

	render() {
		const saves = this.state.saves;
		let s_but = null;
		let r_but = null;
		let content = null;
		if (saves) {
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