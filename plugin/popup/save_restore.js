function Button(props) {
  return React.createElement("button", {
    className: props.className,
    onClick: props.onClick
  }, props.name);
}

class Restore extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      restore: false
    };
    this.handleWindowClick = this.handleWindowClick.bind(this);
    this.handleCurrentClick = this.handleCurrentClick.bind(this);
    this.handleNewClick = this.handleNewClick.bind(this);
  }

  handleWindowClick(event) {
    event.preventDefault();
    this.setState({
      restore: true
    });
  }

  handleNewClick(event) {
    event.preventDefault();
    this.props.handleNewWindowClick(event);
    this.setState({
      restore: false
    });
  }

  handleCurrentClick(event) {
    event.preventDefault();
    this.props.handleCurrentWindowClick(event);
    this.setState({
      restore: false
    });
  }

  render() {
    console.log("Restore Render");

    if (this.state.restore) {
      return React.createElement("div", {
        className: "restore-window-dropdown"
      }, React.createElement(Button, {
        className: "restore-window-btn",
        onClick: this.handleWindowClick,
        name: "Restore"
      }), React.createElement("a", {
        className: "restore-window-here",
        onClick: this.handleCurrentClick
      }, "Current Window"), React.createElement("a", {
        className: "restore-window-new",
        onClick: this.handleNewClick
      }, "New Window"));
    } else {
      return React.createElement("div", {
        className: "restore-window-dropdown"
      }, React.createElement(Button, {
        className: "restore-window-btn",
        onClick: this.handleWindowClick,
        name: "Restore Window"
      }));
    }
  }

}

class Window extends React.Component {
  constructor(props) {
    super(props);
    this.handleLinkClick = this.handleLinkClick.bind(this);
    this.handleCurrentWindowClick = this.handleCurrentWindowClick.bind(this);
    this.handleNewWindowClick = this.handleNewWindowClick.bind(this);
  } // Display shortened forms of url


  urlShorten(url) {
    let name = url;

    if (url.length > 50) {
      name = url.substr(0, 33);
      name += "...";
      name += url.substr(-14);
    }

    return name;
  }

  handleLinkClick(event) {
    event.preventDefault();
    const target = event.target;
    browser.tabs.create({
      'url': target.name
    });
  }

  handleCurrentWindowClick(event) {
    event.preventDefault();
    this.props.window.forEach(url => browser.tabs.create({
      'url': url
    }));
  }

  handleNewWindowClick(event) {
    event.preventDefault();
    browser.windows.create({
      'url': this.props.window
    });
  }

  render() {
    console.log("List Render");
    let list = this.props.window.map(url => React.createElement("a", {
      className: "restore-menu-link",
      href: "",
      title: url,
      name: url,
      onClick: this.handleLinkClick
    }, this.urlShorten(url)));
    return React.createElement("div", {
      className: "restore-menu-window-container"
    }, React.createElement(Restore, {
      handleCurrentWindowClick: this.handleCurrentWindowClick,
      handleNewWindowClick: this.handleNewWindowClick
    }), React.createElement("div", {
      className: "restore-menu-link-list"
    }, list));
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
      saveBtnText: "Save Tabs",
      windowState: new Array()
    };
  }

  handleSaveClick() {
    var self = this;
    var openWindows = browser.windows.getAll({
      populate: true,
      windowTypes: ["normal"]
    }); // clear existing first

    browser.storage.local.remove('windows');
    let windows = [];
    openWindows.then(result => {
      for (let window of result) {
        // ignore private windows
        if (window.incognito) {
          continue;
        }

        let tabs = [];

        for (let tab of window.tabs) {
          let url = tab.url; // ignore 'about' pages

          if (url.substr(0, 5) === "about") {
            continue;
          }

          tabs.push(url);
        }

        ;
        windows.push(tabs);
      }

      console.log("Windows Saved");
      console.log(windows);

      if (windows.length > 0 && windows[0].length > 0) {
        browser.storage.local.set({
          'windows': windows
        });
        self.setState({
          saves: true,
          saveBtnText: "Saved!",
          windowState: windows
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
      if (Object.keys(result).length === 0) {// console.log("No URLS saved");
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
    this.setState({
      saves: true
    });
    let windows = this.state.windowState;

    if (windows.length === 0 || windows.length > 1 && windows.length[0] === 0) {// console.log("No URLS saved");
    } else {
      // Restore to existing window
      windows[0].map(url => browser.tabs.create({
        'url': url
      })); // Create in new windows

      for (let i = 1; i < windows.length; i++) {
        browser.windows.create({
          'url': windows[i]
        });
      }
    }
  }

  componentDidMount() {
    var self = this;
    let windowsPromise = browser.storage.local.get('windows');
    windowsPromise.then(result => {
      console.log(result);

      if (Object.keys(result).length === 0) {// console.log("No URLS saved");
      } else {
        let windows = result.windows;
        self.setState({
          windowState: windows
        });
      }
    });
  }

  render() {
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
      let windowList = this.state.windowState.map(window => React.createElement(Window, {
        window: window
      }));
      return React.createElement("div", {
        className: "restore-menu-container"
      }, React.createElement("div", {
        className: "restore-menu-action-bar"
      }, back, all), React.createElement("div", {
        className: "restore-menu-header"
      }), React.createElement("div", {
        className: "restore-menu-divider"
      }), windowList);
    }
  }

}

function App() {
  return React.createElement("div", null, React.createElement(Space, null));
}

ReactDOM.render(React.createElement(App, null), document.getElementById('root'));
