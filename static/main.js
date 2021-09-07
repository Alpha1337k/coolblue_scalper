var LoadMainContent = function (page, dom, pagename, pushUrl) {	
	return new Promise(function(resolved, myReject) {
		console.log("loading data into", dom);
		if(typeof dom === '')
			dom = "#main-box";
		if (pagename != undefined && pushUrl != false)
			ChangeURL(pagename, pushUrl, dom);
		$(dom).val('');
		$(dom).load(page, function() {resolved()});
		});
}

function ChangeURL(title, urlPath, id){
	urlPath = "#" + urlPath;
	console.log("push page", title, urlPath);
	window.history.pushState({ob : urlPath, id : id, title: title}, title, urlPath);
}

window.onpopstate = function(e){
	console.log("pop page", e);
    if(e.state){
		document.title = e.state.title;
		LoadMainContent(e.state.ob.substring(1), e.state.id, e.state.title, false);
    }
	else
	{
	}
};

function ChangeCatagory() {
	const val = document.getElementById("CatagorieSelect").value;

	LoadMainContent('items/' + val, "#maintable", val , 'items/' + val).then(()=> {
		sorttable.makeSortable(document.getElementById("maintable").children[0]);
	});;
}

function OpenInNewTab(url) {
	window.open(url, '_blank').focus();
}

LoadMainContent('items/laptops', '#maintable', "laptops", "items/laptops").then(()=> {

	sorttable.makeSortable(document.getElementById("maintable").children[0]);
});

LoadMainContent('catagories', "#CatagorieSelect", undefined, undefined);