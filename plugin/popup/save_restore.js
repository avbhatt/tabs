function Button(props) {
  var name = props.name;
  return React.createElement("button", {
    className: props.className,
    onClick: props.onClick
  }, name);
}

class List extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      windowState: new Array()
    };
    this.handleLinkClick = this.handleLinkClick.bind(this);
    this.handleWindowClick = this.handleWindowClick.bind(this);
  } // Display shortened forms of url


  urlShorten(url) {
    let name = url;

    if (url.length > 50) {
      name = url.substr(0, 33);
      name += "...";
      name += url.substr(-14);
    }

    return name;
  } // Acquire list of urls from open tabs/windows


  componentDidMount() {
    console.log("List Mount");
    var self = this;
    let windowList = new Array();
    let windowsPromise = browser.storage.local.get('windows');
    windowsPromise.then(result => {
      console.log(result);

      if (Object.keys(result).length === 0) {
        console.log("No URLS saved");
      } else {
        let windows = result.windows;
        console.log(windows);
        windows.forEach(window => windowList.push(window));
      }

      self.setState({
        windowState: windowList
      });
    });
  }

  handleLinkClick(event) {
    event.preventDefault();
    const target = event.target;
    browser.tabs.create({
      'url': target.name
    });
    this.setState({
      links: this.state.links
    });
  }

  handleWindowClick(event) {
    event.preventDefault();
  }

  render() {
    console.log("List Render");
    const windows = Array.from(this.state.windowState);
    console.log(windows);
    let list = [];

    if (windows.length == 1) {
      list = windows[0].map(url => React.createElement("a", {
        className: "restore-menu-link",
        href: "",
        title: url,
        name: url,
        onClick: this.handleLinkClick
      }, this.urlShorten(url)));
    } else {
      for (let i = 0; i < windows.length; i++) {
        list.push("Window " + i);

        for (let j = 0; j < windows[i].length; j++) {
          let url = windows[i][j];
          list.push(React.createElement("a", {
            className: "restore-menu-link",
            href: "",
            title: url,
            name: url,
            onClick: this.handleLinkClick
          }, this.urlShorten(url)));
        }
      }
    }

    return React.createElement("div", {
      className: "restore-menu-link-list"
    }, list);
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
    var self = this;
    var openWindows = browser.windows.getAll({
      populate: true,
      windowTypes: ["normal"]
    }); // clear existing first

    browser.storage.local.remove('windows'); // browser.storage.local.remove('numTabs');

    let windows = [];
    openWindows.then(result => {
      for (let window of result) {
        // ignore private windows
        if (window.incognito) {
          continue;
        } // numTabs.push(window.tabs.length);


        let tabs = [];

        for (let tab of window.tabs) {
          let url = tab.url; // ignore 'about' pages

          if (url.substr(0, 5) === "about") {
            // --numTabs[numTabs.size - 1];
            continue;
          }

          tabs.push(url);
          console.log(url);
        }

        ;
        windows.push(tabs);
        console.log(tabs);
      }

      console.log(windows);

      if (windows.length > 0 && windows[0].length > 0) {
        browser.storage.local.set({
          'windows': windows
        });
        self.setState({
          saves: true,
          saveBtnText: "Saved!"
        });
        clearTimeout(self.saveBtnMessageTimeout);
        self.saveBtnMessageTimeout = setTimeout(() => {
          self.setState({
            saveBtnText: "Save Tabs"
          });
        }, 1000);
      }
    });
  }

  handleRestoreClick() {
    let windowsPromise = browser.storage.local.get('windows');
    var self = this;
    windowsPromise.then(result => {
      console.log(result);

      if (Object.keys(result).length === 0) {
        console.log("No URLS saved");
      } else {
        self.setState({
          saves: false
        });
      }
    });
  }

  handleBackClick() {
    this.setState({
      saves: true
    });
  }

  handleAllClick() {
    let windowsPromise = browser.storage.local.get('windows'); // var tabNumObj = browser.storage.local.get('numTabs');

    this.setState({
      saves: true
    });
    windowsPromise.then(result => {
      let windows = result.windows;

      if (windows.length === 0) {// console.log("No URLS saved");
      } else {
        // Restore to existing window
        windows[0].map(url => browser.tabs.create({
          'url': url
        })); // Create in new windows

        for (let i = 1; i < windows.length; i++) {
          browser.windows.create({
            'url': windows[i]
          });
        } // windows.map(window => browser.windows.create({'url': window}));
        // tabNumObj.then(tabNumObj => {
        // 	var tabNum = tabNumObj.numTabs;
        // 	var tabIndex = 0;
        // 	for (var i = 0; i < tabNum.length; i++) {
        // 		var jump = tabNum[i];
        // 		var tabs = windows.slice(tabIndex, tabIndex + jump);
        // 		if (tabs.length == 0) {
        // 			continue;
        // 		}
        // 		browser.windows.create({ 'url': tabs });
        // 		tabIndex += jump;
        // 	}
        // });

      }
    });
  }

  render() {
    console.log("Space Render");
    let saveButton = null;
    let restoreButton = null;

    if (this.state.saves) {
      saveButton = React.createElement(Button, {
        className: "save-restore-btn",
        onClick: this.handleSaveClick,
        name: this.state.saveBtnText
      });
      restoreButton = React.createElement(Button, {
        className: "save-restore-btn",
        onClick: this.handleRestoreClick,
        name: "Restore"
      });
      return React.createElement("div", {
        className: "save-restore-container"
      }, saveButton, restoreButton);
    } else {
      let back = React.createElement(Button, {
        className: "back-btn",
        onClick: this.handleBackClick,
        name: "Back"
      });
      let all = React.createElement(Button, {
        className: "restore-all-btn",
        onClick: this.handleAllClick,
        name: "Restore All"
      });
      return React.createElement("div", {
        className: "restore-menu-container"
      }, React.createElement("div", {
        className: "restore-menu-action-bar"
      }, back, all), React.createElement("div", {
        className: "restore-menu-header"
      }, "Saved Tabs:"), React.createElement("div", {
        className: "restore-menu-divider"
      }), React.createElement(List, null));
    }
  }

}

function App() {
  return React.createElement("div", null, React.createElement(Space, null));
}

ReactDOM.render(React.createElement(App, null), document.getElementById('root'));
