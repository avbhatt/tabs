function Button(props) {
    var name = props.name;
    return React.createElement(
        "button",
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

    urlShorten(url) {
        let name = url;
        if (url.length > 50) {
            name = url.substr(0, 33);
            name += "...";
            name += url.substr(-14);
        }
        return name;
    }
    componentDidMount() {
        var self = this;
        let url_list = new Set();
        var show = browser.storage.local.get('urls');
        var next = show.then(function (urls) {
            if (Object.keys(urls).length === 0) {
                console.log("No URLS saved");
            } else {
                urls.urls.forEach(function (url) {
                    url_list.add(url);
                });
            }
            self.setState({ links: url_list });
            //console.log(self.state.links);
        });
    }

    handleLinkClick(event) {
        const target = event.target;
        browser.tabs.create({ 'url': target.name });
        this.setState({ links: this.state.links });
        //var url_list = this.state.links;
        //don't delete until save is pressed again
        //url_list.delete(target.name);
        //var array_url_list = Array.from(url_list);
        //browser.storage.local.set({ 'urls': array_url_list });
        //this.setState({ links: url_list });

        //if one window has been opened separately, turn the rest into one big window :lazy:
        //var tabNum = [array_url_list.length];
        //browser.storage.local.set({ 'numTabs': tabNum });

        //render();
    }

    render() {
        const content = Array.from(this.state.links);
        const list = content.map(url => React.createElement(
            "div",
            null,
            React.createElement("input", { type: "checkbox", name: url, onChange: this.handleLinkClick, checked: false }),
            this.urlShorten(url)
        ));
        return React.createElement(
            "div",
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
        var openWindows = browser.windows.getAll({
            populate: true,
            windowTypes: ["normal"]
        });

        //clear existing first
        browser.storage.local.remove('urls');
        browser.storage.local.remove('numTabs');

        openWindows.then(windows => {
            for (let w of windows) {
                if(w.incognito){
                    continue;
                }
                numTabs.push(w.tabs.length);
                //console.log(w.tabs.length);
                for (let t of w.tabs) {
                    var url = t.url;
                    //console.log(url.substr(0, 5));
                    if(url.substr(0, 5) === "about"){
                        --numTabs[numTabs.size - 1];
                        continue;
                    }

                    toSave.push(url);
                    //console.log(t.url);
                };
            }
            //then save
            browser.storage.local.set({ 'urls': toSave });
            browser.storage.local.set({ 'numTabs': numTabs });
        });

        this.setState({ saves: true });
    }

    handleRestoreClick() {
        var toRestore = browser.storage.local.get('urls');
        var self = this;
        toRestore.then(urls => {
            if (Object.keys(urls).length === 0) {
                console.log("No URLS saved");
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
        //browser.storage.local.remove('urls');
        var tabNumObj= browser.storage.local.get('numTabs');
        //browser.storage.local.remove('numTabs');

        this.setState({ saves: true });
        urlObj.then(urlsObj => {
            var urls = urlsObj.urls;
            if (urls.length === 0) {
                console.log("No URLS saved");
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
                        //console.log(tabs);
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
            s_but = React.createElement(Button, { onClick: this.handleSaveClick, name: "Save" });
            r_but = React.createElement(Button, { onClick: this.handleRestoreClick, name: "Restore" });
            return React.createElement(
                "div",
                { className: "wrapper" },
                s_but,
                r_but
            );
        } else {
            let back = React.createElement(Button, { onClick: this.handleBackClick, name: "Go Back" });
            let all = React.createElement(Button, { onClick: this.handleAllClick, name: "Restore All" });
            return React.createElement(
                "div",
                { className: "wrapper" },
                back,
                all,
                React.createElement(List, null)
            );
        }
    }
}

function App() {
    return React.createElement(
        "div",
        null,
        React.createElement(Space, null)
    );
}

ReactDOM.render(React.createElement(App, null), document.getElementById('root'));
