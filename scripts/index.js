$(document).ready(function() {

  const remote = require('electron').remote;
  let titlebarRemoved = false
  let transparentTitlebar = false
  const eye = $('#eye-icon')
  const exit = $('#exit')

  function hideNavigation() {
    if (!titlebarRemoved) {
      $('#exit, #back, #forward, #refresh, .field').css('opacity', '0')
      $('#navigation').css({
        'background': 'none',
        'border': 'none',
        'pointer-events': 'none',
        '-webkit-app-region': 'no-drag'
      })
      $('#eye').css('pointer-events', 'all')
      transparentTitlebar = true
    }
  }

  function showNavigation() {
    if (!titlebarRemoved) {
      $('#exit, #back, #forward, #refresh, .field').css('opacity', '1')
      $('#navigation').css({
        'pointer-events': 'all',
        'border-bottom': '1px solid #a3a1a3',
        '-webkit-app-region': 'drag',
        'background': 'rgb(245,244,245)',
        'background': '-moz-linear-gradient(top, rgba(245,244,245,1) 0%, rgba(236,234,236,1) 10%, rgba(234,232,234,1) 20%, rgba(232,230,232,1) 30%, rgba(230,228,230,1) 40%, rgba(226,224,226,1) 50%, rgba(224,222,224,1) 60%, rgba(221,219,221,1) 70%, rgba(218,217,218,1) 80%, rgba(217,215,217,1) 90%, rgba(219,217,219,1) 100%)',
        'background': '-webkit-linear-gradient(top, rgba(245,244,245,1) 0%,rgba(236,234,236,1) 10%,rgba(234,232,234,1) 20%,rgba(232,230,232,1) 30%,rgba(230,228,230,1) 40%,rgba(226,224,226,1) 50%,rgba(224,222,224,1) 60%,rgba(221,219,221,1) 70%,rgba(218,217,218,1) 80%,rgba(217,215,217,1) 90%,rgba(219,217,219,1) 100%)',
        'background': 'linear-gradient(to bottom, rgba(245,244,245,1) 0%,rgba(236,234,236,1) 10%,rgba(234,232,234,1) 20%,rgba(232,230,232,1) 30%,rgba(230,228,230,1) 40%,rgba(226,224,226,1) 50%,rgba(224,222,224,1) 60%,rgba(221,219,221,1) 70%,rgba(218,217,218,1) 80%,rgba(217,215,217,1) 90%,rgba(219,217,219,1) 100%)',
        'filter': "progid:DXImageTransform.Microsoft.gradient( startColorstr='#f5f4f5', endColorstr='#dbd9db',GradientType=0 )",
      })
      transparentTitlebar = false
    }
  }

  function removeNavigation () {
    hideNavigation()
    titlebarRemoved = true
  }

  function addNavigation () {
    titlebarRemoved = false
    showNavigation()
  }

  eye.on('click', function () {
    if (!titlebarRemoved) {
      console.log('removed True')
      eye.removeClass("fa-eye")
      eye.toggleClass("fa-eye-slash")
    } else if (titlebarRemoved) {
      console.log('removed False')
      eye.removeClass("fa-eye-slash")
      eye.toggleClass("fa-eye")
    }

    if (titlebarRemoved === true) {
      addNavigation()
    } else {
      removeNavigation()
    }
    eye.blur()
  })

  $(function () {
    $('html').hover(function () {
      showNavigation()
      $('#eye').css('opacity', '1')
    }, function () {
      hideNavigation()
      $('#eye').css('opacity', '0')
    })
  })

  window.onresize = function(event) {
   hideNavigation()
  };

  exit.on('click', function () {
    remote.getCurrentWindow().close();
  })
})