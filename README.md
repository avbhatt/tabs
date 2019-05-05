# Tab Save & Restore

[Firefox extension](https://addons.mozilla.org/en-US/firefox/addon/tab-save-restore/) that allows you to save the open tabs from your window and then restore them at a later time. You can restore them individually or all at once.

The motivation behind this extension is to allow for easy tab management without the hassle of being signed in to your browser. Oftentimes, I've wanted to save my open tabs before shutting down my computer, but I prefer not to attach an account to my browser. Before, I would waste time copying and pasting each tab's url to a text file so I could remember what I was doing. Now, by using this extension, it is simply a matter of clicking a few buttons to re-open all of your tabs.

## Usage

Clicking the extension results in two options `Save` and `Restore`.

![Location of Extension](docs/location.png)

![Options within Extension](docs/click.png)

- `Save` will save the urls of open tabs from every window (replacing any previously saved tabs)

![Save Tabs](docs/save.png)

- `Restore` will show a list of the saved urls, organized by window

![List of Saved Links](docs/restore.png)

- Clicking an individual link will open that link in a new tab of the active window

![Clicking individual link](docs/wikipedia.png)

- Clicking `Restore To` provides two options to restore the entire window

![Clicking Restore To](docs/window.png)

- `Current Window` will restore the tabs to the active window

![Current Window](docs/current.png)

- `New Window` will restore the tabs to a new window

![New Window](docs/new.png)

- Clicking `Restore All` will restore every group of tabs into a new window

![Restoring all links](docs/all.png)

- Note that clicking `Save` will **overwrite** the currently saved tabs

![Save Overwrite](docs/overwrite.gif)

## Changelog

Window management

- Allow window-by-window restoration

CSS Enhancements from [shikev](https://github.com/avbhatt/tabs/pull/5)

- Improve look and feel of extension

Changes from [sealj553](https://github.com/avbhatt/tabs/pull/1)

- Allows for multi-window saving and restoration
