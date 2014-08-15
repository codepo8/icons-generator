/*! icons-generator.js
 *  A saveAs() FileSaver implementation.
 *  2014-08-15
 *
 *  By Chris Heilmann, http://christianheilmann.com
 *  License: BSD
 *    See http://christianheilmann.com/license.txt
 */

/* Requirements: FileSaver.js and jszip */

(function(){

  var c = document.querySelector('canvas');
  var cx = c.getContext('2d');
  var thumbs = document.querySelector('.thumbs');
  var createbutton = document.querySelector('.create');
  var downloadbutton = document.querySelector('.download');
  var resizecanvas = document.createElement('canvas');
  var resizecontext = resizecanvas.getContext('2d');
  var sizes = [
    [16,16], [32,32], [48,48], [60,60], [64,64], [90,90],
    [128,128], [256,256], [512,512]
  ];
  /* see: https://developer.mozilla.org/en-US/Apps/Build/Manifest */
  var canvasrolloverclass = 'over';
  var canvassize = [256, 256];
  var zip;
  var mousedown = false;

  function getdroppedimage(ev) {
    c.classList.remove(canvasrolloverclass);
    var files = ev.dataTransfer.files;
    if (files.length > 0) {
      if (files[0].type.indexOf('image') !== -1) {
        var reader = new FileReader();
        reader.readAsDataURL(files[0]);
        reader.onload = function(ev) {
          addtocanvas(ev.target.result);
          };
        }
     }
  }

  function addtocanvas(src) {
    var img = new Image();
    img.src = src;
    img.onload = function() {
      var w = img.naturalWidth;
      var h = img.naturalHeight;
      c.width = canvassize[0];
      c.height = canvassize[1];
      var co = resize(w, h, canvassize[0], canvassize[1]);
      cx.drawImage(img, co.x, co.y, co.w, co.h);
      /* meh be... TODO
      c.addEventListener('mousedown', function(ev) {
        mousedown = true;
      }, false);
      c.addEventListener('mouseup', function(ev) {
        mousedown = false;
      }, false);
      c.addEventListener('mousemove', function(ev) {
        if (!mousedown) {return;}
          cx.clearRect(0,0,256,256);
          var x = ev.pageX - c.offsetLeft - 50;
          var y = ev.pageY - c.offsetTop - 50;
          cx.drawImage(img, x, y);
      }, false);
      */
    createbutton.disabled = false;
    };
  }

  function createimages() {
    zip = new JSZip();
    var icons = zip.folder("icons");
    thumbs.innerHTML += '<li>Hover over the size to see a preview</li>';
    sizes.forEach(function(now) {
      resizecanvas.width = now[0];
      resizecanvas.height = now[1];
      resizecontext.drawImage(c,0,0,now[0],now[1]);
      var img = new Image();
      img.src = resizecanvas.toDataURL("image/png");
      icons.file(
        now[0] + 'x' + now[1]+'.png',
        img.src.substr(img.src.indexOf(',') + 1),
        { base64: true }
      );
      var item = document.createElement('li');
      var span = document.createElement('span');
      span.innerHTML = now[0] + 'x' + now[1];
      item.appendChild(span);
      span.appendChild(img);
      thumbs.appendChild(item);
    });
    downloadbutton.disabled = false;
  }

  function download() {
    saveAs(
      zip.generate({type: 'blob'}),
      'icons.zip'
    );
  }

  function resize( imagewidth, imageheight, thumbwidth, thumbheight ) {
    var w = 0, h = 0, x = 0, y = 0,
    widthratio = imagewidth / thumbwidth,
    heightratio = imageheight / thumbheight,
    maxratio = Math.max( widthratio, heightratio );
    if ( maxratio > 1 ) {
      w = imagewidth / maxratio;
      h = imageheight / maxratio;
    } else {
      w = imagewidth;
      h = imageheight;
    }
    x = ( thumbwidth - w ) / 2;
    y = ( thumbheight - h ) / 2;
    return { w:w, h:h, x:x, y:y };
  }

  /* Event handlers */

  createbutton.addEventListener('click', function(ev) {
    createimages();
  }, false);
  downloadbutton.addEventListener('click', function(ev) {
    download();
  }, false);
  c.addEventListener('dragover', function(ev) {
    this.classList.add(canvasrolloverclass);
    ev.preventDefault();
  }, false);
  c.addEventListener('drop', function(ev) {
    getdroppedimage(ev);
    ev.preventDefault();
  }, false);

})();