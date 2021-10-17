var LoadMainContent = function (page, dom, pagename, pushUrl) {	
	return new Promise(function(resolved, myReject) {
		console.log("loading data into", dom);
		if(typeof dom === '')
			dom = "#main-box";
		if (pagename != undefined && pushUrl != false)
			ChangeURL(pagename, page, dom);
		$(dom).val('');
		$(dom).load(page, function() {resolved()});
		});
}

function ChangeURL(title, urlPath, id){
	console.log("push page", title, urlPath);
	window.history.pushState({ob : urlPath, id : id, title: "Scalper " + title.substring(1)}
							, undefined, title);
}

window.onpopstate = function(e){
	console.log("pop page", e);
    if(e.state){
		document.title = e.state.title;
		LoadMainContent(e.state.ob, e.state.id, e.state.title, false);
    }
	else
	{
	}
};

function Changecategory() {
	const val = document.getElementById("categorieSelect").value;

	document.title = "Scalper " + val;
	LoadMainContent('/items/' + val, "#maintable", '?' + val).then(()=> {
		sorttable.makeSortable(document.getElementById("maintable").children[0]);
	});;
}

function OpenInNewTab(url) {
	window.open(url, '_blank').focus();
}

LoadMainContent('categories', "#categorieSelect", undefined, undefined);


console.log(window.location.search);
if (window.location.pathname.length == 1)
{
	LoadMainContent('/items/laptops', '#maintable', "?laptops").then(()=> {

		sorttable.makeSortable(document.getElementById("maintable").children[0]);
	});
}
else
{
	LoadMainContent(window.location.search, '#maintable', "Scalper").then(()=> {
		sorttable.makeSortable(document.getElementById("maintable").children[0]);
	});	
}

