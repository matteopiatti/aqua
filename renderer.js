let ById = id => {
  return document.getElementById(id)
}
let jsonfile = require('jsonfile')
let favicon = require('favicon-getter').default
let path = require('path')
let uuid = require('uuid')
let bookmarks = path.join(__dirname, 'bookmarks.json')
const {ipcRenderer} = require('electron')

let back = ById('back'),
  forward = ById('forward'),
  refresh = ById('refresh'),
  omni = ById('url'),
  view = ById('view'),
  refreshIcon = ById('refresh-icon'),
  loadingIcon = ById('loading-icon'),
  videoWidth,
  videoHeight,
  proportions


refresh.addEventListener('click', reloadView);
back.addEventListener('click', backView);
forward.addEventListener('click', forwardView);
omni.addEventListener('keydown', omniSearch);
view.addEventListener('did-start-loading', updateNavStart);
view.addEventListener('did-finish-load', updateNavStop);
view.addEventListener('did-fail-load', updateNavStop);
view.addEventListener('did-stop-load', updateNavStop);
view.addEventListener('enter-html-full-screen', getVideoDimensions);
view.addEventListener('leave-html-full-screen', removeAspectRatio);

console.log(window.navigator.plugins)
console.log(process.versions)

function reloadView () {
  if(refreshIcon.className.indexOf('fa-times') > -1) {
    view.stop()
  } else {
    view.reload()
  }
}

function backView () {
  view.goBack()
}

function forwardView () {
  view.goForward()
}

function removeAspectRatio() {
  sendMessage('remove-aspect-ratio')
}

function sendMessage (messageName, messageContent) {
  console.log(ipcRenderer.send(messageName, messageContent))
}

function getVideoDimensions() {
  view
    .getWebContents()
    .executeJavaScript('document.webkitFullscreenElement.offsetHeight', (result) => {return result})
    .then(result => {
      videoHeight = result;
      view
        .getWebContents()
        .executeJavaScript('document.webkitFullscreenElement.offsetWidth', (result) => {return result})
        .then(result => {
          videoWidth = result;
          proportionFactory(videoWidth, videoHeight)
        })
    })

}

// const menu = new Menu()
// const menuItem = new MenuItem({
//   label: 'Inspect Element',
//   click: () => {
//     remote.getCurrentWindow().inspectElement(rightClickPosition.x, rightClickPosition.y)
//   }
// })
// menu.append(menuItem)
// window.addEventListener('contextmenu', (e) => {
//   e.preventDefault()
//   rightClickPosition = {x: e.x, y: e.y}
//   menu.popup(remote.getCurrentWindow())
// }, false)

function proportionFactory(width, height) {
  proportions = {"width":width, "height":height}
  setWindowProportions(proportions)
}

function setWindowProportions(proportions) {
  console.log(ipcRenderer.send('fullscreen-dimensions', proportions))
}

function omniSearch (event) {
  if (event.keyCode === 13) {
    console.log("lol")
    omni.blur()
    if (ValidURL(omni.value)) {
      updateURL()
    } else {
      view.loadURL('https://duckduckgo.com/?q=' + omni.value + '&t=h_&ia=web')
    }
  }
}

function updateURL () {
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

/**
 * @return {boolean}
 */
function ValidURL(str) {
  let pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name and extension
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?'+ // port
    '(\\/[-a-z\\d%@_.~+&:]*)*'+ // path
    '(\\?[;&a-z\\d%@_.,~+&:=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return pattern.test(str);
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

function updateNavStop (event) {
  refreshIcon.classList.add('fa-repeat');
  refreshIcon.classList.remove('fa-times');
  loadingIcon.classList.remove('is-loading');
  omni.value = view.src;
}

function updateNavStart (event) {
  refreshIcon.classList.remove('fa-repeat');
  refreshIcon.classList.add('fa-times');
  loadingIcon.classList.add('is-loading');
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


ipcRenderer.on('remove-aspect-ratio-reply', (event, arg) => {
  console.log(arg)
})

ipcRenderer.on('fullscreen-dimensions-reply', (event, arg) => {
  console.log(arg)
})
