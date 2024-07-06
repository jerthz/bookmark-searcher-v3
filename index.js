var version = "A1.4";
var loadedBookmarks = [];
var filters = [];


document.addEventListener('DOMContentLoaded', function(){
    document.getElementById("filter").focus();
    document.getElementById("filter").addEventListener("keyup", handlekeyup);
});

function handlekeyup(e){
    if (e.key == 'Enter') {
        if(loadedBookmarks.length == 1){
			chrome.tabs.create({ url: loadedBookmarks[0].url });
		}
    }else if(e.keyCode >= 46 || e.keyCode == 8){
        loadedBookmarks = [];
		document.getElementById("result").innerHTML = "";
        chrome.bookmarks.getTree((bookmarkTreeNodes) => {
			processBookmarkTree(bookmarkTreeNodes).then(() => {
				console.log("hello " + loadedBookmarks.length);
					loadedBookmarks.forEach((el)=> {
						document.getElementById(el.id).addEventListener("click", function (e) {
							chrome.tabs.create({ url: getUrlFromId(el.id) });
						});
						document.getElementById(el.id).addEventListener("keyup", function (e) {
							if (e.key == 'Enter') {
								chrome.tabs.create({ url: getUrlFromId(el.id) });
							}
						});
					});
			});
		});
    }
}

function processBookmarkTree(nodes) {
	return new Promise((resolve) => {
	  repaintBookmarks(nodes);
	  resolve();  
	});
  }

function repaintBookmarks(tree, rank) {
	var htmlResult = "";
	var rnk = 0;
	var filter = document.getElementById("filter").value;
	if (rank != null && typeof (rank) != "undefined") {
		rnk = rank;
	}
	for (var i = 0; i < tree.length; i++) {
		if (tree[i].url != null && typeof (tree[i].url) != 'undefined') {
			 var match = false;
			if(filter != "") {
				match = tree[i].title.toUpperCase().includes(filter.toUpperCase()) || tree[i].url.toUpperCase().includes(filter.toUpperCase());
			}
			if (match) {
				var imgUrl = 'https://www.google.com/s2/favicons?domain='+ tree[i].url.match(/:\/\/(.[^/]+)/)[1];
				var id = tree[i].id;
				document.getElementById("result").innerHTML += "<div tabindex='0' id='"+ id + "' class='grid-item'> <div class='grid-item--img'><img src='"+imgUrl+"' alt='Image 1'></div><p>"+tree[i].title;+"</p></div>";
				loadedBookmarks.push(tree[i]);
			}
		} else {
			htmlResult += repaintBookmarks(tree[i].children, rnk + 1);
		}
	}

	return htmlResult;
}

function getUrlFromId(id){
	return loadedBookmarks.find((el)=> el.id == id).url;
}