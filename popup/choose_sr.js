function saveTabs(tabs){
	var toSave = [];
	for (let t of tabs){
		toSave.push(t.url);
	};
	browser.storage.local.set({'urls': toSave});
}

function restoreTabs(){
	var toRestore = browser.storage.local.get('urls');
	toRestore.then(function(urls){
		urls.urls.forEach(function(url) {
			browser.tabs.create({'url': url});
		});
	});
}

document.addEventListener("click", (e) => {
	if (e.target.classList.contains("save")) {
		var openTabs = browser.tabs.query({currentWindow: true});
		openTabs.then(saveTabs);
	}
	else if (e.target.classList.contains("restore")) {
		restoreTabs();
	}
});