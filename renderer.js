let ById = id => {
  return document.getElementById(id)
}
let jsonfile = require('jsonfile')
let favicon = require('favicon-getter').default
let path = require('path')
let uuid = require('uuid')
let bookmarks = path.join(__dirname, 'bookmarks.json')

let back = ById('back'),
  forward = ById('forward'),
  refresh = ById('refresh'),
  omni = ById('url'),
  dev = ById('console'),
  fave = ById('fave'),
  list = ById('list'),
  popup = ById('fave-popup'),
  view = ById('view')

refresh.addEventListener('click', reloadView);
back.addEventListener('click', backView);
forward.addEventListener('click', forwardView);
omni.addEventListener('keydown', updateURL);
view.addEventListener('did-finish-load', updateNav);

console.log(window.navigator.plugins)

function reloadView () {
  view.reload();
}

function backView () {
  view.goBack();
}

function forwardView () {
  view.goForward();
}

function updateURL (event) {
  if (event.keyCode === 13) {
    omni.blur();
    let val = omni.value;
    let https = val.slice(0, 8).toLowerCase();
    let http = val.slice(0, 7).toLowerCase();
    if (https === 'https://') {
      view.loadURL(val);
    } else if (http === 'http://') {
      view.loadURL(val);
    } else {
      view.loadURL('http://'+ val);
    }
  }
}

function addBookmark () {
  let url = view.src;
  let title = view.getTitle();
  favicon(url).then(function(fav) {
    let book = new Bookmark(uuid.v1(), url, fav, title);
    jsonfile.readFile(bookmarks, function(err, curr) {
      curr.push(book);
      jsonfile.writeFile(bookmarks, curr, function (err) {
      })
    })
  })
}

function openPopUp (event) {
  let state = popup.getAttribute('data-state');
  if (state === 'closed') {
    popup.innerHTML = '';
    jsonfile.readFile(bookmarks, function(err, obj) {
      if(obj.length !== 0) {
        for (let i = 0; i < obj.length; i++) {
          let url = obj[i].url;
          let icon = obj[i].icon;
          let id = obj[i].id;
          let title = obj[i].title;
          let bookmark = new Bookmark(id, url, icon, title);
          let el = bookmark.ELEMENT();
          popup.appendChild(el);
        }
      }
      popup.style.display = 'block';
      popup.setAttribute('data-state', 'open');
    });
  } else {
    popup.style.display = 'none';
    popup.setAttribute('data-state', 'closed');
  }
}

function handleUrl (event) {
  if (event.target.className === 'link') {
    event.preventDefault();
    view.loadURL(event.target.href);
  } else if (event.target.className === 'favicon') {
    event.preventDefault();
    view.loadURL(event.target.parentElement.href);
  }
}

function handleDevtools () {
  if (view.isDevToolsOpened()) {
    view.closeDevTools();
  } else {
    view.openDevTools();
  }
}

function updateNav (event) {
  omni.value = view.src;
}

let Bookmark = function (id, url, faviconUrl, title) {
  this.id = id;
  this.url = url;
  this.icon = faviconUrl;
  this.title = title;
}

Bookmark.prototype.ELEMENT = function () {
  let a_tag = document.createElement('a');
  a_tag.href = this.url;
  a_tag.className = 'link';
  a_tag.textContent = this.title;
  let favimage = document.createElement('img');
  favimage.src = this.icon;
  favimage.className = 'favicon';
  a_tag.insertBefore(favimage, a_tag.childNodes[0]);
  return a_tag;
}